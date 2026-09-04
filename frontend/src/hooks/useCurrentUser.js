import { useMemo } from "react";
import { getRole, getStoredUser, getUserId } from "../utils/session";

export default function useCurrentUser() {
  return useMemo(() => {
    const user = getStoredUser();

    return {
      user,
      userId: getUserId(user),
      role: getRole(user),
      isAuthenticated: Boolean(user)
    };
  }, []);
}
