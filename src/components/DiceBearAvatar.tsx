import { useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';
import { AvatarConfig, RelationshipType, SkinColor, HairColor } from '@/types/family';
import { cn } from '@/lib/utils';

interface DiceBearAvatarProps {
  config?: AvatarConfig;
  name: string;
  relationship?: RelationshipType;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-14 h-14',
  lg: 'w-20 h-20',
  xl: 'w-28 h-28',
};

const sizePx = {
  sm: 40,
  md: 56,
  lg: 80,
  xl: 112,
};

// Map named skin colors to hex values
const skinColorMap: Record<SkinColor, string> = {
  pale: '#ffdbb4',
  light: '#edb98a',
  tanned: '#d08b5b',
  yellow: '#fad478',
  brown: '#ae5d29',
  darkBrown: '#614335',
  black: '#3b2219',
};

// Map named hair colors to hex values  
const hairColorMap: Record<HairColor, string> = {
  black: '#090806',
  brown: '#6a4e35',
  brownDark: '#4a312c',
  blonde: '#d6b370',
  blondeGolden: '#f5d7b4',
  auburn: '#a55728',
  red: '#b83216',
  platinum: '#e8e1e1',
  silverGray: '#a7a7a7',
  pastelPink: '#f5a9b8',
};

export function DiceBearAvatar({ 
  config, 
  name, 
  relationship,
  size = 'md', 
  className 
}: DiceBearAvatarProps) {
  const avatarSvg = useMemo(() => {
    // Use seed from config or generate from name
    const seed = config?.seed || name || 'default';
    
    const options: Record<string, unknown> = {
      seed,
      size: sizePx[size],
    };

    // Apply config options if provided
    if (config) {
      if (config.accessories?.length) options.accessories = config.accessories;
      if (config.accessoriesProbability !== undefined) options.accessoriesProbability = config.accessoriesProbability;
      if (config.clothesColor?.length) options.clothesColor = config.clothesColor;
      if (config.clothing?.length) options.clothing = config.clothing;
      if (config.eyebrows?.length) options.eyebrows = config.eyebrows;
      if (config.eyes?.length) options.eyes = config.eyes;
      if (config.facialHair?.length) options.facialHair = config.facialHair;
      if (config.facialHairColor?.length) options.facialHairColor = config.facialHairColor;
      if (config.facialHairProbability !== undefined) options.facialHairProbability = config.facialHairProbability;
      if (config.mouth?.length) options.mouth = config.mouth;
      if (config.top?.length) options.top = config.top;
      if (config.topProbability !== undefined) options.topProbability = config.topProbability;
      
      // Convert named colors to hex values
      if (config.hairColor?.length) {
        options.hairColor = config.hairColor.map(c => hairColorMap[c] || c);
      }
      if (config.skinColor?.length) {
        options.skinColor = config.skinColor.map(c => skinColorMap[c] || c);
      }
    }

    return createAvatar(avataaars, options).toDataUri();
  }, [config, name, size]);

  const backgroundColor = config?.backgroundColor || '#E8DDD4';

  return (
    <div 
      className={cn(
        'rounded-full overflow-hidden flex items-center justify-center',
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor }}
    >
      <img 
        src={avatarSvg} 
        alt={`${name}'s avatar`}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
