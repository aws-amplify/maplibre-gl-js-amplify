## Maplibre GL JS Amplify

A plugin for [maplibre-gl-js](https://github.com/maplibre/maplibre-gl-js) for integration with [Amplify Geo](https://docs.mapbox.com/api/search/#geocoding).

### Reporting Bugs/Feature Requests

[![Open Bugs](https://img.shields.io/github/issues/aws-amplify/maplibre-gl-js-amplify/bug?color=d73a4a&label=bugs)](https://github.com/aws-amplify/amplify-js/issues?q=is%3Aissue+is%3Aopen+label%3Abug)
[![Feature Requests](https://img.shields.io/github/issues/aws-amplify/maplibre-gl-js-amplify/feature-request?color=ff9001&label=feature%20requests)](https://github.com/aws-amplify/amplify-js/issues?q=is%3Aissue+label%3Afeature-request+is%3Aopen)
[![Closed Issues](https://img.shields.io/github/issues-closed/aws-amplify/maplibre-gl-js-amplify?color=%2325CC00&label=issues%20closed)](https://github.com/aws-amplify/amplify-js/issues?q=is%3Aissue+is%3Aclosed+)

### Usage

```bash
yarn add maplibre-gl-js-amplify
```

```js
import { AmplifyMapLibreRequest } from "maplibre-gl-js-amplify";
import Amplify from "aws-amplify";
import awsconfig from './aws-exports';

Amplify.configure(awsconfig);
...
  const map = await AmplifyMapLibreRequest.createMapLibreMap({
        container: "map", // An HTML Element or HTML element ID to render the map in https://maplibre.org/maplibre-gl-js-docs/api/map/
        center: [-123.1187, 49.2819],
        zoom: 11,
        region: "us-west-2"
  })
```

### Deeper dive

#### API Documentation

See [API.md](https://github.com/aws-amplify/maplibre-gl-js-amplify/blob/main/API.md) for complete reference.

#### Examples

See [FIXME](https://docs.mapbox.com/mapbox-gl-js/examples/#geocoder).

### Contributing

See [CONTRIBUTING.md](https://github.com/aws-amplify/maplibre-gl-js-amplify/blob/main/CONTRIBUTING.md).
