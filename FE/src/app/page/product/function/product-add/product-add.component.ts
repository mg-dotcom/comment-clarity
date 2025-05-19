import { Component, EventEmitter, Output, inject, OnInit } from '@angular/core';
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
import { ProductStoreService } from '../../../../store/product-store.service';

@Component({
  selector: 'app-product-add-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './product-add.component.html',
  animations: modalAnimations,
})
export class ProductAddComponent implements OnInit {
  @Output() closeEvent = new EventEmitter<void>();
  modalService = inject(ModalService);
  store = inject(ProductStoreService);
  router = inject(Router);
  productForm: FormGroup;
  isLoading = this.store.loading;
  error = this.store.error;
  formError: string | null = null;
  abortController: AbortController | null = null;

  constructor() {
    this.productForm = new FormGroup({
      productName: new FormControl('', [Validators.required]),
      productLink: new FormControl('', [Validators.required]),
      startDate: new FormControl('', [Validators.required]),
      endDate: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit() {
    this.store.loadProducts();
  }

  async onSubmit(): Promise<void> {
    if (this.productForm.valid && !this.isDateRangeInvalid()) {
      const { productName, productLink, startDate, endDate } =
        this.productForm.value;

      this.formError = null;

      this.abortController = new AbortController();

      try {
        const result = await this.store.addProduct(
          productName,
          productLink,
          startDate,
          endDate,
          this.abortController.signal // ✅ เพิ่ม signal
        );

        if (result.success) {
          this.close();
          this.router.navigate(['/product']);
        } else {
          this.formError = result.error || null;
        }
      } catch (error) {
        console.error('Error adding product:', error);
        this.formError =
          error instanceof Error ? error.message : 'Unknown error occurred';
      }
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
    if (this.abortController) {
      this.abortController.abort(); // ✅ ยกเลิก request ที่กำลังทำ
      this.abortController = null;
    }

    this.modalService.hideProductAddModal();
    setTimeout(() => {
      this.productForm.reset();
      this.formError = null;
    }, animationDuration);
  }
}
