import { Geofence } from "../types";
import { debounce } from "debounce";
import { createElement, removeElement } from "../utils";
import {
  createEditIcon,
  createPopupStep1Icon,
  createPopupStep2Icon,
  createPopupStep3Icon,
  createPopupStep4Icon,
  createTrashIcon,
  createDeleteSuccessIcon,
  createCloseIcon,
} from "./icons";

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
      "geofence-ctrl-create-prompt-container",
      geofenceControlContainer
    );

    _createContainer = createElement(
      "div",
      "geofence-ctrl-create-prompt",
      container
    );

    if (isCircle) {
      /* Create buttons to switch between different modes */
      const buttonContainer = createElement(
        "div",
        "geofence-ctrl-create-prompt-buttons",
        _createContainer
      );

      const circleModeButton = createElement(
        "div",
        "geofence-ctrl-create-prompt-button-circle geofence-ctrl-create-prompt-button",
        buttonContainer
      );
      circleModeButton.addEventListener("click", () => {
        geofenceControl.changeMode("draw_circle");
        // Change button selected style
        circleModeButton.classList.add("geofence-ctrl-create-prompt-selected");
        polygonModeButton.classList.remove(
          "geofence-ctrl-create-prompt-selected"
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
        "geofence-ctrl-create-prompt-button-polygon geofence-ctrl-create-prompt-button",
        buttonContainer
      );
      polygonModeButton.addEventListener("click", () => {
        geofenceControl.changeMode("draw_polygon");
        // Change button selected style
        polygonModeButton.classList.add("geofence-ctrl-create-prompt-selected");
        circleModeButton.classList.remove(
          "geofence-ctrl-create-prompt-selected"
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

      circleModeButton.classList.add("geofence-ctrl-create-prompt-selected");

      createCircleModeCreateContainer(_createContainer);
    } else {
      createPolygonModeCreateContainer(_createContainer);
    }
  }

  function createCircleModeCreateContainer(container: HTMLElement): void {
    _circleModeContainer = createElement(
      "div",
      "geofence-ctrl-create-circle-mode-container",
      container
    );

    const radiusTitle = createElement(
      "div",
      "geofence-ctrl-create-circle-mode-title",
      _circleModeContainer
    );
    radiusTitle.innerHTML = "Radius";

    const geofenceCreateInput = createElement(
      "input",
      "geofence-ctrl-create-circle-mode-input",
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
      "geofence-ctrl-create-polygon-mode-container",
      container
    );

    const moreInfoContainer = createElement(
      "div",
      "geofence-ctrl-create-polygon-mode-info-container",
      _polygonModeContainer
    );
    const moreInfoIcon = createElement(
      "div",
      "geofence-ctrl-create-polygon-mode-icon",
      moreInfoContainer
    );

    const letterI = createElement(
      "div",
      "geofence-ctrl-create-polygon-mode-info-icon",
      moreInfoIcon
    );
    letterI.innerHTML = "i";

    const moreInfo = createElement(
      "div",
      "geofence-ctrl-create-polygon-mode-title",
      moreInfoContainer
    );
    moreInfo.innerHTML = "How it works?";

    const resetButton = createElement(
      "div",
      "geofence-ctrl-create-polygon-mode-reset-button geofence-ctrl-button",
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
      "geofence-ctrl-create-polygon-mode-popup-container",
      container
    );

    const popup = createElement(
      "div",
      "geofence-ctrl-create-polygon-mode-popup",
      popupContainer
    );

    createPopupStep(
      popup,
      "Move dots to desired position",
      createPopupStep1Icon()
    );

    createPopupStep(
      popup,
      "Click on a border to create a dot",
      createPopupStep2Icon()
    );

    createPopupStep(popup, "Click into shape to move", createPopupStep3Icon());

    createPopupStep(
      popup,
      "Press delete to remove a dot",
      createPopupStep4Icon()
    );

    return popup;
  }

  function createPopupStep(
    container: HTMLElement,
    text: string,
    image: SVGSVGElement
  ): void {
    const popupStep = createElement(
      "div",
      "geofence-ctrl-create-polygon-mode-popup-step",
      container
    );
    const popupStepImage = createElement(
      "div",
      "geofence-ctrl-create-polygon-mode-popup-step-image",
      popupStep
    );
    popupStepImage.appendChild(image);

    const popupStepText = createElement(
      "div",
      "geofence-ctrl-create-polygon-mode-popup-step-text",
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
      "geofence-ctrl-list-container",
      geofenceControlContainer
    );

    createGeofenceListHeader(geofenceListContainer);

    _geofenceList = createElement(
      "div",
      "geofence-ctrl-list",
      geofenceListContainer
    );
    _geofenceList.addEventListener("scroll", () => {
      const { scrollHeight, scrollTop, clientHeight } = _geofenceList;
      if (scrollTop + clientHeight >= scrollHeight - 20) {
        geofenceControl.loadMoreGeofences();
      }
    });
  }

  function createGeofenceListHeader(geofenceListContainer: HTMLElement) {
    const header = createElement(
      "div",
      "geofence-ctrl-list-header",
      geofenceListContainer
    );

    _geofenceTitle = createElement(
      "div",
      "geofence-ctrl-list-header-title",
      header
    );
    _geofenceTitle.innerHTML = "Geofences (0)";

    _checkBoxAllAndCreateContainer = createElement(
      "div",
      "geofence-ctrl-list-header-checkbox-create-container",
      header
    );
    createCheckboxAllContainer(_checkBoxAllAndCreateContainer);
  }

  function createCheckboxAllContainer(geofenceListContainer: HTMLElement) {
    _checkBoxAllContainer = createElement(
      "div",
      "geofence-ctrl-list-checkbox-all-container",
      geofenceListContainer
    );

    _checkboxAll = createElement(
      "input",
      "geofence-ctrl-list-checkbox-all",
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
      "geofence-ctrl-list-checkbox-all-title",
      _checkBoxAllContainer
    );
    checkboxAllText.innerHTML = "Select all";

    _addGeofencebutton = createElement(
      "div",
      "geofence-ctrl-list-header-add-button",
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
      "geofence-ctrl-list-item-container",
      _geofenceList
    );
    container.id = `list-item-${geofence.geofenceId}`;
    const listItem = createElement("li", "geofence-ctrl-list-item", container);

    const leftContainer = createElement(
      "div",
      "geofence-ctrl-list-item-left-container",
      listItem
    );
    const checkbox = createElement(
      "input",
      "geofence-ctrl-list-item-checkbox",
      leftContainer
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

    const rightContainer = createElement(
      "div",
      "geofence-ctrl-list-item-right-container",
      listItem
    );

    const geofenceTitleContainer = createElement(
      "div",
      "geofence-ctrl-list-item-title-container",
      rightContainer
    );
    geofenceTitleContainer.addEventListener("mouseover", function () {
      geofenceControl.displayHighlightedGeofence(geofence.geofenceId);
    });
    geofenceTitleContainer.addEventListener("mouseout", function () {
      geofenceControl.hideHighlightedGeofence();
    });

    const geofenceTitle = createElement(
      "div",
      "geofence-ctrl-list-item-title",
      geofenceTitleContainer
    );
    geofenceTitle.innerHTML = geofence.geofenceId;

    const editButton = createElement(
      "div",
      "geofence-ctrl-edit-button",
      geofenceTitleContainer
    );
    editButton.addEventListener("click", function () {
      geofenceControl.editGeofence(geofence.geofenceId);
      createEditControls(
        listItem,
        rightContainer,
        leftContainer,
        geofence.geofenceId
      );
      listItem.classList.remove("geofence-ctrl-list-item");
      listItem.classList.add("geofence-ctrl-list-selected-item");
    });
    editButton.appendChild(createEditIcon());
  }

  function createEditControls(
    item: HTMLElement,
    rightContainer: HTMLElement,
    leftContainer: HTMLElement,
    id: string
  ): void {
    const editContainer = createElement(
      "div",
      "geofence-ctrl-list-item-controls",
      rightContainer
    );

    const deleteButton = renderDeleteButton(leftContainer, id);

    const removeEditContainer = () => {
      item.classList.remove("geofence-ctrl-list-selected-item");
      item.classList.add("geofence-ctrl-list-item");
      removeElement(editContainer);
      removeElement(deleteButton);
    };

    const cancelButton = createElement(
      "div",
      "geofence-ctrl-cancel-button",
      editContainer
    );
    cancelButton.classList.add("geofence-ctrl-button");
    cancelButton.innerHTML = "Cancel";
    cancelButton.addEventListener("click", () => {
      geofenceControl.setEditingModeEnabled(false);
      removeEditContainer();
    });

    const saveGeofenceButton = createElement(
      "div",
      "geofence-ctrl-save-button geofence-ctrl-button",
      editContainer
    );
    saveGeofenceButton.addEventListener("click", async () => {
      await geofenceControl.saveGeofence();
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
      "geofence-ctrl-add-geofence-container",
      _checkBoxAllAndCreateContainer
    );

    const addGeofencePrompt = createElement(
      "div",
      "geofence-ctrl-add-geofence",
      _addGeofenceContainer
    );

    const nameInput = createElement(
      "input",
      "geofence-ctrl-add-geofence-input",
      addGeofencePrompt
    );
    (nameInput as HTMLInputElement).placeholder = "Enter name";

    const buttonContainer = createElement(
      "div",
      "geofence-ctrl-add-geofence-buttons",
      addGeofencePrompt
    );

    const cancelButton = createElement(
      "div",
      "geofence-ctrl-add-geofence-cancel-button geofence-ctrl-button ",
      buttonContainer
    );
    cancelButton.innerHTML = "Cancel";
    cancelButton.addEventListener("click", () => {
      removeAddGeofenceContainer();
      geofenceControl.setEditingModeEnabled(false);
    });

    const saveButton = createElement(
      "div",
      "geofence-ctrl-button geofence-ctrl-save-button",
      buttonContainer
    );
    saveButton.innerHTML = "Save";
    saveButton.addEventListener("click", async function () {
      const output = await geofenceControl.saveGeofence(
        escape((nameInput as HTMLInputElement).value)
      );
      if (output) removeAddGeofenceContainer();
    });

    geofenceControl.addEditableGeofence();
  }

  function createAddGeofencePromptError(error: string): void {
    const errorDiv = createElement(
      "div",
      "geofence-ctrl-add-geofence-error",
      _addGeofenceContainer
    );
    errorDiv.innerHTML = error;
  }

  /************************************************************
   * Delete Controls
   *************************************************************/

  function renderDeleteButton(container: HTMLElement, id: string): HTMLElement {
    const deleteButton = createElement(
      "div",
      "geofence-ctrl-delete-button",
      container
    );
    deleteButton.classList.add("geofence-ctrl-button");
    deleteButton.addEventListener("click", function () {
      createConfirmDeleteContainer(id);
    });
    deleteButton.appendChild(createTrashIcon());

    return deleteButton;
  }

  function createConfirmDeleteContainer(geofenceId: string): void {
    _deleteGeofenceContainer = createElement(
      "div",
      "geofence-ctrl-delete-prompt-container",
      geofenceControlContainer
    );

    const deleteGeofencePrompt = createElement(
      "div",
      "geofence-ctrl-delete-prompt",
      _deleteGeofenceContainer
    );

    const title = createElement(
      "div",
      "geofence-ctrl-delete-geofence-title",
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
      "geofence-ctrl-delete-geofence-buttons",
      container
    );
    const cancelButton = createElement(
      "div",
      "geofence-ctrl-delete-geofence-cancel-button",
      deleteButtonsContainer
    );
    cancelButton.innerHTML = "Cancel";
    cancelButton.addEventListener("click", () => {
      removeElement(_deleteGeofenceContainer);
    });

    const confirmDeleteButton = createElement(
      "div",
      "geofence-ctrl-delete-geofence-confirm-button",
      deleteButtonsContainer
    );
    confirmDeleteButton.innerHTML = "Delete";
    confirmDeleteButton.addEventListener("click", async function () {
      const id = await geofenceControl.deleteGeofence(geofenceId);

      if (id) {
        createDeleteResultContainer(true);
        removeElement(_deleteGeofenceContainer);
        geofenceControl.setEditingModeEnabled(false);
      }
    });
  }

  function createDeleteResultContainer(success?: boolean): void {
    _deletePopdownContainer = createElement(
      "div",
      "geofence-ctrl-delete-popdown-container",
      geofenceControlContainer
    );

    const deletePopdown = createElement(
      "div",
      "geofence-ctrl-delete-popdown",
      _deletePopdownContainer
    );

    const deletePopdownCloseButton = createElement(
      "div",
      "geofence-ctrl-delete-popdown-close-button",
      _deletePopdownContainer
    );
    deletePopdownCloseButton.appendChild(createCloseIcon());
    deletePopdownCloseButton.addEventListener("click", () => {
      removeElement(_deletePopdownContainer);
    });

    const deleteSuccessIcon = createElement(
      "div",
      "geofence-ctrl-delete-popdown-icon",
      deletePopdown
    );
    deleteSuccessIcon.appendChild(createDeleteSuccessIcon());

    const deletePopdownText = createElement(
      "div",
      "geofence-ctrl-delete-popdown-text",
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

    enabled
      ? _addGeofencebutton.classList.remove("geofence-ctrl-noHover")
      : _addGeofencebutton.classList.add("geofence-ctrl-noHover");

    const inputs = document.getElementsByClassName(
      "geofence-ctrl-list-item-checkbox"
    );
    for (let i = 0; i < inputs.length; i++) {
      (inputs.item(i) as HTMLInputElement).disabled = !enabled;
    }

    const items = document.getElementsByClassName(
      "geofence-ctrl-list-item-container"
    );
    for (let i = 0; i < items.length; i++) {
      enabled
        ? items.item(i).classList.remove("geofence-ctrl-noHover")
        : items.item(i).classList.add("geofence-ctrl-noHover");
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
