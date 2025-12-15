import { useFamily } from '@/contexts/FamilyContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { DiceBearAvatar } from '@/components/DiceBearAvatar';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { User, Settings, Crown, Lock, Users, ChevronRight, Sparkles, LogOut, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user: familyUser, updateUser, familyMembers } = useFamily();
  const { user: authUser, signOut } = useAuth();
  const { isAdmin } = useAdminAuth();
  const navigate = useNavigate();

  const handleUpgrade = () => {
    toast.info('Premium subscription coming soon!', {
      description: 'Unlock unlimited family members, advanced features, and more.',
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
    toast.success('Signed out successfully');
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="relative">
        <div className="h-24 gradient-warm" />
        
        {/* Avatar */}
        <div className="flex justify-center -mt-10">
          <div className="p-1 rounded-full bg-background shadow-soft">
            <DiceBearAvatar
              config={familyUser.avatarConfig}
              name={familyUser.name}
              size="xl"
            />
          </div>
        </div>
      </header>

      <main className="px-5 py-6 max-w-lg mx-auto space-y-6">
        {/* Name & Email */}
        <div className="text-center">
          <h1 className="font-display font-bold text-xl text-foreground mb-1">
            {familyUser.name}
          </h1>
          <p className="text-sm text-muted-foreground">{authUser?.email || familyUser.email}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {familyMembers.length} family members
          </p>
        </div>

        {/* Premium Card */}
        {!familyUser.isPremium && (
          <Card className="overflow-hidden animate-slide-up">
            <div className="gradient-sunset p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-5 h-5 text-primary-foreground" />
                    <span className="font-display font-bold text-primary-foreground">
                      Kindred Premium
                    </span>
                  </div>
                  <p className="text-sm text-primary-foreground/80 mb-3">
                    Unlimited family members, advanced features & more
                  </p>
                  <Button
                    onClick={handleUpgrade}
                    className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-0"
                    size="sm"
                  >
                    <Sparkles className="w-4 h-4 mr-1" />
                    $0.99/month
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Settings */}
        <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="w-5 h-5 text-primary" />
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Default Post Visibility</Label>
              <Select 
                value={familyUser.defaultVisibility} 
                onValueChange={(v) => updateUser({ defaultVisibility: v as 'private' | 'family' | 'specific' })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Only Me
                    </div>
                  </SelectItem>
                  <SelectItem value="family">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Everyone in Family
                    </div>
                  </SelectItem>
                  <SelectItem value="specific">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Select Each Time
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Country</Label>
              <Select 
                value={familyUser.country} 
                onValueChange={(v) => updateUser({ country: v })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="United States">United States</SelectItem>
                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="Australia">Australia</SelectItem>
                  <SelectItem value="Germany">Germany</SelectItem>
                  <SelectItem value="France">France</SelectItem>
                  <SelectItem value="Japan">Japan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Family Management */}
        <Card className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-primary" />
              Family Members
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {familyMembers.map((member) => (
              <button
                key={member.id}
                onClick={() => navigate(`/family/${member.id}`)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors"
              >
                <DiceBearAvatar
                  config={member.avatarConfig}
                  name={member.name}
                  relationship={member.relationship}
                  size="sm"
                />
                <div className="flex-1 text-left">
                  <p className="font-medium text-foreground">{member.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{member.relationship}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Admin Dashboard Link */}
        {isAdmin && (
          <Card className="animate-slide-up border-primary/20 bg-primary/5" style={{ animationDelay: '0.3s' }}>
            <CardContent className="pt-6">
              <Button
                variant="outline"
                className="w-full border-primary/30 hover:bg-primary/10"
                onClick={() => navigate('/admin')}
              >
                <Shield className="w-4 h-4 mr-2 text-primary" />
                Admin Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Sign Out */}
        <Card className="animate-slide-up" style={{ animationDelay: '0.35s' }}>
          <CardContent className="pt-6">
            <Button
              variant="outline"
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>

        {/* App Info */}
        <div className="text-center pt-4">
          <p className="text-xs text-muted-foreground">
            Kindred v1.0.0 • Made with ❤️ for families
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
