// plugins/chartSetup.ts
//
// Chart.js renders to canvas and does not inherit page CSS — font must be set globally here
// (DESIGN.md font audit). Import once from main.ts before any chart mounts.
import {
  BarElement,
  CategoryScale,
  Chart,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler)
Chart.defaults.font.family = '"Open Sans", -apple-system, "Segoe UI", Roboto, sans-serif'
