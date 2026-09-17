/**
 * Manual Jest mock for maplibre-gl.
 *
 * maplibre-gl v6 is ESM-only (`import.meta`, `.mjs`), which the repo's
 * CommonJS-based Jest (ts-jest / jest 27) cannot parse. The library's tests
 * never exercise maplibre-gl's real rendering runtime — they either
 * `jest.mock('maplibre-gl')` or need only lightweight geometry helpers — so
 * this manual mock provides the small, deterministic surface the suites use.
 */

class LngLat {
  constructor(lng, lat) {
    this.lng = lng;
    this.lat = lat;
  }
  toArray() {
    return [this.lng, this.lat];
  }
}

class LngLatBounds {
  constructor(sw, ne) {
    this._sw = Array.isArray(sw) ? new LngLat(sw[0], sw[1]) : sw;
    this._ne = Array.isArray(ne) ? new LngLat(ne[0], ne[1]) : ne;
  }
  getSouthWest() {
    return this._sw;
  }
  getNorthEast() {
    return this._ne;
  }
  getCenter() {
    return new LngLat(
      (this._sw.lng + this._ne.lng) / 2,
      (this._sw.lat + this._ne.lat) / 2
    );
  }
}

const Map = jest.fn().mockImplementation(function Map() {
  this.on = jest.fn();
  this.off = jest.fn();
  this.addControl = jest.fn();
  this.removeControl = jest.fn();
  this.addSource = jest.fn();
  this.addLayer = jest.fn();
  this.addImage = jest.fn();
  this.hasImage = jest.fn();
  this.getSource = jest.fn();
  this.getLayer = jest.fn();
  this.removeLayer = jest.fn();
  this.removeSource = jest.fn();
  this.setLayoutProperty = jest.fn();
  this.queryRenderedFeatures = jest.fn(() => []);
  this.easeTo = jest.fn();
  this.getCanvasContainer = jest.fn(() => ({ appendChild: jest.fn() }));
  this.getContainer = jest.fn(() => ({
    getElementsByClassName: jest.fn(() => [{}]),
  }));
});

class Popup {
  setLngLat() {
    return this;
  }
  setHTML() {
    return this;
  }
  addTo() {
    return this;
  }
  remove() {
    return this;
  }
  setDOMContent() {
    return this;
  }
}

class Marker {
  setLngLat() {
    return this;
  }
  addTo() {
    return this;
  }
  remove() {
    return this;
  }
}

class NavigationControl {}

class GeoJSONSource {
  getClusterExpansionZoom() {
    return Promise.resolve(0);
  }
  setData() {}
}

const maplibregl = {
  Map,
  Popup,
  Marker,
  NavigationControl,
  GeoJSONSource,
  LngLat,
  LngLatBounds,
};

module.exports = maplibregl;
module.exports.Map = Map;
module.exports.Popup = Popup;
module.exports.Marker = Marker;
module.exports.NavigationControl = NavigationControl;
module.exports.GeoJSONSource = GeoJSONSource;
module.exports.LngLat = LngLat;
module.exports.LngLatBounds = LngLatBounds;
module.exports.default = maplibregl;
