import { Feature } from "geojson";
import { AnySourceImpl, GeoJSONSource } from "maplibre-gl";
import { Coordinates } from "./types";

export function isCoordinates(array: unknown): array is Coordinates {
  return (
    Array.isArray(array) &&
    typeof array[0] === "number" &&
    typeof array[1] === "number"
  );
}

export function isCoordinatesArray(array: unknown): array is Coordinates[] {
  return isCoordinates(array[0]);
}

export function isGeoJsonSource(
  source: AnySourceImpl
): source is GeoJSONSource {
  return source.type === "geojson";
}

export const strHasLength = (str: unknown): str is string =>
  typeof str === "string" && str.length > 0;

export const getFeaturesFromData = (
  data: Coordinates[] | Feature[]
): Feature[] => {
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
  return features;
};
