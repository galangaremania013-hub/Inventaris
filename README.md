# Sistem Informasi Inventaris IT Berbasis QR Code & Integrated Helpdesk

Aplikasi web responsif untuk mengelola inventaris perangkat IT dan ticket dukungan harian dalam satu dashboard.

## Fitur utama
- Dashboard ringkasan aset, ticket aktif, dan kebutuhan perawatan
- Manajemen inventaris barang (tambah, cari, hapus, lihat QR)
- Pembuatan tiket helpdesk dalam satu sistem
- Scan kode asset untuk melihat status dan riwayat permasalahan
- Data tersimpan di browser menggunakan localStorage

## Jalankan aplikasi
1. Masuk ke folder proyek:
   `cd "C:\Users\My\Documents\website\IT Inventaris"`
2. Jalankan server statis:
   `python -m http.server 8000`
3. Buka browser ke:
   `http://localhost:8000`

## Struktur file
- `index.html` – layout utama
- `styles.css` – desain UI responsif
- `app.js` – logika inventaris, helpdesk, dan QR
