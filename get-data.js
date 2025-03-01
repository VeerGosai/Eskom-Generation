/* 2025 Copyright Veer Gosai (veergosai.com) */

const puppeteer = require('puppeteer');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

(async () => {
    const url = "https://www.eskom.co.za/dataportal/supply-side/station-build-up-for-the-last-7-days/";

    // Launch Puppeteer with sandbox disabled for GitHub Actions
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    const csvLink = await page.evaluate(() => {
        const element = document.querySelector("#post-275 > div > div > div > section.elementor-section.elementor-top-section.elementor-element.elementor-element-155c81a.elementor-section-boxed.elementor-section-height-default.elementor-section-height-default > div > div > div > div > div > div > div.elementor-icon-box-content > h3 > a");
        return element ? element.href : null;
    });
    
    await browser.close();
    
    if (!csvLink) {
        console.error("CSV link not found!");
        return;
    }
    
    console.log("Downloading CSV from:", csvLink);
    
    try {
        const response = await axios({
            url: csvLink,
            method: 'GET',
            responseType: 'stream'
        });
        
        const outputPath = path.join(__dirname, 'output.csv');
        const writer = fs.createWriteStream(outputPath);
        response.data.pipe(writer);
        
        writer.on('finish', () => console.log("CSV downloaded successfully as output.csv"));
        writer.on('error', (err) => console.error("Error writing file:", err));
        
    } catch (error) {
        console.error("Error downloading CSV:", error);
    }
})();
