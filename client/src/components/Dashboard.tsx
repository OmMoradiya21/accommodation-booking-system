import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useGlobalContext } from "../hooks/useGlobalContext";
import { UsersManagement } from "./admin/UsersManagement";
import { CompaniesManagement } from "./admin/CompaniesManagement";

export const Dashboard = () => {
  const { user, selectedCompany, logout, isAuthenticated, isLoading } =
    useGlobalContext();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"overview" | "users" | "companies">("overview");

  const isAdmin = Boolean(
    user?.role?.toLowerCase() === "admin" ||
      user?.permissions?.includes("can_manage_users") ||
      user?.permissions?.includes("can_create_company") ||
      user?.email?.toLowerCase().includes("admin"),
  );

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        navigate("/");
      } else if (!selectedCompany) {
        navigate("/company");
      }
    }
  }, [isAuthenticated, user, selectedCompany, isLoading, navigate]);

  if (isLoading || !user || !selectedCompany) {
    return null;
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fafafa" }}>
      <header className="navbar">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontWeight: "600", fontSize: "0.95rem" }}>
            Accommodation Booking
          </span>
          <span style={{ color: "#d4d4d8" }}>|</span>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", color: "#71717a" }}>Company:</span>
            <span style={{ fontWeight: "600", fontSize: "0.85rem" }}>
              {selectedCompany.name}
            </span>
            <button
              type="button"
              className="btn-outline"
              style={{ padding: "0.15rem 0.45rem", fontSize: "0.75rem" }}
              onClick={() => navigate("/company")}
            >
              Switch
            </button>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {isAdmin && (
            <span className="badge dark">
              ADMIN
            </span>
          )}
          <span style={{ fontSize: "0.85rem", color: "#71717a" }}>
            {user.name} ({user.email})
          </span>
          <button
            type="button"
            className="btn-outline"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      <main style={{ maxWidth: "1000px", margin: "2rem auto", padding: "0 1.5rem" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
            <div>
              <h1 style={{ fontSize: "1.35rem", fontWeight: "600", marginBottom: "0.25rem" }}>
                {activeTab === "overview"
                  ? selectedCompany.name
                  : activeTab === "users"
                  ? "User Management"
                  : "Company Management"}
              </h1>
              <p style={{ color: "#71717a", fontSize: "0.85rem" }}>
                Workspace ID: <span style={{ fontFamily: "monospace" }}>{selectedCompany.id}</span>
              </p>
            </div>
          </div>

          {isAdmin && (
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                marginTop: "1.25rem",
                borderBottom: "1px solid #e4e4e7",
                paddingBottom: "0.5rem",
              }}
            >
              <button
                type="button"
                className="btn-outline"
                style={{
                  backgroundColor: activeTab === "overview" ? "#18181b" : "#ffffff",
                  color: activeTab === "overview" ? "#ffffff" : "#18181b",
                  border: `1px solid ${activeTab === "overview" ? "#18181b" : "#e4e4e7"}`,
                }}
                onClick={() => setActiveTab("overview")}
              >
                Workspace Overview
              </button>
              <button
                type="button"
                id="admin-users-tab-btn"
                className="btn-outline"
                style={{
                  backgroundColor: activeTab === "users" ? "#18181b" : "#ffffff",
                  color: activeTab === "users" ? "#ffffff" : "#18181b",
                  border: `1px solid ${activeTab === "users" ? "#18181b" : "#e4e4e7"}`,
                }}
                onClick={() => setActiveTab("users")}
              >
                Users & Companies
              </button>
              <button
                type="button"
                id="admin-companies-tab-btn"
                className="btn-outline"
                style={{
                  backgroundColor: activeTab === "companies" ? "#18181b" : "#ffffff",
                  color: activeTab === "companies" ? "#ffffff" : "#18181b",
                  border: `1px solid ${activeTab === "companies" ? "#18181b" : "#e4e4e7"}`,
                }}
                onClick={() => setActiveTab("companies")}
              >
                Company CRUD
              </button>
            </div>
          )}
        </div>

        {isAdmin && activeTab === "users" && <UsersManagement />}
        {isAdmin && activeTab === "companies" && <CompaniesManagement />}

        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e4e4e7",
                  borderRadius: "8px",
                  padding: "1.25rem",
                }}
              >
                <div style={{ fontSize: "0.8rem", color: "#71717a", marginBottom: "0.35rem" }}>
                  Active Workspace
                </div>
                <div style={{ fontSize: "1.1rem", fontWeight: "600" }}>
                  {selectedCompany.name}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#a1a1aa", marginTop: "0.25rem", fontFamily: "monospace" }}>
                  {selectedCompany.id}
                </div>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e4e4e7",
                  borderRadius: "8px",
                  padding: "1.25rem",
                }}
              >
                <div style={{ fontSize: "0.8rem", color: "#71717a", marginBottom: "0.35rem" }}>
                  User Role
                </div>
                <div style={{ fontSize: "1.1rem", fontWeight: "600" }}>
                  {user.role || (isAdmin ? "ADMIN" : "USER")}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#a1a1aa", marginTop: "0.25rem" }}>
                  {user.email}
                </div>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e4e4e7",
                  borderRadius: "8px",
                  padding: "1.25rem",
                }}
              >
                <div style={{ fontSize: "0.8rem", color: "#71717a", marginBottom: "0.35rem" }}>
                  Assigned Companies
                </div>
                <div style={{ fontSize: "1.1rem", fontWeight: "600" }}>
                  {user.companies?.length || 1}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#a1a1aa", marginTop: "0.25rem" }}>
                  Total accessible workspaces
                </div>
              </div>
            </div>

            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e4e4e7",
                borderRadius: "8px",
                padding: "1.25rem",
              }}
            >
              <div style={{ fontWeight: "600", fontSize: "0.9rem", marginBottom: "0.75rem" }}>
                Granted Permissions
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {user.permissions && user.permissions.length > 0 ? (
                  user.permissions.map((p) => (
                    <span key={p} className="badge">
                      {p}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: "0.85rem", color: "#71717a" }}>
                    Standard user permissions.
                  </span>
                )}
              </div>
            </div>

            {isAdmin && (
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e4e4e7",
                  borderRadius: "8px",
                  padding: "1.25rem",
                }}
              >
                <div style={{ fontWeight: "600", fontSize: "0.9rem", marginBottom: "0.75rem" }}>
                  Admin Quick Actions
                </div>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => setActiveTab("users")}
                  >
                    Manage Users & Companies &rarr;
                  </button>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => setActiveTab("companies")}
                  >
                    Manage Companies CRUD &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
