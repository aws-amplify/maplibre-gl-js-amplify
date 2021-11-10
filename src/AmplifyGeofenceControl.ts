import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { IControl, LngLatBounds, Map } from "maplibre-gl";
import {
  CircleMode,
  SimpleSelectMode,
  DirectMode,
} from "mapbox-gl-draw-circle";
import { drawGeofences, getGeofenceFeatureFromData } from "./drawGeofences";
import { Geofence } from "./types";
import { Feature, Geometry } from "geojson";
import { debounce } from "debounce";
import { getPolygonFromBounds, isValidGeofenceId } from "./geofenceUtils";

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
  _loadedGeofences?: any;
  _displayedGeofences?: [any?];
  _editingGeofenceId?: any;

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
  _geofenceListContainer?: HTMLElement;
  _addGeofenceContainer?: HTMLElement;
  _addGeofencebutton?: HTMLButtonElement;

  constructor(options: AmplifyGeofenceControlOptions) {
    this.options = options;
    this._geofenceCollectionId = "fixme"; // this should be retrieved from Geofence API
    this._loadedGeofences = {};
    this._displayedGeofences = [];
    this._changeMode = this._changeMode.bind(this);
    this._createElement = this._createElement.bind(this);
    this._renderGeofences = this._renderGeofences.bind(this);
    this._loadAllGeofences = this._loadAllGeofences.bind(this);
    this._enableMapboxDraw = this._enableMapboxDraw.bind(this);
    this._disableMapboxDraw = this._disableMapboxDraw.bind(this);
    this._renderEditButton = this._renderEditButton.bind(this);
    this._renderItemAnchor = this._renderItemAnchor.bind(this);
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

    return this._container;
  }

  saveGeofence(): void {
    console.log(`Current editing geofenceID: ${this._editingGeofenceId}`);
    console.log(this._map);
    console.log(this._mapBoxDraw);
    console.log(
      "Saving a polygon " +
        (this._mapBoxDraw.getAll().features[0].geometry as any).coordinates
    );
    console.log(this._mapBoxDraw.get(this._editingGeofenceId));
    const feature = this._mapBoxDraw.get(this._editingGeofenceId);

    // Save geofence api call here
    const savedGeofence: Geofence = {
      id: this._editingGeofenceId,
      geometry: { polygon: feature.geometry["coordinates"] },
    };

    // render geofence to the map and add it to the list
    this._renderGeofence(savedGeofence);

    this._disableEditingMode();
  }

  /**********************************************************************
   Private methods for CRUD Geofences
   **********************************************************************/

  async _loadAllGeofences() {
    // const results = (await this._geofenceAPI.listGeofences(
    //   "test-geofence-collection-1"
    // )) as any;

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

    // const renderGeofences = this._renderGeofences;
    // this._map.on("load", function () {
    //   renderGeofences([hardcodeGeofence]);
    // });
  }

  _renderGeofence(geofence: Geofence): void {
    const renderedGeofence = drawGeofences(geofence.id, [geofence], this._map, {
      visible: true,
    });

    // Create list of results and render on the map
    const listItem = this._createElement(
      "li",
      "amplify-ctrl-list-result-item",
      this._geofenceListContainer
    );
    this._renderEditButton(listItem, geofence, renderedGeofence);
    this._renderItemAnchor(listItem, geofence, renderedGeofence);

    this._loadedGeofences[geofence.id] = { ...geofence, ...renderedGeofence };
    this._displayedGeofences.push(renderedGeofence);
  }

  _renderGeofences(geofences: Geofence[]): void {
    geofences.forEach((geofence: Geofence) => {
      this._renderGeofence(geofence);
    });
  }

  _renderEditButton(
    container: HTMLElement,
    geofence: any,
    renderedGeofence: any
  ): void {
    const editButton = this._createElement(
      "button",
      "geofence-edit-button",
      container
    );
    editButton.innerHTML = "Edit";
    editButton.addEventListener(
      "click",
      function () {
        renderedGeofence.hide();
        this._enableMapboxDraw();

        if (
          this._editingGeofenceId &&
          geofence.id !== this._editingGeofenceId
        ) {
          this._mapBoxDraw.delete(this._editingGeofenceId);
        }

        // render in mapboxdraw
        const feature = getGeofenceFeatureFromData(geofence.geometry.polygon);
        const data: Feature = {
          id: geofence.id,
          ...feature,
        };
        const [featureId] = this._mapBoxDraw.add(data);
        this._editingGeofenceId = featureId;
      }.bind(this)
    );
  }

  _renderItemAnchor(
    container: HTMLElement,
    geofence: any,
    renderedGeofence: any
  ): void {
    const anchorForListItem = this._createElement(
      "a",
      "geofence-result-anchor-item",
      container
    );
    anchorForListItem.innerHTML = geofence.id;
    anchorForListItem.addEventListener(
      "click",
      function () {
        this._disableMapboxDraw();
        renderedGeofence.show();
        this._displayedGeofences.push(renderedGeofence);

        // FIXME: need to deal with multi select here
        const bounds = new LngLatBounds();
        geofence.geometry.polygon[0].forEach((bound) => {
          bounds.extend(bound);
        });
        this._map.fitBounds(bounds, { padding: 100 });
      }.bind(this)
    );
  }

  _hideDisplayedGeofences(): void {
    this._displayedGeofences.forEach((geofence) => {
      geofence.hide();
    });
  }

  _showDisplayedGeofences(): void {
    this._displayedGeofences.forEach((geofence) => {
      geofence.show();
    });
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
    this._hideDisplayedGeofences();
  }

  // Disables add button and selecting items from geofence list
  _disableEditingMode(): void {
    this._disableMapboxDraw();
    this._addGeofencebutton.disabled = false;
    this._showDisplayedGeofences();
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
      ...getGeofenceFeatureFromData(polygon),
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
      ".amplify-ctrl-geofence-list { position: absolute; height: 100vh; left: 0; top: 0; width: 15%; background: white; z-index: 100; }" +
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
    this._geofenceListContainer = this._createElement(
      "div",
      "amplify-ctrl-geofence-list",
      this._container
    );

    const title = this._createElement(
      "div",
      "amplify-ctrl-geofence-list-title",
      this._geofenceListContainer
    );
    title.innerHTML = "Geofences";

    this._addGeofencebutton = this._createElement(
      "button",
      "geofence-add-button",
      this._geofenceListContainer
    ) as HTMLButtonElement;
    this._addGeofencebutton.innerHTML = "+";
    this._addGeofencebutton.addEventListener("click", () => {
      this._createAddGeofenceContainer();
    });
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
}
