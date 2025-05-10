import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservaHabitacionDetalleComponent } from './reserva-habitacion-detalle.component';

describe('ReservaHabitacionDetalleComponent', () => {
  let component: ReservaHabitacionDetalleComponent;
  let fixture: ComponentFixture<ReservaHabitacionDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReservaHabitacionDetalleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservaHabitacionDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
