import { LiveEventStream } from '@/components/LiveEventStream';

interface LivePageProps {
  params: {
    username: string;
  };
}

export default async function LivePage({ params }: LivePageProps) {
  const username = params.username;
  return (
    <main className="min-h-screen w-full">
      <LiveEventStream username={username} />
    </main>
  );
}
