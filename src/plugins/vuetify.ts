/**
 * plugins/vuetify.ts
 *
 * Theme tokens are defined in DESIGN.md and must not be changed here without updating that file too.
 * Blue (primary) is the only brand/interactive hue; status-* tokens are the only colors used for
 * good/watch/critical meaning, always via StatusChip (never bare text/background elsewhere).
 */

import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

export default createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          'primary': '#1565C0',
          'primary-darken': '#0D47A1',
          'primary-lighten': '#E3F2FD',
          'secondary': '#0D47A1',
          'info': '#1565C0',
          'background': '#F5F7FA',
          'surface': '#FFFFFF',
          'on-background': '#212121',
          'on-surface': '#212121',
          'on-surface-variant': '#616161',
          'outline': '#E0E0E0',
          'success': '#2E7D32',
          'on-success': '#FFFFFF',
          'warning': '#FFD54F',
          'on-warning': '#3E2723',
          'error': '#C62828',
          'on-error': '#FFFFFF',
          'status-good': '#2E7D32',
          'status-good-subtle': '#E8F5E9',
          'status-good-subtle-text': '#1B5E20',
          'on-status-good': '#FFFFFF',
          'status-watch': '#FFD54F',
          'status-watch-text': '#3E2723',
          'status-critical': '#C62828',
          'status-critical-subtle': '#FFEBEE',
          'status-critical-subtle-text': '#B71C1C',
          'on-status-critical': '#FFFFFF',
        },
      },
      dark: {
        dark: true,
        colors: {
          'primary': '#90CAF9',
          'primary-darken': '#64B5F6',
          'primary-lighten': '#132A3E',
          'secondary': '#90CAF9',
          'info': '#90CAF9',
          'background': '#121212',
          'surface': '#1E1E1E',
          'on-background': '#E0E0E0',
          'on-surface': '#E0E0E0',
          'on-surface-variant': '#B0B0B0',
          'outline': '#3A3A3A',
          'success': '#81C784',
          'on-success': '#0D2610',
          'warning': '#FFD54F',
          'on-warning': '#3E2723',
          'error': '#E57373',
          'on-error': '#1A0000',
          'status-good': '#81C784',
          'status-good-subtle': '#1B3A20',
          'status-good-subtle-text': '#81C784',
          'on-status-good': '#0D2610',
          'status-watch': '#FFD54F',
          'status-watch-text': '#3E2723',
          'status-critical': '#E57373',
          'status-critical-subtle': '#3A1414',
          'status-critical-subtle-text': '#E57373',
          'on-status-critical': '#1A0000',
        },
      },
    },
  },
})
