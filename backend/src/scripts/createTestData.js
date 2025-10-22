/**
 * Create Test Data
 * Creates basic test data for running tests
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function createTestData() {
  try {
    console.log('🔄 Creating test data...');

    // 1. Login
    const loginRes = await axios.post(`${BASE_URL}/auth/dev-login`, {
      email: 'test@example.com',
      password: 'test123'
    });
    const token = loginRes.data.data.accessToken;
    console.log('✅ Logged in');

    // 2. Create viaje
    const viajeRes = await axios.post(`${BASE_URL}/viajes`, {
      nombre: 'Viaje de Prueba Automatizado',
      tipo: 'amigos',
      alcance: 'nacional',
      fecha_inicio: '2026-01-15',
      fecha_fin: '2026-01-25',
      descripcion: 'Viaje de prueba para tests automatizados'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const viajeId = viajeRes.data.data?.id_viaje || viajeRes.data.data;
    console.log(`✅ Viaje creado: ID ${viajeId}`);
    console.log('Viaje data:', JSON.stringify(viajeRes.data, null, 2));

    // 3. Invite a second member
    const memberRes = await axios.post(`${BASE_URL}/viajes/${viajeId}/miembros`, {
      email: 'maria@example.com',
      nombre: 'María',
      apellido: 'González',
      telefono: '+541198765432'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`✅ Miembro invitado: ID ${memberRes.data.data.id_miembro_viaje}`);

    console.log('');
    console.log('✨ Test data created successfully!');
    console.log(`📊 Viaje ID: ${viajeId}`);
    console.log(`👥 Miembros: 2`);
    console.log('');
    console.log('🧪 Now you can run: npm run test:api');

  } catch (error) {
    console.error('❌ Error creating test data:', error.response?.data || error.message);
    process.exit(1);
  }
}

createTestData();
