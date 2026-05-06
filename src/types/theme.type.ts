import type { ThemeName } from './user.type'

export interface ThemePreset {
  name: ThemeName
  labelKey: string
  swatches: [string, string, string]
}

export const themePresets: ThemePreset[] = [
  {
    name: 'violet-bloom',
    labelKey: 'themes.violet-bloom',
    swatches: ['#7033ff', '#e2ebff', '#fdfdfd']
  },
  {
    name: 'default',
    labelKey: 'themes.default',
    swatches: ['#18181b', '#f4f4f5', '#ffffff']
  },
  {
    name: 'vercel',
    labelKey: 'themes.vercel',
    swatches: ['#000000', '#f5f5f5', '#ffffff']
  },
  {
    name: 'twitter',
    labelKey: 'themes.twitter',
    swatches: ['#1e9df1', '#e3ecf6', '#ffffff']
  },
  {
    name: 'tangerine',
    labelKey: 'themes.tangerine',
    swatches: ['#e05d38', '#d6e4f0', '#e8ebed']
  },
  {
    name: 't3-chat',
    labelKey: 'themes.t3-chat',
    swatches: ['#a84370', '#f1c4e6', '#faf5fa']
  },
  {
    name: 'supabase',
    labelKey: 'themes.supabase',
    swatches: ['#72e3ad', '#ededed', '#fcfcfc']
  },
  {
    name: 'solar-dusk',
    labelKey: 'themes.solar-dusk',
    swatches: ['#b45309', '#f2daba', '#fdfbf7']
  },
  {
    name: 'mono',
    labelKey: 'themes.mono',
    swatches: ['#737373', '#f5f5f5', '#ffffff']
  },
  {
    name: 'doom-64',
    labelKey: 'themes.doom-64',
    swatches: ['#b71c1c', '#4682b4', '#cccccc']
  }
]
