import { Auth, Hub } from "aws-amplify";
import { ICredentials, Signer } from "@aws-amplify/core";
import {
  Map as maplibreMap,
  RequestParameters,
  MapboxOptions,
} from "maplibre-gl";

interface CreateMapOptions extends MapboxOptions {
  region?: string;
}
/**
 * An object for encapsulating an Amplify Geo transform request and Amplify credentials
 * @class AmplifyMapLibreRequest
 * @param {ICredentials} currentCredentials Amplify credentials used for signing transformRequests
 * @param {String} region AWS region
 * @return {AmplifyMapLibreRequest} `this`
 *
 */

export default class AmplifyMapLibreRequest {
  credentials: ICredentials;
  region: string;
  constructor(currentCredentials: ICredentials, region: string) {
    this.credentials = currentCredentials;
    this.region = region;

    Hub.listen("auth", (data) => {
      switch (data.payload.event) {
        case "signIn":
        case "signOut":
        case "tokenRefresh":
          this.refreshCredentials();
          break;
      }
    });
  }

  static createMapLibreMap = async ({
    container,
    center,
    zoom,
    style,
    region,
  }: CreateMapOptions): Promise<maplibreMap> => {
    const amplifyRequest = new AmplifyMapLibreRequest(
      await Auth.currentCredentials(),
      region
    );
    const transformRequest = amplifyRequest.transformRequest;
    const map = new maplibreMap({
      container,
      center,
      zoom,
      style,
      transformRequest,
    });

    return map;
  };

  refreshCredentials = async (): Promise<void> => {
    this.credentials = await Auth.currentCredentials();
  };

  /**
   * A callback function that can be passed to a maplibre map object that is run before the map makes a request for an external URL. This transform request is used to sign the request with AWS Sigv4 Auth. [https://maplibre.org/maplibre-gl-js-docs/api/map/](https://maplibre.org/maplibre-gl-js-docs/api/map/)
   * @param {string} url The function to use as a render function. This function accepts a single [Carmen GeoJSON](https://github.com/mapbox/carmen/blob/master/carmen-geojson.md) object as input and returns a string.
   * @param {string} resourceType The function to use as a render function. This function accepts a single [Carmen GeoJSON](https://github.com/mapbox/carmen/blob/master/carmen-geojson.md) object as input and returns a string.
   * @returns {RequestParameters} [https://maplibre.org/maplibre-gl-js-docs/api/properties/#requestparameters](https://maplibre.org/maplibre-gl-js-docs/api/properties/#requestparameters)
   */
  transformRequest = (url: string, resourceType: string): RequestParameters => {
    if (resourceType === "Style" && !url.includes("://")) {
      url = `https://maps.geo.${this.region}.amazonaws.com/maps/v0/maps/${url}/style-descriptor`;
    }

    if (url.includes("amazonaws.com")) {
      // only sign AWS requests (with the signature as part of the query string)
      return {
        url: Signer.signUrl(url, {
          access_key: this.credentials.accessKeyId,
          secret_key: this.credentials.secretAccessKey,
          session_token: this.credentials.sessionToken,
        }),
      };
    }
  };
}
