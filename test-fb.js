import { parsePublicFacebookEventPage } from './lib/facebook-public.ts';

async function run() {
  const url = 'https://www.facebook.com/events/2767519896751505/';
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'facebookexternalhit/1.1'
      }
    });
    const html = await response.text();
    const result = parsePublicFacebookEventPage(html, url);
    if (result) {
        const { title, description, startDate, startTime, town, organizers, coverImageUrl, tagSuggestions } = result;
        console.log(JSON.stringify({ title, description, startDate, startTime, town, organizers, coverImageUrl, tagSuggestions }, null, 2));
    } else {
        console.log("No result");
    }
  } catch (err) {
    console.error(err);
  }
}

run();
