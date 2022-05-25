import { Feature } from "geojson";
import { AnySourceImpl, GeoJSONSource } from "maplibre-gl";
import { Coordinates, NamedLocation, Geofence, Polygon } from "./types";

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
    typeof (object as Geofence).geofenceId === "string" &&
    typeof (object as Geofence).geometry === "object"
  );
}

export function isGeofenceArray(array: unknown): array is Geofence[] {
  return Array.isArray(array) && isGeofence(array[0]);
}

export function isPolygon(object: unknown): object is Polygon {
  return Array.isArray(object) && isCoordinatesArray((object as Polygon)[0]);
}

export function isPolygonArray(array: unknown): array is Polygon[] {
  return Array.isArray(array) && isPolygon(array[0]);
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

export function validateCoordinates(coordinates: Coordinates): void {
  const [lng, lat] = coordinates;
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    throw new Error(`Invalid coordinates: [${lng},${lat}]`);
  }
  if (lat < -90 || lat > 90) {
    const errorString =
      "Latitude must be between -90 and 90 degrees inclusive.";
    console.warn(errorString);
    throw new Error(errorString);
  } else if (lng < -180 || lng > 180) {
    const errorString =
      "Longitude must be between -180 and 180 degrees inclusive.";
    console.warn(errorString);
    throw new Error(errorString);
  }
}

export function createElement(
  tagName: string,
  className?: string,
  container?: HTMLElement
): HTMLElement {
  const el = window.document.createElement(tagName);
  if (className !== undefined) el.className = className;
  if (container) container.appendChild(el);
  return el;
}

export function removeElement(node: HTMLElement): void {
  if (node.parentNode) {
    node.parentNode.removeChild(node);
  }
}
