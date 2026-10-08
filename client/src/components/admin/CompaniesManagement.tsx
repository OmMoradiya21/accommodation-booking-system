import { useEffect, useState } from "react";
import { api } from "../../lib/axios";
import type { Company } from "../../types.model";

interface ExtendedCompany extends Company {
  address?: string;
  industry?: string;
  createdAt?: string;
}

export const CompaniesManagement = () => {
  const [companies, setCompanies] = useState<ExtendedCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create Form State
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [industry, setIndustry] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Edit State
  const [editingCompany, setEditingCompany] = useState<ExtendedCompany | null>(null);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editIndustry, setEditIndustry] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Feedback State
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadCompanies = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/companies");
      setCompanies(res.data || []);
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } }; message?: string };
      setFeedback({
        type: "error",
        text: errObj?.response?.data?.message || errObj?.message || "Failed to load companies",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    api
      .get("/companies")
      .then((res) => {
        if (isMounted) setCompanies(res.data || []);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const errObj = err as { response?: { data?: { message?: string } }; message?: string };
        setFeedback({
          type: "error",
          text: errObj?.response?.data?.message || errObj?.message || "Failed to load companies",
        });
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsCreating(true);

    try {
      await api.post("/companies", {
        name,
        address: address || undefined,
        industry: industry || undefined,
      });

      setFeedback({ type: "success", text: `Company "${name}" created successfully!` });
      setName("");
      setAddress("");
      setIndustry("");
      loadCompanies();
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } }; message?: string };
      setFeedback({
        type: "error",
        text: errObj?.response?.data?.message || errObj?.message || "Failed to create company",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const startEditing = (comp: ExtendedCompany) => {
    setEditingCompany(comp);
    setEditName(comp.name);
    setEditAddress(comp.address || "");
    setEditIndustry(comp.industry || "");
  };

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;
    setFeedback(null);
    setIsUpdating(true);

    try {
      await api.patch(`/companies/${editingCompany.id}`, {
        name: editName,
        address: editAddress || undefined,
        industry: editIndustry || undefined,
      });

      setFeedback({ type: "success", text: `Company updated successfully!` });
      setEditingCompany(null);
      loadCompanies();
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } }; message?: string };
      setFeedback({
        type: "error",
        text: errObj?.response?.data?.message || errObj?.message || "Failed to update company",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteCompany = async (comp: ExtendedCompany) => {
    if (!window.confirm(`Delete company "${comp.name}"? This will unlink associated resources.`)) {
      return;
    }

    try {
      await api.delete(`/companies/${comp.id}`);
      setFeedback({ type: "success", text: `Company "${comp.name}" deleted successfully.` });
      loadCompanies();
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } }; message?: string };
      setFeedback({
        type: "error",
        text: errObj?.response?.data?.message || errObj?.message || "Failed to delete company",
      });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Feedback banner */}
      {feedback && (
        <div
          style={{
            padding: "0.65rem 0.85rem",
            borderRadius: "6px",
            fontSize: "0.85rem",
            backgroundColor: feedback.type === "success" ? "#f0fdf4" : "#fef2f2",
            border: `1px solid ${feedback.type === "success" ? "#bbf7d0" : "#fee2e2"}`,
            color: feedback.type === "success" ? "#166534" : "#991b1b",
          }}
        >
          {feedback.text}
        </div>
      )}

      {/* Edit Company Modal/Inline Box if active */}
      {editingCompany && (
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #18181b",
            borderRadius: "8px",
            padding: "1.25rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: "600" }}>Edit Company</h2>
            <button
              type="button"
              className="btn-outline"
              style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}
              onClick={() => setEditingCompany(null)}
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleUpdateCompany}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "0.85rem",
                marginBottom: "1rem",
              }}
            >
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "500", marginBottom: "0.3rem" }}>
                  Company Name
                </label>
                <input
                  type="text"
                  className="minimal-input"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "500", marginBottom: "0.3rem" }}>
                  Address
                </label>
                <input
                  type="text"
                  className="minimal-input"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "500", marginBottom: "0.3rem" }}>
                  Industry
                </label>
                <input
                  type="text"
                  className="minimal-input"
                  value={editIndustry}
                  onChange={(e) => setEditIndustry(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="submit"
                className="btn-minimal"
                style={{ width: "auto", padding: "0.5rem 1.25rem" }}
                disabled={isUpdating}
              >
                {isUpdating ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={() => setEditingCompany(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create Company Minimal Form */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e4e4e7",
          borderRadius: "8px",
          padding: "1.25rem",
        }}
      >
        <div style={{ marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "0.2rem" }}>
            Create New Company
          </h2>
          <p style={{ color: "#71717a", fontSize: "0.8rem" }}>
            Add a new organization workspace to the system.
          </p>
        </div>

        <form onSubmit={handleCreateCompany}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "0.85rem",
              marginBottom: "1rem",
            }}
          >
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "500", marginBottom: "0.3rem" }}>
                Company Name *
              </label>
              <input
                type="text"
                className="minimal-input"
                placeholder="e.g. Apex Hospitality Corp"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "500", marginBottom: "0.3rem" }}>
                Address (Optional)
              </label>
              <input
                type="text"
                className="minimal-input"
                placeholder="e.g. 100 Main St, Suite 400"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "500", marginBottom: "0.3rem" }}>
                Industry (Optional)
              </label>
              <input
                type="text"
                className="minimal-input"
                placeholder="e.g. Hospitality / Lodging"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-minimal"
            style={{ width: "auto", padding: "0.55rem 1.25rem" }}
            disabled={isCreating}
          >
            {isCreating ? "Creating..." : "Create Company"}
          </button>
        </form>
      </div>

      {/* Companies List Minimal Table */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e4e4e7",
          borderRadius: "8px",
          padding: "1.25rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div>
            <h2 style={{ fontSize: "1rem", fontWeight: "600" }}>All Companies</h2>
            <span style={{ fontSize: "0.8rem", color: "#71717a" }}>{companies.length} active companies</span>
          </div>
          <button type="button" className="btn-outline" onClick={loadCompanies}>
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div style={{ textAlign: "center", padding: "1.5rem", color: "#71717a", fontSize: "0.85rem" }}>
            Loading companies...
          </div>
        ) : companies.length === 0 ? (
          <div style={{ textAlign: "center", padding: "1.5rem", color: "#71717a", fontSize: "0.85rem" }}>
            No companies found.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="minimal-table">
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>Industry</th>
                  <th>Address</th>
                  <th>ID</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: "600" }}>{c.name}</td>
                    <td style={{ color: "#71717a" }}>{c.industry || "—"}</td>
                    <td style={{ color: "#71717a" }}>{c.address || "—"}</td>
                    <td style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#a1a1aa" }}>
                      {c.id.slice(0, 8)}...
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "0.4rem" }}>
                        <button
                          type="button"
                          className="btn-outline"
                          style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}
                          onClick={() => startEditing(c)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-outline"
                          style={{ color: "#ef4444", fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}
                          onClick={() => handleDeleteCompany(c)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
