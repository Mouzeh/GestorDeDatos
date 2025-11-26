// src/components/usuarios/UserManager.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../ui/Header';
import UserForm from './UserForm';
import { usersService } from '../../services/supabase/users';

import {
  Users,
  UserPlus,
  Search,
  Edit3,
  Trash2,
  Shield,
  User,
  CheckCircle
} from 'lucide-react';

// ✅ Nombres de rol REALES desde la BD (tabla roles.nombre_rol)
const roleMap = {
  admin: "admin",
  corredor: "corredor",
  auditor: "auditor",
};

// 🔥 BACKEND REAL (el mismo puerto que usas en server.js)
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000/api";

const UserManager = () => {
  const { user: currentUser, token } = useAuth();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [showUserForm, setShowUserForm] = useState(false);

  // ============================================================
  // 🚀 Cargar usuarios DESDE BACKEND (bypass RLS)
  // ============================================================
  const loadUsers = async () => {
    try {
      if (!token) {
        console.warn("⚠ No hay token, no se pueden cargar usuarios");
        setUsers([]);
        setFilteredUsers([]);
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!data.success) {
        console.error("❌ Error cargando usuarios desde backend:", data.error);
        setUsers([]);
        setFilteredUsers([]);
        setLoading(false);
        return;
      }

      // data.users viene ya normalizado desde server.js
      const usersFormatted = data.users.map((u) => ({
        ...u,
        avatar: u.nombre
          ?.split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase(),
        fechaRegistro: u.fechaRegistro || "—",
        ultimoAcceso: u.ultimoAcceso || "Nunca",
      }));

      console.log("📦 Usuarios cargados desde backend:", usersFormatted);

      setUsers(usersFormatted);
      setFilteredUsers(usersFormatted);
      setLoading(false);

    } catch (error) {
      console.error("💥 Error en loadUsers:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================================
  // 🔍 FILTROS
  // ============================================================
  useEffect(() => {
    let f = [...users];

    // Buscar por nombre o email
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      f = f.filter(
        (u) =>
          u.nombre?.toLowerCase().includes(term) ||
          u.email?.toLowerCase().includes(term)
      );
    }

    // Filtrar por rol (UI → valor real en BD)
    if (roleFilter !== "all") {
      const realRole = roleMap[roleFilter]; // admin → "admin", corredor → "corredor", etc.
      f = f.filter((u) => u.rol === realRole);
    }

    // Filtrar por estado
    if (statusFilter !== "all") {
      f = f.filter((u) => u.estado === statusFilter);
    }

    setFilteredUsers(f);
  }, [searchTerm, roleFilter, statusFilter, users]);

  // ============================================================
  // ✏ Editar usuario
  // ============================================================
  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  // ============================================================
  // 🗑 Eliminar usuario
  // ============================================================
  const handleDeleteUser = async (user) => {
    if (!window.confirm(`¿Eliminar a ${user.nombre}?`)) return;

    const result = await usersService.deleteUser(user.id);

    if (result.success) {
      loadUsers();
    } else {
      alert("❌ Error eliminando usuario: " + result.error);
    }
  };

  // ============================================================
  // 💾 Guardar usuario (crear / actualizar)
  // ============================================================
  const handleSaveUser = async (userData) => {
    const result = editingUser
      ? await usersService.updateUser(editingUser.id, userData)
      : await usersService.createUser(userData);

    if (result.success) {
      await loadUsers();
      setShowUserForm(false);
      setEditingUser(null);
      alert("✔ Usuario guardado con éxito");
    } else {
      alert("❌ Error: " + result.error);
    }
  };

  // ============================================================
  // 🕒 LOADING
  // ============================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="w-full text-center mt-20">
          <div className="animate-spin h-12 w-12 border-b-2 border-red-600 rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // 🎨 UI
  // ============================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      <div className="max-w-7xl mx-auto py-8 px-4">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <p className="text-gray-600">Administra usuarios, roles y MFA</p>
          </div>

          <button
            onClick={() => setShowUserForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <UserPlus className="w-5 h-5" />
            <span>Nuevo Usuario</span>
          </button>
        </div>

        {/* Conteos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card text-center bg-blue-50 border-blue-200">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{users.length}</div>
            <div className="text-sm font-medium">Total Usuarios</div>
          </div>

          <div className="card text-center bg-green-50 border-green-200">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">
              {users.filter((u) => u.estado === "activo").length}
            </div>
            <div className="text-sm font-medium">Activos</div>
          </div>

          <div className="card text-center bg-red-50 border-red-200">
            <Shield className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">
              {users.filter((u) => u.rol === "admin").length}
            </div>
            <div className="text-sm font-medium">Administradores</div>
          </div>

          <div className="card text-center bg-purple-50 border-purple-200">
            <User className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">
              {users.filter((u) => u.mfaHabilitado).length}
            </div>
            <div className="text-sm font-medium">Con MFA</div>
          </div>
        </div>

        {/* Filtros */}
        <div className="card bg-gray-50 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="relative max-w-md w-full">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar usuarios..."
                className="input-field pl-12 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex space-x-4 mt-4 md:mt-0">
              <select
                className="input-field bg-white"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">Todos los roles</option>
                <option value="admin">Administradores</option>
                <option value="corredor">Corredores</option>
                <option value="auditor">Auditores</option>
              </select>

              <select
                className="input-field bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="activo">Activos</option>
                <option value="suspendido">Suspendidos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="table-header">Usuario</th>
                  <th className="table-header">Rol</th>
                  <th className="table-header">Estado</th>
                  <th className="table-header">MFA</th>
                  <th className="table-header">Acciones</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="table-cell">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-semibold"
                        >
                          {user.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.nombre}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="table-cell">{user.rol}</td>
                    <td className="table-cell">{user.estado}</td>

                    <td className="table-cell">
                      {user.mfaHabilitado ? (
                        <span className="badge-success">Habilitado</span>
                      ) : (
                        <span className="badge-warning">No activo</span>
                      )}
                    </td>

                    <td className="table-cell">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {user.id !== currentUser?.id && (
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-xl"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No se encontraron usuarios</p>
              <p className="text-gray-400 text-sm mt-2">Ajusta la búsqueda o los filtros</p>
            </div>
          )}
        </div>
      </div>

      {showUserForm && (
        <UserForm
          user={editingUser}
          onSave={handleSaveUser}
          onCancel={() => {
            setShowUserForm(false);
            setEditingUser(null);
          }}
        />
      )}
    </div>
  );
};

export default UserManager;
