import { FamilyMember } from '@/types/family';
import { DiceBearAvatar } from './DiceBearAvatar';
import { useNavigate } from 'react-router-dom';

interface FamilyMemberCardProps {
  member: FamilyMember;
}

const relationshipLabels: Record<string, string> = {
  parent: 'Parent',
  child: 'Child',
  sibling: 'Sibling',
  grandparent: 'Grandparent',
  spouse: 'Spouse',
  other: 'Family',
};

export function FamilyMemberCard({ member }: FamilyMemberCardProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/family/${member.id}`)}
      className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-secondary/50 transition-all duration-200 active:scale-95 min-w-[80px]"
    >
      <DiceBearAvatar
        config={member.avatarConfig}
        name={member.name}
        relationship={member.relationship}
        size="lg"
      />
      <div className="text-center">
        <p className="font-display font-semibold text-foreground text-sm truncate max-w-[70px]">
          {member.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {relationshipLabels[member.relationship]}
        </p>
      </div>
    </button>
  );
}
