import { Map as maplibreMap } from "maplibre-gl";
import { AmplifyGeofenceControl } from "../src/AmplifyGeofenceControl";
import { getGeofenceFeatureFromPolygon } from "../src/geofenceUtils";
import { AmplifyGeofenceControlUI } from "../src/AmplifyGeofenceControl/ui";
import { AmplifyMapboxDraw } from "../src/AmplifyGeofenceControl/AmplifyMapboxDraw";
import { Geo } from "@aws-amplify/geo";

jest.mock("../src/AmplifyGeofenceControl/AmplifyMapboxDraw");

jest.mock("../src/AmplifyGeofenceControl/ui");
jest.mock("maplibre-gl");
jest.mock("@aws-amplify/geo");

const mockDrawGeofencesOutput = {
  sourceId: "sourceId",
  outlineLayerId: "outlineLayerId",
  fillLayerId: "fillLayerId",
  show: jest.fn(),
  hide: jest.fn(),
  isVisible: jest.fn(),
  setData: jest.fn(),
};

describe("AmplifyGeofenceControl", () => {
  beforeAll(() => {
    (AmplifyGeofenceControlUI as jest.Mock).mockImplementation(() => {
      return {
        renderListItem: jest.fn(),
        updateCheckbox: jest.fn(),
        setGeofenceListEnabled: jest.fn(),
        enableGeofenceList: jest.fn(),
        removeGeofenceListItem: jest.fn(),
        updateGeofenceCount: jest.fn(),
      };
    });

    (AmplifyMapboxDraw as jest.Mock).mockImplementation(() => {
      return {
        get: () =>
          getGeofenceFeatureFromPolygon([
            [
              [-124.0488709112, 35.9978649131],
              [-119.5127318998, 35.9978649131],
              [-119.5127318998, 38.315786399],
              [-124.0488709112, 38.315786399],
              [-124.0488709112, 35.9978649131],
            ],
          ]),
        disable: jest.fn(),
        enable: jest.fn(),
      };
    });
  });

  const createMockControl = () => {
    const control = new AmplifyGeofenceControl({
      geofenceCollectionId: "anyString",
    });
    control._map = new maplibreMap();
    control._ui = AmplifyGeofenceControlUI(
      control,
      {} as unknown as HTMLElement
    );
    control._amplifyDraw = new AmplifyMapboxDraw(control._map, control._ui);
    control._drawGeofencesOutput = mockDrawGeofencesOutput;
    return control;
  };

  test("Constructor test", () => {
    const control = new AmplifyGeofenceControl({
      geofenceCollectionId: "anyString",
    });
    expect(control._geofenceCollectionId).toBe("anyString");
  });

  test("Create Geofence", async () => {
    const control = createMockControl();

    (Geo.createGeofences as jest.Mock).mockReturnValueOnce({
      successes: [
        {
          geofenceId: "foobar",
          createTime: "2020-04-01T21:00:00.000Z",
          updateTime: "2020-04-01T21:00:00.000Z",
        },
      ],
      errors: [],
    });

    control._editingGeofenceId = "foobar";
    await control.createGeofence();
    expect(control._loadedGeofences["foobar"]).toBeDefined();
    expect(control._loadedGeofences["foobar"].geofenceId).toBe("foobar");
  });

  test("Create Geofence API error", async () => {
    const control = createMockControl();

    (Geo.createGeofences as jest.Mock).mockReturnValueOnce({
      successes: [],
      errors: [
        {
          geofenceId: "foobar",
          error: {
            code: "111",
            message: "mockError",
          },
        },
      ],
    });

    control._editingGeofenceId = "foobar";
    await expect(control.createGeofence()).rejects.toThrow();
  });

  test("Update Geofence", async () => {
    const control = createMockControl();

    (Geo.updateGeofences as jest.Mock).mockReturnValueOnce({
      successes: [
        {
          geofenceId: "foobar",
          createTime: "2020-04-01T21:00:00.000Z",
          updateTime: "2020-04-01T21:00:00.000Z",
        },
      ],
      errors: [],
    });

    control._editingGeofenceId = "foobar";
    await control.updateGeofence();
    expect(control._loadedGeofences["foobar"]).toBeDefined();
    expect(control._loadedGeofences["foobar"].geofenceId).toBe("foobar");
  });

  test("Update Geofence API error", async () => {
    const control = createMockControl();

    (Geo.updateGeofences as jest.Mock).mockReturnValueOnce({
      successes: [],
      errors: [
        {
          geofenceId: "foobar",
          error: {
            code: "111",
            message: "mockError",
          },
        },
      ],
    });

    control._editingGeofenceId = "foobar";
    await expect(control.updateGeofence()).rejects.toThrow();
  });

  test("Delete Geofence", async () => {
    const control = createMockControl();

    control._loadedGeofences = {
      foobar: {
        geometry: {
          polygon: [
            [
              [-124.0488709112, 35.9978649131],
              [-119.5127318998, 35.9978649131],
              [-119.5127318998, 38.315786399],
              [-124.0488709112, 38.315786399],
              [-124.0488709112, 35.9978649131],
            ],
          ],
        },
        geofenceId: "foobar",
      },
    };

    (Geo.deleteGeofences as jest.Mock).mockReturnValueOnce({
      successes: ["foobar"],
      errors: [],
    });

    await control.deleteGeofence("foobar");
    expect(control._loadedGeofences["foobar"]).toBeUndefined();
  });

  test("Delete Geofence API error", async () => {
    const control = createMockControl();

    control._loadedGeofences = {
      foobar: {
        geometry: {
          polygon: [
            [
              [-124.0488709112, 35.9978649131],
              [-119.5127318998, 35.9978649131],
              [-119.5127318998, 38.315786399],
              [-124.0488709112, 38.315786399],
              [-124.0488709112, 35.9978649131],
            ],
          ],
        },
        geofenceId: "foobar",
      },
    };

    (Geo.deleteGeofences as jest.Mock).mockReturnValueOnce({
      errors: ["foobar"],
      successes: [],
    });

    await expect(control.deleteGeofence("foobar")).rejects.toThrow();
  });

  test("List Geofences", async () => {
    const control = createMockControl();

    (Geo.listGeofences as jest.Mock).mockReturnValueOnce({
      entries: [
        {
          geofenceId: "foobar",
          createTime: "2020-04-01T21:00:00.000Z",
          updateTime: "2020-04-01T21:00:00.000Z",
          geometry: { polygon: [] },
        },
        {
          geofenceId: "barbaz",
          createTime: "2020-04-01T21:00:00.000Z",
          updateTime: "2020-04-01T21:00:00.000Z",
          geometry: { polygon: [] },
        },
      ],
    });

    await control.listGeofences();
    expect(control._loadedGeofences["foobar"]).toBeDefined();
    expect(control._loadedGeofences["barbaz"]).toBeDefined();
  });

  test("List Geofences API error", async () => {
    const control = createMockControl();

    (Geo.listGeofences as jest.Mock).mockImplementationOnce(() => {
      throw new Error();
    });

    await expect(control.listGeofences()).rejects.toThrow();
  });
});
