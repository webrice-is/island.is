import { Label, VehicleCard } from '@ui'
import React from 'react'
import { FormattedDate, FormattedMessage } from 'react-intl'
import { SafeAreaView, TouchableHighlight, View, ViewStyle } from 'react-native'
import { useTheme } from 'styled-components/native'
import { ListVehiclesQuery } from '../../../graphql/types/schema'
import { navigateTo } from '../../../lib/deep-linking'

function differenceInMonths(a: Date, b: Date) {
  return a.getMonth() - b.getMonth() + 12 * (a.getFullYear() - b.getFullYear())
}

type VehicleListItem = NonNullable<
  NonNullable<ListVehiclesQuery['vehiclesList']>['vehicleList']
>[0]

export const VehicleItem = React.memo(
  ({
    item,
    minHeight,
    style,
  }: {
    item: VehicleListItem
    index: number
    minHeight?: number
    style?: ViewStyle
  }) => {
    const theme = useTheme()
    const nextInspection = item?.nextInspection?.nextInspectionDate
      ? new Date(item?.nextInspection.nextInspectionDate)
      : null

    const isInspectionDeadline =
      (nextInspection
        ? differenceInMonths(new Date(nextInspection), new Date())
        : 0) < 0

    const isMileageRequired = item.requiresMileageRegistration

    return (
      <View style={{ paddingHorizontal: theme.spacing[2], ...style }}>
        <TouchableHighlight
          underlayColor={
            theme.isDark ? theme.shades.dark.shade100 : theme.color.blue100
          }
          style={{
            marginBottom: theme.spacing[2],
            borderRadius: theme.border.radius.extraLarge,
          }}
          onPress={() => {
            navigateTo(`/vehicle/`, {
              id: item.permno,
              title: item.type,
            })
          }}
        >
          <SafeAreaView>
            <VehicleCard
              title={item.type}
              color={item.color}
              number={item.regno}
              minHeight={minHeight}
              label={
                isInspectionDeadline && nextInspection ? (
                  <Label color="danger" icon>
                    <FormattedMessage
                      id="vehicles.nextInspectionLabel"
                      values={{
                        date: <FormattedDate value={nextInspection} />,
                      }}
                    />
                  </Label>
                ) : isMileageRequired ? (
                  <Label color="primary" icon>
                    <FormattedMessage id="vehicles.mileageRequired" />
                  </Label>
                ) : null
              }
            />
          </SafeAreaView>
        </TouchableHighlight>
      </View>
    )
  },
)
