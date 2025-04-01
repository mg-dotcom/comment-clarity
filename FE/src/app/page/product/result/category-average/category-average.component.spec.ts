import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryAverageComponent } from './category-average.component';

describe('CategoryAverageComponent', () => {
  let component: CategoryAverageComponent;
  let fixture: ComponentFixture<CategoryAverageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryAverageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoryAverageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
