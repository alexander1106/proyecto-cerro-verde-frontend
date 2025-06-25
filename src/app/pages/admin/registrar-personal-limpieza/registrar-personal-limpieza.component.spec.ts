import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarPersonalLimpiezaComponent } from './registrar-personal-limpieza.component';

describe('RegistrarPersonalLimpiezaComponent', () => {
  let component: RegistrarPersonalLimpiezaComponent;
  let fixture: ComponentFixture<RegistrarPersonalLimpiezaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegistrarPersonalLimpiezaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarPersonalLimpiezaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
