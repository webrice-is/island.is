import { EmptyList, Heading, ListButton, TopLine } from '@ui'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import {
  Animated,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  View,
} from 'react-native'
import { NavigationFunctionComponent } from 'react-native-navigation'
import { useNavigationComponentDidAppear } from 'react-native-navigation-hooks'
import illustrationSrc from '../../assets/illustrations/le-company-s3.png'
import { BottomTabsIndicator } from '../../components/bottom-tabs-indicator/bottom-tabs-indicator'
import {
  Application,
  SearchArticleFragmentFragment,
  SearchableContentTypes,
  useListApplicationsQuery,
  useListSearchQuery,
} from '../../graphql/types/schema'
import { createNavigationOptionHooks } from '../../hooks/create-navigation-option-hooks'
import { useConnectivityIndicator } from '../../hooks/use-connectivity-indicator'
import { useBrowser } from '../../lib/use-browser'
import { getApplicationOverviewUrl } from '../../utils/applications-utils'
import { testIDs } from '../../utils/test-ids'
import { ApplicationsModule } from '../home/applications-module'
import { isIos } from '../../utils/devices'

type ListItem =
  | { id: string; __typename: 'Skeleton' }
  | SearchArticleFragmentFragment

const { useNavigationOptions, getNavigationOptions } =
  createNavigationOptionHooks(
    (theme, intl, initialized) => ({
      topBar: {
        title: {
          text: intl.formatMessage({ id: 'applications.title' }),
        },
        searchBar: {
          visible: false,
        },
      },
      bottomTab: {
        iconColor: theme.color.blue400,
        text: initialized
          ? intl.formatMessage({ id: 'applications.bottomTabText' })
          : '',
      },
    }),
    {
      topBar: {
        largeTitle: {
          visible: true,
        },
        scrollEdgeAppearance: {
          active: true,
          noBorder: true,
        },
      },
      bottomTab: {
        testID: testIDs.TABBAR_TAB_APPLICATION,
        iconInsets: {
          bottom: -4,
        },
        icon: require('../../assets/icons/tabbar-applications.png'),
        selectedIcon: require('../../assets/icons/tabbar-applications-selected.png'),
      },
    },
  )

export const ApplicationsScreen: NavigationFunctionComponent = ({
  componentId,
}) => {
  useNavigationOptions(componentId)
  const { openBrowser } = useBrowser()
  const flatListRef = useRef<FlatList>(null)
  const [refetching, setRefetching] = useState(false)
  const intl = useIntl()
  const scrollY = useRef(new Animated.Value(0)).current
  const [hiddenContent, setHiddenContent] = useState(isIos)

  const res = useListSearchQuery({
    variables: {
      input: {
        queryString: '*',
        types: [SearchableContentTypes.WebArticle],
        contentfulTags: ['umsokn'],
        size: 100,
        page: 1,
      },
    },
  })

  const applicationsRes = useListApplicationsQuery()

  useConnectivityIndicator({
    componentId,
    refetching,
    queryResult: [applicationsRes, res],
  })

  useNavigationComponentDidAppear(() => {
    setHiddenContent(false)
  }, componentId)

  const data = useMemo<ListItem[]>(() => {
    if (!res.data && res.loading) {
      return Array.from({ length: 8 }).map((_, id) => ({
        __typename: 'Skeleton',
        id: id.toString(),
      }))
    }

    const articles = [
      ...(res?.data?.searchResults?.items ?? []),
    ] as SearchArticleFragmentFragment[]

    return articles.sort((a, b) => a.title.localeCompare(b.title))
  }, [res.data, res.loading])

  const renderItem = useCallback(
    ({ item }: { item: ListItem; index: number }) => {
      if (item.__typename === 'Skeleton') {
        return <ListButton title="skeleton" isLoading />
      }
      if (item.__typename === 'Article') {
        return (
          <ListButton
            key={item.id}
            title={item.title}
            onPress={() =>
              openBrowser(getApplicationOverviewUrl(item), componentId)
            }
          />
        )
      }
      return null
    },
    [],
  )

  const keyExtractor = useCallback((item: ListItem) => item.id, [])

  const onRefresh = useCallback(async () => {
    setRefetching(true)

    try {
      await res.refetch()
    } catch (e) {
      // noop
    } finally {
      setRefetching(false)
    }
  }, [applicationsRes])

  // Fix for a bug in react-native-navigation where the large title is not visible on iOS with bottom tabs https://github.com/wix/react-native-navigation/issues/6717
  if (hiddenContent) {
    return null
  }

  return (
    <>
      <Animated.FlatList
        ref={flatListRef}
        testID={testIDs.SCREEN_APPLICATIONS}
        scrollEventThrottle={16}
        scrollToOverflowEnabled={true}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: true,
          },
        )}
        keyExtractor={keyExtractor}
        keyboardDismissMode="on-drag"
        data={data}
        ListEmptyComponent={
          <View style={{ marginTop: 80, paddingHorizontal: 16 }}>
            <EmptyList
              title={intl.formatMessage({ id: 'applications.emptyListTitle' })}
              description={intl.formatMessage({
                id: 'applications.emptyListDescription',
              })}
              image={
                <Image
                  source={illustrationSrc}
                  style={{ height: 176, width: 134 }}
                />
              }
            />
          </View>
        }
        renderItem={renderItem}
        ListHeaderComponent={
          <View style={{ flex: 1 }}>
            <ApplicationsModule
              {...applicationsRes}
              componentId={componentId}
              hideAction={true}
              hideSeeAllButton={true}
            />
            <SafeAreaView style={{ marginHorizontal: 16 }}>
              <Heading>
                {intl.formatMessage({ id: 'home.allApplications' })}
              </Heading>
            </SafeAreaView>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refetching} onRefresh={onRefresh} />
        }
      />
      <BottomTabsIndicator index={3} total={5} />
      <TopLine scrollY={scrollY} />
    </>
  )
}

ApplicationsScreen.options = getNavigationOptions
