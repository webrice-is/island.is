import withApollo from '@island.is/web/graphql/withApollo'
import { withLocale } from '@island.is/web/i18n'
import { IcelandicGovernmentInstitutionVacanciesList } from '@island.is/web/screens/IcelandicGovernmentInstitutionVacancies'

export default withApollo(
  withLocale('is')(IcelandicGovernmentInstitutionVacanciesList),
)