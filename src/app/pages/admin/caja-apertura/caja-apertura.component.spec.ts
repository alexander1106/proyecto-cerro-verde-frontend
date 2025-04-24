import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CajaAperturaComponent } from './caja-apertura.component';

describe('CajaAperturaComponent', () => {
  let component: CajaAperturaComponent;
  let fixture: ComponentFixture<CajaAperturaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CajaAperturaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CajaAperturaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
