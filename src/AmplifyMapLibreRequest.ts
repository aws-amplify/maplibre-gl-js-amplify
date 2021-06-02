import { Signer } from "aws-amplify";
import { ICredentials } from "@aws-amplify/core";
import { RequestParameters } from "maplibre-gl";

export default class AmplifyMapLibreRequest {
  credentials: ICredentials;
  region: string;
  constructor(currentCredentials: ICredentials, region?: string) {
    this.credentials = currentCredentials;
    this.region = region || "us-west-2";
  }

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
