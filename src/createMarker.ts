import { COLOR_WHITE, MARKER_COLOR } from "./constants";
import { ImageMarker } from "./types";

export function createMarker(options?: {
  fillColor?: string;
  strokeColor?: string;
  lineWidth?: number;
}): ImageMarker {
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
