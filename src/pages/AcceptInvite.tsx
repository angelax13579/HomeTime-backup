import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, UserPlus, Heart, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

export default function AcceptInvite() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [invitation, setInvitation] = useState<{ familyMemberName: string; relation: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (inviteCode) {
      fetchInvitation();
    }
  }, [inviteCode]);

  const fetchInvitation = async () => {
    try {
      // Use edge function to validate and fetch invitation details server-side
      const { data, error } = await supabase.functions.invoke('get-invitation-details', {
        body: { inviteCode }
      });

      if (error) throw error;
      if (data.error) {
        setError(data.error);
        return;
      }

      setInvitation({
        familyMemberName: data.familyMemberName,
        relation: data.relation
      });
    } catch (err: any) {
      console.error('Error fetching invitation:', err);
      setError('Invalid or expired invitation link.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!user) {
      // Store invite code and redirect to auth
      localStorage.setItem('pendingInviteCode', inviteCode!);
      navigate('/auth?redirect=/invite/' + inviteCode);
      return;
    }

    setAccepting(true);
    try {
      const { data, error } = await supabase.functions.invoke('accept-invitation', {
        body: { inviteCode }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast.success('Welcome to the family! 🎉');
      navigate('/');
    } catch (err: any) {
      console.error('Error accepting invitation:', err);
      toast.error(err.message || 'Failed to accept invitation');
    } finally {
      setAccepting(false);
    }
  };

  // Check for pending invite after auth
  useEffect(() => {
    if (user && !authLoading) {
      const pendingCode = localStorage.getItem('pendingInviteCode');
      if (pendingCode && pendingCode === inviteCode) {
        localStorage.removeItem('pendingInviteCode');
        handleAccept();
      }
    }
  }, [user, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle>Invitation Not Found</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">You're Invited!</CardTitle>
          <CardDescription className="text-base">
            {invitation?.familyMemberName || 'A family member'} wants to share memories with you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">You'll be joining as</p>
            <p className="font-semibold text-lg">{invitation?.familyMemberName}'s Family</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600">✓</span>
              </div>
              <span>Share memories together</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600">✓</span>
              </div>
              <span>See all family memories</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600">✓</span>
              </div>
              <span>React and comment on memories</span>
            </div>
          </div>

          <Button
            onClick={handleAccept}
            disabled={accepting}
            className="w-full"
            size="lg"
          >
            {accepting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Joining...
              </>
            ) : user ? (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Accept Invitation
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Sign Up to Join
              </>
            )}
          </Button>

          {!user && (
            <p className="text-xs text-muted-foreground text-center">
              Already have an account?{' '}
              <a href={`/auth?redirect=/invite/${inviteCode}`} className="text-primary underline">
                Log in
              </a>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}