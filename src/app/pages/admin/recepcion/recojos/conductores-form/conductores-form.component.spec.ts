import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConductoresFormComponent } from './conductores-form.component';

describe('ConductoresFormComponent', () => {
  let component: ConductoresFormComponent;
  let fixture: ComponentFixture<ConductoresFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConductoresFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConductoresFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
