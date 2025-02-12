export const USER_ROLE = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  BAN: 'BAN',
} as const;

export const DEFAULT_PROFILE_URL =
  'https://www.pngall.com/wp-content/uploads/5/Profile-PNG-Free-Download.png';

export const UserSearchableFields = [
  'name',
  'email',
  'phone',
  'role',
  'status',
];
