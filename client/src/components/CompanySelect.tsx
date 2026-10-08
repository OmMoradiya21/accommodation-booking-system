import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useGlobalContext } from "../hooks/useGlobalContext";
import type { Company } from "../types.model";

export const CompanySelect = () => {
  const { user, selectedCompany, selectCompany, logout, isAuthenticated, isLoading } =
    useGlobalContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div style={{ padding: "3rem", textAlign: "center", color: "#71717a", fontSize: "0.9rem" }}>
        Loading account...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const companies: Company[] = user.companies || [];

  const handleSelect = (company: Company) => {
    // Store selected company in React state only (not in localStorage)
    selectCompany(company);
    navigate("/dashboard");
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fafafa" }}>
      {/* Minimal Top Bar */}
      <header className="navbar-minimal">
        <div style={{ fontWeight: "600", fontSize: "0.95rem" }}>
          Accommodation Booking
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "0.85rem", color: "#71717a" }}>
            {user.email}
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

      {/* Main Content */}
      <main style={{ maxWidth: "680px", margin: "2.5rem auto", padding: "0 1.5rem" }}>
        <div style={{ marginBottom: "1.75rem" }}>
          <h1 style={{ fontSize: "1.35rem", fontWeight: "600", marginBottom: "0.25rem" }}>
            Select Company
          </h1>
          <p style={{ color: "#71717a", fontSize: "0.85rem" }}>
            Choose a workspace to continue
          </p>
        </div>

        {companies.length === 0 ? (
          <div
            style={{
              padding: "2rem",
              background: "#ffffff",
              border: "1px solid #e4e4e7",
              borderRadius: "8px",
              textAlign: "center",
              color: "#71717a",
              fontSize: "0.9rem",
            }}
          >
            No companies assigned to your account.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {companies.map((company) => {
              const isSelected = selectedCompany?.id === company.id;
              return (
                <div
                  key={company.id}
                  id={`company-item-${company.id}`}
                  className={`company-card ${isSelected ? "selected" : ""}`}
                  onClick={() => handleSelect(company)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleSelect(company);
                    }
                  }}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "1rem 1.25rem",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "600", fontSize: "0.95rem", marginBottom: "0.2rem" }}>
                      {company.name}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#a1a1aa", fontFamily: "monospace" }}>
                      {company.id}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-outline"
                    style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}
                  >
                    Select &rarr;
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
