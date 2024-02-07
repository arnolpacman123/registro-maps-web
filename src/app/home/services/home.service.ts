import { inject, Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { User } from "../interfaces/user.interface";
import { MapResponse } from "../interfaces/map-response.interface";
import { RegisterVisitRequest } from "../interfaces/register-visit-request.interface";
import { RegisterVisit } from "../interfaces/register-visit.interface";

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  apiUrl = 'https://registro-maps-api.adaptable.app/api';
  mapDataOSMUrl = 'https://nominatim.openstreetmap.org/reverse?format=json';
  httpClient = inject(HttpClient);

  constructor() {
  }

  async getPersons() {
    return firstValueFrom(this.httpClient.get<User[]>(`${ this.apiUrl }/register-person`));
  }

  registerVisit(registerVisitRequest: RegisterVisitRequest) {
    return this.httpClient.post<Object>(`${ this.apiUrl }/register-visit`, registerVisitRequest);
  }

  allRegisterVisitsByPersonName(name: string) {
    return this.httpClient.get<RegisterVisit[]>(`${ this.apiUrl }/register-visit/${ name }`);
  }

  async getMapData(lat: number, lon: number) {
    return firstValueFrom(this.httpClient.get<MapResponse>(`${ this.mapDataOSMUrl }&lat=${ lat }&lon=${ lon }`));
  }
}
