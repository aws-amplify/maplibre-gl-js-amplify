module.exports = {
  projects: [
    {
      moduleNameMapper: {
        // maplibre-gl v6 is ESM-only (`import.meta`, `.mjs`), which the
        // CommonJS-based Jest setup cannot parse. The suites don't need the
        // real rendering runtime, so route it to a manual mock.
        '^maplibre-gl$': '<rootDir>/__mocks__/maplibre-gl.js',
        '^.+.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$':
          'jest-transform-stub',
      },
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/__tests__/**/*.test.ts'],
      transform: {
        '/node_modules/mapbox-gl-draw-circle.+\\.js$': 'babel-jest', // mapbox-gl-draw-circle needs to be transpiled to cjs
        '.+\\.(svg|css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$':
          'jest-transform-stub',
      },
      transformIgnorePatterns: [
        '/node_modules/(?!mapbox-gl-draw-circle).+\\.js$',
      ],
    },
    {
      moduleNameMapper: {
        '^maplibre-gl$': '<rootDir>/__mocks__/maplibre-gl.js',
      },
      preset: 'ts-jest',
      setupFiles: ['./jest.setup.dom.ts', 'jest-webgl-canvas-mock'], // workarounds for jsdom and node env conflicts
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/__tests__/**/*.test.dom.ts'],
    },
  ],
};
