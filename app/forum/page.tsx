"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/components/auth-provider"
import { createForum, fetchForums, updateForum, deleteForum, fetchComments, deleteComment } from "@/services/admin-api"
import { Pencil, Trash2, ImageIcon, RefreshCw, Plus, MessageCircle, User, ChevronDown, ChevronUp } from "lucide-react"

interface Forum {
  id: number
  title: string
  content: string
  image_url?: string
  ImageURL?: string
  created_at?: string
  CreatedAt?: string
  comment_count?: number
  CommentCount?: number
}

interface Comment {
  id: number
  forum_id: number
  name: string
  avatar_id?: string
  content: string
  created_at: string
}

export default function ForumPage() {
  // Create form state
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Forum list state
  const [forums, setForums] = useState<Forum[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)

  // Edit state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingForum, setEditingForum] = useState<Forum | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [editImage, setEditImage] = useState<File | null>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingForum, setDeletingForum] = useState<Forum | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Comments state
  const [expandedForumId, setExpandedForumId] = useState<number | null>(null)
  const [comments, setComments] = useState<Record<number, Comment[]>>({})
  const [commentsLoading, setCommentsLoading] = useState<Record<number, boolean>>({})
  const [deleteCommentDialogOpen, setDeleteCommentDialogOpen] = useState(false)
  const [deletingComment, setDeletingComment] = useState<Comment | null>(null)
  const [deleteCommentLoading, setDeleteCommentLoading] = useState(false)

  const { isAuthenticated, refreshAuthStatus } = useAuth()

  // Fetch forums on mount
  useEffect(() => {
    loadForums()
  }, [])

  const loadForums = async () => {
    try {
      setListLoading(true)
      setListError(null)
      if (refreshAuthStatus) {
        await refreshAuthStatus()
      }
      const data = await fetchForums()
      setForums(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.error("Error fetching forums:", err)
      setListError(err.message || "Failed to load forums.")
    } finally {
      setListLoading(false)
    }
  }

  // --- Create handlers ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!title.trim() || !content.trim()) {
      setError("Title and Content are required")
      return
    }

    try {
      setLoading(true)
      if (refreshAuthStatus) {
        await refreshAuthStatus()
      }

      const formData = new FormData()
      formData.append("title", title)
      formData.append("content", content)
      if (image) {
        formData.append("image", image)
      }

      await createForum(formData)

      setSuccess("Forum post created successfully!")
      setTitle("")
      setContent("")
      setImage(null)

      const fileInput = document.getElementById("create-image") as HTMLInputElement
      if (fileInput) fileInput.value = ""

      // Refresh the forum list
      loadForums()
    } catch (err: any) {
      console.error("Error creating forum:", err)
      setError(err.message || "Failed to create forum post.")
    } finally {
      setLoading(false)
    }
  }

  // --- Edit handlers ---
  const openEditDialog = (forum: Forum) => {
    setEditingForum(forum)
    setEditTitle(forum.title)
    setEditContent(forum.content)
    setEditImage(null)
    setEditError(null)
    setEditDialogOpen(true)
  }

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setEditImage(e.target.files[0])
    }
  }

  const handleEditSubmit = async () => {
    if (!editingForum) return
    setEditError(null)

    // Cek apakah ada perubahan (minimal satu field harus berubah)
    const titleChanged = editTitle.trim() !== editingForum.title
    const contentChanged = editContent.trim() !== editingForum.content
    const imageChanged = editImage !== null

    if (!titleChanged && !contentChanged && !imageChanged) {
      setEditError("Tidak ada perubahan yang dilakukan.")
      return
    }

    try {
      setEditLoading(true)
      if (refreshAuthStatus) {
        await refreshAuthStatus()
      }

      const formData = new FormData()
      // Kirim field yang berubah saja, backend akan pakai nilai lama untuk field kosong
      if (titleChanged) {
        formData.append("title", editTitle.trim())
      }
      if (contentChanged) {
        formData.append("content", editContent.trim())
      }
      if (imageChanged) {
        formData.append("image", editImage)
      }

      await updateForum(editingForum.id, formData)

      setEditDialogOpen(false)
      setEditingForum(null)
      loadForums()
    } catch (err: any) {
      console.error("Error updating forum:", err)
      setEditError(err.message || "Failed to update forum.")
    } finally {
      setEditLoading(false)
    }
  }

  // --- Delete handlers ---
  const openDeleteDialog = (forum: Forum) => {
    setDeletingForum(forum)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingForum) return

    try {
      setDeleteLoading(true)
      if (refreshAuthStatus) {
        await refreshAuthStatus()
      }

      await deleteForum(deletingForum.id)

      setDeleteDialogOpen(false)
      setDeletingForum(null)
      // Remove from local state immediately
      setForums((prev) => prev.filter((f) => f.id !== deletingForum.id))
    } catch (err: any) {
      console.error("Error deleting forum:", err)
      alert(err.message || "Failed to delete forum.")
    } finally {
      setDeleteLoading(false)
    }
  }

  // --- Comment handlers ---
  const toggleComments = async (forumId: number) => {
    if (expandedForumId === forumId) {
      setExpandedForumId(null)
      return
    }

    setExpandedForumId(forumId)
    await loadComments(forumId)
  }

  const loadComments = async (forumId: number) => {
    try {
      setCommentsLoading((prev) => ({ ...prev, [forumId]: true }))
      const data = await fetchComments(forumId)
      setComments((prev) => ({ ...prev, [forumId]: Array.isArray(data) ? data : [] }))
    } catch (err: any) {
      console.error("Error fetching comments:", err)
      setComments((prev) => ({ ...prev, [forumId]: [] }))
    } finally {
      setCommentsLoading((prev) => ({ ...prev, [forumId]: false }))
    }
  }

  const openDeleteCommentDialog = (comment: Comment) => {
    setDeletingComment(comment)
    setDeleteCommentDialogOpen(true)
  }

  const handleDeleteComment = async () => {
    if (!deletingComment) return

    try {
      setDeleteCommentLoading(true)
      if (refreshAuthStatus) {
        await refreshAuthStatus()
      }

      await deleteComment(deletingComment.id)

      // Remove from local state
      const forumId = deletingComment.forum_id
      setComments((prev) => ({
        ...prev,
        [forumId]: (prev[forumId] || []).filter((c) => c.id !== deletingComment.id),
      }))

      setDeleteCommentDialogOpen(false)
      setDeletingComment(null)
    } catch (err: any) {
      console.error("Error deleting comment:", err)
      alert(err.message || "Failed to delete comment.")
    } finally {
      setDeleteCommentLoading(false)
    }
  }

  // Helper to get image URL
  const getImageUrl = (forum: Forum) => {
    return forum.image_url || forum.ImageURL || null
  }

  // Helper to get created date
  const getCreatedAt = (forum: Forum) => {
    const raw = forum.created_at || forum.CreatedAt
    if (!raw) return "Unknown date"
    try {
      return new Date(raw).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "Invalid date"
    }
  }

  // Helper to format comment date
  const formatCommentDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "Invalid date"
    }
  }

  // Helper to get comment count
  const getCommentCount = (forum: Forum) => {
    // If we have loaded comments for this forum, use that count
    if (comments[forum.id]) {
      return comments[forum.id].length
    }
    return forum.comment_count ?? forum.CommentCount ?? 0
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-4xl">
      <Tabs defaultValue="manage" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manage">Manage Forums</TabsTrigger>
          <TabsTrigger value="create">Create Forum</TabsTrigger>
        </TabsList>

        {/* ===== MANAGE TAB ===== */}
        <TabsContent value="manage">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Forum List</CardTitle>
                <CardDescription>Manage all forum posts. Edit or delete existing forums.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={loadForums} disabled={listLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${listLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {listLoading ? (
                <div className="flex justify-center py-12 text-muted-foreground">
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Loading forums...
                </div>
              ) : listError ? (
                <div className="text-red-500 py-4 text-center">{listError}</div>
              ) : forums.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <MessageCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium">No forum posts yet.</p>
                  <p className="text-sm mt-1">Switch to the &quot;Create Forum&quot; tab to create your first post.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {forums.map((forum) => (
                    <Card
                      key={forum.id}
                      className="overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500/50 hover:border-l-purple-500 group"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg mb-2 group-hover:text-purple-600 transition-colors">
                              {forum.title}
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                              {forum.content}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(forum)}
                              className="hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-colors"
                            >
                              <Pencil className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog(forum)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>

                        {/* Show image preview if exists */}
                        {getImageUrl(forum) && (
                          <div className="mb-4">
                            <img
                              src={getImageUrl(forum)!}
                              alt={forum.title}
                              className="rounded-lg max-h-64 w-full object-cover shadow-md ring-1 ring-border/50"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none"
                              }}
                            />
                          </div>
                        )}

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                            <span className="font-medium">{getCreatedAt(forum)}</span>
                          </div>
                          <button
                            onClick={() => toggleComments(forum.id)}
                            className="flex items-center gap-1.5 text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full font-medium hover:bg-purple-200 transition-colors cursor-pointer"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            {getCommentCount(forum)} comments
                            {expandedForumId === forum.id ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )}
                          </button>
                          {getImageUrl(forum) && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                              <ImageIcon className="h-3.5 w-3.5" />
                              Has image
                            </div>
                          )}
                        </div>

                        {/* ===== COMMENTS SECTION ===== */}
                        {expandedForumId === forum.id && (
                          <div className="mt-4 pt-4 border-t border-border/50">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-sm font-semibold flex items-center gap-2">
                                <MessageCircle className="h-4 w-4 text-purple-600" />
                                Comments
                              </h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => loadComments(forum.id)}
                                disabled={commentsLoading[forum.id]}
                                className="h-7 text-xs"
                              >
                                <RefreshCw className={`h-3 w-3 mr-1 ${commentsLoading[forum.id] ? "animate-spin" : ""}`} />
                                Refresh
                              </Button>
                            </div>

                            {commentsLoading[forum.id] ? (
                              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Loading comments...
                              </div>
                            ) : (comments[forum.id] || []).length === 0 ? (
                              <div className="text-center py-8 bg-muted/30 rounded-lg">
                                <MessageCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                                <p className="text-sm text-muted-foreground">Belum ada komentar di forum ini.</p>
                              </div>
                            ) : (
                              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                                {(comments[forum.id] || []).map((comment) => (
                                  <div
                                    key={comment.id}
                                    className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-muted/40 to-muted/20 border border-border/50 group hover:shadow-sm transition-all"
                                  >
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center shrink-0 ring-2 ring-purple-500/20">
                                      <User className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-semibold">
                                          {comment.name || "Anonim"}
                                        </span>
                                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                          {formatCommentDate(comment.created_at)}
                                        </span>
                                      </div>
                                      <p className="text-sm text-foreground/90 leading-relaxed break-words">
                                        {comment.content}
                                      </p>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                      onClick={() => openDeleteCommentDialog(comment)}
                                      title="Delete comment"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== CREATE TAB ===== */}
        <TabsContent value="create">
          <Card className="border-t-4 border-t-purple-500">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                Create Mini Forum
              </CardTitle>
              <CardDescription className="mt-2">
                Post a new topic to the mini forum.
                <span className="block mt-2 text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 px-3 py-2 rounded-lg font-medium">
                Sebagai admin, Anda bisa membuat forum kapan saja. User biasa hanya bisa posting jam 07:00–09:00 WIB.
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="create-title" className="text-base font-semibold flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">1</span>
                    Forum Title
                  </Label>
                  <Input
                    id="create-title"
                    placeholder="Enter an engaging title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    disabled={loading}
                    className="h-12 text-base border-2 focus:border-purple-500 transition-colors"
                  />
                  <p className="text-xs text-muted-foreground ml-1">Make it catchy and descriptive</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-content" className="text-base font-semibold flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">2</span>
                    Content
                  </Label>
                  <Textarea
                    id="create-content"
                    placeholder="Write your forum content here... Share your thoughts, ask questions, or start a discussion!"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    disabled={loading}
                    className="min-h-[180px] text-base border-2 focus:border-purple-500 transition-colors resize-none"
                  />
                  <p className="text-xs text-muted-foreground ml-1">Be clear and detailed to encourage engagement</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-image" className="text-base font-semibold flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">3</span>
                    Image Attachment
                    <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
                  </Label>
                  <div className="border-2 border-dashed border-border hover:border-purple-300 rounded-lg p-6 transition-colors bg-muted/20">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="text-center">
                        <Label htmlFor="create-image" className="cursor-pointer text-purple-600 hover:text-purple-700 font-medium">
                          Click to upload
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">or drag and drop</p>
                      </div>
                      <Input
                        id="create-image"
                        type="file"
                        accept="image/jpeg, image/png, image/jpg"
                        onChange={handleFileChange}
                        disabled={loading}
                        className="hidden"
                      />
                    </div>
                    {image && (
                      <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-700 dark:text-purple-400">{image.name}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground ml-1">Max file size: 2MB. Allowed formats: JPG, PNG.</p>
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-red-600 dark:text-red-400 text-xs font-bold">!</span>
                      </div>
                      <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
                    </div>
                  </div>
                )}
                
                {success && (
                  <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-green-600 dark:text-green-400 text-xs font-bold">✓</span>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-400 font-medium">{success}</p>
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      Creating Forum...
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5 mr-2" />
                      Create Forum Post
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ===== EDIT DIALOG ===== */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Forum Post</DialogTitle>
            <DialogDescription>
              Update the title, content, or image of this forum post.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                disabled={editLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                disabled={editLoading}
                className="min-h-[120px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-image">Replace Image (Optional)</Label>
              <Input
                id="edit-image"
                type="file"
                accept="image/jpeg, image/png, image/jpg"
                onChange={handleEditFileChange}
                disabled={editLoading}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to keep the current image. Max file size: 2MB.
              </p>
            </div>

            {/* Show current image */}
            {editingForum && getImageUrl(editingForum) && !editImage && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Current image:</p>
                <img
                  src={getImageUrl(editingForum)!}
                  alt="Current"
                  className="rounded-md max-h-32 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none"
                  }}
                />
              </div>
            )}

            {editError && <div className="text-red-500 text-sm font-medium">{editError}</div>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={editLoading}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={editLoading}>
              {editLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== DELETE FORUM CONFIRMATION ===== */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the forum post
              {deletingForum ? ` "${deletingForum.title}"` : ""} and all its comments.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? "Deleting..." : "Delete Forum"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ===== DELETE COMMENT CONFIRMATION ===== */}
      <AlertDialog open={deleteCommentDialogOpen} onOpenChange={setDeleteCommentDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Komentar?</AlertDialogTitle>
            <AlertDialogDescription>
              Komentar dari <strong>{deletingComment?.name || "Anonim"}</strong> akan dihapus secara permanen.
              {deletingComment && (
                <span className="block mt-2 text-xs italic truncate">
                  &quot;{deletingComment.content}&quot;
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCommentLoading}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteComment}
              disabled={deleteCommentLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCommentLoading ? "Menghapus..." : "Hapus Komentar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
