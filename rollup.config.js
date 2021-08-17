import svg from "rollup-plugin-svg";

export default {
  external: ["maplibre-gl", "@aws-amplify/core"],
  output: {
    globals: {
      "maplibre-gl": "mapboxgl",
      "@aws-amplify/core": "aws_amplify_core",
    },
  },
  plugins: [svg()],
};
