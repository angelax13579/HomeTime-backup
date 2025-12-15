import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFamily } from '@/contexts/FamilyContext';
import { DiceBearAvatar } from '@/components/DiceBearAvatar';
import { BottomNav } from '@/components/BottomNav';
import { TimeLeftTogether } from '@/components/TimeLeftTogether';
import { EditFamilyMemberModal } from '@/components/EditFamilyMemberModal';
import { InviteFamilyMemberModal } from '@/components/InviteFamilyMemberModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ChevronLeft, Calendar, Heart, Edit, UserPlus } from 'lucide-react';
import { differenceInYears, differenceInDays, format } from 'date-fns';

const relationshipLabels: Record<string, string> = {
  parent: 'Parent',
  child: 'Child',
  sibling: 'Sibling',
  grandparent: 'Grandparent',
  spouse: 'Spouse',
  other: 'Family',
};

export default function FamilyProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { familyMembers, updateFamilyMember } = useFamily();
  
  const member = familyMembers.find((m) => m.id === id);
  const [showInDays, setShowInDays] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Family member not found</p>
      </div>
    );
  }

  const age = differenceInYears(new Date(), member.dateOfBirth);
  const timeTogether = showInDays
    ? differenceInDays(new Date(), member.togetherSince)
    : differenceInYears(new Date(), member.togetherSince);
  const timeUnit = showInDays ? 'days' : 'years';

  const handleDeleted = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="relative">
        <div className="h-32 gradient-warm" />
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowEditModal(true)}
            className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground"
          >
            <Edit className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Avatar */}
        <div className="flex justify-center -mt-12">
          <div className="p-1 rounded-full bg-background shadow-soft">
            <DiceBearAvatar
              config={member.avatarConfig}
              name={member.name}
              relationship={member.relationship}
              size="xl"
            />
          </div>
        </div>
      </header>

      <main className="px-5 py-6 max-w-lg mx-auto">
        {/* Name & Relationship */}
        <div className="text-center mb-6">
          <h1 className="font-display font-bold text-2xl text-foreground mb-1">
            {member.name}
          </h1>
          <p className="text-muted-foreground mb-3">
            {relationshipLabels[member.relationship]}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInviteModal(true)}
            className="gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Invite {member.name}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {member.showAge && (
            <Card className="animate-slide-up">
              <CardContent className="p-5 text-center">
                <Calendar className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="font-display font-bold text-2xl text-foreground">
                  {age}
                </p>
                <p className="text-sm text-muted-foreground">years old</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Born {format(member.dateOfBirth, 'MMM d, yyyy')}
                </p>
              </CardContent>
            </Card>
          )}
          
          <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <CardContent className="p-5 text-center">
              <Heart className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="font-display font-bold text-2xl text-foreground">
                {timeTogether.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">{timeUnit} together</p>
              <p className="text-xs text-muted-foreground mt-1">
                Since {format(member.togetherSince, 'MMM d, yyyy')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Time Left Together - Optional Reflective Feature */}
        <div className="mb-6 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <TimeLeftTogether 
            member={member}
            onUpdate={(updates) => updateFamilyMember(member.id, updates)}
          />
        </div>

        {/* Settings */}
        <Card className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <CardContent className="p-5 space-y-5">
            <h3 className="font-display font-semibold text-foreground">Display Settings</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-medium">Show in Days</Label>
                <p className="text-xs text-muted-foreground">
                  Display time together in days instead of years
                </p>
              </div>
              <Switch
                checked={showInDays}
                onCheckedChange={setShowInDays}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-medium">Show Age</Label>
                <p className="text-xs text-muted-foreground">
                  Display age on this profile
                </p>
              </div>
              <Switch
                checked={member.showAge}
                onCheckedChange={(checked) => 
                  updateFamilyMember(member.id, { showAge: checked })
                }
              />
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Edit Modal */}
      <EditFamilyMemberModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        member={member}
        onDeleted={handleDeleted}
      />

      {/* Invite Modal */}
      <InviteFamilyMemberModal
        open={showInviteModal}
        onOpenChange={setShowInviteModal}
        member={member}
      />

      <BottomNav />
    </div>
  );
}
