import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private productAddModalVisibleSource = new BehaviorSubject<boolean>(false);
  productAddModalVisible$ = this.productAddModalVisibleSource.asObservable();

  constructor() {}

  showProductAddModal() {
    this.productAddModalVisibleSource.next(true);
  }

  hideProductAddModal() {
    this.productAddModalVisibleSource.next(false);
  }
}
