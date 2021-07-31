import { Geo } from "@aws-amplify/geo";

export const AmplifyGeocoder = {
  forwardGeocode: async (config) => {
    const data = await Geo.searchByText(config.query, {
      biasPosition: config.proximity,
      searchAreaConstraints: config.bbox,
      countries: config.countires,
      maxResults: config.limit,
    });
    const features = data.map((result) => {
      const { geometry, ...otherResults } = result;
      return {
        type: "Feature",
        geometry: { type: "Point", coordinates: geometry.point },
        properties: { ...otherResults },
        place_name: otherResults.label,
        text: otherResults.label,
        center: geometry.point,
      };
    });
    return { features };
  },
  reverseGeocode: async (config) => {
    const data = await Geo.searchByCoordinates(config.query, {
      maxResults: config.limit,
    });
    const { geometry, ...otherResults } = data;
    const feature = {
      type: "Feature",
      geometry: { type: "Point", coordinates: geometry.point },
      properties: { ...otherResults },
      place_name: otherResults.label,
      text: otherResults.label,
      center: geometry.point,
    };
    return { features: [feature] };
  },
};
