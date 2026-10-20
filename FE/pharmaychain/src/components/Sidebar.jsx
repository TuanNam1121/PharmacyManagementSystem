import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

export default function Sidebar({ collapsed, onToggleCollapse }) {
  const location = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(true);

  // Check if current route is within User Management
  const isUserActive = location.pathname.startsWith('/users');

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand Logo */}
      <div className="sidebar-brand">
        <div className="brand-logo-icon">
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="34" height="34" rx="8" fill="#F0483E" />
            <path d="M10 12H24L22 21H12L10 12Z" stroke="#FFFFFF" strokeWidth="2" strokeLinejoin="round" />
            <circle cx="13" cy="24" r="1.5" fill="#FFFFFF" />
            <circle cx="21" cy="24" r="1.5" fill="#FFFFFF" />
            <path d="M17 14V19M14.5 16.5H19.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        {!collapsed && <span className="brand-title">Pharma One</span>}
      </div>

      {/* User Profile Card */}
      {!collapsed && (
        <div className="sidebar-user-card">
          <div className="sidebar-user-info">
            <div className="user-avatar-wrap">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Subash"
              />
              <span className="online-dot"></span>
            </div>
            <div className="user-text">
              <p className="user-name">Subash</p>
              <p className="user-role">Super Admin</p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-link text-white-50 p-0 text-decoration-none"
            title="Options"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>
        </div>
      )}

      {/* Navigation Menu */}
      <div className="sidebar-menu">
        {/* User & Security Management Section */}
        <div className="menu-group">
          <div
            className="menu-group-header"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            title="User & Security Management"
          >
            <div className="menu-group-title">
              {/* User Shield Icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M12 8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
              </svg>
              {!collapsed && <span>User & Security Management</span>}
            </div>
            {!collapsed && (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transform: isUserMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            )}
          </div>

          {/* Sub menu item: User */}
          {(!collapsed && isUserMenuOpen) && (
            <NavLink
              to="/users"
              className={({ isActive }) =>
                `menu-sub-item ${isActive || isUserActive ? 'active' : ''}`
              }
            >
              User
            </NavLink>
          )}
        </div>
      </div>

      {/* Collapse Toggle Button */}
      <button
        className="sidebar-collapse-btn"
        onClick={onToggleCollapse}
        title={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
    </aside>
  );
}
