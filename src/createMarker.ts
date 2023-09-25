import { COLOR_WHITE, MARKER_COLOR, LOCATION_MARKER } from './constants';
import { CreateMarkerOptions, ImageMarker } from './types';

export function createMarker(options?: CreateMarkerOptions): ImageMarker {
  const fillColor = options?.fillColor ? options.fillColor : MARKER_COLOR;
  const strokeColor = options?.strokeColor ? options.strokeColor : COLOR_WHITE;
  const lineWidth = options?.lineWidth ? options.lineWidth : 4;
  return {
    width: 64,
    height: 64,
    data: new Uint8Array(64 * 64 * 4),

    onAdd: function () {
      const canvas = document.createElement('canvas');
      canvas.width = this.width;
      canvas.height = this.height;
      this.context = canvas.getContext('2d');
    },

    render: function () {
      const context = this.context;
      const markerShape = new Path2D(LOCATION_MARKER);
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
