import { style } from 'treat'
import * as theme from '../../theme/theme'

export const container = style({
  height: theme.headerHeight,
  display: 'flex',
  alignItems: 'center',
  borderBottom: `1px solid ${theme.blue200}`,
})
