import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { IControl, Map } from "maplibre-gl";
import {
  CircleMode,
  SimpleSelectMode,
  DirectMode,
} from "mapbox-gl-draw-circle";
import { drawGeofences, DrawGeofencesOutput } from "./drawGeofences";
import { Geofence } from "./types";
import { Feature, Geometry } from "geojson";
import { debounce } from "debounce";
import {
  getPolygonFromBounds,
  isValidGeofenceId,
  getGeofenceFeatureFromPolygon,
  getGeofenceFeatureArray,
} from "./geofenceUtils";
import {
  COLOR_HOVER,
  GEOFENCE_COLOR,
  GEOFENCE_BORDER_COLOR,
} from "./constants";

export interface AmplifyGeofenceControlOptions {
  geofenceCollectionId?: string;
}

export class AmplifyGeofenceControl {
  options: AmplifyGeofenceControlOptions;
  _geofenceCollectionId: string;
  _map: Map;
  _mapBoxDraw?: MapboxDraw = new MapboxDraw({
    displayControlsDefault: false,
    defaultMode: "simple_select",
    userProperties: true,
    controls: {
      trash: false,
    },
    modes: {
      ...MapboxDraw.modes,
      draw_circle: CircleMode,
      direct_select: DirectMode,
      simple_select: SimpleSelectMode,
    },
  });
  _loadedGeofences?: Record<string, Geofence>;
  _displayedGeofences?: Geofence[];
  _drawGeofencesOutput?: DrawGeofencesOutput;
  _highlightedGeofenceOutput?: DrawGeofencesOutput;
  _editingGeofenceId?: string;

  // HTML Element References
  _container?: HTMLElement;
  _innerContainer?: HTMLElement;
  _createContainer?: HTMLElement;
  _geoFenceContainer?: HTMLElement;
  _geofenceCreateButton?: HTMLElement;
  _saveGeofenceButton?: HTMLElement;
  _circleModeButton?: HTMLElement;
  _polygonModeButton?: HTMLElement;
  _geofenceCircleButton?: HTMLElement;
  _geofenceCreateInput?: HTMLElement;
  _geofenceList?: HTMLElement;
  _addGeofenceContainer?: HTMLElement;
  _addGeofencebutton?: HTMLButtonElement;
  _checkboxAll?: HTMLInputElement;

  constructor(options: AmplifyGeofenceControlOptions) {
    this.options = options;
    this._geofenceCollectionId = "fixme"; // this should be retrieved from Geofence API
    this._loadedGeofences = {};
    this._displayedGeofences = [];
    this._changeMode = this._changeMode.bind(this);
    this._createElement = this._createElement.bind(this);
    this._loadAllGeofences = this._loadAllGeofences.bind(this);
    this._loadGeofence = this._loadGeofence.bind(this);
    this._enableMapboxDraw = this._enableMapboxDraw.bind(this);
    this._disableMapboxDraw = this._disableMapboxDraw.bind(this);
    this._renderEditButton = this._renderEditButton.bind(this);
    this._renderListItem = this._renderListItem.bind(this);
    this._updateInputRadius = this._updateInputRadius.bind(this);
    this.saveGeofence = this.saveGeofence.bind(this);
  }

  /**********************************************************************
   Public Methods for AmplifyGeofenceControl
   **********************************************************************/

  getDefaultPosition(): string {
    return "full-screen";
  }

  onRemove(): void {
    this._removeElement(this._container);
  }

  onAdd(map: Map): HTMLElement {
    this._map = map;
    this._registerControlPosition(map, "full-screen");
    this._createStyleHeader();

    this._container = this._createElement("div", "maplibregl-ctrl");

    this._innerContainer = this._createElement(
      "div",
      "inner-container",
      this._container
    );

    this._createGeofenceCreateContainer();
    this._createGeofenceListContainer();
    this._loadAllGeofences();

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
      }.bind(this)
    );

    return this._container;
  }

  saveGeofence(): void {
    console.log(
      "Saving a polygon " +
        (this._mapBoxDraw.getAll().features[0].geometry as any).coordinates
    );
    console.log(this._mapBoxDraw.get(this._editingGeofenceId));
    const feature = this._mapBoxDraw.get(this._editingGeofenceId);

    // FIXME: Save geofence api call here
    const savedGeofence: Geofence = {
      id: this._editingGeofenceId,
      geometry: { polygon: feature.geometry["coordinates"] },
    };

    // render geofence to the map and add it to the list
    this._loadGeofence(savedGeofence);
    this._displayGeofence(savedGeofence.id);

    this._disableEditingMode();
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
    for (let i = 0; i < 1000; i++) {
      asdf.push({ ...hardcodeGeofence, id: `asdf${i}` });
      asdf.push({ ...anotherOne, id: `zxcv${i}` });
    }

    const loadGeofence = this._loadGeofence;
    asdf.forEach((geofence) => loadGeofence(geofence));
  }

  _loadGeofence(geofence: Geofence): void {
    // FIXME: Add pagination/infinite scroll here
    this._renderListItem(geofence);
    this._loadedGeofences[geofence.id] = geofence;
  }

  _displayGeofence(id: string): void {
    this._displayedGeofences.push(this._loadedGeofences[id]);
    this._updateDisplayedGeofences();
    const checkbox = document.getElementById(`list-item-checkbox-${id}`);
    if (checkbox) (checkbox as HTMLInputElement).checked = true;
  }

  _displayAllGeofences(): void {
    this._displayedGeofences.push(...Object.values(this._loadedGeofences));
    this._updateDisplayedGeofences();
    const checkboxes = document.getElementsByClassName(
      "amplify-ctrl-list-item-checkbox"
    ) as HTMLCollectionOf<HTMLInputElement>;
    Array.from(checkboxes).forEach(
      (checkbox) => (checkbox.checked = this._checkboxAll.checked)
    );
  }

  _hideGeofence(id: string): void {
    this._displayedGeofences = this._displayedGeofences.filter(
      (geofence) => geofence.id !== id
    );
    this._updateDisplayedGeofences();
    const checkbox = document.getElementById(`list-item-checkbox-${id}`);
    if (checkbox) (checkbox as HTMLInputElement).checked = false;
  }

  _hideAllGeofences(): void {
    this._displayedGeofences = [];
    this._updateDisplayedGeofences();
    const checkboxes = document.getElementsByClassName(
      "amplify-ctrl-list-item-checkbox"
    ) as HTMLCollectionOf<HTMLInputElement>;
    Array.from(checkboxes).forEach(
      (checkbox) => (checkbox.checked = this._checkboxAll.checked)
    );
  }

  _updateDisplayedGeofences(): void {
    const feature = getGeofenceFeatureArray(this._displayedGeofences);
    this._drawGeofencesOutput.setData(feature);
  }

  _displayHighlightedGeofence(id: string): void {
    const geofence = this._loadedGeofences[id];
    const feature = getGeofenceFeatureFromPolygon(geofence.geometry.polygon);
    this._highlightedGeofenceOutput.setData(feature);
    this._highlightedGeofenceOutput.show();
  }

  _hideHighlightedGeofence(): void {
    this._highlightedGeofenceOutput.hide();
  }

  /**********************************************************************
   Methods for controlling mapbox draw
   **********************************************************************/

  _changeMode(mode: string, options?: Record<string, string | number>): void {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    this._mapBoxDraw.changeMode(mode, options);
  }

  _enableMapboxDraw(): void {
    if (this._map.hasControl(this._mapBoxDraw as unknown as IControl)) {
      return;
    }

    this._map.addControl(
      this._mapBoxDraw as unknown as IControl,
      "bottom-right"
    );
    this._map.on("draw.create", (event) => {
      console.log(
        `Created a polygon event: ${event.features[0].geometry.coordinates}`
      );
    });
    this._map.on("draw.update", (event) => {
      console.log(`updated a polygon event: ${event}`);
      console.log(
        "updated a polygon " +
          (this._mapBoxDraw.getAll().features[0].geometry as any).coordinates
      );
    });
    this._map.on("draw.modechange", (event) => {
      console.log(`Changed mode to ${event.mode}`);
    });
    this._map.on("draw.delete", (event) => {
      console.log(`Deleted something event: ${event}`);
    });
  }

  _disableMapboxDraw(): void {
    if (this._map.hasControl(this._mapBoxDraw as unknown as IControl)) {
      this._map.removeControl(this._mapBoxDraw as unknown as IControl);
    }
  }

  _addToMapboxDraw(
    data: Feature<
      Geometry,
      {
        [name: string]: any;
      }
    >
  ): void {
    this._enableEditingMode();
    this._mapBoxDraw.add(data);
  }

  // Disables add button and selecting items from geofence list
  _enableEditingMode(): void {
    this._enableMapboxDraw();
    this._addGeofencebutton.disabled = true;
    this._drawGeofencesOutput.hide();
    this._geofenceList.classList.add("amplify-ctrl-geofence-list-noHover");
  }

  // Disables add button and selecting items from geofence list
  _disableEditingMode(): void {
    this._disableMapboxDraw();
    this._addGeofencebutton.disabled = false;
    this._drawGeofencesOutput.show();
    this._geofenceList.classList.remove("amplify-ctrl-geofence-list-noHover");
  }

  _updateInputRadius(event: Event): void {
    const radius = (event.target as HTMLInputElement).value;
    this._changeMode("draw_circle", { initialRadiusInKm: parseFloat(radius) });
  }

  _addEditableGeofence(id: string, container: HTMLElement): void {
    if (!isValidGeofenceId(id, this._loadedGeofences)) {
      console.error("Geofence ID invalid");
      this._createAddGeofencePromptError("Invalid Geofence ID", container);
      return;
    }
    this._editingGeofenceId = id;

    const mapBounds = this._map.getBounds();
    const polygon = getPolygonFromBounds(mapBounds);
    const data: Feature = {
      id: this._editingGeofenceId,
      ...getGeofenceFeatureFromPolygon(polygon),
    };
    this._addToMapboxDraw(data);
    this._removeAddGeofenceContainer();
  }

  /**********************************************************************
   UI Methods for AmplifyGeofenceControl
   **********************************************************************/

  _registerControlPosition(map, positionName): void {
    if (map._controlPositions[positionName]) {
      return;
    }
    const positionContainer = document.createElement("div");
    positionContainer.className = `maplibregl-ctrl-${positionName}`;
    map._controlContainer.appendChild(positionContainer);
    map._controlPositions[positionName] = positionContainer;
  }

  _createStyleHeader(): void {
    const style = document.createElement("style");
    style.setAttribute("className", "geofenceControl");
    document.head.append(style);
    style.textContent =
      ".amplify-ctrl-geofence-list-container { position: absolute; height: 100vh; left: 0; top: 0; width: 15%; background: white; z-index: 100; }" +
      ".amplify-ctrl-geofence-list { height: 100%; overflow: scroll; }" +
      ".amplify-ctrl-geofence-list-noHover { pointer-events: none; }" +
      ".amplify-ctrl-list-item { display: flex; }" +
      `.amplify-ctrl-list-item:hover { background: ${COLOR_HOVER}; }` +
      ".amplify-ctrl-add-geofence { position: absolute; background: rgba(0,0,0,0.4); height: 100vh; width: 100vw; top: 0; display: flex; justify-content: center; align-items: center; }" +
      ".amplify-ctrl-add-geofence-prompt { background: white; padding: 20px; }" +
      ".maplibregl-ctrl-full-screen { position: absolute; height: 100vh; width: 100vw; pointer-events: none; }";
  }

  _createElement(
    tagName: string,
    className?: string,
    container?: HTMLElement
  ): HTMLElement {
    const el = window.document.createElement(tagName);
    if (className !== undefined) el.className = className;
    if (container) container.appendChild(el);
    return el;
  }

  _removeElement(node: HTMLElement): void {
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
  }

  _createGeofenceCreateContainer(): void {
    this._createContainer = this._createElement(
      "div",
      "amplify-ctrl-create-prompt",
      this._container
    );

    this._geofenceCreateInput = this._createElement(
      "input",
      "amplify-ctrl-create-input",
      this._createContainer
    );
    this._geofenceCreateInput.addEventListener(
      "keydown",
      debounce(this._updateInputRadius, 200)
    );

    this._saveGeofenceButton = this._createElement(
      "button",
      "amplify-ctrl-create-save-button",
      this._createContainer
    );
    this._saveGeofenceButton.addEventListener("click", this.saveGeofence);
    this._saveGeofenceButton.title = "Save Geofence";
    this._saveGeofenceButton.innerHTML = "Save Geofence";

    this._circleModeButton = this._createElement(
      "button",
      "amplify-ctrl-create-circle-button",
      this._createContainer
    );
    this._circleModeButton.addEventListener("click", () =>
      this._changeMode("draw_circle", { initialRadiusInKm: 50.0 })
    );
    this._circleModeButton.title = "Circle Mode";
    this._circleModeButton.innerHTML = "Circle Mode";

    this._polygonModeButton = this._createElement(
      "button",
      "amplify-ctrl-create-polygon-button",
      this._createContainer
    );
    this._polygonModeButton.addEventListener("click", () =>
      this._changeMode("draw_polygon")
    );
    this._polygonModeButton.title = "Polygon Mode";
    this._polygonModeButton.innerHTML = "Polygon Mode";
  }

  _createGeofenceListContainer(): void {
    const geofenceListContainer = this._createElement(
      "div",
      "amplify-ctrl-geofence-list-container",
      this._container
    );

    const title = this._createElement(
      "div",
      "amplify-ctrl-geofence-list-title",
      geofenceListContainer
    );
    title.innerHTML = "Geofences";

    this._addGeofencebutton = this._createElement(
      "button",
      "geofence-add-button",
      geofenceListContainer
    ) as HTMLButtonElement;
    this._addGeofencebutton.innerHTML = "+";
    this._addGeofencebutton.addEventListener("click", () => {
      this._createAddGeofenceContainer();
    });

    this._checkboxAll = this._createElement(
      "input",
      "amplify-ctrl-list-item-checkbox-all",
      geofenceListContainer
    ) as HTMLInputElement;
    this._checkboxAll.type = "checkbox";
    this._checkboxAll.addEventListener(
      "click",
      function () {
        if (this._checkboxAll.checked) {
          this._displayAllGeofences();
        } else {
          this._hideAllGeofences();
        }
      }.bind(this)
    );

    this._geofenceList = this._createElement(
      "div",
      "amplify-ctrl-geofence-list",
      geofenceListContainer
    );
  }

  _createAddGeofenceContainer(): void {
    this._enableEditingMode();
    this._addGeofenceContainer = this._createElement(
      "div",
      "amplify-ctrl-add-geofence",
      this._container
    );

    const addGeofencePrompt = this._createElement(
      "div",
      "amplify-ctrl-add-geofence-prompt",
      this._addGeofenceContainer
    );

    const title = this._createElement(
      "div",
      "amplify-ctrl-add-geofence-title",
      addGeofencePrompt
    );
    title.innerHTML = "Add a new geofence:";

    const nameInput = this._createElement(
      "input",
      "amplify-ctrl-add-geofence-input",
      addGeofencePrompt
    );

    const confirmAddButton = this._createElement(
      "button",
      "amplify-ctrl-add-geofence-add-button",
      addGeofencePrompt
    );
    confirmAddButton.innerHTML = "Next";
    confirmAddButton.addEventListener(
      "click",
      function () {
        this._addEditableGeofence(
          (nameInput as HTMLButtonElement).value,
          addGeofencePrompt
        );
      }.bind(this)
    );

    const cancelButton = this._createElement(
      "button",
      "amplify-ctrl-add-geofence-cancel-button",
      addGeofencePrompt
    );
    cancelButton.innerHTML = "Cancel";
    cancelButton.addEventListener("click", () => {
      this._removeAddGeofenceContainer();
      this._disableEditingMode();
    });
  }

  _createAddGeofencePromptError(error: string, container: HTMLElement): void {
    const errorDiv = this._createElement(
      "div",
      "amplify-ctrl-add-geofence-error",
      container
    );
    errorDiv.innerHTML = error;
  }

  _removeAddGeofenceContainer(): void {
    this._removeElement(this._addGeofenceContainer);
  }

  _renderEditButton(container: HTMLElement, geofence: any): void {
    const editButton = this._createElement(
      "button",
      "geofence-edit-button",
      container
    );
    editButton.innerHTML = "Edit";
    editButton.addEventListener(
      "click",
      function () {
        this._enableMapboxDraw();

        if (
          this._editingGeofenceId &&
          geofence.id !== this._editingGeofenceId
        ) {
          this._mapBoxDraw.delete(this._editingGeofenceId);
        }

        // render in mapboxdraw
        const feature = getGeofenceFeatureFromPolygon(
          geofence.geometry.polygon
        );
        const data: Feature = {
          id: geofence.id,
          ...feature,
        };
        const [featureId] = this._mapBoxDraw.add(data);
        this._editingGeofenceId = featureId;
      }.bind(this)
    );
  }

  _renderListItem(geofence: Geofence): void {
    const listItem = this._createElement(
      "li",
      "amplify-ctrl-list-item",
      this._geofenceList
    );
    listItem.id = `list-item-${geofence.id}`;
    listItem.addEventListener(
      "mouseover",
      function () {
        this._displayHighlightedGeofence(geofence.id);
      }.bind(this)
    );
    listItem.addEventListener(
      "mouseout",
      function () {
        this._hideHighlightedGeofence();
      }.bind(this)
    );

    this._renderEditButton(listItem, geofence);

    const checkbox = this._createElement(
      "input",
      "amplify-ctrl-list-item-checkbox",
      listItem
    );
    checkbox.id = `list-item-checkbox-${geofence.id}`;
    (checkbox as HTMLInputElement).type = "checkbox";
    checkbox.addEventListener(
      "click",
      function () {
        if ((checkbox as HTMLInputElement).checked) {
          this._displayGeofence(geofence.id);
        } else {
          this._hideGeofence(geofence.id);
        }
      }.bind(this)
    );

    const geofenceTitle = this._createElement(
      "div",
      "amplify-ctrl-list-item-title",
      listItem
    );
    geofenceTitle.innerHTML = geofence.id;
  }
}
