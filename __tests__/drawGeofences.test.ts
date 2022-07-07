import { Map as maplibreMap } from "maplibre-gl";
import { drawGeofences } from "../src/drawGeofences";

jest.mock("maplibre-gl");

describe("drawGeofences", () => {
  test("drawPoints default options", () => {
    const map = new maplibreMap({ container: '', style: '' });
    const data: any = [
      [
        [
          [-122.4992749052739, 37.776957051070596],
          [-122.4937817412115, 37.71560362460596],
          [-122.39284485156284, 37.737327467087184],
          [-122.41207092578165, 37.785911481104975],
          [-122.4992749052739, 37.776957051070596],
        ],
      ],
    ];
    const { hide } = drawGeofences("my-geofence", data, map);

    const mockInstance = (maplibreMap as jest.Mock).mock.instances[0];

    expect(mockInstance.addSource.mock.calls[0][0]).toEqual("my-geofence");
    expect(
      mockInstance.addSource.mock.calls[0][1].data.geometry.coordinates.length
    ).toEqual(1);
    expect(mockInstance.addLayer).toHaveBeenCalledTimes(2);

    hide();
    expect(mockInstance.setLayoutProperty).toHaveBeenCalledTimes(2);
  });
});
