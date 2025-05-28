import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCajasComponent } from './admin-cajas.component';

describe('AdminCajasComponent', () => {
  let component: AdminCajasComponent;
  let fixture: ComponentFixture<AdminCajasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminCajasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminCajasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
