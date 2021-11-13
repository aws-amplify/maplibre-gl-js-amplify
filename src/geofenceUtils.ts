import along from "@turf/along";
import distance from "@turf/distance";
import { lineString, point } from "@turf/helpers";
import { Feature, GeoJsonProperties, Geometry } from "geojson";
import { LngLatBounds } from "maplibre-gl";
import { Coordinates, Geofence, Polygon } from "./types";
import { isGeofenceArray } from "./utils";

const GEOFENCE_ID_REGEX = /^[-._\w]+$/;

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
export const getPolygonFromBounds = (bounds: LngLatBounds): Polygon => {
  const swCoordinate = bounds.getSouthWest().toArray();
  const neCoordinate = bounds.getNorthEast().toArray();
  const distanceInMeters = distance(point(swCoordinate), point(neCoordinate));
  const line = lineString([swCoordinate, neCoordinate]);

  // Gets coordinates 1/4 along the line from each coordinate
  const southWestCoordinate = along(line, distanceInMeters / 4).geometry
    .coordinates;
  const northeastCoordinate = along(line, distanceInMeters * (3 / 4)).geometry
    .coordinates;

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

  return polygon;
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
  return !!displayedGeofences.find((geofence) => geofence.id === id);
};
