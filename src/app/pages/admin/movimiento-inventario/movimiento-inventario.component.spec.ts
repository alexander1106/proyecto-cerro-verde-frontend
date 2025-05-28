import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovimientoInventarioComponent } from './movimiento-inventario.component';

describe('MovimientoInventarioComponent', () => {
  let component: MovimientoInventarioComponent;
  let fixture: ComponentFixture<MovimientoInventarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MovimientoInventarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovimientoInventarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
