# Struktur database PADI FIELD TRIAL

## Prinsip
- `project_code` mengidentifikasi satu penelitian.
- `plot_id` mengidentifikasi plot secara unik dalam satu proyek.
- `observation_id` mengidentifikasi satu catatan parameter pada satu waktu.
- Satu baris `OBSERVATION` = satu parameter pada satu plot pada satu tanggal.
- Jangan mengubah nama header setelah aplikasi mulai digunakan tanpa memperbarui integrasi.

## Rancangan percobaan
Field `design_type` pada `PROJECT` dapat berisi RAK, RAL, Faktorial, Split Plot, Strip Plot, Petak Terbagi, atau rancangan lain. Detail faktor dan taraf sebaiknya dicatat di `TREATMENT` atau tabel tambahan `FACTOR_LEVEL` ketika protokol penelitian sudah ditetapkan.

## Hubungan antartabel
- PROJECT 1—N TREATMENT
- PROJECT 1—N PLOT_MASTER
- PROJECT 1—N OBSERVATION
- PLOT_MASTER 1—N OBSERVATION
- PLOT_MASTER 1—N HARVEST_DATA
- PLOT_MASTER 1—N PHOTO_LOG
- PLOT_MASTER 1—N APPLICATION_LOG

## Catatan data
- Simpan angka sebagai angka, bukan teks; satuan diletakkan di kolom `unit`.
- Catat tanggal dalam format ISO `YYYY-MM-DD`.
- Untuk parameter berbasis skor, simpan nilai numerik dan definisi skala di `PARAMETER_MASTER.method`.
- Data mentah tidak ditimpa. Koreksi idealnya dibuat melalui kolom status/revisi pada versi produksi.
- Untuk hasil panen, catat luas panen aktual, bobot gabah, dan kadar air agar konversi hasil dapat diaudit.
- Prototipe 0.1 baru mengirim input ke `OBSERVATION`; sheet lain adalah kerangka database untuk tahap pengembangan berikutnya.
