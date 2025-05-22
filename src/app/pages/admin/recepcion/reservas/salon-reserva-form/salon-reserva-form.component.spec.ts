import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HabitacionReservasFormComponent } from './habitacion-reserva-form.component';

describe('HabitacionReservasFormComponent', () => {
  let component: HabitacionReservasFormComponent;
  let fixture: ComponentFixture<HabitacionReservasFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HabitacionReservasFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HabitacionReservasFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
