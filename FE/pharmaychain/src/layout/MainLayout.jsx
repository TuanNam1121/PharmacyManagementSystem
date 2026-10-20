import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

export default function MainLayout() {
  return (
    <div className="app-wrapper d-flex">
      <Sidebar />
      <div className="app-body d-flex flex-column flex-grow-1">
        <Header />
        <main className="flex-grow-1 overflow-auto">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
