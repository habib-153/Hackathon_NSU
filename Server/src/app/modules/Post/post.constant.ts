export const PostCategory = [
  'Adventure',
  'Exploration',
  'Business Travel',
  'Family Vacation',
  'Relaxation',
  'Luxury Travel',
];

export type TPostCategory =
  | 'Adventure'
  | 'Exploration'
  | 'Business Travel'
  | 'Family Vacation'
  | 'Relaxation'
  | 'Luxury Travel';

export const POST_STATUS = {
  BASIC: 'BASIC',
  PREMIUM: 'PREMIUM',
} as const;

export const postSearchableFields = ['title', 'category'];
