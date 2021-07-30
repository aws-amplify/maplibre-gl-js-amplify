import { Geo } from "@aws-amplify/geo";
import { Point } from "geojson";
import {
  CircleLayer,
  CirclePaint,
  LngLatLike,
  Map as maplibreMap,
  SymbolLayer,
} from "maplibre-gl";
import { ClusterOptions } from "./types";
import { COLOR_WHITE, MARKER_COLOR, MAP_STYLES } from "./constants";
import { isGeoJsonSource } from "./utils";
import { FONT_DEFAULT_BY_STYLE } from "./constants";

export function drawClusterLayer(
  sourceName: string,
  map: maplibreMap,
  {
    fillColor: markerColor = MARKER_COLOR,
    smCircleSize: smallSize = 60,
    smThreshold: smallThreshold = 50,
    mdCircleSize: mediumSize = 100,
    mdThreshold: mediumThreshold = 100,
    lgCircleSize: largeSize = 140,
    lgThreshold: largeThreshold = 500,
    xlCircleSize: extraLargeSize = 180,
    borderWidth = 4,
    borderColor = COLOR_WHITE,
    clusterPaint,
    onClick,
    showCount,
    clusterCountLayout,
    fontColor = COLOR_WHITE,
  }: ClusterOptions,
  mapStyle?: MAP_STYLES
): { clusterLayerId: string; clusterSymbolLayerId: string } {
  const clusterLayerId = `${sourceName}-layer-clusters`;
  const clusterSymbolLayerId = `${sourceName}-layer-cluster-count`;

  // Use step expressions for clusters (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
  const paintOptions: CirclePaint = {
    "circle-color": [
      "step",
      ["get", "point_count"],
      markerColor,
      smallThreshold,
      markerColor,
      mediumThreshold,
      markerColor,
      largeThreshold,
      markerColor,
    ],
    "circle-radius": [
      "step",
      ["get", "point_count"],
      smallSize,
      smallThreshold,
      mediumSize,
      mediumThreshold,
      largeSize,
      largeThreshold,
      extraLargeSize,
    ],
    "circle-stroke-width": borderWidth,
    "circle-stroke-color": borderColor,
    ...clusterPaint,
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
    if (typeof onClick === "function") onClick(e);

    const features = map.queryRenderedFeatures(e.point, {
      layers: [clusterLayerId],
    });
    const clusterId = features[0].properties.cluster_id;
    const source = map.getSource(sourceName);
    if (isGeoJsonSource(source)) {
      source.getClusterExpansionZoom(clusterId, function (err, zoom) {
        if (err) return;

        map.easeTo({
          center: (features[0].geometry as Point).coordinates as LngLatLike,
          zoom: zoom,
        });
      });
    }
  });

  /**
   * Symbol Layer for cluster point count
   */
  if (showCount) {
    const defaultLayoutOptions = {
      "text-field": "{point_count_abbreviated}",
      "text-size": 24,
    };

    const locationServicesStyle = mapStyle || Geo.getDefaultMap().style;
    if (locationServicesStyle) {
      defaultLayoutOptions["text-font"] = [
        FONT_DEFAULT_BY_STYLE[locationServicesStyle],
      ];
    }

    const layoutOptions = { ...defaultLayoutOptions, ...clusterCountLayout };

    const paintOptions = {
      "text-color": fontColor,
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
