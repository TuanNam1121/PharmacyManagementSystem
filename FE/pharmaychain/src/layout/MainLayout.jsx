import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="app-wrapper d-flex">
      <div className="app-body d-flex flex-column flex-grow-1">
        <main className="flex-grow-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
