# 🦀 CRABPREK — Website Landing Page

Website resmi **CRABPREK**, UMKM kuliner kepiting geprek khas Payakumbuh.
Dibangun dengan **HTML, CSS, dan Vanilla JavaScript murni** — tanpa framework, tanpa build step, tanpa backend.

> _"Satu-satunya kepiting renyah di Payakumbuh yang bisa dimakan langsung tanpa ribet kupas cangkang!"_

---

## 1. Deskripsi Website

Website ini berfungsi sebagai **landing page + form pemesanan**:

- Menampilkan produk utama **Crabprek Sambel Geprek** beserta harga normal (**Rp18.000**) dan harga promo (**Rp16.000**).
- Memungkinkan pengunjung mengisi form pesanan (nama, porsi, jenis layanan, ekstra, alamat, catatan) yang langsung dikirim ke **WhatsApp** CRABPREK dengan format pesan rapi.
- Menampilkan informasi lokasi (Taman Batang Agam), jam operasional (07.00–18.00 WIB), metode pembayaran (Tunai & QRIS), dan tautan sosial media.

Semua perhitungan total dilakukan di sisi browser menggunakan **harga promo Rp16.000**. Harga normal Rp18.000 hanya ditampilkan sebagai informasi harga sebelum promo.

---

## 2. Teknologi yang Digunakan

| Teknologi | Keterangan |
|---|---|
| HTML5 | Semantic markup, meta SEO dasar |
| CSS3 | Custom properties, flexbox, grid, scroll-snap, media queries, `prefers-reduced-motion` |
| Vanilla JavaScript | DOM manipulation, IntersectionObserver, Canvas 2D (jam analog) |
| Google Fonts | Bricolage Grotesque + Plus Jakarta Sans |

**Tidak memerlukan:** Node.js, npm, build tools, backend, database, atau API berbayar.

---

## 3. Struktur Folder
crabprek/
├── index.html ← Halaman utama
├── style.css ← Semua styling
├── script.js ← Semua interaksi & logika
├── README.md ← File ini
├── logo.png ← (opsional) logo brand; fallback emoji 🦀 jika tidak ada
└── crabprek-product.jpg ← (opsional) foto produk; fallback emoji jika tidak ada

Jika `logo.png` atau `crabprek-product.jpg` tidak ditemukan, website **tetap tampil** dengan fallback emoji, jadi kamu bisa mengembangkan dulu tanpa aset lengkap.

---

## 4. Cara Menjalankan Website (VS Code)

### Cara paling mudah — Live Server

1. Install ekstensi **Live Server** di VS Code (by Ritwick Dey).
2. Buka folder proyek di VS Code.
3. Klik kanan `index.html` → **Open with Live Server**.
4. Browser akan terbuka otomatis di `http://127.0.0.1:5500`.

### Alternatif — tanpa ekstensi

Cukup klik dua kali `index.html` dan buka dengan browser. Semua fitur tetap berfungsi normal.

---

## 5. Cara Mengganti Gambar & Logo

### Ganti Logo

1. Siapkan file `logo.png` (disarankan minimal 200×200 px, latar transparan).
2. Simpan di folder proyek, menimpa file lama.
3. Muat ulang browser.

Jika belum punya logo, biarkan saja — emoji 🦀 akan tampil sebagai fallback.

### Ganti Foto Produk

1. Siapkan file `crabprek-product.jpg` (disarankan minimal 1200×1200 px, rasio 4:5 atau 4:3).
2. Simpan di folder proyek, menimpa file lama.
3. Foto dipakai di **dua tempat**: hero section dan product showcase.
4. Muat ulang browser.

---

## 6. Cara Mengubah Harga Produk & Harga Promo

Ada **dua tempat** yang perlu diubah supaya tampilan dan perhitungan konsisten.

### a) Tampilan di HTML (`index.html`)

Cari bagian:

```html
<div class="price-promo">
  <span class="price-label">Harga Promo</span>
  <strong>Rp16.000</strong>
  <span class="price-normal"><s>Rp18.000</s></span>
</div>