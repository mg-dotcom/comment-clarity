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
  formError: string | null = null; // เพิ่มตัวแปรสำหรับแสดงข้อผิดพลาดเฉพาะใน form

  constructor() {
    this.productForm = new FormGroup({
      productName: new FormControl('', [Validators.required]),
      productLink: new FormControl('', [Validators.required]),
      startDate: new FormControl('', [Validators.required]), // YYYY-MM
      endDate: new FormControl('', [Validators.required]), // YYYY-MM
    });
  }

  ngOnInit() {
    this.store.loadProducts();
  }

  async onSubmit(): Promise<void> {
    if (this.productForm.valid && !this.isDateRangeInvalid()) {
      const { productName, productLink, startDate, endDate } =
        this.productForm.value;

      // ตรวจสอบชื่อสินค้าซ้ำก่อนที่จะส่งไปยัง store
      const isDuplicate = this.store.checkDuplicateProductName(productName);
      if (isDuplicate) {
        this.formError = 'Product name already exists. Please use a different name.';
        return; // ไม่ทำงานต่อ แค่แสดงข้อความเตือนบน modal
      }

      this.formError = null; // ล้างข้อความเตือนเมื่อไม่มีข้อผิดพลาด

      try {
        const success = await this.store.addProduct(
          productName,
          productLink,
          startDate,
          endDate
        );

        if (success) {
          this.close();
          this.router.navigate(['/product']);
        } else if (this.store.error()) {
          // ถ้า store.error มีค่า (เช่น กรณีชื่อซ้ำ) ให้แสดงบน modal
          this.formError = this.store.error();
        }
      } catch (error) {
        console.error('Error adding product:', error);
        this.formError = error instanceof Error ? error.message : 'Unknown error occurred';
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
    this.modalService.hideProductAddModal();
    setTimeout(() => {
      this.productForm.reset();
      this.formError = null; // ล้างข้อความเตือนเมื่อปิด modal
    }, animationDuration);
  }
}