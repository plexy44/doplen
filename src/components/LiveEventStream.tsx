'use client';

import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { TikTokEvent, CommentData, GiftData, StatsData } from '@/lib/types';
import { StatCard } from './StatCard';
import { EventFeed } from './EventFeed';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, Share2, Users, WifiOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LiveEventStreamProps {
  username: string;
}

export function LiveEventStream({ username }: LiveEventStreamProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [stats, setStats] = useState<StatsData>({ viewers: 0, likes: 0, shares: 0 });
  const [events, setEvents] = useState<(CommentData | GiftData)[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [isConnecting, setIsConnecting] = useState(true);

  const eventsRef = useRef(events);
  eventsRef.current = events;

  useEffect(() => {
    const eventSource = new EventSource(`/api/tiktok/${username}`);
    setIsConnecting(true);

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      const parsedEvent: TikTokEvent = JSON.parse(event.data);
      setIsConnecting(false);

      if (parsedEvent.type === 'stats') {
        setStats(prevStats => ({...prevStats, ...parsedEvent.data}));
      } else if (parsedEvent.type === 'comment' || parsedEvent.type === 'gift') {
        // Add to the beginning of the array, and keep the list from getting too long
        setEvents(prevEvents => [parsedEvent.data, ...prevEvents].slice(0, 50));
        if (parsedEvent.type === 'gift') {
          setStats(prevStats => ({ ...prevStats, shares: prevStats.shares + 1 }));
        }
      } else if (parsedEvent.type === 'error') {
        toast({
          variant: 'destructive',
          title: 'Stream Error',
          description: parsedEvent.data.message,
        });
        setIsConnected(false);
        eventSource.close();
        setTimeout(() => router.push('/'), 3000);
      }
    };

    eventSource.onerror = () => {
      if (isConnecting) {
          // This error is often immediate if the backend fails to start the stream.
          toast({
              variant: 'destructive',
              title: 'Connection Failed',
              description: "Could not connect to the stream. The user may not be live.",
          });
      } else {
          toast({
              variant: 'destructive',
              title: 'Connection Lost',
              description: "Disconnected from the live stream. Please refresh.",
          });
      }
      setIsConnected(false);
      setIsConnecting(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [username, toast, router, isConnecting]);
  
  const userAvatar = `https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/b6489b78652d4317b3f46f32e9da0a47~c5_100x100.jpeg?lk3s=a5d48078&x-expires=1720818000&x-signature=kIuM3YpAP2S4rS1N8qCdV7y10%2BM%3D`;

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <div className="flex flex-col gap-8">
        <header className="flex items-center gap-4">
          <Avatar className="h-20 w-20 border-4 border-primary">
            <AvatarImage src={userAvatar} alt={`@${username}`} />
            <AvatarFallback>{username.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">@{username}</h1>
            {isConnecting ? (
               <Badge variant="secondary" className="mt-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2 animate-pulse"></div>
                CONNECTING...
              </Badge>
            ) : isConnected ? (
              <Badge variant="default" className="mt-2 bg-green-500 hover:bg-green-600">
                <div className="w-2 h-2 rounded-full bg-white mr-2 animate-pulse"></div>
                LIVE
              </Badge>
            ) : (
              <Badge variant="destructive" className="mt-2">
                <WifiOff className="w-4 h-4 mr-2" />
                OFFLINE
              </Badge>
            )}
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={Users} label="Viewers" value={stats.viewers} />
          <StatCard icon={Heart} label="Likes" value={stats.likes} />
          <StatCard icon={Share2} label="Shares & Gifts" value={stats.shares} />
        </section>

        <section>
          <h2 className="text-2xl font-semibold tracking-tight mb-4">Live Events</h2>
          <EventFeed events={events} />
        </section>
      </div>
    </div>
  );
}

    