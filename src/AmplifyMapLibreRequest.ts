import { Auth, Signer } from "aws-amplify";
import { ICredentials } from "@aws-amplify/core";
import {
  Map as maplibreMap,
  RequestParameters,
  MapboxOptions,
} from "maplibre-gl";

interface CreateMapOptions extends MapboxOptions {
  region?: string;
}
export default class AmplifyMapLibreRequest {
  credentials: ICredentials;
  region: string;
  constructor(currentCredentials: ICredentials, region: string) {
    this.credentials = currentCredentials;
    this.region = region;
    this.refreshCredentials();
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
    const expiration = new Date(this.credentials.expiration);
    const timeout = expiration.getTime() - new Date().getTime() - 10000; // Adds a 10 second buffer time before the next refresh
    setTimeout(this.refreshCredentials, timeout);
  };

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
