import AmplifyMapLibreRequest from "../src/AmplifyMapLibreRequest";
import { Credentials, Hub } from "@aws-amplify/core";

Credentials.get = jest.fn().mockImplementation(() => {
  return {
    accessKeyId: "accessKeyId",
    sessionToken: "sessionTokenId",
    secretAccessKey: "secretAccessKey",
    identityId: "identityId",
    authenticated: true,
    expiration: new Date(),
  };
});

describe("AmplifyMapLibreRequest", () => {
  test("Constructor test", () => {
    const mockCreds = {
      accessKeyId: "accessKeyId",
      sessionToken: "sessionTokenId",
      secretAccessKey: "secretAccessKey",
      identityId: "identityId",
      authenticated: true,
      expiration: new Date(),
    };
    const amplifyRequest = new AmplifyMapLibreRequest(mockCreds, "us-west-2");
    expect(amplifyRequest.credentials).toBe(mockCreds);
    expect(amplifyRequest.region).toBe("us-west-2");
    expect(typeof amplifyRequest.transformRequest).toBe("function");
  });

  test("transformRequest returned undefined for non-amazon related urls", () => {
    const mockCreds = {
      accessKeyId: "accessKeyId",
      sessionToken: "sessionTokenId",
      secretAccessKey: "secretAccessKey",
      identityId: "identityId",
      authenticated: true,
      expiration: new Date(),
    };
    const amplifyRequest = new AmplifyMapLibreRequest(mockCreds, "us-west-2");
    expect(amplifyRequest.transformRequest("https://example.com", "any")).toBe(
      undefined
    );
  });

  test("transformRequest throws an error when url is invalid", () => {
    const mockCreds = {
      accessKeyId: "accessKeyId",
      sessionToken: "sessionTokenId",
      secretAccessKey: "secretAccessKey",
      identityId: "identityId",
      authenticated: true,
      expiration: new Date(),
    };
    const amplifyRequest = new AmplifyMapLibreRequest(mockCreds, "us-west-2");
    expect(() => amplifyRequest.transformRequest("example", "any")).toThrow();
  });

  test("transformRequest returns undefined for non amazon and malicious urls", () => {
    const mockCreds = {
      accessKeyId: "accessKeyId",
      sessionToken: "sessionTokenId",
      secretAccessKey: "secretAccessKey",
      identityId: "identityId",
      authenticated: true,
      expiration: new Date(),
    };
    const amplifyRequest = new AmplifyMapLibreRequest(mockCreds, "us-west-2");
    expect(amplifyRequest.transformRequest("http://maps.geo.evil-amazonaws.com/?x=amazonaws.com", "any")).toBe(
      undefined
    );
    expect(amplifyRequest.transformRequest("http://amazonaws.com.evil-amazonaws.com", "any")).toBe(
      undefined
    );
    const request = amplifyRequest.transformRequest("http://maps.geo.us-east-1.amazonaws.com", "any");
    expect(request.url).toContain("x-amz-user-agent");
  });

  test("transformRequest appends query params to existing query params if any", () => {
    const mockCreds = {
      accessKeyId: "accessKeyId",
      sessionToken: "sessionTokenId",
      secretAccessKey: "secretAccessKey",
      identityId: "identityId",
      authenticated: true,
      expiration: new Date(),
    };
    const amplifyRequest = new AmplifyMapLibreRequest(mockCreds, "us-west-2");

    let request = amplifyRequest.transformRequest("http://maps.geo.us-east-1.amazonaws.com?tsi=0", "any");
    const queryStringStartIndex = request.url.indexOf('?');
    const anotherQueryStringStartIndexExists = request.url.indexOf('?', queryStringStartIndex + 1) !== -1;
    expect(anotherQueryStringStartIndexExists).toEqual(false);

    let searchParams = new URL(request.url).searchParams;
    expect(searchParams.has('tsi')).toBe(true);
    expect(searchParams.has('x-amz-user-agent')).toBe(true);

    request = amplifyRequest.transformRequest("http://maps.geo.us-east-1.amazonaws.com", "any");
    searchParams = new URL(request.url).searchParams;
    expect(searchParams.has('x-amz-user-agent')).toBe(true);

    request = amplifyRequest.transformRequest("http://maps.geo.us-east-1.amazonaws.com?", "any");
    searchParams = new URL(request.url).searchParams;
    expect(searchParams.has('x-amz-user-agent')).toBe(true);

    request = amplifyRequest.transformRequest("http://maps.geo.us-east-1.amazonaws.com?param1=1&", "any");
    searchParams = new URL(request.url).searchParams;
    expect(searchParams.has('param1')).toBe(true);
    expect(searchParams.has('x-amz-user-agent')).toBe(true);

    request = amplifyRequest.transformRequest("http://maps.geo.us-east-1.amazonaws.com?param1=1&param2=2", "any");
    searchParams = new URL(request.url).searchParams;
    expect(searchParams.has('param1')).toBe(true);
    expect(searchParams.has('param2')).toBe(true);
    expect(searchParams.has('x-amz-user-agent')).toBe(true);
  });

  test("transformRequest queries Amazon Location Service for Style requests and adds sigv4 auth", () => {
    const mockCreds = {
      accessKeyId: "accessKeyId",
      sessionToken: "sessionTokenId",
      secretAccessKey: "secretAccessKey",
      identityId: "identityId",
      authenticated: true,
      expiration: new Date(),
    };
    const amplifyRequest = new AmplifyMapLibreRequest(mockCreds, "us-west-2");
    const request = amplifyRequest.transformRequest("example.com", "Style");
    expect(request.url).toContain("maps.geo");
    expect(request.url).toContain("X-Amz-Signature");
    expect(request.url).toContain("x-amz-user-agent");
  });

  test("transformRequest throws an error when region is undefined", () => {
    const mockCreds = {
      accessKeyId: "accessKeyId",
      sessionToken: "sessionTokenId",
      secretAccessKey: "secretAccessKey",
      identityId: "identityId",
      authenticated: true,
      expiration: new Date(),
    };
    const amplifyRequest = new AmplifyMapLibreRequest(mockCreds, undefined);
    expect(() =>
      amplifyRequest.transformRequest("amazon.com", "Style")
    ).toThrow();
  });

  test("refreshCredentialsWithRetry is called until credentials are not expired", () => {
    const mockCreds = {
      accessKeyId: "accessKeyId",
      sessionToken: "sessionTokenId",
      secretAccessKey: "secretAccessKey",
      identityId: "identityId",
      authenticated: true,
      expiration: new Date(2030, 2, 2),
    };
    const amplifyRequest = new AmplifyMapLibreRequest(mockCreds, "us-east-1");
    const spy = jest.spyOn(amplifyRequest, 'refreshCredentialsWithRetry');
    amplifyRequest.refreshCredentialsWithRetry();
    // should only be called once as the timeout is set to 10 seconds before credentials expire
    expect(spy).toBeCalledTimes(1);
  });

  test("refreshCredentialsWithRetry is called once after sign out", () => {
    const mockCreds = {
      accessKeyId: "accessKeyId",
      sessionToken: "sessionTokenId",
      secretAccessKey: "secretAccessKey",
      identityId: "identityId",
      authenticated: true,
      expiration: new Date(),
    };
    const amplifyRequest = new AmplifyMapLibreRequest(mockCreds, "us-east-1");
    const spy = jest.spyOn(amplifyRequest, 'refreshCredentialsWithRetry');
    Hub.dispatch('auth', { event: 'signOut' });
    // should only be called once as the credentials expire soon after
    expect(spy).toBeCalledTimes(1);
  });
});
