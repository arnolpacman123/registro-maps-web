import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatButton } from "@angular/material/button";
import { MatDrawer } from "@angular/material/sidenav";
import { MapComponent } from "../map/map.component";
import { LocationEvent } from "leaflet";

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [
    MatButton,
    MapComponent
  ],
  templateUrl: './content.component.html',
  styleUrl: './content.component.css'
})
export class ContentComponent {
  @Input() drawer!: MatDrawer;
  @ViewChild("map") map!: MapComponent;
  @Output() onNewLocation = new EventEmitter<LocationEvent>();
  @Output() onLocateDeactivate = new EventEmitter<void>();

  _onNewLocation(e: LocationEvent) {
    this.onNewLocation.emit(e);
  }

  _onLocateDeactivate() {
    this.onLocateDeactivate.emit();
  }
}
