const token = 'fake-token-1234';
const baseUrl = 'https://customix.uazapi.com';

async function test(url, method = 'GET', body = null) {
  console.log(`\nTesting ${method} ${url}...`);
  try {
    const opts = {
      method,
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      }
    };
    if (body) opts.body = JSON.stringify(body);
    const r = await fetch(url, opts);
    console.log(`Response status: ${r.status}`);
    const data = await r.text();
    console.log(`Response body: ${data.slice(0, 1000)}`);
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }
}

async function run() {
  await test(`${baseUrl}/instance/logout`, 'GET');
  await test(`${baseUrl}/instance/logout`, 'DELETE');
  await test(`${baseUrl}/instance/disconnect`, 'DELETE');
}

run();
