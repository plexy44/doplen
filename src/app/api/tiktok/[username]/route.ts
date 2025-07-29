import { NextRequest } from 'next/server';
import puppeteer, { Browser, Page } from 'puppeteer';

export const dynamic = 'force-dynamic';

// Share one browser instance across requests for efficiency
let browser: Browser | null = null;

async function createRealtimeStream(username: string, controller: ReadableStreamDefaultController) {
    let page: Page | null = null;

    const enqueue = (data: object) => {
        try {
            controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
        } catch (e) {
            // This can happen if the client disconnects, it's safe to ignore.
        }
    };
    
    // This function is called to clean up the browser page
    const cleanup = async () => {
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
        
        return cleanup;

    } catch (err: any) {
        console.error(`[Puppeteer] Error for @${username}:`, err.message);
        enqueue({ type: 'error', data: { message: `User not found or is not live. Please check the username.` } });
        controller.close();
        await cleanup();
        return null;
    }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
    const username = params.username;

    if (!username) {
        return new Response('Username is required', { status: 400 });
    }
    
    let cleanup: (() => Promise<void>) | null = null;

    const stream = new ReadableStream({
        async start(controller) {
            const cleanedUsername = username.startsWith('@') ? username.substring(1) : username;
            cleanup = await createRealtimeStream(cleanedUsername, controller);
            request.signal.onabort = () => {
                if (cleanup) cleanup();
                controller.close();
            };
        },
        cancel() {
            if (cleanup) {
                cleanup();
            }
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text-event-stream',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache',
        },
    });
}
