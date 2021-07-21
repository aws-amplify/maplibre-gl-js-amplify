export const COLOR_WHITE = "#fff";
export const COLOR_BLACK = "#000";
export const MARKER_COLOR = "#5d8aff";
export const ACTIVE_MARKER_COLOR = "#ff9900";
export const POPUP_BORDER_COLOR = "#0000001f";

export enum AWS_MAP_STYLES {
  ESRI_TOPOGRAPHIC = "VectorEsriTopographic",
  ESRI_STREETS = "VectorEsriStreets",
  ESRI_LIGHT_GRAY = "VectorEsriLightGrayCanvas",
  ESRI_DARK_GRAY = "VectorEsriDarkGrayCanvas",
  ESRI_NAVIGATION = "VectorEsriNavigation",
  HERE_BERLIN = "VectorHereBerlin",
}

export const FONT_DEFAULT_BY_STYLE = {
  [AWS_MAP_STYLES.ESRI_TOPOGRAPHIC]: "Noto Sans Regular",
  [AWS_MAP_STYLES.ESRI_STREETS]: "Arial Regular",
  [AWS_MAP_STYLES.ESRI_LIGHT_GRAY]: "Ubuntu Regular",
  [AWS_MAP_STYLES.ESRI_DARK_GRAY]: "Ubuntu Regular",
  [AWS_MAP_STYLES.ESRI_NAVIGATION]: "Arial Regular",
  [AWS_MAP_STYLES.HERE_BERLIN]: "Fira GO Regular",
};
