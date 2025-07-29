// File: src/app/api/tiktok/[username]/route.ts

import { NextRequest } from 'next/server';
import puppeteer, { Browser, Page } from 'puppeteer';

export const dynamic = 'force-dynamic';

// Share one browser instance across requests for efficiency
let browser: Browser | null = null;

function createRealtimeStream(username: string) {
    let cleanup: (() => Promise<void>) | null = null;

    const stream = new ReadableStream({
        async start(controller) {
            const enqueue = (data: object) => {
                try {
                    controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
                } catch (e) {
                    // This can happen if the client disconnects, it's safe to ignore.
                }
            };
            
            let page: Page | null = null;

            cleanup = async () => {
                if (page) {
                    try {
                        await page.close();
                        console.log(`[Puppeteer] Closed page for @${username}`);
                    } catch (e) {
                        console.error(`[Puppeteer] Error closing page for @${username}:`, e);
                    }
                }
            };

            try {
                if (!browser) {
                    console.log('[Puppeteer] Launching new browser instance...');
                    browser = await puppeteer.launch({ 
                        headless: true,
                        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
                    });
                }
                
                page = await browser.newPage();
                await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

                console.log(`[Puppeteer] Navigating to @${username}'s live page...`);
                await page.goto(`https://www.tiktok.com/@${username}/live`, { waitUntil: 'networkidle2' });
                
                // --- NEW: LOGIC TO HANDLE LOGIN MODAL ---
                try {
                    console.log('[Puppeteer] Checking for login modal...');
                    const closeButtonSelector = 'div[class*="DivLoginModal"] [class*="DivCloseContainer"]';
                    await page.waitForSelector(closeButtonSelector, { timeout: 5000 }); // Wait up to 5s
                    await page.click(closeButtonSelector);
                    console.log('[Puppeteer] Login modal closed.');
                } catch (error) {
                    console.log('[Puppeteer] Login modal did not appear, continuing...');
                }
                // --- END OF NEW LOGIC ---

                const isLive = await page.evaluate(() => !document.querySelector('[data-e2e="live-ended-modal"]'));
                if (!isLive) {
                    throw new Error('User is not live or the session has ended.');
                }

                const userAvatar = await page.evaluate(() => {
                    return (document.querySelector('[data-e2e="live-user-avatar"] img') as HTMLImageElement)?.src || '';
                });

                console.log(`[Puppeteer] Successfully connected to @${username}'s live stream.`);
                enqueue({ type: 'connected', data: { message: `Connected to @${username}`, userAvatar } });

                await page.exposeFunction('onNewEvent', (event: object) => {
                    enqueue(event);
                });

                await page.evaluate(() => {
                    const onNewEvent = (window as any).onNewEvent;

                    const sendStats = () => {
                        const viewersText = document.querySelector('[data-e2e="live-viewer-count"]')?.textContent || '0';
                        const likesText = document.querySelector('[data-e2e="like-count"]')?.textContent || '0';
                        
                        const parseStat = (text: string) => {
                            text = text.trim().toUpperCase();
                            if (text.endsWith('K')) return Math.floor(parseFloat(text) * 1000);
                            if (text.endsWith('M')) return Math.floor(parseFloat(text) * 1000000);
                            return parseInt(text, 10) || 0;
                        }

                        onNewEvent({ type: 'stats', data: { viewers: parseStat(viewersText), likes: parseStat(likesText) } });
                    };

                    sendStats();
                    setInterval(sendStats, 5000);

                    const eventContainer = document.querySelector('[class*="webcast-im-message_container"]');
                    if (eventContainer) {
                        const eventObserver = new MutationObserver((mutations) => {
                            mutations.forEach((mutation) => {
                                mutation.addedNodes.forEach((node) => {
                                    if (node.nodeType !== Node.ELEMENT_NODE) return;
                                    const element = node as HTMLElement;
                                    
                                    const userEl = element.querySelector('[data-e2e="chat-message-username"]') as HTMLElement;
                                    const commentEl = element.querySelector('[data-e2e="chat-message-content"]') as HTMLElement;
                                    const avatarEl = element.querySelector('img[class*="webcast-im-user-avatar"]') as HTMLImageElement;

                                    if (userEl && commentEl) {
                                        onNewEvent({
                                            type: 'comment',
                                            data: {
                                                id: `c${Date.now()}${Math.random()}`,
                                                user: { name: userEl.innerText.trim(), avatar: avatarEl?.src || '' },
                                                comment: commentEl.innerText.trim()
                                            }
                                        });
                                    }
                                });
                            });
                        });
                        eventObserver.observe(eventContainer, { childList: true, subtree: true });
                    }
                });

            } catch (err: any) {
                console.error(`[Puppeteer] Error for @${username}:`, err.message);
                enqueue({ type: 'error', data: { message: `User not found or is not live. Please check the username.` } });
                controller.close();
                if (cleanup) await cleanup();
            }
        },
        cancel() {
            if (cleanup) {
                cleanup();
            }
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache',
        },
    });
}

// Corrected GET function
export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
    const username = params.username.replace('@', '');

    if (!username) {
        return new Response('Username is required', { status: 400 });
    }
    
    // The createRealtimeStream function should be defined above in this file
    return createRealtimeStream(username);
}