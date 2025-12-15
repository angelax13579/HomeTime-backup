import { useState, useEffect } from 'react';
import { FamilyMember, TimeVisualizationMode, TimeVisualizationSettings, LifeExpectancyGender } from '@/types/family';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Hourglass, Heart, Target, Calendar, Sparkles, Loader2 } from 'lucide-react';
import { differenceInDays, differenceInYears, addYears, format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

// Countries available for life expectancy lookup
const COUNTRIES = [
  'United States', 'Japan', 'United Kingdom', 'Germany', 'France', 'Canada',
  'Australia', 'Spain', 'Italy', 'South Korea', 'Brazil', 'Mexico', 'India', 'China',
  'Russia', 'Netherlands', 'Sweden', 'Switzerland', 'Norway', 'Denmark', 'Finland',
  'Belgium', 'Austria', 'Portugal', 'Greece', 'Poland', 'Czech Republic', 'Hungary',
  'Ireland', 'New Zealand', 'Singapore', 'Hong Kong', 'Taiwan', 'Thailand', 'Indonesia',
  'Philippines', 'Vietnam', 'Malaysia', 'Turkey', 'Israel', 'United Arab Emirates',
  'Saudi Arabia', 'South Africa', 'Nigeria', 'Egypt', 'Argentina', 'Chile', 'Colombia', 'Peru'
];

// Fallback data if API fails
const FALLBACK_LIFE_EXPECTANCY: Record<string, { male: number; female: number }> = {
  'United States': { male: 75, female: 80 },
  'Japan': { male: 82, female: 88 },
  'United Kingdom': { male: 79, female: 83 },
  'Germany': { male: 79, female: 83 },
  'France': { male: 80, female: 86 },
  'Canada': { male: 80, female: 84 },
  'Australia': { male: 81, female: 85 },
  'Spain': { male: 80, female: 86 },
  'Italy': { male: 81, female: 85 },
  'South Korea': { male: 81, female: 87 },
  'Brazil': { male: 72, female: 79 },
  'Mexico': { male: 72, female: 78 },
  'India': { male: 68, female: 71 },
  'China': { male: 75, female: 81 },
  'Default': { male: 73, female: 78 },
};

interface TimeLeftTogetherProps {
  member: FamilyMember;
  onUpdate: (settings: Partial<FamilyMember>) => void;
}

const MILESTONE_PRESETS = [
  { label: 'Until they turn 18', type: 'age', targetAge: 18 },
  { label: 'Until graduation (22)', type: 'age', targetAge: 22 },
  { label: 'Until retirement (65)', type: 'age', targetAge: 65 },
];



interface LifeExpectancyData {
  male: number;
  female: number;
  source: string;
}

export function TimeLeftTogether({ member, onUpdate }: TimeLeftTogetherProps) {
  const [showEnableDialog, setShowEnableDialog] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [lifeExpectancyData, setLifeExpectancyData] = useState<LifeExpectancyData | null>(null);
  const settings = member.timeVisualization;

  // Fetch life expectancy when mode is life-expectancy
  useEffect(() => {
    if (settings?.enabled && settings.mode === 'life-expectancy' && settings.lifeExpectancyCountry) {
      fetchLifeExpectancy(settings.lifeExpectancyCountry);
    }
  }, [settings?.lifeExpectancyCountry, settings?.mode, settings?.enabled]);

  const fetchLifeExpectancy = async (country: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('get-life-expectancy', {
        body: { country }
      });
      
      if (error) {
        console.error('Error fetching life expectancy:', error);
        const fallback = FALLBACK_LIFE_EXPECTANCY[country] || FALLBACK_LIFE_EXPECTANCY['Default'];
        setLifeExpectancyData({ ...fallback, source: 'fallback' });
        return;
      }
      
      if (data?.success) {
        setLifeExpectancyData({
          male: data.male,
          female: data.female,
          source: data.source
        });
      }
    } catch (error) {
      console.error('Error fetching life expectancy:', error);
      const fallback = FALLBACK_LIFE_EXPECTANCY[country] || FALLBACK_LIFE_EXPECTANCY['Default'];
      setLifeExpectancyData({ ...fallback, source: 'fallback' });
    }
  };

  const handleEnableFeature = () => {
    setShowEnableDialog(false);
    setShowConfigDialog(true);
  };

  const handleSaveSettings = (newSettings: TimeVisualizationSettings) => {
    onUpdate({ 
      timeVisualization: newSettings,
      showTimeVisualization: true 
    });
    setShowConfigDialog(false);
  };

  const handleDisable = () => {
    onUpdate({ 
      showTimeVisualization: false,
      timeVisualization: settings ? { ...settings, enabled: false } : undefined
    });
  };

  // Calculate visualization data
  const getVisualizationData = () => {
    if (!settings?.enabled) return null;

    const today = new Date();
    let endDate: Date;
    let label: string;

    switch (settings.mode) {
      case 'life-expectancy': {
        const gender = settings.lifeExpectancyGender || 'male';
        let lifeExpectancy: number;
        
        if (lifeExpectancyData) {
          lifeExpectancy = gender === 'male' ? lifeExpectancyData.male : lifeExpectancyData.female;
        } else {
          const fallback = FALLBACK_LIFE_EXPECTANCY[settings.lifeExpectancyCountry || 'Default'] || FALLBACK_LIFE_EXPECTANCY['Default'];
          lifeExpectancy = gender === 'male' ? fallback.male : fallback.female;
        }
        
        endDate = addYears(member.dateOfBirth, Math.round(lifeExpectancy));
        label = `Estimated shared time (${gender === 'male' ? '♂' : '♀'} ${Math.round(lifeExpectancy)} yrs)`;
        break;
      }
      case 'milestone': {
        endDate = settings.milestoneDate || today;
        label = settings.milestoneLabel || 'Until milestone';
        break;
      }
      case 'custom': {
        const startDate = settings.customStartDate || today;
        endDate = addYears(startDate, settings.customYears || 5);
        label = `Intentional time: ${settings.customYears || 5} years`;
        break;
      }
      default:
        return null;
    }

    const totalDays = differenceInDays(endDate, member.togetherSince);
    const daysElapsed = differenceInDays(today, member.togetherSince);
    const daysRemaining = Math.max(0, differenceInDays(endDate, today));
    const yearsRemaining = Math.max(0, differenceInYears(endDate, today));
    const progress = totalDays > 0 ? Math.min(100, (daysElapsed / totalDays) * 100) : 0;

    return {
      endDate,
      label,
      daysRemaining,
      yearsRemaining,
      progress,
      isPast: daysRemaining <= 0,
    };
  };

  const vizData = getVisualizationData();

  if (!member.showTimeVisualization && !settings?.enabled) {
    return (
      <Card className="border-dashed border-border/50 bg-transparent">
        <CardContent className="p-5 text-center">
          <Hourglass className="w-8 h-8 mx-auto mb-3 text-muted-foreground/50" />
          <h4 className="font-display font-semibold text-sm text-foreground/70 mb-2">
            Time Left Together
          </h4>
          <p className="text-xs text-muted-foreground mb-4 max-w-[200px] mx-auto">
            An optional, reflective feature to visualize shared time
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowEnableDialog(true)}
            className="text-xs"
          >
            Learn More
          </Button>

          {/* Enable Confirmation Dialog */}
          <EnableConfirmationDialog 
            open={showEnableDialog}
            onClose={() => setShowEnableDialog(false)}
            onConfirm={handleEnableFeature}
          />

          {/* Configuration Dialog */}
          <ConfigurationDialog
            open={showConfigDialog}
            onClose={() => setShowConfigDialog(false)}
            member={member}
            onSave={handleSaveSettings}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden animate-fade-in">
      <CardContent className="p-0">
        {/* Gentle header */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary/60" />
              <h4 className="font-display font-semibold text-sm text-foreground">
                Time Together
              </h4>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-7 text-muted-foreground"
              onClick={() => setShowConfigDialog(true)}
            >
              Edit
            </Button>
          </div>
          <p className="text-xs text-muted-foreground italic">
            {vizData?.label}
          </p>
          {lifeExpectancyData?.source === 'World Bank' && settings?.mode === 'life-expectancy' && (
            <p className="text-[10px] text-muted-foreground/60 mt-1">
              Data: World Bank
            </p>
          )}
        </div>

        {/* Visualization */}
        {vizData && !vizData.isPast && (
          <div className="px-5 pb-5">
            {/* Progress ring visualization */}
            <div className="flex items-center gap-5">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 transform -rotate-90">
                  {/* Background ring */}
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    className="text-secondary"
                  />
                  {/* Progress ring */}
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    className="text-primary/60"
                    strokeDasharray={`${vizData.progress * 2.136} 213.6`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-primary/40" />
                </div>
              </div>

              <div className="flex-1">
                <p className="font-display font-bold text-2xl text-foreground">
                  ~{vizData.yearsRemaining}
                </p>
                <p className="text-sm text-muted-foreground">
                  estimated years
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  ({vizData.daysRemaining.toLocaleString()} days)
                </p>
              </div>
            </div>

            {/* Gentle reminder */}
            <p className="text-xs text-muted-foreground/80 mt-4 italic text-center">
              Every moment matters ✨
            </p>
          </div>
        )}

        {/* Disable option */}
        <div className="px-5 pb-4 border-t border-border/30 pt-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-muted-foreground h-8"
            onClick={handleDisable}
          >
            Hide this feature
          </Button>
        </div>
      </CardContent>

      {/* Configuration Dialog */}
      <ConfigurationDialog
        open={showConfigDialog}
        onClose={() => setShowConfigDialog(false)}
        member={member}
        existingSettings={settings}
        onSave={handleSaveSettings}
      />
    </Card>
  );
}

// Enable Confirmation Dialog
function EnableConfirmationDialog({ 
  open, 
  onClose, 
  onConfirm 
}: { 
  open: boolean; 
  onClose: () => void; 
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-4">
        <DialogHeader className="text-center">
          <div className="w-12 h-12 rounded-full bg-secondary mx-auto mb-3 flex items-center justify-center">
            <Hourglass className="w-6 h-6 text-primary/70" />
          </div>
          <DialogTitle className="font-display text-lg">
            Time Left Together
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed mt-2">
            Some people find it meaningful to visualize time. Others prefer not to. 
            <span className="block mt-2 font-medium text-foreground/80">
              You're always in control.
            </span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-secondary/50 rounded-xl p-4 my-2">
          <p className="text-xs text-muted-foreground text-center">
            This feature helps you reflect on shared time with intention and gratitude—not urgency.
          </p>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button 
            variant="warm" 
            onClick={onConfirm}
            className="w-full"
          >
            I understand, continue
          </Button>
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="w-full text-muted-foreground"
          >
            Maybe later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Configuration Dialog
function ConfigurationDialog({ 
  open, 
  onClose, 
  member,
  existingSettings,
  onSave 
}: { 
  open: boolean; 
  onClose: () => void;
  member: FamilyMember;
  existingSettings?: TimeVisualizationSettings;
  onSave: (settings: TimeVisualizationSettings) => void;
}) {
  const [mode, setMode] = useState<TimeVisualizationMode>(
    existingSettings?.mode || 'milestone'
  );
  const [country, setCountry] = useState(existingSettings?.lifeExpectancyCountry || 'United States');
  const [gender, setGender] = useState<LifeExpectancyGender>(existingSettings?.lifeExpectancyGender || 'male');
  const [milestoneLabel, setMilestoneLabel] = useState(existingSettings?.milestoneLabel || '');
  const [milestoneDate, setMilestoneDate] = useState<string>(
    existingSettings?.milestoneDate 
      ? format(existingSettings.milestoneDate, 'yyyy-MM-dd')
      : ''
  );
  const [customYears, setCustomYears] = useState(existingSettings?.customYears || 5);
  const [lifeExpectancy, setLifeExpectancy] = useState<{ male: number; female: number } | null>(null);
  const [isLoadingLE, setIsLoadingLE] = useState(false);

  // Fetch life expectancy when country changes
  useEffect(() => {
    if (mode === 'life-expectancy') {
      fetchLifeExpectancy(country);
    }
  }, [country, mode]);

  const fetchLifeExpectancy = async (countryName: string) => {
    setIsLoadingLE(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-life-expectancy', {
        body: { country: countryName }
      });
      
      if (error) {
        console.error('Error fetching life expectancy:', error);
        return;
      }
      
      if (data) {
        setLifeExpectancy({ male: data.male, female: data.female });
      }
    } catch (error) {
      console.error('Error fetching life expectancy:', error);
    } finally {
      setIsLoadingLE(false);
    }
  };

  const handlePresetClick = (preset: typeof MILESTONE_PRESETS[0]) => {
    const targetDate = addYears(member.dateOfBirth, preset.targetAge);
    setMilestoneLabel(preset.label);
    setMilestoneDate(format(targetDate, 'yyyy-MM-dd'));
  };

  const handleSave = () => {
    onSave({
      enabled: true,
      hasConfirmedFeature: true,
      mode,
      lifeExpectancyCountry: mode === 'life-expectancy' ? country : undefined,
      lifeExpectancyGender: mode === 'life-expectancy' ? gender : undefined,
      milestoneLabel: mode === 'milestone' ? milestoneLabel : undefined,
      milestoneDate: mode === 'milestone' && milestoneDate ? new Date(milestoneDate) : undefined,
      customYears: mode === 'custom' ? customYears : undefined,
      customStartDate: mode === 'custom' ? new Date() : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-4 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            Choose Visualization
          </DialogTitle>
          <DialogDescription className="text-sm">
            Select how you'd like to visualize your time with {member.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          {/* Mode Selection */}
          <div className="grid grid-cols-3 gap-2">
            <ModeButton
              active={mode === 'milestone'}
              onClick={() => setMode('milestone')}
              icon={Target}
              label="Milestone"
              recommended
            />
            <ModeButton
              active={mode === 'life-expectancy'}
              onClick={() => setMode('life-expectancy')}
              icon={Hourglass}
              label="Estimated"
            />
            <ModeButton
              active={mode === 'custom'}
              onClick={() => setMode('custom')}
              icon={Calendar}
              label="Custom"
            />
          </div>

          {/* Mode-specific configuration */}
          <div className="bg-secondary/30 rounded-xl p-4">
            {mode === 'milestone' && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground mb-3">
                  Define a meaningful milestone to look forward to
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {MILESTONE_PRESETS.map((preset) => (
                    <Button
                      key={preset.label}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => handlePresetClick(preset)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>

                <div className="space-y-2 pt-2">
                  <Label className="text-xs">Or custom milestone</Label>
                  <Input
                    placeholder="e.g., Until college graduation"
                    value={milestoneLabel}
                    onChange={(e) => setMilestoneLabel(e.target.value)}
                    className="text-sm h-9"
                  />
                  <Input
                    type="date"
                    value={milestoneDate}
                    onChange={(e) => setMilestoneDate(e.target.value)}
                    className="text-sm h-9"
                  />
                </div>
              </div>
            )}

            {mode === 'life-expectancy' && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Based on real-world life expectancy data by country and gender
                </p>
                
                <div className="space-y-2">
                  <Label className="text-xs">Country</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Gender</Label>
                  <Select value={gender} onValueChange={(v) => setGender(v as LifeExpectancyGender)}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">♂ Male</SelectItem>
                      <SelectItem value="female">♀ Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isLoadingLE ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground/70 italic">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Fetching data...
                  </div>
                ) : lifeExpectancy ? (
                  <div className="bg-primary/5 rounded-lg p-3 space-y-1">
                    <p className="text-xs font-medium text-foreground">
                      Life expectancy in {country}:
                    </p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span className={gender === 'male' ? 'font-semibold text-primary' : ''}>
                        ♂ {lifeExpectancy.male} years
                      </span>
                      <span className={gender === 'female' ? 'font-semibold text-primary' : ''}>
                        ♀ {lifeExpectancy.female} years
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      Source: World Bank
                    </p>
                  </div>
                ) : null}
              </div>
            )}

            {mode === 'custom' && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Set intentional shared time to cherish
                </p>
                <div className="space-y-2">
                  <Label className="text-xs">Time period</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      max={50}
                      value={customYears}
                      onChange={(e) => setCustomYears(Number(e.target.value))}
                      className="w-20 text-sm h-9"
                    />
                    <span className="text-sm text-muted-foreground">years from today</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="warm" onClick={handleSave} className="w-full">
            Save & Enable
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Mode selection button
function ModeButton({ 
  active, 
  onClick, 
  icon: Icon, 
  label,
  recommended 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  recommended?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative p-3 rounded-xl border-2 transition-all ${
        active 
          ? 'border-primary bg-primary/5' 
          : 'border-border/50 bg-card hover:border-border'
      }`}
    >
      {recommended && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
          Suggested
        </span>
      )}
      <Icon className={`w-5 h-5 mx-auto mb-1 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
      <span className={`text-[10px] ${active ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
        {label}
      </span>
    </button>
  );
}
