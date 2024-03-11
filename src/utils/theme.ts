  import { NConfigProvider, GlobalThemeOverrides } from 'naive-ui'

const themeOverride:GlobalThemeOverrides = {
  "common": {
    "primaryColor": "#4d75a1FF",
    "primaryColorHover": "#6087b3FF",
    "primaryColorPressed": "#2e6196FF",
    "primaryColorSuppl": "rgba(25, 78, 137, 0.97)"
  },
  "Radio": {
    "buttonColorActive": "#4d75a1FF",
    "buttonTextColorActive": "#FFFFFF"
  },
  "Form":{
    "labelFontSizeLeftLarge": "18px",
    // "labelFontSizeLeftMedium": "16px",
    // "labelFontSizeLeftSmall": "14px",
    // "labelFontSizeRightLarge": "18px",
    // "labelFontSizeRightMedium": "16px",
    // "labelFontSizeRightSmall": "14px"
  }
}

export { themeOverride }