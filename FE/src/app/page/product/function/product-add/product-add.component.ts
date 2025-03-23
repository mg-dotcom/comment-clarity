import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { ModalService } from '../../../../service/modal.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-product-add-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './product-add.component.html',
  animations: [
    trigger('modalBackdrop', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('150ms ease-in', style({ opacity: 0 })),
      ]),
    ]),
    trigger('modalContainer', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('250ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        style({ opacity: 1, transform: 'scale(1)' }),
        animate(
          '200ms ease-in',
          style({ opacity: 0, transform: 'scale(0.95)' })
        ),
      ]),
    ]),
  ],
})
export class ProductAddComponent {
  @Output() closeEvent = new EventEmitter<void>();
  modalService = inject(ModalService);

  productForm = new FormGroup({
    productName: new FormControl('', [Validators.required]),
  });

  constructor() {}

  onSubmit(): void {
    if (this.productForm.valid) {
      console.log('Form submitted:', this.productForm.value);
      this.close();
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

  close() {
    this.modalService.hideProductAddModal();
  }

  closeModal(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }
}
