import { Feature, Point, Position } from 'geojson';
import { strHasLength } from './utils';
import { PopupRenderFunction, UnclusteredOptions } from './types';
import { COLOR_BLACK, COLOR_WHITE, POPUP_BORDER_COLOR } from './constants';

export function getPopupRenderFunction(
  unclusteredLayerId: string,
  {
    popupBackgroundColor: background = COLOR_WHITE,
    popupBorderColor: borderColor = POPUP_BORDER_COLOR,
    popupBorderWidth: borderWidth = 2,
    popupFontColor: fontColor = COLOR_BLACK,
    popupPadding: padding = 20,
    popupBorderRadius: radius = 4,
    popupTitleFontWeight: fontWeight = 'bold',
  }: UnclusteredOptions
): PopupRenderFunction {
  return (selectedFeature: Feature) => {
    let title: string, address: string | Position;

    // Try to get Title and address from existing feature properties
    if (strHasLength(selectedFeature.properties.place_name)) {
      const placeName = selectedFeature.properties.place_name.split(',');
      title = placeName[0];
      address = placeName.splice(1, placeName.length).join(',');
    } else if (
      strHasLength(selectedFeature.properties.title) ||
      strHasLength(selectedFeature.properties.address)
    ) {
      title = selectedFeature.properties.title;
      address = selectedFeature.properties.address;
    } else {
      title = 'Coordinates';
      address = (selectedFeature.geometry as Point).coordinates;
    }

    const titleHtml = `<div class="${unclusteredLayerId}-popup-title" style="font-weight: ${fontWeight};">${title}</div>`;
    const addressHtml = `<div class="${unclusteredLayerId}-popup-address">${address}</div>`;
    const popupHtmlStyle = `background: ${background}; border: ${borderWidth}px solid ${borderColor}; color: ${fontColor}; border-radius: ${radius}px; padding: ${padding}px; word-wrap: break-word; margin: -10px -10px -15px;`;
    let popupHtml = `<div class="${unclusteredLayerId}-popup" style="${popupHtmlStyle}">`;
    if (title) popupHtml += titleHtml;
    if (address) popupHtml += addressHtml;
    popupHtml += '</div>';

    return popupHtml;
  };
}
