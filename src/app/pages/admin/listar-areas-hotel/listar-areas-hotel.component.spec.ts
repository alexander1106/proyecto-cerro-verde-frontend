import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarAreasHotelComponent } from './listar-areas-hotel.component';

describe('ListarAreasHotelComponent', () => {
  let component: ListarAreasHotelComponent;
  let fixture: ComponentFixture<ListarAreasHotelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListarAreasHotelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarAreasHotelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
