import { Component } from '@angular/core';
import { MatCard, MatCardActions, MatCardContent } from "@angular/material/card";
import { MatButton } from "@angular/material/button";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: 'app-dialog-overview-error',
  standalone: true,
  imports: [
    MatCard,
    MatCardContent,
    MatCardActions,
    MatButton
  ],
  templateUrl: './dialog-overview-error.component.html',
  styleUrl: './dialog-overview-error.component.css'
})
export class DialogOverviewErrorComponent {

  constructor(
    public dialogRef: MatDialogRef<DialogOverviewErrorComponent>
  ) {
    setTimeout(() => {
      this.dialogRef.close();
    }, 2500);
  }

  close() {
    this.dialogRef.close();
  }
}
