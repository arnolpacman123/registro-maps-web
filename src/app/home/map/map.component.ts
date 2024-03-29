import { Component, EventEmitter, Output } from '@angular/core';
import {
  LeafletModule,
  LeafletControlLayersConfig,
} from '@asymmetrik/ngx-leaflet';
import {
  latLng,
  MapOptions,
  tileLayer,
  Map,
  Control,
  LocationEvent,
  LatLng,
  LeafletEvent,
  Marker,
  icon,
} from 'leaflet';
import { NgxLeafletLocateModule } from '@runette/ngx-leaflet-locate';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [LeafletModule, NgxLeafletLocateModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css',
})
export class MapComponent {
  options: MapOptions = {
    layers: [
      tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }),
    ],
    attributionControl: false,
    zoom: 13,
    center: latLng(-17.7834, -63.1821),
    doubleClickZoom: false,
  };

  layersControl: LeafletControlLayersConfig = {
    baseLayers: {
      'Google Maps': tileLayer(
        'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
        {
          maxZoom: 22,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        }
      ),
      'Google Satellite': tileLayer(
        'https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
        {
          maxZoom: 22,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        }
      ),
      'Open Street Map': tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 20,
        }
      ),
    },
    overlays: {},
  };
  map!: Map;
  locateOptions: Control.LocateOptions = {
    position: 'bottomright',
    strings: {
      title: 'Mostrar mi ubicación actual',
    },
    locateOptions: {
      enableHighAccuracy: true,
      watch: true,
    },
    keepCurrentZoomLevel: true,
    flyTo: true,
    cacheLocation: true,
  };
  myLocation?: LatLng;
  markers: Marker[] = [];
  @Output() onNewLocation = new EventEmitter<LocationEvent>();
  @Output() onLocateDeactivate = new EventEmitter<void>();

  onMapReady(map: Map) {
    this.map = map;
    this.map.on('locatedeactivate', this._onLocateDeactivate.bind(this));
  }

  _onLocateDeactivate(_: LeafletEvent) {
    this.myLocation = undefined!;
    this.onLocateDeactivate.emit();
  }

  _onNewLocation(event: LocationEvent) {
    this.myLocation = event.latlng;
    this.onNewLocation.emit(event);
  }

  addLocation(myLocation: LatLng) {
    const marker = new Marker(myLocation, {
      icon: icon({
        iconSize: [25, 34],
        iconUrl: 'assets/images/marker-icon.svg',
      }),
    });
    this.markers.push(marker);
    marker.addTo(this.map);
  }
}
