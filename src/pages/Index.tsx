import { useState } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { FamilyMemberCard } from '@/components/FamilyMemberCard';
import { ReminderCard } from '@/components/ReminderCard';
import { PromptCard } from '@/components/PromptCard';
import { BottomNav } from '@/components/BottomNav';
import { AddFamilyMemberModal } from '@/components/AddFamilyMemberModal';
import { Button } from '@/components/ui/button';
import { Plus, Heart } from 'lucide-react';
import { differenceInDays } from 'date-fns';

export default function Index() {
  const { familyMembers, reminders, prompts } = useFamily();
  const [showAddModal, setShowAddModal] = useState(false);

  const upcomingReminders = reminders
    .filter((r) => differenceInDays(r.date, new Date()) >= 0)
    .sort((a, b) => differenceInDays(a.date, new Date()) - differenceInDays(b.date, new Date()))
    .slice(0, 3);

  const todaysPrompt = prompts[Math.floor(Date.now() / 86400000) % prompts.length];

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/30">
        <div className="px-5 py-4 flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center shadow-soft">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-foreground">Kindred</h1>
              <p className="text-xs text-muted-foreground">Family Moments</p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-5 py-6 max-w-lg mx-auto space-y-8">
        {/* Family Members Section */}
        <section className="animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg text-foreground">
              Your Family
            </h2>
            <Button
              variant="soft"
              size="sm"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
            {familyMembers.map((member) => (
              <FamilyMemberCard key={member.id} member={member} />
            ))}
            
            {familyMembers.length === 0 && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed border-primary/30 text-primary hover:bg-primary/5 transition-colors min-w-[120px]"
              >
                <Plus className="w-8 h-8" />
                <span className="text-sm font-medium">Add Family</span>
              </button>
            )}
          </div>
        </section>

        {/* Today's Prompt */}
        {todaysPrompt && (
          <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <PromptCard prompt={todaysPrompt} allPrompts={prompts} />
          </section>
        )}

        {/* Upcoming Reminders */}
        <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="font-display font-bold text-lg text-foreground mb-4">
            Together Time
          </h2>
          
          <div className="space-y-3">
            {upcomingReminders.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                familyMember={familyMembers.find((m) => m.id === reminder.familyMemberId)}
              />
            ))}
            
            {upcomingReminders.length === 0 && (
              <div className="p-6 bg-card rounded-2xl border border-border/30 text-center">
                <p className="text-muted-foreground text-sm">
                  No upcoming events. Plan something special with your family!
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <BottomNav />
      
      <AddFamilyMemberModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
      />
    </div>
  );
}
