import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import UserListPage from './page/user/UserListPage';
import UserFormPage from './page/user/UserFormPage';
import UserDetailPage from './page/user/UserDetailPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Default redirect to users list */}
          <Route index element={<Navigate to="/users" replace />} />

          {/* User Management routes */}
          <Route path="users" element={<UserListPage />} />
          <Route path="users/add" element={<UserFormPage />} />
          <Route path="users/edit/:id" element={<UserFormPage />} />
          <Route path="users/:id" element={<UserDetailPage />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/users" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
