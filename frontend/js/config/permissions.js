export const ROLES = {
  ADMIN: "ADMIN",
  CLINICIAN: "CLINICIAN",
  RECEPTIONIST: "RECEPTIONIST",
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: "Administrator",
  [ROLES.CLINICIAN]: "Shifokor",
  [ROLES.RECEPTIONIST]: "Qabulxona",
};

export const PAGE_ACCESS = {
  dashboard: [ROLES.ADMIN, ROLES.CLINICIAN, ROLES.RECEPTIONIST],
  doctors: [ROLES.ADMIN, ROLES.RECEPTIONIST],
  patients: [ROLES.ADMIN, ROLES.CLINICIAN, ROLES.RECEPTIONIST],
  diseases: [ROLES.ADMIN, ROLES.CLINICIAN],
  departments: [ROLES.ADMIN, ROLES.CLINICIAN, ROLES.RECEPTIONIST],
  settings: [ROLES.ADMIN],
};

export const RESOURCE_ACTIONS = {
  departments: {
    create: [ROLES.ADMIN],
    update: [ROLES.ADMIN],
    delete: [ROLES.ADMIN],
  },
  doctors: {
    create: [ROLES.ADMIN],
    update: [ROLES.ADMIN],
    delete: [ROLES.ADMIN],
  },
  patients: {
    create: [ROLES.ADMIN, ROLES.RECEPTIONIST],
    update: [ROLES.ADMIN, ROLES.RECEPTIONIST],
    delete: [ROLES.ADMIN, ROLES.RECEPTIONIST],
    profile: [ROLES.ADMIN, ROLES.CLINICIAN],
  },
  diseases: {
    create: [ROLES.ADMIN, ROLES.CLINICIAN],
    update: [ROLES.ADMIN, ROLES.CLINICIAN],
    delete: [ROLES.ADMIN, ROLES.CLINICIAN],
  },
};

export const hasRole = (role, allowedRoles = []) => {
  return allowedRoles.includes(role);
};

export const canAccessPage = (role, page) => {
  return hasRole(role, PAGE_ACCESS[page] || []);
};

export const canPerform = (role, resource, action) => {
  return hasRole(role, RESOURCE_ACTIONS[resource]?.[action] || []);
};

export const getVisiblePages = (role, pages) => {
  return pages.filter((page) => canAccessPage(role, page.key));
};
