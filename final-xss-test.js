// final-xss-test.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function finalXSSFixTest() {
    console.log('🎯 PRUEBA FINAL DE SANITIZACIÓN XSS\n');
    
    try {
        // Login
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: 'admin@inacap.cl',
            password: 'admin123'
        });
        
        if (authError) throw authError;
        console.log('✅ Login exitoso');

        // Test con diferentes tipos de XSS
        const xssTests = [
            "<script>alert('xss1')</script>test1.pdf",
            "Normal<script>alert('xss2')</script>test2.pdf",
            "<img src=x onerror=alert('xss3')>test3.pdf",
            "<iframe src=javascript:alert('xss4')>test4.pdf",
            "Test<a href=\"javascript:alert('xss5')\">link</a>.pdf"
        ];

        let allPassed = true;

        for (const xssInput of xssTests) {
            console.log(`\n🔍 Probando: ${xssInput}`);
            
            const testData = {
                usuario_id: authData.user.id,
                nombre_archivo: xssInput,
                storage_key: `test/xss-final-${Date.now()}-${Math.random()}.pdf`,
                estado: 'pendiente',
                tipo_archivo: 'application/pdf',
                tamaño_bytes: 1024
            };

            const { data: certificate, error: insertError } = await supabase
                .from('certificados_tributarios')
                .insert(testData)
                .select()
                .single();

            if (insertError) {
                console.log(`❌ Error en inserción: ${insertError.message}`);
                allPassed = false;
                continue;
            }

            // Leer resultado
            const { data: savedData, error: readError } = await supabase
                .from('certificados_tributarios')
                .select('nombre_archivo')
                .eq('id', certificate.id)
                .single();

            if (readError) {
                console.log(`❌ Error leyendo: ${readError.message}`);
                allPassed = false;
            } else {
                console.log(`📝 Guardado como: ${savedData.nombre_archivo}`);
                
                // Verificar sanitización
                const hasDangerousTags = /<script|<iframe|<img.*onerror|<a.*javascript:/i.test(savedData.nombre_archivo);
                
                if (hasDangerousTags) {
                    console.log('❌ XSS NO sanitizado - VULNERABLE');
                    allPassed = false;
                } else {
                    console.log('✅ XSS sanitizado - SEGURO');
                }
            }

            // Limpiar
            await supabase
                .from('certificados_tributarios')
                .delete()
                .eq('id', certificate.id)
                .catch(cleanupError => {
                    console.log('⚠️ Error limpiando test (puede ignorarse):', cleanupError.message);
                });
        }

        console.log('\n' + '='.repeat(50));
        if (allPassed) {
            console.log('🎉 ¡TODAS LAS PRUEBAS XSS PASARON!');
            console.log('✅ El sistema está protegido contra XSS');
        } else {
            console.log('⚠️ Algunas pruebas de XSS fallaron');
            console.log('🔧 Revisa el trigger de sanitización en Supabase');
        }

    } catch (error) {
        console.error('💥 ERROR:', error.message);
    } finally {
        await supabase.auth.signOut();
        console.log('🔒 Sesión cerrada');
    }
}

finalXSSFixTest();