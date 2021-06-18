import { Map } from "maplibre-gl";
import { AmplifyMapLibreRequest } from "../dist/index";
import Amplify, { Auth } from "aws-amplify";

// FIXME: replace configuration with test account config
Amplify.configure({
  Auth: {
    mandatorySignIn: false,
    region: "us-west-2",
    userPoolId: "us-west-2_hRqOUOsCM",
    identityPoolId: "us-west-2:9d17be3a-5ad5-4534-b00a-e6f03674ce7f",
    userPoolWebClientId: "7qooi71bhvgbttb8n4l00modbd",
  },
});

const container = document.createElement("div");
container.setAttribute("id", "map");
container.setAttribute("data-cy", "cypress-map");
container.style.height = "50vh";
container.style.width = "50vh";
document.body.appendChild(container);

async function createMap() {
  var map = new Map({
    container: "map",
    center: [-123.1187, 49.2819],
    zoom: 10,
    style: "test-maps-1",
    transformRequest: new AmplifyMapLibreRequest(
      await Auth.currentCredentials()
    ).transformRequest,
  });

  return map;
}

createMap();
