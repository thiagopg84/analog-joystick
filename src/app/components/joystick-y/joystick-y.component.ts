import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CdkDragMove, DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-joystick-y',
  standalone: true,
  imports: [DragDropModule],
  templateUrl: './joystick-y.component.html',
  styleUrls: ['./joystick-y.component.scss']
})
export class JoystickComponentY implements AfterViewInit {
  @ViewChild('backgroundLimit') backgroundLimit!: ElementRef<HTMLElement>;
  @ViewChild('joystick') joystick!: ElementRef<HTMLElement>;
  centerX: number = 0;
  centerY: number = 0;
  maxDistance: number = 45; // Padrão: 80
  isDragging: boolean = false;
  intervalId: any;
  lastDeltaY: number = 0;
  private lastSentTime: number = 0;
  private throttleDelay: number = 250;

  ngAfterViewInit() {
    this.updateCenterPosition();
  }

  onDragMove(event: CdkDragMove) {
    const { y: dragY } = event.pointerPosition;

    let deltaY = dragY - this.centerY;
    const distance = Math.abs(deltaY);

    if (distance > this.maxDistance) {
      deltaY = deltaY > 0 ? this.maxDistance : -this.maxDistance;
    }

    this.updateJoystickPosition(deltaY);
    this.lastDeltaY = deltaY;
    this.sendPTZData(deltaY);
    this.isDragging = true;
  }

  updateJoystickPosition(deltaY: number) {
    const stickElement = this.joystick.nativeElement;
    const offset = stickElement.offsetHeight / 2;
    stickElement.style.transform = `translate(-50%, ${deltaY - offset}px)`;
  }

  sendPTZData(deltaY: number) {
    const currentTime = Date.now();
    if (currentTime - this.lastSentTime < this.throttleDelay) {
      return;
    }
    this.lastSentTime = currentTime;
    const tilt = (deltaY / this.maxDistance).toFixed(2);
    console.log(`Tilt: ${tilt}`);
  }

  onDragStart() {
    this.intervalId = setInterval(() => {
      this.sendPTZData(this.lastDeltaY);
    }, this.throttleDelay);
  }

  onDragEnd() {
    clearInterval(this.intervalId);
    const stickElement = this.joystick.nativeElement;
    stickElement.classList.add('releasing');
    stickElement.style.transform = `translate(-50%, -50%)`;
    this.isDragging = false;

    setTimeout(() => {
      stickElement.classList.remove('releasing');
    }, 200);
    console.log('Stick solto, resetando posição');
  }

  updateCenterPosition() {
    const rect = this.backgroundLimit.nativeElement.getBoundingClientRect();
    this.centerX = rect.left + rect.width / 2;
    this.centerY = rect.top + rect.height / 2;
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    event.preventDefault();
    const touch = event.touches[0];
    const touchY = touch.clientY;
    this.onDragMove({
      pointerPosition: { y: touchY }
    } as CdkDragMove);
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.onDragStart();
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    this.onDragEnd();
  }

  @HostListener('window:resize')
  onResize() {
    this.updateCenterPosition();
  }
}
