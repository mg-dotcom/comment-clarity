import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductTopCommentComponent } from './product-top-comment.component';

describe('ProductTopCommentComponent', () => {
  let component: ProductTopCommentComponent;
  let fixture: ComponentFixture<ProductTopCommentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductTopCommentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductTopCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
