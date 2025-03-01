const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Store all POST responses for the specified URL
  const requests = [];

  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('https://wabi-south-africa-north-a-primary-api.analysis.windows.net/public/reports/querydata?synchronous=true')) {
      // Make sure the response body is parsed as text
      try {
        const responseBody = await response.text(); // Use text() instead of json() for larger content
        requests.push({
          url: url,
          status: response.status(),
          size: response.headers()['content-length'],
          body: responseBody,
        });
      } catch (err) {
        console.log('Error loading response body:', err);
      }
    }
  });

  // Open the page and wait for 60 seconds to allow at least 6 requests
  await page.goto('https://www.eskom.co.za/dataportal/supply-side/station-build-up-for-yesterday/');
  await new Promise(resolve => setTimeout(resolve, 60000)); // Wait for 60 seconds

  // Check if we have at least 3 POST requests
  if (requests.length >= 3) {
    // Find the request with the largest response body based on content-length
    const largestRequest = requests.reduce((max, req) => {
      if (parseInt(req.size) > parseInt(max.size)) {
        return req;
      }
      return max;
    }, { size: 0 });

    if (largestRequest.body) {
      // Save the largest response body to output.json
      fs.writeFileSync('output.json', largestRequest.body);
      console.log('Largest response saved to output.json');
    }
  } else {
    console.log('Less than 3 requests found. Exiting...');
  }

  // Close the browser and stop the script
  await browser.close();
})();
