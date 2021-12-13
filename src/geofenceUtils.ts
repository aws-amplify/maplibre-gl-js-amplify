import along from "@turf/along";
import circle from "@turf/circle";
import length from "@turf/length";
import { lineString } from "@turf/helpers";
import { Feature, GeoJsonProperties, Geometry } from "geojson";
import { LngLatBounds } from "maplibre-gl";
import { Coordinates, Geofence, Polygon } from "./types";
import { isGeofenceArray, validateCoordinates } from "./utils";

const GEOFENCE_ID_REGEX = /^[-._\p{L}\p{N}]+$/iu;

export const getGeofenceFeatureArray = (
  data: Geofence[] | Polygon[]
): Feature<Geometry, GeoJsonProperties> => {
  const coordinates = isGeofenceArray(data)
    ? data.map((geofence) => geofence.geometry.polygon)
    : data;
  return {
    type: "Feature",
    geometry: {
      type: "MultiPolygon",
      coordinates,
    },
    properties: {},
  };
};

export const getGeofenceFeatureFromPolygon = (
  polygon: Polygon
): Feature<Geometry, GeoJsonProperties> => {
  return {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: polygon,
    },
    properties: {},
  };
};

// Measures distance between the coordinate bounds and takes two points 1/4 from each coordinate to create a polygon
export const getPolygonFeatureFromBounds = (
  id: string,
  bounds: LngLatBounds
): Feature<Geometry, GeoJsonProperties> => {
  const swCoordinate = bounds.getSouthWest().toArray();
  const neCoordinate = bounds.getNorthEast().toArray();
  const center = bounds.getCenter().toArray();
  const line = lineString([swCoordinate, center, neCoordinate]);
  const distanceInMiles = length(line, { units: "miles" });

  // Gets coordinates 1/4 along the line from each coordinate
  const southWestCoordinate = along(line, distanceInMiles / 4, {
    units: "miles",
  }).geometry.coordinates;
  const northeastCoordinate = along(line, distanceInMiles * (3 / 4), {
    units: "miles",
  }).geometry.coordinates;

  // Creates a polygon from the coordinates found along the line between the bounding coordinates
  const polygon = [
    [
      [southWestCoordinate[0], northeastCoordinate[1]] as Coordinates,
      northeastCoordinate as Coordinates,
      [northeastCoordinate[0], southWestCoordinate[1]] as Coordinates,
      southWestCoordinate as Coordinates,
      [southWestCoordinate[0], northeastCoordinate[1]] as Coordinates,
    ],
  ];

  return {
    id,
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: polygon,
    },
    properties: {},
  };
};

export const getCircleFeatureFromCoords = (
  id: string,
  center: Coordinates,
  { bounds, radius }: { bounds?: LngLatBounds; radius?: number }
): Feature<Geometry, GeoJsonProperties> => {
  if (!bounds && !radius) {
    throw new Error("Circle requires a bounds or a radius");
  }

  validateCoordinates(center);

  const circleRadius = radius ?? getDistanceFromBounds(bounds) / 8;
  const circleFeature = circle(center, circleRadius, { units: "miles" });

  return {
    id,
    type: "Feature",
    properties: {
      isCircle: true,
      center,
    },
    geometry: {
      type: "Polygon",
      coordinates: circleFeature.geometry.coordinates,
    },
  };
};

const getDistanceFromBounds = (bounds: LngLatBounds): number => {
  const swCoordinate = bounds.getSouthWest().toArray();
  const neCoordinate = bounds.getNorthEast().toArray();
  const center = bounds.getCenter().toArray();
  const line = lineString([swCoordinate, center, neCoordinate]);
  return length(line, { units: "miles" });
};

export const doesGeofenceExist = (
  id: string,
  loadedGeofences: any
): boolean => {
  return !!loadedGeofences[id];
};

export const isValidGeofenceId = (
  id: string,
  loadedGeofences: any
): boolean => {
  return id.match(GEOFENCE_ID_REGEX) && !doesGeofenceExist(id, loadedGeofences);
};

export const isGeofenceDisplayed = (
  id: string,
  displayedGeofences: Geofence[]
): boolean => {
  return !!displayedGeofences.find((geofence) => geofence.geofenceId === id);
};
