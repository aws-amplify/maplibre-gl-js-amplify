/**
 * This is a workaround to the problem of the jsdom library not supporting
 * URL.createObjectURL. See https://github.com/jsdom/jsdom/issues/1721.
 */
if (typeof window.URL.createObjectURL === "undefined") {
  window.URL.createObjectURL = jest.fn();
}

/**
 * Below are polyfills to allow the JSDOM tests to run
 */
 import FetchMock from 'jest-fetch-mock';
 FetchMock.enableMocks();
class MockWorker {
  addEventListener = () => null;
  dispatchEvent = () => null;
  onerror = () => null;
  onmessage = () => null;
  onmessageerror = () => null;
  postMessage = () => null;
  removeEventListener = () => null;
  terminate = () => null;
}

window.Worker = MockWorker;
performance.mark = jest.fn();
