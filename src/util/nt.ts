import { Buffer } from '../buffer';
import { assert } from './type';

/**
 * Compute the GCD (greatest common divisor) of two bigints.
 * @returns gcd(a, b).
 */
export function gcd(a: bigint, b: bigint): bigint {
	return b ? gcd(b, a % b) : a;
}

/**
 * Compute a^n mod m.
 * @returns a^n mod m.
 */
export function PowerMod(a: bigint, n: bigint, m: bigint) {
	let c = 1n;
	for (a %= m; n; n >>= 1n, a = a * a % m) if (n & 1n) c = c * a % m;
	return c % m;
}

/**
 * Get a (nearly uniform) random integer in [0, n).
 * @returns The random number.
 */
export function Zn(n: bigint) {
	return Buffer.random(n.toString(16).length / 2 + 5).asBigInt() % n;
}

/**
 * Check whether value is an integer between low and high.
 * @param value The value to be tested.
 * @param low The lower bound.
 * @param high The upper bound.
 * @returns The test result.
 */
export function checkIntRange(value: unknown, low: number, high: number): value is number {
	return Number.isSafeInteger(value) && low <= value && value <= high;
}

/**
 * Check whether value is an integer between low and high, if it is, return `value`, otherwise return `defaultValue`.
 * @param value The value to be tested.
 * @param low The lower bound.
 * @param high The upper bound.
 * @param defaultValue The default value.
 * @returns `value` or `defaultValue`, depending on `checkIntRange(value, low, high)`.
 */
export function clipInt(value: unknown, low: number, high: number, defaultValue: number) {
	return checkIntRange(value, low, high) ? value : defaultValue;
}

/**
 * Return an object that produces a sequence of integers from start (inclusive) to stop (exclusive) by step, similar to `range` in Python 3.
 * @returns the [i, i+1, i+2, ..., j-1] list
 */
export function range(start: unknown, stop: unknown, step: unknown = 1) {
	assert(Number.isSafeInteger(start) && Number.isSafeInteger(stop) && Number.isSafeInteger(step));
	const length = Math.floor((stop - start + step - Math.sign(step)) / step);
	assert(checkIntRange(length, 0, 0xffffff));
	return Array.from({ length }, (_, idx) => start + step * idx);
}

/**
 * Computing the average (arithmetic mean) of a list of numbers.
 * @param data The list of numbers.
 * @returns The arithmetic mean.
 */
export function average(data: number[]): number {
	return data.reduce((x, y) => x + y) / data.length;
}

/**
 * Performs the CRT (Chinese Remainder Theorem)-based RSA decryption/signature.
 * @param x - The original value.
 * @param p - The first prime factor of the modulus.
 * @param q - The second prime factor of the modulus, **you should ensure that p > q**.
 * @param dp - d mod (p - 1).
 * @param dq - d mod (q - 1).
 * @param qi - q^-1 mod p.
 * @returns The result (x^d mod pq).
 */
export function CRTRSA(x: bigint, p: bigint, q: bigint, dp: bigint, dq: bigint, qi: bigint) {
	const sign_p = PowerMod(x, dp, p), sign_q = PowerMod(x, dq, q);
	return (sign_p - sign_q + p) * qi % p * q + sign_q;
}
