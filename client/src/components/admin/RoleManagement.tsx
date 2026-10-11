import { Navigate } from "react-router";
import { useGlobalContext } from "../../hooks/useGlobalContext";
import { useEffect, useState } from "react";
import { api } from "../../lib/axios";
import type { Role } from "../../types.model";

type ModelNameType = "CREATE" | "UPDATE";

interface ModelProps {
  name: ModelNameType;
  initialName?: string;
  initialDescription?: string;
  handleSubmitBtn: (name: string, description: string) => Promise<void> | void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const Model = ({
  name,
  initialName = "",
  initialDescription = "",
  handleSubmitBtn,
  onCancel,
  isSubmitting = false,
}: ModelProps) => {
  const [roleName, setRoleName] = useState(initialName);
  const [roleDescription, setRoleDescription] = useState(initialDescription);
  const [validationError, setValidationError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      setValidationError("Role name is required");
      return;
    }
    setValidationError(null);
    try {
      await handleSubmitBtn(roleName.trim(), roleDescription.trim());
      if (name === "CREATE") {
        setRoleName("");
        setRoleDescription("");
      }
    } catch {
      // Error handled by parent
    }
  };

  return (
    <div className="surface-card p-4 border-round shadow-1 border-1 surface-border mb-4">
      <div className="flex align-items-center justify-content-between mb-3">
        <div className="text-xl font-semibold text-900 flex align-items-center gap-2">
          <i
            className={
              name === "CREATE"
                ? "pi pi-shield text-primary"
                : "pi pi-pencil text-primary"
            }
          />
          <span>{name === "CREATE" ? "Create New Role" : "Edit Role"}</span>
        </div>
        {name === "UPDATE" && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn-outline text-xs"
            title="Cancel editing"
            disabled={isSubmitting}
          >
            <i className="pi pi-times" />
            <span>Cancel</span>
          </button>
        )}
      </div>

      {validationError && (
        <div className="p-2 mb-3 border-round text-sm bg-red-50 text-red-700 border-1 border-red-200 flex align-items-center gap-2">
          <i className="pi pi-exclamation-circle" />
          <span>{validationError}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-column gap-3">
        <div className="grid">
          <div className="col-12 md:col-6 flex flex-column gap-1">
            <label
              htmlFor="roleName"
              className="text-xs font-semibold text-700 uppercase"
            >
              Role Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="roleName"
              value={roleName}
              onChange={(e) => {
                setRoleName(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="e.g. MANAGER"
              className="input"
              required
            />
          </div>

          <div className="col-12 md:col-6 flex flex-column gap-1">
            <label
              htmlFor="roleDescription"
              className="text-xs font-semibold text-700 uppercase"
            >
              Role Description
            </label>
            <input
              type="text"
              id="roleDescription"
              value={roleDescription}
              onChange={(e) => setRoleDescription(e.target.value)}
              placeholder="Enter role description"
              className="input"
            />
          </div>
        </div>

        <div className="flex gap-2 justify-content-end mt-2">
          {name === "UPDATE" && onCancel && (
            <button
              type="button"
              onClick={onCancel}
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
                  : name === "CREATE"
                    ? "pi pi-plus mr-2"
                    : "pi pi-check mr-2"
              }
            />
            <span>
              {isSubmitting
                ? "Saving..."
                : name === "CREATE"
                  ? "Create Role"
                  : "Update Role"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export const RoleManagement = () => {
  const { user, isLoading } = useGlobalContext();

  const [roles, setRoles] = useState<Role[]>([]);
  const [isFetchingRoles, setIsFetchingRoles] = useState(true);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchRoles = async () => {
    setIsFetchingRoles(true);
    try {
      const res = await api.get("roles");
      setRoles(res.data || []);
    } catch (error: unknown) {
      console.error("Error fetching roles:", error);
      const errObj = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setFeedback({
        type: "error",
        text:
          errObj?.response?.data?.message ||
          errObj?.message ||
          "Error fetching roles",
      });
    } finally {
      setIsFetchingRoles(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    api
      .get("roles")
      .then((res) => {
        if (isMounted) {
          setRoles(res.data || []);
        }
      })
      .catch((error: unknown) => {
        if (!isMounted) return;
        console.error("Error fetching roles:", error);
        const errObj = error as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        setFeedback({
          type: "error",
          text:
            errObj?.response?.data?.message ||
            errObj?.message ||
            "Error fetching roles",
        });
      })
      .finally(() => {
        if (isMounted) {
          setIsFetchingRoles(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const createRole = async (name: string, description: string) => {
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const newRole = { name, description };
      await api.post("roles", newRole);
      setFeedback({
        type: "success",
        text: `Role "${name}" created successfully!`,
      });
      await fetchRoles();
    } catch (error: unknown) {
      console.error("Error creating role:", error);
      const errObj = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setFeedback({
        type: "error",
        text:
          errObj?.response?.data?.message ||
          errObj?.message ||
          "Error creating role",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateRole = async (name: string, description: string) => {
    if (!editingRole) return;
    setIsSubmitting(true);
    setFeedback(null);
    try {
      await api.patch(`roles/${editingRole.id}`, { name, description });
      setFeedback({
        type: "success",
        text: `Role "${name}" updated successfully!`,
      });
      setEditingRole(null);
      await fetchRoles();
    } catch (error: unknown) {
      console.error("Error updating role:", error);
      const errObj = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setFeedback({
        type: "error",
        text:
          errObj?.response?.data?.message ||
          errObj?.message ||
          "Error updating role",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRole = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete role "${name}"?`)) {
      return;
    }
    setDeletingRoleId(id);
    setFeedback(null);
    try {
      await api.delete(`roles/${id}`);
      setFeedback({
        type: "success",
        text: `Role "${name}" deleted successfully!`,
      });
      if (editingRole?.id === id) {
        setEditingRole(null);
      }
      await fetchRoles();
    } catch (error: unknown) {
      console.error("Error deleting role:", error);
      const errObj = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setFeedback({
        type: "error",
        text:
          errObj?.response?.data?.message ||
          errObj?.message ||
          "Error deleting role",
      });
    } finally {
      setDeletingRoleId(null);
    }
  };

  const handleStartEdit = (role: Role) => {
    setEditingRole(role);
    setFeedback(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingRole(null);
  };

  if (isLoading) {
    return (
      <div className="p-5 text-center text-500">
        <i className="pi pi-spin pi-spinner text-3xl mb-2 block" />
        <span>Loading...</span>
      </div>
    );
  }

  if (isLoading) return null;
  if (user?.role?.toLowerCase() !== "admin") {
    return <Navigate to="/user" replace />;
  }

  return (
    <div className="p-4 max-w-7xl mx-auto flex flex-column gap-3">
      <div className="flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-900 m-0">Role Management</h1>
          <p className="text-sm text-500 m-0 mt-1">
            Configure system roles, access designations, and permissions
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

      <Model
        key={editingRole ? `edit-${editingRole.id}` : "create"}
        name={editingRole ? "UPDATE" : "CREATE"}
        initialName={editingRole?.name || ""}
        initialDescription={editingRole?.description || ""}
        handleSubmitBtn={editingRole ? updateRole : createRole}
        onCancel={handleCancelEdit}
        isSubmitting={isSubmitting}
      />


      <div className="surface-card border-round shadow-1 border-1 surface-border overflow-hidden">
        <div className="p-3 border-bottom-1 surface-border flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="flex align-items-center gap-2">
            <h2 className="text-base font-semibold text-900 m-0">
              Configured Roles
            </h2>
            <span className="badge">
              {roles.length} {roles.length === 1 ? "role" : "roles"}
            </span>
          </div>

          <button
            type="button"
            onClick={fetchRoles}
            className="btn-outline text-xs"
            title="Refresh list"
            disabled={isFetchingRoles}
          >
            <i
              className={
                isFetchingRoles ? "pi pi-spin pi-spinner" : "pi pi-refresh"
              }
            />
            <span>Refresh</span>
          </button>
        </div>

        {isFetchingRoles && roles.length === 0 ? (
          <div className="p-5 text-center text-500">
            <i className="pi pi-spin pi-spinner text-2xl mb-2 block" />
            <span>Loading roles...</span>
          </div>
        ) : roles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: "80px" }}>Sr. No.</th>
                  <th style={{ minWidth: "150px" }}>Name</th>
                  <th>Description</th>
                  <th style={{ width: "190px" }} className="text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {roles.map(({ id, name, description }, index) => {
                  const isCurrentRowEditing = editingRole?.id === id;
                  return (
                    <tr
                      key={id}
                      className={isCurrentRowEditing ? "surface-100" : ""}
                    >
                      <td>
                        <span className="text-600 font-medium">
                          {index + 1}
                        </span>
                      </td>
                      <td>
                        <div className="flex align-items-center gap-2">
                          <span className="badge dark font-semibold uppercase">
                            {name}
                          </span>
                          {isCurrentRowEditing && (
                            <span className="text-xs text-primary font-medium">
                              (editing)
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="text-700 text-sm">
                          {description || (
                            <span className="text-400 italic">
                              No description
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex gap-2 justify-content-end">
                          <button
                            type="button"
                            onClick={() =>
                              handleStartEdit({ id, name, description })
                            }
                            className="btn-outline text-xs"
                            title="Edit this role"
                          >
                            <i className="pi pi-pencil text-primary" />
                            <span>Update</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRole(id, name)}
                            className="btn-outline text-xs text-red-600 border-red-200 hover:bg-red-50"
                            title="Delete this role"
                            disabled={deletingRoleId === id}
                          >
                            <i
                              className={
                                deletingRoleId === id
                                  ? "pi pi-spin pi-spinner"
                                  : "pi pi-trash"
                              }
                            />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5 text-center text-500">
            <i className="pi pi-shield text-3xl mb-2 text-400 block" />
            <p className="m-0 font-medium text-900">No roles found</p>
            <p className="text-xs text-500 mt-1">
              Create your first role using the form above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
