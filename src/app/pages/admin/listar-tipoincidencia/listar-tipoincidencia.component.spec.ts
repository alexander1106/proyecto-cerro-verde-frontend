import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarTipoincidenciaComponent } from './listar-tipoincidencia.component';

describe('ListarTipoincidenciaComponent', () => {
  let component: ListarTipoincidenciaComponent;
  let fixture: ComponentFixture<ListarTipoincidenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListarTipoincidenciaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarTipoincidenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
