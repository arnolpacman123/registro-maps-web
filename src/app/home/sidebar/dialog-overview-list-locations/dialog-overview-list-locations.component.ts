import { AfterViewInit, Component, inject, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle
} from "@angular/material/card";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { DialogData } from "../dialog-overview-register-visit/dialog-overview-register-visit.component";
import { MatFormField } from "@angular/material/form-field";
import { MatOption, MatSelect } from "@angular/material/select";
import { AsyncPipe } from "@angular/common";
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { ReplaySubject, Subject, take, takeUntil } from "rxjs";
import { User } from "../../interfaces/user.interface";
import { MatButton } from "@angular/material/button";
import { list } from "postcss";
import { HomeService } from "../../services/home.service";

@Component({
  selector: 'app-dialog-overview-list-locations',
  standalone: true,
  imports: [
    MatCard,
    MatCardHeader,
    MatCardSubtitle,
    MatCardTitle,
    MatCardContent,
    MatFormField,
    MatSelect,
    MatOption,
    AsyncPipe,
    NgxMatSelectSearchModule,
    ReactiveFormsModule,
    MatButton,
    MatCardActions
  ],
  templateUrl: './dialog-overview-list-locations.component.html',
  styleUrl: './dialog-overview-list-locations.component.css'
})
export class DialogOverviewListLocationsComponent implements OnInit, OnDestroy, AfterViewInit {
  constructor(
    public dialogRef: MatDialogRef<DialogOverviewListLocationsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
  }

  protected persons: User[] = this.data.users;

  public userCtrl: FormControl<User | null> = new FormControl<User>(null!);

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


  listLocations() {
    this.homeService.allRegisterVisitsByPersonName(this.userCtrl.value!.name).subscribe({
      next: (data) => {
        this.dialogRef.close(data);
      }
    });
  }

  isValid() {
    return this.userCtrl.value !== null;
  }
}
