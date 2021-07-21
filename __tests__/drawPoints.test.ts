import { Map as maplibreMap } from "maplibre-gl";
import { MAP_STYLES } from "../src/constants";
import { drawPoints } from "../src/drawPoints";

jest.mock("maplibre-gl");

describe("drawPoints", () => {
  test("drawPoints default options", () => {
    const map = new maplibreMap();
    drawPoints(
      "foo",
      [
        [-123.1187, 49.2819],
        [-122.849, 49.1913],
      ],
      map,
      {},
      MAP_STYLES.ESRI_NAVIGATION
    );

    const mockInstance = (maplibreMap as jest.Mock).mock.instances[0];

    expect(mockInstance.addSource.mock.calls[0][0]).toEqual(
      "foo-source-points"
    );
    expect(
      mockInstance.addSource.mock.calls[0][1].data.features.length
    ).toEqual(2);
    expect(mockInstance.addLayer).toHaveBeenCalledTimes(2);
  });
});
