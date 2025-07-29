'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CommentData, GiftData } from '@/lib/types';
import { Gift, MessageCircle } from 'lucide-react';

interface EventFeedProps {
  events: (CommentData | GiftData)[];
}

const EventItem = ({ event }: { event: CommentData | GiftData }) => {
  const isComment = (e: any): e is CommentData => 'comment' in e;

  return (
    <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-primary/5 transition-colors animate-slide-in-from-bottom">
      <Avatar className="h-10 w-10 border-2 border-primary/20">
        <AvatarImage src={event.user.avatar} />
        <AvatarFallback>{event.user.name.substring(0, 2)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="font-semibold text-sm">{event.user.name}</p>
        {isComment(event) ? (
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-accent-foreground" />
            {event.comment}
          </p>
        ) : (
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            <Gift className="w-4 h-4 text-primary" />
            Sent a {event.giftName}
          </p>
        )}
      </div>
    </div>
  );
};


export function EventFeed({ events }: EventFeedProps) {
  return (
    <Card className="glassmorphism p-2">
      <ScrollArea className="h-[50vh] w-full">
        <div className="p-2 space-y-1">
            {events.length === 0 && (
                <div className="flex flex-col items-center justify-center h-[45vh] text-muted-foreground">
                    <p>Listening for live events...</p>
                    <p className="text-xs">Comments, gifts, and shares will appear here.</p>
                </div>
            )}
          {events.map((event) => (
            <EventItem key={event.id} event={event} />
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
