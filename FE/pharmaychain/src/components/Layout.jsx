import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className="app-layout">
      <Sidebar collapsed={collapsed} onToggleCollapse={toggleCollapse} />
      <div className="main-wrapper">
        <Header />
        <main className="content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
