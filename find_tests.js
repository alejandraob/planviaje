const fs = require('fs');
const path = require('path');

const recoveredDir = path.join(__dirname, 'recovered_files');
const files = fs.readdirSync(recoveredDir).filter(f => f.endsWith('.txt'));

console.log('🔍 Buscando archivos de tests...\n');

for (const file of files) {
  try {
    const filePath = path.join(recoveredDir, file);
    const content = fs.readFileSync(filePath, 'utf16le')
      .replace(/^\uFEFF/, '')
      .replace(/\0/g, '');

    // Buscar patrones de tests
    if (content.includes('describe(') || content.includes('test(') || content.includes('it(') ||
        content.includes('conversion.test') || content.includes('__tests__')) {
      console.log(`✅ ${file}`);
      console.log(`   Primeras líneas:`);
      console.log(content.substring(0, 200).replace(/\n/g, ' '));
      console.log('\n');
    }
  } catch (error) {
    // Ignorar errores de lectura
  }
}
