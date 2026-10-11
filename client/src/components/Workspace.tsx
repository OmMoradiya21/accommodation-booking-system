import { useGlobalContext } from "../hooks/useGlobalContext";

export const Workspace = () => {
  const { user, selectedCompany } = useGlobalContext();
  const isAdmin = Boolean(user?.role?.toLowerCase() === "admin");

  return (
    <main className="p-4 max-w-7xl mx-auto flex flex-column gap-3">
      <div className="grid">
        <div className="col-12 md:col-4">
          <div className="surface-card border-round shadow-1 border-1 surface-border p-4 h-full">
            <div className="text-xs text-500 mb-1">Active Workspace</div>
            <div className="text-xl font-semibold text-900">
              {selectedCompany?.name || "No workspace selected"}
            </div>
            <div className="text-xs text-400 mt-1 font-mono">
              {selectedCompany?.id || "—"}
            </div>
          </div>
        </div>

        <div className="col-12 md:col-4">
          <div className="surface-card border-round shadow-1 border-1 surface-border p-4 h-full">
            <div className="text-xs text-500 mb-1">User Role</div>
            <div className="text-xl font-semibold text-900">
              {user?.role?.toUpperCase() || (isAdmin ? "ADMIN" : "USER")}
            </div>
            <div className="text-xs text-400 mt-1">
              {user?.email || "—"}
            </div>
          </div>
        </div>

        <div className="col-12 md:col-4">
          <div className="surface-card border-round shadow-1 border-1 surface-border p-4 h-full">
            <div className="text-xs text-500 mb-1">Assigned Companies</div>
            <div className="text-xl font-semibold text-900">
              {user?.companies?.length || 1}
            </div>
            <div className="text-xs text-400 mt-1">
              Total accessible workspaces
            </div>
          </div>
        </div>
      </div>

      <div className="surface-card border-round shadow-1 border-1 surface-border p-4">
        <div className="font-semibold text-sm text-900 mb-3">
          Granted Permissions
        </div>
        <div className="flex flex-wrap gap-2">
          {user?.permissions && user.permissions.length > 0 ? (
            user.permissions.map((p) => (
              <span key={p} className="badge">
                {p}
              </span>
            ))
          ) : (
            <span className="text-sm text-500">
              Standard user permissions.
            </span>
          )}
        </div>
      </div>
    </main>
  );
};
