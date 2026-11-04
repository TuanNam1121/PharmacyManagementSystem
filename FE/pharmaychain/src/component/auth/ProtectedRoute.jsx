import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role?.toUpperCase();
    const hasRole = allowedRoles.some((r) => {
      const normalizedR = r.toUpperCase();
      return userRole === normalizedR || userRole === `ROLE_${normalizedR}` || `ROLE_${userRole}` === normalizedR;
    });

    if (!hasRole) {
      return (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <h4 className="text-danger">Không có quyền truy cập</h4>
          <p className="text-muted">Bạn không có quyền truy cập vào chức năng này. Vui lòng liên hệ Quản trị viên.</p>
        </div>
      );
    }
  }

  return children;
}

