import { AmplifyGeocoderAPI } from "../src/AmplifyMapLibreGeocoder";
import { Geo } from "@aws-amplify/geo";

jest.mock("@aws-amplify/geo");

describe("AmplifyGeocoderAPI", () => {
  beforeEach(() => {
    (Geo.searchByText as jest.Mock).mockClear();
    (Geo.searchByCoordinates as jest.Mock).mockClear();
    (Geo.searchForSuggestions as jest.Mock).mockClear();
  });

  test("forwardGeocode returns some values in the expected format", async () => {
    const config = {
      query: "a map query",
    };
    (Geo.searchByText as jest.Mock).mockReturnValueOnce([
      {
        addressNumber: "1800",
        country: "USA",
        geometry: {
          point: [-123, 45],
        },
        label: "A fake place",
        postalCode: "12345",
        street: "1st Street",
      },
    ]);
    const response = await AmplifyGeocoderAPI.forwardGeocode(config);
    expect(Geo.searchByText).toHaveBeenCalledTimes(1);
    expect(response.features).toHaveLength(1);
    expect(response.features[0].geometry).toBeDefined();
  });

  test("forwardGeocode returns empty feature array on empty response", async () => {
    const config = {
      query: "a map query",
    };
    (Geo.searchByText as jest.Mock).mockReturnValueOnce([]);
    const response = await AmplifyGeocoderAPI.forwardGeocode(config);
    expect(Geo.searchByText).toHaveBeenCalledTimes(1);
    expect(response.features).toHaveLength(0);
  });

  test("forwardGeocode returns empty feature array on undefined response", async () => {
    const config = {
      query: "a map query",
    };
    (Geo.searchByText as jest.Mock).mockReturnValueOnce(undefined);
    const response = await AmplifyGeocoderAPI.forwardGeocode(config);
    expect(Geo.searchByText).toHaveBeenCalledTimes(1);
    expect(response.features).toHaveLength(0);
  });

  test("forwardGeocode returns empty feature array on error", async () => {
    const config = {
      query: "a map query",
    };
    (Geo.searchByText as jest.Mock).mockRejectedValueOnce("an error");
    const response = await AmplifyGeocoderAPI.forwardGeocode(config);
    expect(Geo.searchByText).toHaveBeenCalledTimes(1);
    expect(response.features).toHaveLength(0);
  });

  test("forwardGeocode prioritizes bbox over proximity value", async () => {
    const config = {
      query: "a map query",
      bbox: [
        -123.31020325000009, 37.41870932473893, -121.55239075000021,
        38.12753577367528,
      ],
      promixity: [-122.431297, 37.773972],
    };
    await AmplifyGeocoderAPI.forwardGeocode(config);
    expect(
      (Geo.searchByText as jest.Mock).mock.calls[0][1].biasPosition
    ).toBeUndefined();
    expect(
      (Geo.searchByText as jest.Mock).mock.calls[0][1].searchAreaConstraints
    ).toBeDefined();
  });

  test("reverseGeocode returns some values in the expected format", async () => {
    const config = {
      query: "-123, 45",
    };
    (Geo.searchByCoordinates as jest.Mock).mockReturnValueOnce({
      addressNumber: "1800",
      country: "USA",
      geometry: {
        point: [-123, 45],
      },
      label: "A fake place",
      postalCode: "12345",
      street: "1st Street",
    });
    const response = await AmplifyGeocoderAPI.reverseGeocode(config);
    expect(Geo.searchByCoordinates).toHaveBeenCalledTimes(1);
    expect(response.features).toHaveLength(1);
    expect(response.features[0].geometry).toBeDefined();
  });

  test("reverseGeocode returns empty feature array on empty response", async () => {
    const config = {
      query: "-123, 45",
    };
    (Geo.searchByCoordinates as jest.Mock).mockReturnValueOnce({});
    const response = await AmplifyGeocoderAPI.reverseGeocode(config);
    expect(Geo.searchByCoordinates).toHaveBeenCalledTimes(1);
    expect(response.features).toHaveLength(0);
  });

  test("reverseGeocode returns empty feature array on undefined response", async () => {
    const config = {
      query: "-123, 45",
    };
    (Geo.searchByCoordinates as jest.Mock).mockReturnValueOnce(undefined);
    const response = await AmplifyGeocoderAPI.reverseGeocode(config);
    expect(Geo.searchByCoordinates).toHaveBeenCalledTimes(1);
    expect(response.features).toHaveLength(0);
  });

  test("reverseGeocode returns empty feature array on error", async () => {
    const config = {
      query: "-123, 45",
    };
    (Geo.searchByCoordinates as jest.Mock).mockRejectedValueOnce("an error");
    const response = await AmplifyGeocoderAPI.reverseGeocode(config);
    expect(Geo.searchByCoordinates).toHaveBeenCalledTimes(1);
    expect(response.features).toHaveLength(0);
  });

  test("forwardGeocode prioritizes bbox over proximity value", async () => {
    const config = {
      query: "a map query",
      bbox: [
        -123.31020325000009, 37.41870932473893, -121.55239075000021,
        38.12753577367528,
      ],
      promixity: [-122.431297, 37.773972],
    };
    (Geo.searchForSuggestions as jest.Mock).mockRejectedValueOnce("an error");
    expect(
      (Geo.searchForSuggestions as jest.Mock).mock.calls[0][1].biasPosition
    ).toBeUndefined();
    expect(
      (Geo.searchForSuggestions as jest.Mock).mock.calls[0][1]
        .searchAreaConstraints
    ).toBeDefined();
  });
});
