const { parseFacebookEvent } = require('./temp_build/facebook-public');

async function run() {
  const url = 'https://www.facebook.com/events/2767519896751505/';
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'facebookexternalhit/1.1'
      }
    });
    const html = await response.text();
    const result = parseFacebookEvent(html, url);
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(err);
  }
}

run();
