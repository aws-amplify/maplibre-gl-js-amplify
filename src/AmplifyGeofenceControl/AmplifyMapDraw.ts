import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { IControl, Map } from "maplibre-gl";
import {
  CircleMode,
  SimpleSelectMode,
  DirectMode,
} from "maplibre-gl-draw-circle";
import { Coordinates } from "../types";
import { Feature, Geometry } from "geojson";
import {
  getPolygonFeatureFromBounds,
  getCircleFeatureFromCoords,
} from "../geofenceUtils";
import {
  GEOFENCE_BORDER_COLOR,
  GEOFENCE_COLOR,
  GEOFENCE_VERTEX_COLOR,
} from "../constants";

export class AmplifyMapDraw {
  _map: Map;
  _ui;
  _mapBoxDraw: MapboxDraw = new MapboxDraw({
    displayControlsDefault: false,
    defaultMode: "simple_select",
    userProperties: true,
    controls: {
      trash: true,
    },
    modes: {
      ...MapboxDraw.modes,
      draw_circle: CircleMode,
      direct_select: DirectMode,
      simple_select: SimpleSelectMode,
    },
    styles: [
      // ACTIVE (being drawn)
      // polygon fill
      {
        id: "gl-draw-polygon-fill",
        type: "fill",
        filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
        paint: {
          "fill-color": GEOFENCE_COLOR,
          "fill-outline-color": GEOFENCE_COLOR,
          "fill-opacity": 0.3,
        },
      },
      // polygon mid points
      {
        id: "gl-draw-polygon-midpoint",
        type: "circle",
        filter: ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]],
        paint: {
          "circle-radius": 5,
          "circle-color": GEOFENCE_VERTEX_COLOR,
        },
      },
      // polygon border
      {
        id: "gl-draw-polygon-stroke-active",
        type: "line",
        filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": GEOFENCE_BORDER_COLOR,
          "line-width": 4,
        },
      },
      // vertex circle
      {
        id: "gl-draw-polygon-and-line-vertex-active",
        type: "circle",
        filter: [
          "all",
          ["==", "meta", "vertex"],
          ["==", "$type", "Point"],
          ["!=", "mode", "static"],
        ],
        paint: {
          "circle-radius": 8,
          "circle-color": GEOFENCE_VERTEX_COLOR,
          "circle-stroke-color": GEOFENCE_BORDER_COLOR,
          "circle-stroke-width": 1,
        },
      },
    ],
  });

  constructor(map: Map, ui) {
    this._map = map;
    this._ui = ui;
    this.enable = this.enable.bind(this);
    this.disable = this.disable.bind(this);

    this.drawPolygonGeofence = this.drawPolygonGeofence.bind(this);
  }

  get(id: string): Feature<
    Geometry,
    {
      [name: string]: any;
    }
  > {
    return this._mapBoxDraw.get(id);
  }

  add(
    data: Feature<
      Geometry,
      {
        [name: string]: any;
      }
    >
  ): void {
    const isCircle = data.properties.isCircle;
    this.enable(isCircle);
    this._mapBoxDraw.add(data);
    this._mapBoxDraw.changeMode("direct_select" as any, {
      featureId: data.id as string,
    });
  }

  delete(id: string): void {
    this._mapBoxDraw.delete(id);
  }

  disable(): void {
    if (this._map.hasControl(this._mapBoxDraw as unknown as IControl)) {
      this._map.removeControl(this._mapBoxDraw as unknown as IControl);
    }
    this._ui.removeGeofenceCreateContainer();
  }

  enable(isCircle?: boolean): void {
    if (this._map.hasControl(this._mapBoxDraw as unknown as IControl)) {
      return;
    }
    this._map.addControl(
      this._mapBoxDraw as unknown as IControl,
      "bottom-right"
    );
    this._ui.createGeofenceCreateContainer(isCircle);
  }

  /**
   * Draws a polygonal geofence around the center of the current map view. The polygon defaults to 3/4 the size of the current map bounds
   * @param id the geofence geojson id
   */
  drawPolygonGeofence(id: string): void {
    const mapBounds = this._map.getBounds();
    const feature = getPolygonFeatureFromBounds(id, mapBounds);
    this.add(feature);
  }

  /**
   * Draws a cicular geofence around the center of the current map view
   * @param id the geofence geojson id
   * @param radius optional parameter for setting the radius of the cicular geofence, default to 1/8th of the current map bounds length
   */
  drawCircularGeofence(id: string, radius?: number): void {
    const mapBounds = this._map.getBounds();
    const circleFeature = getCircleFeatureFromCoords(
      id,
      this._map.getCenter().toArray() as Coordinates,
      { bounds: mapBounds, radius }
    );

    this.add(circleFeature);

    this._ui.updateGeofenceRadius(
      radius || circleFeature.properties.radius.toFixed(2)
    );
  }
}
