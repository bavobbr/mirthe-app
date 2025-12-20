
export type Category = 'Top' | 'Bottom' | 'Shoes' | 'Accessory' | 'Outerwear';

export interface ClothingItem {
  id: string;
  url: string;
  category: Category;
  description: string;
  color?: string;
}

export type Gender = 'boy' | 'girl';

export interface WeatherCondition {
  temp: number;
  condition: string;
}

export interface GeneratedOutfit {
  items: ClothingItem[];
  stylistNote: string;
  illustrationUrl?: string;
}
