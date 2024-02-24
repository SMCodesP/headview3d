import { PlayerObject } from "./model.js";

/**
 * An animation which can be played on a {@link PlayerObject}.
 *
 * This is an abstract class. Subclasses of this class would implement
 * particular animations.
 */
export abstract class PlayerAnimation {
	/**
	 * The speed of the animation.
	 *
	 * @defaultValue `1.0`
	 */
	speed: number = 1.0;

	/**
	 * Whether the animation is paused.
	 *
	 * @defaultValue `false`
	 */
	paused: boolean = false;

	/**
	 * The current progress of the animation.
	 */
	progress: number = 0;

	/**
	 * Plays the animation.
	 *
	 * @param player - the player object
	 * @param delta - progress difference since last call
	 */
	protected abstract animate(player: PlayerObject, delta: number): void;

	/**
	 * Plays the animation, and update the progress.
	 *
	 * The elapsed time `deltaTime` will be scaled by {@link speed}.
	 * If {@link paused} is `true`, this method will do nothing.
	 *
	 * @param player - the player object
	 * @param deltaTime - time elapsed since last call
	 */
	update(player: PlayerObject, deltaTime: number): void {
		if (this.paused) {
			return;
		}
		const delta = deltaTime * this.speed;
		this.animate(player, delta);
		this.progress += delta;
	}
}

/**
 * A class that helps you create an animation from a function.
 *
 * @example
 * To create an animation that rotates the player:
 * ```
 * new FunctionAnimation((player, progress) => player.rotation.y = progress)
 * ```
 */
export class FunctionAnimation extends PlayerAnimation {
	fn: (player: PlayerObject, progress: number, delta: number) => void;

	constructor(fn: (player: PlayerObject, progress: number, delta: number) => void) {
		super();
		this.fn = fn;
	}

	protected animate(player: PlayerObject, delta: number): void {
		this.fn(player, this.progress, delta);
	}
}

export class IdleAnimation extends PlayerAnimation {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	protected animate(_player: PlayerObject): void {
		// Multiply by animation's natural speed
	}
}

export class WalkingAnimation extends PlayerAnimation {
	/**
	 * Whether to shake head when walking.
	 *
	 * @defaultValue `true`
	 */
	headBobbing: boolean = true;

	protected animate(player: PlayerObject): void {
		// Multiply by animation's natural speed
		const t = this.progress * 8;

		if (this.headBobbing) {
			// Head shaking with different frequency & amplitude
			player.skin.head.rotation.y = Math.sin(t / 4) * 0.2;
			player.skin.head.rotation.x = Math.sin(t / 5) * 0.1;
		} else {
			player.skin.head.rotation.y = 0;
			player.skin.head.rotation.x = 0;
		}

		// Always add an angle for cape around the x axis
	}
}

export class RunningAnimation extends PlayerAnimation {
	protected animate(player: PlayerObject): void {
		// Multiply by animation's natural speed
		const t = this.progress * 15 + Math.PI * 0.5;
		// Jumping
		player.position.y = Math.cos(t * 2);
		// Dodging when running
		player.position.x = Math.cos(t) * 0.15;
		// Slightly tilting when running
		player.rotation.z = Math.cos(t + Math.PI) * 0.01;

		// Apply higher swing frequency, lower amplitude,
		// and greater basic rotation around x axis,
		// to cape when running.

		// What about head shaking?
		// You shouldn't glance right and left when running dude :P
	}
}

function clamp(num: number, min: number, max: number): number {
	return num <= min ? min : num >= max ? max : num;
}

export class FlyingAnimation extends PlayerAnimation {
	protected animate(player: PlayerObject): void {
		// Body rotation finishes in 0.5s
		// Elytra expansion finishes in 3.3s

		const t = this.progress > 0 ? this.progress * 20 : 0;
		const startProgress = clamp((t * t) / 100, 0, 1);

		player.rotation.x = (startProgress * Math.PI) / 2;
		player.skin.head.rotation.x = startProgress > 0.5 ? Math.PI / 4 - player.rotation.x : 0;
	}
}
