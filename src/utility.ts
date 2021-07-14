import { Feature, Point } from "geojson";
import {
  CircleLayer,
  CirclePaint,
  Map as maplibreMap,
  Popup,
  SymbolLayer,
} from "maplibre-gl";

type Latitude = number;
type Longitude = number;

type Coordinates = [Latitude, Longitude];

const COLOR_BLUE = "#51bbd6";
const COLOR_YELLOW = "#f1f075";
const COLOR_PINK = "#f28cb1";
const COLOR_PURPLE = "#4668F2";
const COLOR_WHITE = "#fff";

const FONT_1 = "DIN Offc Pro Medium";
const FONT_2 = "Arial Unicode MS Bold";

export interface DrawPointsOptions {
  cluster?: true;
  clusterMaxZoom?: number;
  clusterRadius?: number;
  showCount?: boolean;
  clusterPaint?: Record<string, unknown>;
  unclusteredPaint?: Record<string, unknown>;
  symbolLayout?: Record<string, unknown>;
  showMarkerPopup?: boolean;
  popupRender?: (selectedFeature: Feature) => string;
}

export interface DrawPointsOutput {
  sourceId: string;
  clusterLayerId: string;
  clusterSymbolLayerId?: string;
  unclusteredLayerId: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isCoordinatesArray(array: unknown): array is Coordinates[] {
  return Array.isArray(array[0]) && typeof array[0][0] === "number";
}

export function drawPoints(
  sourceName: string,
  data: Coordinates[] | Feature[],
  map: maplibreMap,
  drawOptions?: DrawPointsOptions
): DrawPointsOutput {
  const options: DrawPointsOptions = {
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 50,
    showCount: false,
    showMarkerPopup: false,
    popupRender: (selectedFeature: Feature) => {
      const coordinates = (selectedFeature.geometry as Point).coordinates;
      return "coordinates: " + coordinates;
    },
    ...drawOptions,
  };

  /**
   * Convert data passed in as coordinates into features
   */
  let features;
  if (isCoordinatesArray(data)) {
    features = data.map((point) => {
      return {
        type: "Feature",
        geometry: { type: "Point", coordinates: point },
      };
    });
  } else {
    features = data;
  }

  /**
   * Data source for features
   */
  const sourceId = `${sourceName}-source-points`;
  map.addSource(sourceId, {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features,
    },
    cluster: options.cluster,
    clusterMaxZoom: options.clusterMaxZoom,
    clusterRadius: options.clusterRadius,
  });

  /**
   * Draw ui layers for source data
   */
  const { clusterLayerId, clusterSymbolLayerId } = drawClusterLayer(
    sourceId,
    map,
    options
  );
  const { unclusteredLayerId } = drawUnclusteredLayer(sourceId, map, options);

  return { sourceId, unclusteredLayerId, clusterLayerId, clusterSymbolLayerId };
}

function drawClusterLayer(
  sourceName: string,
  map: maplibreMap,
  options: DrawPointsOptions
): { clusterLayerId: string; clusterSymbolLayerId: string } {
  const clusterLayerId = `${sourceName}-layer-clusters`;
  const clusterSymbolLayerId = `${sourceName}-layer-cluster-count`;

  // Use step expressions for clusters (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
  const paintOptions: CirclePaint = {
    "circle-color": [
      "step",
      ["get", "point_count"],
      COLOR_BLUE, // 20px circles when point count is less than 100
      100,
      COLOR_YELLOW, // 30px circles when point count is between 100 and 750
      750,
      COLOR_PINK, // 40px circles when point count is greater than or equal to 750
    ],
    "circle-radius": ["step", ["get", "point_count"], 20, 100, 30, 750, 40],
    ...options.clusterPaint,
  };
  const defaultClusterLayer: CircleLayer = {
    id: clusterLayerId,
    type: "circle",
    source: sourceName,
    filter: ["has", "point_count"],
    paint: paintOptions,
  };
  map.addLayer({
    ...defaultClusterLayer,
  });

  /**
   * Symbol Layer for cluster point count
   */
  if (options.showCount) {
    const layoutOptions = {
      "text-field": "{point_count_abbreviated}",
      "text-font": [FONT_1, FONT_2],
      "text-size": 12,
      ...options.symbolLayout,
    };
    const defaultClusterCount: SymbolLayer = {
      id: clusterSymbolLayerId,
      type: "symbol",
      source: sourceName,
      filter: ["has", "point_count"],
      layout: layoutOptions,
    };

    map.addLayer({
      ...defaultClusterCount,
    });
  }

  return { clusterLayerId, clusterSymbolLayerId };
}

function drawUnclusteredLayer(
  sourceName: string,
  map: maplibreMap,
  options: DrawPointsOptions
): { unclusteredLayerId: string } {
  const unclusteredLayerId = `${sourceName}-layer-unclustered-point`;
  const paintOptions = {
    "circle-color": COLOR_PURPLE,
    "circle-radius": 16,
    "circle-stroke-width": 4,
    "circle-stroke-color": COLOR_WHITE,
    ...options.unclusteredPaint,
  };
  const defaultUnclusteredPoint: CircleLayer = {
    id: unclusteredLayerId,
    type: "circle",
    source: sourceName,
    filter: ["!", ["has", "point_count"]],
    paint: paintOptions,
  };
  map.addLayer({ ...defaultUnclusteredPoint });

  if (options.showMarkerPopup) {
    map.on("click", unclusteredLayerId, function (e) {
      const selectedFeature = e.features[0];
      const coordinates = (selectedFeature.geometry as Point).coordinates;

      new Popup()
        .setLngLat(coordinates as [number, number])
        .setHTML(options.popupRender(selectedFeature))
        .addTo(map);
    });
  }

  return { unclusteredLayerId };
}
