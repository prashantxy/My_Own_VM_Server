/*
 * A small spring driven by requestAnimationFrame, parameterised the way Apple's design talks describe:
 *   dampingRatio  1 = no overshoot, < 1 = bounce
 *   response      roughly how long it takes to get there, in seconds
 * It always animates from its live value and keeps its velocity when the target changes, so any
 * motion can be grabbed, interrupted or reversed without a jump.
 */
export interface SpringConfig {
  dampingRatio: number;
  response: number;
}

export class Spring {
  value: number;
  velocity = 0;
  target: number;
  private frame = 0;
  private last = 0;
  private onRest?: () => void;

  constructor(
    initial: number,
    private config: SpringConfig,
    private onUpdate: (value: number) => void,
  ) {
    this.value = initial;
    this.target = initial;
  }

  // Jump straight to a value (1:1 tracking during a drag). Stops any running animation.
  set(value: number) {
    this.stop();
    this.value = value;
    this.target = value;
    this.velocity = 0;
    this.onUpdate(value);
  }

  // Animate to a target, optionally handing off a gesture's velocity (units per second).
  to(target: number, opts: { velocity?: number; config?: SpringConfig; onRest?: () => void } = {}) {
    this.target = target;
    if (opts.velocity !== undefined) this.velocity = opts.velocity;
    if (opts.config) this.config = opts.config;
    this.onRest = opts.onRest;
    if (!this.frame) {
      this.last = performance.now();
      this.frame = requestAnimationFrame(this.tick);
    }
  }

  stop() {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  private tick = (now: number) => {
    // Clamp long frames (background tab) and integrate in small fixed steps for stability.
    const elapsed = Math.min((now - this.last) / 1000, 0.064);
    this.last = now;
    const { dampingRatio, response } = this.config;
    const stiffness = (2 * Math.PI / response) ** 2;
    const damping = (4 * Math.PI * dampingRatio) / response;
    const steps = Math.max(1, Math.ceil(elapsed / 0.004));
    const dt = elapsed / steps;
    for (let i = 0; i < steps; i++) {
      const accel = stiffness * (this.target - this.value) - damping * this.velocity;
      this.velocity += accel * dt;
      this.value += this.velocity * dt;
    }

    if (Math.abs(this.target - this.value) < 0.1 && Math.abs(this.velocity) < 1) {
      this.value = this.target;
      this.velocity = 0;
      this.frame = 0;
      this.onUpdate(this.value);
      const done = this.onRest;
      this.onRest = undefined;
      done?.();
      return;
    }
    this.onUpdate(this.value);
    this.frame = requestAnimationFrame(this.tick);
  };
}

// Where a flick would come to rest, using the same exponential deceleration as scrolling.
export function project(velocity: number, decelerationRate = 0.998) {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

// Progressive resistance past a boundary: the further you pull, the less it follows.
export function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}
