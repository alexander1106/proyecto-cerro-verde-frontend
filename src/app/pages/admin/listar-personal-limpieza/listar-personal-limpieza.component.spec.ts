import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarPersonalLimpiezaComponent } from './listar-personal-limpieza.component';

describe('ListarPersonalLimpiezaComponent', () => {
  let component: ListarPersonalLimpiezaComponent;
  let fixture: ComponentFixture<ListarPersonalLimpiezaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListarPersonalLimpiezaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarPersonalLimpiezaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
