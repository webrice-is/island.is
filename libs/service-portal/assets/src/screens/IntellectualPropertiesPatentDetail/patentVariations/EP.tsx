import { useLocale, useNamespaces } from '@island.is/localization'
import {
  UserInfoLine,
  formatDate,
  m as coreMessages,
} from '@island.is/service-portal/core'
import { IntellectualPropertiesPatentEp } from '@island.is/api/schema'
import { Stack, Text, Divider } from '@island.is/island-ui/core'
import { Problem } from '@island.is/react-spa/shared'
import { ipMessages } from '../../../lib/messages'
import { useMemo } from 'react'
import Timeline from '../../../components/Timeline/Timeline'
import { orderTimelineData } from '../../../utils/timelineMapper'
import { StackOrTableBlock } from '../../../components/StackOrTableBlock/StackOrTableBlock'
import { StackWithBottomDivider } from '../../../components/StackWithBottomDivider/StackWithBottomDivider'
import { AssetsPaths } from '../../../lib/paths'

interface Props {
  data: IntellectualPropertiesPatentEp
  loading?: boolean
}

const PatentEP = ({ data, loading }: Props) => {
  useNamespaces('sp.intellectual-property')
  const { formatMessage } = useLocale()

  const orderedDates = useMemo(() => {
    if (!data.lifecycle || !data.epLifecycle) {
      return []
    }
    return orderTimelineData([
      {
        date: data.epLifecycle.applicationDate ?? undefined,
        message: formatMessage(ipMessages.epApplication),
      },
      {
        date: data.epLifecycle.publishDate ?? undefined,
        message: formatMessage(
          ipMessages.epApplicationDatePublishedAsAvailable,
        ),
      },
      {
        date: data.lifecycle.expiryDate ?? undefined,
        message: formatMessage(coreMessages.validTo),
      },
    ])
  }, [formatMessage, data.lifecycle, data.epLifecycle])

  if (!data && !loading) {
    return <Problem type="no_data" />
  }

  const applicationLink = data?.epApplicationNumber
    ? parseInt(data.epApplicationNumber).toString()
    : ''

  return (
    <>
      <StackWithBottomDivider space="p2">
        <UserInfoLine
          title={formatMessage(ipMessages.baseInfo)}
          label={ipMessages.name}
          content={data.name ?? ''}
          loading={loading}
        />
        <UserInfoLine
          label={ipMessages.epApplicationDateShort}
          content={
            data.epLifecycle?.applicationDate
              ? formatDate(data.epLifecycle?.applicationDate)
              : undefined
          }
          loading={loading}
        />
        <UserInfoLine
          label={ipMessages.epApplicationDatePublishedAsAvailableShort}
          content={
            data.epLifecycle?.publishDate
              ? formatDate(data.epLifecycle?.publishDate)
              : undefined
          }
          loading={loading}
        />
        <UserInfoLine
          label={coreMessages.status}
          content={data.statusText ?? ''}
          loading={loading}
        />
        <UserInfoLine
          label={ipMessages.maxValidDate}
          content={
            data.lifecycle?.maxValidDate
              ? formatDate(data.lifecycle?.maxValidDate)
              : ''
          }
          loading={loading}
        />
        <UserInfoLine
          label={ipMessages.epoInfoLink}
          content={'European Patent Register'}
          editLink={{
            external: true,
            url: `https://register.epo.org/application?number=EP${applicationLink}`,
            title: formatMessage(coreMessages.view),
          }}
          loading={loading}
        />
        <UserInfoLine
          label={coreMessages.validTo}
          content={
            data.lifecycle?.expiryDate
              ? formatDate(data.lifecycle?.expiryDate)
              : ''
          }
          loading={loading}
        />
        <UserInfoLine
          label={ipMessages.titleInEnglish}
          content={data.nameInOrgLanguage ?? ''}
          loading={loading}
        />
        <UserInfoLine
          label={ipMessages.originalPatentLanguage}
          content={
            data.language === 'en'
              ? formatMessage(coreMessages.english)
              : formatMessage(coreMessages.icelandic)
          }
          loading={loading}
        />
      </StackWithBottomDivider>
      <Divider />
      {!loading && orderedDates?.length && (
        <Timeline
          box={{ marginY: [2, 2, 6] }}
          title={formatMessage(ipMessages.timeline)}
          maxDate={orderedDates[orderedDates.length - 1].date}
          minDate={orderedDates[0].date}
        >
          {orderedDates.map((datapoint) => (
            <Stack key="list-item-application-date" space="smallGutter">
              <Text variant="h5">{formatDate(datapoint.date)}</Text>
              <Text>{datapoint.message}</Text>
            </Stack>
          ))}
        </Timeline>
      )}
      <StackOrTableBlock
        entries={data?.owners ?? []}
        title={{
          singular: formatMessage(ipMessages.owner),
          plural: formatMessage(ipMessages.owners),
        }}
        columns={[
          {
            label: formatMessage(ipMessages.name),
            key: 'name',
          },
          {
            label: formatMessage(ipMessages.address),
            key: 'addressFull',
          },
        ]}
      />
      <StackOrTableBlock
        box={{ marginTop: [2, 2, 6] }}
        entries={data?.inventors ?? []}
        title={{
          singular: formatMessage(ipMessages.inventor),
          plural: formatMessage(ipMessages.inventors),
        }}
        columns={[
          {
            label: formatMessage(ipMessages.name),
            key: 'name',
          },
          {
            label: formatMessage(ipMessages.address),
            key: 'addressFull',
          },
        ]}
      />
      <StackOrTableBlock
        box={{ marginTop: [2, 2, 6] }}
        entries={
          data?.priorities?.map((p) => {
            return {
              number: p.number ?? '',
              date: p.applicationDate
                ? formatDate(new Date(p.applicationDate))
                : undefined,
              country: p.country.name ?? '',
            }
          }) ?? []
        }
        title={formatMessage(ipMessages.priority)}
        columns={[
          {
            label: formatMessage(coreMessages.number),
            key: 'number',
          },
          {
            label: formatMessage(coreMessages.date),
            key: 'date',
          },
          {
            label: formatMessage(ipMessages.country),
            key: 'country',
          },
        ]}
      />
      {data?.pct?.date && data?.pct?.number && (
        <StackOrTableBlock
          box={{ marginTop: [2, 2, 6] }}
          entries={data?.pct ? [data.pct] : []}
          title={formatMessage(ipMessages.internationalApplication)}
          columns={[
            {
              label: formatMessage(ipMessages.pctNumber),
              key: 'number',
            },
            {
              label: formatMessage(ipMessages.pctDate),
              key: 'date',
            },
          ]}
        />
      )}
      {data.spcNumbers?.[0] && (
        <>
          <UserInfoLine
            paddingY={[2, 2, 6]}
            title={formatMessage(ipMessages.supplementaryProtection)}
            label={formatMessage(ipMessages.spcNumber)}
            content={data.spcNumbers[0]}
            editLink={{
              external: true,
              url: AssetsPaths.AssetsIntellectualPropertiesPatent.replace(
                ':id',
                data.spcNumbers[0],
              ),
              title: formatMessage(coreMessages.view),
            }}
          />
          <Divider />
        </>
      )}
      <UserInfoLine
        paddingY={[2, 2, 6]}
        title={formatMessage(ipMessages.classification)}
        label={formatMessage(ipMessages.category)}
        content={data.classifications?.map((c) => c.category).join(', ')}
      />
      <Divider />
    </>
  )
}

export default PatentEP
