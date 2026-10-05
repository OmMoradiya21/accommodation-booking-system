import { Outlet } from "react-router";

export const ProtectedLayout = () => {
  return (
    <div className="layout-container">
      <main>
        <Outlet />
      </main>
    </div>
  );
};
