import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportesComprasComponent } from './reportes-compras.component';

describe('ReportesComprasComponent', () => {
  let component: ReportesComprasComponent;
  let fixture: ComponentFixture<ReportesComprasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportesComprasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportesComprasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
