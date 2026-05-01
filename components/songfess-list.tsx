"use client"

import { useRouter } from "next/navigation"
import type { Songfess } from "@/types/songfess"
import { Card, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { Music, Trash2, Clock, User, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { deleteSongfess } from "@/services/api"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useLoginModal } from "@/hooks/use-login-modal"
import { formatSafeDate, formatExactDate } from "@/lib/date-utils"

interface SongfessListProps {
  songfess: Songfess[]
  onDelete: (id: string) => void
}

export default function SongfessList({ songfess, onDelete }: SongfessListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const { showLoginModal } = useLoginModal()

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation() // Prevent navigation when clicking delete
    
    if (!isAuthenticated) {
      showLoginModal()
      return
    }

    try {
      setDeletingId(id)
      await deleteSongfess(id)
      onDelete(id)
      toast({
        title: "Songfess deleted",
        description: "The songfess has been successfully deleted."
      })
    } catch (error) {
      console.error("Failed to delete songfess:", error)
      toast({
        title: "Error",
        description: "Failed to delete songfess. Please try again.",
        variant: "destructive"
      })
    } finally {
      setDeletingId(null)
    }
  }

  const goToDetails = (id: string) => {
    router.push(`/songfess/${id}`)
  }

  return (
    <div className="space-y-4">
      {songfess.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Music className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-lg">No songfess found.</p>
        </div>
      ) : (
        songfess.map((item) => (
          <Card 
            key={item.id} 
            className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 border-l-blue-500/50 hover:border-l-blue-500 group"
            onClick={() => goToDetails(item.id.toString())}
          >
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Album Art */}
                <div className="shrink-0">
                  <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 shadow-md ring-2 ring-blue-500/20 group-hover:ring-blue-500/40 transition-all">
                    {item.album_art ? (
                      <img 
                        src={item.album_art} 
                        alt={item.song_title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Music className="h-10 w-10 text-blue-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {item.song_title || "Unknown Song"}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.artist || "Unknown Artist"}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full whitespace-nowrap" title={formatExactDate(item.created_at)}>
                      {formatSafeDate(item.created_at)}
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="bg-gradient-to-r from-muted/40 to-muted/20 rounded-lg p-4 mb-3 border border-border/50">
                    <p className="text-sm leading-relaxed line-clamp-2 text-foreground/90">
                      {item.content}
                    </p>
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                      <User className="h-3.5 w-3.5" />
                      <span className="font-medium">From:</span> {item.sender_name || "Anonymous"}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                      <User className="h-3.5 w-3.5" />
                      <span className="font-medium">To:</span> {item.recipient_name || "Unknown"}
                    </div>
                    {(item.start_time !== undefined || item.end_time !== undefined) && (
                      <div className="flex items-center gap-1.5 text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-medium">
                        <Clock className="h-3.5 w-3.5" />
                        {item.start_time !== undefined ? `${Math.floor(item.start_time / 60)}:${(item.start_time % 60).toString().padStart(2, '0')}` : '--'}
                        {item.start_time !== undefined && item.end_time !== undefined ? ' - ' : ''}
                        {item.end_time !== undefined ? `${Math.floor(item.end_time / 60)}:${(item.end_time % 60).toString().padStart(2, '0')}` : ''}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="bg-gradient-to-r from-muted/20 to-muted/40 px-6 py-3 border-t flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                className="group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-200 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  goToDetails(item.id.toString())
                }}
              >
                View Details
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                onClick={(e) => handleDelete(e, item.id.toString())}
                disabled={deletingId === item.id.toString()}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deletingId === item.id.toString() ? "Deleting..." : "Delete"}
              </Button>
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  )
}

