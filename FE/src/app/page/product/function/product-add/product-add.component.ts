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

  months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' },
  ];

  years: number[];

  productForm: FormGroup;

  constructor() {
    // Generate years from current year - 10 to current year + 10
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

    // Initialize form with default values and new form controls
    this.productForm = new FormGroup({
      productName: new FormControl('', [Validators.required]),
      startMonth: new FormControl(new Date().getMonth() + 1, [
        Validators.required,
      ]),
      startYear: new FormControl(currentYear, [Validators.required]),
      endMonth: new FormControl(new Date().getMonth() + 1, [
        Validators.required,
      ]),
      endYear: new FormControl(currentYear, [Validators.required]),
    });
  }

  onSubmit(): void {
    if (this.productForm.valid && !this.isDateRangeInvalid()) {
      console.log('Form submitted:', this.productForm.value);
      this.close();
    }
  }

  isDateRangeInvalid(): boolean {
    const startYear = this.productForm.get('startYear')?.value;
    const startMonth = this.productForm.get('startMonth')?.value;
    const endYear = this.productForm.get('endYear')?.value;
    const endMonth = this.productForm.get('endMonth')?.value;

    // Compare years and months
    if (startYear > endYear) return true;
    if (startYear === endYear && startMonth > endMonth) return true;

    return false;
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
