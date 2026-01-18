# Setup Firebase Authentication - Quick Guide

## ✅ Yang Sudah Dilakukan

1. ✅ Install dependencies: `firebase`, `firebase-admin`, `express`, `dotenv`, `cors`
2. ✅ Membuat struktur folder dan file authentication
3. ✅ Membuat API endpoints untuk register, login, dan verify
4. ✅ Membuat komponen Login dan Register form
5. ✅ Membuat Auth Context untuk state management
6. ✅ Membuat Protected Route component
7. ✅ Setup AuthProvider di root layout

## 🚀 Langkah Selanjutnya (Yang Perlu Kamu Lakukan)

### 1. Setup Firebase Project

#### A. Buat Project di Firebase Console
1. Buka https://console.firebase.google.com/
2. Klik "Add project" / "Tambah project"
3. Masukkan nama project: `ai-customerservice` (atau nama lain)
4. Disable Google Analytics (optional)
5. Klik "Create project"

#### B. Enable Email/Password Authentication
1. Di sidebar, klik **Authentication**
2. Klik **Get started**
3. Pilih tab **Sign-in method**
4. Klik **Email/Password**
5. Enable toggle pertama (Email/Password)
6. Klik **Save**

#### C. Buat Web App & Dapatkan Config
1. Klik icon gear (⚙️) di sidebar > **Project settings**
2. Scroll ke bawah ke bagian **Your apps**
3. Klik icon **</>** (Web)
4. Masukkan app nickname: `ai-customerservice-web`
5. **JANGAN** centang Firebase Hosting
6. Klik **Register app**
7. **COPY** konfigurasi yang muncul (akan digunakan di step 2)

#### D. Generate Service Account Key
1. Masih di **Project settings**
2. Klik tab **Service accounts**
3. Klik **Generate new private key**
4. Klik **Generate key**
5. File JSON akan ter-download otomatis
6. **SIMPAN FILE INI DENGAN AMAN** (jangan share ke siapapun!)

#### E. Enable Firestore (Optional tapi disarankan)
1. Di sidebar, klik **Firestore Database**
2. Klik **Create database**
3. Pilih mode **Start in test mode** (untuk development)
4. Pilih location: **asia-southeast2** (Jakarta)
5. Klik **Enable**

### 2. Setup Environment Variables

Buka file `.env.local` yang sudah dibuat dan isi dengan data dari Firebase:

#### Dari Service Account JSON file:
Buka file JSON yang di-download tadi, lalu copy nilai-nilai berikut:

```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
```

**PENTING untuk FIREBASE_PRIVATE_KEY:**
- Copy SELURUH nilai dari field `"private_key"` di JSON file
- Pastikan tetap dalam format string dengan quote
- Jangan hilangkan `\n` yang ada di dalamnya
- Contoh: `"-----BEGIN PRIVATE KEY-----\nMIIEvQI...(panjang sekali)...\n-----END PRIVATE KEY-----\n"`

#### Dari Web App Config (yang di-copy di step 1C):
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

### 3. Jalankan Development Server

```bash
npm run dev
```

### 4. Test Authentication

1. **Buka browser** dan akses: http://localhost:3000/register
2. **Daftar akun baru** dengan:
   - Nama: Test User
   - Email: test@example.com
   - Password: test123 (minimal 6 karakter)
3. Setelah registrasi berhasil, kamu akan otomatis login dan redirect ke `/customer`
4. Test **Logout** dengan klik tombol Logout
5. Test **Login** lagi dengan akses http://localhost:3000/login

## 📁 Struktur File yang Sudah Dibuat

```
.env.local                                    # Environment variables (ISI INI DULU!)
FIREBASE_SETUP.md                             # Dokumentasi lengkap
src/
├── app/
│   ├── api/auth/
│   │   ├── register/route.js                 # API endpoint registrasi
│   │   ├── login/route.js                    # API endpoint login
│   │   └── verify/route.js                   # API endpoint verifikasi token
│   ├── (public)/
│   │   ├── login/page.js                     # Halaman login
│   │   ├── register/page.js                  # Halaman registrasi
│   │   └── customer/page.js                  # Halaman customer (protected)
│   └── layout.js                             # Root layout (updated)
├── components/auth/
│   ├── LoginForm.js                          # Form login
│   ├── RegisterForm.js                       # Form registrasi
│   └── ProtectedRoute.js                     # Component untuk protect routes
├── contexts/
│   └── AuthContext.js                        # Auth state management
└── lib/
    ├── firebase.js                           # Firebase client config
    └── firebaseAdmin.js                      # Firebase admin config
```

## 🎯 Cara Menggunakan di Code

### Protect Halaman dengan Authentication

```jsx
'use client';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function MyProtectedPage() {
  return (
    <ProtectedRoute>
      <div>Halaman ini hanya bisa diakses user yang sudah login</div>
    </ProtectedRoute>
  );
}
```

### Menggunakan Auth Data

```jsx
'use client';
import { useAuth } from '@/contexts/AuthContext';

export default function MyComponent() {
  const { user, login, logout, register, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {user ? (
        <div>
          <p>Hello, {user.displayName}!</p>
          <p>Email: {user.email}</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <p>Please login</p>
      )}
    </div>
  );
}
```

### Manual Login/Register dari Code

```jsx
'use client';
import { useAuth } from '@/contexts/AuthContext';

export default function MyComponent() {
  const { login, register } = useAuth();

  const handleLogin = async () => {
    try {
      await login('email@example.com', 'password');
      alert('Login berhasil!');
    } catch (error) {
      alert('Login gagal: ' + error.message);
    }
  };

  const handleRegister = async () => {
    try {
      await register('email@example.com', 'password', 'Nama User');
      alert('Registrasi berhasil!');
    } catch (error) {
      alert('Registrasi gagal: ' + error.message);
    }
  };

  return (
    <div>
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleRegister}>Register</button>
    </div>
  );
}
```

## 🔧 Troubleshooting

### Error: "Firebase Admin not initialized"
**Solusi:** 
- Pastikan semua environment variables di `.env.local` sudah terisi dengan benar
- Restart development server (`Ctrl+C` lalu `npm run dev` lagi)

### Error: "auth/invalid-credential"
**Solusi:**
- Cek `FIREBASE_PRIVATE_KEY` di `.env.local`
- Pastikan formatnya benar dengan semua `\n` tetap ada
- Copy ulang dari file JSON service account

### Error: "auth/email-already-exists"
**Solusi:**
- Email sudah terdaftar
- Gunakan email lain atau coba login

### Error: "auth/wrong-password"
**Solusi:**
- Password salah saat login
- Reset password atau gunakan password yang benar

### Halaman tidak redirect setelah login
**Solusi:**
- Cek console browser untuk error
- Pastikan `AuthProvider` sudah di-wrap di `layout.js`
- Clear browser cache dan cookies

## 📚 Dokumentasi Lengkap

Untuk dokumentasi lebih detail, lihat file `FIREBASE_SETUP.md`

## 🔒 Security Checklist

- [x] `.env.local` sudah ditambahkan ke `.gitignore`
- [ ] Ganti test mode Firestore ke production mode sebelum deploy
- [ ] Enable App Check untuk production
- [ ] Setup Firestore Security Rules
- [ ] Gunakan HTTPS di production
- [ ] Jangan commit service account key ke git

## 📞 Next Steps

Setelah authentication berfungsi, kamu bisa:
1. Menambahkan role-based access (admin, customer, agent)
2. Menambahkan forgot password functionality
3. Menambahkan email verification
4. Menambahkan social login (Google, Facebook, dll)
5. Menambahkan profile update functionality

---

**Jika ada pertanyaan atau error, silakan tanyakan!** 🚀
