import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../ui/Header';
import { Users, UserPlus, Search, Filter, Edit3, Trash2, Shield, Mail, User, CheckCircle, XCircle, MoreVertical } from 'lucide-react';

const UserManager = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [showUserForm, setShowUserForm] = useState(false);

  // Datos mock mejorados
  const mockUsers = [
    {
      id: 1,
      nombre: 'Administrador Sistema',
      email: 'admin@inacap.cl',
      rol: 'admin',
      estado: 'activo',
      mfaHabilitado: true,
      ultimoAcceso: '2024-01-15 08:30:15',
      fechaRegistro: '2024-01-01',
      avatar: 'AS'
    },
    {
      id: 2,
      nombre: 'Juan Corredor',
      email: 'corredor@inacap.cl',
      rol: 'corredor',
      estado: 'activo',
      mfaHabilitado: false,
      ultimoAcceso: '2024-01-15 09:15:22',
      fechaRegistro: '2024-01-02',
      avatar: 'JC'
    },
    {
      id: 3,
      nombre: 'María Auditor',
      email: 'auditor@inacap.cl',
      rol: 'auditor',
      estado: 'activo',
      mfaHabilitado: true,
      ultimoAcceso: '2024-01-15 10:05:44',
      fechaRegistro: '2024-01-03',
      avatar: 'MA'
    },
    {
      id: 4,
      nombre: 'Carlos Supervisor',
      email: 'carlos@inacap.cl',
      rol: 'admin',
      estado: 'suspendido',
      mfaHabilitado: false,
      ultimoAcceso: '2024-01-14 16:20:33',
      fechaRegistro: '2024-01-04',
      avatar: 'CS'
    },
    {
      id: 5,
      nombre: 'Ana Gestora',
      email: 'ana@inacap.cl',
      rol: 'corredor',
      estado: 'activo',
      mfaHabilitado: true,
      ultimoAcceso: '2024-01-15 11:45:18',
      fechaRegistro: '2024-01-05',
      avatar: 'AG'
    }
  ];

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = users;
    
    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrar por rol
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.rol === roleFilter);
    }
    
    // Filtrar por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.estado === statusFilter);
    }
    
    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, statusFilter, users]);

  const getAvatarColor = (email) => {
    const colors = [
      'bg-gradient-to-br from-red-500 to-red-600',
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-green-500 to-green-600',
      'bg-gradient-to-br from-purple-500 to-purple-600',
      'bg-gradient-to-br from-orange-500 to-orange-600',
      'bg-gradient-to-br from-indigo-500 to-indigo-600'
    ];
    const index = email.length % colors.length;
    return colors[index];
  };

  const getRoleBadge = (rol) => {
    const roleConfig = {
      admin: { color: 'bg-red-100 text-red-800', label: 'Administrador' },
      corredor: { color: 'bg-blue-100 text-blue-800', label: 'Corredor' },
      auditor: { color: 'bg-green-100 text-green-800', label: 'Auditor' }
    };
    
    const config = roleConfig[rol] || { color: 'bg-gray-100 text-gray-800', label: rol };
    
    return (
      <span className={`badge ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (estado) => {
    return estado === 'activo' ? (
      <span className="badge-success">
        <CheckCircle className="w-3 h-3 mr-1" />
        Activo
      </span>
    ) : (
      <span className="badge-error">
        <XCircle className="w-3 h-3 mr-1" />
        Suspendido
      </span>
    );
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  const handleDeleteUser = (user) => {
    if (window.confirm(`¿Estás seguro de eliminar al usuario ${user.nombre}?`)) {
      setUsers(prev => prev.filter(u => u.id !== user.id));
    }
  };

  const handleSaveUser = (userData) => {
    if (editingUser) {
      // Editar usuario existente
      setUsers(prev => prev.map(u => 
        u.id === editingUser.id ? { ...u, ...userData } : u
      ));
    } else {
      // Crear nuevo usuario
      const newUser = {
        id: Math.max(...users.map(u => u.id)) + 1,
        ...userData,
        avatar: userData.nombre.split(' ').map(n => n[0]).join(''),
        fechaRegistro: new Date().toISOString().split('T')[0],
        ultimoAcceso: 'Nunca'
      };
      setUsers(prev => [...prev, newUser]);
    }
    
    setShowUserForm(false);
    setEditingUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="card animate-pulse">
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="card animate-fade-in-up">
          {/* Header del módulo */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Usuarios</h1>
              <p className="text-gray-600">Administra usuarios, roles y permisos del sistema tributario</p>
            </div>
            
            <button
              onClick={() => setShowUserForm(true)}
              className="btn-primary flex items-center space-x-2 mt-4 lg:mt-0"
            >
              <UserPlus className="w-5 h-5" />
              <span>Nuevo Usuario</span>
            </button>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="card text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{users.length}</div>
              <div className="text-sm text-blue-800 font-medium">Total Usuarios</div>
            </div>
            <div className="card text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {users.filter(u => u.estado === 'activo').length}
              </div>
              <div className="text-sm text-green-800 font-medium">Activos</div>
            </div>
            <div className="card text-center bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <Shield className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">
                {users.filter(u => u.rol === 'admin').length}
              </div>
              <div className="text-sm text-red-800 font-medium">Administradores</div>
            </div>
            <div className="card text-center bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <User className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">
                {users.filter(u => u.mfaHabilitado).length}
              </div>
              <div className="text-sm text-purple-800 font-medium">Con MFA</div>
            </div>
          </div>

          {/* Filtros y búsqueda */}
          <div className="card bg-gray-50 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar usuarios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-12 bg-white"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="input-field w-auto bg-white"
                >
                  <option value="all">Todos los roles</option>
                  <option value="admin">Administradores</option>
                  <option value="corredor">Corredores</option>
                  <option value="auditor">Auditores</option>
                </select>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-field w-auto bg-white"
                >
                  <option value="all">Todos los estados</option>
                  <option value="activo">Activos</option>
                  <option value="suspendido">Suspendidos</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabla de usuarios */}
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="table-header">Usuario</th>
                    <th className="table-header">Rol</th>
                    <th className="table-header">Estado</th>
                    <th className="table-header">MFA</th>
                    <th className="table-header">Último Acceso</th>
                    <th className="table-header">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="table-cell">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 ${getAvatarColor(user.email)} rounded-2xl flex items-center justify-center text-white font-semibold shadow-md`}>
                            {user.avatar}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{user.nombre}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        {getRoleBadge(user.rol)}
                      </td>
                      <td className="table-cell">
                        {getStatusBadge(user.estado)}
                      </td>
                      <td className="table-cell">
                        {user.mfaHabilitado ? (
                          <span className="badge-success">Habilitado</span>
                        ) : (
                          <span className="badge-warning">No activo</span>
                        )}
                      </td>
                      <td className="table-cell">
                        <p className="text-sm text-gray-900">{user.ultimoAcceso}</p>
                        <p className="text-xs text-gray-500">Registro: {user.fechaRegistro}</p>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-all duration-300"
                            title="Editar usuario"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {user.id !== currentUser?.id && (
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-300"
                              title="Eliminar usuario"
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
                <p className="text-gray-400 text-sm mt-2">Intenta ajustar los filtros de búsqueda</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de formulario de usuario */}
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

// Componente de formulario de usuario
const UserForm = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    rol: user?.rol || 'corredor',
    estado: user?.estado || 'activo',
    mfaHabilitado: user?.mfaHabilitado || false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in-up">
      <div className="card max-w-md w-full mx-auto animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {user ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre Completo
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
              className="input-field"
              placeholder="Ej: Juan Pérez González"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="input-field"
              placeholder="usuario@inacap.cl"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rol de Usuario
            </label>
            <select
              value={formData.rol}
              onChange={(e) => setFormData(prev => ({ ...prev, rol: e.target.value }))}
              className="input-field"
            >
              <option value="corredor">Corredor</option>
              <option value="auditor">Auditor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={formData.estado}
              onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value }))}
              className="input-field"
            >
              <option value="activo">Activo</option>
              <option value="suspendido">Suspendido</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={formData.mfaHabilitado}
                  onChange={(e) => setFormData(prev => ({ ...prev, mfaHabilitado: e.target.checked }))}
                  className="sr-only"
                />
                <div className={`w-12 h-6 rounded-full transition-colors ${
                  formData.mfaHabilitado ? 'bg-red-600' : 'bg-gray-300'
                }`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    formData.mfaHabilitado ? 'transform translate-x-7' : 'transform translate-x-1'
                  }`} />
                </div>
              </div>
              <span className="text-sm font-medium text-gray-700">
                Autenticación MFA
              </span>
            </label>
            
            <Shield className={`w-5 h-5 ${
              formData.mfaHabilitado ? 'text-red-600' : 'text-gray-400'
            }`} />
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {user ? 'Guardar Cambios' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManager;