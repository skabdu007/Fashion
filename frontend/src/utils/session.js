export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

export const getStoredVendor = () => {
  try {
    return JSON.parse(localStorage.getItem("vendor") || "null");
  } catch {
    return null;
  }
};

export const getUserId = (user = getStoredUser()) =>
  user?.user_id || user?._id || user?.id || "";

export const getRole = (user = getStoredUser()) =>
  String(user?.role || "").toUpperCase();

export const getDashboardPath = (user = getStoredUser()) => {
  const role = getRole(user);

  if (role === "CUSTOMER") return "/customer/dashboard";
  if (role === "VENDOR") return "/vendor/dashboard";
  if (["ADMIN", "SUPER_ADMIN", "MANAGER"].includes(role)) return "/admin/dashboard";

  return "/";
};

export const getProfilePath = (user = getStoredUser()) => {
  const role = getRole(user);

  if (role === "CUSTOMER") return "/customer/profile";
  if (role === "VENDOR") return "/vendor/profile";
  if (["ADMIN", "SUPER_ADMIN", "MANAGER"].includes(role)) return "/admin/profile";

  return "/";
};

export const broadcastSessionUpdate = () => {
  window.dispatchEvent(new Event("session-updated"));
};
