import icon from "./public/marker.svg";

export function createDefaultIcon(): HTMLImageElement {
  const customIcon = new Image(24, 24);
  customIcon.src = icon;
  return customIcon;
}
