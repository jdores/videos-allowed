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

    // Get the cf_user_email from the query string
    const url = new URL(request.url);
    const cfUserEmail = url.searchParams.get("cf_user_email");
    const rawUser = cfUserEmail ? cfUserEmail.split('@')[0] : 'there'; // Extract user before @
    const user = rawUser.charAt(0).toUpperCase() + rawUser.slice(1); // Capitalize the first letter

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

    // STEP 02 - Generate HTML
      const html = `
    <!DOCTYPE html>
    <html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Blocked by Cloudflare Gateway</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @import url("https://fonts.googleapis.com/css?family=Roboto&display=swap");

          body {
            margin: 0;
            padding: 0;
            background: #f9f9f9;
            font-family: "Roboto", "sans-serif";
            color: #1e1e1e;
          }

          a:link {
            color: inherit;
            background-color: transparent;
            text-decoration: underline;
          }

          a:hover {
            text-decoration: underline;
          }

          #container {
            min-height: 100vh;
            display: grid;
            justify-items: center;
            align-items: stretch;
            grid-template-columns: 1fr;
            grid-template-rows: max-content auto max-content;
            box-sizing: border-box;
            padding: 0 20px;
          }

          header {
            text-align: center;
            margin-top: 10vh;
          }

          main {
            width: 80%; /* Added this line */
            margin: 0 auto; /* Added this line */
            text-align: center; /* Added this line */
          }

          .org-name {
            margin: 20px 0 0 0;
            font-style: normal;
            font-weight: bold;
            font-size: 22px;
          }

          .title {
            margin: 48px 0 0 0;
            font-style: normal;
            font-weight: bold;
            font-size: 46px;
            line-height: 54px;
            text-align: center;
          }

          .site {
            margin: 24px 0 0 0;
            font-style: normal;
            font-weight: bold;
            font-size: 18px;
            line-height: 21px;
          }

          .subtitle {
            max-width: 600px;
            margin: 10px 0 0 0;
            display: flex; /* Enable Flexbox for subtitle */
            flex-direction: column; /* Stack items vertically */
            align-items: center; /* Center items horizontally */
            text-align: center; /* For fallback if flexbox doesn't fully center text within items */
            font-style: normal;
            font-weight: bold;
            font-size: 18px;
            line-height: 21px;
            flex-grow: 1;
          }

          .mt-6 {
            margin: 24px 0 0 0;
          }

          .mt-3 {
            margin: 12px 0 0 0;
          }

          .block-reason {
            font-size: 16px;
          }

          .mailto-address {
            font-size: 16px;
          }

          .radar {
            font-size: 16px;
          }

          footer {
            font-style: normal;
            font-size: 14px;
            line-height: 16px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            opacity: 0.8;
            padding: 20px 0;
          }

          details {
            margin-top: 20px;
            text-align: left;
          }

          table {
            width: 80%;
            margin: 20px auto;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }

          .footer-text {
            text-align: center; /* Keeping this for the text within the div */
          }
        </style>
      </head><body>
        <div id="container">
          <header>
            <img src="https://pub-468cf04c27cf401e8a928bd7ea22e060.r2.dev/block-symbol.png" width="146" height="146" aria-hidden="true">
            <div class="org-name">jdores.xyz</div>
            <h1 class="title">Hi ${user}</h1>
          </header>
          <main>

            <h2>Youtube access is restricted. Only these videos are allowed</h2>
            ${data.result && data.result.length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Date Added</th>
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
            ` : `<p>No allowed videos found.</p>`}

            <details>
              <summary>Debug Information</summary>
              <p>Request URL: ${request.url}</p>
              ${[...url.searchParams.entries()].map(([key, value]) => `<p>${key}: ${value}</p>`).join('')}
            </details>
          </main>
          <footer>
            <div>Webpage generated using Cloudflare Workers</div>
          </footer>
        </div>

    </body></html>
    `;

    // STEP 03 - Output response
    if (response.ok) {
//        return new Response(`${JSON.stringify(videos)}`, {
//            headers: { 'Content-Type': 'application/json' }
//        });
        return new Response(html, {
            headers: { "content-type": "text/html;charset=UTF-8" },
        });
    }
     else {
              console.error(`Error fetching list: ${JSON.stringify(videos)}`);
    }
}