import { useCallback, useEffect, useState } from 'react'
import { Edit3, Loader2, MessageSquare, Reply, Save, Send, Trash2, X } from 'lucide-react'
import { toast } from '../../../components/common/Toast'
import commentsService from '../../../apis/services/workspace/comments.service'
import {
  extractList,
  extractPagination,
  formatDate,
  getDisplayName,
  getErrorMessage,
  getStoredOrgId,
  withOrgId,
} from '../workspaceUtils'

function normalizeComment(comment) {
  if (!comment || typeof comment !== 'object') return null
  const author = comment.author || comment.createdBy || comment.user || null
  return {
    id: comment.id || comment.commentId || comment._id || '',
    body: comment.body || comment.comment || '',
    authorName: getDisplayName(author) || 'Team member',
    targetType: comment.targetType || '',
    targetId: comment.targetId || '',
    projectId: comment.projectId || '',
    createdAt: comment.createdAt || comment.created_at || '',
    raw: comment,
  }
}

export default function CommentsPanel({ targetType, targetId, title = 'Comments', compact = false }) {
  const [comments, setComments] = useState([])
  const [body, setBody] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(compact ? 5 : 10)
  const [pagination, setPagination] = useState({ page: 1, limit, total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [editingId, setEditingId] = useState('')
  const [editingBody, setEditingBody] = useState('')
  const [updatingId, setUpdatingId] = useState('')
  const [replyTo, setReplyTo] = useState(null)

  const fetchComments = useCallback(async () => {
    if (!targetType || !targetId) return
    try {
      setLoading(true)
      const response = await commentsService.list({
        page,
        limit,
        targetType,
        targetId,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
        orgId: getStoredOrgId() || undefined,
      })
      const items = extractList(response, 'comments')
        .map(normalizeComment)
        .filter((comment) => comment?.id)
      setComments(items)
      setPagination(extractPagination(response, limit, items.length))
    } catch (error) {
      toast.error('Failed to load comments', getErrorMessage(error, 'Failed to load comments.'))
    } finally {
      setLoading(false)
    }
  }, [limit, page, targetId, targetType])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  useEffect(() => {
    setPage(1)
    setEditingId('')
    setEditingBody('')
  }, [targetId, targetType])

  const handleCreate = async (event) => {
    event.preventDefault()
    if (!body.trim()) return
    try {
      setSaving(true)
      await commentsService.create(withOrgId({
        body: replyTo ? `@${replyTo.authorName} ${body.trim()}` : body.trim(),
        targetType,
        targetId,
      }))
      setBody('')
      setReplyTo(null)
      await fetchComments()
    } catch (error) {
      toast.error('Comment Failed', getErrorMessage(error, 'Failed to save comment.'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (comment) => {
    try {
      setDeletingId(comment.id)
      await commentsService.delete(comment.id)
      setComments((current) => current.filter((item) => item.id !== comment.id))
    } catch (error) {
      toast.error('Delete Failed', getErrorMessage(error, 'Failed to delete comment.'))
    } finally {
      setDeletingId('')
    }
  }

  const startEdit = (comment) => {
    setEditingId(comment.id)
    setEditingBody(comment.body)
  }

  const cancelEdit = () => {
    setEditingId('')
    setEditingBody('')
  }

  const handleUpdate = async (comment) => {
    if (!editingBody.trim()) {
      toast.warning('Validation Error', 'Comment cannot be empty.')
      return
    }
    try {
      setUpdatingId(comment.id)
      await commentsService.update(comment.id, { body: editingBody.trim() })
      cancelEdit()
      await fetchComments()
    } catch (error) {
      toast.error('Update Failed', getErrorMessage(error, 'Failed to update comment.'))
    } finally {
      setUpdatingId('')
    }
  }

  const startReply = (comment) => {
    setReplyTo(comment)
    setBody('')
  }

  const cancelReply = () => {
    setReplyTo(null)
    setBody('')
  }

  return (
    <div className="rounded-xl border border-surface-200 bg-white">
      <div className="flex items-center justify-between border-b border-surface-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-blue-600" />
          <p className="text-sm font-semibold text-ink">{title}</p>
          {pagination.total > 0 && (
            <span className="rounded-full bg-surface-100 px-2 py-0.5 text-[11px] font-semibold text-ink-muted">
              {pagination.total}
            </span>
          )}
        </div>
        {loading && <Loader2 size={15} className="animate-spin text-blue-600" />}
      </div>

      <div className={`${compact ? 'max-h-72' : 'max-h-96'} overflow-y-auto p-4`}>
        {comments.length === 0 ? (
          <p className="rounded-lg bg-surface-100 px-3 py-4 text-center text-sm text-ink-muted">No comments yet.</p>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="rounded-lg border border-surface-100 bg-surface-50 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-ink">{comment.authorName}</p>
                    <p className="mt-0.5 text-[11px] text-ink-muted">{formatDate(comment.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {editingId === comment.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleUpdate(comment)}
                          className="rounded-lg p-1.5 text-ink-muted transition hover:bg-emerald-50 hover:text-emerald-600"
                          title="Save comment"
                        >
                          {updatingId === comment.id ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="rounded-lg p-1.5 text-ink-muted transition hover:bg-surface-100 hover:text-ink"
                          title="Cancel edit"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startReply(comment)}
                          className="rounded-lg p-1.5 text-ink-muted transition hover:bg-violet-50 hover:text-violet-600"
                          title="Reply"
                        >
                          <Reply size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => startEdit(comment)}
                          className="rounded-lg p-1.5 text-ink-muted transition hover:bg-blue-50 hover:text-blue-600"
                          title="Edit comment"
                        >
                          <Edit3 size={14} />
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(comment)}
                      className="rounded-lg p-1.5 text-ink-muted transition hover:bg-red-50 hover:text-red-600"
                      title="Delete comment"
                    >
                      {deletingId === comment.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
                {editingId === comment.id ? (
                  <textarea
                    value={editingBody}
                    onChange={(event) => setEditingBody(event.target.value)}
                    rows={3}
                    className="mt-3 w-full resize-none rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                ) : (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-ink">{comment.body}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-surface-100 px-4 py-3 text-sm">
          <span className="text-xs text-ink-muted">Page {page} of {pagination.totalPages}</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={page <= 1 || loading}
              className="rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-semibold text-ink-muted transition hover:bg-surface-50 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => setPage((value) => value + 1)}
              disabled={page >= pagination.totalPages || loading}
              className="rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-semibold text-ink-muted transition hover:bg-surface-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleCreate} className="border-t border-surface-100 p-3">
        {replyTo && (
          <div className="mb-2 flex items-center justify-between gap-3 rounded-lg border border-violet-100 bg-violet-50 px-3 py-2 text-xs text-violet-800">
            <span className="min-w-0 truncate">Replying to <span className="font-semibold">{replyTo.authorName}</span></span>
            <button
              type="button"
              onClick={cancelReply}
              className="rounded-md p-1 transition hover:bg-white/70"
              title="Cancel reply"
            >
              <X size={13} />
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Write a comment..."
            className="min-w-0 flex-1 rounded-lg border border-surface-200 px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          <button
            type="submit"
            disabled={saving || !body.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          </button>
        </div>
      </form>
    </div>
  )
}
