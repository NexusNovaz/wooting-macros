import {
  createMultiStyleConfigHelpers,
  StyleFunctionProps
} from '@chakra-ui/styled-system'
import { mode } from '@chakra-ui/theme-tools'

const helpers = createMultiStyleConfigHelpers([
  'button',
  'list',
  'item',
  'groupTitle',
  'command',
  'divider'
])

export const Menu = helpers.defineMultiStyleConfig({
  variants: {
    brand: (props: StyleFunctionProps) => ({
      button: {},
      list: {
        bg: mode('stone.200', 'zinc.800')(props),
        borderColor: mode('stone.500', 'zinc.500')(props)
      },
      item: {
        bg: mode('stone.200', 'zinc.800')(props),
        color: mode('darkGray', 'offWhite')(props),
        _hover: { bg: mode('stone.300', 'zinc.700')(props) }
      },
      groupTitle: { color: mode('darkGray', 'offWhite')(props) },
      command: {},
      divider: { bg: mode('stone.500', 'zinc.500')(props) }
    })
  }
})