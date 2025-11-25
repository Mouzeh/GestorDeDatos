require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createUsers() {
  const usuarios = [
    {
      email: 'admin@inacap.cl',
      password: 'admin123',
      role: 'admin'
    },
    {
      email: 'corredor@inacap.cl',
      password: 'corredor123',
      role: 'corredor'
    },
    {
      email: 'auditor@inacap.cl',
      password: 'auditor123',
      role: 'auditor'
    }
  ];

  console.log('🚀 Creando usuarios en Supabase...\n');

  for (const usuario of usuarios) {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: usuario.email,
        password: usuario.password,
        email_confirm: true,
        user_metadata: {
          role: usuario.role
        }
      });

      if (error) {
        console.error(`❌ Error creando ${usuario.email}:`, error.message);
      } else {
        console.log(`✅ Usuario creado: ${usuario.email}`);
        console.log(`   Role: ${usuario.role}`);
        console.log(`   ID: ${data.user.id}\n`);
      }
    } catch (err) {
      console.error(`❌ Excepción creando ${usuario.email}:`, err.message);
    }
  }
}

createUsers().then(() => {
  console.log('✅ Proceso completado');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});