import { parseGraboEventPage } from './lib/grabo';
import * as fs from 'fs';

async function run() {
  const url = 'https://grabo.bg/ruse/s-liubov-orlin-pavlov-0b48k8';
  try {
    const response = await fetch(url);
    const html = await response.text();
    const result = parseGraboEventPage(html, url);
    if (result) {
      console.log(JSON.stringify({
        description: result.description,
        first300: result.description.substring(0, 300)
      }));
    } else {
      console.error('Failed to parse event page');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

run();
