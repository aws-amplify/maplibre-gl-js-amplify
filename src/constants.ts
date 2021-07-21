export const COLOR_WHITE = "#fff";
export const COLOR_BLACK = "#000";
export const MARKER_COLOR = "#5d8aff";
export const ACTIVE_MARKER_COLOR = "#ff9900";
export const POPUP_BORDER_COLOR = "#0000001f";

// Map styles exist due to an issue with AWS Location Services not supporting the default set of maplibre fonts
export enum MAP_STYLES {
  ESRI_TOPOGRAPHIC = "VectorEsriTopographic",
  ESRI_STREETS = "VectorEsriStreets",
  ESRI_LIGHT_GRAY = "VectorEsriLightGrayCanvas",
  ESRI_DARK_GRAY = "VectorEsriDarkGrayCanvas",
  ESRI_NAVIGATION = "VectorEsriNavigation",
  HERE_BERLIN = "VectorHereBerlin",
}

export const FONT_DEFAULT_BY_STYLE = {
  [MAP_STYLES.ESRI_TOPOGRAPHIC]: "Noto Sans Regular",
  [MAP_STYLES.ESRI_STREETS]: "Arial Regular",
  [MAP_STYLES.ESRI_LIGHT_GRAY]: "Ubuntu Regular",
  [MAP_STYLES.ESRI_DARK_GRAY]: "Ubuntu Regular",
  [MAP_STYLES.ESRI_NAVIGATION]: "Arial Regular",
  [MAP_STYLES.HERE_BERLIN]: "Fira GO Regular",
};
