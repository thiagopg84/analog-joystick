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
    this.logNormalizedValues(deltaX, deltaY);
    this.isDragging = true;
  }

  updateJoystickPosition(deltaX: number, deltaY: number) {
    const stickElement = this.joystick.nativeElement;
    const stickRect = stickElement.getBoundingClientRect();
    const halfStickWidth = stickRect.width / 2;
    const halfStickHeight = stickRect.height / 2;

    stickElement.style.transform = `translate(${deltaX - halfStickWidth}px, ${deltaY - halfStickHeight}px)`;
  }

  logNormalizedValues(deltaX: number, deltaY: number) {
    const normalizedX = (deltaX / this.maxDistance).toFixed(2);
    const normalizedY = (deltaY / this.maxDistance).toFixed(2);
    console.log(`Eixo X: ${normalizedX}, Eixo Y: ${normalizedY}`);
  }

  onDragEnd() {
    const stickElement = this.joystick.nativeElement;
    stickElement.classList.add('releasing');
    stickElement.style.transform = `translate(-50%, -50%)`;

    setTimeout(() => {
      stickElement.classList.remove('releasing');
      this.isDragging = false;
    }, 200);
    console.log('Stick solto, resetando posição');
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    event.preventDefault();
    const touch = event.touches[0];
    this.onDragMove({
      pointerPosition: { x: touch.clientX, y: touch.clientY }
    } as CdkDragMove);
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    this.onDragEnd();
  }
}
