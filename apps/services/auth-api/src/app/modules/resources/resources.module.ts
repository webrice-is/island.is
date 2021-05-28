import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { ResourcesController } from './resources.controller'
import {
  ApiResourceSecret,
  IdentityResource,
  ResourcesService,
  ApiScopeUserClaim,
  ApiResourceUserClaim,
  ApiResource,
  ApiResourceScope,
  ApiScope,
  IdentityResourceUserClaim,
  ApiScopeGroup,
  Domain,
} from '@island.is/auth-api-lib'

@Module({
  imports: [
    SequelizeModule.forFeature([
      IdentityResource,
      IdentityResourceUserClaim,
      ApiScope,
      ApiScopeUserClaim,
      ApiResource,
      ApiResourceUserClaim,
      ApiResourceScope,
      ApiResourceSecret,
      ApiScopeGroup,
      Domain,
    ]),
  ],
  controllers: [ResourcesController],
  providers: [ResourcesService],
})
export class ResourcesModule {}
