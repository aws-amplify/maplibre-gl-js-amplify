import { Polygon } from "@turf/helpers";
import { LngLatBounds } from "maplibre-gl";
import {
  getCircleFeatureFromCoords,
  getPolygonFeatureFromBounds,
} from "../src/geofenceUtils";

describe("geofence utils", () => {
  test("getCircleFeatureFromCoords - creates circle from center point and bounds", () => {
    const bounds = new LngLatBounds([-114, 50], [-134, 30]);
    const feature = getCircleFeatureFromCoords("any", [-100, 30], { bounds });

    expect(feature.properties.center).toStrictEqual([-100, 30]);
    expect((feature.geometry as Polygon).coordinates[0].length).toBe(65);
    expect((feature.geometry as Polygon).coordinates[0][0]).toStrictEqual([
      -100, 33.14154104120966,
    ]);
    expect((feature.geometry as Polygon).coordinates[0][64]).toStrictEqual([
      -100, 33.14154104120966,
    ]);
  });

  test("getCircleFeatureFromCoords - center point outside bounds, bounds are just used to determine radius", () => {
    const bounds = new LngLatBounds([-114, 50], [-134, 30]);
    const feature = getCircleFeatureFromCoords("any", [-180, 90], { bounds });

    expect(feature.properties.center).toStrictEqual([-180, 90]);
    expect((feature.geometry as Polygon).coordinates[0].length).toBe(65);
    expect((feature.geometry as Polygon).coordinates[0][0]).toStrictEqual([
      -180, 86.85845895879037,
    ]);
    expect((feature.geometry as Polygon).coordinates[0][64]).toStrictEqual([
      -180, 86.85845895879037,
    ]);
  });

  test("getCircleFeatureFromCoords - fails with improper coordinates", () => {
    const bounds = new LngLatBounds([-114, 50], [-134, 30]);
    expect(() =>
      getCircleFeatureFromCoords("any", [-900, 1000], { bounds })
    ).toThrow();
  });

  test("getPolygonFeatureFromBounds - creates polygon within the bounds", () => {
    const bounds = new LngLatBounds([-114, 50], [-134, 30]);
    const feature = getPolygonFeatureFromBounds("any", bounds);

    expect((feature.geometry as Polygon).coordinates[0].length).toBe(5);
    expect((feature.geometry as Polygon).coordinates[0][0]).toStrictEqual([
      -129.43864865991324, 34.96945504363627,
    ]);
    expect((feature.geometry as Polygon).coordinates[0][4]).toStrictEqual([
      -129.43864865991324, 34.96945504363627,
    ]);
  });

  test("getPolygonFeatureFromBounds - bounds same coordinates", () => {
    const bounds = new LngLatBounds([-114, 50], [-114, 50]);
    const feature = getPolygonFeatureFromBounds("any", bounds);

    expect((feature.geometry as Polygon).coordinates[0].length).toBe(5);
    expect((feature.geometry as Polygon).coordinates[0][0]).toStrictEqual([
      -114, 50,
    ]);
    expect((feature.geometry as Polygon).coordinates[0][4]).toStrictEqual([
      -114, 50,
    ]);
  });

  test("getPolygonFeatureFromBounds - max bounds", () => {
    const bounds = new LngLatBounds([-180, -90], [180, 90]);
    const feature = getPolygonFeatureFromBounds("any", bounds);

    expect((feature.geometry as Polygon).coordinates[0].length).toBe(5);
    expect((feature.geometry as Polygon).coordinates[0][0]).toStrictEqual([
      270, 45.00000000000001,
    ]);
    expect((feature.geometry as Polygon).coordinates[0][4]).toStrictEqual([
      270, 45.00000000000001,
    ]);
  });
});
