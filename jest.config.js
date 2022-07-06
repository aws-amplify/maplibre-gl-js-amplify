module.exports = {
  projects: [
    {
      moduleNameMapper: {
        "^.+.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$":
          "jest-transform-stub",
      },
      preset: "ts-jest",
      testEnvironment: "node",
      testMatch: ["<rootDir>/__tests__/**/*.test.ts"],
      transform: {
        "/node_modules/mapbox-gl-draw-circle.+\\.js$": "babel-jest", // mapbox-gl-draw-circle needs to be transpiled to cjs
        ".+\\.(svg|css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$":
          "jest-transform-stub",
      },
      transformIgnorePatterns: ["/node_modules/(?!mapbox-gl-draw-circle).+\\.js$"],
    },
    {
      preset: "ts-jest",
      setupFiles: ["./jest.setup.dom.ts", "jest-webgl-canvas-mock", "jsdom-worker-fix"], // workarounds for jsdom and node env conflicts
      testEnvironment: "jsdom",
      testMatch: ["<rootDir>/__tests__/**/*.test.dom.ts"],
    },
  ],
};
