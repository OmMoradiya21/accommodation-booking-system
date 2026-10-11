import React, { useEffect, useState } from "react";
import { api } from "../lib/axios";
import type { Company } from "../types.model";
import { useGlobalContext } from "../hooks/useGlobalContext";

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
  const { user } = useGlobalContext();

  const [users, setUsers] = useState<UserListItem[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([]);
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const hasCreatePermission = Boolean(
    user?.permissions?.includes("user:create"),
  );
  const hasUpdatePermission = Boolean(
    user?.permissions?.includes("user:update"),
  );
  const hasDeletePermission = Boolean(
    user?.permissions?.includes("user:delete"),
  );

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
        const defaultRole =
          roleList.find((r: RoleItem) => r.name === "USER") || roleList[0];
        setRoleId(defaultRole.id);
      }
    } catch (err: unknown) {
      const errObj = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setFeedback({
        type: "error",
        text:
          errObj?.response?.data?.message ||
          errObj?.message ||
          "Failed to load user data",
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
          const defaultRole =
            roleList.find((r: RoleItem) => r.name === "USER") || roleList[0];
          setRoleId(defaultRole.id);
        }
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const errObj = err as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        setFeedback({
          type: "error",
          text:
            errObj?.response?.data?.message ||
            errObj?.message ||
            "Failed to load user data",
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

  const handleStartEdit = (item: UserListItem) => {
    setEditingUser(item);
    setName(item.name);
    setEmail(item.email);
    setPassword("");
    setRoleId(
      item.role?.id ||
        roles.find((r) => r.name === "USER")?.id ||
        roles[0]?.id ||
        "",
    );
    setSelectedCompanyIds(
      item.companies ? item.companies.map((c) => c.id) : [],
    );
    setFeedback(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setName("");
    setEmail("");
    setPassword("");
    const defaultRole = roles.find((r) => r.name === "USER") || roles[0];
    setRoleId(defaultRole?.id || "");
    setSelectedCompanyIds([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!name.trim() || !email.trim()) {
      setFeedback({ type: "error", text: "Please enter name and email." });
      return;
    }

    if (!editingUser) {
      if (!password || password.length < 6) {
        setFeedback({
          type: "error",
          text: "Password is required and must be at least 6 characters.",
        });
        return;
      }
    } else if (password && password.length < 6) {
      setFeedback({
        type: "error",
        text: "New password must be at least 6 characters.",
      });
      return;
    }

    if (selectedCompanyIds.length === 0) {
      setFeedback({
        type: "error",
        text: "Please select at least one company for the user.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingUser) {
        const payload: {
          name: string;
          email: string;
          role_id?: string;
          company_ids: string[];
          password?: string;
        } = {
          name: name.trim(),
          email: email.trim(),
          role_id: roleId || undefined,
          company_ids: selectedCompanyIds,
        };

        if (password.trim()) {
          payload.password = password.trim();
        }

        await api.patch(`/users/${editingUser.id}`, payload);
        setFeedback({
          type: "success",
          text: `User "${name}" updated successfully!`,
        });
        handleCancelEdit();
      } else {
        // Create user
        await api.post("/users", {
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
          role_id: roleId || undefined,
          company_ids: selectedCompanyIds,
        });
        setFeedback({
          type: "success",
          text: `User "${name}" created successfully!`,
        });
        handleCancelEdit();
      }

      await loadData();
    } catch (err: unknown) {
      const errObj = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setFeedback({
        type: "error",
        text:
          errObj?.response?.data?.message ||
          errObj?.message ||
          "Operation failed",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userItem: UserListItem) => {
    if (!window.confirm(`Delete user "${userItem.name}"?`)) return;

    try {
      await api.delete(`/users/${userItem.id}`);
      setFeedback({
        type: "success",
        text: `User "${userItem.name}" deleted successfully.`,
      });
      if (editingUser?.id === userItem.id) {
        handleCancelEdit();
      }
      await loadData();
    } catch (err: unknown) {
      const errObj = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setFeedback({
        type: "error",
        text:
          errObj?.response?.data?.message ||
          errObj?.message ||
          "Failed to delete user",
      });
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto flex flex-column gap-3">
     
      <div className="flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-900 m-0">User Management</h1>
          <p className="text-sm text-500 m-0 mt-1">
            Create, update, and manage system user accounts, roles, and company access
          </p>
        </div>
      </div>


      {feedback && (
        <div
          className={`p-3 border-round text-sm flex align-items-center justify-content-between ${
            feedback.type === "success"
              ? "bg-green-50 text-green-700 border-1 border-green-200"
              : "bg-red-50 text-red-700 border-1 border-red-200"
          }`}
        >
          <div className="flex align-items-center gap-2">
            <i
              className={
                feedback.type === "success"
                  ? "pi pi-check-circle text-green-600"
                  : "pi pi-exclamation-circle text-red-600"
              }
            />
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="p-link text-600 hover:text-900 cursor-pointer border-none bg-transparent"
            title="Dismiss message"
          >
            <i className="pi pi-times" />
          </button>
        </div>
      )}

      {(hasCreatePermission || (hasUpdatePermission && editingUser)) && (
        <div className="surface-card p-4 border-round shadow-1 border-1 surface-border mb-3">
          <div className="flex align-items-center justify-content-between mb-3">
            <div className="text-xl font-semibold text-900 flex align-items-center gap-2">
              <i
                className={
                  editingUser
                    ? "pi pi-pencil text-primary"
                    : "pi pi-user-plus text-primary"
                }
              />
              <span>{editingUser ? "Edit User" : "Create New User"}</span>
            </div>
            {editingUser && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="btn-outline text-xs"
                title="Cancel editing"
                disabled={isSubmitting}
              >
                <i className="pi pi-times" />
                <span>Cancel</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-column gap-3">
            <div className="grid">
              <div className="col-12 md:col-6 lg:col-3 flex flex-column gap-1">
                <label
                  htmlFor="userName"
                  className="text-xs font-semibold text-700 uppercase"
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="userName"
                  className="input"
                  placeholder="e.g. Alex Smith"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="col-12 md:col-6 lg:col-3 flex flex-column gap-1">
                <label
                  htmlFor="userEmail"
                  className="text-xs font-semibold text-700 uppercase"
                >
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="userEmail"
                  className="input"
                  placeholder="alex@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="col-12 md:col-6 lg:col-3 flex flex-column gap-1">
                <label
                  htmlFor="userPassword"
                  className="text-xs font-semibold text-700 uppercase"
                >
                  {editingUser ? (
                    "Password (optional)"
                  ) : (
                    <>
                      Password <span className="text-red-500">*</span>
                    </>
                  )}
                </label>
                <input
                  type="password"
                  id="userPassword"
                  className="input"
                  placeholder={
                    editingUser
                      ? "Leave blank to keep unchanged"
                      : "Min 6 characters"
                  }
                  required={!editingUser}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="col-12 md:col-6 lg:col-3 flex flex-column gap-1">
                <label
                  htmlFor="userRole"
                  className="text-xs font-semibold text-700 uppercase"
                >
                  Role
                </label>
                <select
                  id="userRole"
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

            <div className="flex flex-column gap-2 mt-1">
              <label className="text-xs font-semibold text-700 uppercase">
                Assigned Companies <span className="text-red-500">*</span>
              </label>
              {companies.length === 0 ? (
                <span className="text-sm text-500 italic">
                  No companies available to assign.
                </span>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {companies.map((comp) => {
                    const isChecked = selectedCompanyIds.includes(comp.id);
                    return (
                      <label
                        key={comp.id}
                        className={`cursor-pointer inline-flex align-items-center gap-2 py-2 px-3 border-round border-1 transition-colors transition-duration-150 select-none text-sm ${
                          isChecked
                            ? "surface-900 text-0 border-900 font-medium"
                            : "surface-card text-700 surface-border hover:surface-100"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleCompanyToggle(comp.id)}
                          className="cursor-pointer"
                        />
                        <span>{comp.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-content-end mt-2">
              {editingUser && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="btn-outline"
                  disabled={isSubmitting}
                >
                  <i className="pi pi-times mr-1" />
                  <span>Cancel</span>
                </button>
              )}

              <button
                type="submit"
                className="btn-primary w-auto px-4"
                disabled={isSubmitting}
              >
                <i
                  className={
                    isSubmitting
                      ? "pi pi-spin pi-spinner mr-2"
                      : editingUser
                        ? "pi pi-check mr-2"
                        : "pi pi-plus mr-2"
                  }
                />
                <span>
                  {isSubmitting
                    ? "Saving..."
                    : editingUser
                      ? "Update User"
                      : "Create User"}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="surface-card border-round shadow-1 border-1 surface-border overflow-hidden">
        <div className="p-3 border-bottom-1 surface-border flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="flex align-items-center gap-2">
            <h2 className="text-base font-semibold text-900 m-0">
              System Users
            </h2>
            <span className="badge">
              {users.length} {users.length === 1 ? "user" : "users"}
            </span>
          </div>

          <button
            type="button"
            onClick={loadData}
            className="btn-outline text-xs"
            title="Refresh list"
            disabled={isLoading}
          >
            <i
              className={isLoading ? "pi pi-spin pi-spinner" : "pi pi-refresh"}
            />
            <span>Refresh</span>
          </button>
        </div>

        {isLoading && users.length === 0 ? (
          <div className="p-5 text-center text-500">
            <i className="pi pi-spin pi-spinner text-2xl mb-2 block" />
            <span>Loading users...</span>
          </div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="w-5rem">Sr. No.</th>
                  <th className="min-w-10rem">Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Assigned Companies</th>
                  {hasUpdatePermission && (
                    <th className="text-center w-6rem">Update</th>
                  )}
                  {hasDeletePermission && (
                    <th className="text-center w-6rem">Delete</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {users.map((u, index) => {
                  const isCurrentRowEditing = editingUser?.id === u.id;
                  return (
                    <tr
                      key={u.id}
                      className={isCurrentRowEditing ? "surface-100" : ""}
                    >
                      <td>
                        <span className="text-600 font-medium">
                          {index + 1}
                        </span>
                      </td>
                      <td>
                        <div className="flex align-items-center gap-2">
                          <span className="font-semibold text-900">{u.name}</span>
                          {isCurrentRowEditing && (
                            <span className="text-xs text-primary font-medium">
                              (editing)
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="text-sm text-600">{u.email}</span>
                      </td>
                      <td>
                        <span className="badge">{u.role?.name || "USER"}</span>
                      </td>
                      <td>
                        {u.companies && u.companies.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {u.companies.map((c) => (
                              <span
                                key={c.id}
                                className="text-xs py-1 px-2 border-round surface-100 border-1 surface-border text-700"
                              >
                                {c.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-400 italic text-sm">None</span>
                        )}
                      </td>

                      {hasUpdatePermission && (
                        <td className="text-center">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(u)}
                            className="btn-outline text-xs"
                            title="Edit user"
                          >
                            <i className="pi pi-pencil text-primary" />
                            <span>Update</span>
                          </button>
                        </td>
                      )}

                      {hasDeletePermission && (
                        <td className="text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u)}
                            className="btn-outline text-xs text-red-600 border-red-200 hover:bg-red-50"
                            title="Delete user"
                          >
                            <i className="pi pi-trash" />
                            <span>Delete</span>
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5 text-center text-500">
            <i className="pi pi-users text-3xl mb-2 text-400 block" />
            <p className="m-0 font-medium text-900">No users found</p>
            <p className="text-xs text-500 mt-1">
              Add your first user using the form above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
