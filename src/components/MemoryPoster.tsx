import { useState } from 'react';
import { Memory } from '@/types/family';
import { format } from 'date-fns';
import { Lock, Users, User, Smile, MessageCircle, Send, Trash2 } from 'lucide-react';
import { useFamily } from '@/contexts/FamilyContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface MemoryPosterProps {
  memory: Memory;
  rotation?: number;
}

const visibilityIcons = {
  private: Lock,
  family: Users,
  specific: User,
};

const EMOJI_OPTIONS = ['❤️', '😊', '😢', '🙏', '🥰', '😂', '👏', '💕'];

export function MemoryPoster({ memory, rotation = 0 }: MemoryPosterProps) {
  const { familyMembers, user, addReaction, removeReaction, addComment, deleteMemory } = useFamily();
  const [isOpen, setIsOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const VisibilityIcon = visibilityIcons[memory.visibility];
  
  const isAuthor = memory.authorId === user.id;
  
  const author = memory.authorId === user.id 
    ? { name: 'You', avatarConfig: user.avatarConfig }
    : familyMembers.find(m => m.id === memory.authorId);

  const hasPhoto = memory.photos.length > 0;
  const authorName = memory.authorName;

  const userReaction = memory.reactions.find(r => r.userId === user.id);
  const reactionCounts = memory.reactions.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleReaction = (emoji: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (userReaction?.emoji === emoji) {
      removeReaction(memory.id);
    } else {
      addReaction(memory.id, emoji);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      addComment(memory.id, commentText.trim());
      setCommentText('');
    }
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleDelete = async () => {
    await deleteMemory(memory.id);
    setIsOpen(false);
  };

  return (
    <>
      <article 
        className="relative group cursor-pointer"
        style={{ transform: `rotate(${rotation}deg)` }}
        onClick={() => setIsOpen(true)}
      >
        {/* Push pin */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 w-5 h-5 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-lg border-2 border-red-300">
          <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-white/60" />
        </div>

        {/* Paper shadow */}
        <div className="absolute inset-0 bg-foreground/10 rounded-sm translate-x-1 translate-y-1" />

        {/* Poster card */}
        <div className={`relative overflow-hidden ${hasPhoto ? 'bg-card' : 'bg-cream'} rounded-sm shadow-card border border-border/20 transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lg`}>
          {hasPhoto ? (
            <>
              {/* Photo poster - shows only photo, hover reveals text */}
              <div className="relative aspect-[3/4]">
                <img
                  src={memory.photos[0]}
                  alt="Memory"
                  className="w-full h-full object-cover"
                />
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-4">
                  <p className="text-white text-xs text-center">
                    Click to see what <span className="font-semibold">{authorName}</span> says about this moment
                  </p>
                </div>

                {/* Reaction/Comment indicators */}
                <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                  {Object.entries(reactionCounts).slice(0, 2).map(([emoji, count]) => (
                    <span key={emoji} className="px-1.5 py-0.5 bg-black/40 rounded-full text-[10px] text-white">
                      {emoji} {count}
                    </span>
                  ))}
                  {memory.comments.length > 0 && (
                    <span className="px-1.5 py-0.5 bg-black/40 rounded-full text-[10px] text-white flex items-center gap-0.5">
                      <MessageCircle className="w-2.5 h-2.5" /> {memory.comments.length}
                    </span>
                  )}
                </div>

                {/* Date badge - always visible */}
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/40 rounded-full">
                  <span className="text-white/90 text-[10px]">
                    {format(memory.createdAt, 'MMM d')}
                  </span>
                </div>

                {/* Visibility icon */}
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black/30 flex items-center justify-center">
                  <VisibilityIcon className="w-3 h-3 text-white/80" />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Text-only poster - notebook paper style */}
              <div className="relative aspect-[3/4] p-4 flex flex-col">
                {/* Paper lines */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(12)].map((_, i) => (
                    <div 
                      key={i} 
                      className="absolute left-4 right-4 border-b border-primary/10"
                      style={{ top: `${20 + i * 7}%` }}
                    />
                  ))}
                  {/* Red margin line */}
                  <div className="absolute top-0 bottom-0 left-8 w-px bg-red-300/50" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex-1 flex flex-col pt-2">
                  <p className="text-foreground text-sm leading-relaxed line-clamp-5 font-body">
                    {memory.content}
                  </p>
                </div>

                {/* Reaction/Comment counts */}
                <div className="relative z-10 flex items-center gap-1.5 mb-2">
                  {Object.entries(reactionCounts).slice(0, 3).map(([emoji, count]) => (
                    <span key={emoji} className="text-[10px]">
                      {emoji} {count}
                    </span>
                  ))}
                  {memory.comments.length > 0 && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <MessageCircle className="w-2.5 h-2.5" /> {memory.comments.length}
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div className="relative z-10 pt-2 mt-auto border-t border-border/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground/80">
                      {memory.authorName}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <VisibilityIcon className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">
                        {format(memory.createdAt, 'MMM d')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Prompt indicator */}
                {memory.promptId && (
                  <div className="absolute top-2 right-2">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </article>

      {/* Memory Detail Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden max-h-[90vh] flex flex-col">
          {hasPhoto && (
            <div className="relative aspect-video flex-shrink-0">
              <img
                src={memory.photos[0]}
                alt="Memory"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            <p className="text-foreground leading-relaxed">
              {memory.content}
            </p>
            
            {/* Author & Date */}
            <div className="flex items-center justify-between pt-2 border-t border-border/30">
              <span className="text-sm font-medium text-foreground">
                {memory.authorName}
              </span>
              <div className="flex items-center gap-2 text-muted-foreground">
                <VisibilityIcon className="w-4 h-4" />
                <span className="text-sm">
                  {format(memory.createdAt, 'MMM d, yyyy')}
                </span>
                
                {/* Delete button - only for author */}
                {isAuthor && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Memory</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this memory? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>

            {/* Reactions */}
            <div className="flex items-center gap-2 flex-wrap">
              {Object.entries(reactionCounts).map(([emoji, count]) => (
                <button
                  key={emoji}
                  onClick={(e) => handleReaction(emoji, e)}
                  className={`px-2.5 py-1 rounded-full text-sm flex items-center gap-1 transition-colors ${
                    userReaction?.emoji === emoji
                      ? 'bg-primary/20 border border-primary'
                      : 'bg-secondary hover:bg-secondary/80 border border-transparent'
                  }`}
                >
                  {emoji} <span className="text-xs text-muted-foreground">{count}</span>
                </button>
              ))}
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-full h-8 px-3">
                    <Smile className="w-4 h-4 mr-1" />
                    React
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" onClick={stopPropagation}>
                  <div className="flex gap-1">
                    {EMOJI_OPTIONS.map(emoji => (
                      <button
                        key={emoji}
                        onClick={(e) => handleReaction(emoji, e)}
                        className={`p-2 rounded-lg hover:bg-secondary transition-colors text-lg ${
                          userReaction?.emoji === emoji ? 'bg-primary/20' : ''
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full h-8 px-3"
                onClick={() => setShowComments(!showComments)}
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Reply {memory.comments.length > 0 && `(${memory.comments.length})`}
              </Button>
            </div>

            {/* Comments Section */}
            {showComments && (
              <div className="space-y-3 pt-2 border-t border-border/30 animate-fade-in">
                {/* Existing Comments */}
                {memory.comments.length > 0 && (
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {memory.comments.map(comment => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium">{comment.authorName.charAt(0)}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{comment.authorName}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {format(new Date(comment.createdAt), 'MMM d')}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <Input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 rounded-full text-sm h-9"
                  />
                  <Button type="submit" size="sm" variant="warm" className="rounded-full h-9 px-3">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
