import { Feature } from "geojson";

export type Latitude = number;
export type Longitude = number;

export type Coordinates = [Longitude, Latitude];

export type LinearRing = Coordinates[]; // Array of 4 or more coordinates, where the first and last coordinate are the same to form a closed boundary
export type Polygon = LinearRing[]; // An array of one or more linear rings, this allows shapes where there are holes in the middle
export type PolygonGeometry = { polygon: Polygon };
export type Geofence = { geofenceId: string; geometry: PolygonGeometry };

export type NamedLocation = {
  coordinates: Coordinates;
  title?: string;
  address?: string;
};

/**
 * @param {string} defaultColor Default: #5d8aff, color of a point
 * @param {string} defaultBorderColor Default: #fff, color of the points border
 * @param {number} defaultBorderWidth Default: 2, pixel width of border around point
 * @param {string} selectedColor Default: #ff9900, color of a point after it has been selected
 * @param {number} selectedBorderWidth Default: 2, pixel width of border around point
 * @param {boolean} showMarkerPopup Default: false, determines whether to show a popup on selection
 * @param {string} popupBackgroundColor Default: #fff, color of the popup background
 * @param {string} popupBorderColor Default: #0000001f, color of the popup border
 * @param {number} popupBorderWidth Default: 2, pixel width of border
 * @param {number} popupBorderRadius Default: 4, pixel border radius
 * @param {number} popupPadding Default: 20, padding of the popup
 * @param {string} popupFontColor Default: #000, font color in the border
 * @param {function} popupRender Override the default popup render function with fn that returns any html. The default render function uses the Carmen GeoJSON place_name attribute to construct a popup
 * @param {callback} onClick Function that is called when clicking on the unclustered layer
 */
export interface UnclusteredOptions {
  defaultColor?: string;
  defaultBorderColor?: string;
  defaultBorderWidth?: number;
  selectedColor?: string;
  selectedBorderColor?: string;
  selectedBorderWidth?: number;
  showMarkerPopup?: boolean;
  popupBackgroundColor?: string;
  popupBorderColor?: string;
  popupBorderWidth?: number;
  popupBorderRadius?: number;
  popupPadding?: number;
  popupFontColor?: string;
  popupTitleFontWeight?: string;
  popupRender?: (selectedFeature: Feature) => string;
  onClick?: (e: maplibregl.MapMouseEvent) => void;
}

/**
 * @param {boolean} clusterMaxZoom Default: 14, the max zoom level at which clustering is enabled
 * @param {boolean} showCount Default: false, determines whether to show the count for the number of points aggregated by a cluster
 * @param {String} fillColor Default: #5d8aff, the color of the cluster
 * @param {number} borderWidth Default: 4, pixel width of the border around a cluster
 * @param {String} borderColor Default: #fff, border color around a cluster
 * @param {String} fontColor Default: #fff, text color when showing the count for a cluster
 * @param {number} smThreshold Default: 50, the upper threshold for the small cluster
 * @param {number} smCircleSize Default: 60, the pixel size for the small cluster
 * @param {number} mdThreshold Default: 100, the upper threshold for the medium cluster
 * @param {number} mdCircleSize Default: 100, the pixel size for the medium cluster
 * @param {number} lgThreshold Default: 500, the upper threshold for the large cluster
 * @param {number} lgCircleSize Default: 140, the pixel size for the large cluster
 * @param {number} xlCircleSize Default: 180, the pixel size for the extra large cluster
 * @param {callback} onClick Function that is called when a cluster is clicked
 * @param {number} clusterPaint Maplibre paint object to completely override the cluster layers paint
 * @param {number} clusterCountLayout Maplibre layer object to override the cluster counter layer
 */
export interface ClusterOptions {
  clusterMaxZoom?: number;
  showCount?: boolean;
  fillColor?: string;
  borderWidth?: number;
  borderColor?: string;
  fontColor?: string;
  smThreshold?: number;
  smCircleSize?: number;
  mdThreshold?: number;
  mdCircleSize?: number;
  lgThreshold?: number;
  lgCircleSize?: number;
  xlCircleSize?: number;
  onClick?: (e: maplibregl.MapMouseEvent) => void;
  clusterPaint?: Record<string, unknown>;
  clusterCountLayout?: Record<string, unknown>;
}

export interface PopupRenderFunction {
  (selectedFeature: Feature): string;
}

export interface ImageMarker {
  width: number;
  height: number;
  data: Uint8Array;
  onAdd: () => void;
  render: () => boolean;
}

export interface CreateMarkerOptions {
  fillColor?: string;
  strokeColor?: string;
  lineWidth?: number;
}
