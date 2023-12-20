/**
 * Wrapped `fetch` method with JSON response.
 * @param url This defines the resource that you wish to fetch.
 * @param options An object containing any custom settings that you want to apply to the request.
 * @returns A `Promise` that resolves to a `Response` JSON.
 */
export async function request(url: URL | RequestInfo, options?: RequestInit) {
	const response = await fetch(url, options);
	if (response.ok) return await response.json();
	throw new Error(
		`Request failed (status: ${response.status}${response.statusText ? ' ' + response.statusText : ''})`,
		{ cause: await response.json().then(x => x, () => response) },
	);
}

/**
 * 'POST' a message to backend.
 * @param url The url.
 * @param data The data to send.
 * @returns Result.
 */
export function POST(url: URL | RequestInfo, data: object) {
	return request(url, {
		method: 'POST',
		headers: { 'content-type': 'application/json; charset=utf-8' },
		body: JSON.stringify(data)
	});
}
