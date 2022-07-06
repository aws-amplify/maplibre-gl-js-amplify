/**
 * @jest-environment jsdom
 */
import { Amplify } from "@aws-amplify/core"; 
import { Geo } from "@aws-amplify/geo";
import type { AmazonLocationServiceMapStyle } from "@aws-amplify/geo";
 
import { createMap } from "../src/AmplifyMapLibreRequest";

jest.mock("@aws-amplify/geo");

describe('createMap', () => {
  Amplify.Auth = {};
  Amplify.Auth.currentCredentials = jest.fn().mockImplementation(() => {
    return {
      accessKeyId: "accessKeyId",
      sessionToken: "sessionTokenId",
      secretAccessKey: "secretAccessKey",
      identityId: "identityId",
      authenticated: true,
      expiration: new Date(),
    };
  });

  beforeEach(() => {
    (Geo.getDefaultMap as jest.Mock).mockClear();
  });

  test("createMap returns a map object", async () => {
    (Geo.getDefaultMap as jest.Mock).mockReturnValueOnce({
      mapName: "",
      region: "us-east-1",
      style: "VectorEsriStreets"
    } as AmazonLocationServiceMapStyle);

    const el = document.createElement("div");
    el.setAttribute("id", "map");
    document.body.appendChild(el);

    const map = await createMap({
      container: "map",
      center: [-123.1187, 49.2819],
      zoom: 11,
    });

    expect(map).toBeDefined();
  });
});
