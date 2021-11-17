import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { IControl, Map } from "maplibre-gl";
import {
  CircleMode,
  SimpleSelectMode,
  DirectMode,
} from "mapbox-gl-draw-circle";
import { drawGeofences, DrawGeofencesOutput } from "../drawGeofences";
import { Geofence } from "../types";
import { Feature, Geometry } from "geojson";
import {
  getPolygonFromBounds,
  isValidGeofenceId,
  getGeofenceFeatureFromPolygon,
  getGeofenceFeatureArray,
} from "../geofenceUtils";
import { GEOFENCE_COLOR, GEOFENCE_BORDER_COLOR } from "../constants";
import { AmplifyGeofenceControlUI, createElement } from "./ui";

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
  _ui;
  _container?: HTMLElement;
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
    this.changeMode = this.changeMode.bind(this);
    this._loadAllGeofences = this._loadAllGeofences.bind(this);
    this._loadGeofence = this._loadGeofence.bind(this);
    this._enableMapboxDraw = this._enableMapboxDraw.bind(this);
    this._disableMapboxDraw = this._disableMapboxDraw.bind(this);
    this.updateInputRadius = this.updateInputRadius.bind(this);
    this.saveGeofence = this.saveGeofence.bind(this);
    this.editGeofence = this.editGeofence.bind(this);
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
    this._ui.registerControlPosition(map, "full-screen");
    this._ui.createStyleHeader();

    this._ui.createGeofenceCreateContainer();
    const { addGeofencebutton, checkboxAll, geofenceList } =
      this._ui.createGeofenceListContainer();
    this._addGeofencebutton = addGeofencebutton;
    this._checkboxAll = checkboxAll;
    this._geofenceList = geofenceList;

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
    const feature = this._mapBoxDraw.get(this._editingGeofenceId);

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
    this._mapBoxDraw.add(data);

    this._editingGeofenceId = geofence.id;
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
      this._ui.renderListItem(geofence, this._geofenceList);
    }
    this._loadedGeofences[geofence.id] = geofence;
  }

  displayGeofence(id: string): void {
    this._displayedGeofences.push(this._loadedGeofences[id]);
    this._updateDisplayedGeofences();
    const checkbox = document.getElementById(`list-item-checkbox-${id}`);
    if (checkbox) (checkbox as HTMLInputElement).checked = true;
  }

  displayAllGeofences(): void {
    this._displayedGeofences.push(...Object.values(this._loadedGeofences));
    this._updateDisplayedGeofences();
    const checkboxes = document.getElementsByClassName(
      "amplify-ctrl-list-item-checkbox"
    ) as HTMLCollectionOf<HTMLInputElement>;
    Array.from(checkboxes).forEach(
      (checkbox) => (checkbox.checked = this._checkboxAll.checked)
    );
  }

  hideGeofence(id: string): void {
    this._displayedGeofences = this._displayedGeofences.filter(
      (geofence) => geofence.id !== id
    );
    this._updateDisplayedGeofences();
    const checkbox = document.getElementById(`list-item-checkbox-${id}`);
    if (checkbox) (checkbox as HTMLInputElement).checked = false;
  }

  hideAllGeofences(): void {
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

  displayHighlightedGeofence(id: string): void {
    const geofence = this._loadedGeofences[id];
    const feature = getGeofenceFeatureFromPolygon(geofence.geometry.polygon);
    this._highlightedGeofenceOutput.setData(feature);
    this._highlightedGeofenceOutput.show();
  }

  hideHighlightedGeofence(): void {
    this._highlightedGeofenceOutput.hide();
  }

  /**********************************************************************
   Methods for controlling mapbox draw
   **********************************************************************/

  changeMode(mode: string, options?: Record<string, string | number>): void {
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
    this.enableEditingMode();
    this._mapBoxDraw.add(data);
  }

  // Disables add button and selecting items from geofence list
  enableEditingMode(): void {
    this._enableMapboxDraw();
    this._addGeofencebutton.disabled = true;
    this._drawGeofencesOutput.hide();
    this._geofenceList.classList.add("amplify-ctrl-geofence-list-noHover");
  }

  // Disables add button and selecting items from geofence list
  disableEditingMode(): void {
    this._disableMapboxDraw();
    this._addGeofencebutton.disabled = false;
    this._drawGeofencesOutput.show();
    this._geofenceList.classList.remove("amplify-ctrl-geofence-list-noHover");
  }

  updateInputRadius(event: Event): void {
    const radius = (event.target as HTMLInputElement).value;
    this.changeMode("draw_circle", { initialRadiusInKm: parseFloat(radius) });
  }

  addEditableGeofence(id: string, container: HTMLElement): void {
    if (!isValidGeofenceId(id, this._loadedGeofences)) {
      console.error("Geofence ID invalid");
      this._ui.createAddGeofencePromptError("Invalid Geofence ID", container);
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
    this._ui.removeAddGeofenceContainer();
  }
}
