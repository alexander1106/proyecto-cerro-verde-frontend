import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransaccionesHistorialComponent } from './transacciones-historial.component';

describe('TransaccionesHistorialComponent', () => {
  let component: TransaccionesHistorialComponent;
  let fixture: ComponentFixture<TransaccionesHistorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransaccionesHistorialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransaccionesHistorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
