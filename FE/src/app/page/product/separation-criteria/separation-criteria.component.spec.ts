import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeparationCriteriaComponent } from './separation-criteria.component';

describe('SeparationCriteriaComponent', () => {
  let component: SeparationCriteriaComponent;
  let fixture: ComponentFixture<SeparationCriteriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeparationCriteriaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeparationCriteriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
