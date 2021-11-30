import { Polygon } from "@turf/helpers";
import { LngLatBounds } from "maplibre-gl";
import {
  getCircleFeatureFromCoords,
  getPolygonFeatureFromBounds,
} from "../src/geofenceUtils";

describe("geofence utils", () => {
  test("getCircleFeatureFromCoords", () => {
    const bounds = new LngLatBounds([-114, 50], [-134, 30]);
    const feature = getCircleFeatureFromCoords("any", [-100, 30], { bounds });

    expect(feature.properties.center).toStrictEqual([-100, 30]);
    expect((feature.geometry as Polygon).coordinates[0].length).toBe(65);
    expect((feature.geometry as Polygon).coordinates[0][0]).toStrictEqual([
      -100, 33.12815904505402,
    ]);
    expect((feature.geometry as Polygon).coordinates[0][64]).toStrictEqual([
      -100, 33.12815904505402,
    ]);
  });

  test("getPolygonFeatureFromBounds", () => {
    const bounds = new LngLatBounds([-114, 50], [-134, 30]);
    const feature = getPolygonFeatureFromBounds("any", bounds);

    expect((feature.geometry as Polygon).coordinates[0].length).toBe(5);
    expect((feature.geometry as Polygon).coordinates[0][0]).toStrictEqual([
      -120.23385574531386, 35.28556661782023,
    ]);
    expect((feature.geometry as Polygon).coordinates[0][4]).toStrictEqual([
      -120.23385574531386, 35.28556661782023,
    ]);
  });
});
