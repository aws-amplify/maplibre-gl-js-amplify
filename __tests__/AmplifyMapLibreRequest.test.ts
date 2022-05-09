import AmplifyMapLibreRequest from "../src/AmplifyMapLibreRequest";
import { Amplify } from "@aws-amplify/core";

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

  test("transformRequest returned undefined for non amazon related urls", () => {
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
});
