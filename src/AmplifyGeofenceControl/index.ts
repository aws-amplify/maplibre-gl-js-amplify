import { Map } from "maplibre-gl";
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
    this._loadAllGeofences = this._loadAllGeofences.bind(this);
    this._loadGeofence = this._loadGeofence.bind(this);
    this.updateInputRadius = this.updateInputRadius.bind(this);
    this.saveGeofence = this.saveGeofence.bind(this);
    this.editGeofence = this.editGeofence.bind(this);
    this.deleteGeofence = this.deleteGeofence.bind(this);
    this.displayAllGeofences = this.displayAllGeofences.bind(this);
    this.hideAllGeofences = this.hideAllGeofences.bind(this);
    this.enableEditingMode = this.enableEditingMode.bind(this);
    this.addEditableGeofence = this.addEditableGeofence.bind(this);
    this.disableEditingMode = this.disableEditingMode.bind(this);
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
    this._container = createElement("div", "maplibregl-ctrl");

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

        this._loadAllGeofences();
      }.bind(this)
    );

    return this._container;
  }

  saveGeofence(): void {
    const feature = this._amplifyDraw.get(this._editingGeofenceId);

    // FIXME: Save geofence api call here
    const savedGeofence: Geofence = {
      id: this._editingGeofenceId,
      geometry: { polygon: feature.geometry["coordinates"] },
    };

    // render geofence to the map and add it to the list
    this._loadGeofence(savedGeofence);
    this.displayGeofence(savedGeofence.id);

    this.disableEditingMode();
  }

  editGeofence(id: string): void {
    this.enableEditingMode();

    const geofence = this._loadedGeofences[id];
    if (!geofence) {
      throw new Error(`Geofence with id ${id} does not exist`);
    }

    // render in mapboxdraw
    const feature = getGeofenceFeatureFromPolygon(geofence.geometry.polygon);
    const data: Feature = {
      id: geofence.id,
      ...feature,
    };
    this._amplifyDraw.add(data);

    this._editingGeofenceId = geofence.id;
  }

  deleteGeofence(id: string): void {
    // FIXME: delete geofence api call here
    this._ui.removeGeofenceListItem(id);

    delete this._loadedGeofences[id];

    this._displayedGeofences = this._displayedGeofences.filter(
      (geofence) => geofence.id !== id
    );

    this._updateDisplayedGeofences();
  }

  deleteSelectedGeofences(): void {
    const idsToDelete = this._displayedGeofences.map((fence) => fence.id);
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

  async _loadAllGeofences(): Promise<void> {
    // FIXME: Harded coded response from geofence API, call getGeofences here
    const hardcodeGeofence: Geofence = {
      id: "myHardcodedGeofence",
      geometry: {
        polygon: [
          [
            [-124.0488709112, 35.9978649131],
            [-119.5127318998, 35.9978649131],
            [-119.5127318998, 38.315786399],
            [-124.0488709112, 38.315786399],
            [-124.0488709112, 35.9978649131],
          ],
        ],
      },
    };

    const anotherOne: Geofence = {
      id: "myHardcodedGeofence2",
      geometry: {
        polygon: [
          [
            [-119.19118301902287, 35.98013497132733],
            [-114.65504400762288, 35.98013497132733],
            [-114.65504400762288, 38.298056457227325],
            [-119.19118301902287, 38.298056457227325],
            [-119.19118301902287, 35.98013497132733],
          ],
        ],
      },
    };
    const asdf = [];
    for (let i = 0; i < 10; i++) {
      asdf.push({ ...hardcodeGeofence, id: `asdf${i}` });
      asdf.push({ ...anotherOne, id: `zxcv${i}` });
    }

    const loadGeofence = this._loadGeofence;
    asdf.forEach((geofence) => loadGeofence(geofence));
    this._ui.updateGeofenceCount(asdf.length);
  }

  _loadGeofence(geofence: Geofence): void {
    // FIXME: Add pagination/infinite scroll here
    // If geofence exists remove it from displayed geofences
    if (this._loadedGeofences[geofence.id]) {
      this._displayedGeofences = this._displayedGeofences.filter(
        (fence) => fence.id !== geofence.id
      );
    } else {
      // If geofence doesn't exist render a new list item for it
      this._ui.renderListItem(geofence);
    }
    this._loadedGeofences[geofence.id] = geofence;
  }

  displayGeofence(id: string): void {
    this._displayedGeofences.push(this._loadedGeofences[id]);
    this._updateDisplayedGeofences();
    this._ui.updateCheckbox(id, true);
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

  hideGeofence(id: string): void {
    this._displayedGeofences = this._displayedGeofences.filter(
      (geofence) => geofence.id !== id
    );
    this._updateDisplayedGeofences();
    this._ui.updateCheckbox(id, false);
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

  displayHighlightedGeofence(id: string): void {
    const geofence = this._loadedGeofences[id];
    if (!geofence) {
      console.warn(`Geofence with id ${id} does not exist`);
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
  enableEditingMode(): void {
    this._amplifyDraw.enable();
    this._drawGeofencesOutput.hide();
    this._ui.disableAddGeofenceButton(true);
    this._ui.disableGeofenceList();
  }

  // Disables add button and selecting items from geofence list
  disableEditingMode(): void {
    this._amplifyDraw.disable();
    this._drawGeofencesOutput.show();
    this._ui.disableAddGeofenceButton(false);
    this._ui.enableGeofenceList();
  }

  updateInputRadius(event: Event): void {
    const radius = (event.target as HTMLInputElement).value;
    this._amplifyDraw.drawCircularGeofence(
      this._editingGeofenceId,
      parseInt(radius)
    );
  }

  addEditableGeofence(id: string, container: HTMLElement): void {
    if (!isValidGeofenceId(id, this._loadedGeofences)) {
      console.error("Geofence ID invalid");
      this._ui.createAddGeofencePromptError("Invalid Geofence ID", container);
      return;
    }
    this._editingGeofenceId = id;

    this._amplifyDraw.drawCircularGeofence(id);
    this._ui.removeAddGeofenceContainer();
  }
}
