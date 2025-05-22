import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConductoresListComponent } from './conductores-list.component';

describe('ConductoresListComponent', () => {
  let component: ConductoresListComponent;
  let fixture: ComponentFixture<ConductoresListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConductoresListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConductoresListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
