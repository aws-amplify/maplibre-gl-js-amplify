import { Feature, Point } from "geojson";
import {
  CircleLayer,
  CirclePaint,
  GeoJSONSource,
  LngLatLike,
  Map as maplibreMap,
  Popup,
  SymbolLayer,
} from "maplibre-gl";

type Latitude = number;
type Longitude = number;

type Coordinates = [Latitude, Longitude];

const COLOR_WHITE = "#fff";
const MARKER_COLOR = "#5d8aff";
const ACTIVE_MARKER_COLOR = "#ff9900";

const FONT_1 = "DIN Offc Pro Medium";
const FONT_2 = "Arial Unicode MS Bold";

interface UnclusteredMarkerOptions {
  color?: string;
  borderColor?: string;
  borderWidth?: string;
  selectedColor?: string;
  selectedBorderColor?: string;
  selectedBorderWidth?: string;
  showMarkerPopup?: boolean;
  popupRender?: (selectedFeature: Feature) => string;
}

interface ClusterOptions {
  clusterMaxZoom?: number;
  clusterRadius?: number;
  showCount?: boolean;
  clusterPaint?: Record<string, unknown>;
  clusterCountLayout?: Record<string, unknown>;
}

export interface DrawPointsOptions {
  showCluster?: boolean;
  clusterOptions?: ClusterOptions;
  unclusteredMarker?: UnclusteredMarkerOptions;
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
  drawOptions: DrawPointsOptions
): DrawPointsOutput {
  const {
    showCluster,
    clusterOptions = {},
    unclusteredMarker = {},
  } = drawOptions;
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
    cluster: showCluster || false,
    clusterMaxZoom: clusterOptions.clusterMaxZoom || 14,
    clusterRadius: clusterOptions.clusterRadius || 50,
    generateId: true,
  });

  /**
   * Draw ui layers for source data
   */
  let clusterLayerId: string, clusterSymbolLayerId: string;
  if (showCluster) {
    ({ clusterLayerId, clusterSymbolLayerId } = drawClusterLayer(
      sourceId,
      map,
      clusterOptions
    ));
  }

  const { unclusteredLayerId } = drawUnclusteredLayer(
    sourceId,
    map,
    unclusteredMarker || {}
  );

  return { sourceId, unclusteredLayerId, clusterLayerId, clusterSymbolLayerId };
}

function drawClusterLayer(
  sourceName: string,
  map: maplibreMap,
  options: ClusterOptions
): { clusterLayerId: string; clusterSymbolLayerId: string } {
  const clusterLayerId = `${sourceName}-layer-clusters`;
  const clusterSymbolLayerId = `${sourceName}-layer-cluster-count`;

  // Use step expressions for clusters (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
  const paintOptions: CirclePaint = {
    "circle-color": [
      "step",
      ["get", "point_count"],
      MARKER_COLOR, // 60px circles when point count is less than 50
      50,
      MARKER_COLOR, // 100px circles when point count is between 50 and 100
      100,
      MARKER_COLOR, // 140px circles when point count is between 100 and 500
      500,
      MARKER_COLOR, // 180px circles when point count is greater than 500
    ],
    "circle-radius": [
      "step",
      ["get", "point_count"],
      60,
      50,
      100,
      100,
      140,
      500,
      180,
    ],
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

  // Inspect a cluster on click
  map.on("click", clusterLayerId, function (e) {
    const features = map.queryRenderedFeatures(e.point, {
      layers: [clusterLayerId],
    });
    const clusterId = features[0].properties.cluster_id;
    (map.getSource(sourceName) as GeoJSONSource).getClusterExpansionZoom(
      clusterId,
      function (err, zoom) {
        if (err) return;

        map.easeTo({
          center: (features[0].geometry as Point).coordinates as LngLatLike,
          zoom: zoom,
        });
      }
    );
  });

  /**
   * Symbol Layer for cluster point count
   */
  if (options.showCount) {
    const layoutOptions = {
      // "text-field": "{point_count_abbreviated}", //FIXME: This field does not seem to work with amazon location services maps
      "text-font": [FONT_1, FONT_2],
      "text-size": 12,
      ...options.clusterCountLayout,
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
  options: UnclusteredMarkerOptions
): { unclusteredLayerId: string } {
  const unclusteredLayerId = `${sourceName}-layer-unclustered-point`;

  const markerOptions = {
    showMarkerPopup: !!options.showMarkerPopup,
    popupRender: (selectedFeature: Feature) => {
      const coordinates = (selectedFeature.geometry as Point).coordinates;
      return (
        `<div class="${unclusteredLayerId}-popup"` +
        `style="background: #ffffff; border: 2px solid #0000001f; word-wrap: break-word; border-radius: 4px; padding: 20px; margin: -10px -10px -15px;">` +
        "coordinates: " +
        coordinates +
        "</div>"
      );
    },
  };

  addUnclusteredMarkerImages(map);

  const defaultUnclusteredPoint: SymbolLayer = {
    id: unclusteredLayerId,
    type: "symbol",
    source: sourceName,
    filter: ["!", ["has", "point_count"]],
    layout: {
      "icon-image": "inactive-marker",
    },
  };
  map.addLayer({ ...defaultUnclusteredPoint });

  // Set active state on markers
  map.on("click", unclusteredLayerId, function (e) {
    map.setLayoutProperty(unclusteredLayerId, "icon-image", [
      "match",
      ["id"],
      e.features[0].id, // check if the clicked id matches
      "active-marker", //image when id is the clicked feature id
      "inactive-marker", // default
    ]);

    // If popup option is set show a popup on click
    if (markerOptions.showMarkerPopup) {
      const selectedFeature = e.features[0];
      const coordinates = (selectedFeature.geometry as Point).coordinates;

      new Popup()
        .setLngLat(coordinates as [number, number])
        .setHTML(markerOptions.popupRender(selectedFeature))
        .addTo(map);
    }
  });

  return { unclusteredLayerId };
}

/**
 * Adds marker images to the maplibre canvas to be used for rendering unclustered points
 * @param map
 */
function addUnclusteredMarkerImages(map: maplibreMap) {
  const inactiveMarker = {
    width: 32,
    height: 32,
    data: new Uint8Array(32 * 32 * 4),

    onAdd: function () {
      const canvas = document.createElement("canvas");
      canvas.width = this.width;
      canvas.height = this.height;
      this.context = canvas.getContext("2d");
    },

    render: function () {
      const radius = 16;
      const context = this.context;
      context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
      context.fillStyle = MARKER_COLOR;
      context.strokeStyle = COLOR_WHITE;
      context.lineWidth = 4;
      context.fill();
      context.stroke();

      this.data = context.getImageData(0, 0, this.width, this.height).data;

      return true;
    },
  };

  const activeMarker = {
    width: 32,
    height: 32,
    data: new Uint8Array(32 * 32 * 4),

    onAdd: function () {
      const canvas = document.createElement("canvas");
      canvas.width = this.width;
      canvas.height = this.height;
      this.context = canvas.getContext("2d");
    },

    render: function () {
      const radius = 16;
      const context = this.context;
      context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
      context.fillStyle = ACTIVE_MARKER_COLOR;
      context.strokeStyle = COLOR_WHITE;
      context.lineWidth = 4;
      context.fill();
      context.stroke();

      this.data = context.getImageData(0, 0, this.width, this.height).data;

      return true;
    },
  };

  map.addImage("inactive-marker", inactiveMarker, { pixelRatio: 2 });
  map.addImage("active-marker", activeMarker, { pixelRatio: 2 });
}
