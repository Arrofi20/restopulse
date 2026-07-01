# Feature Landscape

**Domain:** Restaurant Analytics Dashboard (Small-Medium F&B, Indonesia)
**Researched:** 2026-06-25
**Confidence:** MEDIUM

## Table Stakes

Features users expect. Missing = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Secure Owner Authentication | Data finansial sensitif; pemilik tidak akan mempercayai sistem tanpa login aman | Low | Username/password hashing (bcrypt/argon2) + session/JWT. Table stakes untuk semua SaaS finansial. |
| Revenue Trend Line Chart | Ini adalah *core promise* produk; pemilik butuh melihat naik-turun omset harian secara visual | Low | Chart.js sudah cukup. Pastikan sumbu X berurutan kronologis dan tidak ada tumpang tindih label. |
| Top-Selling Menu Pie Chart | Pemilik butuh identifikasi menu terlaris untuk keputusan stok dan promo | Low | Agregasi simple count/quantity per menu item. Beware: kategori "Lainnya" harus ditangani jika menu terlalu banyak. |
| Interactive Chart Tooltips | Ekspektasi UX modern; pengguna ingin detail instan saat menyentuh titik data | Low | Chart.js mendukung out-of-the-box. Wajib menampilkan nominal omset dan menu terlaris per tanggal. |
| Date-Filtered E-Report Engine | Pemilik butuh laporan berbasis periode (harian/mingguan/bulanan) untuk evaluasi bisnis | Medium | Perlu query agregasi database dengan rentang tanggal yang valid. Validasi input tanggal wajib ketat. |
| PDF Export for Reports | Dokumen formal untuk arsip internal dan kebutuhan evaluasi bisnis | Medium | Gunakan library seperti jsPDF atau Puppeteer. Layout tabel harus rapi dan tidak terpotong saat cetak. |
| CSV Raw Data Export | Pemilik sering ingin mengolah lebih lanjut di Excel/Google Sheets | Low | Format CSV standar dengan header Indonesia/Inggris konsisten. |
| Manual Daily Sales Entry | Sumber data utama untuk MVP (tidak ada integrasi POS real-time) | Low | Form sederhana: Tanggal, Omset, Menu Terlaris. Validasi duplikasi tanggal dan format angka. |

## Differentiators

Features that set product apart. Not expected, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| One-Click Dummy Data Injector | Demo instan tanpa memerlukan data riil; mempercepat sales pitch dan UAT | Medium | Generate ratusan baris data historis berurutan. Wajib konfirmasi overwrite jika data sudah ada. Fitur ini jarang ada di produk komersial karena berisiko data polutan, tetapi sangat berharga untuk proyek akademik/demo. |
| Sub-3-Second Dashboard Refresh | Pembaruan data hampir instan setelah input manual memberikan kesan "sistem hidup" | Medium | Gunakan polling interval atau SSE (Server-Sent Events). Bukan true WebSocket real-time, tetapi cukup untuk MVP. |
| High-Contrast Dark Mode Dashboard | Optimasi readability untuk pemilik restoran yang sering akses malam hari; mengurangi eye strain | Low | Background gelap + teks putih/kuning; font min 24pt untuk angka finansial. Warning indicator (merah) untuk penurunan omset. |
| Audit Log for Financial Changes | Kepercayaan pemilik meningkat jika setiap perubahan data tercatat; mencegah dispute internal | Medium | Tabel StatusLog mencatat OldRevenue, NewRevenue, ChangedAt, AccountID. Atomic transaction dengan update DailySales. |
| Auto-Generated Daily Report Summary | Laporan harian otomatis yang tersedia tanpa perlu klik tombol | Low | Trigger saat data hari ini tersimpan; tampilkan ringkasan singkat di dashboard. |

## Anti-Features

Features to explicitly NOT build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Real-Time POS Integration | Memerlukan hardware POS, API gateway, dan sertifikasi keamanan yang kompleks; tidak realistis dalam 8 minggu | Manual entry + dummy injector untuk MVP. Integrasi POS bisa dipertimbangkan di v2 setelah ada proof of concept. |
| Multi-Outlet / Multi-Cabang | Mengubah arsitektur database dari single-tenant menjadi multi-tenant; memperpanjang timeline signifikan | Kunci constraint single-outlet di v1. Jika ada permintaan multi-outlet, deploy instance terpisah per cabang. |
| Customer-Facing QR Code Menu | Menyimpang dari fokus manajerial pemilik; menambah kompleksitas frontend dan backend (menu digital, pelacakan pesanan) | Tegaskan positioning sebagai "dashboard manajerial only" pada landing page dan dokumentasi. |
| WhatsApp Auto-Notifications | Memerlukan integrasi third-party gateway (Twilio, Wablas) dan biaya berulang; kompleksitas tidak sebanding dengan value untuk v1 | Defer ke v2. Prioritaskan E-Report PDF/CSV yang bisa di-share manual via WhatsApp. |
| Inventory / Stock Management | Fitur besar dengan domain logic tersendiri (HPP, stok opname, resep BOM); scope creep yang berbahaya | Katakan "tidak" dengan tegas. Jika pemilik butuh, rekomendasikan spreadsheet terpisah atau aplikasi inventaris khusus. |
| Loyalty & Membership System | Tidak ada interaksi sistem dengan konsumen; memerlukan CRM, poin, kupon | Defer ke fase "Guest Engagement" jika produk berkembang menjadi platform all-in-one. |
| Customer Reviews & Ratings | Tidak ada channel untuk mengumpulkan feedback dari konsumen; memerlukan aplikasi pelanggan atau integrasi review site | Gunakan insight dari data penjualan (menu terlaris) sebagai proxy untuk kepuasan pelanggan. |

## Feature Dependencies

```
Secure Owner Authentication
    └──requires──> Role-Based Access Control (sederhana: hanya owner)
                        └──requires──> Password Hashing + Session Storage

Manual Daily Sales Entry
    └──requires──> Database Schema (DailySales, SalesTrend)
                        └──requires──> Date Validation + Duplicate Prevention

Revenue Trend Line Chart
    └──requires──> DailySales Data Aggregation
                        └──requires──> Manual Daily Sales Entry (atau Dummy Injector)

Top-Selling Menu Pie Chart
    └──requires──> DailySales Data Aggregation
                        └──requires──> Manual Daily Sales Entry (atau Dummy Injector)

Date-Filtered E-Report Engine
    └──requires──> DailySales Data Aggregation
                        └──requires──> Date Range Validation

PDF Export
    └──requires──> Date-Filtered E-Report Engine
                        └──requires──> HTML/Canvas to PDF Renderer

CSV Export
    └──requires──> Date-Filtered E-Report Engine
                        └──requires──> JSON/Array to CSV Converter

Dummy Data Injector
    └──requires──> Database Write Access
                        └──requires──> Date Sequence Generator
    └──conflicts──> Existing Real Data (wajib konfirmasi overwrite)

Sub-3-Second Dashboard Refresh
    └──requires──> Revenue Trend Line Chart
                        └──requires──> Client-Side Polling or SSE Endpoint

Audit Log for Financial Changes
    └──requires──> Database Trigger atau Application-Level Logging
                        └──requires──> Atomic Transaction Support
```

### Dependency Notes

- **Line Chart & Pie Chart require Data Aggregation:** Kedua visualisasi bergantung pada data yang sudah tersimpan di tabel DailySales/SalesTrend. Tanpa data, grafik kosong.
- **PDF/CSV Export requires E-Report Engine:** Export adalah representasi static dari laporan yang sudah di-generate di layar. Jangan build export tanpa engine laporan yang solid.
- **Dummy Injector conflicts with Real Data:** Jika data riil sudah ada, suntik data simulasi akan menghapus atau menimpa. Wajib ada modal konfirmasi eksplisit.
- **Audit Log requires Atomic Transactions:** Perubahan omset harian dan penulisan log audit harus dalam satu transaksi database untuk menjaga integritas.

## MVP Recommendation

### Launch With (v1)

Prioritize:
1. **Secure Owner Authentication** — Tanpa ini, data finansial tidak aman dan produk tidak bisa digunakan.
2. **Manual Daily Sales Entry** — Sumber data utama; tanpa ini dashboard kosong.
3. **Dummy Data Injector** — Memungkinkan demo dan UAT tanpa menunggu data riil berhari-hari.
4. **Revenue Trend Line Chart + Tooltips** — Core value proposition produk; harus bekerja dengan akurat.
5. **Top-Selling Menu Pie Chart** — Pelengkap analisis yang diharapkan pemilik.
6. **Date-Filtered E-Report Engine** — Fondasi untuk modul laporan.
7. **PDF Export** — Deliverable utama untuk arsip dan evaluasi bisnis.

Defer:
- **CSV Export** — Complexity rendah tetapi bisa ditambahkan setelah PDF stabil.
- **Audit Log** — Penting untuk integritas, tetapi tidak blocking untuk demo awal.
- **Sub-3-Second Refresh** — Peningkatan UX yang bisa diimplementasikan di iterasi akhir jika waktu tersisa.

### Add After Validation (v1.x)

- CSV Export — Setelah feedback pemilik menunjukkan kebutuhan olah data manual.
- Audit Log — Setelah ada kasus perubahan data yang perlu dilacak.
- Auto-Generated Daily Report Summary — Enhancement UX ringan.

### Future Consideration (v2+)

- Real-Time POS Integration — Jika produk beralih dari proyek akademik ke produk komersial.
- Multi-Outlet Support — Jika ada permintaan dari pemilik dengan banyak cabang.
- WhatsApp Notifications — Jika ada budget untuk third-party gateway.
- Inventory Management — Scope besar yang memerlukan milestone tersendiri.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Secure Owner Authentication | HIGH | LOW | P1 |
| Manual Daily Sales Entry | HIGH | LOW | P1 |
| Dummy Data Injector | HIGH | MEDIUM | P1 |
| Revenue Trend Line Chart | HIGH | LOW | P1 |
| Top-Selling Menu Pie Chart | HIGH | LOW | P1 |
| Interactive Tooltips | MEDIUM | LOW | P1 |
| Date-Filtered E-Report Engine | HIGH | MEDIUM | P1 |
| PDF Export | HIGH | MEDIUM | P1 |
| CSV Export | MEDIUM | LOW | P2 |
| Sub-3-Second Dashboard Refresh | MEDIUM | MEDIUM | P2 |
| High-Contrast Dark Mode Dashboard | MEDIUM | LOW | P2 |
| Audit Log for Financial Changes | MEDIUM | MEDIUM | P2 |
| Auto-Generated Daily Report Summary | LOW | LOW | P3 |
| Multi-Outlet Support | HIGH | HIGH | P3 (defer) |
| Real-Time POS Integration | HIGH | HIGH | P3 (defer) |
| WhatsApp Notifications | LOW | MEDIUM | P3 (defer) |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when core P1 is stable
- P3: Nice to have / future consideration

## Competitor Feature Analysis

| Feature | TouchBistro / Toast (Commercial) | RestoPulse (Our Approach) |
|---------|----------------------------------|---------------------------|
| Data Input | Real-time POS integration | Manual entry + dummy injector (MVP constraint) |
| Revenue Visualization | Line charts + advanced filters (hourly, channel) | Line chart daily trends + simple date filter |
| Menu Analytics | Full menu mix + profitability (food cost %) | Pie chart top-selling items only |
| Report Export | PDF, CSV, Excel, cloud sync | PDF + CSV only (constrained) |
| Multi-Outlet | Native multi-location dashboard | Explicitly out of scope for v1 |
| Inventory | Integrated stock management | Out of scope |
| Notifications | Email, SMS, in-app alerts | None in v1; WhatsApp deferred |
| Audit Trail | Full transaction logs | Planned for v1.x (StatusLog table) |

**Key insight:** Produk komersial memiliki kedalaman fitur yang jauh lebih besar karena terintegrasi dengan ekosistem POS dan back-office. RestoPulse tidak bersaing langsung dengan mereka; positioning kita adalah "laporan sederhana untuk pemilik kecil-menengah yang masih merekap manual." Oleh karena itu, simplicity dan zero-friction adalah keunggulan kompetitif kita, bukan jumlah fitur.

## Sources

- TouchBistro Blog: "How Your Restaurant Analytics Can Help Increase Revenue" (2021, updated context) — analisis 9 area utama data restoran: Payments, Customer Insights, Discounts/Voids, Inventory, Staff Performance, Menu, Scheduling, Reviews, Marketing.
- PRD RestoPulse v1.0 — spesifikasi fitur, MoSCoW, dan batasan ruang lingkup.
- PROJECT.md RestoPulse — konteks bisnis, constraint timeline 8 minggu, dan keputusan arsitektur.
- Ekosistem POS Analytics umum: Toast, Square, Lightspeed — menunjukkan table stakes standar industri (login, trend charts, menu analytics, export).

---
*Feature research for: Restaurant Analytics Dashboard (RestoPulse)*
*Researched: 2026-06-25*
