import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarTipoincidenciaComponent } from './registrar-tipoincidencia.component';

describe('RegistrarTipoincidenciaComponent', () => {
  let component: RegistrarTipoincidenciaComponent;
  let fixture: ComponentFixture<RegistrarTipoincidenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegistrarTipoincidenciaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarTipoincidenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
