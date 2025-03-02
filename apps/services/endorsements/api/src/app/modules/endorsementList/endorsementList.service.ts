import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { col, Op, Sequelize } from 'sequelize'
import type { Logger } from '@island.is/logging'
import { LOGGER_PROVIDER } from '@island.is/logging'
import { EndorsementList } from './endorsementList.model'
import { EndorsementListDto } from './dto/endorsementList.dto'
import { Endorsement } from '../endorsement/models/endorsement.model'
import { ChangeEndorsmentListClosedDateDto } from './dto/changeEndorsmentListClosedDate.dto'
import { UpdateEndorsementListDto } from './dto/updateEndorsementList.dto'
import { paginate } from '@island.is/nest/pagination'
import environment, {
  ENDORSEMENT_SYSTEM_GENERAL_PETITION_TAGS,
} from '../../../environments/environment'
import type { User } from '@island.is/auth-nest-tools'
import { AdminPortalScope } from '@island.is/auth/scopes'
import { EmailService } from '@island.is/email-service'
import PDFDocument from 'pdfkit'
import getStream from 'get-stream'
import { NationalRegistryV3ClientService } from '@island.is/clients/national-registry-v3'

import csvStringify from 'csv-stringify/lib/sync'

import { AwsService } from '@island.is/nest/aws'
import { EndorsementListExportUrlResponse } from './dto/endorsementListExportUrl.response.dto'

interface CreateInput extends EndorsementListDto {
  owner: string
}

@Injectable()
export class EndorsementListService {
  constructor(
    @InjectModel(Endorsement)
    private endorsementModel: typeof Endorsement,
    @InjectModel(EndorsementList)
    private readonly endorsementListModel: typeof EndorsementList,
    @Inject(LOGGER_PROVIDER)
    private logger: Logger,
    @Inject(EmailService)
    private emailService: EmailService,
    private readonly nationalRegistryApiV3: NationalRegistryV3ClientService,
    private readonly awsService: AwsService,
  ) {}

  hasAdminScope(user: User): boolean {
    if (user?.scope) {
      for (const [_, value] of Object.entries(user.scope)) {
        if (value === AdminPortalScope.petitionsAdmin) {
          return true
        }
      }
    }

    return false
  }

  async getListOwnerNationalId(listId: string): Promise<string | null> {
    const endorsementList = await this.endorsementListModel.findOne({
      where: {
        id: listId,
      },
    })
    if (endorsementList) {
      return endorsementList.owner
    } else {
      return null
    }
  }

  // generic reusable query with pagination defaults
  async findListsGenericQuery(query: any, where: any = {}) {
    this.logger.info(`Finding endorsement lists`)
    return await paginate({
      Model: this.endorsementListModel,
      limit: query.limit || 10,
      after: query.after,
      before: query.before,
      primaryKeyField: 'counter',
      orderOption: [
        ['endorsementCounter', 'DESC'],
        ['counter', 'DESC'],
      ],
      where: where,
      attributes: {
        include: [
          [
            Sequelize.fn('COUNT', Sequelize.col('endorsements.id')),
            'endorsementCounter',
          ],
        ],
      },
      include: [
        {
          model: Endorsement,
          required: false, // Required false for left outer join so that counts come for 0 as well
          duplicating: false,
          attributes: [],
        },
      ],
      group: ['EndorsementList.id'],
    })
  }

  async findListsByTags(tags: string[], query: any, user: User) {
    const isAdmin = this.hasAdminScope(user)
    this.logger.info(`Finding endorsement lists by tags "${tags.join(', ')}"`)
    // check if user is admin
    return await paginate({
      Model: this.endorsementListModel,
      limit: query.limit || 10,
      after: query.after,
      before: query.before,
      primaryKeyField: 'counter',
      orderOption: [['counter', 'ASC']],
      where: {
        tags: { [Op.overlap]: tags },
        adminLock: isAdmin ? { [Op.or]: [true, false] } : false,
      },
    })
  }

  async findSingleList(listId: string, user?: User, check?: boolean) {
    // Check variable needed since finAll function in Endorsement controller uses this function twice
    // on the second call it passes nationalID of user but does not go throught the get list pipe
    const isAdmin = user && check ? this.hasAdminScope(user) : false
    this.logger.info(`Finding single endorsement lists by id "${listId}"`)
    const result = await this.endorsementListModel.findOne({
      where: {
        id: listId,
        adminLock: isAdmin ? { [Op.or]: [true, false] } : false,
      },
    })

    if (!result) {
      this.logger.warn('This endorsement list does not exist.')
      throw new NotFoundException(['This endorsement list does not exist.'])
    }

    return result
  }

  async findAllEndorsementsByNationalId(nationalId: string, query: any) {
    this.logger.info(
      `Finding endorsements for single national id ${nationalId}`,
    )
    return await paginate({
      Model: this.endorsementModel,
      limit: query.limit || 10,
      after: query.after,
      before: query.before,
      primaryKeyField: 'counter',
      orderOption: [['counter', 'DESC']],
      where: { endorser: nationalId },
      include: [
        {
          model: EndorsementList,
          required: true,
          as: 'endorsementList',
          where: {
            adminLock: false,
            tags: { [Op.contains]: [ENDORSEMENT_SYSTEM_GENERAL_PETITION_TAGS] },
          },
          attributes: [
            'id',
            'title',
            'description',
            'tags',
            'closedDate',
            'openedDate',
          ],
        },
      ],
    })
  }

  async findAllEndorsementListsByNationalId(nationalId: string, query: any) {
    this.logger.info(
      `Finding endorsement lists created by single national id ${nationalId}`,
    )

    return await paginate({
      Model: this.endorsementListModel,
      limit: query.limit || 10,
      after: query.after,
      before: query.before,
      primaryKeyField: 'counter',
      orderOption: [['counter', 'ASC']],
      where: {
        owner: nationalId,
        adminLock: false,
      },
    })
  }

  async close(endorsementList: EndorsementList): Promise<EndorsementList> {
    this.logger.info(`Closing endorsement list: ${endorsementList.id}`)
    return await endorsementList.update({ closedDate: new Date() })
  }

  async open(
    endorsementList: EndorsementList,
    newDate: ChangeEndorsmentListClosedDateDto,
  ): Promise<EndorsementList> {
    this.logger.info(`Opening endorsement list: ${endorsementList.id}`)
    return await endorsementList.update({
      closedDate: newDate.closedDate,
    })
  }

  async lock(endorsementList: EndorsementList): Promise<EndorsementList> {
    this.logger.info(`Locking endorsement list: ${endorsementList.id}`)
    if (process.env.NODE_ENV === 'production') {
      await this.emailLock(endorsementList)
    }
    return await endorsementList.update({ adminLock: true })
  }

  async unlock(endorsementList: EndorsementList): Promise<EndorsementList> {
    this.logger.info(`Unlocking endorsement list: ${endorsementList.id}`)
    return await endorsementList.update({ adminLock: false })
  }

  async updateEndorsementList(
    endorsementList: EndorsementList,
    newData: UpdateEndorsementListDto,
  ): Promise<EndorsementList> {
    this.logger.info(`Updating endorsement list: ${endorsementList.id}`)
    return await endorsementList.update({ ...endorsementList, ...newData })
  }

  async create(list: CreateInput) {
    if (!list.openedDate || !list.closedDate) {
      this.logger.warn('Body missing openedDate or closedDate value.')
      throw new BadRequestException([
        'Body missing openedDate or closedDate value.',
      ])
    }
    if (list.openedDate >= list.closedDate) {
      this.logger.warn('openedDate can not be bigger than closedDate.')
      throw new BadRequestException([
        'openedDate can not be bigger than closedDate.',
      ])
    }
    if (new Date() >= list.closedDate) {
      this.logger.warn(
        'closedDate can not have already passed on creation of Endorsement List',
      )
      throw new BadRequestException([
        'closedDate can not have already passed on creation of Endorsement List',
      ])
    }
    this.logger.info(`Creating endorsement list: ${list.title}`)
    const endorsementList = await this.endorsementListModel.create({ ...list })

    console.log('process.env.NODE_ENV', process.env.NODE_ENV)
    if (process.env.NODE_ENV === 'production') {
      await this.emailCreated(endorsementList)
    }

    return endorsementList
  }

  // generic get open lists
  async findOpenListsTaggedGeneralPetition(query: any) {
    const dateOb = new Date()
    try {
      const where = {
        tags: { [Op.eq]: ENDORSEMENT_SYSTEM_GENERAL_PETITION_TAGS },
        openedDate: { [Op.lt]: dateOb },
        closedDate: { [Op.gt]: dateOb },
        adminLock: false,
      }
      return await this.findListsGenericQuery(query, where)
    } catch (error) {
      this.logger.warn('findOpenListsTaggedGeneralPetition not found')
      throw new NotFoundException()
    }
  }

  async findSingleOpenListTaggedGeneralPetition(
    listId: string,
  ): Promise<EndorsementList | null> {
    const dateOb = new Date()
    const result = await this.endorsementListModel.findOne({
      where: {
        id: listId,
        tags: ENDORSEMENT_SYSTEM_GENERAL_PETITION_TAGS,
        openedDate: { [Op.lt]: dateOb },
        closedDate: { [Op.gt]: dateOb },
        adminLock: false,
      },
    })
    if (!result) {
      this.logger.warn('findSingleOpenListTaggedGeneralPetition not found')
      throw new NotFoundException()
    }
    return result
  }

  async getOwnerInfo(listId: string, owner?: string) {
    // Is used by both unauthenticated users, authenticated users and admin
    // Admin needs to access locked lists and can not use the EndorsementListById pipe
    // Since the endpoint is not authenticated
    this.logger.info(`Finding single endorsement lists by id "${listId}"`)
    if (!owner) {
      const endorsementList = await this.endorsementListModel.findOne({
        where: {
          id: listId,
        },
      })
      if (!endorsementList) {
        this.logger.warn('This endorsement list does not exist.')
        throw new NotFoundException(['This endorsement list does not exist.'])
      }
      owner = endorsementList.owner
    }

    try {
      const person = await this.nationalRegistryApiV3.getName(owner)
      return person?.fulltNafn ? person.fulltNafn : ''
    } catch (e) {
      if (e instanceof Error) {
        this.logger.warn(
          `Occured when fetching owner name from NationalRegistryApi ${e.message} \n${e.stack}`,
        )
        return ''
      } else {
        throw e
      }
    }
  }

  async createDocumentBuffer(endorsementList: any, ownerName: string) {
    // build pdf
    const doc = new PDFDocument()
    const locale = 'is-IS'
    const big = 16
    const regular = 8
    const fontRegular = 'Helvetica'
    const fontBold = 'Helvetica-Bold'

    doc
      .fontSize(big)
      .text('Upplýsingar um meðmælendalista')
      .moveDown()

      .fontSize(regular)
      .font(fontBold)
      .text('Heiti meðmælendalista: ')
      .font(fontRegular)
      .text(endorsementList.title)
      .moveDown()

      .font(fontBold)
      .text('Um meðmælendalista: ')
      .font(fontRegular)
      .text(endorsementList.description)
      .moveDown()

      .font(fontBold)
      .text('Ábyrgðarmaður: ')
      .font(fontRegular)
      .text(ownerName)
      .moveDown()

      .font(fontBold)
      .text('Gildistímabil lista: ')
      .font(fontRegular)
      .text(
        endorsementList.openedDate.toLocaleDateString(locale) +
          ' - ' +
          endorsementList.closedDate.toLocaleDateString(locale),
      )
      .moveDown()

      .font(fontBold)
      .text('Fjöldi skráðir: ')
      .font(fontRegular)
      .text(endorsementList.endorsements.length)
      .moveDown(2)

    if (endorsementList.endorsements.length) {
      doc.fontSize(big).text('Yfirlit meðmæla').fontSize(regular).moveDown()
      for (const val of endorsementList.endorsements) {
        doc.text(
          val.created.toLocaleDateString(locale) +
            ' ' +
            (val.meta.fullName ? val.meta.fullName : 'Nafn ótilgreint') +
            ' ' +
            (val.meta.locality ? val.meta.locality : 'Sveitafélag ótilgreint'),
        )
      }
    }
    doc
      .moveDown()

      .fontSize(regular)
      .text(
        'Þetta skjal var framkallað sjálfvirkt þann: ' +
          new Date().toLocaleDateString(locale) +
          ' klukkan ' +
          new Date().toLocaleTimeString(locale),
      )
    doc.end()
    return await getStream.buffer(doc)
  }

  async emailPDF(
    listId: string,
    recipientEmail: string,
  ): Promise<{ success: boolean }> {
    const endorsementList = await this.endorsementListModel.findOne({
      where: { id: listId },
      include: [
        {
          model: Endorsement,
        },
      ],
    })
    if (!endorsementList) {
      this.logger.warn('This endorsement list does not exist.')
      throw new NotFoundException(['This endorsement list does not exist.'])
    }
    const ownerName = await this.getOwnerInfo(
      endorsementList?.id,
      endorsementList.owner,
    )
    this.logger.info(
      `sending list ${listId} to ${recipientEmail} from ${environment.email.sender}`,
    )
    try {
      await this.emailService.sendEmail({
        from: {
          name: environment.email.sender,
          address: environment.email.address,
        },
        to: [
          {
            // message can be sent to any email so recipient name is unknown
            name: recipientEmail,
            address: recipientEmail,
          },
        ],
        subject: `Undirskriftalisti "${endorsementList?.title}"`,
        template: {
          title: `Undirskriftalisti "${endorsementList?.title}"`,
          body: [
            {
              component: 'Heading',
              context: {
                copy: `Undirskriftalisti "${endorsementList?.title}"`,
                small: true,
              },
            },
            { component: 'Copy', context: { copy: 'Sæl/l/t', small: true } },
            {
              component: 'Copy',
              context: {
                copy: `Meðfylgjandi er undirskriftalisti "${endorsementList?.title}",
                sem ${ownerName} er skráður ábyrgðarmaður fyrir.`,
                small: true,
              },
            },
            {
              component: 'Copy',
              context: {
                copy: `Vakin er athygli á lögum um persónuvernd og vinnslu persónuupplýsinga nr. 90/2018.`,
                small: true,
              },
            },
            {
              component: 'Copy',
              context: { copy: 'Kær kveðja,', small: true },
            },
            { component: 'Copy', context: { copy: 'Ísland.is', small: true } },
          ],
        },
        attachments: [
          {
            filename: 'Undirskriftalisti.pdf',
            content: await this.createDocumentBuffer(
              endorsementList,
              ownerName,
            ),
          },
        ],
      })
      return { success: true }
    } catch (error) {
      this.logger.error('Failed to send email', error)
      return { success: false }
    }
  }

  getOwnerContact(obj: any, search: string): string {
    for (const [key, value] of Object.entries(obj)) {
      if (key === search) {
        return value as string
      }
    }
    this.logger.warn('This endorsement list does not include owner email.')
    throw new NotFoundException([
      'This endorsement list does not include owner email.',
    ])
  }

  async emailLock(
    endorsementList: EndorsementList,
  ): Promise<{ success: boolean }> {
    if (!endorsementList) {
      this.logger.warn('This endorsement list does not exist.')
      throw new NotFoundException(['This endorsement list does not exist.'])
    }
    const recipientEmail = this.getOwnerContact(endorsementList.meta, 'email')
    const ownerName = await this.getOwnerInfo(
      endorsementList?.id,
      endorsementList.owner,
    )
    this.logger.info(
      `sending list ${endorsementList.id} to ${recipientEmail} from ${environment.email.sender}`,
    )
    try {
      await this.emailService.sendEmail({
        from: {
          name: environment.email.sender,
          address: environment.email.address,
        },
        to: [
          {
            // message can be sent to any email so recipient name is unknown
            name: recipientEmail,
            address: recipientEmail,
          },
        ],
        subject: `Undirskriftalista "${endorsementList?.title} hefur verið læst"`,
        template: {
          title: `Undirskriftalisti "${endorsementList?.title}"`,
          body: [
            {
              component: 'Heading',
              context: {
                copy: `Undirskriftalisti "${endorsementList?.title}"`,
                small: true,
              },
            },
            { component: 'Copy', context: { copy: 'Sæl/l/t', small: true } },
            {
              component: 'Copy',
              context: {
                copy: `Undirskriftalista "${endorsementList?.title}" sem, ${ownerName}
                er skráður ábyrgðarmaður fyrir, hefur verið læst af þjónustuaðila kerfisins hjá Þjóðskrá Íslands
                og er því ekki aðgengilegur inn á Ísland.is. Metið hefur verið að listinn uppfyllir ekki skilmála undirskriftalista.`,
                small: true,
              },
            },
            {
              component: 'Copy',
              context: { copy: 'Kær kveðja,', small: true },
            },
            { component: 'Copy', context: { copy: 'Ísland.is', small: true } },
          ],
        },
      })
      return { success: true }
    } catch (error) {
      this.logger.error('Failed to send email', error)
      return { success: false }
    }
  }

  async emailCreated(
    endorsementList: EndorsementList,
  ): Promise<{ success: boolean }> {
    if (!endorsementList) {
      this.logger.warn('This endorsement list does not exist.')
      throw new NotFoundException(['This endorsement list does not exist.'])
    }
    const locale = 'is-IS'
    const ownerEmail = this.getOwnerContact(endorsementList.meta, 'email')
    const ownerPhone = this.getOwnerContact(endorsementList.meta, 'phone')
    const ownerName = await this.getOwnerInfo(
      endorsementList?.id,
      endorsementList.owner,
    )
    this.logger.info(
      `sending new list ${endorsementList.id} to skra@skra.is from ${environment.email.sender}`,
    )
    try {
      await this.emailService.sendEmail({
        from: {
          name: environment.email.sender,
          address: environment.email.address,
        },
        to: [
          {
            // message can be sent to any email so recipient name is unknown
            name: 'skra@skra.is',
            address: 'skra@skra.is',
          },
        ],
        subject: `Nýr undirskriftalisti  hefur verið stofnaður`,
        template: {
          title: `Undirskriftalisti "${endorsementList?.title}"`,
          body: [
            {
              component: 'Heading',
              context: {
                copy: `Undirskriftalisti "${endorsementList?.title}"`,
                small: true,
              },
            },
            {
              component: 'Copy',
              context: {
                copy: `Lýsing: ${endorsementList?.description}`,
                small: true,
              },
            },
            {
              component: 'Copy',
              context: {
                copy: `Gildistímabil lista: ${
                  endorsementList.openedDate.toLocaleDateString(locale) +
                  ' - ' +
                  endorsementList.closedDate.toLocaleDateString(locale)
                }`,
                small: true,
              },
            },
            {
              component: 'Copy',
              context: {
                copy: `Stofnandi lista: ${ownerName}`,
                small: true,
              },
            },
            {
              component: 'Copy',
              context: {
                copy: `Kennitala stofnenda: ${endorsementList.owner}`,
                small: true,
              },
            },
            {
              component: 'Copy',
              context: {
                copy: `Netfang stofnenda: ${ownerEmail}`,
                small: true,
              },
            },
            {
              component: 'Copy',
              context: {
                copy: `Sími stofnenda: ${ownerPhone}`,
                small: true,
              },
            },
            {
              component: 'Copy',
              context: { copy: 'Kær kveðja,', small: true },
            },
            { component: 'Copy', context: { copy: 'Ísland.is', small: true } },
          ],
        },
      })
      return { success: true }
    } catch (error) {
      this.logger.error('Failed to send email', error)
      return { success: false }
    }
  }
  async exportList(
    listId: string,
    user: User,
    fileType: 'pdf' | 'csv',
  ): Promise<EndorsementListExportUrlResponse> {
    try {
      this.logger.info(`Exporting list ${listId} as ${fileType}`, { listId })

      // Validate file type
      if (!['pdf', 'csv'].includes(fileType)) {
        throw new BadRequestException(
          'Invalid file type. Allowed values are "pdf" or "csv".',
        )
      }

      // Fetch endorsement list
      const endorsementList = await this.fetchEndorsementList(listId, user)
      if (!endorsementList) {
        throw new NotFoundException(
          `Endorsement list ${listId} not found or access denied.`,
        )
      }

      // Create file buffer
      const fileBuffer =
        fileType === 'pdf'
          ? await this.createPdfBuffer(endorsementList)
          : this.createCsvBuffer(endorsementList)

      // Upload to S3
      const filename = `undirskriftalisti-${listId}-${new Date()
        .toISOString()
        .replace(/[:.]/g, '-')}.${fileType}`
      await this.uploadFileToS3(fileBuffer, filename, fileType)

      // Generate presigned URL with 60 minutes expiration
      const url = await this.awsService.getPresignedUrl(
        environment.exportsBucketName,
        filename,
      )
      return { url }
    } catch (error) {
      this.logger.error(`Failed to export list ${listId}`, { error })
      throw error
    }
  }

  private async fetchEndorsementList(
    listId: string,
    user: User,
  ): Promise<EndorsementList | null> {
    // Only admin or list owner can access the list
    const isAdmin = this.hasAdminScope(user)
    return this.endorsementListModel.findOne({
      where: {
        id: listId,
        ...(isAdmin ? {} : { owner: user.nationalId }),
      },
      include: [{ model: Endorsement }],
    })
  }

  private createCsvBuffer(endorsementList: EndorsementList): Buffer {
    const records = (endorsementList.endorsements || []).map((endorsement) => ({
      Dagsetning: endorsement.created.toLocaleDateString('is-IS'),
      Nafn: endorsement.meta?.fullName || 'Nafn ótilgreint',
      Sveitafélag: endorsement.meta?.locality || 'Sveitafélag ótilgreint',
    }))
    const csvString = csvStringify(records, { header: true })
    return Buffer.from(csvString, 'utf-8')
  }

  private async createPdfBuffer(
    endorsementList: EndorsementList,
  ): Promise<Buffer> {
    try {
      const ownerName = await this.getOwnerInfo(
        endorsementList.id,
        endorsementList.owner,
      )
      const pdfBuffer = await this.createDocumentBuffer(
        endorsementList,
        ownerName,
      )
      return pdfBuffer
    } catch (error) {
      this.logger.error(
        `Failed to create PDF buffer for endorsement list ${endorsementList.id}`,
        { error },
      )
      throw new Error(
        `Error generating PDF for endorsement list ${endorsementList.id}`,
      )
    }
  }

  private async uploadFileToS3(
    fileBuffer: Buffer,
    filename: string,
    fileType: 'pdf' | 'csv',
  ): Promise<void> {
    try {
      await this.awsService.uploadFile(
        fileBuffer,
        environment.exportsBucketName,
        filename,
        {
          ContentType: fileType === 'pdf' ? 'application/pdf' : 'text/csv',
        },
      )
    } catch (error) {
      this.logger.error(`Failed to upload file to S3`, { error, filename })
      throw new Error('Error uploading file to S3')
    }
  }
}
