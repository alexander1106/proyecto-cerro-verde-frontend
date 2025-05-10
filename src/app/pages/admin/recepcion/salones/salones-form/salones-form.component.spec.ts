import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HabitacionesFormComponent } from './salones-form.component';
import { HabitacionesService } from '../../../../../service/habitaciones.service';
import { TipoHabitacionService } from '../../../../../service/tipo-habitacion.service';
import { SucursalService } from '../../../../../service/sucursal.service';
import { ImagenesService } from '../../../../../service/imagen.service';

describe('HabitacionesFormComponent', () => {
  let component: HabitacionesFormComponent;
  let fixture: ComponentFixture<HabitacionesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HabitacionesFormComponent,
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientTestingModule
      ],
      providers: [
        HabitacionesService,
        TipoHabitacionService,
        SucursalService,
        ImagenesService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HabitacionesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});