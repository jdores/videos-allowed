/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env, ctx) {
        return await handleRequest(request, env);
	},
};

async function handleRequest(request, env) {

	// Inputs for Cloudflare API calls. Stored locally in .dev.var and in the edge in Workers secrets
	const accountId = env.ACCOUNT_ID;
	const userEmail = env.USER_EMAIL;
	const apiKey = env.API_KEY;
	const listId = env.LIST_ID;
  
	// STEP 01 - Get list
	const listUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/gateway/lists/${listId}/items`;
	const response = await fetch(listUrl, {
		 method: 'GET',
		 headers: {
		  'X-Auth-Email': userEmail,
		  'X-Auth-Key': apiKey,
		  'Content-Type': 'application/json'
		 }
	   });
	const data = await response.json();
	console.log(data)

	//const videos = data.result

	// STEP 02 - Generate HTML
	  const html = `
	  <!DOCTYPE html>
	  <html lang="en">
	  <head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Youtube videos allowed</title>
		<style>
		  body { font-family: Arial, sans-serif; margin: 40px; }
		  h1 { color: #333; }
		  table { width: 100%; border-collapse: collapse; }
		  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
		  th { background-color: #f2f2f2; }
		</style>
	  </head>
	  <body>
		<h1>Youtube videos allowed for viewing</h1>
		<table>
		  <thead>
			<tr>
			  <th>Youtube video</th>
			  <th>Date added</th>
			</tr>
		  </thead>
		  <tbody>
			${data.result.map(item => `
			  <tr>
				<td><a href="${item.value}">${item.description}</a></td>
				<td>${item.created_at}</td>
			  </tr>
			`).join('')}
		  </tbody>
		</table>
	  </body>
	  </html>
	`;
  
	// STEP 03 - Output response
	if (response.ok) {
//		  return new Response(`${JSON.stringify(videos)}`, {
//			  headers: { 'Content-Type': 'application/json' }
//		  });
		return new Response(html, {
    		headers: { "content-type": "text/html;charset=UTF-8" },
		});
	}
	 else {
			  console.error(`Error fetching list: ${JSON.stringify(videos)}`);
	}
}