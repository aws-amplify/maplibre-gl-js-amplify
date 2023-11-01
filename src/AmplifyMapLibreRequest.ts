import { Hub, fetchAuthSession } from '@aws-amplify/core';
import {
  Signer,
  jitteredExponentialRetry,
  getAmplifyUserAgent,
} from '@aws-amplify/core/internals/utils';
import { Geo, AmazonLocationServiceMapStyle } from '@aws-amplify/geo';
import { Map as MaplibreMap, RequestParameters, MapOptions } from 'maplibre-gl';
import { urlEncodePeriods } from './utils';
import { UserAgent as AWSUserAgent } from '@aws-sdk/types';
import { AuthSession } from '@aws-amplify/core/lib-esm/singleton/Auth/types';

/**
 * The upgrade from maplibre v1 to maplibre v2 changed the `style` property from optional to required.
 * We keep the property optional here since we default to the map name for the maplibre style field and
 * it maintains backwards compatibility with the upgrade to maplibre v2.
 */
interface CreateMapOptions
  extends Omit<MapOptions, 'style'>,
    Partial<Pick<MapOptions, 'style'>> {
  region?: string;
  mapConstructor?: typeof MaplibreMap;
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
  credentials: AuthSession['credentials'];
  region: string;
  activeTimeout: number;
  constructor(currentCredentials: AuthSession['credentials'], region: string) {
    this.credentials = currentCredentials;
    this.region = region;
    this.activeTimeout = null;
    this.refreshCredentialsWithRetry();

    Hub.listen('auth', (data) => {
      switch (data.payload.event) {
        // This was removed from v6 but will be added back before GA
        case 'signedIn':
        case 'signedOut':
        case 'tokenRefresh':
          this.refreshCredentialsWithRetry();
          break;
      }
    });
  }

  static createMapLibreMap = async (
    options: CreateMapOptions
  ): Promise<MaplibreMap> => {
    const { region, mapConstructor = MaplibreMap, ...maplibreOption } = options;
    const defaultMap = Geo.getDefaultMap() as AmazonLocationServiceMapStyle;

    const amplifyRequest = new AmplifyMapLibreRequest(
      (await fetchAuthSession()).credentials,
      region || defaultMap.region
    );
    const transformRequest = amplifyRequest.transformRequest;
    const map = new mapConstructor({
      ...maplibreOption,
      style: options.style || defaultMap.mapName, // Amplify uses the name of the map in the maplibre style field,
      transformRequest,
    });

    return map;
  };

  refreshCredentials = async (): Promise<void> => {
    try {
      this.credentials = (await fetchAuthSession()).credentials;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(`Failed to refresh credentials: ${e}`);
      throw e;
    }
  };

  refreshCredentialsWithRetry = async (): Promise<void> => {
    try {
      const MAX_DELAY_MS = 5 * 60 * 1000; // 5 minutes
      await jitteredExponentialRetry(this.refreshCredentials, [], MAX_DELAY_MS);

      // Refresh credentials on a timer because HubEvents do not trigger on credential refresh currently
      this.activeTimeout && clearTimeout(this.activeTimeout);
      // Refresh credentials when expiration time is later than now
      if (this.credentials.expiration.getTime() > new Date().getTime()) {
        const expiration = new Date(this.credentials.expiration);
        const timeout = expiration.getTime() - new Date().getTime() - 10000; // Adds a 10 second buffer time before the next refresh
        this.activeTimeout = window.setTimeout(
          this.refreshCredentialsWithRetry,
          Math.min(timeout, 3600000) // Set timeout to an hour if we somehow don't have a value for timeout
        );
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(`Failed to refresh credentials: ${e}`);
    }
  };

  /**
   * A callback function that can be passed to a maplibre map object that is run before the map makes a request for an external URL. This transform request is used to sign the request with AWS Sigv4 Auth. [https://maplibre.org/maplibre-gl-js-docs/api/map/](https://maplibre.org/maplibre-gl-js-docs/api/map/)
   * @param {string} url
   * @param {string} resourceType
   * @returns {RequestParameters} [https://maplibre.org/maplibre-gl-js-docs/api/properties/#requestparameters](https://maplibre.org/maplibre-gl-js-docs/api/properties/#requestparameters)
   */
  transformRequest = (url: string, resourceType: string): RequestParameters => {
    let styleUrl = url;
    console.log('transformrequest')
    if (resourceType === 'Style' && !url.includes('://')) {
      if (this.region == undefined) {
        throw new Error(
          'AWS region for map is undefined. Please verify that the region is set in aws-exports.js or that you are providing an AWS region parameter to createMap'
        );
      }
      styleUrl = `https://maps.geo.${this.region}.amazonaws.com/maps/v0/maps/${url}/style-descriptor`;
    }

    const urlObject = new URL(styleUrl);
    if (urlObject.hostname.endsWith('.amazonaws.com')) {
      // only sign AWS requests (with the signature as part of the query string)
      urlObject.searchParams.append(
        'x-amz-user-agent',
        encodeURIComponent(urlEncodePeriods(getAmplifyUserAgentString()))
      );
      return {
        url: Signer.signUrl(urlObject.href, {
          access_key: this.credentials.accessKeyId,
          secret_key: this.credentials.secretAccessKey,
          session_token: this.credentials.sessionToken,
        }),
      };
    }
  };
}

export const createMap = async (
  options: CreateMapOptions
): Promise<MaplibreMap> => {
  return AmplifyMapLibreRequest.createMapLibreMap(options);
};

// TODO - Delete this and import from @aws-amplify/core when it is released
function getAmplifyUserAgentString() {
  const userAgent = getAmplifyUserAgent();
  if (userAgent && typeof userAgent === 'object') {
    return (userAgent as AWSUserAgent[])
      .map(([agentKey, agentValue]) => `${agentKey}/${agentValue}`)
      .join(' ');
  }
  return userAgent;
}
