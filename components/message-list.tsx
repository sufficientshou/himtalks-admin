"use client"

import type { Message } from "@/types/message"
import { Card, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trash2, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { deleteMessage } from "@/services/api"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useLoginModal } from "@/hooks/use-login-modal"
import { formatSafeDate, formatExactDate } from "@/lib/date-utils"

interface MessageListProps {
  messages: Message[]
  onDelete: (id: string) => void
}

export default function MessageList({ messages, onDelete }: MessageListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const { showLoginModal } = useLoginModal()

  const handleDelete = async (id: string) => {
    if (!isAuthenticated) {
      showLoginModal()
      return
    }

    try {
      setDeletingId(id)
      await deleteMessage(id)
      onDelete(id)
      toast({
        title: "Message deleted",
        description: "The message has been successfully deleted."
      })
    } catch (error) {
      console.error("Failed to delete message:", error)
      toast({
        title: "Error",
        description: "Failed to delete message. Please try again.",
        variant: "destructive"
      })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {messages.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-lg">No messages found.</p>
        </div>
      ) : (
        messages.map((message) => (
          <Card key={message.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/50 hover:border-l-primary">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${message.sender_name}`} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {message.sender_name?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-base">{message.sender_name || "Anonymous"}</p>
                      {message.category && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                          {message.category}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <span className="font-medium">To:</span> {message.recipient_name || "Unknown"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full" title={formatExactDate(message.created_at)}>
                    {formatSafeDate(message.created_at)}
                  </div>
                </div>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                <p className="text-sm md:text-base leading-relaxed text-foreground/90">{message.content}</p>
              </div>
            </CardContent>
            
            <CardFooter className="bg-gradient-to-r from-muted/20 to-muted/40 px-6 py-3 border-t flex justify-end">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                onClick={() => handleDelete(message.id.toString())}
                disabled={deletingId === message.id.toString()}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deletingId === message.id.toString() ? "Deleting..." : "Delete"}
              </Button>
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  )
}

