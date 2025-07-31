// File: src/app/api/tiktok/[username]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import puppeteer, { Browser, Page } from 'puppeteer';
import fs from 'fs/promises';

// --- Configuration ---
const TIKTOK_USERNAME = process.env.TIKTOK_USERNAME;
const TIKTOK_PASSWORD = process.env.TIKTOK_PASSWORD;
const COOKIES_PATH = './tiktok_cookies.json';
export const dynamic = 'force-dynamic';

// --- Global Browser Instance ---
// This promise will resolve to a logged-in browser instance.
let browserPromise: Promise<Browser>;

// --- Initialization Function ---
async function initializeBrowser(): Promise<Browser> {
    console.log('[Puppeteer] Initializing browser...');
    const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });

    // Create a new page for the login process
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    try {
        // Check if we have valid, saved cookies
        const cookiesString = await fs.readFile(COOKIES_PATH, 'utf8');
        const cookies = JSON.parse(cookiesString);
        await page.setCookie(...cookies);
        console.log('[Puppeteer] Session cookies loaded successfully.');
        await page.goto('https://www.tiktok.com');
        await page.waitForSelector('[data-e2e="header-avatar"]', { timeout: 10000 });
        console.log('[Puppeteer] Cookie login successful. Browser is ready.');
    } catch (error) {
        // If cookies are invalid or don't exist, perform a full login
        console.log('[Puppeteer] No valid cookies found. Performing full login...');
        if (!TIKTOK_USERNAME || !TIKTOK_PASSWORD) {
            // This error will be caught by the main catch block and logged.
            throw new Error('TikTok username or password not set in .env file for login.');
        }

        // Navigate directly to the correct email login page
        await page.goto('https://www.tiktok.com/login/phone-or-email/email');
        
        // Fill in the login form
        const usernameInputSelector = 'input[name="username"]';
        await page.waitForSelector(usernameInputSelector);
        await page.type(usernameInputSelector, TIKTOK_USERNAME);
        
        const passwordInputSelector = 'input[name="password"]';
        await page.waitForSelector(passwordInputSelector);
        await page.type(passwordInputSelector, TIKTOK_PASSWORD);
        
        // Click login and wait for the page to load
        await page.click('button[data-e2e="login-button"]');
        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        // Verify login was successful by looking for the user's avatar in the header
        await page.waitForSelector('[data-e2e="header-avatar"]', { timeout: 15000 });
        
        // Save the new session cookies
        const cookies = await page.cookies();
        await fs.writeFile(COOKIES_PATH, JSON.stringify(cookies, null, 2));
        console.log('[Puppeteer] Login successful. Cookies saved. Browser is ready.');
    }

    // Close the temporary login page, it's no longer needed
    await page.close();
    return browser;
}


// --- Start Initialization on Server Load ---
// We wrap this in a catch block to prevent the entire server from crashing if Puppeteer fails
browserPromise = initializeBrowser().catch(err => {
    console.error("FATAL: Failed to initialize browser. The app may not function correctly.", err);
    // Exit gracefully if the browser can't even start.
    process.exit(1);
});

// --- API Route Handler ---
// This is now a placeholder. Once login is confirmed to be working, we will restore the streaming logic.
export async function GET(request: NextRequest) {
    console.log("API route hit. If browser is initialized, it's ready.");
    
    // We'll just return a success message for now to confirm the route is working.
    // The main test is to check the server logs for successful Puppeteer login.
    return NextResponse.json({ message: "TikTok API route is active. Check server logs for login status." });
}
