import { Feature } from "geojson";
import { Map as maplibreMap } from "maplibre-gl";
import { isGeofence } from "./utils";
import { Geofence, Polygon } from "./types";

/**
 */
export interface DrawGeofencesOptions {
  fillColor?: string;
  fillOpacity?: number;
  borderColor?: string;
  borderWidth?: number;
}

export interface DrawGeofencesOutput {
  sourceId: string;
  outlineLayerId: string;
  fillLayerId: string;
  show: () => void;
  hide: () => void;
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

  /*
   * Convert data passed in as coordinates into features
   */
  const features = getGeofenceFeaturesFromData(data);

  /*
   * Data source for features
   */
  const sourceId = `${sourceName}-source`;
  map.addSource(sourceId, {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features,
    },
    generateId: true,
  });

  /*
   * Draw ui layers for source data
   */
  // Add a new layer to visualize the polygon.
  const fillLayerId = `${sourceName}-fill-layer`;
  map.addLayer({
    id: fillLayerId,
    type: "fill",
    source: sourceId, // reference the data source
    layout: {
      visibility: "visible",
    },
    paint: {
      "fill-color": "black", // black color fill
      "fill-opacity": 0.3,
    },
  });

  // Add a black outline around the polygon.
  const outlineLayerId = `${sourceName}-outline-layer`;
  map.addLayer({
    id: outlineLayerId,
    type: "line",
    source: sourceId,
    layout: {
      visibility: "visible",
    },
    paint: {
      "line-color": "black",
      "line-opacity": 0.5,
      "line-width": 4,
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

  return { sourceId, outlineLayerId, fillLayerId, show, hide };
}

const getGeofenceFeaturesFromData = (
  data: Geofence[] | Polygon[]
): Feature[] => {
  const features: any = data.map((item: Geofence | Polygon) => {
    const coordinates = isGeofence(item) ? item.geometry.polygon : item;
    return {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates,
      },
      properties: {},
    };
  });
  return features;
};
