import { Field, ObjectType, ID } from '@nestjs/graphql'
import { ITabSection } from '../generated/contentfulTypes'
import { SystemMetadata } from '../types'
import { TabContent, mapTabContent } from './tabContent.model'

@ObjectType()
export class TabSection {
  @Field(() => ID)
  id: string

  @Field()
  title: string

  @Field(() => [TabContent])
  tabs: Array<TabContent>
}

export const mapTabSection = ({
  fields,
  sys,
}: ITabSection): SystemMetadata<TabSection> => ({
  typename: 'TabSection',
  id: sys.id,
  title: fields.title ?? '',
  tabs: (fields.tabs ?? []).map(mapTabContent),
})
