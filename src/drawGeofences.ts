import { GeoJSONSource, Map as maplibreMap } from "maplibre-gl";
import { Geofence, Polygon } from "./types";
import { COLOR_BLACK } from "./constants";
import { getGeofenceFeatureArray } from "./geofenceUtils";
import { isGeofenceArray, isPolygonArray } from "./utils";

const FILL_OPACITY = 0.3;
const BORDER_OPACITY = 0.5;
const BORDER_WIDTH = 4;

/**
 */
export interface DrawGeofencesOptions {
  fillColor?: string;
  fillOpacity?: number;
  borderColor?: string;
  borderWidth?: number;
  borderOpacity?: number;
  borderOffset?: number;
  visible?: boolean; // default true
}

export interface DrawGeofencesOutput {
  sourceId: string;
  outlineLayerId: string;
  fillLayerId: string;
  show: () => void;
  hide: () => void;
  isVisible: () => void;
  setData: (data) => void;
}

/**
 * DrawPoints utility function for adding points to a map based on coordinate data or a FeatureCollection. Will add clustered points and styled markers by default with options for popups and other styles
 */
export function drawGeofences(
  sourceName: string,
  data: Polygon[] | Geofence[],
  map: maplibreMap,
  options: DrawGeofencesOptions = {}
): DrawGeofencesOutput {
  if (
    !map ||
    typeof map.addSource !== "function" ||
    typeof map.addLayer !== "function"
  ) {
    throw new Error("Please use a maplibre map");
  }

  if (data.length > 0 && !isGeofenceArray(data) && !isPolygonArray(data)) {
    throw new Error(
      "Please pass in an array of Geofences or an array of Polygons"
    );
  }

  /*
   * Data source for features
   * Convert data passed in as coordinates into feature data
   */
  const sourceId = `${sourceName}`;
  map.addSource(sourceId, {
    type: "geojson",
    data: getGeofenceFeatureArray(data),
    generateId: true,
  });

  const initialVisiblity = options.visible ?? true ? "visible" : "none";

  /*
   * Draw ui layers for source data
   */
  const fillLayerId = `${sourceName}-fill-layer`;
  map.addLayer({
    id: fillLayerId,
    type: "fill",
    source: sourceId, // reference the data source
    layout: {
      visibility: initialVisiblity,
    },
    paint: {
      "fill-color": options.fillColor ?? COLOR_BLACK,
      "fill-opacity": options.fillOpacity ?? FILL_OPACITY,
    },
  });

  // Add a black outline around the polygon.
  const outlineLayerId = `${sourceName}-outline-layer`;
  map.addLayer({
    id: outlineLayerId,
    type: "line",
    source: sourceId,
    layout: {
      visibility: initialVisiblity,
    },
    paint: {
      "line-color": options.borderColor ?? COLOR_BLACK,
      "line-opacity": options.borderOpacity ?? BORDER_OPACITY,
      "line-width": options.borderWidth ?? BORDER_WIDTH,
      "line-offset":
        options.borderOffset ??
        ((options.borderWidth ?? BORDER_WIDTH) / 2) * -1,
    },
  });

  // utility function for setting layer visibility to none
  const hide = () => {
    map.setLayoutProperty(fillLayerId, "visibility", "none");
    map.setLayoutProperty(outlineLayerId, "visibility", "none");
  };

  // utility function for setting layer visibility to visible
  const show = () => {
    map.setLayoutProperty(fillLayerId, "visibility", "visible");
    map.setLayoutProperty(outlineLayerId, "visibility", "visible");
  };

  // utility function for checking layer visibility
  const isVisible = () => {
    const visibility = map.getLayoutProperty(fillLayerId, "visibility");
    return visibility === "visible";
  };

  // utility function for setting layer visibility to visible
  const setData = (data) => {
    (map.getSource(sourceId) as GeoJSONSource).setData(data);
  };

  return {
    sourceId,
    outlineLayerId,
    fillLayerId,
    show,
    hide,
    isVisible,
    setData,
  };
}
