import { Map as maplibreMap } from "maplibre-gl";
import { MAP_STYLES } from "../src/constants";
import { drawPoints } from "../src/drawPoints";

const addSourceMock = jest.fn();
const addLayerMock = jest.fn();
const fitBoundsMock = jest.fn();
const addImageMock = jest.fn();

jest.mock("maplibre-gl", () => {
  return {
    Map: jest.fn().mockImplementation(() => {
      return {
        addLayer: addLayerMock,
        addSource: addSourceMock,
        on: jest.fn(),
        addImage: addImageMock,
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
    addImageMock.mockClear();
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

  test("drawPoints custom markers", () => {
    const icon1 = "foobar";
    const icon2 = "barbaz";

    const map = new maplibreMap();
    drawPoints(
      "foo",
      [
        [-123.1187, 49.2819],
        [-122.849, 49.1913],
      ],
      map,
      {
        unclusteredOptions: {
          // Icon should be an HTMLImageElement but since we're not testing in browser, just testing that addImage is called with custom icon
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          markerImageElement: icon1,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          activeMarkerImageElement: icon2,
        },
      },
      MAP_STYLES.ESRI_NAVIGATION
    );

    expect(addImageMock.mock.calls[0][1]).toEqual(icon1);
    expect(addImageMock.mock.calls[1][1]).toEqual(icon2);
  });

  test("drawPoints custom markers, if active marker not passed used same as regular", () => {
    const icon = "foobar";

    const map = new maplibreMap();
    drawPoints(
      "foo",
      [
        [-123.1187, 49.2819],
        [-122.849, 49.1913],
      ],
      map,
      {
        unclusteredOptions: {
          // Icon should be an HTMLImageElement but since we're not testing in browser, just testing that addImage is called with custom icon
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          markerImageElement: icon,
        },
      },
      MAP_STYLES.ESRI_NAVIGATION
    );

    expect(addImageMock.mock.calls[0][1]).toEqual(icon);
    expect(addImageMock.mock.calls[1][1]).toEqual(icon);
  });
});
