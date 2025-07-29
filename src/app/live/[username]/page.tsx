import { LiveEventStream } from '@/components/LiveEventStream';

interface LivePageProps {
  params: {
    username: string;
  };
}

export default function LivePage({ params }: LivePageProps) {
  return (
    <main className="min-h-screen w-full">
      <LiveEventStream username={params.username} />
    </main>
  );
}
