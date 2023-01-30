import { AmplifyGeocoderAPI } from "../src/AmplifyMapLibreGeocoder";
import { Geo } from "@aws-amplify/geo";

jest.mock("@aws-amplify/geo");

describe("AmplifyGeocoderAPI", () => {
  beforeEach(() => {
    (Geo.searchByText as jest.Mock).mockClear();
    (Geo.searchByCoordinates as jest.Mock).mockClear();
    (Geo.searchForSuggestions as jest.Mock).mockClear();
    (Geo.searchByPlaceId as jest.Mock).mockClear();
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

  test("getSuggestions returns some values in the expected format", async () => {
    const config = {
      query: "a map query",
    };
    (Geo.searchForSuggestions as jest.Mock).mockReturnValueOnce([
      {
        text: "a suggestion result",
        placeId: "a1b2c3d4",
      }
    ]);
    const response = await AmplifyGeocoderAPI.getSuggestions(config);
    expect(Geo.searchForSuggestions).toHaveBeenCalledTimes(1);
    expect(response.suggestions).toHaveLength(1);
    expect(response.suggestions[0].text).toBe("a suggestion result");
    expect(response.suggestions[0].placeId).toBe("a1b2c3d4");
  });

  test("getSuggestions returns empty array on empty response", async () => {
    const config = {
      query: "a map query",
    };
    (Geo.searchForSuggestions as jest.Mock).mockReturnValueOnce([]);
    const response = await AmplifyGeocoderAPI.getSuggestions(config);
    expect(Geo.searchForSuggestions).toHaveBeenCalledTimes(1);
    expect(response.suggestions).toHaveLength(0);
  });

  test("getSuggestions returns empty feature array on undefined response", async () => {
    const config = {
      query: "a map query",
    };
    (Geo.searchForSuggestions as jest.Mock).mockReturnValueOnce(undefined);
    const response = await AmplifyGeocoderAPI.getSuggestions(config);
    expect(Geo.searchForSuggestions).toHaveBeenCalledTimes(1);
    expect(response.suggestions).toHaveLength(0);
  });

  test("getSuggestions returns empty feature array on error", async () => {
    const config = {
      query: "a map query",
    };
    (Geo.searchForSuggestions as jest.Mock).mockRejectedValueOnce("an error");
    const response = await AmplifyGeocoderAPI.getSuggestions(config);
    expect(Geo.searchForSuggestions).toHaveBeenCalledTimes(1);
    expect(response.suggestions).toHaveLength(0);
  });

  test("searchByPlaceId returns some values in the expected format", async () => {
    const config = {
      query: "a1b2c3d4",
    };
    (Geo.searchByPlaceId as jest.Mock).mockReturnValueOnce({
      addressNumber: "1401",
      street: "Broadway",
      country: "USA",
      postalCode: "98122",
      geometry: {
        point: [
          -122.32108099999999,
          47.613897000000065
        ]
      },
      label: "Starbucks"
    });
    const response = await AmplifyGeocoderAPI.searchByPlaceId(config);
    expect(Geo.searchByPlaceId).toHaveBeenCalledTimes(1);
    expect(response.place?.text).toBe("Starbucks");
    expect(response.place?.place_name).toBe("Starbucks");
  });

  test("searchByPlaceId returns place as undefined on empty request", async () => {
    const config = {
      query: "",
    };
    (Geo.searchByPlaceId as jest.Mock).mockReturnValueOnce(undefined);
    const response = await AmplifyGeocoderAPI.searchByPlaceId(config);
    expect(Geo.searchByPlaceId).toHaveBeenCalledTimes(1);
    expect(response.place).toBe(undefined);
  });

  test("searchByPlaceId returns place as undefined on undefined request", async () => {
    const config = {
      query: undefined,
    };
    (Geo.searchByPlaceId as jest.Mock).mockReturnValueOnce(undefined);
    const response = await AmplifyGeocoderAPI.searchByPlaceId(config);
    expect(Geo.searchByPlaceId).toHaveBeenCalledTimes(1);
    expect(response.place).toBe(undefined);
  });

  test("searchByPlaceId returns place as undefined on error", async () => {
    const config = {
      query: "something",
    };
    (Geo.searchByPlaceId as jest.Mock).mockRejectedValueOnce("an error");
    const response = await AmplifyGeocoderAPI.searchByPlaceId(config);
    expect(Geo.searchByPlaceId).toHaveBeenCalledTimes(1);
    expect(response.place).toBe(undefined);
  });
});
