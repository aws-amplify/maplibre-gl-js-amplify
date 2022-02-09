/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Geo } from "@aws-amplify/geo";
import MaplibreGeocoder from "@maplibre/maplibre-gl-geocoder";
import maplibregl, { IControl } from "maplibre-gl";
import { createDefaultIcon } from "./createDefaultIcon";

export const AmplifyGeocoderAPI = {
  forwardGeocode: async (config) => {
    const features = [];
    try {
      const data = await Geo.searchByText(config.query, {
        biasPosition: config.proximity,
        searchAreaConstraints: config.bbox,
        countries: config.countires,
        maxResults: config.limit,
      });

      if (data) {
        data.forEach((result) => {
          const { geometry, ...otherResults } = result;
          features.push({
            type: "Feature",
            geometry: { type: "Point", coordinates: geometry.point },
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
          type: "Feature",
          geometry: { type: "Point", coordinates: geometry.point },
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
    let response;
    try {
      response = await Geo.searchForSuggestions(config.query, {
        biasPosition: config.proximity,
        searchAreaConstraints: config.bbox,
        countries: config.countries,
        maxResults: config.limit,
      });
    } catch (e) {
      console.error(`Failed to get suggestions with error: ${e}`);
    }

    return { suggestions: response };
  },
};

function processResults(searchResults, suggestions, limit) {
  if (!suggestions || suggestions.length === 0) {
    return searchResults;
  }

  // Filter out the suggestions that are already in the search results
  const featureLabels = searchResults.map((feature) => feature.place_name);
  const filteredSuggestions = suggestions.filter(
    (result) => !featureLabels.includes(result)
  );

  if (filteredSuggestions.length + searchResults.length >= limit) {
    // Restrict suggestions to < half of the limit at most
    let suggestionsLimit = Math.min(
      filteredSuggestions.length,
      Math.floor(limit / 2)
    );
    // If there are not enough results to fill to limit, add more suggestions
    while (searchResults.length + suggestionsLimit < limit) {
      suggestionsLimit++;
    }

    // Add the suggestions to the search results
    const limitedResults = [];
    for (let i = 0; i < suggestionsLimit; i++) {
      limitedResults.push(filteredSuggestions[i]);
    }
    for (let i = 0; i < limit - suggestionsLimit; i++) {
      limitedResults.push(searchResults[i]);
    }

    return limitedResults;
  }

  return filteredSuggestions.length > 0
    ? [...filteredSuggestions, ...searchResults]
    : searchResults;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createAmplifyGeocoder(options?: any): IControl {
  return new MaplibreGeocoder(AmplifyGeocoderAPI, {
    maplibregl,
    showResultMarkers: { element: createDefaultIcon() },
    marker: { element: createDefaultIcon() },
    processResults,
    ...options,
  });
}
