import React from 'react'

import {
  Box,
  Divider,
  GridColumn,
  GridRow,
  Table as T,
  Stack,
  Text,
  LoadingDots,
  AlertMessage,
} from '@island.is/island-ui/core'
import {
  NotFound,
  ServicePortalModuleComponent,
  UserInfoLine,
} from '@island.is/service-portal/core'
import isNumber from 'lodash/isNumber'
import { useLocale, useNamespaces } from '@island.is/localization'
import { amountFormat } from '@island.is/service-portal/core'
import { useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import { GET_USERS_VEHICLE_DETAIL } from '../../queries/getUsersVehicleDetail'
import {
  VehiclesCurrentOwnerInfo,
  Query,
  VehiclesOperator,
} from '@island.is/api/schema'
import { messages } from '../../lib/messages'
import BaseInfoItem from '../../components/DetailTable/BaseInfoItem'
import RegistrationInfoItem from '../../components/DetailTable/RegistrationInfoItem'
import OwnerInfoItem from '../../components/DetailTable/OwnerInfoItem'
import InspectionInfoItem from '../../components/DetailTable/InspectionInfoItem'
import TechnicalInfoItem from '../../components/DetailTable/TechnicalInfoItem'
import OwnersTable from '../../components/DetailTable/OwnersTable'
import OperatorInfoItem from '../../components/DetailTable/OperatorInfoItem'
import CoOwnerInfoItem from '../../components/DetailTable/CoOwnerInfoItem'
import FeeInfoItem from '../../components/DetailTable/FeeInfoItem'
import { displayWithUnit } from '../../utils/displayWithUnit'

const VehicleDetail: ServicePortalModuleComponent = () => {
  useNamespaces('sp.vehicles')
  const { formatMessage } = useLocale()
  const { id }: { id: string | undefined } = useParams()

  const { data, loading, error } = useQuery<Query>(GET_USERS_VEHICLE_DETAIL, {
    variables: {
      input: {
        regno: '',
        permno: id,
        vin: '',
      },
    },
  })

  const {
    mainInfo,
    basicInfo,
    registrationInfo,
    currentOwnerInfo,
    inspectionInfo,
    technicalInfo,
    ownersInfo,
    operators,
    coOwners,
  } = data?.vehiclesDetail || {}

  const year = mainInfo?.year ? `(${mainInfo.year})` : ''
  const color = registrationInfo?.color ? `- ${registrationInfo.color}` : ''
  const noInfo = data?.vehiclesDetail === null

  if ((error || noInfo) && !loading) {
    return <NotFound title={formatMessage(messages.notFound)} />
  }

  return (
    <>
      <Box marginBottom={6}>
        <GridRow>
          <GridColumn span={['12/12', '12/12', '6/8', '6/8']}>
            <Stack space={2}>
              <Text variant="h3" as="h1">
                {loading ? (
                  <LoadingDots />
                ) : (
                  [mainInfo?.model, mainInfo?.subModel, year, color]
                    .filter(Boolean)
                    .join(' ')
                )}
              </Text>
            </Stack>
            {inspectionInfo?.inspectionFine &&
            inspectionInfo.inspectionFine > 0 ? (
              <Box marginTop={5}>
                <AlertMessage
                  type="warning"
                  title={formatMessage(messages.negligence)}
                  message={formatMessage(messages.negligenceText)}
                />
              </Box>
            ) : null}
          </GridColumn>
        </GridRow>
      </Box>
      <Stack space={2}>
        <UserInfoLine
          label={formatMessage(messages.numberPlate)}
          content={mainInfo?.regno ?? ''}
          loading={loading}
        />
        <Divider />
        <UserInfoLine
          label={formatMessage(messages.trailerWithBrakes)}
          content={displayWithUnit(
            mainInfo?.trailerWithBrakesWeight?.toString(),
            'kg',
          )}
          loading={loading}
        />
        <Divider />
        <UserInfoLine
          label={formatMessage(messages.trailerWithoutBrakes)}
          content={displayWithUnit(
            mainInfo?.trailerWithoutBrakesWeight?.toString(),
            'kg',
          )}
          loading={loading}
        />
        <Divider />

        {/* <UserInfoLine
          label={formatMessage(messages.insured)}
          content={
            inspectionInfo?.insuranceStatus === true
              ? formatMessage(messages.yes)
              : inspectionInfo?.insuranceStatus === false
              ? formatMessage(messages.no)
              : ''
          }
          warning={inspectionInfo?.insuranceStatus === false}
          loading={loading}
        />
        <Divider /> */}

        <UserInfoLine
          label={formatMessage(messages.unpaidVehicleFee)}
          content={
            isNumber(inspectionInfo?.carTax)
              ? amountFormat(Number(inspectionInfo?.carTax))
              : ''
          }
          loading={loading}
          tooltip={formatMessage(messages.unpaidVehicleFeeText)}
        />
        <Divider />

        {mainInfo?.co2 && (
          <>
            <UserInfoLine
              label={formatMessage(messages.nedc)}
              content={displayWithUnit(String(mainInfo.co2), 'g/km')}
              loading={loading}
            />
            <Divider />
          </>
        )}

        {mainInfo?.weightedCo2 && (
          <>
            <UserInfoLine
              label={formatMessage(messages.nedcWeighted)}
              content={displayWithUnit(String(mainInfo.weightedCo2), 'g/km')}
              loading={loading}
            />
            <Divider />
          </>
        )}

        {mainInfo?.co2Wltp && (
          <>
            <UserInfoLine
              label={formatMessage(messages.wltp)}
              content={displayWithUnit(String(mainInfo.co2Wltp), 'g/km')}
              loading={loading}
            />
            <Divider />
          </>
        )}

        {mainInfo?.weightedCo2Wltp && (
          <>
            <UserInfoLine
              label={formatMessage(messages.wltpWeighted)}
              content={displayWithUnit(
                String(mainInfo.weightedCo2Wltp),
                'g/km',
              )}
              loading={loading}
            />
            <Divider />
          </>
        )}
      </Stack>
      <Box marginBottom={5} />
      {basicInfo && <BaseInfoItem data={basicInfo} />}
      {registrationInfo && <RegistrationInfoItem data={registrationInfo} />}
      {currentOwnerInfo && <OwnerInfoItem data={currentOwnerInfo} />}
      {coOwners &&
        coOwners.length > 0 &&
        coOwners.map((owner: VehiclesCurrentOwnerInfo, index) => (
          <CoOwnerInfoItem key={index} data={owner} />
        ))}
      {inspectionInfo && <InspectionInfoItem data={inspectionInfo} />}
      {inspectionInfo && <FeeInfoItem data={inspectionInfo} />}
      {technicalInfo && <TechnicalInfoItem data={technicalInfo} />}
      {operators &&
        operators.length > 0 &&
        operators.map((operator: VehiclesOperator, index) => (
          <OperatorInfoItem key={index} data={operator} />
        ))}
      {ownersInfo && (
        <OwnersTable
          data={ownersInfo}
          title={formatMessage(messages.ownersTitle)}
        />
      )}
      <Box paddingTop={4}>
        <Text variant="small">{formatMessage(messages.infoNote)}</Text>
      </Box>
    </>
  )
}

export default VehicleDetail
