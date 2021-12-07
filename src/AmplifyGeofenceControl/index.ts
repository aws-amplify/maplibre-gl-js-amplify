import { Map } from "maplibre-gl";
import { Geo } from "@aws-amplify/geo";
import { drawGeofences, DrawGeofencesOutput } from "../drawGeofences";
import { Geofence } from "../types";
import { Feature } from "geojson";
import {
  isValidGeofenceId,
  getGeofenceFeatureFromPolygon,
  getGeofenceFeatureArray,
} from "../geofenceUtils";
import { GEOFENCE_COLOR, GEOFENCE_BORDER_COLOR } from "../constants";
import { AmplifyGeofenceControlUI } from "./ui";
import { AmplifyMapboxDraw } from "./AmplifyMapboxDraw";
import { createElement } from "../utils";

export interface AmplifyGeofenceControlOptions {
  geofenceCollectionId?: string;
}

export class AmplifyGeofenceControl {
  options: AmplifyGeofenceControlOptions;
  _geofenceCollectionId: string;
  _map: Map;
  _amplifyDraw: AmplifyMapboxDraw;
  _loadedGeofences?: Record<string, Geofence>;
  _displayedGeofences?: Geofence[];
  _drawGeofencesOutput?: DrawGeofencesOutput;
  _highlightedGeofenceOutput?: DrawGeofencesOutput;
  _editingGeofenceId?: string;

  // HTML Element References
  _ui;
  _container?: HTMLElement;
  _geofenceCircleButton?: HTMLElement;
  _geofenceCreateInput?: HTMLElement;
  _addGeofenceContainer?: HTMLElement;

  constructor(options: AmplifyGeofenceControlOptions) {
    this._geofenceCollectionId = options.geofenceCollectionId ?? "fixme"; // this should be retrieved from Geofence API
    this._loadedGeofences = {};
    this._displayedGeofences = [];
    this.changeMode = this.changeMode.bind(this);
    this.listGeofences = this.listGeofences.bind(this);
    this._loadGeofence = this._loadGeofence.bind(this);
    this.updateInputRadius = this.updateInputRadius.bind(this);
    this.createGeofence = this.createGeofence.bind(this);
    this.updateGeofence = this.updateGeofence.bind(this);
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
  }

  /**********************************************************************
   Public Methods for AmplifyGeofenceControl
   **********************************************************************/

  getDefaultPosition(): string {
    return "full-screen";
  }

  onRemove(): void {
    this._ui.removeElement(this._container);
  }

  onAdd(map: Map): HTMLElement {
    this._map = map;
    this._container = createElement("div", "amplify-ctrl maplibregl-ctrl");

    this._ui = AmplifyGeofenceControlUI(this, this._container);
    this._amplifyDraw = new AmplifyMapboxDraw(map, this._ui);

    this._ui.registerControlPosition(map, "full-screen");

    this._ui.createGeofenceListContainer();

    // Draw the geofences source to the map so we can update it on geofences load/creation
    this._map.on(
      "load",
      function () {
        this._drawGeofencesOutput = drawGeofences(
          "displayedGeofences",
          [],
          this._map,
          {
            fillColor: GEOFENCE_COLOR,
            borderColor: GEOFENCE_BORDER_COLOR,
            borderOpacity: 1,
          }
        );
        this._highlightedGeofenceOutput = drawGeofences(
          "highlightedGeofence",
          [],
          this._map,
          {
            fillColor: GEOFENCE_COLOR,
            borderColor: GEOFENCE_BORDER_COLOR,
            borderOpacity: 1,
            borderWidth: 6,
          }
        );

        this.listGeofences();
      }.bind(this)
    );

    return this._container;
  }

  async createGeofence(geofenceId?: string): Promise<string | null> {
    if (geofenceId) {
      if (!isValidGeofenceId(geofenceId, this._loadedGeofences)) {
        console.error("Geofence ID invalid");
        this._ui.createAddGeofencePromptError("Invalid Geofence ID");
        return;
      }
    }
    const feature = this._amplifyDraw.get(this._editingGeofenceId);

    const response = await Geo.createGeofences({
      geofenceId: geofenceId || this._editingGeofenceId,
      geometry: { polygon: feature.geometry["coordinates"] },
    });

    if (response.errors[0]) {
      const err = response.errors[0];
      throw new Error(
        `There was an error creating geofence with id ${geofenceId}: ${err.error.code} - ${err.error.message}`
      );
    }

    const success = response.successes[0];

    const savedGeofence: Geofence = {
      geofenceId: success.geofenceId,
      geometry: { polygon: feature.geometry["coordinates"] },
    };

    // render geofence to the map and add it to the list
    this._loadGeofence(savedGeofence);
    this.displayGeofence(savedGeofence.geofenceId);

    this.setEditingModeEnabled(false);

    return savedGeofence.geofenceId;
  }

  async updateGeofence(geofenceId?: string): Promise<string | null> {
    if (geofenceId) {
      if (!isValidGeofenceId(geofenceId, this._loadedGeofences)) {
        console.error("Geofence ID invalid");
        this._ui.createAddGeofencePromptError("Invalid Geofence ID");
        return;
      }
    }
    const feature = this._amplifyDraw.get(this._editingGeofenceId);

    const id = geofenceId || this._editingGeofenceId;
    const response = await Geo.updateGeofences({
      geofenceId: id,
      geometry: { polygon: feature.geometry["coordinates"] },
    });

    if (response.errors[0]) {
      throw new Error(
        `There was an error updating geofence with id ${id}: ${response.errors[0]}`
      );
    }

    const success = response.successes[0];

    const savedGeofence: Geofence = {
      geofenceId: success.geofenceId,
      geometry: { polygon: feature.geometry["coordinates"] },
    };

    // render geofence to the map and add it to the list
    this._loadGeofence(savedGeofence);
    this.displayGeofence(savedGeofence.geofenceId);

    this.setEditingModeEnabled(false);

    return savedGeofence.geofenceId;
  }

  // FIXME: Add infinite scroll plus next tokens here
  // Each page loads 100 geofences
  async listGeofences(): Promise<void> {
    try {
      const { entries } = await Geo.listGeofences();

      const loadGeofence = this._loadGeofence;
      entries.forEach((geofence) => loadGeofence(geofence));
      this._ui.updateGeofenceCount(entries.length);
    } catch (e) {
      throw new Error(`Error calling listGeofences: ${e}`);
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
  }

  displayGeofence(geofenceId: string): void {
    this._displayedGeofences.push(this._loadedGeofences[geofenceId]);
    this._updateDisplayedGeofences();
    this._ui.updateCheckbox(geofenceId, true);
  }

  displayAllGeofences(): void {
    this._displayedGeofences.push(...Object.values(this._loadedGeofences));
    this._updateDisplayedGeofences();
    const checkboxes = document.getElementsByClassName(
      "amplify-ctrl-list-item-checkbox"
    ) as HTMLCollectionOf<HTMLInputElement>;
    Array.from(checkboxes).forEach(
      (checkbox) => (checkbox.checked = this._ui.getCheckboxAllValue())
    );
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
      "amplify-ctrl-list-item-checkbox"
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

    if (mode === "draw_circle") {
      this._amplifyDraw.drawCircularGeofence(this._editingGeofenceId);
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
    this._editingGeofenceId = "tempGeofence";
    this._amplifyDraw.drawCircularGeofence("tempGeofence");
    this.setEditingModeEnabled(true);
  }
}
