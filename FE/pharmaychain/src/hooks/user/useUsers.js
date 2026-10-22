import { useState, useCallback, useEffect } from 'react';
import {
  fetchAccounts,
  fetchAccountDetail,
  createAccount,
  updateAccount,
  updateAccountStatus,
  fetchRoles,
} from '../../api/UserAPI';

export function useUsers() {
  const [accounts, setAccounts] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [detailUser, setDetailUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Fetch roles list for dropdowns
  const loadRoles = useCallback(async () => {
    try {
      setRolesLoading(true);
      const res = await fetchRoles();
      setRoles(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to load roles:', err);
    } finally {
      setRolesLoading(false);
    }
  }, []);

  // Fetch accounts list with pagination & filters
  const loadAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchAccounts({
        keyword,
        status: statusFilter,
        roleId: roleFilter,
        page,
        size,
        sortBy,
        sortDir,
      });

      if (res && res.content) {
        setAccounts(res.content);
        setTotalElements(res.totalElements || 0);
        setTotalPages(res.totalPages || 0);
      } else if (Array.isArray(res)) {
        setAccounts(res);
        setTotalElements(res.length);
        setTotalPages(1);
      } else {
        setAccounts([]);
        setTotalElements(0);
        setTotalPages(0);
      }
    } catch (err) {
      console.error('Failed to load accounts:', err);
      setError(err.message || 'Failed to fetch user accounts from server.');
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, [keyword, statusFilter, roleFilter, page, size, sortBy, sortDir]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  // Fetch single account detail
  const loadDetail = useCallback(async (id) => {
    try {
      setDetailLoading(true);
      const res = await fetchAccountDetail(id);
      setDetailUser(res);
      return res;
    } catch (err) {
      console.error('Failed to load account detail:', err);
      setError(err.message || 'Failed to load user detail.');
      throw err;
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // Create account
  const handleCreateUser = useCallback(async (payload) => {
    try {
      setError(null);
      await createAccount(payload);
      setSuccessMsg('User account created successfully!');
      await loadAccounts();
      return true;
    } catch (err) {
      setError(err.message || 'Failed to create account.');
      throw err;
    }
  }, [loadAccounts]);

  // Update account
  const handleUpdateUser = useCallback(async (id, payload) => {
    try {
      setError(null);
      await updateAccount(id, payload);
      setSuccessMsg('User account updated successfully!');
      await loadAccounts();
      if (detailUser && detailUser.id === id) {
        await loadDetail(id);
      }
      return true;
    } catch (err) {
      setError(err.message || 'Failed to update account.');
      throw err;
    }
  }, [loadAccounts, detailUser, loadDetail]);

  // Update account status (Lock / Disable / Unlock)
  const handleToggleStatus = useCallback(async (id, targetStatus, reason) => {
    try {
      setError(null);
      await updateAccountStatus(id, targetStatus, reason);
      const actionText = Number(targetStatus) === 1
        ? 'unlocked / activated'
        : Number(targetStatus) === 2
        ? 'locked'
        : 'disabled';
      setSuccessMsg(`User account has been ${actionText} successfully.`);
      await loadAccounts();
      return true;
    } catch (err) {
      setError(err.message || 'Failed to update user status.');
      throw err;
    }
  }, [loadAccounts]);

  return {
    accounts,
    totalElements,
    totalPages,
    page,
    setPage,
    size,
    setSize,
    keyword,
    setKeyword,
    statusFilter,
    setStatusFilter,
    roleFilter,
    setRoleFilter,
    sortBy,
    setSortBy,
    sortDir,
    setSortDir,
    roles,
    rolesLoading,
    loading,
    error,
    setError,
    successMsg,
    setSuccessMsg,
    detailUser,
    setDetailUser,
    detailLoading,
    loadAccounts,
    loadDetail,
    handleCreateUser,
    handleUpdateUser,
    handleToggleStatus,
  };
}
