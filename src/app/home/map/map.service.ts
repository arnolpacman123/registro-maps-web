import { inject, Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { ParamsRegisterVisit } from "../sidebar/sidebar.component";
import { MapResponse } from "../interfaces/map-response.interface";
import { User } from "../interfaces/user.interface";

@Injectable({
  providedIn: 'root'
})
export class MapService {
  mapDataOSMUrl = 'https://nominatim.openstreetmap.org/reverse?format=json';
  apiURL = 'http://localhost:3000';

  httpClient = inject(HttpClient);

  getMapData(lat: number, lon: number) {
    return firstValueFrom(this.httpClient.get<MapResponse>(`${ this.mapDataOSMUrl }&lat=${ lat }&lon=${ lon }`));
  }

  registerUser(user: User) {
    return firstValueFrom(this.httpClient.post<User[]>(`${ this.apiURL }/users`, user));
  }

  async getUsers() {
    return firstValueFrom(this.httpClient.get<User[]>(`${ this.apiURL }/users`));
  }

  async registerVisit(params: ParamsRegisterVisit) {
    return firstValueFrom(this.httpClient.post(`${ this.apiURL }/visits`, params));
  }
}
