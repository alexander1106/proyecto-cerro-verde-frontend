import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarAreasHotelComponent } from './registrar-areas-hotel.component';

describe('RegistrarAreasHotelComponent', () => {
  let component: RegistrarAreasHotelComponent;
  let fixture: ComponentFixture<RegistrarAreasHotelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegistrarAreasHotelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarAreasHotelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
