import { Agent } from 'https'
import fetch from 'isomorphic-fetch'
import { Base64 } from 'js-base64'
import { uuid } from 'uuidv4'
import { z } from 'zod'

import {
  BadGatewayException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common'

import type { Logger } from '@island.is/logging'
import { LOGGER_PROVIDER } from '@island.is/logging'
import type { ConfigType } from '@island.is/nest/config'
import {
  createXRoadAPIPath,
  XRoadMemberClass,
} from '@island.is/shared/utils/server'

import type { User } from '@island.is/judicial-system/types'
import { CaseState, CaseType } from '@island.is/judicial-system/types'

import { nowFactory } from '../../factories'
import { AwsS3Service } from '../aws-s3'
import { EventService } from '../event'
import { UploadPoliceCaseFileDto } from './dto/uploadPoliceCaseFile.dto'
import { PoliceCaseFile } from './models/policeCaseFile.model'
import { PoliceCaseInfo } from './models/policeCaseInfo.model'
import { UploadPoliceCaseFileResponse } from './models/uploadPoliceCaseFile.response'
import { policeModuleConfig } from './police.config'

export enum PoliceDocumentType {
  RVKR = 'RVKR', // Krafa
  RVTB = 'RVTB', // Þingbók
  RVUR = 'RVUR', // Úrskurður
  RVVI = 'RVVI', // Vistunarseðill
  RVUL = 'RVUL', // Úrskurður Landsréttar
  RVDO = 'RVDO', // Dómur
  RVAS = 'RVAS', // Ákæra
  RVMG = 'RVMG', // Málsgögn
}

export interface PoliceDocument {
  type: PoliceDocumentType
  courtDocument: string
}

const getChapter = (category?: string): number | undefined => {
  if (!category) {
    return undefined
  }

  const chapter = /^([0-9]+)\..*$/.exec(category) // Matches the first number in a string

  if (!chapter || +chapter[1] < 1) {
    return undefined
  }

  return +chapter[1] - 1
}

const formatCrimeScenePlace = (
  street?: string | null,
  streetNumber?: string | null,
  municipality?: string | null,
) => {
  if (!street && !municipality) {
    return ''
  }

  // Format the street and street number
  const formattedStreet =
    street && streetNumber ? `${street} ${streetNumber}` : street

  // Format the municipality
  const formattedMunicipality =
    municipality && street ? `, ${municipality}` : municipality

  const address = `${formattedStreet ?? ''}${formattedMunicipality ?? ''}`

  return address.trim()
}

@Injectable()
export class PoliceService {
  private xRoadPath: string
  private agent: Agent
  private throttle = Promise.resolve({} as UploadPoliceCaseFileResponse)

  private policeCaseFileType = z.object({
    kodi: z.string().nullish(),
  })
  private policeCaseFileStructure = z.object({
    rvMalSkjolMals_ID: z.number(),
    heitiSkjals: z.string(),
    malsnumer: z.string(),
    domsSkjalsFlokkun: z.optional(z.string()),
    dagsStofnad: z.optional(z.string()),
    skjalasnid: z.optional(z.string()),
    tegundSkjals: z.optional(this.policeCaseFileType),
  })
  private readonly crimeSceneStructure = z.object({
    vettvangur: z.optional(z.string()),
    brotFra: z.optional(z.string()),
    upprunalegtMalsnumer: z.string(),
    licencePlate: z.optional(z.string()),
    gotuHeiti: z.optional(z.string()),
    gotuNumer: z.string().nullish(),
    sveitafelag: z.string().nullish(),
    postnumer: z.string().nullish(),
  })
  private responseStructure = z.object({
    malsnumer: z.string(),
    skjol: z.optional(z.array(this.policeCaseFileStructure)),
    malseinings: z.optional(z.array(this.crimeSceneStructure)),
  })

  constructor(
    @Inject(policeModuleConfig.KEY)
    private readonly config: ConfigType<typeof policeModuleConfig>,
    @Inject(forwardRef(() => EventService))
    private readonly eventService: EventService,
    @Inject(forwardRef(() => AwsS3Service))
    private readonly awsS3Service: AwsS3Service,
    @Inject(LOGGER_PROVIDER) private readonly logger: Logger,
  ) {
    this.xRoadPath = createXRoadAPIPath(
      config.tlsBasePathWithEnv,
      XRoadMemberClass.GovernmentInstitution,
      config.policeMemberCode,
      config.policeApiPath,
    )
    this.agent = new Agent({
      cert: config.clientCert,
      key: config.clientKey,
      ca: config.clientPem,
      rejectUnauthorized: false,
    })
  }

  private async fetchPoliceDocumentApi(url: string): Promise<Response> {
    if (!this.config.policeCaseApiAvailable) {
      throw new ServiceUnavailableException('Police document API not available')
    }

    return fetch(url, {
      headers: {
        'X-Road-Client': this.config.clientId,
        'X-API-KEY': this.config.policeApiKey,
      },
      agent: this.agent,
    } as RequestInit)
  }

  private async fetchPoliceCaseApi(
    url: string,
    requestInit: RequestInit,
  ): Promise<Response> {
    if (!this.config.policeCaseApiAvailable) {
      throw new ServiceUnavailableException('Police case API not available')
    }

    return fetch(url, requestInit)
  }

  private async throttleUploadPoliceCaseFile(
    caseId: string,
    caseType: CaseType,
    uploadPoliceCaseFile: UploadPoliceCaseFileDto,
    user: User,
  ): Promise<UploadPoliceCaseFileResponse> {
    await this.throttle.catch((reason) => {
      this.logger.info('Previous upload failed', { reason })
    })

    const pdf = await this.fetchPoliceDocumentApi(
      `${this.xRoadPath}/V2/GetPDFDocumentByID/${uploadPoliceCaseFile.id}`,
    )
      .then(async (res) => {
        if (res.ok) {
          const response = await res.json()

          return Base64.atob(response)
        }

        const reason = await res.text()

        throw new NotFoundException({
          message: `Police case file ${uploadPoliceCaseFile.id} of case ${caseId} not found`,
          detail: reason,
        })
      })
      .catch((reason) => {
        if (reason instanceof NotFoundException) {
          throw reason
        }

        if (reason instanceof ServiceUnavailableException) {
          // Act as if the file was not found
          throw new NotFoundException({
            ...reason,
            message: `Police case file ${uploadPoliceCaseFile.id} of case ${caseId} not found`,
            detail: reason.message,
          })
        }

        this.eventService.postErrorEvent(
          'Failed to get police case file',
          {
            caseId,
            actor: user.name,
            institution: user.institution?.name,
            caseFileId: uploadPoliceCaseFile.id,
            name: uploadPoliceCaseFile.name,
          },
          reason,
        )

        throw new BadGatewayException({
          ...reason,
          message: `Failed to get police case file ${uploadPoliceCaseFile.id} of case ${caseId}`,
          detail: reason.message,
        })
      })

    const key = `${caseId}/${uuid()}/${uploadPoliceCaseFile.name}`

    await this.awsS3Service.putObject(caseType, key, pdf)

    return { key, size: pdf.length }
  }

  async getAllPoliceCaseFiles(
    caseId: string,
    user: User,
  ): Promise<PoliceCaseFile[]> {
    const startTime = nowFactory()

    return this.fetchPoliceDocumentApi(
      `${this.xRoadPath}/V2/GetDocumentListById/${caseId}`,
    )
      .then(async (res: Response) => {
        if (res.ok) {
          const response: z.infer<typeof this.responseStructure> =
            await res.json()

          this.responseStructure.parse(response)

          const files: PoliceCaseFile[] = []

          response.skjol?.forEach((file) => {
            const id = file.rvMalSkjolMals_ID.toString()
            if (!files.find((item) => item.id === id)) {
              files.push({
                id,
                name: `${file.heitiSkjals}${file.skjalasnid ?? '.pdf'}`,
                policeCaseNumber: file.malsnumer,
                chapter: getChapter(file.domsSkjalsFlokkun),
                displayDate: file.dagsStofnad,
                type: file.tegundSkjals?.kodi ?? undefined,
              })
            }
          })

          return files
        }

        const reason = await res.text()

        // The police system does not provide a structured error response.
        // When a police case does not exist, a stack trace is returned.
        throw new NotFoundException({
          message: `Police case for case ${caseId} does not exist`,
          detail: reason,
        })
      })
      .catch((reason) => {
        if (reason instanceof NotFoundException) {
          throw reason
        }

        if (reason instanceof ServiceUnavailableException) {
          // Act as if the case does not exist
          throw new NotFoundException({
            ...reason,
            message: `Police case for case ${caseId} does not exist`,
            detail: reason.message,
          })
        }

        this.eventService.postErrorEvent(
          'Failed to get police case files',
          {
            caseId,
            actor: user.name,
            institution: user.institution?.name,
            startTime,
            endTime: nowFactory(),
          },
          reason,
        )

        throw new BadGatewayException({
          ...reason,
          message: `Failed to get police case files for case ${caseId}`,
          detail: reason.message,
        })
      })
  }

  async getPoliceCaseInfo(
    caseId: string,
    user: User,
  ): Promise<PoliceCaseInfo[]> {
    return this.fetchPoliceDocumentApi(
      `${this.xRoadPath}/V2/GetDocumentListById/${caseId}`,
    )
      .then(async (res: Response) => {
        if (res.ok) {
          const response: z.infer<typeof this.responseStructure> =
            await res.json()

          this.responseStructure.parse(response)

          const cases: PoliceCaseInfo[] = [
            { policeCaseNumber: response.malsnumer },
          ]

          response.skjol?.forEach((info: { malsnumer: string }) => {
            if (
              !cases.find((item) => item.policeCaseNumber === info.malsnumer)
            ) {
              cases.push({ policeCaseNumber: info.malsnumer })
            }
          })

          response.malseinings?.forEach(
            (info: {
              upprunalegtMalsnumer: string
              vettvangur?: string
              brotFra?: string
              licencePlate?: string
              gotuHeiti?: string | null
              gotuNumer?: string | null
              sveitafelag?: string | null
            }) => {
              const policeCaseNumber = info.upprunalegtMalsnumer

              const place = formatCrimeScenePlace(
                info.gotuHeiti,
                info.gotuNumer,
                info.sveitafelag,
              )
              const date = info.brotFra ? new Date(info.brotFra) : undefined
              const licencePlate = info.licencePlate

              const foundCase = cases.find(
                (item) => item.policeCaseNumber === policeCaseNumber,
              )

              if (!foundCase) {
                cases.push({ policeCaseNumber, place, date })
              } else if (date && (!foundCase.date || date > foundCase.date)) {
                foundCase.place = place
                foundCase.date = date
                foundCase.licencePlate = licencePlate
              }
            },
          )

          return cases
        }

        const reason = await res.text()

        // The police system does not provide a structured error response.
        // When a police case does not exist, a stack trace is returned.
        throw new NotFoundException({
          message: `Police case info for case ${caseId} does not exist`,
          detail: reason,
        })
      })
      .catch((reason) => {
        if (reason instanceof NotFoundException) {
          throw reason
        }

        if (reason instanceof ServiceUnavailableException) {
          // Act as if the case does not exist
          throw new NotFoundException({
            ...reason,
            message: `Police case info for case ${caseId} does not exist`,
            detail: reason.message,
          })
        }

        this.eventService.postErrorEvent(
          'Failed to get police case info',
          {
            caseId,
            actor: user.name,
            institution: user.institution?.name,
          },
          reason,
        )

        throw new BadGatewayException({
          ...reason,
          message: `Failed to get police case info for case ${caseId}`,
          detail: reason.message,
        })
      })
  }

  async uploadPoliceCaseFile(
    caseId: string,
    caseType: CaseType,
    uploadPoliceCaseFile: UploadPoliceCaseFileDto,
    user: User,
  ): Promise<UploadPoliceCaseFileResponse> {
    this.throttle = this.throttleUploadPoliceCaseFile(
      caseId,
      caseType,
      uploadPoliceCaseFile,
      user,
    )

    return this.throttle
  }

  async updatePoliceCase(
    user: User,
    caseId: string,
    caseType: CaseType,
    caseState: CaseState,
    policeCaseNumber: string,
    courtCaseNumber: string,
    defendantNationalId: string,
    validToDate: Date,
    caseConclusion: string,
    courtDocuments: PoliceDocument[],
  ): Promise<boolean> {
    return this.fetchPoliceCaseApi(
      `${this.xRoadPath}/V2/UpdateRVCase/${caseId}`,
      {
        method: 'PUT',
        headers: {
          accept: '*/*',
          'Content-Type': 'application/json',
          'X-Road-Client': this.config.clientId,
          'X-API-KEY': this.config.policeApiKey,
        },
        agent: this.agent,
        body: JSON.stringify({
          rvMal_ID: caseId,
          caseNumber: policeCaseNumber,
          courtCaseNumber,
          ssn: defendantNationalId,
          type: caseType,
          courtVerdict: caseState,
          expiringDate: validToDate?.toISOString(),
          courtVerdictString: caseConclusion,
          courtDocuments,
        }),
      } as RequestInit,
    )
      .then(async (res) => {
        if (res.ok) {
          return true
        }

        const response = await res.text()

        throw response
      })
      .catch((reason) => {
        if (reason instanceof ServiceUnavailableException) {
          // Do not spam the logs with errors
          // Act as if the case was updated
          return true
        } else {
          this.logger.error(`Failed to update police case ${caseId}`, {
            reason,
          })
        }

        this.eventService.postErrorEvent(
          'Failed to update police case',
          {
            caseId,
            actor: user.name,
            institution: user.institution?.name,
            caseType,
            caseState,
            policeCaseNumber,
            courtCaseNumber,
          },
          reason,
        )

        return false
      })
  }
}
