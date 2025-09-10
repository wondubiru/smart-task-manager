import { TestBed } from '@angular/core/testing';

import { TaskTemplatesService } from './task-templates.service';

describe('TaskTemplatesService', () => {
  let service: TaskTemplatesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskTemplatesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
