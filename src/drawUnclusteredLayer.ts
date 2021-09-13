import { Point } from "geojson";
import { Map as maplibreMap, Popup, SymbolLayer } from "maplibre-gl";
import { Coordinates, UnclusteredOptions } from "./types";
import { ACTIVE_MARKER_COLOR, COLOR_WHITE, MARKER_COLOR } from "./constants";
import { createMarker } from "./createMarker";
import { getPopupRenderFunction } from "./popupRender";
import { isCoordinates } from "./utils";

const HIDE_TIP = "amplify-tip";

export function drawUnclusteredLayer(
  sourceName: string,
  map: maplibreMap,
  { showMarkerPopup = false, ...options }: UnclusteredOptions
): { unclusteredLayerId: string } {
  const unclusteredLayerId = `${sourceName}-layer-unclustered-point`;

  const popupRender = options.popupRender ? options.popupRender : getPopupRenderFunction(unclusteredLayerId, options);

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

  /*
   * Add css to header to hide default popup tip
   */
  if (showMarkerPopup) {
    const element = document.getElementById(HIDE_TIP);
    if (!element) {
      const style = document.createElement("style");
      style.setAttribute("id", HIDE_TIP);
      document.head.append(style);
      style.textContent = ".mapboxgl-popup-tip { display: none; }";
    }
  }

  /*
   * Set active state on markers when clicked
   */
  map.on("click", unclusteredLayerId, function (e) {
    if (typeof options.onClick === "function") options.onClick(e);

    map.setLayoutProperty(unclusteredLayerId, "icon-image", [
      "match",
      ["id"],
      e.features[0].id, // check if the clicked id matches
      "active-marker", //image when id is the clicked feature id
      "inactive-marker", // default
    ]);

    // If popup option is set show a popup on click
    if (showMarkerPopup) {
      const selectedFeature = e.features[0];
      const coordinates = (selectedFeature.geometry as Point).coordinates;

      if (isCoordinates(coordinates)) {
        new Popup()
          .setLngLat(coordinates as Coordinates)
          .setHTML(popupRender(selectedFeature))
          .setOffset(15)
          .addTo(map);
      }
    }
  });

  return { unclusteredLayerId };
}

/*
 * Adds marker images to the maplibre canvas to be used for rendering unclustered points
 */
function addUnclusteredMarkerImages(
  map: maplibreMap,
  {
    selectedColor = ACTIVE_MARKER_COLOR,
    selectedBorderColor = COLOR_WHITE,
    selectedBorderWidth = 4,
    defaultBorderColor = COLOR_WHITE,
    defaultBorderWidth = 4,
    defaultColor: fillColor = MARKER_COLOR,
  }: UnclusteredOptions
) {
  const inactiveMarker = createMarker({
    fillColor: fillColor,
    strokeColor: defaultBorderColor,
    lineWidth: defaultBorderWidth,
  });
  const activeMarker = createMarker({
    fillColor: selectedColor,
    strokeColor: selectedBorderColor,
    lineWidth: selectedBorderWidth,
  });

  map.addImage("inactive-marker", inactiveMarker, { pixelRatio: 2 });
  map.addImage("active-marker", activeMarker, { pixelRatio: 2 });
}
