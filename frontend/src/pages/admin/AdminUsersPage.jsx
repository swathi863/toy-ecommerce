import React, { useState, useEffect } from 'react';
import { getAdminUsersApi, updateAdminUserApi, deleteAdminUserApi } from '../../services/apiService';
import { Edit, Trash2, X, AlertTriangle, ShieldCheck, User as UserIcon } from 'lucide-react';

export default function AdminUsersPage({ currentUser, onShowToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'CUSTOMER'
  });

  // Delete Confirmation State
  const [userToDelete, setUserToDelete] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAdminUsersApi();
      setUsers(data || []);
    } catch (err) {
      if (onShowToast) {
        onShowToast('error', 'Users Error', err.message || 'Failed to load user accounts.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'CUSTOMER'
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.role) {
      if (onShowToast) onShowToast('error', 'Validation Error', 'Please fill in all user fields.');
      return;
    }

    try {
      await updateAdminUserApi(editingUser.userId, formData);
      if (onShowToast) onShowToast('success', 'User Updated', `User "${formData.name}" profile updated.`);
      setShowModal(false);
      await fetchUsers();
    } catch (err) {
      if (onShowToast) onShowToast('error', 'Update Failed', err.message || 'Failed to update user.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    if (currentUser && currentUser.userId === userToDelete.userId) {
      if (onShowToast) onShowToast('error', 'Cannot Delete Self', 'You cannot delete your own active admin account.');
      setUserToDelete(null);
      return;
    }

    try {
      await deleteAdminUserApi(userToDelete.userId);
      if (onShowToast) onShowToast('info', 'User Deleted', `User "${userToDelete.name}" account deleted.`);
      setUserToDelete(null);
      await fetchUsers();
    } catch (err) {
      if (onShowToast) onShowToast('error', 'Delete Failed', err.message || 'Failed to delete user.');
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>Loading user accounts...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>
          User Management
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: '0.2rem 0 0', fontSize: '0.95rem' }}>
          Inspect user profiles, manage email accounts, and assign roles (CUSTOMER / ADMIN)
        </p>
      </div>

      {/* Users Table */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(36, 59, 107, 0.04)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: 'var(--primary-navy)', fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '1rem 1.25rem' }}>User ID</th>
              <th style={{ padding: '1rem 1.25rem' }}>Name</th>
              <th style={{ padding: '1rem 1.25rem' }}>Email</th>
              <th style={{ padding: '1rem 1.25rem' }}>Role</th>
              <th style={{ padding: '1rem 1.25rem' }}>Created Date</th>
              <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No registered users found.
                </td>
              </tr>
            ) : (
              users.map((usr) => {
                const isAdmin = usr.role === 'ADMIN';

                return (
                  <tr key={usr.userId} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                      #{usr.userId}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <UserIcon size={16} color="var(--primary-navy)" />
                        <span>{usr.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-body)', fontSize: '0.9rem' }}>
                      {usr.email}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{
                        backgroundColor: isAdmin ? '#243B6B' : '#F1F5F9',
                        color: isAdmin ? '#FFFFFF' : 'var(--primary-navy)',
                        padding: '0.3rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}>
                        {isAdmin && <ShieldCheck size={14} color="#F59E0B" />}
                        {usr.role}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                      {usr.createdAt ? usr.createdAt.toString() : 'N/A'}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button
                          onClick={() => openEditModal(usr)}
                          style={{ backgroundColor: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', padding: '0.45rem 0.8rem', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <Edit size={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => setUserToDelete(usr)}
                          disabled={currentUser && currentUser.userId === usr.userId}
                          style={{
                            backgroundColor: (currentUser && currentUser.userId === usr.userId) ? '#F1F5F9' : '#FEE2E2',
                            color: (currentUser && currentUser.userId === usr.userId) ? '#94A3B8' : '#991B1B',
                            border: '1px solid #FCA5A5',
                            padding: '0.45rem 0.8rem',
                            borderRadius: '6px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: (currentUser && currentUser.userId === usr.userId) ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '0.8rem', borderBottom: '1px solid #E2E8F0' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>
                Edit User Information
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="pure-form">
              <div className="field-group">
                <label className="field-label">User Name</label>
                <input
                  type="text"
                  className="field-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="field-group">
                <label className="field-label">Email Address</label>
                <input
                  type="email"
                  className="field-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="field-group">
                <label className="field-label">Role</label>
                <select
                  className="field-input"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  <option value="CUSTOMER">CUSTOMER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '0.7rem 1.4rem', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: 'var(--text-body)', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit-primary"
                  style={{ width: 'auto', padding: '0.7rem 1.8rem' }}
                >
                  Save User Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', maxWidth: '440px', width: '100%', padding: '2rem', textAlign: 'center' }}>
            <div style={{ width: '54px', height: '54px', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <AlertTriangle size={30} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>
              Confirm Account Deletion
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Are you sure you want to delete user account <strong style={{ color: 'var(--primary-navy)' }}>"{userToDelete.email}"</strong>?
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => setUserToDelete(null)}
                style={{ padding: '0.7rem 1.4rem', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: 'var(--text-body)', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                style={{ padding: '0.7rem 1.4rem', borderRadius: '6px', border: 'none', backgroundColor: '#991B1B', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
