import { AvatarConfig, TopType, Clothing, FacialHairType, AccessoriesType, SkinColor, HairColor, EyeType, MouthType } from '@/types/family';
import { Gender } from './avatarDefaults';

export interface AvatarPreset {
  id: string;
  label: string;
  config: Partial<AvatarConfig>;
}

// Base presets for different gender/age combinations
const maleAdultPresets: AvatarPreset[] = [
  {
    id: 'male-adult-1',
    label: 'Business',
    config: {
      top: ['shortFlat'],
      clothing: ['blazerAndShirt'],
      eyes: ['default'],
      mouth: ['smile'],
      skinColor: ['light'],
      hairColor: ['brownDark'],
    }
  },
  {
    id: 'male-adult-2',
    label: 'Casual',
    config: {
      top: ['shortWaved'],
      clothing: ['hoodie'],
      eyes: ['happy'],
      mouth: ['smile'],
      skinColor: ['tanned'],
      hairColor: ['brown'],
    }
  },
  {
    id: 'male-adult-3',
    label: 'Stylish',
    config: {
      top: ['shortCurly'],
      clothing: ['shirtCrewNeck'],
      eyes: ['default'],
      mouth: ['twinkle'],
      skinColor: ['brown'],
      hairColor: ['black'],
    }
  },
  {
    id: 'male-adult-4',
    label: 'Bearded',
    config: {
      top: ['shortFlat'],
      clothing: ['collarAndSweater'],
      eyes: ['default'],
      mouth: ['serious'],
      skinColor: ['light'],
      hairColor: ['brownDark'],
      facialHair: ['beardMedium'],
      facialHairProbability: 100,
    }
  },
  {
    id: 'male-adult-5',
    label: 'Professional',
    config: {
      top: ['theCaesar'],
      clothing: ['blazerAndSweater'],
      eyes: ['default'],
      mouth: ['smile'],
      skinColor: ['darkBrown'],
      hairColor: ['black'],
    }
  },
  {
    id: 'male-adult-6',
    label: 'Creative',
    config: {
      top: ['dreads'],
      clothing: ['graphicShirt'],
      eyes: ['happy'],
      mouth: ['tongue'],
      skinColor: ['brown'],
      hairColor: ['black'],
    }
  },
];

const femaleAdultPresets: AvatarPreset[] = [
  {
    id: 'female-adult-1',
    label: 'Professional',
    config: {
      top: ['longButNotTooLong'],
      clothing: ['blazerAndShirt'],
      eyes: ['default'],
      mouth: ['smile'],
      skinColor: ['light'],
      hairColor: ['brownDark'],
    }
  },
  {
    id: 'female-adult-2',
    label: 'Casual',
    config: {
      top: ['straight02'],
      clothing: ['shirtCrewNeck'],
      eyes: ['happy'],
      mouth: ['smile'],
      skinColor: ['tanned'],
      hairColor: ['blonde'],
    }
  },
  {
    id: 'female-adult-3',
    label: 'Elegant',
    config: {
      top: ['bun'],
      clothing: ['collarAndSweater'],
      eyes: ['default'],
      mouth: ['twinkle'],
      skinColor: ['pale'],
      hairColor: ['black'],
    }
  },
  {
    id: 'female-adult-4',
    label: 'Trendy',
    config: {
      top: ['bigHair'],
      clothing: ['hoodie'],
      eyes: ['wink'],
      mouth: ['smile'],
      skinColor: ['brown'],
      hairColor: ['auburn'],
    }
  },
  {
    id: 'female-adult-5',
    label: 'Classic',
    config: {
      top: ['straightAndStrand'],
      clothing: ['blazerAndSweater'],
      eyes: ['default'],
      mouth: ['smile'],
      skinColor: ['light'],
      hairColor: ['brown'],
    }
  },
  {
    id: 'female-adult-6',
    label: 'Artistic',
    config: {
      top: ['curvy'],
      clothing: ['graphicShirt'],
      eyes: ['happy'],
      mouth: ['tongue'],
      skinColor: ['tanned'],
      hairColor: ['pastelPink'],
    }
  },
];

const maleSeniorPresets: AvatarPreset[] = [
  {
    id: 'male-senior-1',
    label: 'Distinguished',
    config: {
      top: ['shortFlat'],
      clothing: ['blazerAndShirt'],
      eyes: ['default'],
      mouth: ['smile'],
      skinColor: ['light'],
      hairColor: ['silverGray'],
      accessories: ['prescription01'],
      accessoriesProbability: 100,
    }
  },
  {
    id: 'male-senior-2',
    label: 'Wise',
    config: {
      top: ['sides'],
      clothing: ['collarAndSweater'],
      eyes: ['default'],
      mouth: ['serious'],
      skinColor: ['tanned'],
      hairColor: ['silverGray'],
    }
  },
  {
    id: 'male-senior-3',
    label: 'Grandpa',
    config: {
      top: ['shortRound'],
      clothing: ['shirtCrewNeck'],
      eyes: ['happy'],
      mouth: ['smile'],
      skinColor: ['light'],
      hairColor: ['silverGray'],
      facialHair: ['beardLight'],
      facialHairProbability: 100,
    }
  },
];

const femaleSeniorPresets: AvatarPreset[] = [
  {
    id: 'female-senior-1',
    label: 'Elegant',
    config: {
      top: ['bun'],
      clothing: ['collarAndSweater'],
      eyes: ['default'],
      mouth: ['smile'],
      skinColor: ['light'],
      hairColor: ['silverGray'],
    }
  },
  {
    id: 'female-senior-2',
    label: 'Wise',
    config: {
      top: ['straight01'],
      clothing: ['blazerAndSweater'],
      eyes: ['default'],
      mouth: ['twinkle'],
      skinColor: ['tanned'],
      hairColor: ['silverGray'],
      accessories: ['prescription01'],
      accessoriesProbability: 100,
    }
  },
  {
    id: 'female-senior-3',
    label: 'Grandma',
    config: {
      top: ['bob'],
      clothing: ['shirtCrewNeck'],
      eyes: ['happy'],
      mouth: ['smile'],
      skinColor: ['light'],
      hairColor: ['silverGray'],
    }
  },
];

const maleChildPresets: AvatarPreset[] = [
  {
    id: 'male-child-1',
    label: 'Playful',
    config: {
      top: ['shortFlat'],
      clothing: ['hoodie'],
      eyes: ['happy'],
      mouth: ['smile'],
      skinColor: ['light'],
      hairColor: ['brown'],
    }
  },
  {
    id: 'male-child-2',
    label: 'Cheerful',
    config: {
      top: ['shortCurly'],
      clothing: ['graphicShirt'],
      eyes: ['default'],
      mouth: ['tongue'],
      skinColor: ['tanned'],
      hairColor: ['black'],
    }
  },
  {
    id: 'male-child-3',
    label: 'Cool Kid',
    config: {
      top: ['shortWaved'],
      clothing: ['shirtCrewNeck'],
      eyes: ['wink'],
      mouth: ['smile'],
      skinColor: ['brown'],
      hairColor: ['brownDark'],
    }
  },
];

const femaleChildPresets: AvatarPreset[] = [
  {
    id: 'female-child-1',
    label: 'Sweet',
    config: {
      top: ['bob'],
      clothing: ['overall'],
      eyes: ['happy'],
      mouth: ['smile'],
      skinColor: ['light'],
      hairColor: ['blonde'],
    }
  },
  {
    id: 'female-child-2',
    label: 'Playful',
    config: {
      top: ['curly'],
      clothing: ['graphicShirt'],
      eyes: ['default'],
      mouth: ['tongue'],
      skinColor: ['tanned'],
      hairColor: ['brown'],
    }
  },
  {
    id: 'female-child-3',
    label: 'Cheerful',
    config: {
      top: ['straight01'],
      clothing: ['hoodie'],
      eyes: ['wink'],
      mouth: ['smile'],
      skinColor: ['brown'],
      hairColor: ['black'],
    }
  },
];

const maleTeenPresets: AvatarPreset[] = [
  {
    id: 'male-teen-1',
    label: 'Student',
    config: {
      top: ['shortFlat'],
      clothing: ['hoodie'],
      eyes: ['default'],
      mouth: ['smile'],
      skinColor: ['light'],
      hairColor: ['brown'],
    }
  },
  {
    id: 'male-teen-2',
    label: 'Trendy',
    config: {
      top: ['shortWaved'],
      clothing: ['graphicShirt'],
      eyes: ['happy'],
      mouth: ['tongue'],
      skinColor: ['tanned'],
      hairColor: ['black'],
    }
  },
  {
    id: 'male-teen-3',
    label: 'Cool',
    config: {
      top: ['shaggy'],
      clothing: ['shirtCrewNeck'],
      eyes: ['side'],
      mouth: ['twinkle'],
      skinColor: ['brown'],
      hairColor: ['brownDark'],
    }
  },
];

const femaleTeenPresets: AvatarPreset[] = [
  {
    id: 'female-teen-1',
    label: 'Student',
    config: {
      top: ['straight01'],
      clothing: ['hoodie'],
      eyes: ['default'],
      mouth: ['smile'],
      skinColor: ['light'],
      hairColor: ['brown'],
    }
  },
  {
    id: 'female-teen-2',
    label: 'Trendy',
    config: {
      top: ['curly'],
      clothing: ['graphicShirt'],
      eyes: ['happy'],
      mouth: ['tongue'],
      skinColor: ['tanned'],
      hairColor: ['auburn'],
    }
  },
  {
    id: 'female-teen-3',
    label: 'Stylish',
    config: {
      top: ['longButNotTooLong'],
      clothing: ['shirtCrewNeck'],
      eyes: ['wink'],
      mouth: ['smile'],
      skinColor: ['brown'],
      hairColor: ['black'],
    }
  },
];

const neutralPresets: AvatarPreset[] = [
  {
    id: 'neutral-1',
    label: 'Friendly',
    config: {
      top: ['shortCurly'],
      clothing: ['shirtCrewNeck'],
      eyes: ['happy'],
      mouth: ['smile'],
      skinColor: ['light'],
      hairColor: ['brown'],
    }
  },
  {
    id: 'neutral-2',
    label: 'Cool',
    config: {
      top: ['fro'],
      clothing: ['hoodie'],
      eyes: ['default'],
      mouth: ['twinkle'],
      skinColor: ['tanned'],
      hairColor: ['black'],
    }
  },
  {
    id: 'neutral-3',
    label: 'Casual',
    config: {
      top: ['shaggy'],
      clothing: ['graphicShirt'],
      eyes: ['wink'],
      mouth: ['tongue'],
      skinColor: ['brown'],
      hairColor: ['brownDark'],
    }
  },
];

export function getPresetsForGenderAndAge(gender: Gender, ageGroup: string): AvatarPreset[] {
  if (gender === 'neutral') {
    return neutralPresets;
  }
  
  if (ageGroup === 'baby' || ageGroup === 'child') {
    return gender === 'male' ? maleChildPresets : femaleChildPresets;
  }
  
  if (ageGroup === 'teen') {
    return gender === 'male' ? maleTeenPresets : femaleTeenPresets;
  }
  
  if (ageGroup === 'senior') {
    return gender === 'male' ? maleSeniorPresets : femaleSeniorPresets;
  }
  
  // Default to adult
  return gender === 'male' ? maleAdultPresets : femaleAdultPresets;
}

export function createFullConfig(preset: AvatarPreset, backgroundColor: string): AvatarConfig {
  return {
    seed: preset.id,
    backgroundColor,
    skinColor: preset.config.skinColor as SkinColor[] || ['light'],
    hairColor: preset.config.hairColor as HairColor[] || ['brown'],
    top: preset.config.top as TopType[] || ['shortFlat'],
    topProbability: 100, // Always show hair
    eyes: preset.config.eyes as EyeType[] || ['default'],
    mouth: preset.config.mouth as MouthType[] || ['smile'],
    clothing: preset.config.clothing as Clothing[] || ['shirtCrewNeck'],
    accessoriesProbability: preset.config.accessoriesProbability || 0,
    accessories: preset.config.accessories as AccessoriesType[] || undefined,
    facialHairProbability: preset.config.facialHairProbability || 0,
    facialHair: preset.config.facialHair as FacialHairType[] || undefined,
  };
}
