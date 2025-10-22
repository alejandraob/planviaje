const fs = require('fs');
const path = require('path');

// Mapeo de archivos hash a rutas originales
const fileMap = {
  // App principal
  'file_0b80032108a77a25b8e03a780d3ee633199d174d.txt': 'backend/src/app.js',

  // Models
  'file_3d43a8f2448c4827677dcd303c9fe36f8f32a55b.txt': 'backend/src/models/Viaje.js',
  'file_569d7702b5c4b8152f261c6827a9320673c1ae7e.txt': 'backend/src/models/Gasto.js',
  'file_67665ff2142b392ba7a242ce913874ff8b009af4.txt': 'backend/src/models/User.js',
  'file_7381b8fda11e78e89af5fb889539d7e57f45a84c.txt': 'backend/src/models/Deuda.js',
  'file_9b3b29d758da3dc2540d2a8d5407ce2ea37947b6.txt': 'backend/src/models/TasaCambio.js',
  'file_63f3a951454a5ebb5b454f938c59270d4e47e948.txt': 'backend/src/models/ConfiguracionViaje.js',
  'file_1f579e06ab08e5be24624046ed51f015db3ebe51.txt': 'backend/src/models/MiembroViaje.js',
  'file_79e431937980e0b4449f28f558d41937894e3ec6.txt': 'backend/src/models/Subgrupo.js',
  'file_5c244ae3d585f7950c68b5f89e5b0449cd3c45fc.txt': 'backend/src/models/SubgrupoMiembro.js',
  'file_e05c16179c35cf030e422fa54422119ba3b74494.txt': 'backend/src/models/Franja.js',
  'file_f02fee43d812b7ee80c7fc2f5af800acc801952f.txt': 'backend/src/models/Alojamiento.js',
  'file_c5a7cd484ba623cc3dafa255d2339dcfa488221d.txt': 'backend/src/models/Actividad.js',
  'file_e3f683e6638643010f9dee99d9b307483572bde4.txt': 'backend/src/models/GastoSubgrupo.js',
  'file_2617659ce54a309e8687edf9cfd234d1a92712dc.txt': 'backend/src/models/DeudaSubgrupo.js',
  'file_ce92c220590b88c5edf8b143d368ca62697c1f06.txt': 'backend/src/models/Pago.js',
  'file_931f134621fd79432d043670b279a5f80026ab3b.txt': 'backend/src/models/Notificacion.js',
  'file_502c4386fc18008e299740c5d55568d572893f83.txt': 'backend/src/models/Auditoria.js',

  // Services
  'file_3ddad6a2acaa99d4c957459d73f798d3698278da.txt': 'backend/src/services/viajesService.js',
  'file_393d9740c245589dba31c1137724b52759cbefbf.txt': 'backend/src/services/gastosService.js',
  'file_fbfacad460446f65521e36c82f5cc45e981a0e2f.txt': 'backend/src/services/cambiosMonedaService.js',

  // Controllers
  'file_dc617d0f6b63304d408de5940ddc678013cfeabf.txt': 'backend/src/controllers/viajesController.js',
  'file_f7c05f04237af593b308cd4a7f59d197df4414a7.txt': 'backend/src/controllers/tasasCambioController.js',

  // Config
  'file_0772cc2f2f1973a819f4fcc571efd04152e5721d.txt': 'backend/src/config/firebase.js',
  'file_0c7477e7357512f88932ccdf404313a18e8726ee.txt': 'backend/src/config/database.js',

  // Utils
  'file_263eb591717ce63e188afd6879cf2d62417c5a67.txt': 'backend/src/utils/logger.js',

  // Routes
  'file_6ebd8f948f865345617a8d72528304d734938cbc.txt': 'backend/src/routes/tasas-cambio.routes.js',

  // Archivos adicionales encontrados
  'file_14505a60f5480b4ff541129a15fd2b00f115f24a.txt': 'backend/src/models/index.js',
  'file_b75f8878dd510d5b1311ab3c92580ae2f90a9334.txt': 'backend/src/config/environment.js',
  'file_3ac91ac48b20d8a6f98956f6468635602077eeaf.txt': 'backend/src/config/constants.js',
  'file_1f22ae516c465f02aff554c9bc2b5f1fe1a41e19.txt': 'backend/src/utils/errors.js',
  'file_bdb7ee3a1a7fd0c2a69c25ea8eaef1bf1071931d.txt': 'backend/src/utils/jwt.js',
  'file_0c7477e7357512f88932ccdf404313a18e8726ee.txt': 'backend/src/utils/dbInit.js',
  'file_b47f4002d3e0ec3dad748f0ef8149c780de0b8df.txt': 'backend/src/middleware/errorHandler.js',

  // Package.json
  'file_9590c1ef3b10ee551e1c088f4b8bd3d53bdb5aa0.txt': 'backend/package.json',

  // Tests
  'file_6418f6c955ad9d4f5209a83d5ee52d4c5a7f18d4.txt': 'backend/__tests__/conversion.test.js'
};

function decodeFile(content) {
  // El contenido está en UTF-16LE, solo necesitamos limpiar caracteres BOM
  return content
    .replace(/^\uFEFF/, '') // Eliminar BOM si existe
    .replace(/\0/g, ''); // Eliminar caracteres nulos
}

function recoverFiles() {
  let recovered = 0;
  let failed = 0;

  console.log('🔄 Iniciando recuperación de archivos...\n');

  for (const [hashFile, targetPath] of Object.entries(fileMap)) {
    const sourcePath = path.join(__dirname, 'recovered_files', hashFile);
    const destPath = path.join(__dirname, targetPath);

    try {
      // Leer archivo original
      const content = fs.readFileSync(sourcePath, 'utf16le');

      // Decodificar contenido
      const decoded = decodeFile(content);

      // Crear directorio si no existe
      const dir = path.dirname(destPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Escribir archivo recuperado
      fs.writeFileSync(destPath, decoded, 'utf8');

      console.log(`✅ ${targetPath}`);
      recovered++;
    } catch (error) {
      console.error(`❌ ${targetPath}: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Resumen:`);
  console.log(`   ✅ Recuperados: ${recovered} archivos`);
  console.log(`   ❌ Fallidos: ${failed} archivos`);
  console.log(`   📁 Total: ${Object.keys(fileMap).length} archivos`);
}

recoverFiles();
