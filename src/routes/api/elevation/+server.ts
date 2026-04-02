import type { RequestHandler } from '@sveltejs/kit';

const SWISSTOPO_URL = 'https://api3.geo.admin.ch/rest/services/profile.json';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.text();

	const response = await fetch(SWISSTOPO_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body
	});

	const data = await response.arrayBuffer();

	return new Response(data, {
		status: response.status,
		headers: {
			'Content-Type': response.headers.get('Content-Type') ?? 'application/json'
		}
	});
};
