import { lazy } from 'react'
import { m } from '@island.is/service-portal/core'
import { PortalModule, PortalRoute } from '@island.is/portals/core'
import { SignatureCollectionPaths } from './lib/paths'
import { ApiScope } from '@island.is/auth/scopes'
import { Navigate } from 'react-router-dom'

const SignatureListsParliamentary = lazy(() =>
  import('./screens/Parliamentary/'),
)
const SignatureListsPresidential = lazy(() => import('./screens/Presidential'))
const ViewListPresidential = lazy(() =>
  import('./screens/Presidential/OwnerView/ViewList'),
)
const ViewListParliamentary = lazy(() =>
  import('./screens/Parliamentary/OwnerView/ViewList'),
)

export const signatureCollectionModule: PortalModule = {
  name: m.signatureCollectionLists,
  routes: ({ userInfo }) => {
    const applicationRoutes: PortalRoute[] = [
      {
        name: m.signatureCollectionParliamentaryLists,
        path: SignatureCollectionPaths.RootPath,
        enabled: userInfo.scopes.includes(ApiScope.signatureCollection),
        element: (
          /* Default path to general petitions since these are always ongoing */
          <Navigate to={SignatureCollectionPaths.GeneralPetitions} replace />
        ),
      },
      {
        name: m.signatureCollectionParliamentaryLists,
        enabled: userInfo.scopes.includes(ApiScope.signatureCollection),
        path: SignatureCollectionPaths.SignatureCollectionParliamentaryLists,
        key: 'ParliamentaryLists',
        element: <SignatureListsParliamentary />,
      },
      {
        name: m.signatureCollectionPresidentialLists,
        path: SignatureCollectionPaths.ViewParliamentaryList,
        enabled: userInfo.scopes.includes(ApiScope.signatureCollection),
        key: 'ParliamentaryLists',
        element: <ViewListParliamentary />,
      },
      {
        name: m.signatureCollectionPresidentialLists,
        enabled: userInfo.scopes.includes(ApiScope.signatureCollection),
        path: SignatureCollectionPaths.SignatureCollectionLists,
        key: 'PresidentialLists',
        element: <SignatureListsPresidential />,
      },
      {
        name: m.signatureCollectionPresidentialLists,
        path: SignatureCollectionPaths.ViewList,
        key: 'PresidentialLists',
        enabled: userInfo.scopes.includes(ApiScope.signatureCollection),
        element: <ViewListPresidential />,
      },
    ]

    return applicationRoutes
  },
}
