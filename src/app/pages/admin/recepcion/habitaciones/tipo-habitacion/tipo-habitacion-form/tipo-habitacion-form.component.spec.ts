import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoHabitacionFormComponent } from './tipo-habitacion-form.component';

describe('TipoHabitacionFormComponent', () => {
  let component: TipoHabitacionFormComponent;
  let fixture: ComponentFixture<TipoHabitacionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TipoHabitacionFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TipoHabitacionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
