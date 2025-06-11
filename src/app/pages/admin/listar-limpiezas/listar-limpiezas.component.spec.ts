import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarLimpiezasComponent } from './listar-limpiezas.component';

describe('ListarLimpiezasComponent', () => {
  let component: ListarLimpiezasComponent;
  let fixture: ComponentFixture<ListarLimpiezasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListarLimpiezasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarLimpiezasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
