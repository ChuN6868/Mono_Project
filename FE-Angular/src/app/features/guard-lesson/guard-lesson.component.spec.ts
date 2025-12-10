import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuardLessonComponent } from './guard-lesson.component';

describe('GuardLessonComponent', () => {
  let component: GuardLessonComponent;
  let fixture: ComponentFixture<GuardLessonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuardLessonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuardLessonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
