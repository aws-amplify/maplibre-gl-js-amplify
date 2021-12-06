import { Map as maplibreMap } from "maplibre-gl";
import { AmplifyGeofenceControl } from "../src/AmplifyGeofenceControl";
import { getGeofenceFeatureFromPolygon } from "../src/geofenceUtils";
import { AmplifyGeofenceControlUI } from "../src/AmplifyGeofenceControl/ui";
import { AmplifyMapboxDraw } from "../src/AmplifyGeofenceControl/AmplifyMapboxDraw";

const drawGet = jest.fn();
jest.mock("../src/AmplifyGeofenceControl/AmplifyMapboxDraw");

jest.mock("../src/AmplifyGeofenceControl/ui");
jest.mock("maplibre-gl");

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

  test("Constructor test", () => {
    const control = new AmplifyGeofenceControl({
      geofenceCollectionId: "anyString",
    });
    expect(control._geofenceCollectionId).toBe("anyString");
  });

  test("Save Geofence", () => {
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

    control._editingGeofenceId = "foobar";
    control.saveGeofence();
    expect(control._loadedGeofences["foobar"]).toBeDefined();
    expect(control._loadedGeofences["foobar"].id).toBe("foobar");
  });

  test("Delete Geofence", () => {
    const control = new AmplifyGeofenceControl({
      geofenceCollectionId: "anyString",
    });
    control._map = new maplibreMap();
    control._ui = AmplifyGeofenceControlUI(
      control,
      {} as unknown as HTMLElement
    );
    control._drawGeofencesOutput = mockDrawGeofencesOutput;

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
        id: "foobar",
      },
    };

    control.deleteGeofence("foobar");
    expect(control._loadedGeofences["foobar"]).toBeUndefined();
  });
});
