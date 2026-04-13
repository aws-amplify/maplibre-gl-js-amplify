/**
 * @jest-environment jsdom
 */

/**
 * XSS Prevention Tests
 *
 * Verifies that user-controlled data (geofenceId, GeoJSON feature
 * properties) cannot inject HTML or JavaScript when rendered
 * through the UI or popup components.
 */

import { AmplifyGeofenceControlUI } from '../src/AmplifyGeofenceControl/ui';
import { getPopupRenderFunction } from '../src/popupRender';
import { escapeHtml } from '../src/utils';

// XSS payloads to test against
const XSS_PAYLOADS = [
  '<script>alert(1)</script>',
  '<img src=x onerror=alert(1)>',
  '<svg onload=alert(1)>',
  '" onmouseover="alert(1)',
  "' onmouseover='alert(1)",
  '<iframe src="javascript:alert(1)">',
  '<body onload=alert(1)>',
  '<a href="javascript:alert(1)">click</a>',
  '<div style="background:url(javascript:alert(1))">',
  '"><script>alert(document.cookie)</script>',
];

/**
 * Helper: parse HTML and verify no dangerous elements or event handlers exist.
 */
function assertNoInjectedElements(html: string): void {
  const div = document.createElement('div');
  div.innerHTML = html;

  const dangerous = div.querySelectorAll(
    'script, img, svg, iframe, body, a[href^="javascript"]'
  );
  expect(dangerous.length).toBe(0);

  div.querySelectorAll('*').forEach((el) => {
    el.getAttributeNames().forEach((attr) => {
      expect(attr.toLowerCase()).not.toMatch(/^on/);
    });
  });
}

describe('escapeHtml utility', () => {
  test('escapes all HTML special characters', () => {
    const input = '<script>"alert(1)"&\'test\'</script>';
    const result = escapeHtml(input);
    expect(result).toBe(
      '&lt;script&gt;&quot;alert(1)&quot;&amp;&#39;test&#39;&lt;/script&gt;'
    );
  });

  test('returns safe string for each XSS payload', () => {
    for (const payload of XSS_PAYLOADS) {
      const result = escapeHtml(payload);
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    }
  });

  test('does not alter plain text', () => {
    expect(escapeHtml('hello world')).toBe('hello world');
    expect(escapeHtml('myGeofence123')).toBe('myGeofence123');
    expect(escapeHtml('')).toBe('');
  });
});

describe('AmplifyGeofenceControlUI XSS prevention', () => {
  let container: HTMLElement;
  let ui: ReturnType<typeof AmplifyGeofenceControlUI>;
  let mockGeofenceControl: Record<string, jest.Mock>;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    mockGeofenceControl = {
      changeMode: jest.fn(),
      resetGeofence: jest.fn(),
      loadMoreGeofences: jest.fn(),
      displayAllGeofences: jest.fn(),
      hideAllGeofences: jest.fn(),
      displayGeofence: jest.fn(),
      fitGeofence: jest.fn(),
      hideGeofence: jest.fn(),
      displayHighlightedGeofence: jest.fn(),
      hideHighlightedGeofence: jest.fn(),
      editGeofence: jest.fn(),
      setEditingModeEnabled: jest.fn(),
      saveGeofence: jest.fn(),
      addEditableGeofence: jest.fn(),
      createGeofence: jest.fn(),
      deleteGeofence: jest.fn(),
      updateInputRadius: jest.fn(),
    };

    ui = AmplifyGeofenceControlUI(mockGeofenceControl, container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('renderListItem - geofenceId XSS', () => {
    beforeEach(() => {
      ui.createGeofenceListContainer();
    });

    test.each(XSS_PAYLOADS)(
      'geofenceId "%s" is rendered as text, not HTML',
      (payload) => {
        ui.renderListItem({
          geofenceId: payload,
          geometry: { polygon: [] },
        });

        const titleEl = container.querySelector(
          '.geofence-ctrl-list-item-title'
        );
        expect(titleEl).not.toBeNull();
        expect(titleEl.textContent).toBe(payload);
        const dangerous = titleEl.querySelectorAll(
          'script, img, svg, iframe, a[href^="javascript"]'
        );
        expect(dangerous.length).toBe(0);
      }
    );
  });
});

describe('popupRender XSS prevention', () => {
  const defaultOptions = {};

  test.each(XSS_PAYLOADS)(
    'title from place_name "%s" is HTML-escaped in popup',
    (payload) => {
      const renderFn = getPopupRenderFunction('test-layer', defaultOptions);
      const feature = {
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [0, 0] },
        properties: { place_name: payload },
      };

      const html = renderFn(feature);
      assertNoInjectedElements(html);
    }
  );

  test.each(XSS_PAYLOADS)(
    'title property "%s" is HTML-escaped in popup',
    (payload) => {
      const renderFn = getPopupRenderFunction('test-layer', defaultOptions);
      const feature = {
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [0, 0] },
        properties: { title: payload, address: '123 Main St' },
      };

      const html = renderFn(feature);
      assertNoInjectedElements(html);
    }
  );

  test.each(XSS_PAYLOADS)(
    'address property "%s" is HTML-escaped in popup',
    (payload) => {
      const renderFn = getPopupRenderFunction('test-layer', defaultOptions);
      const feature = {
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [0, 0] },
        properties: { title: 'Safe Title', address: payload },
      };

      const html = renderFn(feature);
      assertNoInjectedElements(html);
    }
  );

  test('legitimate text renders correctly', () => {
    const renderFn = getPopupRenderFunction('test-layer', defaultOptions);
    const feature = {
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [-122.4, 37.8] },
      properties: { title: 'Golden Gate Bridge', address: 'San Francisco, CA' },
    };

    const html = renderFn(feature);
    expect(html).toContain('Golden Gate Bridge');
    expect(html).toContain('San Francisco, CA');
  });

  test('place_name with commas splits correctly and escapes both parts', () => {
    const renderFn = getPopupRenderFunction('test-layer', defaultOptions);
    const feature = {
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [0, 0] },
      properties: {
        place_name: '<script>alert(1)</script>, <img src=x onerror=alert(1)>',
      },
    };

    const html = renderFn(feature);
    assertNoInjectedElements(html);
  });
});
