import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { IControl, LngLatBounds, Map } from "maplibre-gl";
import {
  CircleMode,
  SimpleSelectMode,
  DirectMode,
} from "mapbox-gl-draw-circle";
import { drawGeofences, getGeofenceFeatureFromData } from "./drawGeofences";
import { Geofence } from "./types";
import { Feature } from "geojson";
import { debounce } from "debounce";

export interface AmplifyGeofenceControlOptions {
  geofenceCollectionId?: string;
}

export class AmplifyGeofenceControl {
  options: AmplifyGeofenceControlOptions;
  _geofenceCollectionId: string;
  _map: Map;
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
  _loadedGeofences?: [any?];
  _displayedGeofences?: [any?];
  _editingGeofenceId?: any;

  constructor(options: AmplifyGeofenceControlOptions) {
    this.options = options;
    this._geofenceCollectionId = "fixme"; // this should be retrieved from Geofence API
    this._loadedGeofences = [];
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

    this._createGeofenceContainer();
    this._createGeofenceCreateContainer();
    this._createGeofenceListContainer();
    this._loadAllGeofences();

    return this._container;
  }

  saveGeofence(): void {
    console.log(`Current editing geofenceID: ${this._editingGeofenceId}`);
    console.log(this._map);
    console.log(this._mapBoxDraw);
    // console.log(
    //   "Drew a polygon " +
    //     (this._mapBoxDraw.getAll().features[0].geometry as any).coordinates
    // );
  }

  /**********************************************************************
   Private methods for CRUD Geofences
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
      ".create-container {}" +
      ".geofence-list { position: absolute; height: 100vh; left: 0; top: 0; width: 15%; background: white; }" +
      ".maplibregl-ctrl-full-screen { position: absolute; height: 100vh; width: 100vw; pointer-events: none; }";
  }

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

    const renderGeofences = this._renderGeofences;
    this._map.on("load", function () {
      renderGeofences([hardcodeGeofence]);
    });
  }

  _renderGeofences(geofences: Geofence[]): void {
    geofences.forEach((geofence: Geofence) => {
      const renderedGeofence = drawGeofences(
        geofence.id,
        [geofence],
        this._map,
        {
          visible: false,
        }
      );

      // Create list of results and render on the map
      const listItem = this._createElement(
        "li",
        "geofence-result-item",
        this._geofenceListContainer
      );
      this._renderEditButton(listItem, geofence, renderedGeofence);
      this._renderItemAnchor(listItem, geofence, renderedGeofence);

      this._loadedGeofences.push({ ...geofence, ...renderedGeofence });
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

  _updateInputRadius(event: Event): void {
    const radius = (event.target as HTMLInputElement).value;
    this._changeMode("draw_circle", { initialRadiusInKm: parseFloat(radius) });
  }

  /**********************************************************************
   UI Methods for AmplifyGeofenceControl
   **********************************************************************/

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

  _createGeofenceContainer(): void {
    this._geoFenceContainer = this._createElement(
      "div",
      "geofence-container",
      this._innerContainer
    );
    this._geofenceCreateButton = this._createElement(
      "button",
      "geofence-create-button",
      this._geoFenceContainer
    );
    this._geofenceCreateButton.addEventListener(
      "click",
      this._enableMapboxDraw
    );
    this._geofenceCreateButton.title = "Create Geofence";
    this._geofenceCreateButton.innerHTML = "Create Geofence";
  }

  _createGeofenceCreateContainer(): void {
    this._createContainer = this._createElement(
      "div",
      "create-container",
      this._container
    );

    this._geofenceCreateInput = this._createElement(
      "input",
      "create-geofence-input",
      this._createContainer
    );
    this._geofenceCreateInput.addEventListener(
      "keydown",
      debounce(this._updateInputRadius, 200)
    );

    this._saveGeofenceButton = this._createElement(
      "button",
      "save-geofence-button",
      this._createContainer
    );
    this._saveGeofenceButton.addEventListener("click", this.saveGeofence);
    this._saveGeofenceButton.title = "Save Geofence";
    this._saveGeofenceButton.innerHTML = "Save Geofence";

    this._circleModeButton = this._createElement(
      "button",
      "circle-mode-button",
      this._createContainer
    );
    this._circleModeButton.addEventListener("click", () =>
      this._changeMode("draw_circle", { initialRadiusInKm: 50.0 })
    );
    this._circleModeButton.title = "Circle Mode";
    this._circleModeButton.innerHTML = "Circle Mode";

    this._polygonModeButton = this._createElement(
      "button",
      "polygon-mode-button",
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
      "geofence-list",
      this._container
    );

    const title = this._createElement(
      "div",
      "geofence-list-title",
      this._geofenceListContainer
    );
    title.innerHTML = "Geofences";
  }
}
