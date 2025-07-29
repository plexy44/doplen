import { Skeleton } from "@/components/ui/skeleton"
import { Heart, Share2, Users } from "lucide-react"

export default function Loading() {
  return (
    <div className="container mx-auto max-w-4xl p-4">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg glassmorphism flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-md">
              <Users className="h-10 w-10 text-transparent" />
            </Skeleton>
            <div className="space-y-1">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          <div className="p-4 rounded-lg glassmorphism flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-md">
              <Heart className="h-10 w-10 text-transparent" />
            </Skeleton>
            <div className="space-y-1">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          <div className="p-4 rounded-lg glassmorphism flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-md">
              <Share2 className="h-10 w-10 text-transparent" />
            </Skeleton>
            <div className="space-y-1">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
        
        {/* Event Feed */}
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight">Live Events</h2>
            <div className="h-[50vh] rounded-lg glassmorphism p-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                           <Skeleton className="h-4 w-20" />
                           <Skeleton className="h-4 w-40" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  )
}
