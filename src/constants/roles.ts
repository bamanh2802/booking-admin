export type RoleName = "Admin" | "AgentLv1" | "AgentLv2" | "Client";

export const ROLES = {
  ADMIN: "Admin" as const,
  AGENT_LV1: "AgentLv1" as const,
  AGENT_LV2: "AgentLv2" as const,
  CLIENT: "Client" as const,
} as const;

// Role options for creating new users (excluding Admin)
export const ROLE_OPTIONS = [
  { value: ROLES.AGENT_LV1, label: "Đại lý cấp 1" },
  { value: ROLES.AGENT_LV2, label: "Đại lý cấp 2" },
  { value: ROLES.CLIENT, label: "Người dùng" },
] as const;

// All role options (including Admin for filtering)
export const ALL_ROLE_OPTIONS = [
  { value: ROLES.ADMIN, label: "Quản trị viên" },
  { value: ROLES.AGENT_LV1, label: "Đại lý cấp 1" },
  { value: ROLES.AGENT_LV2, label: "Đại lý cấp 2" },
  { value: ROLES.CLIENT, label: "Người dùng" },
] as const;

export const ROLE_BADGE_VARIANTS = {
  [ROLES.ADMIN]: "default", // Sẽ được override bằng style custom màu xanh lá
  [ROLES.AGENT_LV1]: "default", // Sẽ được override bằng style custom
  [ROLES.AGENT_LV2]: "default", // Sẽ được override bằng style custom
  [ROLES.CLIENT]: "outline",
} as const;

export const ROLE_DISPLAY_NAMES = {
  [ROLES.ADMIN]: "Quản trị viên",
  [ROLES.AGENT_LV1]: "Đại lý cấp 1",
  [ROLES.AGENT_LV2]: "Đại lý cấp 2",
  [ROLES.CLIENT]: "Người dùng",
} as const;

// Helper functions
export const getRoleBadgeVariant = (roleName?: string) => {
  return ROLE_BADGE_VARIANTS[roleName as RoleName] || "outline";
};

export const getRoleDisplayName = (roleName?: string) => {
  return (
    ROLE_DISPLAY_NAMES[roleName as RoleName] || roleName || "Không xác định"
  );
};

// Custom style for role badges
export const getRoleBadgeStyle = (roleName?: string) => {
  switch (roleName) {
    case ROLES.ADMIN:
      return {
        backgroundColor: "#22c55e", // green-500 - xanh lá rực rỡ
        color: "white",
        borderColor: "#22c55e"
      };
    case ROLES.AGENT_LV1:
      return {
        backgroundColor: "#3b82f6", // blue-500 - xanh dương nhẹ
        color: "white", 
        borderColor: "#3b82f6"
      };
    case ROLES.AGENT_LV2:
      return {
        backgroundColor: "#8b5cf6", // violet-500 - tím nhẹ
        color: "white",
        borderColor: "#8b5cf6"
      };
    default:
      return {};
  }
};

// Deprecated - dùng getRoleBadgeStyle thay thế
export const getAdminBadgeStyle = (roleName?: string) => {
  return getRoleBadgeStyle(roleName);
};
