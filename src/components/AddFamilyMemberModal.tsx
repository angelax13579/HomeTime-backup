import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFamily } from '@/contexts/FamilyContext';
import { RelationshipType, AvatarConfig, TopType, EyeType, MouthType, SkinColor, AccessoriesType, FacialHairType, HairColor, Clothing } from '@/types/family';
import { DiceBearAvatar } from './DiceBearAvatar';
import { 
  Gender, 
  calculateAge, 
  getAgeGroup, 
  getFilteredTopTypes, 
  shouldShowFacialHair 
} from '@/utils/avatarDefaults';
import { getPresetsForGenderAndAge, createFullConfig, AvatarPreset } from '@/utils/avatarPresets';

interface AddFamilyMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const relationships: { value: RelationshipType; label: string }[] = [
  { value: 'parent', label: 'Parent' },
  { value: 'child', label: 'Child' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'grandparent', label: 'Grandparent' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'other', label: 'Other' },
];

const backgroundColors = ['#FFE4CC', '#E8DDD4', '#FFD4E5', '#D4E8FF', '#E4FFD4', '#FFD4D4', '#F0E6FF', '#E6FFF0'];

const skinColors: { value: SkinColor; label: string }[] = [
  { value: 'pale', label: 'Pale' },
  { value: 'light', label: 'Light' },
  { value: 'tanned', label: 'Tanned' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'brown', label: 'Brown' },
  { value: 'darkBrown', label: 'Dark Brown' },
  { value: 'black', label: 'Black' },
];

const hairColors: { value: HairColor; label: string }[] = [
  { value: 'black', label: 'Black' },
  { value: 'brown', label: 'Brown' },
  { value: 'brownDark', label: 'Dark Brown' },
  { value: 'blonde', label: 'Blonde' },
  { value: 'blondeGolden', label: 'Golden Blonde' },
  { value: 'auburn', label: 'Auburn' },
  { value: 'red', label: 'Red' },
  { value: 'platinum', label: 'Platinum' },
  { value: 'silverGray', label: 'Silver Gray' },
  { value: 'pastelPink', label: 'Pastel Pink' },
];

const eyeTypes: { value: EyeType; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'happy', label: 'Happy' },
  { value: 'hearts', label: 'Hearts' },
  { value: 'side', label: 'Side' },
  { value: 'squint', label: 'Squint' },
  { value: 'surprised', label: 'Surprised' },
  { value: 'wink', label: 'Wink' },
  { value: 'winkWacky', label: 'Wink Wacky' },
  { value: 'close', label: 'Closed' },
  { value: 'cry', label: 'Crying' },
];

const mouthTypes: { value: MouthType; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'smile', label: 'Smile' },
  { value: 'twinkle', label: 'Twinkle' },
  { value: 'tongue', label: 'Tongue' },
  { value: 'serious', label: 'Serious' },
  { value: 'sad', label: 'Sad' },
  { value: 'eating', label: 'Eating' },
  { value: 'grimace', label: 'Grimace' },
];

const accessoriesTypes: { value: AccessoriesType | 'none'; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'prescription01', label: 'Glasses' },
  { value: 'prescription02', label: 'Glasses Round' },
  { value: 'round', label: 'Round Glasses' },
  { value: 'sunglasses', label: 'Sunglasses' },
  { value: 'wayfarers', label: 'Wayfarers' },
  { value: 'kurt', label: 'Kurt' },
];

const facialHairTypes: { value: FacialHairType | 'none'; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'beardLight', label: 'Light Beard' },
  { value: 'beardMedium', label: 'Medium Beard' },
  { value: 'beardMajestic', label: 'Majestic Beard' },
  { value: 'moustacheFancy', label: 'Fancy Moustache' },
  { value: 'moustacheMagnum', label: 'Magnum Moustache' },
];

const clothingTypes: { value: Clothing; label: string }[] = [
  { value: 'blazerAndShirt', label: 'Blazer & Shirt' },
  { value: 'blazerAndSweater', label: 'Blazer & Sweater' },
  { value: 'collarAndSweater', label: 'Collar & Sweater' },
  { value: 'graphicShirt', label: 'Graphic Shirt' },
  { value: 'hoodie', label: 'Hoodie' },
  { value: 'overall', label: 'Overall' },
  { value: 'shirtCrewNeck', label: 'Crew Neck' },
  { value: 'shirtScoopNeck', label: 'Scoop Neck' },
  { value: 'shirtVNeck', label: 'V-Neck' },
];

const genderOptions: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'neutral', label: 'Neutral' },
];

// Helper to parse date string without timezone issues
const parseDateString = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export function AddFamilyMemberModal({ open, onOpenChange }: AddFamilyMemberModalProps) {
  const { addFamilyMember } = useFamily();
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<RelationshipType>('parent');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [togetherSince, setTogetherSince] = useState('');
  const [gender, setGender] = useState<Gender>('neutral');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>({
    seed: 'default',
    backgroundColor: backgroundColors[0],
    skinColor: ['light'],
    hairColor: ['brown'],
    top: ['shortFlat'],
    eyes: ['default'],
    mouth: ['smile'],
    clothing: ['shirtCrewNeck'],
    accessoriesProbability: 0,
    facialHairProbability: 0,
  });

  const ageGroup = dateOfBirth ? getAgeGroup(calculateAge(dateOfBirth)) : 'adult';
  const presets = getPresetsForGenderAndAge(gender, ageGroup);
  const showFacialHair = shouldShowFacialHair(gender, ageGroup);
  const filteredTopTypes = getFilteredTopTypes(gender, ageGroup);

  // Select first preset when gender or age changes
  useEffect(() => {
    const newPresets = getPresetsForGenderAndAge(gender, ageGroup);
    if (newPresets.length > 0) {
      const firstPreset = newPresets[0];
      setSelectedPresetId(firstPreset.id);
      setAvatarConfig(createFullConfig(firstPreset, avatarConfig.backgroundColor || backgroundColors[0]));
    }
  }, [gender, ageGroup]);

  const handleSelectPreset = (preset: AvatarPreset) => {
    setSelectedPresetId(preset.id);
    setAvatarConfig(createFullConfig(preset, avatarConfig.backgroundColor || backgroundColors[0]));
  };

  const handleSubmit = () => {
    if (!name || !dateOfBirth || !togetherSince) return;

    addFamilyMember({
      name,
      relationship,
      dateOfBirth: parseDateString(dateOfBirth),
      togetherSince: parseDateString(togetherSince),
      showAge: true,
      showTimeVisualization: false,
      avatarConfig,
    });

    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setRelationship('parent');
    setDateOfBirth('');
    setTogetherSince('');
    setGender('neutral');
    setSelectedPresetId('');
    setAvatarConfig({
      seed: 'default',
      backgroundColor: backgroundColors[0],
      skinColor: ['light'],
      hairColor: ['brown'],
      top: ['shortFlat'],
      eyes: ['default'],
      mouth: ['smile'],
      clothing: ['shirtCrewNeck'],
      accessoriesProbability: 0,
      facialHairProbability: 0,
    });
  };

  const updateConfig = <K extends keyof AvatarConfig>(key: K, value: AvatarConfig[K]) => {
    setAvatarConfig(prev => ({ ...prev, [key]: value }));
    // Clear preset selection when manually customizing
    setSelectedPresetId('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-4 rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-center">
            Add Family Member
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Avatar Preview */}
          <div className="flex flex-col items-center gap-2">
            <DiceBearAvatar
              config={avatarConfig}
              name={name || '?'}
              relationship={relationship}
              size="xl"
            />
          </div>

          {/* Avatar Preset Gallery */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Choose an Avatar</Label>
            <div className="flex flex-wrap gap-2 justify-center">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                    selectedPresetId === preset.id 
                      ? 'bg-primary/10 ring-2 ring-primary' 
                      : 'hover:bg-muted'
                  }`}
                >
                  <DiceBearAvatar
                    config={createFullConfig(preset, avatarConfig.backgroundColor || backgroundColors[0])}
                    name={preset.label}
                    size="md"
                  />
                  <span className="text-xs text-muted-foreground">{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Profile Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter their name"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Relationship</Label>
              <Select value={relationship} onValueChange={(v) => setRelationship(v as RelationshipType)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {relationships.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="dob" className="text-sm font-medium">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="together" className="text-sm font-medium">Together Since</Label>
                <Input
                  id="together"
                  type="date"
                  value={togetherSince}
                  onChange={(e) => setTogetherSince(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Gender Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Gender (for avatar)</Label>
            <Select value={gender} onValueChange={(v) => setGender(v as Gender)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {genderOptions.map((g) => (
                  <SelectItem key={g.value} value={g.value}>
                    {g.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {dateOfBirth && (
              <p className="text-xs text-muted-foreground">
                Age group: {ageGroup.charAt(0).toUpperCase() + ageGroup.slice(1)} ({calculateAge(dateOfBirth)} years)
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-border pt-4">
            <Label className="text-sm font-medium text-muted-foreground">Customize Avatar</Label>
          </div>

          {/* Background Color */}
          <div>
            <Label className="text-xs text-muted-foreground">Background</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {backgroundColors.map((color) => (
                <button
                  key={color}
                  onClick={() => updateConfig('backgroundColor', color)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    avatarConfig.backgroundColor === color ? 'ring-2 ring-primary scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Skin & Hair */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Skin Tone</Label>
              <Select 
                value={avatarConfig.skinColor?.[0] || 'light'} 
                onValueChange={(v) => updateConfig('skinColor', [v as SkinColor])}
              >
                <SelectTrigger className="rounded-lg h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {skinColors.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Hair Color</Label>
              <Select 
                value={avatarConfig.hairColor?.[0] || 'brown'} 
                onValueChange={(v) => updateConfig('hairColor', [v as HairColor])}
              >
                <SelectTrigger className="rounded-lg h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hairColors.map((h) => (
                    <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Hair Style & Clothing */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Hair Style</Label>
              <Select 
                value={avatarConfig.top?.[0] || 'shortFlat'} 
                onValueChange={(v) => updateConfig('top', [v as TopType])}
              >
                <SelectTrigger className="rounded-lg h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {filteredTopTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Clothing</Label>
              <Select 
                value={avatarConfig.clothing?.[0] || 'shirtCrewNeck'} 
                onValueChange={(v) => updateConfig('clothing', [v as Clothing])}
              >
                <SelectTrigger className="rounded-lg h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {clothingTypes.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Eyes & Mouth */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Eyes</Label>
              <Select 
                value={avatarConfig.eyes?.[0] || 'default'} 
                onValueChange={(v) => updateConfig('eyes', [v as EyeType])}
              >
                <SelectTrigger className="rounded-lg h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eyeTypes.map((e) => (
                    <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Mouth</Label>
              <Select 
                value={avatarConfig.mouth?.[0] || 'smile'} 
                onValueChange={(v) => updateConfig('mouth', [v as MouthType])}
              >
                <SelectTrigger className="rounded-lg h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mouthTypes.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Accessories & Facial Hair */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Accessories</Label>
              <Select 
                value={avatarConfig.accessories?.[0] || 'none'} 
                onValueChange={(v) => {
                  if (v === 'none') {
                    updateConfig('accessoriesProbability', 0);
                    updateConfig('accessories', undefined);
                  } else {
                    updateConfig('accessoriesProbability', 100);
                    updateConfig('accessories', [v as AccessoriesType]);
                  }
                }}
              >
                <SelectTrigger className="rounded-lg h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {accessoriesTypes.map((a) => (
                    <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {showFacialHair && (
              <div>
                <Label className="text-xs text-muted-foreground">Facial Hair</Label>
                <Select 
                  value={avatarConfig.facialHair?.[0] || 'none'} 
                  onValueChange={(v) => {
                    if (v === 'none') {
                      updateConfig('facialHairProbability', 0);
                      updateConfig('facialHair', undefined);
                    } else {
                      updateConfig('facialHairProbability', 100);
                      updateConfig('facialHair', [v as FacialHairType]);
                    }
                  }}
                >
                  <SelectTrigger className="rounded-lg h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {facialHairTypes.map((f) => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!name || !dateOfBirth || !togetherSince}
            className="w-full"
            variant="warm"
          >
            Add to Family
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
