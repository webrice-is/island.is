import { Box, Stack, Text } from '@island.is/island-ui/core'
import { useLocale, useNamespaces } from '@island.is/localization'
import { m } from '../../../../lib/messages'
import { useLocation } from 'react-router-dom'
import { useGetSignatureList } from '../../../../hooks'
import format from 'date-fns/format'
import Signees from './Signees'
import CancelCollection from '../../../Presidential/OwnerView/CancelCollection'
import { SignatureCollectionPaths } from '../../../../lib/paths'

const ViewList = () => {
  useNamespaces('sp.signatureCollection')
  const { formatMessage } = useLocale()
  const { pathname } = useLocation()
  const listId = pathname.replace(
    SignatureCollectionPaths.SignatureCollectionParliamentaryLists + '/',
    '',
  )
  const { listInfo, loadingList } = useGetSignatureList(listId)

  return (
    <>
      {/*!loadingList && !!listInfo && (*/}
      <Stack space={5}>
        <Box>
          <Text variant="h3">{'Listi A'}</Text>
        </Box>
        <Box display={['block', 'flex']} justifyContent="spaceBetween">
          <Box>
            <Text variant="h5">{formatMessage(m.listPeriod)}</Text>
            {/*<Text>
                {format(new Date(listInfo.startTime), "dd.MM.yyyy") +
                  " - " +
                  format(new Date(listInfo.endTime), "dd.MM.yyyy")}
              </Text>*/}
          </Box>
          <Box marginTop={[2, 0]}>
            <Text variant="h5">{formatMessage(m.numberOfSigns)}</Text>
            <Text>{listInfo?.numberOfSignatures}</Text>
          </Box>
          <Box marginTop={[2, 0]}>
            {!!listInfo?.collectors?.length && (
              <>
                <Text marginTop={[2, 0]} variant="h5">
                  {formatMessage(m.coOwners)}
                </Text>
                {listInfo?.collectors?.map((collector) => (
                  <Box
                    key={collector.name}
                    width="half"
                    display={['block', 'flex']}
                    justifyContent="spaceBetween"
                  >
                    <Text>{collector.name}</Text>
                  </Box>
                ))}
              </>
            )}
          </Box>
        </Box>
        <Signees />

        <CancelCollection collectionId={'1'} />
      </Stack>
      {/*)}*/}
    </>
  )
}

export default ViewList
