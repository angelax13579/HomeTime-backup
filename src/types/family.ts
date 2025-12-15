export type RelationshipType = 
  | 'parent' 
  | 'child' 
  | 'sibling' 
  | 'grandparent' 
  | 'spouse' 
  | 'other';

export type TimeVisualizationMode = 'life-expectancy' | 'milestone' | 'custom';

export type LifeExpectancyGender = 'male' | 'female';

export interface TimeVisualizationSettings {
  enabled: boolean;
  hasConfirmedFeature: boolean;
  mode: TimeVisualizationMode;
  // Life expectancy mode
  lifeExpectancyCountry?: string;
  lifeExpectancyGender?: LifeExpectancyGender;
  // Milestone mode
  milestoneLabel?: string;
  milestoneDate?: Date;
  // Custom mode
  customYears?: number;
  customStartDate?: Date;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: RelationshipType;
  dateOfBirth: Date;
  togetherSince: Date;
  avatarUrl?: string;
  avatarConfig?: AvatarConfig;
  showAge: boolean;
  showTimeVisualization: boolean;
  timeVisualization?: TimeVisualizationSettings;
}

// DiceBear Avataaars options
export type AccessoriesType = 'blank' | 'kurt' | 'prescription01' | 'prescription02' | 'round' | 'sunglasses' | 'wayfarers';
export type ClotheColor = 'black' | 'blue01' | 'blue02' | 'blue03' | 'gray01' | 'gray02' | 'heather' | 'pastelBlue' | 'pastelGreen' | 'pastelOrange' | 'pastelRed' | 'pastelYellow' | 'pink' | 'red' | 'white';
export type Clothing = 'blazerAndShirt' | 'blazerAndSweater' | 'collarAndSweater' | 'graphicShirt' | 'hoodie' | 'overall' | 'shirtCrewNeck' | 'shirtScoopNeck' | 'shirtVNeck';
export type EyebrowType = 'angry' | 'angryNatural' | 'default' | 'defaultNatural' | 'flatNatural' | 'frownNatural' | 'raisedExcited' | 'raisedExcitedNatural' | 'sadConcerned' | 'sadConcernedNatural' | 'unibrowNatural' | 'upDown' | 'upDownNatural';
export type EyeType = 'close' | 'cry' | 'default' | 'dizzy' | 'eyeRoll' | 'happy' | 'hearts' | 'side' | 'squint' | 'surprised' | 'wink' | 'winkWacky';
export type FacialHairColor = 'auburn' | 'black' | 'blonde' | 'blondeGolden' | 'brown' | 'brownDark' | 'platinum' | 'red';
export type FacialHairType = 'beardLight' | 'beardMajestic' | 'beardMedium' | 'moustacheFancy' | 'moustacheMagnum';
export type HairColor = 'auburn' | 'black' | 'blonde' | 'blondeGolden' | 'brown' | 'brownDark' | 'pastelPink' | 'platinum' | 'red' | 'silverGray';
export type HatColor = 'black' | 'blue01' | 'blue02' | 'blue03' | 'gray01' | 'gray02' | 'heather' | 'pastelBlue' | 'pastelGreen' | 'pastelOrange' | 'pastelRed' | 'pastelYellow' | 'pink' | 'red' | 'white';
export type MouthType = 'concerned' | 'default' | 'disbelief' | 'eating' | 'grimace' | 'sad' | 'screamOpen' | 'serious' | 'smile' | 'tongue' | 'twinkle' | 'vomit';
export type SkinColor = 'tanned' | 'yellow' | 'pale' | 'light' | 'brown' | 'darkBrown' | 'black';
export type TopType = 'bigHair' | 'bob' | 'bun' | 'curly' | 'curvy' | 'dreads' | 'frida' | 'fro' | 'froBand' | 'longButNotTooLong' | 'miaWallace' | 'shaggy' | 'shaggyMullet' | 'shavedSides' | 'shortCurly' | 'shortFlat' | 'shortRound' | 'shortWaved' | 'sides' | 'straight01' | 'straight02' | 'straightAndStrand' | 'theCaesar' | 'theCaesarAndSidePart' | 'turban' | 'winterHat01' | 'winterHat02' | 'winterHat03' | 'winterHat04';

export interface AvatarConfig {
  // DiceBear options
  seed?: string;
  accessories?: AccessoriesType[];
  accessoriesProbability?: number;
  clothesColor?: ClotheColor[];
  clothing?: Clothing[];
  eyebrows?: EyebrowType[];
  eyes?: EyeType[];
  facialHair?: FacialHairType[];
  facialHairColor?: FacialHairColor[];
  facialHairProbability?: number;
  hairColor?: HairColor[];
  mouth?: MouthType[];
  skinColor?: SkinColor[];
  top?: TopType[];
  topProbability?: number;
  backgroundColor?: string;
  // Legacy fields for migration
  skinTone?: string;
  hairStyle?: string;
  eyeStyle?: string;
  mouthStyle?: string;
  accessory?: string;
  ageGroup?: string;
  faceShape?: string;
  gender?: string;
}

export interface Reminder {
  id: string;
  familyMemberId: string;
  title: string;
  date: Date;
  type: 'birthday' | 'anniversary' | 'visit' | 'activity' | 'custom';
  recurring: boolean;
}

export interface MemoryReaction {
  userId: string;
  emoji: string;
}

export interface MemoryComment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date;
}

export interface Memory {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  photos: string[];
  createdAt: Date;
  visibility: 'private' | 'family' | 'specific';
  visibleTo?: string[];
  promptId?: string;
  reactions: MemoryReaction[];
  comments: MemoryComment[];
}

export interface Prompt {
  id: string;
  text: string;
  category: 'daily' | 'weekly' | 'childhood' | 'gratitude' | 'milestone';
}

export interface FamilyPrompt {
  id: string;
  authorId: string;
  authorName: string;
  question: string;
  createdAt: Date;
  expiresAt?: Date;
  respondedBy: string[];
  notificationSent: boolean;
}

export type EventInvitationStatus = 'pending' | 'accepted' | 'declined';

export interface FamilyEvent {
  id: string;
  creatorId: string;
  creatorName: string;
  title: string;
  description: string;
  dateTime: Date;
  invitedMembers: string[];
  responses: Record<string, { status: EventInvitationStatus; message?: string }>;
  reminderBefore: number; // minutes before event
  isPersonalReminder: boolean; // true if no invites, just self-reminder
  createdAt: Date;
}

export interface EventInvitation {
  eventId: string;
  event: FamilyEvent;
  status: EventInvitationStatus;
}

export interface ActivitySuggestion {
  id: string;
  title: string;
  description: string;
  category: 'outdoor' | 'indoor' | 'creative' | 'food' | 'travel' | 'games';
  minPeople: number;
  maxPeople: number;
  ageRange: { min: number; max: number };
  duration: string;
  imageUrl?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  country: string;
  avatarUrl?: string;
  avatarConfig?: AvatarConfig;
  defaultVisibility: 'private' | 'family' | 'specific';
  isPremium: boolean;
}
