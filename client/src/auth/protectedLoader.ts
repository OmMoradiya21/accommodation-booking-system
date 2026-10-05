import { redirect } from "react-router";
import { authProvider } from "./authProvider";
import { Role } from "../types.model";

export const requireRole = (allowedRoles?: Role[]) => {
  return async ({ request }: { request: Request }) => {
    const user = await authProvider.getUser();
    const url = new URL(request.url);

    // if not logged in
    if (!user) {
      const params = new URLSearchParams();
      params.set("from", url.pathname);
      throw redirect(`/login?${params.toString()}`);
    }

    // have not permission
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      throw redirect("/unauthorized");
    }

    return { user };
  };
};
