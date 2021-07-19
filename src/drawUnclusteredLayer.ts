import { Feature, Point, Position } from "geojson";
import { Map as maplibreMap, Popup, SymbolLayer } from "maplibre-gl";
import { strHasLength } from "./utils";
import { PopupRenderFunction, UnclusteredOptions } from "./types";
import {
  ACTIVE_MARKER_COLOR,
  COLOR_BLACK,
  COLOR_WHITE,
  MARKER_COLOR,
  POPUP_BORDER_COLOR,
} from "./constants";

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
  {
    popupBackgroundColor: background = COLOR_WHITE,
    popupBorderColor: borderColor = POPUP_BORDER_COLOR,
    popupBorderWidth: borderWidth = 2,
    popupFontColor: fontColor = COLOR_BLACK,
    popupPadding: padding = 20,
    popupBorderRadius: radius = 4,
    popupTitleFontWeight: fontWeight = "bold",
  }: UnclusteredOptions
): PopupRenderFunction {
  return (selectedFeature: Feature) => {
    let title: string, address: string | Position;

    // Try to get Title and address from existing feature properties
    if (strHasLength(selectedFeature.properties.place_name)) {
      const placeName = selectedFeature.properties.place_name.split(",");
      title = placeName[0];
      address = placeName.splice(1, placeName.length).join(",");
    } else {
      title = "Coordinates";
      address = (selectedFeature.geometry as Point).coordinates;
    }

    return `
      <div class="${unclusteredLayerId}-popup" style="background: ${background}; border: ${borderWidth}px solid ${borderColor}; color: ${fontColor}; border-radius: ${radius}px; padding: ${padding}px; word-wrap: break-word; margin: -10px -10px -15px;">
        <div class="${unclusteredLayerId}-popup-title" style="font-weight: ${fontWeight};">
          ${title}
        </div>
        <div class="${unclusteredLayerId}-popup-address">
          ${address}
        </div>
      </div>`;
  };
}
