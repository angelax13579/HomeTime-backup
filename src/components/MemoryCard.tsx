import { Memory } from '@/types/family';
import { format } from 'date-fns';
import { Lock, Users, User } from 'lucide-react';
import { DiceBearAvatar } from './DiceBearAvatar';
import { useFamily } from '@/contexts/FamilyContext';

interface MemoryCardProps {
  memory: Memory;
}

const visibilityIcons = {
  private: Lock,
  family: Users,
  specific: User,
};

export function MemoryCard({ memory }: MemoryCardProps) {
  const { familyMembers, user } = useFamily();
  const VisibilityIcon = visibilityIcons[memory.visibility];
  
  const author = memory.authorId === user.id 
    ? { name: 'You', avatarConfig: user.avatarConfig }
    : familyMembers.find(m => m.id === memory.authorId);

  return (
    <article className="p-5 bg-card rounded-2xl shadow-card border border-border/30 animate-fade-in">
      <header className="flex items-center gap-3 mb-4">
        <DiceBearAvatar
          config={author?.avatarConfig}
          name={memory.authorName}
          size="sm"
        />
        <div className="flex-1">
          <p className="font-display font-semibold text-foreground">
            {memory.authorName}
          </p>
          <p className="text-xs text-muted-foreground">
            {format(memory.createdAt, 'MMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <VisibilityIcon className="w-4 h-4" />
        </div>
      </header>
      
      <p className="text-foreground leading-relaxed mb-4">
        {memory.content}
      </p>
      
      {memory.photos.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {memory.photos.map((photo, index) => (
            <img
              key={index}
              src={photo}
              alt={`Memory photo ${index + 1}`}
              className="w-full h-32 object-cover rounded-xl"
            />
          ))}
        </div>
      )}
      
      {memory.promptId && (
        <div className="pt-3 border-t border-border/50">
          <span className="text-xs text-muted-foreground italic">
            Responding to a reflection prompt
          </span>
        </div>
      )}
    </article>
  );
}
