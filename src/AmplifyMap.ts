import { Auth } from "aws-amplify";
import { ICredentials } from "@aws-amplify/core";
import maplibregl, { Map as maplibreMap } from "maplibre-gl";
import AmplifyMapLibreRequest from "./AmplifyMapLibreRequest";

interface CreateMapOptions {
  container: string;
  center?: [number, number];
  zoom?: number;
  style: string;
  region: string;
}

export default class AmplifyMap {
  map: maplibreMap;
  credentials: ICredentials;
  amplifyRequest: AmplifyMapLibreRequest;

  constructor(options: CreateMapOptions) {
    this.map = new maplibreMap({
      container: options.container,
      center: options.center, // initial map center point
      zoom: options.zoom, // initial map zoom
    });

    Auth.currentCredentials().then((credentials) => {
      this.credentials = credentials;
      this.amplifyRequest = new AmplifyMapLibreRequest(
        credentials,
        options.region
      );
      // FIXME: can remove any cast once DefinitelyTyped is updated
      (this.map as any).setTransformRequest(
        this.amplifyRequest.transformRequest
      );
      this.map.setStyle(options.style);
      this.map.resize();
    });
  }

  addControl = (
    control: maplibregl.Control | maplibregl.IControl,
    position: "top-right" | "top-left" | "bottom-right" | "bottom-left"
  ): void => {
    this.map.addControl(control, position);
  };
}
