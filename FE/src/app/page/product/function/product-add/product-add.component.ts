import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  trigger,
  transition,
  style,
  animate,
  state,
} from '@angular/animations';

@Component({
  selector: 'app-product-add-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './product-add.component.html',
  animations: [
    trigger('modalAnimation', [
      state(
        'void',
        style({
          opacity: 0,
          transform: 'scale(0.95)',
        })
      ),
      state(
        '*',
        style({
          opacity: 1,
          transform: 'scale(1)',
        })
      ),
      transition('void => *', [
        animate('250ms cubic-bezier(0.4, 0.0, 0.2, 1)'),
      ]),
      transition('* => void', [
        animate('200ms cubic-bezier(0.4, 0.0, 0.2, 1)'),
      ]),
    ]),
    trigger('overlayAnimation', [
      state(
        'void',
        style({
          opacity: 0,
        })
      ),
      state(
        '*',
        style({
          opacity: 1,
        })
      ),
      transition('void => *', [
        animate('250ms cubic-bezier(0.4, 0.0, 0.2, 1)'),
      ]),
      transition('* => void', [
        animate('200ms cubic-bezier(0.4, 0.0, 0.2, 1)'),
      ]),
    ]),
  ],
})
export class ProductAddComponent {
  @Output() closeEvent = new EventEmitter<void>();
  modalState = true;

  productForm = new FormGroup({
    productName: new FormControl('', [Validators.required]),
  });

  constructor(private router: Router) {}

  onSubmit(): void {
    if (this.productForm.valid) {
      console.log('Form submitted:', this.productForm.value);
      this.startCloseAnimation();
    }
  }

  importCSV(): void {
    console.log('Import Excel clicked');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.xlsx,.xls,.csv';
    fileInput.onchange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        console.log('Selected file:', file);
      }
    };
    fileInput.click();
  }

  startCloseAnimation(): void {
    this.modalState = false;
    setTimeout(() => {
      this.close();
    }, 200);
  }

  close(): void {
    this.closeEvent.emit();
    this.router.navigate(['/product']);
  }

  closeModal(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.startCloseAnimation();
    }
  }
}
