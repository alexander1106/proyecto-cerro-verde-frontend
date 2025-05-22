import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecojosFormComponent } from './recojos-form.component';

describe('RecojosFormComponent', () => {
  let component: RecojosFormComponent;
  let fixture: ComponentFixture<RecojosFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RecojosFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecojosFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
