import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HabitacionesListComponent } from './salones-list.component';
import { HabitacionesService } from '../../../../../service/habitaciones.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('HabitacionesListComponent', () => {
  let component: HabitacionesListComponent;
  let fixture: ComponentFixture<HabitacionesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HabitacionesListComponent,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [HabitacionesService]
    }).compileComponents();

    fixture = TestBed.createComponent(HabitacionesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});