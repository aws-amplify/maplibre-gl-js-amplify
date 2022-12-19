import AmplifyMapLibreRequest from "../src/AmplifyMapLibreRequest";
import { Credentials } from "@aws-amplify/core";

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
