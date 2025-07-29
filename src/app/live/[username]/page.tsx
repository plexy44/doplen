import { LiveEventStream } from '@/components/LiveEventStream';

interface LivePageProps {
  params: {
    username: string;
  };
}

// This is a Server Component. Its only job is to get the username
// from the URL and pass it to the interactive Client Component.
export default async function LivePage({ params }: LivePageProps) {
  return (
    <main className="min-h-screen w-full">
      <LiveEventStream username={params.username} />
    </main>
  );
}
