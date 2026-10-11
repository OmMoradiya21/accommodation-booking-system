import { NavLink, useNavigate } from "react-router";
import { useGlobalContext } from "../hooks/useGlobalContext";
import { useEffect } from "react";

export const NavBar = () => {
  const { user, selectedCompany, logout, isAuthenticated, isLoading } =
    useGlobalContext();
  const navigate = useNavigate();

  const isAdmin = Boolean(user?.role?.toLowerCase() === "admin");

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        navigate("/");
      } else if (!selectedCompany) {
        navigate("/select-company");
      }
    }
  }, [isAuthenticated, user, selectedCompany, isLoading, navigate]);

  if (isLoading || !user || !selectedCompany) {
    return null;
  }

  const handleSignOut = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="flex flex-column w-full surface-0 border-bottom-1 surface-border">
      <header className="flex align-items-center justify-content-between px-4 py-3 border-bottom-1 surface-border flex-wrap gap-2">
        <div className="flex align-items-center gap-3">
          <div
            className="flex align-items-center gap-2 cursor-pointer"
            onClick={() => navigate("/user")}
          >
            <i className="pi pi-building text-base text-900" />
            <span className="font-semibold text-sm md:text-base text-900">
              Accommodation Booking
            </span>
          </div>

          <span className="text-300 font-light hidden sm:inline">|</span>

          <div className="flex align-items-center gap-2 px-2 py-1 border-round surface-100 border-1 surface-border">
            <span className="text-xs text-500 font-medium">Company:</span>
            <span className="text-xs font-semibold text-900">
              {selectedCompany.name}
            </span>
            <button
              type="button"
              className="btn-outline"
              style={{ padding: "0.15rem 0.45rem", fontSize: "0.75rem" }}
              onClick={() => navigate("/select-company")}
              title="Switch company"
            >
              <i className="pi pi-sync text-xs" />
              <span>Switch</span>
            </button>
          </div>
        </div>

        <div className="flex align-items-center gap-3">
          {isAdmin ? (
            <span className="badge dark">ADMIN</span>
          ) : (
            <span className="badge">{user.role?.toUpperCase() || "USER"}</span>
          )}

          <div className="flex align-items-center gap-2 text-xs text-600 hidden sm:flex">
            <i className="pi pi-user text-xs text-500" />
            <span>
              {user.name}{" "}
              <span className="text-400 font-normal">({user.email})</span>
            </span>
          </div>

          <button
            type="button"
            className="btn-outline"
            style={{ fontSize: "0.8rem", padding: "0.35rem 0.65rem" }}
            onClick={handleSignOut}
          >
            <i className="pi pi-sign-out text-xs" />
            <span>Sign out</span>
          </button>
        </div>
      </header>

      <div className="flex align-items-center gap-2 px-4 py-2 surface-0 overflow-x-auto white-space-nowrap">
        <NavLink
          to=""
          end
          className={({ isActive }) =>
            `nav-tab-link ${isActive ? "active" : ""}`
          }
        >
          <i className="pi pi-th-large" />
          <span>Workspace</span>
        </NavLink>

        {(isAdmin || user.permissions?.includes("company:read")) && (
          <NavLink
            to="company-management"
            className={({ isActive }) =>
              `nav-tab-link ${isActive ? "active" : ""}`
            }
          >
            <i className="pi pi-building" />
            <span>Company</span>
          </NavLink>
        )}

        {(isAdmin || user.permissions?.includes("user:read")) && (
          <NavLink
            to="user-management"
            className={({ isActive }) =>
              `nav-tab-link ${isActive ? "active" : ""}`
            }
          >
            <i className="pi pi-users" />
            <span>Users</span>
          </NavLink>
        )}

        {(isAdmin || user.permissions?.includes("customer:read")) && (
          <NavLink
            to="customer-management"
            className={({ isActive }) =>
              `nav-tab-link ${isActive ? "active" : ""}`
            }
          >
            <i className="pi pi-id-card" />
            <span>Customers</span>
          </NavLink>
        )}

        {(isAdmin || user.permissions?.includes("accommodation:read")) && (
          <NavLink
            to="accommodation-management"
            className={({ isActive }) =>
              `nav-tab-link ${isActive ? "active" : ""}`
            }
          >
            <i className="pi pi-home" />
            <span>Accommodations</span>
          </NavLink>
        )}

        {(isAdmin || user.permissions?.includes("booking:read")) && (
          <NavLink
            to="booking-management"
            className={({ isActive }) =>
              `nav-tab-link ${isActive ? "active" : ""}`
            }
          >
            <i className="pi pi-calendar" />
            <span>Bookings</span>
          </NavLink>
        )}

        {(isAdmin || user.permissions?.includes("permission:read")) && (
          <NavLink
            to="permission-management"
            className={({ isActive }) =>
              `nav-tab-link ${isActive ? "active" : ""}`
            }
          >
            <i className="pi pi-key" />
            <span>Permissions</span>
          </NavLink>
        )}

        {(isAdmin || user.permissions?.includes("role:read")) && (
          <NavLink
            to="role-management"
            className={({ isActive }) =>
              `nav-tab-link ${isActive ? "active" : ""}`
            }
          >
            <i className="pi pi-shield" />
            <span>Roles</span>
          </NavLink>
        )}
      </div>
    </nav>
  );
};
