import maplibregl, { Map } from 'maplibre-gl';
import { Geo } from '@aws-amplify/geo';
import { drawGeofences, DrawGeofencesOutput } from '../drawGeofences';
import { Geofence } from '../types';
import { Feature } from 'geojson';
import {
  isValidGeofenceId,
  getGeofenceFeatureFromPolygon,
  getGeofenceFeatureArray,
  isExistingGeofenceId,
  getDistanceBetweenCoordinates,
} from '../geofenceUtils';
import { GEOFENCE_COLOR, GEOFENCE_BORDER_COLOR } from '../constants';
import { AmplifyGeofenceControlUI } from './ui';
import { AmplifyMapDraw } from './AmplifyMapDraw';
import { createElement } from '../utils';

const FIT_BOUNDS_PADDING = { left: 240 }; // Default to 240px right now because of the left nav

export interface AmplifyGeofenceControlOptions {
  geofenceCollectionId?: string;
}

export class AmplifyGeofenceControl {
  options: AmplifyGeofenceControlOptions;
  _geofenceCollectionId: string;
  _map: Map;
  _amplifyDraw: AmplifyMapDraw;
  _loadedGeofences?: Record<string, Geofence>;
  _displayedGeofences?: Geofence[];
  _drawGeofencesOutput?: DrawGeofencesOutput;
  _highlightedGeofenceOutput?: DrawGeofencesOutput;
  _editingGeofenceId?: string;
  _listGeofencesNextToken?: string;

  // HTML Element References
  _ui;
  _container?: HTMLElement;
  _geofenceCircleButton?: HTMLElement;
  _geofenceCreateInput?: HTMLElement;
  _addGeofenceContainer?: HTMLElement;

  constructor(options?: AmplifyGeofenceControlOptions) {
    this._geofenceCollectionId = options?.geofenceCollectionId;
    this._loadedGeofences = {};
    this._displayedGeofences = [];
    this.changeMode = this.changeMode.bind(this);
    this.loadInitialGeofences = this.loadInitialGeofences.bind(this);
    this.loadMoreGeofences = this.loadMoreGeofences.bind(this);
    this._loadGeofence = this._loadGeofence.bind(this);
    this.updateInputRadius = this.updateInputRadius.bind(this);
    this.saveGeofence = this.saveGeofence.bind(this);
    this.editGeofence = this.editGeofence.bind(this);
    this.deleteGeofence = this.deleteGeofence.bind(this);
    this.displayAllGeofences = this.displayAllGeofences.bind(this);
    this.hideAllGeofences = this.hideAllGeofences.bind(this);
    this.addEditableGeofence = this.addEditableGeofence.bind(this);
    this.setEditingModeEnabled = this.setEditingModeEnabled.bind(this);
    this.displayHighlightedGeofence =
      this.displayHighlightedGeofence.bind(this);
    this.hideHighlightedGeofence = this.hideHighlightedGeofence.bind(this);
    this.displayGeofence = this.displayGeofence.bind(this);
    this.hideGeofence = this.hideGeofence.bind(this);
    this.fitGeofence = this.fitGeofence.bind(this);
    this.fitAllGeofences = this.fitAllGeofences.bind(this);
  }

  /**********************************************************************
   Public Methods for AmplifyGeofenceControl
   **********************************************************************/

  getDefaultPosition(): string {
    return 'full-screen';
  }

  onRemove(): void {
    this._ui.removeElement(this._container);
  }

  // Reorders MapLibre canvas class names to fix a mapbox draw bug - https://github.com/mapbox/mapbox-gl-draw/pull/1079
  reorderMapLibreClassNames(): void {
    const mapCanvas = document
      .getElementsByClassName('maplibregl-canvas')
      .item(0);
    if (mapCanvas) {
      mapCanvas.className = 'mapboxgl-canvas maplibregl-canvas';
    }
  }

  onAdd(map: Map): HTMLElement {
    this._map = map;

    this.reorderMapLibreClassNames();

    this._container = createElement('div', 'geofence-ctrl maplibregl-ctrl');

    this._ui = AmplifyGeofenceControlUI(this, this._container);
    this._amplifyDraw = new AmplifyMapDraw(map, this._ui);

    this._ui.registerControlPosition(map, 'full-screen');

    this._ui.createGeofenceListContainer();

    // Draw the geofences source to the map so we can update it on geofences load/creation
    this._map.once(
      'load',
      function () {
        // Prevents warnings on multiple re-renders, especially when rendered in react
        if (this._map.getSource('displayedGeofences')) {
          return;
        }

        this._drawGeofencesOutput = drawGeofences(
          'displayedGeofences',
          [],
          this._map,
          {
            fillColor: GEOFENCE_COLOR,
            borderColor: GEOFENCE_BORDER_COLOR,
            borderOpacity: 1,
          }
        );
        this._highlightedGeofenceOutput = drawGeofences(
          'highlightedGeofence',
          [],
          this._map,
          {
            fillColor: GEOFENCE_COLOR,
            borderColor: GEOFENCE_BORDER_COLOR,
            borderOpacity: 1,
            borderWidth: 6,
          }
        );

        this.loadInitialGeofences();

        map.addControl(
          new maplibregl.NavigationControl({ showCompass: false }),
          'bottom-right'
        );
      }.bind(this)
    );

    this._map.on('draw.update', () => {
      const coordinates = (
        this._amplifyDraw._mapBoxDraw.getAll().features[0].geometry as any
      ).coordinates[0];
      const radius =
        getDistanceBetweenCoordinates(
          coordinates[0],
          coordinates[Math.floor(coordinates.length / 2)]
        ) / 2;
      this._ui.updateGeofenceRadius(radius.toFixed(2));
    });

    return this._container;
  }

  async createGeofence(geofenceId?: string): Promise<string | null> {
    if (!geofenceId || geofenceId.length === 0) {
      this._ui.createAddGeofencePromptError('Geofence ID is empty.');
      return;
    }

    if (!isValidGeofenceId(geofenceId)) {
      this._ui.createAddGeofencePromptError(
        'Geofence ID contains special characters.'
      );
      return;
    }

    if (isExistingGeofenceId(geofenceId, this._loadedGeofences)) {
      this._ui.createAddGeofencePromptError('Geofence ID already exists.');
      return;
    }

    return this.saveGeofence(geofenceId);
  }
  async saveGeofence(geofenceId?: string): Promise<string | null> {
    const feature = this._amplifyDraw.get(this._editingGeofenceId);

    const idToSave = geofenceId || this._editingGeofenceId;
    const response = await Geo.saveGeofences({
      geofenceId: idToSave,
      geometry: { polygon: feature.geometry['coordinates'] },
    });

    if (response.errors[0]) {
      const err = response.errors[0];
      throw new Error(
        `There was an error saving geofence with id ${idToSave}: ${err.error.code} - ${err.error.message}`
      );
    }

    const success = response.successes[0];

    const savedGeofence: Geofence = {
      geofenceId: success.geofenceId,
      geometry: { polygon: feature.geometry['coordinates'] },
    };

    // render geofence to the map and add it to the list
    this._loadGeofence(savedGeofence);
    this.displayGeofence(savedGeofence.geofenceId);

    this.setEditingModeEnabled(false);

    return savedGeofence.geofenceId;
  }

  // Each page loads 100 geofences
  async loadInitialGeofences(): Promise<void> {
    try {
      const { entries, nextToken } = await Geo.listGeofences();
      this._listGeofencesNextToken = nextToken;

      const loadGeofence = this._loadGeofence;
      entries.forEach((geofence) => loadGeofence(geofence));
      this._ui.updateGeofenceCount(Object.keys(this._loadedGeofences).length);
    } catch (e) {
      throw new Error(`Error calling listGeofences: ${e}`);
    }
  }

  async loadMoreGeofences(): Promise<void> {
    if (this._listGeofencesNextToken) {
      try {
        const { entries, nextToken } = await Geo.listGeofences({
          nextToken: this._listGeofencesNextToken,
        });
        this._listGeofencesNextToken = nextToken;

        const loadGeofence = this._loadGeofence;
        entries.forEach((geofence) => loadGeofence(geofence));
        this._ui.updateGeofenceCount(Object.keys(this._loadedGeofences).length);
      } catch (e) {
        throw new Error(`Error calling listGeofences: ${e}`);
      }
    }
  }

  editGeofence(geofenceId: string): void {
    this.setEditingModeEnabled(true);

    const geofence = this._loadedGeofences[geofenceId];
    if (!geofence) {
      throw new Error(`Geofence with id ${geofenceId} does not exist`);
    }

    // render in mapboxdraw
    const feature = getGeofenceFeatureFromPolygon(geofence.geometry.polygon);
    const data: Feature = {
      id: geofence.geofenceId,
      ...feature,
    };
    this._amplifyDraw.add(data);

    this._editingGeofenceId = geofence.geofenceId;
  }

  async deleteGeofence(geofenceId: string): Promise<string> {
    const response = await Geo.deleteGeofences(geofenceId);

    if (response.errors[0]) {
      const err = response.errors[0].error;
      throw new Error(
        `There was an error deleting geofence with id ${geofenceId}: ${err.code} - ${err.message}`
      );
    }

    this._ui.removeGeofenceListItem(geofenceId);

    delete this._loadedGeofences[geofenceId];
    this._ui.updateGeofenceCount(Object.keys(this._loadedGeofences).length);

    this._displayedGeofences = this._displayedGeofences.filter(
      (geofence) => geofence.geofenceId !== geofenceId
    );

    this._updateDisplayedGeofences();

    return geofenceId;
  }

  deleteSelectedGeofences(): void {
    const idsToDelete = this._displayedGeofences.map(
      (fence) => fence.geofenceId
    );
    // FIXME: delete geofence api call here
    idsToDelete.forEach((id) => {
      this._ui.removeGeofenceListItem(id);
      delete this._loadedGeofences[id];
    });

    this._displayedGeofences = [];

    this._updateDisplayedGeofences();
  }

  /**********************************************************************
   Private methods for CRUD Geofences
   **********************************************************************/

  _loadGeofence(geofence: Geofence): void {
    // If geofence exists remove it from displayed geofences
    if (this._loadedGeofences[geofence.geofenceId]) {
      this._displayedGeofences = this._displayedGeofences.filter(
        (fence) => fence.geofenceId !== geofence.geofenceId
      );
    } else {
      // If geofence doesn't exist render a new list item for it
      this._ui.renderListItem(geofence);
    }
    this._loadedGeofences[geofence.geofenceId] = geofence;

    this._ui.updateGeofenceCount(Object.keys(this._loadedGeofences).length);
  }

  displayGeofence(geofenceId: string): void {
    this._displayedGeofences.push(this._loadedGeofences[geofenceId]);
    this._updateDisplayedGeofences();
    this._ui.updateCheckbox(geofenceId, true);

    this.fitAllGeofences();
  }

  displayAllGeofences(): void {
    this._displayedGeofences.push(...Object.values(this._loadedGeofences));
    this._updateDisplayedGeofences();
    const checkboxes = document.getElementsByClassName(
      'geofence-ctrl-list-item-checkbox'
    ) as HTMLCollectionOf<HTMLInputElement>;
    Array.from(checkboxes).forEach(
      (checkbox) => (checkbox.checked = this._ui.getCheckboxAllValue())
    );

    this.fitAllGeofences();
  }

  fitGeofence(geofenceId: string): void {
    const mapBounds = this._map.getBounds();
    const geofence = this._loadedGeofences[geofenceId];
    geofence.geometry.polygon[0].forEach((coord) => {
      mapBounds.extend(coord);
    });
    this._map.fitBounds(mapBounds, { padding: FIT_BOUNDS_PADDING });
  }

  fitAllGeofences(): void {
    let shouldFitBounds = false;
    const mapBounds = this._map.getBounds();

    this._displayedGeofences.forEach((geofence) => {
      geofence.geometry.polygon[0].forEach((coord) => {
        if (!mapBounds.contains(coord)) {
          mapBounds.extend(coord);
          shouldFitBounds = true;
        }
      });
    });

    if (shouldFitBounds)
      this._map.fitBounds(mapBounds, { padding: FIT_BOUNDS_PADDING });
  }

  hideGeofence(geofenceId: string): void {
    this._displayedGeofences = this._displayedGeofences.filter(
      (geofence) => geofence.geofenceId !== geofenceId
    );
    this._updateDisplayedGeofences();
    this._ui.updateCheckbox(geofenceId, false);
  }

  hideAllGeofences(): void {
    this._displayedGeofences = [];
    this._updateDisplayedGeofences();
    const checkboxes = document.getElementsByClassName(
      'geofence-ctrl-list-item-checkbox'
    ) as HTMLCollectionOf<HTMLInputElement>;
    Array.from(checkboxes).forEach(
      (checkbox) => (checkbox.checked = this._ui.getCheckboxAllValue())
    );
  }

  _updateDisplayedGeofences(): void {
    const feature = getGeofenceFeatureArray(this._displayedGeofences);
    this._drawGeofencesOutput.setData(feature);
  }

  displayHighlightedGeofence(geofenceId: string): void {
    const geofence = this._loadedGeofences[geofenceId];
    if (!geofence) {
      // eslint-disable-next-line no-console
      console.warn(`Geofence with id ${geofenceId} does not exist`);
      return;
    }
    const feature = getGeofenceFeatureFromPolygon(geofence.geometry.polygon);
    this._highlightedGeofenceOutput.setData(feature);
    this._highlightedGeofenceOutput.show();
  }

  hideHighlightedGeofence(): void {
    this._highlightedGeofenceOutput.hide();
  }

  /**********************************************************************
   Methods for controlling amplify mapbox draw
   **********************************************************************/

  changeMode(mode: string): void {
    // erase existing mapbox draw content
    this._amplifyDraw.delete(this._editingGeofenceId);

    if (mode === 'draw_circle') {
      this._amplifyDraw.drawCircularGeofence(this._editingGeofenceId);
    } else {
      this._amplifyDraw.drawPolygonGeofence(this._editingGeofenceId);
    }
  }

  resetGeofence(): void {
    // erase existing mapbox draw content
    this._amplifyDraw.delete(this._editingGeofenceId);

    if (isExistingGeofenceId(this._editingGeofenceId, this._loadedGeofences)) {
      this.editGeofence(this._editingGeofenceId);
    } else {
      this._amplifyDraw.drawPolygonGeofence(this._editingGeofenceId);
    }
  }

  // Disables add button and selecting items from geofence list
  setEditingModeEnabled(enabled: boolean): void {
    enabled ? this._amplifyDraw.enable() : this._amplifyDraw.disable();
    enabled
      ? this._drawGeofencesOutput.hide()
      : this._drawGeofencesOutput.show();
    this._ui.setGeofenceListEnabled(!enabled);
  }

  updateInputRadius(event: Event): void {
    const radiusString = (event.target as HTMLInputElement).value;
    const radius = parseInt(radiusString);
    if (isNaN(radius)) {
      return;
    }
    this._amplifyDraw.drawCircularGeofence(this._editingGeofenceId, radius);
  }

  addEditableGeofence(): void {
    this._editingGeofenceId = 'tempGeofence';
    this._amplifyDraw.drawCircularGeofence('tempGeofence');
    this.setEditingModeEnabled(true);
  }
}
