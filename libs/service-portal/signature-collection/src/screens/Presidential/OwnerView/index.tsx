import {
  ActionCard,
  Box,
  Button,
  Stack,
  Text,
  toast,
} from '@island.is/island-ui/core'
import { useLocale, useNamespaces } from '@island.is/localization'
import { m } from '../../../lib/messages'
import { SignatureCollectionPaths } from '../../../lib/paths'
import CancelCollection from './CancelCollection'
import { useGetListsForOwner } from '../../../hooks'
import format from 'date-fns/format'
import { Skeleton } from '../../../skeletons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@island.is/auth/react'
import copyToClipboard from 'copy-to-clipboard'
import SignedList from '../SignedList'
import { SignatureCollection } from '@island.is/api/schema'

const OwnerView = ({
  currentCollection,
}: {
  currentCollection: SignatureCollection
}) => {
  useNamespaces('sp.signatureCollection')
  const navigate = useNavigate()
  const { userInfo: user } = useAuth()
  const { formatMessage } = useLocale()
  const { listsForOwner, loadingOwnerLists } = useGetListsForOwner(
    currentCollection?.id || '',
  )

  return (
    <Box>
      {!loadingOwnerLists && !!currentCollection ? (
        <Box>
          {listsForOwner?.length === 0 && currentCollection.isActive && (
            <Button
              icon="open"
              iconType="outline"
              onClick={() =>
                window.open(
                  `${document.location.origin}/umsoknir/medmaelasofnun/`,
                )
              }
              size="small"
            >
              {formatMessage(m.createListButton)}
            </Button>
          )}
          <Box marginTop={[2, 7]}>
            <Text variant="h3" marginBottom={2}>
              {formatMessage(m.collectionTitle)}
            </Text>
            <Box
              background="purple100"
              borderRadius="large"
              display={['block', 'flex', 'flex']}
              justifyContent="spaceBetween"
              alignItems="center"
              padding={3}
            >
              <Box marginHeight={5}>
                <Text marginBottom={[2, 0, 0]}>
                  {formatMessage(m.copyLinkDescription)}
                </Text>
              </Box>
              <Button
                onClick={() => {
                  const copied = copyToClipboard(
                    `${document.location.origin}${listsForOwner[0].slug}`,
                  )
                  if (!copied) {
                    return toast.error(formatMessage(m.copyLinkError))
                  }
                  toast.success(formatMessage(m.copyLinkSuccess))
                }}
                variant="utility"
                icon="link"
              >
                {formatMessage(m.copyLinkButton)}
              </Button>
            </Box>

            {/* Signed list */}
            {!user?.profile.actor && <SignedList />}

            {/* Candidate created lists */}
            <Text marginTop={[5, 7]} marginBottom={2}>
              {formatMessage(m.myListsDescription)}
            </Text>
            <Stack space={[3, 5]}>
              {listsForOwner.map((list) => {
                return (
                  <ActionCard
                    key={list.id}
                    backgroundColor="white"
                    heading={list.title}
                    eyebrow={
                      formatMessage(m.endTime) +
                      ' ' +
                      format(new Date(list.endTime), 'dd.MM.yyyy')
                    }
                    text={formatMessage(m.collectionTitle)}
                    cta={
                      new Date(list.endTime) > new Date()
                        ? {
                            label: formatMessage(m.viewList),
                            variant: 'text',
                            icon: 'arrowForward',
                            onClick: () => {
                              navigate(
                                SignatureCollectionPaths.ViewList.replace(
                                  ':id',
                                  list.id,
                                ),
                              )
                            },
                          }
                        : undefined
                    }
                    tag={
                      new Date(list.endTime) < new Date()
                        ? {
                            label: formatMessage(m.collectionClosed),
                            variant: 'red',
                            outlined: true,
                          }
                        : undefined
                    }
                    progressMeter={{
                      currentProgress: Number(list.numberOfSignatures),
                      maxProgress: list.area.min,
                      withLabel: true,
                    }}
                  />
                )
              })}
            </Stack>
          </Box>
          {listsForOwner?.length > 0 &&
            !user?.profile.actor &&
            currentCollection.isActive && (
              <CancelCollection collectionId={currentCollection?.id} />
            )}
        </Box>
      ) : (
        <Skeleton />
      )}
    </Box>
  )
}

export default OwnerView
