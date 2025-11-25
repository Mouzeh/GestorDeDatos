import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../ui/Header';
import CertificateUpload from './CertificateUpload';
import CertificateList from './CertificateList';

const CertificateManager = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upload');

  // Tabs actualizadas al nuevo diseño
  const tabs = [
    { id: 'upload', name: '📁 Carga Masiva', roles: ['admin', 'corredor'] },
    { id: 'list', name: '📊 Gestión', roles: ['admin', 'corredor', 'auditor'] },
  ];

  const filteredTabs = tabs.filter(tab => tab.roles.includes(user?.rol));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          <div className="card bg-white shadow-md rounded-xl p-6 border border-gray-200">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Gestor de Certificados
            </h1>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-10">
                {filteredTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap pb-3 pt-1 border-b-2 font-semibold text-sm transition-all ${
                      activeTab === tab.id
                        ? 'border-red-600 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Contenido según pestaña */}
            <div>
              {activeTab === 'upload' && <CertificateUpload />}
              {activeTab === 'list' && <CertificateList />}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateManager;
