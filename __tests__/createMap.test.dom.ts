import { fetchAuthSession } from '@aws-amplify/core';
import { Geo } from 'aws-amplify/geo';
import type { AmazonLocationServiceMapStyle } from 'aws-amplify/geo';

import { createMap } from '../src/AmplifyMapLibreRequest';

jest.mock('aws-amplify/geo');

jest.mock('@aws-amplify/core', () => {
  const originalModule = jest.requireActual('@aws-amplify/core');
  return {
    ...originalModule,
    fetchAuthSession: jest.fn(),
    Amplify: {
      getConfig: jest.fn(),
    },
  };
});

(fetchAuthSession as jest.Mock).mockImplementation(() => {
  return Promise.resolve({
    credentials: {
      accessKeyId: 'accessKeyId',
      sessionToken: 'sessionTokenId',
      secretAccessKey: 'secretAccessKey',
      identityId: 'identityId',
      authenticated: true,
      expiration: new Date(),
    },
  });
});

describe('createMap', () => {
  beforeEach(() => {
    (Geo.getDefaultMap as jest.Mock).mockClear();
  });

  test('createMap returns a map object', async () => {
    (Geo.getDefaultMap as jest.Mock).mockReturnValue({
      mapName: 'map1ff111f1-staging',
      region: 'us-east-1',
      style: 'VectorEsriStreets',
    } as AmazonLocationServiceMapStyle);

    const el = document.createElement('div');
    el.setAttribute('id', 'map');
    document.body.appendChild(el);

    const map = await createMap({
      container: 'map',
      center: [-123.1187, 49.2819],
      zoom: 11,
    });

    expect(map).toBeDefined();
  });
});
