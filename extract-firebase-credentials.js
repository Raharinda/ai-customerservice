#!/usr/bin/env node

/**
 * Script untuk extract Firebase credentials dari service account JSON
 * dan generate format yang benar untuk .env.local
 * 
 * Cara pakai:
 * 1. Simpan file service account JSON di root project
 * 2. Jalankan: node extract-firebase-credentials.js path/to/service-account.json
 * 3. Copy output dan paste ke .env.local
 */

const fs = require('fs');
const path = require('path');

// Get file path from command line argument
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('❌ Error: Tidak ada file yang diberikan\n');
  console.log('📖 Cara pakai:');
  console.log('  node extract-firebase-credentials.js <path-to-service-account.json>\n');
  console.log('📝 Contoh:');
  console.log('  node extract-firebase-credentials.js ./planning-with-ai-service-account.json');
  console.log('  node extract-firebase-credentials.js ~/Downloads/service-account.json\n');
  process.exit(1);
}

const filePath = args[0];

// Check if file exists
if (!fs.existsSync(filePath)) {
  console.error(`❌ Error: File tidak ditemukan: ${filePath}\n`);
  console.log('💡 Tips:');
  console.log('  - Pastikan path file benar');
  console.log('  - Gunakan path absolute atau relative dari folder saat ini');
  console.log('  - File service account biasanya bernama seperti: planning-with-ai-xxxxx.json\n');
  process.exit(1);
}

try {
  // Read and parse JSON file
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const serviceAccount = JSON.parse(fileContent);

  // Validate required fields
  if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
    console.error('❌ Error: File JSON tidak valid atau bukan service account Firebase\n');
    console.log('File service account harus memiliki field:');
    console.log('  - project_id');
    console.log('  - private_key');
    console.log('  - client_email\n');
    process.exit(1);
  }

  // Generate .env.local format
  console.log('\n✅ Credentials berhasil di-extract!\n');
  console.log('📋 Copy baris-baris berikut dan paste ke file .env.local kamu:\n');
  console.log('─'.repeat(80));
  console.log(`FIREBASE_PROJECT_ID=${serviceAccount.project_id}`);
  console.log(`FIREBASE_PRIVATE_KEY="${serviceAccount.private_key}"`);
  console.log(`FIREBASE_CLIENT_EMAIL=${serviceAccount.client_email}`);
  console.log('─'.repeat(80));
  console.log('\n💡 Tips:');
  console.log('  1. Buka file .env.local di editor');
  console.log('  2. Ganti 3 baris FIREBASE_* dengan yang di atas');
  console.log('  3. Save file');
  console.log('  4. Restart dev server (Ctrl+C lalu npm run dev)');
  console.log('  5. Harus muncul: ✅ Firebase Admin initialized successfully\n');

  // Also save to a temp file for easy copy
  const outputPath = path.join(process.cwd(), '.env.firebase-credentials.txt');
  const output = `# Firebase Admin SDK Configuration (Generated)\n` +
    `FIREBASE_PROJECT_ID=${serviceAccount.project_id}\n` +
    `FIREBASE_PRIVATE_KEY="${serviceAccount.private_key}"\n` +
    `FIREBASE_CLIENT_EMAIL=${serviceAccount.client_email}\n`;
  
  fs.writeFileSync(outputPath, output);
  console.log(`📄 Credentials juga disimpan di: ${outputPath}`);
  console.log(`   (File ini bisa dihapus setelah selesai copy-paste)\n`);

} catch (error) {
  console.error('❌ Error saat membaca file:', error.message);
  console.log('\n💡 Pastikan file adalah valid JSON\n');
  process.exit(1);
}
