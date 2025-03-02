import {
  Args,
  Query,
  Resolver,
  Mutation,
  ResolveField,
  Parent,
} from '@nestjs/graphql'
import { BypassAuth } from '@island.is/auth-nest-tools'
import type { User } from '@island.is/auth-nest-tools'
import { CurrentUser, IdsUserGuard } from '@island.is/auth-nest-tools'
import { UseGuards } from '@nestjs/common'
import { Endorsement } from './models/endorsement.model'
import { EndorsementSystemService } from './endorsementSystem.service'
import { FindEndorsementListInput } from './dto/findEndorsementList.input'
import { CreateEndorsementInput } from './dto/createEndorsement.input'
import { EndorsementList } from './models/endorsementList.model'
import { CreateEndorsementListDto } from './dto/createEndorsementList.input'
import { ExistsEndorsementResponse } from './dto/existsEndorsement.response'
import { UpdateEndorsementListInput } from './dto/updateEndorsementList.input'
import { PaginatedEndorsementInput } from './dto/paginatedEndorsement.input'
import { PaginatedEndorsementResponse } from './dto/paginatedEndorsement.response'

import { PaginatedEndorsementListInput } from './dto/paginatedEndorsementList.input'
import { PaginatedEndorsementListResponse } from './dto/paginatedEndorsementList.response'

import { EndorsementPaginationInput } from './dto/endorsementPagination.input'
import { OpenListInput } from './dto/openList.input'
import { sendPdfEmailResponse } from './dto/sendPdfEmail.response'
import { sendPdfEmailInput } from './dto/sendPdfEmail.input'
import { CacheControl, CacheControlOptions } from '@island.is/nest/graphql'
import { CACHE_CONTROL_MAX_AGE } from '@island.is/shared/constants'

import { ExportUrlResponse } from './dto/exportUrl.response'
import { ExportEndorsementListInput } from './dto/exportEndorsementList.input'

const defaultCache: CacheControlOptions = { maxAge: CACHE_CONTROL_MAX_AGE }

@UseGuards(IdsUserGuard)
@Resolver(() => EndorsementList)
export class EndorsementSystemResolver {
  constructor(private endorsementSystemService: EndorsementSystemService) {}

  @CacheControl({ inheritMaxAge: true })
  @ResolveField('ownerName', () => String, { nullable: true })
  resolveOwnerName(@Parent() list: EndorsementList): Promise<string | null> {
    return this.endorsementSystemService.endorsementListControllerGetOwnerName({
      listId: list.id,
    })
  }

  @CacheControl(defaultCache)
  @Query(() => ExistsEndorsementResponse)
  async endorsementSystemGetSingleEndorsement(
    @Args('input') input: FindEndorsementListInput,
    @CurrentUser() user: User,
  ): Promise<ExistsEndorsementResponse> {
    return await this.endorsementSystemService.endorsementControllerFindByAuth(
      input,
      user,
    )
  }

  @CacheControl(defaultCache)
  @Query(() => PaginatedEndorsementResponse, { nullable: true })
  async endorsementSystemGetEndorsements(
    @Args('input') input: PaginatedEndorsementInput,
    @CurrentUser() user: User,
  ): Promise<PaginatedEndorsementResponse> {
    return await this.endorsementSystemService.endorsementControllerFindAll(
      input,
      user,
    )
  }

  @Mutation(() => Endorsement)
  async endorsementSystemEndorseList(
    @Args('input') input: CreateEndorsementInput,
    @CurrentUser() user: User,
  ): Promise<Endorsement> {
    return await this.endorsementSystemService.endorsementControllerCreate(
      input,
      user,
    )
  }

  @Mutation(() => Boolean)
  async endorsementSystemUnendorseList(
    @Args('input') input: FindEndorsementListInput,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return await this.endorsementSystemService.endorsementControllerDelete(
      input,
      user,
    )
  }

  @CacheControl(defaultCache)
  @Query(() => PaginatedEndorsementListResponse)
  async endorsementSystemFindEndorsementLists(
    @Args('input') input: PaginatedEndorsementListInput,
    @CurrentUser() user: User,
  ): Promise<PaginatedEndorsementListResponse> {
    return await this.endorsementSystemService.endorsementListControllerFindLists(
      input,
      user,
    )
  }

  @CacheControl(defaultCache)
  @Query(() => PaginatedEndorsementListResponse)
  @BypassAuth()
  async endorsementSystemGetGeneralPetitionLists(
    @Args('input') input: EndorsementPaginationInput,
  ): Promise<PaginatedEndorsementListResponse> {
    return await this.endorsementSystemService.endorsementListControllerGetGeneralPetitionLists(
      input,
    )
  }

  @CacheControl(defaultCache)
  @Query(() => EndorsementList)
  @BypassAuth()
  async endorsementSystemGetGeneralPetitionList(
    @Args('input') input: FindEndorsementListInput,
  ): Promise<EndorsementList | void> {
    return await this.endorsementSystemService.endorsementListControllerGetGeneralPetitionList(
      input,
    )
  }

  @CacheControl(defaultCache)
  @Query(() => PaginatedEndorsementResponse, { nullable: true })
  @BypassAuth()
  async endorsementSystemGetGeneralPetitionEndorsements(
    @Args('input') input: PaginatedEndorsementInput,
  ): Promise<PaginatedEndorsementResponse> {
    return await this.endorsementSystemService.endorsementControllerGetGeneralPetitionEndorsements(
      input,
    )
  }

  @CacheControl(defaultCache)
  @Query(() => EndorsementList, { nullable: true })
  async endorsementSystemGetSingleEndorsementList(
    @Args('input') input: FindEndorsementListInput,
    @CurrentUser() user: User,
  ): Promise<EndorsementList> {
    return await this.endorsementSystemService.endorsementListControllerFindOne(
      input,
      user,
    )
  }

  @CacheControl(defaultCache)
  @Query(() => PaginatedEndorsementResponse)
  async endorsementSystemUserEndorsements(
    @CurrentUser() user: User,
    @Args('input') input: EndorsementPaginationInput,
  ): Promise<PaginatedEndorsementResponse> {
    return await this.endorsementSystemService.endorsementListControllerFindEndorsements(
      user,
      input,
    )
  }

  @CacheControl(defaultCache)
  @Query(() => PaginatedEndorsementListResponse)
  async endorsementSystemUserEndorsementLists(
    @CurrentUser() user: User,
    @Args('input') input: PaginatedEndorsementListInput,
  ): Promise<PaginatedEndorsementListResponse> {
    return await this.endorsementSystemService.endorsementListControllerFindEndorsementLists(
      user,
      input,
    )
  }

  @Mutation(() => EndorsementList)
  async endorsementSystemCreateEndorsementList(
    @Args('input') input: CreateEndorsementListDto,
    @CurrentUser() user: User,
  ): Promise<EndorsementList> {
    return await this.endorsementSystemService.endorsementListControllerCreate(
      {
        endorsementListDto: input,
      },
      user,
    )
  }

  @Mutation(() => EndorsementList)
  async endorsementSystemUpdateEndorsementList(
    @Args('input') { listId, endorsementList }: UpdateEndorsementListInput,
    @CurrentUser() user: User,
  ): Promise<EndorsementList> {
    return await this.endorsementSystemService.endorsementListControllerUpdate(
      {
        listId,
        updateEndorsementListDto: endorsementList,
      },
      user,
    )
  }

  @Mutation(() => EndorsementList)
  async endorsementSystemCloseEndorsementList(
    @Args('input') input: FindEndorsementListInput,
    @CurrentUser() user: User,
  ): Promise<EndorsementList> {
    return await this.endorsementSystemService.endorsementListControllerClose(
      input,
      user,
    )
  }

  @Mutation(() => EndorsementList)
  async endorsementSystemOpenEndorsementList(
    @Args('input') input: OpenListInput,
    @CurrentUser() user: User,
  ): Promise<EndorsementList> {
    return await this.endorsementSystemService.endorsementListControllerOpen(
      input,
      user,
    )
  }

  @Mutation(() => EndorsementList)
  async endorsementSystemLockEndorsementList(
    @Args('input') input: FindEndorsementListInput,
    @CurrentUser() user: User,
  ): Promise<EndorsementList> {
    return await this.endorsementSystemService.endorsementListControllerLock(
      input,
      user,
    )
  }

  @Mutation(() => EndorsementList)
  async endorsementSystemUnlockEndorsementList(
    @Args('input') input: FindEndorsementListInput,
    @CurrentUser() user: User,
  ): Promise<EndorsementList> {
    return await this.endorsementSystemService.endorsementListControllerUnlock(
      input,
      user,
    )
  }

  @Mutation(() => sendPdfEmailResponse)
  async endorsementSystemsendPdfEmail(
    @Args('input') input: sendPdfEmailInput,
    @CurrentUser() user: User,
  ): Promise<{ success: boolean }> {
    return await this.endorsementSystemService.endorsementListControllerSendPdfEmail(
      input,
      user,
    )
  }

  @Mutation(() => ExportUrlResponse)
  async endorsementSystemExportList(
    @Args('input') input: ExportEndorsementListInput,
    @CurrentUser() user: User,
  ): Promise<ExportUrlResponse> {
    return await this.endorsementSystemService.endorsementListControllerExportList(
      input,
      user,
    )
  }
}
