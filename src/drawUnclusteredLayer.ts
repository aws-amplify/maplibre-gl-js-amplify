import { Point } from "geojson";
import { Map as maplibreMap, Popup, SymbolLayer } from "maplibre-gl";
import { UnclusteredOptions } from "./types";
import { ACTIVE_MARKER_COLOR, COLOR_WHITE, MARKER_COLOR } from "./constants";
import { createMarker } from "./createMarker";
import { getPopupRenderFunction } from "./popupRender";

export function drawUnclusteredLayer(
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
   * Add css to header to hide default popup tip
   */
  if (markerOptions.showMarkerPopup) {
    const style = document.createElement("style");
    document.head.append(style);
    style.textContent = ".mapboxgl-popup-tip { display: none; }";
  }

  /**
   * Set active state on markers when clicked
   */
  map.on("click", unclusteredLayerId, function (e) {
    if (options.onClick) options.onClick(e);

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
