
export type Category = 'Top' | 'Bottom' | 'Shoes' | 'Accessory' | 'Outerwear' | 'Shirt' | 'Sweater' | 'Skirt' | 'Dress';

export interface ClothingItem {
  id: string;
  url: string;
  category: Category;
  description: string;
  color?: string;
}

export type Gender = 'boy' | 'girl';
export type IllustrationStyle = 'hand-drawn' | 'realistic' | 'cartoon';

export interface WeatherCondition {
  condition: string;
}

export interface GeneratedOutfit {
  items: ClothingItem[];
  stylistNote: string;
  illustrationUrl?: string;
  style: IllustrationStyle;
}
