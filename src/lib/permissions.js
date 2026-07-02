export const can = (permissions, slug) => {
  if (!permissions || !Array.isArray(permissions)) return false;
  return permissions.includes(slug);
};

export const canAny = (permissions, slugs) => slugs.some((s) => can(permissions, s));

export const canAll = (permissions, slugs) => slugs.every((s) => can(permissions, s));
