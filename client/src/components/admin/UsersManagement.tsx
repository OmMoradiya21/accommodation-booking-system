import { useEffect, useState } from "react";
import { api } from "../../lib/axios";
import type { Company } from "../../types.model";

interface RoleItem {
  id: string;
  name: string;
}

interface UserListItem {
  id: string;
  name: string;
  email: string;
  role?: { id: string; name: string };
  companies?: Company[];
  createdAt?: string;
}

export const UsersManagement = () => {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, compRes, rolesRes] = await Promise.all([
        api.get("/users"),
        api.get("/companies"),
        api.get("/roles").catch(() => ({ data: [] })),
      ]);

      setUsers(usersRes.data || []);
      setCompanies(compRes.data || []);
      const roleList = rolesRes.data || [];
      setRoles(roleList);
      if (roleList.length > 0 && !roleId) {
        const defaultRole = roleList.find((r: RoleItem) => r.name === "USER") || roleList[0];
        setRoleId(defaultRole.id);
      }
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } }; message?: string };
      setFeedback({
        type: "error",
        text: errObj?.response?.data?.message || errObj?.message || "Failed to load data",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      api.get("/users"),
      api.get("/companies"),
      api.get("/roles").catch(() => ({ data: [] })),
    ])
      .then(([usersRes, compRes, rolesRes]) => {
        if (!isMounted) return;
        setUsers(usersRes.data || []);
        setCompanies(compRes.data || []);
        const roleList = rolesRes.data || [];
        setRoles(roleList);
        if (roleList.length > 0) {
          const defaultRole = roleList.find((r: RoleItem) => r.name === "USER") || roleList[0];
          setRoleId(defaultRole.id);
        }
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const errObj = err as { response?: { data?: { message?: string } }; message?: string };
        setFeedback({
          type: "error",
          text: errObj?.response?.data?.message || errObj?.message || "Failed to load data",
        });
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCompanyToggle = (companyId: string) => {
    setSelectedCompanyIds((prev) =>
      prev.includes(companyId)
        ? prev.filter((id) => id !== companyId)
        : [...prev, companyId],
    );
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (selectedCompanyIds.length === 0) {
      setFeedback({ type: "error", text: "Please select at least one company for the user." });
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/users", {
        name,
        email,
        password,
        role_id: roleId || undefined,
        company_ids: selectedCompanyIds,
      });

      setFeedback({ type: "success", text: `User "${name}" created successfully!` });
      setName("");
      setEmail("");
      setPassword("");
      setSelectedCompanyIds([]);
      loadData();
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } }; message?: string };
      setFeedback({
        type: "error",
        text: errObj?.response?.data?.message || errObj?.message || "Failed to create user",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Delete user "${userName}"?`)) return;

    try {
      await api.delete(`/users/${userId}`);
      setFeedback({ type: "success", text: `User "${userName}" deleted.` });
      loadData();
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } }; message?: string };
      setFeedback({
        type: "error",
        text: errObj?.response?.data?.message || errObj?.message || "Failed to delete user",
      });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
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
            Create New User
          </h2>
          <p style={{ color: "#71717a", fontSize: "0.8rem" }}>
            Add a user and assign them to one or more companies.
          </p>
        </div>

        <form onSubmit={handleCreateUser}>
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
                Full Name
              </label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Alex Smith"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "500", marginBottom: "0.3rem" }}>
                Email Address
              </label>
              <input
                type="email"
                className="input"
                placeholder="alex@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "500", marginBottom: "0.3rem" }}>
                Password
              </label>
              <input
                type="password"
                className="input"
                placeholder="Min 6 characters"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "500", marginBottom: "0.3rem" }}>
                Role
              </label>
              <select
                className="input"
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
              >
                {roles.length > 0 ? (
                  roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))
                ) : (
                  <option value="">Default (USER)</option>
                )}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "500", marginBottom: "0.4rem" }}>
              Assigned Companies (Select one or more)
            </label>
            {companies.length === 0 ? (
              <p style={{ fontSize: "0.8rem", color: "#a1a1aa" }}>No companies available to assign.</p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                {companies.map((comp) => {
                  const isChecked = selectedCompanyIds.includes(comp.id);
                  return (
                    <label
                      key={comp.id}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        padding: "0.35rem 0.65rem",
                        borderRadius: "6px",
                        border: `1px solid ${isChecked ? "#18181b" : "#e4e4e7"}`,
                        backgroundColor: isChecked ? "#f4f4f5" : "#ffffff",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCompanyToggle(comp.id)}
                        style={{ cursor: "pointer" }}
                      />
                      <span>{comp.name}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: "auto", padding: "0.55rem 1.25rem" }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create User"}
          </button>
        </form>
      </div>

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
            <h2 style={{ fontSize: "1rem", fontWeight: "600" }}>System Users</h2>
            <span style={{ fontSize: "0.8rem", color: "#71717a" }}>{users.length} users registered</span>
          </div>
          <button type="button" className="btn-outline" onClick={loadData}>
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div style={{ textAlign: "center", padding: "1.5rem", color: "#71717a", fontSize: "0.85rem" }}>
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: "center", padding: "1.5rem", color: "#71717a", fontSize: "0.85rem" }}>
            No users found.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Companies</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: "500" }}>{u.name}</td>
                    <td style={{ color: "#71717a" }}>{u.email}</td>
                    <td>
                      <span className="badge">
                        {u.role?.name || "USER"}
                      </span>
                    </td>
                    <td>
                      {u.companies && u.companies.length > 0 ? (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                          {u.companies.map((c) => (
                            <span
                              key={c.id}
                              style={{
                                fontSize: "0.75rem",
                                padding: "0.15rem 0.45rem",
                                borderRadius: "4px",
                                backgroundColor: "#f4f4f5",
                                border: "1px solid #e4e4e7",
                              }}
                            >
                              {c.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: "#a1a1aa", fontSize: "0.75rem" }}>None</span>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        className="btn-outline"
                        style={{ color: "#ef4444", fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}
                        onClick={() => handleDeleteUser(u.id, u.name)}
                      >
                        Delete
                      </button>
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
