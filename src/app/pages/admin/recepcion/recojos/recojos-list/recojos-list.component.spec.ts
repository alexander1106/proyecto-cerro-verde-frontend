import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecojosListComponent } from './recojos-list.component';

describe('RecojosListComponent', () => {
  let component: RecojosListComponent;
  let fixture: ComponentFixture<RecojosListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RecojosListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecojosListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
