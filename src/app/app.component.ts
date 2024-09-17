import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { JoystickComponent } from './components/joystick/joystick.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, JoystickComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'poc-analog-stick';
}
