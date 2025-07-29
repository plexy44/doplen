'use client';

import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { TikTokEvent, CommentData, GiftData, StatsData } from '@/lib/types';
import { StatCard } from './StatCard';
import { EventFeed } from './EventFeed';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, Share2, Users, WifiOff } from 'lucide-react';

interface LiveEventStreamProps {
  username: string;
}

export function LiveEventStream({ username }: LiveEventStreamProps) {
  const { toast } = useToast();
  const [stats, setStats] = useState<StatsData>({ viewers: 0, likes: 0, shares: 0 });
  const [events, setEvents] = useState<(CommentData | GiftData)[]>([]);
  const [isConnected, setIsConnected] = useState(true);

  const eventsRef = useRef(events);
  eventsRef.current = events;

  useEffect(() => {
    const eventSource = new EventSource(`/api/tiktok/${username}`);

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      const parsedEvent: TikTokEvent = JSON.parse(event.data);

      if (parsedEvent.type === 'stats') {
        setStats(parsedEvent.data);
      } else if (parsedEvent.type === 'comment' || parsedEvent.type === 'gift') {
        // Add to the beginning of the array, and keep the list from getting too long
        setEvents(prevEvents => [parsedEvent.data, ...prevEvents].slice(0, 50));
      } else if (parsedEvent.type === 'error') {
        toast({
          variant: 'destructive',
          title: 'Stream Error',
          description: parsedEvent.data.message,
        });
        setIsConnected(false);
        eventSource.close();
      }
    };

    eventSource.onerror = () => {
      toast({
        variant: 'destructive',
        title: 'Connection Lost',
        description: "Disconnected from the live stream. Please refresh.",
      });
      setIsConnected(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [username, toast]);
  
  const userAvatar = `https://i.pravatar.cc/80?u=${username}`;

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
            {isConnected ? (
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
