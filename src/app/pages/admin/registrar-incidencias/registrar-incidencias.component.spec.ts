import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarIncidenciasComponent } from './registrar-incidencias.component';

describe('RegistrarIncidenciasComponent', () => {
  let component: RegistrarIncidenciasComponent;
  let fixture: ComponentFixture<RegistrarIncidenciasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegistrarIncidenciasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarIncidenciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
