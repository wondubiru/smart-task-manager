import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskTemplatesComponent } from './task-templates.component';

describe('TaskTemplatesComponent', () => {
  let component: TaskTemplatesComponent;
  let fixture: ComponentFixture<TaskTemplatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskTemplatesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
