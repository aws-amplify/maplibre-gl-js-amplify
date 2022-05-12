const EDIT_ICON_PATH =
  "M0.5 12.375V15.5H3.625L12.8417 6.28333L9.71667 3.15833L0.5 12.375ZM2.93333 13.8333H2.16667V13.0667L9.71667 5.51667L10.4833 6.28333L2.93333 13.8333ZM15.2583 2.69167L13.3083 0.741667C13.1417 0.575 12.9333 0.5 12.7167 0.5C12.5 0.5 12.2917 0.583333 12.1333 0.741667L10.6083 2.26667L13.7333 5.39167L15.2583 3.86667C15.5833 3.54167 15.5833 3.01667 15.2583 2.69167Z";

export function createEditIcon(): SVGSVGElement {
  const customIcon = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  const iconPath = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );

  customIcon.setAttribute("viewBox", "0 0 16 16");
  customIcon.setAttribute("width", "16");
  customIcon.setAttribute("height", "16");
  customIcon.setAttribute("fill", "none");
  iconPath.setAttribute("d", EDIT_ICON_PATH);
  iconPath.setAttribute("fill", "white");
  customIcon.appendChild(iconPath);

  return customIcon;
}

const TRASH_ICON_PATH =
  "M9.33317 5.5V13.8333H2.6665V5.5H9.33317ZM8.08317 0.5H3.9165L3.08317 1.33333H0.166504V3H11.8332V1.33333H8.9165L8.08317 0.5ZM10.9998 3.83333H0.999837V13.8333C0.999837 14.75 1.74984 15.5 2.6665 15.5H9.33317C10.2498 15.5 10.9998 14.75 10.9998 13.8333V3.83333Z";

export function createTrashIcon(): SVGSVGElement {
  const customIcon = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  const iconPath = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );

  customIcon.setAttribute("viewBox", "0 0 12 16");
  customIcon.setAttribute("width", "12");
  customIcon.setAttribute("height", "16");
  customIcon.setAttribute("fill", "none");
  iconPath.setAttribute("d", TRASH_ICON_PATH);
  iconPath.setAttribute("fill", "white");
  customIcon.appendChild(iconPath);

  return customIcon;
}

export function createPopupStep1Icon(): SVGSVGElement {
  const customIcon = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  customIcon.setAttribute("viewBox", "0 0 38 38");
  customIcon.setAttribute("width", "38");
  customIcon.setAttribute("height", "38");
  customIcon.setAttribute("fill", "none");

  const circle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  circle.setAttribute("cx", "19");
  circle.setAttribute("cy", "18");
  circle.setAttribute("r", "8");
  circle.setAttribute("fill", "#FF9900");

  const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path1.setAttribute("d", "M19 0L23.3302 7.5H14.6699L19 0Z");
  path1.setAttribute("fill", "#003560");
  const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path2.setAttribute("d", "M19 36.5L14.6698 29H23.3301L19 36.5Z");
  path2.setAttribute("fill", "#003560");
  const path3 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path3.setAttribute("d", "M0 18.33L7.5 13.9999L7.5 22.6602L0 18.33Z");
  path3.setAttribute("fill", "#003560");
  const path4 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path4.setAttribute("d", "M37.5 18.3301L30 22.6603V14L37.5 18.3301Z");
  path4.setAttribute("fill", "#003560");

  customIcon.appendChild(circle);
  customIcon.appendChild(path1);
  customIcon.appendChild(path2);
  customIcon.appendChild(path3);
  customIcon.appendChild(path4);

  return customIcon;
}

export function createPopupStep2Icon(): SVGSVGElement {
  const customIcon = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  customIcon.setAttribute("viewBox", "0 0 42 27");
  customIcon.setAttribute("width", "42");
  customIcon.setAttribute("height", "27");
  customIcon.setAttribute("fill", "none");

  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("y1", "8");
  line.setAttribute("x2", "42");
  line.setAttribute("y2", "8");
  line.setAttribute("stroke", "black");
  line.setAttribute("stroke-width", "2");

  const circle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  circle.setAttribute("cx", "21");
  circle.setAttribute("cy", "8");
  circle.setAttribute("r", "8");
  circle.setAttribute("fill", "#FF9900");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute(
    "d",
    "M21 6.17822V22.488L24.6951 19.4356L27.172 26.1782L29.0399 25.3582L26.6035 18.57L31.4762 17.9322L21 6.17822Z"
  );
  path.setAttribute("fill", "#003560");

  customIcon.appendChild(line);
  customIcon.appendChild(circle);
  customIcon.appendChild(path);

  return customIcon;
}

export function createPopupStep3Icon(): SVGSVGElement {
  const customIcon = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  customIcon.setAttribute("viewBox", "0 0 32 32");
  customIcon.setAttribute("width", "32");
  customIcon.setAttribute("height", "32");
  customIcon.setAttribute("fill", "none");

  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("y", "1");
  rect.setAttribute("x", "1");
  rect.setAttribute("width", "30");
  rect.setAttribute("height", "30");
  rect.setAttribute("fill", "#2196F3");
  rect.setAttribute("fill-opacity", "0.4");
  rect.setAttribute("stroke", "#003560");
  rect.setAttribute("stroke-width", "2");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute(
    "d",
    "M11 6V22.3098L14.6951 19.2574L17.172 26L19.0399 25.18L16.6035 18.3918L21.4762 17.754L11 6Z"
  );
  path.setAttribute("fill", "#003560");

  customIcon.appendChild(rect);
  customIcon.appendChild(path);

  return customIcon;
}

export function createPopupStep4Icon(): SVGSVGElement {
  const customIcon = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  customIcon.setAttribute("viewBox", "0 0 64 20");
  customIcon.setAttribute("width", "64");
  customIcon.setAttribute("height", "20");
  customIcon.setAttribute("fill", "none");

  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("y", "0.5");
  rect.setAttribute("x", "0.5");
  rect.setAttribute("width", "63");
  rect.setAttribute("height", "19");
  rect.setAttribute("rx", "3.5");
  rect.setAttribute("stroke", "#014478");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute(
    "d",
    "M14.4148 15C17.517 15 19.3118 13.076 19.3118 9.89418C19.3118 6.72727 17.517 4.81818 14.5192 4.81818H11.1186V15H14.4148ZM12.6548 13.6577V6.16051H14.4247C16.652 6.16051 17.8004 7.4929 17.8004 9.89418C17.8004 12.3054 16.652 13.6577 14.3303 13.6577H12.6548ZM24.394 15.1541C26.0595 15.1541 27.2377 14.3338 27.5758 13.0909L26.1689 12.8374C25.9004 13.5582 25.2541 13.9261 24.4089 13.9261C23.1362 13.9261 22.2811 13.1009 22.2413 11.6293H27.6703V11.1023C27.6703 8.34304 26.0197 7.2642 24.2896 7.2642C22.1618 7.2642 20.7598 8.88494 20.7598 11.2315C20.7598 13.603 22.1419 15.1541 24.394 15.1541ZM22.2463 10.5156C22.3059 9.43182 23.0914 8.49219 24.2995 8.49219C25.4529 8.49219 26.2086 9.3473 26.2136 10.5156H22.2463ZM30.8061 4.81818H29.3196V15H30.8061V4.81818ZM36.0971 15.1541C37.7626 15.1541 38.9409 14.3338 39.2789 13.0909L37.872 12.8374C37.6035 13.5582 36.9572 13.9261 36.112 13.9261C34.8393 13.9261 33.9842 13.1009 33.9444 11.6293H39.3734V11.1023C39.3734 8.34304 37.7228 7.2642 35.9927 7.2642C33.8649 7.2642 32.4629 8.88494 32.4629 11.2315C32.4629 13.603 33.845 15.1541 36.0971 15.1541ZM33.9494 10.5156C34.0091 9.43182 34.7946 8.49219 36.0027 8.49219C37.1561 8.49219 37.9118 9.3473 37.9167 10.5156H33.9494ZM44.5874 7.36364H43.0213V5.53409H41.5348V7.36364H40.4162V8.55682H41.5348V13.0661C41.5298 14.4531 42.5888 15.1243 43.7621 15.0994C44.2344 15.0945 44.5526 15.005 44.7266 14.9403L44.4581 13.7124C44.3587 13.7322 44.1747 13.777 43.9361 13.777C43.4538 13.777 43.0213 13.6179 43.0213 12.7578V8.55682H44.5874V7.36364ZM49.4409 15.1541C51.1064 15.1541 52.2846 14.3338 52.6227 13.0909L51.2157 12.8374C50.9473 13.5582 50.301 13.9261 49.4558 13.9261C48.1831 13.9261 47.3279 13.1009 47.2882 11.6293H52.7172V11.1023C52.7172 8.34304 51.0666 7.2642 49.3365 7.2642C47.2086 7.2642 45.8066 8.88494 45.8066 11.2315C45.8066 13.603 47.1887 15.1541 49.4409 15.1541ZM47.2931 10.5156C47.3528 9.43182 48.1383 8.49219 49.3464 8.49219C50.4998 8.49219 51.2555 9.3473 51.2605 10.5156H47.2931Z"
  );
  path.setAttribute("fill", "black");

  customIcon.appendChild(rect);
  customIcon.appendChild(path);

  return customIcon;
}

export function createDeleteSuccessIcon(): SVGSVGElement {
  const customIcon = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  customIcon.setAttribute("viewBox", "0 0 12 12");
  customIcon.setAttribute("width", "12");
  customIcon.setAttribute("height", "12");
  customIcon.setAttribute("fill", "none");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute(
    "d",
    "M6 0C2.688 0 0 2.688 0 6C0 9.312 2.688 12 6 12C9.312 12 12 9.312 12 6C12 2.688 9.312 0 6 0ZM6 10.8C3.354 10.8 1.2 8.646 1.2 6C1.2 3.354 3.354 1.2 6 1.2C8.646 1.2 10.8 3.354 10.8 6C10.8 8.646 8.646 10.8 6 10.8ZM8.754 3.348L4.8 7.302L3.246 5.754L2.4 6.6L4.8 9L9.6 4.2L8.754 3.348Z"
  );
  path.setAttribute("fill", "white");

  customIcon.appendChild(path);

  return customIcon;
}

export function createCloseIcon(): SVGSVGElement {
  const customIcon = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  customIcon.setAttribute("viewBox", "0 0 12 12");
  customIcon.setAttribute("width", "12");
  customIcon.setAttribute("height", "12");
  customIcon.setAttribute("fill", "none");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute(
    "d",
    "M10.773 2.28762L9.71231 1.22696L6 4.93927L2.28769 1.22696L1.22703 2.28762L4.93934 5.99993L1.22703 9.71224L2.28769 10.7729L6 7.06059L9.71231 10.7729L10.773 9.71224L7.06066 5.99993L10.773 2.28762Z"
  );
  path.setAttribute("fill", "white");
  path.setAttribute("fill-rule", "evenodd");
  path.setAttribute("clip-rule", "evenodd");

  customIcon.appendChild(path);

  return customIcon;
}

export function createErrorIcon(): SVGSVGElement {
  const customIcon = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  customIcon.setAttribute("viewBox", "0 0 12 10");
  customIcon.setAttribute("width", "12");
  customIcon.setAttribute("height", "10");
  customIcon.setAttribute("fill", "none");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute(
    "d",
    "M0 10H11.5789L5.78947 0L0 10ZM6.31579 8.42105H5.26316V7.36842H6.31579V8.42105ZM6.31579 6.31579H5.26316V4.21053H6.31579V6.31579Z"
  );
  path.setAttribute("fill", "#FF5050");

  customIcon.appendChild(path);

  return customIcon;
}
