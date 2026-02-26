
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MappingName } from '@/constant/Mapping';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, CircleDot, MoreHorizontal,
  Tag, Trash, Trash2, Pencil
} from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { MarkdownEditor } from '../MarkdownEditor';
import { getTimeAgo, renderMarkdown } from '@/utils/helpers';

export function IssueTimelineEvent({ 
  event, 
  index, 
  isLast,
  currentUserLogin,
  editingCommentId,
  setEditingCommentId,
  startEditing,
  handleDeleteComment,
  editingCommentBody,
  setEditingCommentBody,
  handleUpdateComment,
  updateCommentPending,
  renderReactions
}: any) {
  if ((!event.event && event.body) || event.event === 'commented') {
    const user = event.user || event.actor;
    return (
      <div key={event.id || index} className="flex pb-8 relative z-10 group">
        <div className="relative mr-4 flex flex-col items-center flex-none w-10">
          <Avatar className="w-10 h-10 border border-[#d0d7de] z-10 bg-white">
            <AvatarImage src={user?.avatar_url || "https://github.com/shadcn.png"} />
            <AvatarFallback>{user?.login?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className={`absolute w-0.5 bg-[#d0d7de] z-0 left-4.75 ${isLast ? 'top-0 h-10' : 'top-0 -bottom-8'}`}></div>
        </div>
        <div className="flex-1 w-full border border-[#d0d7de] rounded-md overflow-hidden bg-white ">
          <div className="bg-[#f6f8fa] border-b border-[#d0d7de] px-4 py-2 flex items-center justify-between text-[#57606a] text-[13px]">
            <div className="flex items-center space-x-1.5">
              <span className="font-semibold text-[#24292f]">{MappingName[user?.login as keyof typeof MappingName] || user?.login}</span>
              <span>{getTimeAgo(event.created_at || event.updated_at)}</span>
            </div>
            <div className="flex items-center space-x-1">
              {user?.login === currentUserLogin && editingCommentId !== event.id && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-[#57606a] hover:text-[#24292f] p-1"><MoreHorizontal className="w-4 h-4" /></button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => startEditing(event)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => handleDeleteComment(event.id)}>
                      <Trash2 className="w-4 h-4 mr-2 text-red-600 focus:text-red-600" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          {editingCommentId === event.id ? (
            <div className="w-full relative focus-within:ring-2 focus-within:ring-[#0969da] focus-within:border-[#0969da] transition-all bg-white overflow-hidden rounded-b-md">
                <MarkdownEditor 
                  id={`edit-comment-${event.id}`}
                  value={editingCommentBody}
                  onChange={setEditingCommentBody}
                  placeholder="Leave a comment"
                  noBorder={true}
                />
              <div className="flex items-center justify-end p-3 bg-white space-x-2 border-t border-[#d0d7de]">
                <Button 
                  variant="outline"
                  onClick={() => setEditingCommentId(null)}
                  className="text-[#24292f] hover:bg-[#f3f4f6] bg-[#f6f8fa] font-semibold px-4 h-8 border-[#d0d7de]"
                >
                  Cancel
                </Button>
                <Button 
                  disabled={!editingCommentBody.trim() || updateCommentPending} 
                  onClick={handleUpdateComment}
                  className="bg-[#1f883d] hover:bg-[#1a7f37] text-white disabled:opacity-50 disabled:cursor-not-allowed font-semibold px-4 h-8"
                >
                  {updateCommentPending ? 'Updating...' : 'Update comment'}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div 
                className="p-4 text-[14px] text-[#24292f] prose prose-sm max-w-none wrap-break-word custom-markdown overflow-x-auto bg-white"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(event.body) }}
              />
              {renderReactions(event.id, event.reactions, event.id)}
            </>
          )}
        </div>
      </div>
    );
  }

  // Process other events
  const actor = MappingName[event.actor?.login as keyof typeof MappingName] || event.actor?.login;
  switch (event.event) {
    case 'labeled':
    case 'unlabeled':
      return (
        <div key={event.id || index} className="flex pb-4 relative z-10 pt-2 group">
          <div className="relative mr-4 flex flex-col items-center flex-none w-10">
            <div className="w-8 h-8 bg-[#e8eaec] rounded-full flex items-center justify-center border-4 border-white text-[#57606a] relative z-10 mt-1">
              <Tag className="w-3.5 h-3.5" />
            </div>
            <div className={`absolute w-0.5 bg-[#d0d7de] z-0 left-4.75 ${isLast ? '-top-2 h-11' : '-top-2 -bottom-4'}`}></div>
          </div>
          <div className="flex items-center flex-wrap gap-1 mt-1.25">
            <span className="font-semibold text-[#24292f] text-[13px] inline-flex items-center">
              <img src={event.actor?.avatar_url} className="w-5 h-5 rounded-full mr-1.5" />
              {actor}
            </span>
            <span className="text-[#57606a] text-[13px] ml-0.5">{event.event}</span>
            <span 
              className="px-2.5 py-[1.5px] text-[12px] font-semibold rounded-full border border-gray-200/50 shrink-0 text-white ml-0.5"
              style={{ backgroundColor: `#${event.label?.color || '24292f'}` }}
            >
              {event.label?.name}
            </span>
            <span className="text-[#57606a] text-[13px] ml-1">{getTimeAgo(event.created_at)}</span>
          </div>
        </div>
      );
    case 'assigned':
    case 'unassigned':
      return (
        <div key={event.id || index} className="flex pb-4 relative z-10 pt-2 group">
          <div className="relative mr-4 flex flex-col items-center flex-none w-10">
              <div className="w-8 h-8 bg-[#e8eaec] rounded-full flex items-center justify-center border-4 border-white text-[#57606a] relative z-10 mt-1">
              <span className="w-2.5 h-2.5 bg-[#57606a] rounded-full"></span>
            </div>
            <div className={`absolute w-0.5 bg-[#d0d7de] z-0 left-4.75 ${isLast ? '-top-2 h-11' : '-top-2 -bottom-4'}`}></div>
          </div>
          <div className="flex items-center flex-wrap gap-1 mt-1.25">
            <span className="font-semibold text-[#24292f] text-[13px] inline-flex items-center">
              <img src={event.actor?.avatar_url} className="w-5 h-5 rounded-full mr-1.5" />
              {actor}
            </span>
            <span className="text-[#57606a] text-[13px] mx-0.5">{event.event}</span>
            <span className="font-semibold text-[#24292f] text-[13px]">{MappingName[event.assignee?.login as keyof typeof MappingName] || event.assignee?.login}</span>
            <span className="text-[#57606a] text-[13px] ml-1">{getTimeAgo(event.created_at)}</span>
          </div>
        </div>
      );
    case 'closed':
    case 'reopened':
      return (
        <div key={event.id || index} className="flex pb-4 relative z-10 pt-2 group">
          <div className="relative mr-4 flex flex-col items-center flex-none w-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white text-white relative z-10 mt-1 ${event.event === 'closed' ? 'bg-[#8250df]' : 'bg-[#1a7f37]'}`}>
              {event.event === 'closed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <CircleDot className="w-3.5 h-3.5" />}
            </div>
            <div className={`absolute w-0.5 bg-[#d0d7de] z-0 left-4.75 ${isLast ? '-top-2 h-11' : '-top-2 -bottom-4'}`}></div>
          </div>
            <div className="flex items-center flex-wrap gap-1 mt-1.25">
            <span className="font-semibold text-[#24292f] text-[13px] inline-flex items-center">
              <img src={event.actor?.avatar_url} className="w-5 h-5 rounded-full mr-1.5" />
                {actor}
            </span>
            <span className="text-[#57606a] text-[13px] mx-0.5">{event.event} this</span>
            <span className="text-[#57606a] text-[13px] ml-1">{getTimeAgo(event.created_at)}</span>
          </div>
        </div>
      );
    case 'comment_deleted':
      return (
        <div key={event.id || index} className="flex pb-4 relative z-10 pt-2 group">
          <div className="relative mr-4 flex flex-col items-center flex-none w-10">
            <div className="w-8 h-8 bg-[#e8eaec] rounded-full flex items-center justify-center border-4 border-white text-[#57606a] relative z-10 mt-1">
              <Trash className="w-3.5 h-3.5" />
            </div>
            <div className={`absolute w-0.5 bg-[#d0d7de] z-0 left-4.75 ${isLast ? '-top-2 h-11' : '-top-2 -bottom-4'}`}></div>
          </div>
          <div className="flex items-center flex-wrap gap-1 mt-1.25">
            <span className="font-semibold text-[#24292f] text-[13px] inline-flex items-center">
              <img src={event.actor?.avatar_url} className="w-5 h-5 rounded-full mr-1.5" />
              {actor}
            </span>
            <span className="text-[#57606a] text-[13px] ml-0.5">deleted a comment</span>
            <span className="text-[#57606a] text-[13px] ml-1">{getTimeAgo(event.created_at)}</span>
          </div>
        </div>
      );
    case 'renamed':
      return (
        <div key={event.id || index} className="flex pb-4 relative z-10 pt-2 group">
          <div className="relative mr-4 flex flex-col items-center flex-none w-10">
            <div className="w-8 h-8 bg-[#e8eaec] rounded-full flex items-center justify-center border-4 border-white text-[#57606a] relative z-10 mt-1">
              <Pencil className="w-3.5 h-3.5" />
            </div>
            <div className={`absolute w-0.5 bg-[#d0d7de] z-0 left-4.75 ${isLast ? '-top-2 h-11' : '-top-2 -bottom-4'}`}></div>
          </div>
          <div className="flex items-center flex-wrap gap-1 mt-1.25">
            <span className="font-semibold text-[#24292f] text-[13px] inline-flex items-center">
              <img src={event.actor?.avatar_url} className="w-5 h-5 rounded-full mr-1.5" />
              {actor}
            </span>
            <span className="text-[#57606a] text-[13px] ml-0.5">changed the title</span>
             <span className="text-[#57606a] text-[13px] ml-0.5 line-through">{event.rename.from}</span>
              <span className="text-[#57606a] text-[13px] ml-0.5">{event.rename.to}</span>
            <span className="text-[#57606a] text-[13px] ml-1">{getTimeAgo(event.created_at)}</span>
          </div>
        </div>
      );
    default:
      return null;
  }
}
