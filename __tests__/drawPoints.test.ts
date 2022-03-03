import { Map as maplibreMap } from "maplibre-gl";
import { MAP_STYLES } from "../src/constants";
import { drawPoints } from "../src/drawPoints";

const addSourceMock = jest.fn();
const addLayerMock = jest.fn();
const fitBoundsMock = jest.fn();

jest.mock("maplibre-gl", () => {
  return {
    Map: jest.fn().mockImplementation(() => {
      return {
        addLayer: addLayerMock,
        addSource: addSourceMock,
        on: jest.fn(),
        addImage: jest.fn(),
        getBounds: jest.fn().mockImplementation(() => {
          return {
            extend: jest.fn(),
          };
        }),
        fitBounds: fitBoundsMock,
      };
    }),
  };
});

describe("drawPoints", () => {
  beforeEach(() => {
    addSourceMock.mockClear();
    addLayerMock.mockClear();
    fitBoundsMock.mockClear();
  });

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

    expect(addSourceMock.mock.calls[0][0]).toEqual("foo");
    expect(addSourceMock.mock.calls[0][1].data.features.length).toEqual(2);
    expect(addLayerMock).toHaveBeenCalledTimes(2);
    expect(fitBoundsMock).toHaveBeenCalledTimes(1);
  });

  test("drawPoints autoFit false", () => {
    const map = new maplibreMap();
    drawPoints(
      "foo",
      [
        [-123.1187, 49.2819],
        [-122.849, 49.1913],
      ],
      map,
      {
        autoFit: false,
      },
      MAP_STYLES.ESRI_NAVIGATION
    );

    expect(addSourceMock.mock.calls[0][0]).toEqual("foo");
    expect(addSourceMock.mock.calls[0][1].data.features.length).toEqual(2);
    expect(addLayerMock).toHaveBeenCalledTimes(2);
    expect(fitBoundsMock).toHaveBeenCalledTimes(0);
  });
});
