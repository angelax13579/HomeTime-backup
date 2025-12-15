import { AvatarConfig, TopType, Clothing, FacialHairType, AccessoriesType } from '@/types/family';

export type Gender = 'male' | 'female' | 'neutral';

// Hair styles categorized by gender appropriateness
const maleHairStyles: TopType[] = [
  'shortFlat', 'shortRound', 'shortWaved', 'shortCurly', 'theCaesar', 
  'theCaesarAndSidePart', 'sides', 'shavedSides', 'dreads', 'fro'
];

const femaleHairStyles: TopType[] = [
  'bob', 'bun', 'curly', 'curvy', 'longButNotTooLong', 'straight01', 
  'straight02', 'straightAndStrand', 'bigHair', 'miaWallace', 'frida', 'froBand'
];

const neutralHairStyles: TopType[] = [
  'shortCurly', 'shortWaved', 'curly', 'fro', 'dreads', 'shaggy'
];

const childHairStyles: TopType[] = [
  'shortFlat', 'shortRound', 'shortCurly', 'curly', 'bob', 'straight01'
];

// Clothing categorized
const formalClothing: Clothing[] = ['blazerAndShirt', 'blazerAndSweater', 'collarAndSweater'];
const casualClothing: Clothing[] = ['hoodie', 'shirtCrewNeck', 'graphicShirt'];
const childClothing: Clothing[] = ['hoodie', 'overall', 'shirtCrewNeck', 'graphicShirt'];

export function calculateAge(dateOfBirth: Date | string): number {
  const birthDate = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function getAgeGroup(age: number): 'baby' | 'child' | 'teen' | 'adult' | 'senior' {
  if (age < 3) return 'baby';
  if (age < 13) return 'child';
  if (age < 20) return 'teen';
  if (age < 60) return 'adult';
  return 'senior';
}

export function getFilteredHairStyles(gender: Gender, ageGroup: string): TopType[] {
  if (ageGroup === 'baby' || ageGroup === 'child') {
    // Children get simpler, shorter styles
    if (gender === 'male') {
      return ['shortFlat', 'shortRound', 'shortCurly', 'shortWaved'];
    } else if (gender === 'female') {
      return ['bob', 'straight01', 'curly', 'bun', 'shortCurly'];
    }
    return childHairStyles;
  }
  
  if (gender === 'male') return maleHairStyles;
  if (gender === 'female') return femaleHairStyles;
  return [...maleHairStyles, ...femaleHairStyles];
}

export function getFilteredClothing(ageGroup: string): Clothing[] {
  if (ageGroup === 'baby' || ageGroup === 'child') {
    return childClothing;
  }
  return [...casualClothing, ...formalClothing];
}

export function generateAvatarDefaults(
  gender: Gender, 
  dateOfBirth?: string
): Partial<AvatarConfig> {
  const age = dateOfBirth ? calculateAge(dateOfBirth) : 30;
  const ageGroup = getAgeGroup(age);
  
  // Pick a random appropriate hair style
  const hairStyles = getFilteredHairStyles(gender, ageGroup);
  const randomHair = hairStyles[Math.floor(Math.random() * hairStyles.length)];
  
  // Pick appropriate clothing
  const clothing = getFilteredClothing(ageGroup);
  const randomClothing = clothing[Math.floor(Math.random() * clothing.length)];
  
  // Facial hair only for adult/senior males
  let facialHairProbability = 0;
  let facialHair: FacialHairType[] | undefined;
  if (gender === 'male' && (ageGroup === 'adult' || ageGroup === 'senior')) {
    // 30% chance of facial hair
    if (Math.random() > 0.7) {
      facialHairProbability = 100;
      const facialHairOptions: FacialHairType[] = ['beardLight', 'beardMedium', 'moustacheFancy'];
      facialHair = [facialHairOptions[Math.floor(Math.random() * facialHairOptions.length)]];
    }
  }
  
  // Accessories - glasses more likely for seniors
  let accessoriesProbability = 0;
  let accessories: AccessoriesType[] | undefined;
  if (ageGroup === 'senior' && Math.random() > 0.5) {
    accessoriesProbability = 100;
    accessories = ['prescription01'];
  } else if (ageGroup === 'adult' && Math.random() > 0.8) {
    accessoriesProbability = 100;
    const accessoryOptions: AccessoriesType[] = ['prescription01', 'prescription02', 'round'];
    accessories = [accessoryOptions[Math.floor(Math.random() * accessoryOptions.length)]];
  }

  // Gray hair for seniors
  let hairColor: AvatarConfig['hairColor'] = undefined;
  if (ageGroup === 'senior' && Math.random() > 0.4) {
    hairColor = ['silverGray'];
  }

  return {
    top: [randomHair],
    clothing: [randomClothing],
    facialHairProbability,
    facialHair,
    accessoriesProbability,
    accessories,
    hairColor,
    eyes: ['default'],
    mouth: ['smile'],
  };
}

// Get filtered options for dropdowns based on gender and age
export function getFilteredTopTypes(gender: Gender, ageGroup: string): { value: TopType; label: string }[] {
  const allTopTypes: { value: TopType; label: string }[] = [
    { value: 'shortFlat', label: 'Short Flat' },
    { value: 'shortRound', label: 'Short Round' },
    { value: 'shortWaved', label: 'Short Waved' },
    { value: 'shortCurly', label: 'Short Curly' },
    { value: 'theCaesar', label: 'Caesar' },
    { value: 'theCaesarAndSidePart', label: 'Caesar Side Part' },
    { value: 'sides', label: 'Sides Only' },
    { value: 'shavedSides', label: 'Shaved Sides' },
    { value: 'bob', label: 'Bob' },
    { value: 'bun', label: 'Bun' },
    { value: 'curly', label: 'Curly' },
    { value: 'curvy', label: 'Curvy' },
    { value: 'dreads', label: 'Dreads' },
    { value: 'longButNotTooLong', label: 'Medium Long' },
    { value: 'straight01', label: 'Straight' },
    { value: 'straight02', label: 'Straight Long' },
    { value: 'straightAndStrand', label: 'Straight & Strand' },
    { value: 'bigHair', label: 'Big Hair' },
    { value: 'fro', label: 'Afro' },
    { value: 'froBand', label: 'Afro with Band' },
    { value: 'miaWallace', label: 'Mia Wallace' },
    { value: 'shaggy', label: 'Shaggy' },
    { value: 'shaggyMullet', label: 'Shaggy Mullet' },
    { value: 'frida', label: 'Frida' },
    { value: 'turban', label: 'Turban' },
    { value: 'winterHat01', label: 'Winter Hat' },
    { value: 'winterHat02', label: 'Beanie' },
  ];

  const filteredStyles = getFilteredHairStyles(gender, ageGroup);
  return allTopTypes.filter(t => filteredStyles.includes(t.value));
}

export function shouldShowFacialHair(gender: Gender, ageGroup: string): boolean {
  return gender === 'male' && (ageGroup === 'adult' || ageGroup === 'senior' || ageGroup === 'teen');
}
