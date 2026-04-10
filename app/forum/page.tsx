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
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No forum posts yet.</p>
                  <p className="text-sm mt-1">Switch to the &quot;Create Forum&quot; tab to create your first post.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {forums.map((forum) => (
                    <div
                      key={forum.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base truncate">{forum.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {forum.content}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>{getCreatedAt(forum)}</span>
                            <button
                              onClick={() => toggleComments(forum.id)}
                              className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
                            >
                              <MessageCircle className="h-3 w-3" />
                              {getCommentCount(forum)} comments
                              {expandedForumId === forum.id ? (
                                <ChevronUp className="h-3 w-3" />
                              ) : (
                                <ChevronDown className="h-3 w-3" />
                              )}
                            </button>
                            {getImageUrl(forum) && (
                              <span className="flex items-center gap-1">
                                <ImageIcon className="h-3 w-3" />
                                Has image
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(forum)}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openDeleteDialog(forum)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>

                      {/* Show image preview if exists */}
                      {getImageUrl(forum) && (
                        <div className="mt-3">
                          <img
                            src={getImageUrl(forum)!}
                            alt={forum.title}
                            className="rounded-md max-h-48 object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none"
                            }}
                          />
                        </div>
                      )}

                      {/* ===== COMMENTS SECTION ===== */}
                      {expandedForumId === forum.id && (
                        <div className="mt-4 border-t pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium flex items-center gap-1.5">
                              <MessageCircle className="h-4 w-4" />
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
                            <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Loading comments...
                            </div>
                          ) : (comments[forum.id] || []).length === 0 ? (
                            <div className="text-center py-6 text-sm text-muted-foreground">
                              Belum ada komentar di forum ini.
                            </div>
                          ) : (
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                              {(comments[forum.id] || []).map((comment) => (
                                <div
                                  key={comment.id}
                                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 group"
                                >
                                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium">
                                        {comment.name || "Anonim"}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {formatCommentDate(comment.created_at)}
                                      </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-0.5 break-words">
                                      {comment.content}
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => openDeleteCommentDialog(comment)}
                                    title="Delete comment"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== CREATE TAB ===== */}
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create Mini Forum
              </CardTitle>
              <CardDescription>
                Post a new topic to the mini forum.
                <span className="block mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                  ✅ Sebagai admin, Anda bisa membuat forum kapan saja. User biasa hanya bisa posting jam 07:00–09:00 WIB.
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="create-title">Forum Title</Label>
                  <Input
                    id="create-title"
                    placeholder="Enter an engaging title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-content">Content</Label>
                  <Textarea
                    id="create-content"
                    placeholder="Write your forum content here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    disabled={loading}
                    className="min-h-[150px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-image">Image Attachment (Optional)</Label>
                  <Input
                    id="create-image"
                    type="file"
                    accept="image/jpeg, image/png, image/jpg"
                    onChange={handleFileChange}
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">Max file size: 2MB. Allowed formats: JPG, PNG.</p>
                </div>

                {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
                {success && <div className="text-green-600 text-sm font-medium">{success}</div>}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating Forum..." : "Create Forum Post"}
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
