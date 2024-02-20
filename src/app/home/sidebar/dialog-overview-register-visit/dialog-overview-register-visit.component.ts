import { AfterViewInit, Component, inject, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions, MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatInput } from "@angular/material/input";
import { MatButton } from "@angular/material/button";
import { User } from "../../interfaces/user.interface";
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardImage, MatCardSubtitle,
  MatCardTitle
} from "@angular/material/card";
import { MatIcon } from "@angular/material/icon";
import { MatOption, MatSelect } from "@angular/material/select";
import { AsyncPipe } from "@angular/common";
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import { ReplaySubject, Subject, take, takeUntil } from "rxjs";
import { MapResponse } from "../../interfaces/map-response.interface";
import { RegisterVisitRequest } from "../../interfaces/register-visit-request.interface";
import { HomeService } from "../../services/home.service";
import { NgxSpinnerModule, NgxSpinnerService } from "ngx-spinner";

export interface DialogData {
  users: User[];
  address: string;
  mapData: MapResponse,
  coordinates: [ number, number ];
}

@Component({
  selector: 'app-dialog-overview-register-visit',
  standalone: true,
  imports: [
    MatDialogContent,
    MatDialogTitle,
    MatFormField,
    MatDialogActions,
    FormsModule,
    MatInput,
    MatButton,
    MatLabel,
    MatDialogClose,
    MatCard,
    MatCardHeader,
    MatCardImage,
    MatCardContent,
    MatCardActions,
    MatCardTitle,
    MatCardSubtitle,
    MatIcon,
    MatSelect,
    ReactiveFormsModule,
    AsyncPipe,
    MatOption,
    NgxMatSelectSearchModule,
    NgxSpinnerModule,
  ],
  templateUrl: './dialog-overview-register-visit.component.html',
  styleUrl: './dialog-overview-register-visit.component.css'
})
export class DialogOverviewRegisterVisitComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    public dialogRef: MatDialogRef<DialogOverviewRegisterVisitComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private spinner: NgxSpinnerService,
  ) {
  }

  protected persons: User[] = this.data.users;

  public addressCtrl: FormControl = new FormControl(this.data.mapData.display_name);
  public latCtrl: FormControl = new FormControl(this.data.coordinates[0]);
  public lngCtrl: FormControl = new FormControl(this.data.coordinates[1]);
  public userCtrl: FormControl<User | null> = new FormControl<User>(null!);
  public descriptionCtrl: FormControl = new FormControl<string>('');

  public userFilterCtrl = new FormControl<string>('');

  public filteredUsers: ReplaySubject<User[]> = new ReplaySubject<User[]>(1);
  @ViewChild('singleSelect', { static: true }) singleSelect!: MatSelect;
  protected _onDestroy = new Subject<void>();
  public homeService = inject(HomeService);


  ngOnInit() {
    // load the initial bank list
    this.filteredUsers.next(this.persons.slice());

    // listen for search field value changes
    this.userFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterUsers();
      });
  }

  ngAfterViewInit() {
    this.setInitialValue();
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  /**
   * Sets the initial value after the filteredBanks are loaded initially
   */
  protected setInitialValue() {
    this.filteredUsers
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe({
        next: (_) => {
          this.singleSelect.compareWith = (a: User, b: User) => a && b && a.id === b.id;
        },
      });
  }

  protected filterUsers() {
    if (!this.persons) {
      return;
    }
    let search = this.userFilterCtrl.value;
    if (!search) {
      this.filteredUsers.next(this.persons.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredUsers.next(
      this.persons.filter(user => user.name.toLowerCase().indexOf(search!) > -1)
    );
  }

  onClose(): void {
    this.dialogRef.close();
  }

  async save() {
    const registerVisitRequest: RegisterVisitRequest = {
      address: this.addressCtrl.value,
      personName: this.userCtrl.value!.name,
      coordinates: [ this.latCtrl.value, this.lngCtrl.value ],
      description: this.descriptionCtrl.value || ""
    };
    await this.spinner.show();
    this.homeService.registerVisit(registerVisitRequest).subscribe({
      next: () => {
        this.spinner.hide();
        this.dialogRef.close({
          success: true,
        });
      },
      error: async (error) => {
        await this.spinner.hide();
        console.error(error);
      }
    });
  }

  isValid(): boolean {
    return this.userCtrl.value !== null && this.addressCtrl.value !== null && this.addressCtrl.value !== ""
      && this.latCtrl.value !== null && this.latCtrl.value !== "" && this.lngCtrl.value !== null && this.lngCtrl.value !== "";
  }
}
