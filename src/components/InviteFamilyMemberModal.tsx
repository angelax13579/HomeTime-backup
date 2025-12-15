import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FamilyMember } from '@/types/family';
import { DiceBearAvatar } from './DiceBearAvatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import { Copy, Check, Share2, Loader2 } from 'lucide-react';

interface InviteFamilyMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: FamilyMember;
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function InviteFamilyMemberModal({ open, onOpenChange, member }: InviteFamilyMemberModalProps) {
  const { user } = useAuth();
  const [inviteLink, setInviteLink] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [existingInvite, setExistingInvite] = useState<any>(null);

  useEffect(() => {
    if (open && member && user) {
      checkExistingInvite();
    }
  }, [open, member, user]);

  const checkExistingInvite = async () => {
    if (!user || !member) return;

    const { data, error } = await supabase
      .from('family_invitations')
      .select('*')
      .eq('family_member_id', member.id)
      .eq('inviter_user_id', user.id)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (data && !error) {
      setExistingInvite(data);
      setInviteLink(`${window.location.origin}/invite/${data.invite_code}`);
    } else {
      setExistingInvite(null);
      setInviteLink('');
    }
  };

  const generateInviteLink = async () => {
    if (!user || !member) return;

    setIsGenerating(true);
    try {
      const inviteCode = generateInviteCode();
      
      const { data, error } = await supabase
        .from('family_invitations')
        .insert({
          inviter_user_id: user.id,
          family_member_id: member.id,
          invite_code: inviteCode,
        })
        .select()
        .single();

      if (error) throw error;

      const link = `${window.location.origin}/invite/${inviteCode}`;
      setInviteLink(link);
      setExistingInvite(data);
      toast.success('Invite link created!');
    } catch (error: any) {
      console.error('Error creating invite:', error);
      toast.error('Failed to create invite link');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join my family on Mementos`,
          text: `${member.name} wants to share memories with you! Click to join:`,
          url: inviteLink,
        });
      } catch (error) {
        // User cancelled or share failed
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-4 rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-center">
            Invite {member.name}
          </DialogTitle>
          <DialogDescription className="text-center">
            Share this link with {member.name} so they can join your family memory board.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Avatar */}
          <div className="flex justify-center">
            <DiceBearAvatar
              config={member.avatarConfig}
              name={member.name}
              relationship={member.relationship}
              size="xl"
            />
          </div>

          {/* Generate or Show Link */}
          {!inviteLink ? (
            <Button
              onClick={generateInviteLink}
              disabled={isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-2" />
                  Generate Invite Link
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Invite Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={inviteLink}
                    readOnly
                    className="rounded-xl text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyToClipboard}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                onClick={shareLink}
                className="w-full"
                size="lg"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Link
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                This link expires in 7 days. When {member.name} accepts, you'll both be able to share memories together!
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}