import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarLimpiezasComponent } from './registrar-limpiezas.component';

describe('RegistrarLimpiezasComponent', () => {
  let component: RegistrarLimpiezasComponent;
  let fixture: ComponentFixture<RegistrarLimpiezasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegistrarLimpiezasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarLimpiezasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
