import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'

import {
  isCompletedCase,
  isDefenceUser,
  isIndictmentCase,
  isPrisonAdminUser,
  isRequestCase,
  User,
} from '@island.is/judicial-system/types'

import { Case } from '../../case'
import { CaseFile } from '../models/file.model'
import {
  defenderCaseFileCategoriesForIndictmentCases,
  defenderCaseFileCategoriesForRestrictionAndInvestigationCases,
  prisonAdminCaseFileCategories,
} from './caseFileCategory'

@Injectable()
export class LimitedAccessViewCaseFileGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()

    const user: User = request.user

    if (!user) {
      throw new InternalServerErrorException('Missing user')
    }

    const theCase: Case = request.case

    if (!theCase) {
      throw new InternalServerErrorException('Missing case')
    }

    const caseFile: CaseFile = request.caseFile

    if (!caseFile) {
      throw new InternalServerErrorException('Missing case file')
    }

    if (isDefenceUser(user) && caseFile.category) {
      if (
        isRequestCase(theCase.type) &&
        isCompletedCase(theCase.state) &&
        defenderCaseFileCategoriesForRestrictionAndInvestigationCases.includes(
          caseFile.category,
        )
      ) {
        return true
      }

      if (
        isIndictmentCase(theCase.type) &&
        defenderCaseFileCategoriesForIndictmentCases.includes(caseFile.category)
      ) {
        return true
      }
    }

    if (
      caseFile.category &&
      isCompletedCase(theCase.state) &&
      isPrisonAdminUser(user) &&
      prisonAdminCaseFileCategories.includes(caseFile.category)
    ) {
      return true
    }

    throw new ForbiddenException(`Forbidden for ${user.role}`)
  }
}
