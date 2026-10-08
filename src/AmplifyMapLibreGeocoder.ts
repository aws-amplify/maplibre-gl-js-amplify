import { Geo } from '@aws-amplify/geo';
import type {
  BoundingBox,
  Coordinates as GeoCoordinates,
} from '@aws-amplify/geo';
import MaplibreGeocoder, {
  MaplibreGeocoderApi,
} from '@maplibre/maplibre-gl-geocoder';
import * as maplibregl from 'maplibre-gl';
import type { IControl } from 'maplibre-gl';
import { createDefaultIcon } from './createDefaultIcon';
import { Coordinates } from './types';

// The MapLibre geocoder config expresses these fields more loosely than the
// Amplify Geo API accepts (bbox/proximity as number[], countries as a
// comma-separated string). These helpers narrow/convert them to the exact
// shapes Geo.* methods require.
const toBoundingBox = (bbox?: number[]): BoundingBox | undefined =>
  bbox ? (bbox as BoundingBox) : undefined;
const toBiasPosition = (proximity?: number[]): GeoCoordinates | undefined =>
  proximity ? (proximity as GeoCoordinates) : undefined;
const toCountries = (countries?: string): string[] | undefined =>
  countries ? countries.split(',').map((c) => c.trim()) : undefined;

export const AmplifyGeocoderAPI: MaplibreGeocoderApi = {
  forwardGeocode: async (config) => {
    const features = [];
    try {
      const data = await Geo.searchByText(config.query as string, {
        biasPosition: config.bbox
          ? undefined
          : toBiasPosition(config.proximity),
        searchAreaConstraints: toBoundingBox(config.bbox),
        countries: toCountries(config.countries),
        maxResults: config.limit,
      });

      if (data) {
        data.forEach((result) => {
          const { geometry, ...otherResults } = result;
          features.push({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: geometry.point },
            properties: { ...otherResults },
            place_name: otherResults.label,
            text: otherResults.label,
            center: geometry.point,
          });
        });
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(`Failed to forwardGeocode with error: ${e}`);
    }

    return { type: 'FeatureCollection', features };
  },
  reverseGeocode: async (config) => {
    const features = [];
    try {
      const data = await Geo.searchByCoordinates(config.query as Coordinates, {
        maxResults: config.limit,
      });

      if (data && data.geometry) {
        const { geometry, ...otherResults } = data;
        features.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: geometry.point },
          properties: { ...otherResults },
          place_name: otherResults.label,
          text: otherResults.label,
          center: geometry.point,
        });
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(`Failed to reverseGeocode with error: ${e}`);
    }

    return { type: 'FeatureCollection', features };
  },
  getSuggestions: async (config) => {
    const suggestions = [];
    try {
      const response = await Geo.searchForSuggestions(config.query as string, {
        biasPosition: toBiasPosition(config.proximity),
        searchAreaConstraints: toBoundingBox(config.bbox),
        countries: toCountries(config.countries),
        maxResults: config.limit,
      });
      suggestions.push(...response);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(`Failed to get suggestions with error: ${e}`);
    }

    return { suggestions };
  },
  searchByPlaceId: async (config) => {
    const place = [];
    try {
      const result = await Geo.searchByPlaceId(config.query as string);
      if (result) {
        const { geometry, ...otherResults } = result;
        place.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: geometry.point },
          properties: { ...otherResults },
          place_name: otherResults.label,
          text: otherResults.label,
          center: geometry.point,
        });
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(`Failed to get place with error: ${e}`);
    }

    return { place };
  },
};

export function createAmplifyGeocoder(options?: any): IControl {
  return new MaplibreGeocoder(AmplifyGeocoderAPI, {
    maplibregl: maplibregl,
    showResultMarkers: { element: createDefaultIcon() },
    marker: { element: createDefaultIcon() },
    // autocomplete temporarily disabled by default until CLI is updated
    showResultsWhileTyping: options?.autocomplete,
    // showResultsWhileTyping: options?.autocomplete === false ? false : true,
    ...options,
  });
}
