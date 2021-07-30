export default {
  external: ["maplibre-gl", "@aws-amplify/core"],
  output: {
    globals: {
      "maplibre-gl": "maplibreGl",
      "@aws-amplify/core": "core",
    },
  },
};
