import { Geofence } from "../types";
import { debounce } from "debounce";
import { createElement, removeElement } from "../utils";
import editIcon from "../public/editIcon.svg";
import trashIcon from "../public/trashIcon.svg";
import popupStep1 from "../public/popupStep1.svg";
import popupStep2 from "../public/popupStep2.svg";
import popupStep3 from "../public/popupStep3.svg";
import popupStep4 from "../public/popupStep4.svg";

import "../public/amplify-ctrl-geofence.css";

export class AmplifyGeofenceControlUI{
  geofenceControl: any;
  geofenceControlContainer: HTMLElement;
  _addGeofenceContainer: HTMLElement;
  _deleteGeofenceContainer: HTMLElement;
  _addGeofencebutton: HTMLButtonElement;
  _checkboxAll: HTMLInputElement;
  _geofenceList: HTMLElement;
  _createContainer: HTMLElement;
  _geofenceTitle: HTMLElement;
  _checkBoxAllAndCreateContainer: HTMLElement;
  _checkBoxAllContainer: HTMLElement;
  _circleModeContainer: HTMLElement;
  _polygonModeContainer: HTMLElement;
  _deletePopdownContainer: HTMLElement;

  constructor (
    geofenceControl: any,
    geofenceControlContainer: HTMLElement
  ) {
    this.geofenceControl = geofenceControl;
    this.geofenceControlContainer = geofenceControlContainer
  }

  registerControlPosition(map, positionName): void {
    if (map._controlPositions[positionName]) {
      return;
    }
    const positionContainer = document.createElement("div");
    positionContainer.className = `maplibregl-ctrl-${positionName}`;
    map._controlContainer.appendChild(positionContainer);
    map._controlPositions[positionName] = positionContainer;
  }

  /************************************************************
   * Create Geofence Controls
   *************************************************************/

  createGeofenceCreateContainer(isCircle?: boolean): void {
    const container = createElement(
      "div",
      "amplify-ctrl-create-prompt-container",
      this.geofenceControlContainer
    );

    this._createContainer = createElement(
      "div",
      "amplify-ctrl-create-prompt",
      container
    );

    const buttonContainer = createElement(
      "div",
      "amplify-ctrl-create-prompt-buttons",
      this._createContainer
    );

    const circleModeButton = createElement(
      "div",
      "amplify-ctrl-create-prompt-button-circle amplify-ctrl-create-prompt-button",
      buttonContainer
    );
    circleModeButton.addEventListener("click", () => {
      this.geofenceControl.changeMode("draw_circle");
      // Change button selected style
      circleModeButton.classList.add("amplify-ctrl-create-prompt-selected");
      polygonModeButton.classList.remove("amplify-ctrl-create-prompt-selected");

      // Switch info box mode
      if (this._polygonModeContainer) {
        removeElement(this._polygonModeContainer);
        this._polygonModeContainer = undefined;
      }
      if (!this._circleModeContainer)
      this.createCircleModeCreateContainer(this._createContainer);
    });
    circleModeButton.innerHTML = "Circle";

    const polygonModeButton = createElement(
      "div",
      "amplify-ctrl-create-prompt-button-polygon amplify-ctrl-create-prompt-button",
      buttonContainer
    );
    polygonModeButton.addEventListener("click", () => {
      this.geofenceControl.changeMode("draw_polygon");
      // Change button selected style
      polygonModeButton.classList.add("amplify-ctrl-create-prompt-selected");
      circleModeButton.classList.remove("amplify-ctrl-create-prompt-selected");

      // Switch info box mode
      if (this._circleModeContainer) {
        removeElement(this._circleModeContainer);
        this._circleModeContainer = undefined;
      }
      if (!this._polygonModeContainer)
      this.createPolygonModeCreateContainer(this._createContainer);
    });
    polygonModeButton.innerHTML = "Custom";

    // Default to circle mode
    if (isCircle) {
      circleModeButton.classList.add("amplify-ctrl-create-prompt-selected");
      this.createCircleModeCreateContainer(this._createContainer);
    } else {
      polygonModeButton.classList.add("amplify-ctrl-create-prompt-selected");
      this.createPolygonModeCreateContainer(this._createContainer);
    }
  }

  createCircleModeCreateContainer(container: HTMLElement): void {
    this._circleModeContainer = createElement(
      "div",
      "amplify-ctrl-create-circle-mode-container",
      container
    );

    const radiusTitle = createElement(
      "div",
      "amplify-ctrl-create-circle-mode-title",
      this._circleModeContainer
    );
    radiusTitle.innerHTML = "Radius";

    const geofenceCreateInput = createElement(
      "input",
      "amplify-ctrl-create-circle-mode-input",
      this._circleModeContainer
    );
    geofenceCreateInput.addEventListener(
      "keydown",
      debounce(this.geofenceControl.updateInputRadius, 200)
    );
  }

  createPolygonModeCreateContainer(container: HTMLElement): void {
    this._polygonModeContainer = createElement(
      "div",
      "amplify-ctrl-create-polygon-mode-container",
      container
    );

    const moreInfoIcon = createElement(
      "div",
      "amplify-ctrl-create-polygon-mode-icon",
      this._polygonModeContainer
    );

    const letterI = createElement(
      "div",
      "amplify-ctrl-create-polygon-mode-icon-i",
      moreInfoIcon
    );
    letterI.innerHTML = "i";

    const moreInfo = createElement(
      "div",
      "amplify-ctrl-create-polygon-mode-title",
      this._polygonModeContainer
    );
    moreInfo.innerHTML = "How it works?";

    // Add popup onClick
    const popup = this.createPolygonModeInfoPopup(moreInfoIcon);
    this._polygonModeContainer.addEventListener("click", () => {
      popup.classList.toggle("show");
    });
  }

  createPolygonModeInfoPopup(container: HTMLElement): HTMLElement {
    const popupContainer = createElement(
      "div",
      "amplify-ctrl-create-polygon-mode-popup-container",
      container
    );

    const popup = createElement(
      "div",
      "amplify-ctrl-create-polygon-mode-popup",
      popupContainer
    );

    const imageIcon1 = new Image(32, 32);
    imageIcon1.src = popupStep1;
    this.createPopupStep(popup, "Move dots to desired position", imageIcon1);

    const imageIcon2 = new Image(32, 32);
    imageIcon2.src = popupStep2;
    this.createPopupStep(popup, "Click on a border to create a dot", imageIcon2);

    const imageIcon3 = new Image(32, 32);
    imageIcon3.src = popupStep3;
    this.createPopupStep(popup, "Click into shape to move", imageIcon3);

    const imageIcon4 = new Image(64, 32);
    imageIcon4.src = popupStep4;
    this.createPopupStep(popup, "Press delete to remove a dot", imageIcon4);

    return popup;
  }

  createPopupStep(
    container: HTMLElement,
    text: string,
    image: HTMLImageElement
  ): void {
    const popupStep = createElement(
      "div",
      "amplify-ctrl-create-polygon-mode-popup-step",
      container
    );
    const popupStepImage = createElement(
      "div",
      "amplify-ctrl-create-polygon-mode-popup-step-image",
      popupStep
    );
    popupStepImage.appendChild(image);

    const popupStepText = createElement(
      "div",
      "amplify-ctrl-create-polygon-mode-popup-step-text",
      popupStep
    );
    popupStepText.innerHTML = text;
  }

  /************************************************************
   * Geofence List
   *************************************************************/
   createGeofenceListContainer() {
    const geofenceListContainer = createElement(
      "div",
      "amplify-ctrl-list-container",
      this.geofenceControlContainer
    );

    this.createGeofenceListHeader(geofenceListContainer);

    this._geofenceList = createElement(
      "div",
      "amplify-ctrl-list",
      geofenceListContainer
    );
  }

  createGeofenceListHeader(geofenceListContainer: HTMLElement) {
    const header = createElement(
      "div",
      "amplify-ctrl-list-header",
      geofenceListContainer
    );

    this._geofenceTitle = createElement(
      "div",
      "amplify-ctrl-list-header-title",
      header
    );
    this._geofenceTitle.innerHTML = "Geofences (0)";

    this._checkBoxAllAndCreateContainer = createElement(
      "div",
      "amplify-ctrl-list-header-checkbox-create-container",
      header
    );
    this.createCheckboxAllContainer(this._checkBoxAllAndCreateContainer);
  }

  createCheckboxAllContainer(geofenceListContainer: HTMLElement) {
    this._checkBoxAllContainer = createElement(
      "div",
      "amplify-ctrl-list-checkbox-all-container",
      geofenceListContainer
    );

    this._checkboxAll = createElement(
      "input",
      "amplify-ctrl-list-checkbox-all",
      this._checkBoxAllContainer
    ) as HTMLInputElement;
    this._checkboxAll.type = "checkbox";
    this._checkboxAll.addEventListener("click", function () {
      if (this._checkboxAll.checked) {
        this.geofenceControl.displayAllGeofences();
        checkboxAllText.innerHTML = "Deselect All";
      } else {
        this.geofenceControl.hideAllGeofences();
        checkboxAllText.innerHTML = "Select All";
      }
    }.bind(this));

    const checkboxAllText = createElement(
      "div",
      "amplify-ctrl-list-checkbox-all-title",
      this._checkBoxAllContainer
    );
    checkboxAllText.innerHTML = "Select all";

    this._addGeofencebutton = createElement(
      "div",
      "amplify-ctrl-list-header-add-button",
      this._checkBoxAllContainer
    ) as HTMLButtonElement;
    this._addGeofencebutton.innerHTML = "+ Add";
    this._addGeofencebutton.addEventListener("click", () => {
      this.createAddGeofenceContainer();
    });
  }

  renderListItem(geofence: Geofence): void {
    const container = createElement(
      "li",
      "amplify-ctrl-list-item-container",
      this._geofenceList
    );
    container.id = `list-item-${geofence.id}`;
    const listItem = createElement("li", "amplify-ctrl-list-item", container);
    listItem.addEventListener("mouseover", function () {
      this.geofenceControl.displayHighlightedGeofence(geofence.id);
    }.bind(this));
    listItem.addEventListener("mouseout", function () {
      this.geofenceControl.hideHighlightedGeofence();
    }.bind(this));

    const checkbox = createElement(
      "input",
      "amplify-ctrl-list-item-checkbox",
      listItem
    );
    checkbox.id = `list-item-checkbox-${geofence.id}`;
    (checkbox as HTMLInputElement).type = "checkbox";
    checkbox.addEventListener("click", function () {
      if ((checkbox as HTMLInputElement).checked) {
        this.geofenceControl.displayGeofence(geofence.id);
      } else {
        this.geofenceControl.hideGeofence(geofence.id);
      }
    }.bind(this));

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
      this.geofenceControl.editGeofence(geofence.id);
      this.createEditControls(container, listItem, geofence.id);
      listItem.classList.remove("amplify-ctrl-list-item");
      listItem.classList.add("amplify-ctrl-list-selected-item");
    }.bind(this));
    const imageIcon = new Image(15, 15);
    imageIcon.src = editIcon;
    editButton.appendChild(imageIcon);
  }

  createEditControls(
    itemContainer: HTMLElement,
    item: HTMLElement,
    id: string
  ): void {
    const editContainer = createElement(
      "div",
      "amplify-ctrl-list-item-controls",
      itemContainer
    );

    this.renderDeleteButton(editContainer, id);

    const rightContainer = createElement(
      "div",
      "amplify-ctrl-list-item-controls-right",
      editContainer
    );

    const removeEditContainer = () => {
      item.classList.remove("amplify-ctrl-list-selected-item");
      item.classList.add("amplify-ctrl-list-item");
      removeElement(editContainer);
    };

    const cancelButton = createElement(
      "div",
      "amplify-ctrl-cancel-button",
      rightContainer
    );
    cancelButton.classList.add("amplify-ctrl-button");
    cancelButton.innerHTML = "Cancel";
    cancelButton.addEventListener("click", () => {
      this.geofenceControl.disableEditingMode();
      removeEditContainer();
    });

    const saveGeofenceButton = createElement(
      "div",
      "amplify-ctrl-save-button amplify-ctrl-button",
      rightContainer
    );
    saveGeofenceButton.addEventListener("click", () => {
      this.geofenceControl.saveGeofence();
      removeEditContainer();
    });
    saveGeofenceButton.title = "Save";
    saveGeofenceButton.innerHTML = "Save";
  }

  /************************************************************
   * Add Geofence Controls
   *************************************************************/

  removeGeofenceCreateContainer(): void {
    removeElement(this._createContainer);
  }

  removeAddGeofenceContainer(): void {
    removeElement(this._addGeofenceContainer);
    showCheckboxAllContainer();
  }

  createAddGeofenceContainer(): void {
    hideCheckboxAllContainer();
    this._addGeofenceContainer = createElement(
      "div",
      "amplify-ctrl-add-geofence-container",
      this._checkBoxAllAndCreateContainer
    );

    const addGeofencePrompt = createElement(
      "div",
      "amplify-ctrl-add-geofence",
      this._addGeofenceContainer
    );

    const nameInput = createElement(
      "input",
      "amplify-ctrl-add-geofence-input",
      addGeofencePrompt
    );
    (nameInput as HTMLInputElement).placeholder = "Name";

    const buttonContainer = createElement(
      "div",
      "amplify-ctrl-add-geofence-buttons",
      addGeofencePrompt
    );

    const cancelButton = createElement(
      "div",
      "amplify-ctrl-add-geofence-cancel-button amplify-ctrl-button ",
      buttonContainer
    );
    cancelButton.innerHTML = "Cancel";
    cancelButton.addEventListener("click", () => {
      this.removeAddGeofenceContainer();
      this.geofenceControl.disableEditingMode();
    });

    const saveButton = createElement(
      "div",
      "amplify-ctrl-button amplify-ctrl-save-button",
      buttonContainer
    );
    saveButton.innerHTML = "Save";
    saveButton.addEventListener("click", function () {
      const output = this.geofenceControl.saveGeofence(
        (nameInput as HTMLInputElement).value
      );
      if (output) this.removeAddGeofenceContainer();
    });

    this.geofenceControl.addEditableGeofence();
  }

  createAddGeofencePromptError(error: string): void {
    const errorDiv = createElement(
      "div",
      "amplify-ctrl-add-geofence-error",
      this._addGeofenceContainer
    );
    errorDiv.innerHTML = error;
  }

  /************************************************************
   * Delete Controls
   *************************************************************/

  renderDeleteButton(container: HTMLElement, id: string): void {
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

  createConfirmDeleteContainer(geofenceId: string): void {
    _deleteGeofenceContainer = createElement(
      "div",
      "amplify-ctrl-delete-prompt-container",
      geofenceControlContainer
    );

    const deleteGeofencePrompt = createElement(
      "div",
      "amplify-ctrl-delete-prompt",
      _deleteGeofenceContainer
    );

    const title = createElement(
      "div",
      "amplify-ctrl-delete-geofence-title",
      deleteGeofencePrompt
    );
    title.innerHTML = `Are you sure you want to delete <strong>${geofenceId}</strong>?`;

    createDeleteButtonsContainer(deleteGeofencePrompt, geofenceId);
  }

  createDeleteButtonsContainer(
    container: HTMLElement,
    geofenceId: string
  ): void {
    const deleteButtonsContainer = createElement(
      "div",
      "amplify-ctrl-delete-geofence-buttons",
      container
    );
    const cancelButton = createElement(
      "div",
      "amplify-ctrl-delete-geofence-cancel-button",
      deleteButtonsContainer
    );
    cancelButton.innerHTML = "Cancel";
    cancelButton.addEventListener("click", () => {
      removeElement(_deleteGeofenceContainer);
    });

    const confirmDeleteButton = createElement(
      "div",
      "amplify-ctrl-delete-geofence-confirm-button",
      deleteButtonsContainer
    );
    confirmDeleteButton.innerHTML = "Delete";
    confirmDeleteButton.addEventListener("click", function () {
      const id = geofenceControl.deleteGeofence(geofenceId);

      if (id) {
        console.log(id);
        createDeleteResultContainer(true);
        removeElement(_deleteGeofenceContainer);
        geofenceControl.disableEditingMode();
      }
    });
  }

  function createDeleteResultContainer(success?: boolean): void {
    _deletePopdownContainer = createElement(
      "div",
      "amplify-ctrl-delete-popdown-container",
      geofenceControlContainer
    );

    const deletePopdown = createElement(
      "div",
      "amplify-ctrl-delete-popdown",
      _deletePopdownContainer
    );

    const deletePopdownCloseButton = createElement(
      "div",
      "amplify-ctrl-delete-popdown-close-button",
      deletePopdown
    );
    deletePopdownCloseButton.innerHTML = "X";
    deletePopdownCloseButton.addEventListener("click", () => {
      removeElement(_deletePopdownContainer);
    });

    const deletePopdownText = createElement(
      "div",
      "amplify-ctrl-delete-popdown-text",
      deletePopdown
    );
    deletePopdownText.innerHTML = success
      ? "Geofence was deleted successfully"
      : "Geofence failed to delete";
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

  function hideCheckboxAllContainer(): void {
    _checkBoxAllContainer.style.display = "none";
  }
  function showCheckboxAllContainer(): void {
    _checkBoxAllContainer.style.display = "flex";
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
