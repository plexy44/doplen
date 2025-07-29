# **App Name**: Doplen

## Core Features:

- Username Input: Accept a TikTok username via a URL query parameter.
- Puppeteer Browser: Launch a headless Puppeteer browser and navigate to the TikTok LIVE page.
- Stream Verification: Verify the user is live and set a realistic User-Agent string to avoid bot detection.
- Data Observation: Scrape initial viewer count and set up a MutationObserver to watch for new comments, gifts, likes, and shares.
- Data Parsing: Parse relevant data from new events (username, comment text, gift name, etc.) and send it back to the server.
- Real-time Stream: Send real-time event data to the client via a Server-Sent Events (SSE) stream in JSON format.
- Error Handling: Handle errors gracefully, sending clear error events and closing the connection when necessary (e.g., user not live, user does not exist, timeout, selector failure).

## Style Guidelines:

- Primary color: Soft, muted blue (#A0B4D6) to give a calming feel while keeping with the high tech context.
- Background color: Light gray (#F0F0F0) with low saturation for a neutral, blurred effect as demanded by the user request for glassmorphism.
- Accent color: Pale yellow (#E8DAB2) to provide contrast and highlight important data points.
- Font: 'Inter' (sans-serif) for both body and headline text, giving a modern, neutral, easy-to-read aesthetic that suits data display well.
- Implement a glassmorphism design with background blur to display data on liquid glass. Elements like buttons and data displays will have rounded rectangles with transparency.
- Subtle animations to display live data changes (e.g. increase in like counts).