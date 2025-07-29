'use client'

import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './ui/card';

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
}

export function StatCard({ icon: Icon, label, value }: StatCardProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValueRef = useRef<number>();

  useEffect(() => {
    if (prevValueRef.current !== undefined && prevValueRef.current !== value) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
    prevValueRef.current = value;
  }, [value]);
  
  return (
    <Card className="glassmorphism p-4">
      <CardContent className="p-0 flex items-center gap-4">
        <div className="p-3 bg-primary/20 rounded-lg">
           <Icon className="h-6 w-6 text-primary" />
        </div>
        <div className="flex flex-col">
          <span
            key={value}
            className={cn(
              'text-2xl font-bold tracking-tighter',
              isAnimating && 'animate-value-change'
            )}
          >
            {value.toLocaleString()}
          </span>
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
      </CardContent>
    </Card>
  );
}
