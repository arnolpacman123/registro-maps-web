import { Component, inject, ViewChild } from '@angular/core';
import { MapComponent } from '../map/map.component';
import { MatButton } from '@angular/material/button';
import { ContentComponent } from '../content/content.component';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { User } from '../interfaces/user.interface';
import { icon, latLng, LatLng, LocationEvent, marker } from 'leaflet';
import { HomeService } from '../services/home.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogOverviewRegisterVisitComponent } from './dialog-overview-register-visit/dialog-overview-register-visit.component';
import { DialogOverviewErrorComponent } from './dialog-overview-error/dialog-overview-error.component';
import { DialogOverviewListLocationsComponent } from './dialog-overview-list-locations/dialog-overview-list-locations.component';
import { RegisterVisit } from '../interfaces/register-visit.interface';
import { DatePipe } from '@angular/common';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

export interface Option {
  name: string;
  description: string;
  onClick: () => void;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    MapComponent,
    MatSidenavModule,
    MatCardModule,
    MatButton,
    ContentComponent,
    MatIcon,
    DatePipe,
    NgxSpinnerModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  listOptions: Option[] = [
    {
      name: 'Registrar mi ubicación',
      description: 'Registra tu ubicación actual',
      icon: 'add_location',
      onClick: this.addLocation.bind(this),
    },
    {
      name: 'Ver ubicaciones',
      description: 'Ver todas las ubicaciones registradas',
      icon: 'view_list',
      onClick: () => this.viewLocations(),
    },
  ];
  @ViewChild(ContentComponent) content!: ContentComponent;
  @ViewChild(MatDrawer) drawer!: MatDrawer;
  myLocation?: LatLng;
  homeService = inject(HomeService);
  dialog = inject(MatDialog);
  persons: User[] = [];
  registerVisits: RegisterVisit[] = [];
  userOptionSelected = false;

  constructor(private spinner: NgxSpinnerService) {
    this.spinner.show();
    this.homeService.getPersons().then((persons) => {
      this.spinner.hide();
      this.persons = persons;
    });
  }

  onNewLocation(location: LocationEvent) {
    this.myLocation = location.latlng;
  }

  onLocateDeactivate() {
    this.myLocation = undefined!;
  }

  async addLocation() {
    const myLocation = this.myLocation;
    if (myLocation) {
      await this.openDialogRegisterVisit();
    } else {
      await this.openDialogError();
    }
  }

  async openDialogRegisterVisit() {
    await this.spinner.show();
    const mapData = await this.homeService.getMapData(
      this.myLocation?.lat!,
      this.myLocation?.lng!
    );
    await this.spinner.hide();
    const dialogRef = this.dialog.open(DialogOverviewRegisterVisitComponent, {
      data: {
        users: this.persons,
        mapData,
        coordinates: [this.myLocation?.lat!, this.myLocation?.lng!],
      },
    });

    dialogRef.afterClosed().subscribe({
      next: (result) => {
        console.log('The dialog was closed', result);
      },
    });
  }

  viewLocations() {
    const dialogRef = this.dialog.open(DialogOverviewListLocationsComponent, {
      data: {
        users: this.persons,
      },
    });
    dialogRef.afterClosed().subscribe({
      next: (result: RegisterVisit[] | undefined) => {
        if (!result) return;
        this.userOptionSelected = true;
        this.registerVisits = result;
        this.content.map.markers = result.map((registerVisit) => {
          return marker(
            latLng(
              registerVisit.geom.coordinates[1],
              registerVisit.geom.coordinates[0]
            ),
            {
              icon: icon({
                iconSize: [25, 34],
                iconUrl: 'assets/images/marker-icon.svg',
              }),
            }
          ).bindPopup(`
            <p><span class="font-bold">Coordenadas:</span> ${
              registerVisit.geom.coordinates[1]
            }, ${registerVisit.geom.coordinates[0]}</p>
            <p class="line-clamp-3"><b>Dirección:</b> ${
              registerVisit.address
            }</p>
            <p>
              <span class="font-bold">Fecha y Hora:</span>
              ${new DatePipe('en-US').transform(
                registerVisit.hour,
                'dd/MM/yyyy HH:mm:ss',
                'GMT-4'
              )}
            </p>
            <p><span class="font-bold">Descripción:</span> ${
              registerVisit.description
            }</p>
          `);
        });
        this.content.map.map.setView([-17.7834, -63.1821], 12);
      },
    });
  }

  async openDialogError() {
    const dialogRef = this.dialog.open(DialogOverviewErrorComponent);

    dialogRef.afterClosed().subscribe((_) => {});
  }

  selectLocation(registerVisit: RegisterVisit) {
    this.content.map.map.setView(
      [registerVisit.geom.coordinates[1], registerVisit.geom.coordinates[0]],
      18
    );
    const marker = this.content.map.markers.find((marker) => {
      const coordinates = marker.getLatLng();
      return (
        coordinates.lat === registerVisit.geom.coordinates[1] &&
        coordinates.lng === registerVisit.geom.coordinates[0]
      );
    });
    if (marker) marker.openPopup();
    this.drawer.close();
  }
}
