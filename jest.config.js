module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["<rootDir>/__tests__/**/*.ts"],
  transform: {
    "/node_modules/mapbox-gl-draw-circle.+\\.js$": "babel-jest", // mapbox-gl-draw-circle needs to be transpiled to cjs
    ".+\\.(svg|css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$":
      "jest-transform-stub",
  },
  moduleNameMapper: {
    "^.+.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$":
      "jest-transform-stub",
  },
  transformIgnorePatterns: ["/node_modules/(?!mapbox-gl-draw-circle).+\\.js$"],
};
