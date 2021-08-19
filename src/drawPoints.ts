import { Feature } from "geojson";
import { Map as maplibreMap } from "maplibre-gl";
import { getFeaturesFromData } from "./utils";
import { ClusterOptions, Coordinates, UnclusteredOptions } from "./types";
import { drawClusterLayer } from "./drawClusterLayer";
import { drawUnclusteredLayer } from "./drawUnclusteredLayer";
import { MAP_STYLES } from "./constants";

/**
 * @param {boolean} showCluster Default: true, determines whether or not points close together should be clustered into a single point
 * @param {Object} clusterOptions Object for determining cluster options, see ClusterOptions for more details
 * @param {Object} unclusteredOptions Object for determining cluster options, see UnclusteredOptions for more details
 */
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

/**
 * DrawPoints utility function for adding points to a map based on coordinate data or a FeatureCollection. Will add clustered points and styled markers by default with options for popups and other styles
 * @param {String} sourceName A user defined name used for determining the maplibre data source and the maplibre layers
 * @param {Coordinate[] | Feature[]} data An array of coordinate data or GeoJSON Features used as the data source for maplibre
 * @param {maplibre-gl-js-Map} map A maplibre-gl-js [map](https://maplibre.org/maplibre-gl-js-docs/api/map/) on which the points will be drawn
 * @param {Object} options An object containing options for changing the styles and features of the points rendered to the map, see the options for more details on available settings
 * @param {String} options.showCluster Determines whether or not points close together should be clustered into a single point
 * @param {String} options.clusterOptions Object for determining cluster options, see [ClusterOptions](https://github.com/aws-amplify/maplibre-gl-js-amplify/blob/main/src/types.ts#L43) for more details
 * @param {String} options.unclusteredOptions Object for determining unclustered point options, see [UnclusteredOptions](https://github.com/aws-amplify/maplibre-gl-js-amplify/blob/main/src/types.ts#L8) for more details
 * @param {MAP_STYLE} mapStyle A required parameter that indicates the map style returned from Amazon Location services. This is used to determine the default fonts to be used with maplibre-gl-js. View existing styles [here](https://github.com/aws-amplify/maplibre-gl-js-amplify/blob/main/src/constants.ts#L8)
 * @returns {DrawPointsOutput} output An object containing the string id's of the sources and layers used to draw the points to the map. This includes the sourceId, clusterLayerId, clusterSymbolLayerId, unclusteredLayerId.
 * @property {String} sourceId The [source](https://maplibre.org/maplibre-gl-js-docs/api/sources/) used to contain all of the coordinate/feature data
 * @property {String} clusterLayerId The [layer](https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/) used for creating and styling the points that are clustered together
 * @property {String} clusterSymbolLayerId The [layer](https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/#symbol) used for creating styling the number that shows the count of points in a cluster
 * @property {String} unclusteredLayerId The [layer](https://maplibre.org/maplibre-gl-js-docs/style-spec/layers) used for creating and styling the individual points on the map and the popup when clicking on a point
 */
export function drawPoints(
  sourceName: string,
  data: Coordinates[] | Feature[],
  map: maplibreMap,
  {
    showCluster = true,
    clusterOptions = {},
    unclusteredOptions: unclusteredMarkerOptions = {},
  }: DrawPointsOptions = {},
  mapStyle?: MAP_STYLES
): DrawPointsOutput {
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
  const features = getFeaturesFromData(data);

  /*
   * Data source for features
   */
  const sourceId = `${sourceName}-source-points`;
  map.addSource(sourceId, {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features,
    },
    cluster: showCluster,
    clusterMaxZoom: clusterOptions.clusterMaxZoom ?? 14,
    generateId: true,
  });

  /*
   * Draw ui layers for source data
   */
  let clusterLayerId: string, clusterSymbolLayerId: string;
  if (showCluster) {
    ({ clusterLayerId, clusterSymbolLayerId } = drawClusterLayer(
      sourceId,
      map,
      clusterOptions,
      mapStyle
    ));
  }

  const { unclusteredLayerId } = drawUnclusteredLayer(
    sourceId,
    map,
    unclusteredMarkerOptions || {}
  );

  return { sourceId, unclusteredLayerId, clusterLayerId, clusterSymbolLayerId };
}
