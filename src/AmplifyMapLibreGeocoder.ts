import { Geo } from '@aws-amplify/geo';
import MaplibreGeocoder from '@maplibre/maplibre-gl-geocoder';
import maplibregl, { IControl } from 'maplibre-gl';
import { createDefaultIcon } from './createDefaultIcon';

export const AmplifyGeocoderAPI = {
  forwardGeocode: async (config) => {
    const features = [];
    try {
      const data = await Geo.searchByText(config.query, {
        biasPosition: config.bbox ? undefined : config.proximity,
        searchAreaConstraints: config.bbox,
        countries: config.countries,
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
      console.error(`Failed to forwardGeocode with error: ${e}`);
    }

    return { features };
  },
  reverseGeocode: async (config) => {
    const features = [];
    try {
      const data = await Geo.searchByCoordinates(config.query, {
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
      console.error(`Failed to reverseGeocode with error: ${e}`);
    }

    return { features };
  },
  getSuggestions: async (config) => {
    const suggestions = [];
    try {
      const response = await Geo.searchForSuggestions(config.query, {
        biasPosition: config.proximity,
        searchAreaConstraints: config.bbox,
        countries: config.countries,
        maxResults: config.limit,
      });
      suggestions.push(...response);
    } catch (e) {
      console.error(`Failed to get suggestions with error: ${e}`);
    }

    return { suggestions };
  },
  searchByPlaceId: async (config) => {
    let feature = undefined;
    try {
      const place = await Geo.searchByPlaceId(config.query);
      if (place) {
        const { geometry, ...otherResults } = place;
        feature = {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: geometry.point },
          properties: { ...otherResults },
          place_name: otherResults.label,
          text: otherResults.label,
          center: geometry.point,
        };
      }
    } catch (e) {
      console.error(`Failed to get place with error: ${e}`);
    }

    return { place: feature };
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
