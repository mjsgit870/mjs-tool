import { Button, Card, Input, Paper, createTheme } from '@mantine/core'
import inputClasses from './inputs.module.css'

// Tema global aplikasi: modern tapi kalem.
// - Inter Variable: satu file font untuk semua weight
// - primary indigo: netral, cocok disandingkan aksen tiap tool (orange/teal)
// - radius md default: semua komponen konsisten tanpa set manual
// - cursor pointer: elemen interaktif terasa bisa diklik
// - input ala shadcn: border halus, fokus border menyala + ring lembut
const fontStack =
  "'Inter Variable', Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

export const theme = createTheme({
  fontFamily: fontStack,
  headings: {
    fontFamily: fontStack,
    fontWeight: '650',
  },
  primaryColor: 'indigo',
  defaultRadius: 'md',
  cursorType: 'pointer',
  components: {
    Button: Button.extend({
      defaultProps: { radius: 'md', fw: 600 },
    }),
    Card: Card.extend({
      defaultProps: { withBorder: true, shadow: 'xs' },
    }),
    Paper: Paper.extend({
      defaultProps: { withBorder: true, radius: 'md' },
    }),
    Input: Input.extend({
      classNames: { input: inputClasses.input },
    }),
  },
})
