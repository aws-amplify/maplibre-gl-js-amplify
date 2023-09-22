import { LOCATION_MARKER } from './constants';

export function createDefaultIcon(): SVGSVGElement {
  const customIcon = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'svg'
  );
  const iconPath = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'path'
  );
  const iconCircle = document.createElement('circle');

  customIcon.setAttribute('viewBox', '0 0 64 64');
  customIcon.setAttribute('width', '32');
  customIcon.setAttribute('height', '32');
  iconPath.setAttribute('d', LOCATION_MARKER);
  iconPath.setAttribute('fill', '#5d8aff');
  iconCircle.setAttribute('fill', 'white');
  iconCircle.setAttribute('cx', '50%');
  iconCircle.setAttribute('cy', '50%');
  iconCircle.setAttribute('r', '5');
  customIcon.appendChild(iconCircle);
  customIcon.appendChild(iconPath);

  return customIcon;
}
