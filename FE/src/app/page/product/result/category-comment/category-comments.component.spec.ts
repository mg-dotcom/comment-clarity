import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryCommentsComponent } from './category-comments.component';

describe('CategoryCommentComponent', () => {
  let component: CategoryCommentsComponent;
  let fixture: ComponentFixture<CategoryCommentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryCommentsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
