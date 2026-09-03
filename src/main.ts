/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Composables
import { createApp } from 'vue'

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

// Styles — self-hosted Open Sans, Latin subset only (see DESIGN.md: no Google Fonts CDN, must work offline)
import '@fontsource/open-sans/latin-400.css'
import '@fontsource/open-sans/latin-500.css'
import '@fontsource/open-sans/latin-600.css'
import '@fontsource/open-sans/latin-700.css'
import './styles/global.css'
import './plugins/chartSetup'

const app = createApp(App)

registerPlugins(app)

app.mount('#app')
