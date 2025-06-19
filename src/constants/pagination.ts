export const PAGINATION_LIMITS = [10, 20, 50, 100] as const;

export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
} as const;

export const PAGINATION_CONFIG = {
  maxVisiblePages: 5,
  defaultLimit: 10,
  defaultPage: 1,
} as const;
