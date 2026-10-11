import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import type { Permission, Role } from "../../types.model";
import { api } from "../../lib/axios";
import { useGlobalContext } from "../../hooks/useGlobalContext";

export const PermissionManagement = () => {
  const { user, isLoading } = useGlobalContext();

  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState("not-selected");
  const [selectedRolePermission, setSelectedRolePermission] = useState<
    Permission[]
  >([]);

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolesRes, permissionsRes] = await Promise.all([
          api.get("roles"),
          api.get("permissions"),
        ]);
        setRoles(rolesRes.data || []);
        setAllPermissions(permissionsRes.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleRoleChange = async (roleId: string) => {
    setSelectedRoleId(roleId);
    setMessage("");

    if (roleId === "not-selected") {
      setSelectedRolePermission([]);
      return;
    }

    try {
      const res = await api.get(`/roles/${roleId}`);
      setSelectedRolePermission(res.data.permissions || []);
    } catch (error) {
      console.error("Error fetching role permissions:", error);
    }
  };

  const handleTogglePermission = (permission: Permission) => {
    const isChecked = selectedRolePermission.some((p) => p.id === permission.id);
    if (isChecked) {
      setSelectedRolePermission(
        selectedRolePermission.filter((p) => p.id !== permission.id),
      );
    } else {
      setSelectedRolePermission([...selectedRolePermission, permission]);
    }
  };

  const handleSavePermissions = async () => {
    if (selectedRoleId === "not-selected") return;

    setIsSaving(true);
    setMessage("");
    try {
      await api.patch(`/roles/${selectedRoleId}`, {
        permission_ids: selectedRolePermission.map((p) => p.id),
      });
      setMessage("Permissions saved successfully!");
    } catch (error) {
      console.error("Error saving permissions:", error);
      setMessage("Failed to save permissions.");
    } finally {
      setIsSaving(false);
    }
  };


  if (isLoading) return null;
  if (user?.role?.toLowerCase() !== "admin") {
    return <Navigate to="/user" replace />;
  }

  const isRoleSelected = selectedRoleId !== "not-selected";

  return (
    <div className="p-4 max-w-7xl mx-auto flex flex-column gap-3">

      <div className="surface-card p-4 border-round shadow-1 border-1 surface-border">
        <div className="flex flex-column md:flex-row align-items-start md:align-items-center justify-content-between gap-3 mb-3">
          <div>
            <h1 className="text-xl font-bold text-900 m-0">Permission Management</h1>
            <p className="text-sm text-500 m-0 mt-1">
              Select a role and assign permissions to it.
            </p>
          </div>


          <div className="flex align-items-center gap-2">
            <label htmlFor="roleSelection" className="font-semibold text-sm text-700">
              Role:
            </label>
            <select
              id="roleSelection"
              className="input"
              style={{ width: "auto", minWidth: "200px" }}
              value={selectedRoleId}
              onChange={(e) => handleRoleChange(e.target.value)}
            >
              <option value="not-selected">Choose Role</option>
              {roles.map(({ id, name }) => (
                <option value={id} key={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isRoleSelected && (
          <div className="flex flex-wrap align-items-center justify-content-between gap-2 pt-3 border-top-1 surface-border">
            <div className="flex align-items-center gap-2">
              <span className="text-sm text-600">
                Selected: <strong>{selectedRolePermission.length}</strong> of{" "}
                <strong>{allPermissions.length}</strong> permissions
              </span>
              <button
                type="button"
                onClick={() => setSelectedRolePermission(allPermissions)}
                className="btn-outline text-xs"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={() => setSelectedRolePermission([])}
                className="btn-outline text-xs"
              >
                Clear All
              </button>
            </div>

            <button
              type="button"
              onClick={handleSavePermissions}
              className="btn-primary w-auto text-sm px-4"
              disabled={isSaving}
            >
              <i className={isSaving ? "pi pi-spin pi-spinner mr-2" : "pi pi-check mr-2"} />
              <span>{isSaving ? "Saving..." : "Save"}</span>
            </button>
          </div>
        )}

        {message && (
          <div
            className={`mt-3 p-2 border-round text-sm font-medium ${
              message.includes("success")
                ? "bg-green-50 text-green-700 border-1 border-green-200"
                : "bg-red-50 text-red-700 border-1 border-red-200"
            }`}
          >
            {message}
          </div>
        )}
      </div>

      {!isRoleSelected ? (
        <div className="surface-card p-5 border-round shadow-1 border-1 surface-border text-center text-500">
          <i className="pi pi-shield text-3xl mb-2 text-400 block" />
          <p className="m-0 font-medium">Please choose a role from the dropdown above</p>
        </div>
      ) : (
        <div className="surface-card p-4 border-round shadow-1 border-1 surface-border">
          <h2 className="text-base font-semibold text-900 mb-3 mt-0">Permissions</h2>

          <div className="grid">
            {allPermissions.map((permission) => {
              const isChecked = selectedRolePermission.some(
                (p) => p.id === permission.id,
              );

              return (
                <div key={permission.id} className="col-12 sm:col-6 lg:col-4">
                  <label
                    htmlFor={`perm-${permission.id}`}
                    className={`flex align-items-center gap-2 p-2 border-round border-1 cursor-pointer select-none transition-colors ${
                      isChecked
                        ? "surface-100 border-primary font-semibold text-900"
                        : "surface-50 border-surface-200 text-700 hover:surface-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      id={`perm-${permission.id}`}
                      checked={isChecked}
                      onChange={() => handleTogglePermission(permission)}
                      style={{
                        width: "1.1rem",
                        height: "1.1rem",
                        cursor: "pointer",
                      }}
                    />
                    <span className="text-sm">{permission.name}</span>
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
