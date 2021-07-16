import { Feature, Point, Position } from "geojson";
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
const COLOR_BLACK = "#000";
const MARKER_COLOR = "#5d8aff";
const ACTIVE_MARKER_COLOR = "#ff9900";
const BORDER_COLOR = "#0000001f";

const FONT_1 = "Arial Regular";

interface UnclusteredOptions {
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
  popupRender?: (selectedFeature: Feature) => string;
}

interface ClusterOptions {
  clusterMaxZoom?: number;
  clusterRadius?: number;
  showCount?: boolean;
  fillColor?: string;
  borderWidth?: number;
  borderColor?: string;
  fontColor?: string;
  clusterPaint?: Record<string, unknown>;
  clusterCountLayout?: Record<string, unknown>;
}

export interface DrawPointsOptions {
  showCluster?: boolean;
  clusterOptions?: ClusterOptions;
  unclusteredOptions?: UnclusteredOptions;
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
    unclusteredOptions: unclusteredMarkerOptions = {},
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
        properties: { place_name: `Coordinates,${point}` },
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
    unclusteredMarkerOptions || {}
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

  const markerColor = options.fillColor || MARKER_COLOR;
  // Use step expressions for clusters (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
  const paintOptions: CirclePaint = {
    "circle-color": [
      "step",
      ["get", "point_count"],
      markerColor, // 60px circles when point count is less than 50
      50,
      markerColor, // 100px circles when point count is between 50 and 100
      100,
      markerColor, // 140px circles when point count is between 100 and 500
      500,
      markerColor, // 180px circles when point count is greater than 500
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
    "circle-stroke-width": options.borderWidth || 4,
    "circle-stroke-color": options.borderColor || COLOR_WHITE,
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
   * Inspect cluster on click
   */
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
      "text-field": "{point_count_abbreviated}", //FIXME: This field does not seem to work with amazon location services maps
      "text-font": [FONT_1],
      "text-size": 24,
      ...options.clusterCountLayout,
    };
    const paintOptions = {
      "text-color": options.fontColor || COLOR_WHITE,
    };
    const defaultClusterCount: SymbolLayer = {
      id: clusterSymbolLayerId,
      type: "symbol",
      source: sourceName,
      filter: ["has", "point_count"],
      layout: layoutOptions,
      paint: paintOptions,
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
  options: UnclusteredOptions
): { unclusteredLayerId: string } {
  const unclusteredLayerId = `${sourceName}-layer-unclustered-point`;

  const markerOptions = {
    showMarkerPopup: !!options.showMarkerPopup,
    popupRender: getPopupRenderFunction(unclusteredLayerId, options),
  };

  addUnclusteredMarkerImages(map, options);

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

  /**
   * Set active state on markers when clicked
   */
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
        .setOffset(15)
        .addTo(map);
    }
  });

  return { unclusteredLayerId };
}

/**
 * Adds marker images to the maplibre canvas to be used for rendering unclustered points
 * @param map
 */
function addUnclusteredMarkerImages(
  map: maplibreMap,
  options: UnclusteredOptions
) {
  const {
    selectedColor,
    selectedBorderColor,
    selectedBorderWidth,
    defaultBorderColor,
    defaultBorderWidth,
    defaultColor,
  } = options;
  const inactiveMarker = createMarker({
    fillColor: defaultColor || MARKER_COLOR,
    strokeColor: defaultBorderColor || COLOR_WHITE,
    lineWidth: defaultBorderWidth || 4,
  });
  const activeMarker = createMarker({
    fillColor: selectedColor || ACTIVE_MARKER_COLOR,
    strokeColor: selectedBorderColor || COLOR_WHITE,
    lineWidth: selectedBorderWidth || 4,
  });

  map.addImage("inactive-marker", inactiveMarker, { pixelRatio: 2 });
  map.addImage("active-marker", activeMarker, { pixelRatio: 2 });
}

function createMarker(options?: {
  fillColor?: string;
  strokeColor?: string;
  lineWidth?: number;
}) {
  const fillColor = options ? options.fillColor : MARKER_COLOR;
  const strokeColor = options ? options.strokeColor : COLOR_WHITE;
  const lineWidth = options ? options.lineWidth : 4;
  return {
    width: 64,
    height: 64,
    data: new Uint8Array(64 * 64 * 4),

    onAdd: function () {
      const canvas = document.createElement("canvas");
      canvas.width = this.width;
      canvas.height = this.height;
      this.context = canvas.getContext("2d");
    },

    render: function () {
      const context = this.context;
      const markerShape = new Path2D(
        "M30 16C30 18.5747 29.1348 21.3832 27.7111 24.2306C26.2947 27.0635 24.3846 29.8177 22.4383 32.2506C20.4964 34.678 18.5493 36.7473 17.0858 38.2108C16.6828 38.6138 16.3174 38.9699 16 39.2739C15.6826 38.9699 15.3172 38.6138 14.9142 38.2108C13.4507 36.7473 11.5036 34.678 9.56174 32.2506C7.61543 29.8177 5.70531 27.0635 4.28885 24.2306C2.86518 21.3832 2 18.5747 2 16C2 8.26801 8.26801 2 16 2C23.732 2 30 8.26801 30 16Z"
      );
      context.stroke(markerShape);
      context.fillStyle = fillColor;
      context.strokeStyle = strokeColor;
      context.lineWidth = lineWidth;
      context.fill(markerShape);

      this.data = context.getImageData(0, 0, this.width, this.height).data;

      return true;
    },
  };
}

function getPopupRenderFunction(
  unclusteredLayerId: string,
  options: UnclusteredOptions
) {
  const {
    popupBackgroundColor,
    popupBorderColor,
    popupBorderWidth,
    popupFontColor,
    popupPadding,
    popupBorderRadius,
  } = options;
  const background = popupBackgroundColor || COLOR_WHITE;
  const borderColor = popupBorderColor || BORDER_COLOR;
  const borderWidth = popupBorderWidth || 2;
  const fontColor = popupFontColor || COLOR_BLACK;
  const padding = popupPadding || 20;
  const radius = popupBorderRadius || 4;

  return (selectedFeature: Feature) => {
    let title: string, address: string | Position;

    const style = document.createElement("style");
    document.head.append(style);
    style.textContent = ".mapboxgl-popup-tip { display: none; }";

    // Try to get Title and address from existing feature properties
    if (typeof selectedFeature.properties.place_name === "string") {
      const placeName = selectedFeature.properties.place_name.split(",");
      title = placeName[0];
      address = placeName.splice(1, placeName.length).join(",");
    } else {
      title = "Coordinates";
      address = (selectedFeature.geometry as Point).coordinates;
    }

    return (
      `<div class="${unclusteredLayerId}-popup"` +
      `style="background: ${background}; border: ${borderWidth}px solid ${borderColor}; color: ${fontColor}; border-radius: ${radius}px; padding: ${padding}px; word-wrap: break-word; margin: -10px -10px -15px;">` +
      `<div class="${unclusteredLayerId}-popup-title" style="font-weight: bold;">` +
      title +
      "</div>" +
      `<div class="${unclusteredLayerId}-popup-address">` +
      address +
      "</div>" +
      "</div>"
    );
  };
}
