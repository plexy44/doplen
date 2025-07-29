import { NextRequest } from 'next/server';

const users = [
  'Ninja', 'John', 'Jane', 'Alex', 'Sarah', 'Mike', 'Emily', 'Chris', 'Laura', 'Kevin'
];
const comments = [
  'Wow!', 'Amazing!', 'LOL', 'Great stream!', 'Love this!', 'Keep it up!', 'First!', 'Hi from Brazil!', 'So cool', 'What game is this?'
];
const gifts = [
  'Rose', 'TikTok', 'Panda', 'Italian Hand', 'Heart', 'Confetti'
];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  if (params.username.toLowerCase() === 'notfound' || params.username.toLowerCase() === 'error') {
    const errorData = JSON.stringify({ type: 'error', data: { message: 'User could not be found or is not live.' } });
    return new Response(`data: ${errorData}\n\n`, {
      status: 200, // SSE spec requires 200, even for errors
      headers: {
        'Content-Type': 'text/event-stream',
      },
    });
  }

  const stream = new ReadableStream({
    start(controller) {
      let viewers = Math.floor(Math.random() * 1000) + 50;
      let likes = Math.floor(Math.random() * 10000) + 500;
      let shares = Math.floor(Math.random() * 500) + 10;
      let eventCounter = 0;

      const sendEvent = (data: object) => {
        controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
      };
      
      // Send initial stats
      sendEvent({ type: 'stats', data: { viewers, likes, shares } });

      const intervalId = setInterval(() => {
        eventCounter++;

        // Update stats periodically
        if (eventCounter % 2 === 0) {
          viewers += Math.floor(Math.random() * 10) - 4;
          likes += Math.floor(Math.random() * 50);
          if (viewers < 0) viewers = 0;
          sendEvent({ type: 'stats', data: { viewers, likes, shares } });
        }

        const randomUser = {
          name: getRandomItem(users),
          avatar: `https://i.pravatar.cc/40?u=${Math.random()}`
        };

        // Send a comment or gift
        if (Math.random() > 0.3) { // 70% chance of comment
          sendEvent({
            type: 'comment',
            data: {
              id: `c${Date.now()}`,
              user: randomUser,
              comment: getRandomItem(comments)
            }
          });
        } else { // 30% chance of gift
          shares += 1; // Shares often happen with gifts
          sendEvent({
            type: 'gift',
            data: {
              id: `g${Date.now()}`,
              user: randomUser,
              giftName: getRandomItem(gifts),
              amount: 1,
            }
          });
        }

      }, 1500);

      request.signal.onabort = () => {
        clearInterval(intervalId);
        controller.close();
      };
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
