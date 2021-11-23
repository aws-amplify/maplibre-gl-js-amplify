import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { IControl, Map } from "maplibre-gl";
import {
  CircleMode,
  SimpleSelectMode,
  DirectMode,
} from "mapbox-gl-draw-circle";
import { Coordinates } from "../types";
import { Feature, Geometry } from "geojson";
import {
  getPolygonFromBounds,
  getGeofenceFeatureFromPolygon,
  getCircleFeatureFromCoords,
} from "../geofenceUtils";

export class AmplifyMapboxDraw {
  _map: Map;
  _ui;
  _mapBoxDraw: MapboxDraw = new MapboxDraw({
    displayControlsDefault: false,
    defaultMode: "simple_select",
    userProperties: true,
    controls: {
      trash: false,
    },
    modes: {
      ...MapboxDraw.modes,
      draw_circle: CircleMode,
      direct_select: DirectMode,
      simple_select: SimpleSelectMode,
    },
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
    this.enable();
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

  enable(): void {
    if (this._map.hasControl(this._mapBoxDraw as unknown as IControl)) {
      return;
    }
    this._map.addControl(
      this._mapBoxDraw as unknown as IControl,
      "bottom-right"
    );
    this._ui.createGeofenceCreateContainer();
  }

  drawPolygonGeofence(id: string): void {
    const mapBounds = this._map.getBounds();
    const polygon = getPolygonFromBounds(mapBounds);
    const data: Feature = {
      id,
      ...getGeofenceFeatureFromPolygon(polygon),
    };
    this.add(data);
  }

  drawCircularGeofence(id: string, radius?: number): void {
    const mapBounds = this._map.getBounds();
    const circleFeature = getCircleFeatureFromCoords(
      this._map.getCenter().toArray() as Coordinates,
      { bounds: mapBounds, radius }
    );
    const data: Feature = {
      id,
      ...circleFeature,
    };
    this.add(data);
  }
}
