"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Music, Trash2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useLoginModal } from "@/hooks/use-login-modal"
import { formatSafeDate, formatExactDate } from "@/lib/date-utils"
import { fetchSongfessById, deleteSongfess } from "@/services/api"
import type { Songfess } from "@/types/songfess"

export default function SongfessDetailsPage() {
  const [songfess, setSongfess] = useState<Songfess | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const { showLoginModal } = useLoginModal()
  
  const id = Array.isArray(params.id) ? params.id[0] : params.id

  useEffect(() => {
    async function loadSongfess() {
      try {
        setLoading(true)
        const data = await fetchSongfessById(id)
        setSongfess(data)
      } catch (err) {
        console.error("Error fetching songfess:", err)
        setError("Failed to load songfess. Please try again later.")
      } finally {
        setLoading(false)
      }
    }
    
    loadSongfess()
  }, [id])

  const handleDelete = async () => {
    if (!isAuthenticated) {
      showLoginModal()
      return
    }

    try {
      setIsDeleting(true)
      await deleteSongfess(id)
      toast({
        title: "Songfess deleted",
        description: "The songfess has been successfully deleted."
      })
      router.push("/songfess")
    } catch (error) {
      console.error("Failed to delete songfess:", error)
      toast({
        title: "Error",
        description: "Failed to delete songfess. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  if (loading) {
    return (
      <div className="container py-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-center py-8">Loading songfess details...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !songfess) {
    return (
      <div className="container py-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-red-500 py-4">{error || "Songfess not found"}</div>
            <Button onClick={handleBack} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Songfess List
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center mb-2">
            <Button variant="ghost" onClick={handleBack} className="mr-2 p-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle>Songfess Details</CardTitle>
              <CardDescription>View song confession details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-16 w-16 rounded overflow-hidden bg-gray-100">
              {songfess.album_art ? (
                <img 
                  src={songfess.album_art} 
                  alt={songfess.song_title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <Music className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{songfess.song_title || "Unknown Song"}</h3>
              <p className="text-muted-foreground">{songfess.artist || "Unknown Artist"}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="text-sm mb-2 font-medium">Message:</div>
            <p className="text-base bg-muted p-4 rounded">{songfess.content}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <div className="text-sm mb-1 text-muted-foreground">From:</div>
              <p>{songfess.sender_name || "Anonymous"}</p>
            </div>
            <div>
              <div className="text-sm mb-1 text-muted-foreground">To:</div>
              <p>{songfess.recipient_name || "Unknown"}</p>
            </div>
            <div>
              <div className="text-sm mb-1 text-muted-foreground">Created:</div>
              <p title={formatExactDate(songfess.created_at)}>{formatSafeDate(songfess.created_at)}</p>
            </div>
          </div>
          
          {/* Song Timing Information Table */}
          {(songfess.start_time !== undefined || songfess.end_time !== undefined) && (
            <div className="mb-6">
              <div className="text-sm mb-2 font-medium">Song Timing:</div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Formatted Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {songfess.start_time !== undefined && (
                    <TableRow>
                      <TableCell className="font-medium">Start Time</TableCell>
                      <TableCell>{songfess.start_time}s</TableCell>
                      <TableCell>{Math.floor(songfess.start_time / 60)}:{(songfess.start_time % 60).toString().padStart(2, '0')}</TableCell>
                    </TableRow>
                  )}
                  {songfess.end_time !== undefined && (
                    <TableRow>
                      <TableCell className="font-medium">End Time</TableCell>
                      <TableCell>{songfess.end_time}s</TableCell>
                      <TableCell>{Math.floor(songfess.end_time / 60)}:{(songfess.end_time % 60).toString().padStart(2, '0')}</TableCell>
                    </TableRow>
                  )}
                  {songfess.start_time !== undefined && songfess.end_time !== undefined && (
                    <TableRow className="bg-muted/30">
                      <TableCell className="font-medium">Duration</TableCell>
                      <TableCell>{songfess.end_time - songfess.start_time}s</TableCell>
                      <TableCell>{Math.floor((songfess.end_time - songfess.start_time) / 60)}:{((songfess.end_time - songfess.start_time) % 60).toString().padStart(2, '0')}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Spotify Embed */}
          {songfess.song_id && (
            <div className="mt-6">
              <div className="text-sm mb-2 font-medium">Play Song:</div>
              <iframe
                src={`https://open.spotify.com/embed/track/${songfess.song_id}`}
                width="100%"
                height="352"
                frameBorder="0"
                allow="encrypted-media"
                className="rounded"
              ></iframe>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="bg-muted/50 p-4 flex justify-end">
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? "Deleting..." : "Delete Songfess"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}