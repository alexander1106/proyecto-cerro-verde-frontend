import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TipoHabitacionListComponent } from './tipo-habitacion-list.component';
import { TipoHabitacionService } from '../../../../../../service/tipo-habitacion.service';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

describe('TipoHabitacionListComponent', () => {
  let component: TipoHabitacionListComponent;
  let fixture: ComponentFixture<TipoHabitacionListComponent>;
  let mockTipoService: jasmine.SpyObj<TipoHabitacionService>;

  beforeEach(async () => {
    mockTipoService = jasmine.createSpyObj('TipoHabitacionService', ['getTiposHabitacion', 'deleteTipoHabitacion']);

    await TestBed.configureTestingModule({
      imports: [TipoHabitacionListComponent, RouterTestingModule],
      providers: [
        { provide: TipoHabitacionService, useValue: mockTipoService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TipoHabitacionListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load tipos on init', () => {
    const mockTipos = [
      { id_tipo_habitacion: 1, nombre: 'Standard', precio_publico: 100, precio_corporativo: 80, estado: 1 },
      { id_tipo_habitacion: 2, nombre: 'Deluxe', precio_publico: 150, precio_corporativo: 120, estado: 1 }
    ];
    mockTipoService.getTiposHabitacion.and.returnValue(of(mockTipos));

    fixture.detectChanges();

    expect(component.loading).toBeFalse();
    expect(component.tipos).toEqual(mockTipos);
    expect(mockTipoService.getTiposHabitacion).toHaveBeenCalled();
  });

  it('should handle error when loading tipos', () => {
    mockTipoService.getTiposHabitacion.and.returnValue(throwError(() => new Error('Error')));

    fixture.detectChanges();

    expect(component.loading).toBeFalse();
    expect(component.error).toBe('Error al cargar los tipos de habitación. Intente nuevamente.');
  });

  it('should delete tipo when confirmed', () => {
    const mockTipos = [
      { id_tipo_habitacion: 1, nombre: 'Standard', precio_publico: 100, precio_corporativo: 80, estado: 1 },
      { id_tipo_habitacion: 2, nombre: 'Deluxe', precio_publico: 150, precio_corporativo: 120, estado: 1 }
    ];
    component.tipos = [...mockTipos];
    mockTipoService.deleteTipoHabitacion.and.returnValue(of({}));
    spyOn(window, 'confirm').and.returnValue(true);

    component.eliminarTipo(1);

    expect(mockTipoService.deleteTipoHabitacion).toHaveBeenCalledWith(1);
    expect(component.tipos.length).toBe(1);
    expect(component.tipos[0].id_tipo_habitacion).toBe(2);
  });

  it('should not delete tipo when not confirmed', () => {
    const mockTipos = [
      { id_tipo_habitacion: 1, nombre: 'Standard', precio_publico: 100, precio_corporativo: 80, estado: 1 }
    ];
    component.tipos = [...mockTipos];
    spyOn(window, 'confirm').and.returnValue(false);

    component.eliminarTipo(1);

    expect(mockTipoService.deleteTipoHabitacion).not.toHaveBeenCalled();
    expect(component.tipos.length).toBe(1);
  });

  it('should handle error when deleting tipo', () => {
    const mockTipos = [
      { id_tipo_habitacion: 1, nombre: 'Standard', precio_publico: 100, precio_corporativo: 80, estado: 1 }
    ];
    component.tipos = [...mockTipos];
    mockTipoService.deleteTipoHabitacion.and.returnValue(throwError(() => new Error('Error')));
    spyOn(window, 'confirm').and.returnValue(true);

    component.eliminarTipo(1);

    expect(mockTipoService.deleteTipoHabitacion).toHaveBeenCalledWith(1);
    expect(component.error).toBe('Error al eliminar el tipo de habitación. Intente nuevamente.');
  });
});