# 🔥 CARA PASTE PRIVATE KEY FIREBASE

## ⚠️ Masalah yang Terjadi
Error "Failed to parse private key" karena format FIREBASE_PRIVATE_KEY di `.env.local` masih placeholder.

## ✅ SOLUSI - 3 Cara Paste Private Key

### 📋 Cara 1: Copy-Paste dari JSON (PALING MUDAH - RECOMMENDED)

1. **Buka file service account JSON** yang kamu download dari Firebase Console
2. **Cari field `private_key`** - nilainya panjang seperti ini:
   ```json
   {
     "type": "service_account",
     "project_id": "planning-with-ai-a00a8",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...(sangat panjang)...\n-----END PRIVATE KEY-----\n",
     "client_email": "firebase-adminsdk-xxxxx@planning-with-ai-a00a8.iam.gserviceaccount.com",
     ...
   }
   ```

3. **Copy PERSIS nilai dari `private_key`** (termasuk tanda kutip dan semua karakter `\n`)
4. **Buka `.env.local`** dan ganti baris FIREBASE_PRIVATE_KEY:
   ```bash
   # DARI (placeholder):
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nPASTE_YOUR_PRIVATE_KEY_HERE\\n-----END PRIVATE KEY-----\\n"
   
   # JADI (paste nilai dari JSON):
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASC...(panjang sekali)...\n-----END PRIVATE KEY-----\n"
   ```

5. **Copy nilai `client_email`** dari JSON dan paste juga:
   ```bash
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@planning-with-ai-a00a8.iam.gserviceaccount.com
   ```

### 🖥️ Cara 2: Menggunakan Terminal (Otomatis)

Jalankan command ini di terminal (ganti `path-to-your-service-account.json` dengan path file JSON kamu):

```bash
# Extract private_key dan client_email otomatis
SERVICE_ACCOUNT_FILE="path-to-your-service-account.json"

# Get private key (dengan escape yang benar)
PRIVATE_KEY=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$SERVICE_ACCOUNT_FILE')).private_key)")

# Get client email
CLIENT_EMAIL=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$SERVICE_ACCOUNT_FILE')).client_email)")

# Print untuk copy-paste ke .env.local
echo "FIREBASE_PRIVATE_KEY=\"$PRIVATE_KEY\""
echo "FIREBASE_CLIENT_EMAIL=$CLIENT_EMAIL"
```

Copy output dan paste ke `.env.local`

### 📝 Cara 3: Manual Edit (Jika cara 1 & 2 gagal)

1. Buka file service account JSON
2. Copy nilai `private_key` (tanpa tanda kutip luar)
3. Paste ke text editor
4. Pastikan formatnya seperti ini di `.env.local`:

```bash
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
(banyak baris)
...
-----END PRIVATE KEY-----
"
```

**ATAU** dalam satu baris dengan `\n`:
```bash
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADA...\n-----END PRIVATE KEY-----\n"
```

## 🔍 Cara Cek Apakah Sudah Benar

Setelah paste, baris FIREBASE_PRIVATE_KEY di `.env.local` harus:
- ✅ Dimulai dengan `FIREBASE_PRIVATE_KEY="`
- ✅ Berisi `-----BEGIN PRIVATE KEY-----`
- ✅ Berisi karakter `\n` atau actual newline
- ✅ Diakhiri dengan `-----END PRIVATE KEY-----\n"`
- ❌ TIDAK ada kata "PASTE_YOUR_PRIVATE_KEY_HERE"
- ❌ TIDAK ada kata "your-service-account"

## 🚀 Setelah Paste

1. **Save file `.env.local`**
2. **Restart dev server:**
   ```bash
   # Tekan Ctrl+C untuk stop server
   # Lalu jalankan lagi:
   npm run dev
   ```
3. **Cek terminal** - harus muncul:
   ```
   ✅ Firebase Admin initialized successfully
   ```
4. **Test register:** Buka http://localhost:3000/register

## ⚠️ KEAMANAN

- **JANGAN** commit `.env.local` ke git (sudah di .gitignore)
- **JANGAN** share private key di chat/public
- **JANGAN** screenshot `.env.local` yang sudah terisi
- File service account JSON juga harus disimpan aman

## 💡 Contoh Format yang BENAR

```bash
FIREBASE_PROJECT_ID=planning-with-ai-a00a8
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7XxY...(1700+ karakter)...vKQw==\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-abc123@planning-with-ai-a00a8.iam.gserviceaccount.com
```

---

**Kalau masih error setelah paste, kirim pesan error yang muncul (tapi jangan kirim isi private key!)** 🔐
