import { Reminder, FamilyMember } from '@/types/family';
import { differenceInDays, format } from 'date-fns';
import { Calendar, Gift, Heart, Users } from 'lucide-react';

interface ReminderCardProps {
  reminder: Reminder;
  familyMember?: FamilyMember;
}

const typeIcons = {
  birthday: Gift,
  anniversary: Heart,
  visit: Users,
  activity: Calendar,
  custom: Calendar,
};

const typeColors = {
  birthday: 'bg-primary/10 text-primary',
  anniversary: 'bg-family-spouse/10 text-family-spouse',
  visit: 'bg-family-sibling/10 text-family-sibling',
  activity: 'bg-family-child/10 text-family-child',
  custom: 'bg-muted text-muted-foreground',
};

export function ReminderCard({ reminder, familyMember }: ReminderCardProps) {
  const Icon = typeIcons[reminder.type];
  const daysUntil = differenceInDays(reminder.date, new Date());
  
  const getDaysText = () => {
    if (daysUntil === 0) return 'Today';
    if (daysUntil === 1) return 'Tomorrow';
    if (daysUntil < 0) return 'Passed';
    return `${daysUntil} days`;
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-card rounded-xl shadow-card border border-border/30 animate-fade-in">
      <div className={`p-3 rounded-xl ${typeColors[reminder.type]}`}>
        <Icon className="w-5 h-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-display font-semibold text-foreground truncate">
          {reminder.title}
        </h4>
        <p className="text-sm text-muted-foreground">
          {format(reminder.date, 'MMM d, yyyy')}
        </p>
      </div>
      
      <div className="text-right">
        <span className={`text-sm font-semibold ${daysUntil <= 7 ? 'text-primary' : 'text-muted-foreground'}`}>
          {getDaysText()}
        </span>
      </div>
    </div>
  );
}
