import { Sidebar } from "./components/ui/SideBar";
import { DailySalesPage } from "./page/daily-sales/DailySalesPage";


function App() {
  return (
    <div className="flex min-h-screen bg-bg-subtle">
      {/* Sidebar quản trị PCMS */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="mx-auto max-w-7xl">
          <DailySalesPage />
        </div>
      </main>
    </div>
  );
}

export default App;