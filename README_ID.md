# PADI FIELD TRIAL — Prototipe 0.1

## Isi paket
- `index.html`, `styles.css`, `app.js`: aplikasi PWA.
- `manifest.webmanifest`, `sw.js`: instalasi dan cache dasar.
- `apps_script.gs`: backend Google Sheets.
- `DATABASE_SCHEMA.md`: penjelasan struktur database.

## Yang sudah berfungsi
- Form input satu parameter per plot.
- Penyimpanan lokal di browser melalui IndexedDB.
- Tetap dapat membuka aplikasi setelah pertama kali dimuat dan dicache.
- Daftar catatan lokal dan antrean sinkronisasi.
- Sinkronisasi catatan ke sheet `OBSERVATION`.
- ID unik dan pemeriksaan duplikasi di backend.

## Yang belum termasuk
- Login pengguna dan hak akses.
- Pembuatan proyek/perlakuan/plot dari aplikasi.
- Upload foto ke Google Drive.
- Sinkronisasi dua arah.
- Konflik edit multi-pengguna.
- Validasi protokol statistik dan kalkulasi hasil panen.
- Pengamanan endpoint tingkat produksi.

## Cara memasang backend Google Sheets
1. Buat Google Spreadsheet baru.
2. Pilih Extensions > Apps Script.
3. Hapus kode contoh dan tempel isi `apps_script.gs`.
4. Simpan proyek.
5. Pilih fungsi `setupDatabase`, lalu Run dan setujui izin.
6. Deploy > New deployment > Web app.
7. Pilih Execute as: Me. Atur akses sesuai kebijakan akun/organisasi.
8. Salin URL yang berakhir `/exec`.

## Cara memasang aplikasi
Host isi folder ini pada layanan HTTPS statis, misalnya GitHub Pages. Service worker dan IndexedDB memerlukan secure context (HTTPS; localhost untuk pengembangan).
Buka alamat aplikasi di Chrome Android, lalu pilih menu browser > Add to Home screen / Install app.

## Menghubungkan aplikasi
Buka tab Pengaturan di aplikasi, tempel URL Web App `/exec`, lalu simpan. Buat satu catatan uji dan tekan Sinkronkan ke Google Sheets.

## Peringatan penggunaan
Ini prototipe awal, bukan sistem produksi tervalidasi. Jangan gunakan untuk data kritis sebelum diuji pada spreadsheet salinan. Jika Web App dapat diakses publik, endpoint harus dilindungi dengan autentikasi/token dan pembatasan yang sesuai. Hindari menyimpan data pribadi sensitif.
