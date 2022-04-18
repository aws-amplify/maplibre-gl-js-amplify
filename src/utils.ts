import { Feature } from "geojson";
import { AnySourceImpl, GeoJSONSource } from "maplibre-gl";
import { Coordinates, NamedLocation, Geofence } from "./types";

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

export function isNamedLocation(object: unknown): object is NamedLocation {
  return (
    object &&
    Array.isArray((object as NamedLocation).coordinates) &&
    typeof (object as NamedLocation).coordinates[0] === "number" &&
    typeof (object as NamedLocation).coordinates[1] === "number"
  );
}

export function isNamedLocationArray(array: unknown): array is NamedLocation[] {
  return isNamedLocation(array[0]);
}

export function isGeofence(object: unknown): object is Geofence {
  return (
    object &&
    typeof (object as Geofence).id === "string" &&
    typeof (object as Geofence).geometry === "object"
  );
}

export function isGeofenceArray(array: unknown): array is Geofence[] {
  return Array.isArray(array) && isGeofence(array[0]);
}

export function isGeoJsonSource(
  source: AnySourceImpl
): source is GeoJSONSource {
  return source.type === "geojson";
}

export const strHasLength = (str: unknown): str is string =>
  typeof str === "string" && str.length > 0;

export const getFeaturesFromData = (
  data: Coordinates[] | Feature[] | NamedLocation[]
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
  } else if (isNamedLocationArray(data)) {
    features = data.map((location) => {
      return {
        type: "Feature",
        geometry: { type: "Point", coordinates: location.coordinates },
        properties: { title: location.title, address: location.address },
      };
    });
  } else {
    features = data;
  }
  return features;
};

export const urlEncodePeriods = (str: string): string => {
  return str.replace(/\./g, "%2E");
};
