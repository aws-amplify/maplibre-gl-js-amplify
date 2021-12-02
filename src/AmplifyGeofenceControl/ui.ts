import { Geofence } from "../types";
import { debounce } from "debounce";
import { createElement, removeElement } from "../utils";
import editIcon from "../public/editIcon.svg";
import trashIcon from "../public/trashIcon.svg";

import "../public/amplify-ctrl-geofence.css";

export function AmplifyGeofenceControlUI(
  geofenceControl: any,
  geofenceControlContainer: HTMLElement
) {
  let _addGeofenceContainer: HTMLElement;
  let _deleteGeofenceContainer: HTMLElement;
  let _addGeofencebutton: HTMLButtonElement;
  let _checkboxAll: HTMLInputElement;
  let _geofenceList: HTMLElement;
  let _createContainer: HTMLElement;
  let _geofenceTitle: HTMLElement;

  function registerControlPosition(map, positionName): void {
    if (map._controlPositions[positionName]) {
      return;
    }
    const positionContainer = document.createElement("div");
    positionContainer.className = `maplibregl-ctrl-${positionName}`;
    map._controlContainer.appendChild(positionContainer);
    map._controlPositions[positionName] = positionContainer;
  }

  function createGeofenceCreateContainer(): void {
    _createContainer = createElement(
      "div",
      "amplify-ctrl-create-prompt",
      geofenceControlContainer
    );

    const geofenceCreateInput = createElement(
      "input",
      "amplify-ctrl-create-input",
      _createContainer
    );
    geofenceCreateInput.addEventListener(
      "keydown",
      debounce(geofenceControl.updateInputRadius, 200)
    );

    const circleModeButton = createElement(
      "button",
      "amplify-ctrl-create-circle-button",
      _createContainer
    );
    circleModeButton.addEventListener("click", () =>
      geofenceControl.changeMode("draw_circle")
    );
    circleModeButton.title = "Circle Mode";
    circleModeButton.innerHTML = "Circle Mode";

    const polygonModeButton = createElement(
      "button",
      "amplify-ctrl-create-polygon-button",
      _createContainer
    );
    polygonModeButton.addEventListener("click", () =>
      geofenceControl.changeMode("draw_polygon")
    );
    polygonModeButton.title = "Polygon Mode";
    polygonModeButton.innerHTML = "Polygon Mode";
  }

  function removeAddGeofenceContainer(): void {
    removeElement(_addGeofenceContainer);
  }

  /************************************************************
   * Geofence List
   *************************************************************/
  function createGeofenceListContainer() {
    const geofenceListContainer = createElement(
      "div",
      "amplify-ctrl-list-container",
      geofenceControlContainer
    );

    createGeofenceListHeader(geofenceListContainer);
    createCheckboxAllContainer(geofenceListContainer);

    _geofenceList = createElement(
      "div",
      "amplify-ctrl-list",
      geofenceListContainer
    );
  }

  function createCheckboxAllContainer(geofenceListContainer: HTMLElement) {
    const container = createElement(
      "div",
      "amplify-ctrl-list-checkbox-all-container",
      geofenceListContainer
    );

    _checkboxAll = createElement(
      "input",
      "amplify-ctrl-list-checkbox-all",
      container
    ) as HTMLInputElement;
    _checkboxAll.type = "checkbox";
    _checkboxAll.addEventListener("click", function () {
      if (_checkboxAll.checked) {
        geofenceControl.displayAllGeofences();
        checkboxAllText.innerHTML = "Deselect All";
      } else {
        geofenceControl.hideAllGeofences();
        checkboxAllText.innerHTML = "Select All";
      }
    });

    const checkboxAllText = createElement(
      "div",
      "amplify-ctrl-list-item-title",
      container
    );
    checkboxAllText.innerHTML = "Select all";
  }

  function createGeofenceListHeader(geofenceListContainer: HTMLElement) {
    const header = createElement(
      "div",
      "amplify-ctrl-list-header",
      geofenceListContainer
    );

    _geofenceTitle = createElement(
      "div",
      "amplify-ctrl-list-header-title",
      header
    );
    _geofenceTitle.innerHTML = "Geofences (0)";

    _addGeofencebutton = createElement(
      "button",
      "amplify-ctrl-list-header-add-button",
      header
    ) as HTMLButtonElement;
    _addGeofencebutton.innerHTML = "+";
    _addGeofencebutton.addEventListener("click", () => {
      createAddGeofenceContainer();
    });
  }

  function renderListItem(geofence: Geofence): void {
    const container = createElement(
      "li",
      "amplify-ctrl-list-item-container",
      _geofenceList
    );
    container.id = `list-item-${geofence.id}`;
    const listItem = createElement("li", "amplify-ctrl-list-item", container);
    listItem.addEventListener("mouseover", function () {
      geofenceControl.displayHighlightedGeofence(geofence.id);
    });
    listItem.addEventListener("mouseout", function () {
      geofenceControl.hideHighlightedGeofence();
    });

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

    const editButton = createElement(
      "div",
      "amplify-ctrl-edit-button",
      listItem
    );
    editButton.addEventListener("click", function () {
      geofenceControl.editGeofence(geofence.id);
      createEditControls(container, listItem, geofence.id);
      listItem.classList.remove("amplify-ctrl-list-item");
      listItem.classList.add("amplify-ctrl-list-selected-item");
    });
    const imageIcon = new Image(15, 15);
    imageIcon.src = editIcon;
    editButton.appendChild(imageIcon);
  }

  function createEditControls(
    itemContainer: HTMLElement,
    item: HTMLElement,
    id: string
  ): void {
    const editContainer = createElement(
      "div",
      "amplify-ctrl-list-item-controls",
      itemContainer
    );

    renderDeleteButton(editContainer, id);

    const rightContainer = createElement(
      "div",
      "amplify-ctrl-list-item-controls-right",
      editContainer
    );

    const cancelButton = createElement(
      "div",
      "amplify-ctrl-cancel-button",
      rightContainer
    );
    cancelButton.classList.add("amplify-ctrl-button");
    cancelButton.innerHTML = "Cancel";
    cancelButton.addEventListener("click", () => {
      geofenceControl.disableEditingMode();
      item.classList.remove("amplify-ctrl-list-selected-item");
      item.classList.add("amplify-ctrl-list-item");
      removeElement(editContainer);
    });

    const saveGeofenceButton = createElement(
      "div",
      "amplify-ctrl-save-button amplify-ctrl-button",
      rightContainer
    );
    saveGeofenceButton.addEventListener("click", () => {
      geofenceControl.saveGeofence();
      item.classList.remove("amplify-ctrl-list-selected-item");
      item.classList.add("amplify-ctrl-list-item");
      removeElement(editContainer);
    });
    saveGeofenceButton.title = "Save";
    saveGeofenceButton.innerHTML = "Save";
  }

  /************************************************************
   * Add Geofence Controls
   *************************************************************/

  function removeGeofenceCreateContainer(): void {
    removeElement(_createContainer);
  }

  function createAddGeofenceContainer(): void {
    geofenceControl.enableEditingMode();
    _addGeofenceContainer = createElement(
      "div",
      "amplify-ctrl-prompt-container ",
      geofenceControlContainer
    );

    const addGeofencePrompt = createElement(
      "div",
      "amplify-ctrl-prompt",
      _addGeofenceContainer
    );

    const title = createElement(
      "div",
      "amplify-ctrl-add-geofence-title",
      addGeofencePrompt
    );
    title.innerHTML = "Add a new geofence";

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

  /************************************************************
   * Delete Controls
   *************************************************************/

  function renderDeleteButton(container: HTMLElement, id: string): void {
    const deleteButton = createElement(
      "div",
      "amplify-ctrl-delete-button",
      container
    );
    deleteButton.classList.add("amplify-ctrl-button");
    deleteButton.addEventListener("click", function () {
      createConfirmDeleteContainer(id);
    });
    const imageIcon = new Image(15, 15);
    imageIcon.src = trashIcon;
    deleteButton.appendChild(imageIcon);
  }

  function createConfirmDeleteContainer(geofenceId: string): void {
    _deleteGeofenceContainer = createElement(
      "div",
      "amplify-ctrl-prompt-container ",
      geofenceControlContainer
    );

    const deleteGeofencePrompt = createElement(
      "div",
      "amplify-ctrl-prompt",
      _deleteGeofenceContainer
    );

    const title = createElement(
      "div",
      "amplify-ctrl-delete-geofence-title",
      deleteGeofencePrompt
    );
    title.innerHTML = "Are you sure you want to delete?";

    const confirmDeleteButton = createElement(
      "button",
      "amplify-ctrl-delete-geofence-confirm-button",
      deleteGeofencePrompt
    );
    confirmDeleteButton.innerHTML = "Confirm";
    confirmDeleteButton.addEventListener("click", function () {
      geofenceControl.deleteGeofence(geofenceId);
      removeElement(_deleteGeofenceContainer);
      geofenceControl.disableEditingMode();
    });

    const cancelButton = createElement(
      "button",
      "amplify-ctrl-delete-geofence-cancel-button",
      deleteGeofencePrompt
    );
    cancelButton.innerHTML = "Cancel";
    cancelButton.addEventListener("click", () => {
      removeElement(_deleteGeofenceContainer);
    });
  }

  /************************************************************
   * Utility Methods
   *************************************************************/

  function updateCheckbox(geofenceId: string, checked: boolean): void {
    const checkbox = document.getElementById(
      `list-item-checkbox-${geofenceId}`
    );
    if (checkbox) (checkbox as HTMLInputElement).checked = checked;
  }

  function removeGeofenceListItem(geofenceId: string): void {
    const listItem = document.getElementById(`list-item-${geofenceId}`);
    removeElement(listItem);
  }

  function disableAddGeofenceButton(disabled: boolean): void {
    _addGeofencebutton.disabled = disabled;
  }

  function enableGeofenceList(): void {
    _geofenceList.classList.remove("amplify-ctrl-list-noHover");
  }

  function disableGeofenceList(): void {
    _geofenceList.classList.add("amplify-ctrl-list-noHover");
  }

  function getCheckboxAllValue(): boolean {
    return _checkboxAll.checked;
  }

  function updateGeofenceCount(count: number): void {
    _geofenceTitle.innerHTML = `Geofences (${count})`;
  }

  return {
    registerControlPosition,
    createElement,
    removeElement,
    createGeofenceCreateContainer,
    createGeofenceListContainer,
    removeAddGeofenceContainer,
    createAddGeofencePromptError,
    renderListItem,
    updateCheckbox,
    removeGeofenceListItem,
    disableAddGeofenceButton,
    enableGeofenceList,
    disableGeofenceList,
    getCheckboxAllValue,
    removeGeofenceCreateContainer,
    updateGeofenceCount,
  };
}
