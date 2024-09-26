import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoystickComponentY } from './joystick-y.component';

describe('JoystickComponentY', () => {
  let component: JoystickComponentY;
  let fixture: ComponentFixture<JoystickComponentY>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoystickComponentY]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(JoystickComponentY);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
