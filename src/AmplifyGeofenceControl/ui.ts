import { Geofence } from "../types";
import { debounce } from "debounce";
import { COLOR_HOVER } from "../constants";

export function createElement(
  tagName: string,
  className?: string,
  container?: HTMLElement
): HTMLElement {
  const el = window.document.createElement(tagName);
  if (className !== undefined) el.className = className;
  if (container) container.appendChild(el);
  return el;
}

export function removeElement(node: HTMLElement): void {
  if (node.parentNode) {
    node.parentNode.removeChild(node);
  }
}

export function AmplifyGeofenceControlUI(
  geofenceControl: any,
  geofenceControlContainer: HTMLElement
) {
  let _addGeofenceContainer: HTMLElement;

  function registerControlPosition(map, positionName): void {
    if (map._controlPositions[positionName]) {
      return;
    }
    const positionContainer = document.createElement("div");
    positionContainer.className = `maplibregl-ctrl-${positionName}`;
    map._controlContainer.appendChild(positionContainer);
    map._controlPositions[positionName] = positionContainer;
  }

  function createStyleHeader(): void {
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

  function createGeofenceCreateContainer(): void {
    const createContainer = createElement(
      "div",
      "amplify-ctrl-create-prompt",
      geofenceControlContainer
    );

    const geofenceCreateInput = createElement(
      "input",
      "amplify-ctrl-create-input",
      createContainer
    );
    geofenceCreateInput.addEventListener(
      "keydown",
      debounce(geofenceControl.updateInputRadius, 200)
    );

    const saveGeofenceButton = createElement(
      "button",
      "amplify-ctrl-create-save-button",
      createContainer
    );
    saveGeofenceButton.addEventListener("click", geofenceControl.saveGeofence);
    saveGeofenceButton.title = "Save Geofence";
    saveGeofenceButton.innerHTML = "Save Geofence";

    const circleModeButton = createElement(
      "button",
      "amplify-ctrl-create-circle-button",
      createContainer
    );
    circleModeButton.addEventListener("click", () =>
      geofenceControl.changeMode("draw_circle", {
        initialRadiusInKm: 50.0,
      })
    );
    circleModeButton.title = "Circle Mode";
    circleModeButton.innerHTML = "Circle Mode";

    const polygonModeButton = createElement(
      "button",
      "amplify-ctrl-create-polygon-button",
      createContainer
    );
    polygonModeButton.addEventListener("click", () =>
      geofenceControl.changeMode("draw_polygon")
    );
    polygonModeButton.title = "Polygon Mode";
    polygonModeButton.innerHTML = "Polygon Mode";
  }

  function createGeofenceListContainer() {
    const geofenceListContainer = createElement(
      "div",
      "amplify-ctrl-geofence-list-container",
      geofenceControlContainer
    );

    const title = createElement(
      "div",
      "amplify-ctrl-geofence-list-title",
      geofenceListContainer
    );
    title.innerHTML = "Geofences";

    const addGeofencebutton = createElement(
      "button",
      "geofence-add-button",
      geofenceListContainer
    ) as HTMLButtonElement;
    addGeofencebutton.innerHTML = "+";
    addGeofencebutton.addEventListener("click", () => {
      createAddGeofenceContainer();
    });

    const checkboxAll = createElement(
      "input",
      "amplify-ctrl-list-item-checkbox-all",
      geofenceListContainer
    ) as HTMLInputElement;
    checkboxAll.type = "checkbox";
    checkboxAll.addEventListener("click", function () {
      if (checkboxAll.checked) {
        geofenceControl.displayAllGeofences();
      } else {
        geofenceControl.hideAllGeofences();
      }
    });

    const geofenceList = createElement(
      "div",
      "amplify-ctrl-geofence-list",
      geofenceListContainer
    );

    return { addGeofencebutton, checkboxAll, geofenceList };
  }

  function removeAddGeofenceContainer(): void {
    removeElement(_addGeofenceContainer);
  }

  function createAddGeofenceContainer(): void {
    geofenceControl.enableEditingMode();
    _addGeofenceContainer = createElement(
      "div",
      "amplify-ctrl-add-geofence",
      geofenceControlContainer
    );

    const addGeofencePrompt = createElement(
      "div",
      "amplify-ctrl-add-geofence-prompt",
      _addGeofenceContainer
    );

    const title = createElement(
      "div",
      "amplify-ctrl-add-geofence-title",
      addGeofencePrompt
    );
    title.innerHTML = "Add a new geofence:";

    const nameInput = createElement(
      "input",
      "amplify-ctrl-add-geofence-input",
      addGeofencePrompt
    );

    const confirmAddButton = createElement(
      "button",
      "amplify-ctrl-add-geofence-add-button",
      addGeofencePrompt
    );
    confirmAddButton.innerHTML = "Next";
    confirmAddButton.addEventListener("click", function () {
      geofenceControl.addEditableGeofence(
        (nameInput as HTMLButtonElement).value,
        addGeofencePrompt
      );
    });

    const cancelButton = createElement(
      "button",
      "amplify-ctrl-add-geofence-cancel-button",
      addGeofencePrompt
    );
    cancelButton.innerHTML = "Cancel";
    cancelButton.addEventListener("click", () => {
      removeAddGeofenceContainer();
      geofenceControl.disableEditingMode();
    });
  }

  function createAddGeofencePromptError(
    error: string,
    container: HTMLElement
  ): void {
    const errorDiv = createElement(
      "div",
      "amplify-ctrl-add-geofence-error",
      container
    );
    errorDiv.innerHTML = error;
  }

  function renderEditButton(container: HTMLElement, geofence: Geofence): void {
    const editButton = createElement(
      "button",
      "geofence-edit-button",
      container
    );
    editButton.innerHTML = "Edit";
    editButton.addEventListener("click", function () {
      geofenceControl.editGeofence(geofence.id);
    });
  }

  function renderListItem(geofence: Geofence, geofenceList: HTMLElement): void {
    const listItem = createElement(
      "li",
      "amplify-ctrl-list-item",
      geofenceList
    );
    listItem.id = `list-item-${geofence.id}`;
    listItem.addEventListener("mouseover", function () {
      geofenceControl.displayHighlightedGeofence(geofence.id);
    });
    listItem.addEventListener("mouseout", function () {
      geofenceControl.hideHighlightedGeofence();
    });

    renderEditButton(listItem, geofence);

    const checkbox = createElement(
      "input",
      "amplify-ctrl-list-item-checkbox",
      listItem
    );
    checkbox.id = `list-item-checkbox-${geofence.id}`;
    (checkbox as HTMLInputElement).type = "checkbox";
    checkbox.addEventListener("click", function () {
      if ((checkbox as HTMLInputElement).checked) {
        geofenceControl.displayGeofence(geofence.id);
      } else {
        geofenceControl.hideGeofence(geofence.id);
      }
    });

    const geofenceTitle = createElement(
      "div",
      "amplify-ctrl-list-item-title",
      listItem
    );
    geofenceTitle.innerHTML = geofence.id;
  }

  return {
    registerControlPosition,
    createStyleHeader,
    createElement,
    removeElement,
    createGeofenceCreateContainer,
    createGeofenceListContainer,
    removeAddGeofenceContainer,
    createAddGeofenceContainer,
    createAddGeofencePromptError,
    renderListItem,
  };
}
