import { Auth } from "aws-amplify";
import AmplifyMap from "../src/AmplifyMap";

jest.mock("maplibre-gl");

Auth.currentCredentials = jest.fn().mockImplementation(() => {
  return Promise.resolve({
    accessKeyId: "accessKeyId",
    sessionToken: "sessionTokenId",
    secretAccessKey: "secretAccessKey",
    identityId: "identityId",
    authenticated: true,
    expiration: new Date(),
  });
});

describe("AmplifyMap", () => {
  test("Constructor test", () => {
    new AmplifyMap({
      container: "map",
      center: [-123.1187, 49.2819], // initial map center point
      zoom: 10, // initial map zoom
      style: "test-maps-1",
      region: "us-west-2",
    });
    expect(Auth.currentCredentials).toHaveBeenCalledTimes(1);
  });
});
