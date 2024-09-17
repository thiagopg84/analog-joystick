import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CdkDragMove, DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-joystick',
  standalone: true,
  imports: [DragDropModule],
  templateUrl: './joystick.component.html',
  styleUrls: ['./joystick.component.scss']
})
export class JoystickComponent implements AfterViewInit {
  @ViewChild('backgroundLimit') backgroundLimit!: ElementRef<HTMLElement>;
  @ViewChild('joystick') joystick!: ElementRef<HTMLElement>;
  centerX: number = 0;
  centerY: number = 0;
  maxDistance: number = 45; // Padrão: 80
  isDragging: boolean = false;
  intervalId: any;
  lastDeltaX: number = 0;
  lastDeltaY: number = 0;
  private lastSentTime: number = 0;
  private throttleDelay: number = 250;

  ngAfterViewInit() {
    const rect = this.backgroundLimit.nativeElement.getBoundingClientRect();
    this.centerX = rect.left + rect.width / 2;
    this.centerY = rect.top + rect.height / 2;
  }

  onDragMove(event: CdkDragMove) {
    const { x: dragX, y: dragY } = event.pointerPosition;
    let deltaX = dragX - this.centerX;
    let deltaY = dragY - this.centerY;
    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

    if (distance > this.maxDistance) {
      const angle = Math.atan2(deltaY, deltaX);
      deltaX = Math.cos(angle) * this.maxDistance;
      deltaY = Math.sin(angle) * this.maxDistance;
    }

    this.updateJoystickPosition(deltaX, deltaY);
    this.lastDeltaX = deltaX;
    this.lastDeltaY = deltaY;
    this.sendPTZData(deltaX, deltaY);
    this.isDragging = true;
  }

  updateJoystickPosition(deltaX: number, deltaY: number) {
    const stickElement = this.joystick.nativeElement;
    const offset = stickElement.offsetWidth / 2;
    stickElement.style.transform = `translate(${deltaX - offset}px, ${deltaY - offset}px)`;
  }

  sendPTZData(deltaX: number, deltaY: number) {
    const currentTime = Date.now();
    if (currentTime - this.lastSentTime < this.throttleDelay) {
      return;
    }
    this.lastSentTime = currentTime;
    const pan = (deltaX / this.maxDistance).toFixed(2);
    const tilt = (deltaY / this.maxDistance).toFixed(2);
    console.log(`Pan: ${pan}, Tilt: ${tilt}`);
  }

  onDragStart() {
    this.intervalId = setInterval(() => {
      this.sendPTZData(this.lastDeltaX, this.lastDeltaY);
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

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    event.preventDefault();
    const touch = event.touches[0];
    const touchX = touch.clientX;
    const touchY = touch.clientY;
    this.onDragMove({
      pointerPosition: { x: touchX, y: touchY }
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
}
