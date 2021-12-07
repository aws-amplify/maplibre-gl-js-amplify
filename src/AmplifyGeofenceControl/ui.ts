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
  let _checkBoxAllAndCreateContainer: HTMLElement;
  let _checkBoxAllContainer: HTMLElement;
  let _circleModeContainer: HTMLElement;
  let _polygonModeContainer: HTMLElement;
  let _deletePopdownContainer: HTMLElement;

  function registerControlPosition(map, positionName): void {
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

  function createGeofenceCreateContainer(isCircle?: boolean): void {
    const container = createElement(
      "div",
      "amplify-ctrl-create-prompt-container",
      geofenceControlContainer
    );

    _createContainer = createElement(
      "div",
      "amplify-ctrl-create-prompt",
      container
    );

    if (isCircle) {
      /* Create buttons to switch between different modes */
      const buttonContainer = createElement(
        "div",
        "amplify-ctrl-create-prompt-buttons",
        _createContainer
      );

      const circleModeButton = createElement(
        "div",
        "amplify-ctrl-create-prompt-button-circle amplify-ctrl-create-prompt-button",
        buttonContainer
      );
      circleModeButton.addEventListener("click", () => {
        geofenceControl.changeMode("draw_circle");
        // Change button selected style
        circleModeButton.classList.add("amplify-ctrl-create-prompt-selected");
        polygonModeButton.classList.remove(
          "amplify-ctrl-create-prompt-selected"
        );

        // Switch info box mode
        if (_polygonModeContainer) {
          removeElement(_polygonModeContainer);
          _polygonModeContainer = undefined;
        }
        if (!_circleModeContainer)
          createCircleModeCreateContainer(_createContainer);
      });
      circleModeButton.innerHTML = "Circle";

      const polygonModeButton = createElement(
        "div",
        "amplify-ctrl-create-prompt-button-polygon amplify-ctrl-create-prompt-button",
        buttonContainer
      );
      polygonModeButton.addEventListener("click", () => {
        geofenceControl.changeMode("draw_polygon");
        // Change button selected style
        polygonModeButton.classList.add("amplify-ctrl-create-prompt-selected");
        circleModeButton.classList.remove(
          "amplify-ctrl-create-prompt-selected"
        );

        // Switch info box mode
        if (_circleModeContainer) {
          removeElement(_circleModeContainer);
          _circleModeContainer = undefined;
        }
        if (!_polygonModeContainer)
          createPolygonModeCreateContainer(_createContainer);
      });
      polygonModeButton.innerHTML = "Custom";

      circleModeButton.classList.add("amplify-ctrl-create-prompt-selected");

      createCircleModeCreateContainer(_createContainer);
    } else {
      createPolygonModeCreateContainer(_createContainer);
    }
  }

  function createCircleModeCreateContainer(container: HTMLElement): void {
    _circleModeContainer = createElement(
      "div",
      "amplify-ctrl-create-circle-mode-container",
      container
    );

    const radiusTitle = createElement(
      "div",
      "amplify-ctrl-create-circle-mode-title",
      _circleModeContainer
    );
    radiusTitle.innerHTML = "Radius";

    const geofenceCreateInput = createElement(
      "input",
      "amplify-ctrl-create-circle-mode-input",
      _circleModeContainer
    );
    geofenceCreateInput.addEventListener(
      "keydown",
      debounce(geofenceControl.updateInputRadius, 200)
    );
  }

  function createPolygonModeCreateContainer(container: HTMLElement): void {
    _polygonModeContainer = createElement(
      "div",
      "amplify-ctrl-create-polygon-mode-container",
      container
    );

    const moreInfoContainer = createElement(
      "div",
      "amplify-ctrl-create-polygon-mode-info-container",
      _polygonModeContainer
    );
    const moreInfoIcon = createElement(
      "div",
      "amplify-ctrl-create-polygon-mode-icon",
      moreInfoContainer
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
      moreInfoContainer
    );
    moreInfo.innerHTML = "How it works?";

    const resetButton = createElement(
      "div",
      "amplify-ctrl-create-polygon-mode-reset-button amplify-ctrl-button",
      _polygonModeContainer
    );
    resetButton.innerHTML = "Reset";
    resetButton.addEventListener("click", () => {
      geofenceControl.changeMode("draw_polygon");
    });

    // Add popup onClick
    const popup = createPolygonModeInfoPopup(moreInfoIcon);
    moreInfoContainer.addEventListener("click", () => {
      popup.classList.toggle("show");
    });
  }

  function createPolygonModeInfoPopup(container: HTMLElement): HTMLElement {
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
    createPopupStep(popup, "Move dots to desired position", imageIcon1);

    const imageIcon2 = new Image(32, 32);
    imageIcon2.src = popupStep2;
    createPopupStep(popup, "Click on a border to create a dot", imageIcon2);

    const imageIcon3 = new Image(32, 32);
    imageIcon3.src = popupStep3;
    createPopupStep(popup, "Click into shape to move", imageIcon3);

    const imageIcon4 = new Image(64, 32);
    imageIcon4.src = popupStep4;
    createPopupStep(popup, "Press delete to remove a dot", imageIcon4);

    return popup;
  }

  function createPopupStep(
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

  function removeGeofenceCreateContainer() {
    removeElement(_createContainer);
    _createContainer = undefined;
    _circleModeContainer = undefined;
    _polygonModeContainer = undefined;
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

    _geofenceList = createElement(
      "div",
      "amplify-ctrl-list",
      geofenceListContainer
    );
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

    _checkBoxAllAndCreateContainer = createElement(
      "div",
      "amplify-ctrl-list-header-checkbox-create-container",
      header
    );
    createCheckboxAllContainer(_checkBoxAllAndCreateContainer);
  }

  function createCheckboxAllContainer(geofenceListContainer: HTMLElement) {
    _checkBoxAllContainer = createElement(
      "div",
      "amplify-ctrl-list-checkbox-all-container",
      geofenceListContainer
    );

    _checkboxAll = createElement(
      "input",
      "amplify-ctrl-list-checkbox-all",
      _checkBoxAllContainer
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
      "amplify-ctrl-list-checkbox-all-title",
      _checkBoxAllContainer
    );
    checkboxAllText.innerHTML = "Select all";

    _addGeofencebutton = createElement(
      "div",
      "amplify-ctrl-list-header-add-button",
      _checkBoxAllContainer
    ) as HTMLButtonElement;
    _addGeofencebutton.innerHTML = "+ Add";
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
    container.id = `list-item-${geofence.geofenceId}`;
    const listItem = createElement("li", "amplify-ctrl-list-item", container);
    listItem.addEventListener("mouseover", function () {
      geofenceControl.displayHighlightedGeofence(geofence.geofenceId);
    });
    listItem.addEventListener("mouseout", function () {
      geofenceControl.hideHighlightedGeofence();
    });

    const checkbox = createElement(
      "input",
      "amplify-ctrl-list-item-checkbox",
      listItem
    );
    checkbox.id = `list-item-checkbox-${geofence.geofenceId}`;
    (checkbox as HTMLInputElement).type = "checkbox";
    checkbox.addEventListener("click", function () {
      if ((checkbox as HTMLInputElement).checked) {
        geofenceControl.displayGeofence(geofence.geofenceId);
      } else {
        geofenceControl.hideGeofence(geofence.geofenceId);
      }
    });

    const geofenceTitle = createElement(
      "div",
      "amplify-ctrl-list-item-title",
      listItem
    );
    geofenceTitle.innerHTML = geofence.geofenceId;

    const editButton = createElement(
      "div",
      "amplify-ctrl-edit-button",
      listItem
    );
    editButton.addEventListener("click", function () {
      geofenceControl.editGeofence(geofence.geofenceId);
      createEditControls(container, listItem, geofence.geofenceId);
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
      geofenceControl.setEditingModeEnabled(false);
      removeEditContainer();
    });

    const saveGeofenceButton = createElement(
      "div",
      "amplify-ctrl-save-button amplify-ctrl-button",
      rightContainer
    );
    saveGeofenceButton.addEventListener("click", async () => {
      await geofenceControl.updateGeofence();
      removeEditContainer();
    });
    saveGeofenceButton.title = "Save";
    saveGeofenceButton.innerHTML = "Save";
  }

  /************************************************************
   * Add Geofence Controls
   *************************************************************/

  function removeAddGeofenceContainer(): void {
    removeElement(_addGeofenceContainer);
    showCheckboxAllContainer();
  }

  function createAddGeofenceContainer(): void {
    hideCheckboxAllContainer();
    _addGeofenceContainer = createElement(
      "div",
      "amplify-ctrl-add-geofence-container",
      _checkBoxAllAndCreateContainer
    );

    const addGeofencePrompt = createElement(
      "div",
      "amplify-ctrl-add-geofence",
      _addGeofenceContainer
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
      removeAddGeofenceContainer();
      geofenceControl.setEditingModeEnabled(false);
    });

    const saveButton = createElement(
      "div",
      "amplify-ctrl-button amplify-ctrl-save-button",
      buttonContainer
    );
    saveButton.innerHTML = "Save";
    saveButton.addEventListener("click", async function () {
      const output = await geofenceControl.createGeofence(
        escape((nameInput as HTMLInputElement).value)
      );
      if (output) removeAddGeofenceContainer();
    });

    geofenceControl.addEditableGeofence();
  }

  function createAddGeofencePromptError(error: string): void {
    const errorDiv = createElement(
      "div",
      "amplify-ctrl-add-geofence-error",
      _addGeofenceContainer
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

  function createDeleteButtonsContainer(
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
    confirmDeleteButton.addEventListener("click", async function () {
      const id = await geofenceControl.deleteGeofence(geofenceId);

      if (id) {
        console.log(id);
        createDeleteResultContainer(true);
        removeElement(_deleteGeofenceContainer);
        geofenceControl.setEditingModeEnabled(false);
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

  function setGeofenceListEnabled(enabled): void {
    _checkboxAll.disabled = !enabled;

    if (enabled) {
      _addGeofencebutton.classList.remove("amplify-ctrl-noHover");
      _geofenceList.classList.remove("amplify-ctrl-noHover");
    } else {
      _addGeofencebutton.classList.add("amplify-ctrl-noHover");
      _geofenceList.classList.add("amplify-ctrl-noHover");
    }

    const inputs = document.getElementsByClassName(
      "amplify-ctrl-list-item-checkbox"
    );
    for (let i = 0; i < inputs.length; i++) {
      (inputs.item(i) as HTMLInputElement).disabled = !enabled;
    }
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
    setGeofenceListEnabled,
    getCheckboxAllValue,
    removeGeofenceCreateContainer,
    updateGeofenceCount,
  };
}
