import { Feature } from "geojson";
import { Coordinates } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isCoordinatesArray(array: unknown): array is Coordinates[] {
  return Array.isArray(array[0]) && typeof array[0][0] === "number";
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
