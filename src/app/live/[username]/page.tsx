// File: src/app/live/[username]/page.tsx

// Make sure the path to your component is correct
import { LiveEventStream } from '@/components/LiveEventStream';

interface LivePageProps {
  params: {
    username: string;
  };
}

// This is the correct, simple structure for a Server Component page
export default function LivePage({ params }: LivePageProps) {
  return (
    <main className="min-h-screen w-full">
      <LiveEventStream username={params.username} />
    </main>
  );
}
