import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';

export const animationDuration = 200;

export const modalAnimations = [
  trigger('modalBackdrop', [
    transition(':enter', [
      style({ opacity: 0 }),
      animate('200ms ease-out', style({ opacity: 1 })),
    ]),
    transition(':leave', [
      style({ opacity: 1 }),
      animate('150ms ease-in', style({ opacity: 0 })),
    ]),
  ]),
  trigger('modalContainer', [
    transition(':enter', [
      style({ opacity: 0, transform: 'scale(0.95)' }),
      animate('250ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
    ]),
    transition(':leave', [
      style({ opacity: 1, transform: 'scale(1)' }),
      animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' })),
    ]),
  ]),
];
