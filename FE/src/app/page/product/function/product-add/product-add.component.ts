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
import {
  modalAnimations,
  animationDuration,
} from '../../../../animation/modal-animation';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-add-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './product-add.component.html',
  animations: modalAnimations,
})
export class ProductAddComponent {
  @Output() closeEvent = new EventEmitter<void>();
  modalService = inject(ModalService);
  private router = inject(Router);
  productForm: FormGroup;

  constructor() {
    this.productForm = new FormGroup({
      productName: new FormControl('', [Validators.required]),
      productLink: new FormControl('', [Validators.required]),
      startDate: new FormControl('', [Validators.required]), // YYYY-MM
      endDate: new FormControl('', [Validators.required]), // YYYY-MM
    });
  }

  onSubmit(): void {
    if (this.productForm.valid && !this.isDateRangeInvalid()) {
      console.log('Form submitted:', this.productForm.value);
      this.close();
      this.router.navigate(['/product']);
    }
  }

  // add product 

  isDateRangeInvalid(): boolean {
    const startDate = this.productForm.get('startDate')?.value;
    const endDate = this.productForm.get('endDate')?.value;

    if (!startDate || !endDate) return false;

    return startDate > endDate;
  }

  close() {
    this.modalService.hideProductAddModal();
    setTimeout(() => this.productForm.reset(), animationDuration);
  }
}
