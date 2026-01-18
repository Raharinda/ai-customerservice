# Setup Google Authentication di Firebase

Untuk mengaktifkan login dengan Google, ikuti langkah-langkah berikut:

## 1. Aktifkan Google Sign-in di Firebase Console

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project Anda
3. Masuk ke **Authentication** > **Sign-in method**
4. Klik pada **Google** dalam daftar provider
5. Klik toggle untuk **Enable**
6. Pilih **Project support email** dari dropdown
7. Klik **Save**

## 2. Konfigurasi OAuth Consent Screen (Opsional untuk Production)

Jika Anda ingin deploy ke production, Anda perlu mengkonfigurasi OAuth consent screen:

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Pilih project yang sama dengan Firebase
3. Masuk ke **APIs & Services** > **OAuth consent screen**
4. Pilih **External** dan klik **Create**
5. Isi informasi aplikasi:
   - App name: Nama aplikasi Anda
   - User support email: Email support Anda
   - Developer contact information: Email developer
6. Klik **Save and Continue**

## 3. Authorized Domains

Firebase akan otomatis menambahkan domain berikut ke authorized domains:
- `localhost` (untuk development)
- `*.firebaseapp.com` (untuk Firebase Hosting)
- Domain custom Anda (jika ada)

Jika menggunakan domain lain, tambahkan di:
**Firebase Console** > **Authentication** > **Settings** > **Authorized domains**

## 4. Test Login

Setelah konfigurasi selesai:

1. Jalankan aplikasi di development: `npm run dev`
2. Buka halaman login: `http://localhost:3000/login`
3. Klik tombol **Login dengan Google**
4. Pilih akun Google Anda
5. Izinkan akses ke aplikasi
6. Anda akan diarahkan ke dashboard customer

## Fitur yang Sudah Diimplementasikan

✅ Google Sign-in dengan popup
✅ Auto-verifikasi user di backend
✅ Auto-create user di Firestore (jika belum ada)
✅ Redirect ke dashboard setelah login
✅ Error handling untuk berbagai kasus (popup blocked, cancelled, dll)
✅ UI button Google dengan logo resmi
✅ Support untuk login dan register page

## Troubleshooting

### Popup Blocked
Jika popup diblokir oleh browser:
- Pastikan browser mengizinkan popup untuk localhost
- Cek settings browser di bagian Privacy/Security

### Auth Domain Error
Jika terjadi error "auth domain not authorized":
- Pastikan `authDomain` di Firebase config sudah benar
- Cek authorized domains di Firebase Console

### CORS Error
Jika terjadi CORS error:
- Pastikan domain Anda sudah ditambahkan ke authorized domains
- Restart development server

## Security Notes

- Google Sign-in menggunakan OAuth 2.0
- ID token diverifikasi di backend untuk keamanan
- User data disimpan di Firestore dengan proper access control
- Session managed oleh Firebase Authentication

## Next Steps

Setelah setup selesai, Anda bisa:
- Customize user profile page
- Tambahkan provider lain (Facebook, Twitter, dll)
- Implementasi email verification
- Setup custom claims untuk role-based access
