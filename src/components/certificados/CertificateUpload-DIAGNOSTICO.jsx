import React from 'react';

const DiagnosticComponent = () => {
  console.log('🔍 INICIANDO DIAGNÓSTICO...');

  // Intentar todas las posibles rutas de importación
  const testImports = async () => {
    const importPaths = [
      '../../services/supabase/certificates-bypass',
      '../../../services/supabase/certificates-bypass',
      '/src/services/supabase/certificates-bypass',
      './../../services/supabase/certificates-bypass'
    ];

    for (const path of importPaths) {
      try {
        console.log(`🔄 Intentando importar desde: ${path}`);
        const module = await import(/* webpackMode: "eager" */ path);
        console.log(`✅ IMPORTACIÓN EXITOSA desde: ${path}`);
        console.log('Módulo:', module);
        console.log('certificatesServiceBypass:', module.certificatesServiceBypass);
        return module.certificatesServiceBypass;
      } catch (error) {
        console.error(`❌ Falló importación desde ${path}:`, error.message);
      }
    }
    return null;
  };

  React.useEffect(() => {
    testImports();
  }, []);

  return (
    <div className="p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
      <h3 className="text-lg font-bold">🔍 Diagnóstico de Importación</h3>
      <p>Revisa la consola para ver los resultados de las importaciones</p>
    </div>
  );
};

export default DiagnosticComponent;