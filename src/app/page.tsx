import { UsernameForm } from '@/components/UsernameForm';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-8">
      <div className="flex flex-col items-center space-y-8">
        <div className="text-center">
          <h1 className="text-6xl font-bold tracking-tight text-primary">
            Doplen
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Get real-time insights from any TikTok LIVE stream.
          </p>
        </div>
        <UsernameForm />
      </div>
    </main>
  );
}
