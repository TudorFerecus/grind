import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/useAuthStore';
import { Shield, ShieldAlert, User, Search, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AdminUsers = () => {
  const { t } = useTranslation();
  const currentUser = useAuthStore((state) => state.user);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // id of user undergoing role change
  const [notification, setNotification] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.auth.getAllUsers();
      setUsers(data);
    } catch (err) {
      showNotification('error', err.message || 'Eroare la încărcarea utilizatorilor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setActionLoading(userId);
    try {
      await api.auth.updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      showNotification('success', 'Rolul utilizatorului a fost actualizat cu succes.');
    } catch (err) {
      showNotification('error', err.message || 'Eroare la actualizarea rolului.');
    } finally {
      setActionLoading(null);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="badge badge-error gap-1 py-3 px-3 font-semibold shadow-sm text-xs">
            <ShieldAlert size={14} />
            ADMIN
          </span>
        );
      case 'EDITOR':
        return (
          <span className="badge badge-warning gap-1 py-3 px-3 font-semibold shadow-sm text-xs">
            <Shield size={14} />
            EDITOR
          </span>
        );
      default:
        return (
          <span className="badge badge-neutral gap-1 py-3 px-3 font-semibold shadow-sm text-xs">
            <User size={14} />
            CUSTOMER
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-base-100 p-6 rounded-2xl border border-base-200 shadow-sm transition-all duration-300">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-base-content/60 text-sm mt-1">
            Administrează utilizatorii înregistrați și acordă roluri securizate de Administrator sau Editor.
          </p>
        </div>
        <button 
          onClick={fetchUsers} 
          disabled={loading}
          className="btn btn-ghost btn-circle border border-base-200 bg-base-100/50 hover:bg-base-200 transition-all duration-200"
          title="Refresh"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Notifications */}
      {notification && (
        <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg rounded-xl border max-w-2xl animate-fade-in flex items-center gap-3`}>
          {notification.type === 'success' ? <CheckCircle2 className="text-success-content" /> : <AlertCircle className="text-error-content" />}
          <span className="font-medium text-sm">{notification.message}</span>
        </div>
      )}

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-2">
          <span className="absolute inset-y-0 left-3 flex items-center text-base-content/40">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Caută utilizator după nume sau email..."
            className="input input-bordered w-full pl-10 rounded-xl bg-base-100 border-base-200 focus:border-primary focus:outline-none transition-all duration-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="select select-bordered w-full rounded-xl bg-base-100 border-base-200 focus:border-primary focus:outline-none transition-all duration-200"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="ALL">Toate rolurile</option>
          <option value="ADMIN">Administratori (ADMIN)</option>
          <option value="EDITOR">Editori (EDITOR)</option>
          <option value="CUSTOMER">Clienți (CUSTOMER)</option>
        </select>
      </div>

      {/* Users table */}
      <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex gap-4 items-center">
                <div className="skeleton w-12 h-12 rounded-full shrink-0"></div>
                <div className="space-y-2 w-full">
                  <div className="skeleton h-4 w-1/4"></div>
                  <div className="skeleton h-3 w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-base-content/40 space-y-2">
            <User size={48} className="mx-auto opacity-30" />
            <p className="font-semibold text-lg">Nu s-a găsit niciun utilizator</p>
            <p className="text-sm">Încearcă să schimbi filtrele sau criteriile de căutare.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-lg w-full">
              <thead>
                <tr className="border-b border-base-200 bg-base-200/30 text-base-content/70">
                  <th>Utilizator</th>
                  <th>Status Email</th>
                  <th>Rol Curent</th>
                  <th className="text-right">Acțiuni Permisiuni</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b border-base-200 hover:bg-base-200/20 transition-colors duration-150">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary font-bold shadow-inner">
                            {u.avatarUrl ? (
                              <img src={u.avatarUrl} alt={u.name} />
                            ) : (
                              u.name.charAt(0).toUpperCase()
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-base-content flex items-center gap-2">
                            {u.name}
                            {currentUser?.id === u.id && (
                              <span className="badge badge-xs badge-primary font-semibold py-1.5 px-2">TU</span>
                            )}
                          </div>
                          <div className="text-xs text-base-content/50 font-mono mt-0.5">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {u.isVerified ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full border border-success/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                          Verificat
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-warning bg-warning/10 px-2.5 py-1 rounded-full border border-warning/20 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-warning"></span>
                          Neverificat
                        </span>
                      )}
                    </td>
                    <td>{getRoleBadge(u.role)}</td>
                    <td className="text-right">
                      {currentUser?.id === u.id ? (
                        <span className="text-xs text-base-content/40 italic p-2 block">Protejat (Cont activ)</span>
                      ) : (
                        <div className="inline-flex items-center gap-2">
                          {actionLoading === u.id && (
                            <span className="loading loading-spinner loading-sm text-primary mr-1"></span>
                          )}
                          <select
                            disabled={actionLoading === u.id}
                            className="select select-sm select-bordered w-32 rounded-lg bg-base-100 border-base-200 hover:border-primary transition-all duration-200"
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          >
                            <option value="CUSTOMER">CUSTOMER</option>
                            <option value="EDITOR">EDITOR</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
