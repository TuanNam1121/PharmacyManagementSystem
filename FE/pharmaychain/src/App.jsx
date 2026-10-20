import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import SupplierPage from './page/supplier/SupplierPage';

function App() {
  return (
    <Routes>
      <Route index element={<Navigate to="/supplier" replace />} />
      <Route element={<MainLayout />}>
        <Route path="/supplier" element={<SupplierPage />} />
      </Route>
    </Routes>
  );
}

export default App;
