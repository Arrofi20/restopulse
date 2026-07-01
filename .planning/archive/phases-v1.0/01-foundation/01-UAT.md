---
status: complete
phase: 01-foundation
source:
  - 01-01-SUMMARY.md
  - 01-02-SUMMARY.md
  - 01-03-SUMMARY.md
  - 01-04-SUMMARY.md
  - 01-05-SUMMARY.md
started: 2026-06-25T23:15:00Z
updated: 2026-06-26T00:20:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running server. Delete prisma/dev.db. Jalankan `npm run db:seed` lalu `npm run dev`. Server harus boot tanpa error, seed migration berhasil, dan `GET /health` mengembalikan `{"status":"ok"}`. Database harus memiliki 1 outlet, 1 owner, 7 sales records setelah seed.
result: pass

### 2. Register Owner
expected: `POST /api/auth/register` dengan body `{"username":"testowner","password":"test12345"}` mengembalikan status 201 dengan token JWT dan data owner (id, username). Outlet "Resto Utama" auto-created jika belum ada.
result: pass

### 3. Login with Credentials
expected: `POST /api/auth/login` dengan body `{"username":"testowner","password":"test12345"}` mengembalikan status 200 dengan token JWT. Login dengan password salah mengembalikan status 401 dengan pesan "Invalid credentials".
result: pass

### 4. Access Protected Endpoint Without Token
expected: `GET /api/sales?start=2026-01-01&end=2026-06-25` tanpa Authorization header mengembalikan status 401 dengan code "UNAUTHORIZED" dan pesan "No token provided".
result: pass

### 5. Create Daily Sales Entry
expected: `POST /api/sales` dengan Authorization header valid dan body `{"date":"2026-06-24","revenue":1500000,"top_menu_items":["Nasi Goreng","Es Teh"]}` mengembalikan status 201. StatusLog audit record dibuat, SalesTrend di-upsert.
result: pass

### 6. Reject Future Date
expected: `POST /api/sales` dengan date besok (future) mengembalikan status 400 dengan pesan "Cannot record sales for future dates".
result: pass

### 7. Reject Duplicate Date
expected: `POST /api/sales` dengan date yang sama (setelah entry pertama berhasil) mengembalikan status 400 dengan pesan "Sales record already exists for this date".
result: pass

### 8. Retrieve Sales by Date Range
expected: `GET /api/sales?start=2026-06-01&end=2026-06-30` dengan Authorization valid mengembalikan status 200 dengan array sales records milik outlet yang terautentikasi.
result: pass

### 9. Dummy Data Injector
expected: `POST /api/admin/dummy-inject` dengan body `{"days":30,"confirm":"HAPUS"}` mengembalikan status 200 dengan `{"inserted":N}`. Tanpa confirmation "HAPUS" mengembalikan error.
result: pass

### 10. Dummy Data Does Not Overwrite REAL Records
expected: Setelah inject dummy data, menjalankan inject kedua dengan confirm "HAPUS" tidak menghapus/mengubah sales records dengan data_source="REAL" (hanya DUMMY records yang direplace).
result: pass

### 11. Rate Limiter on Auth Endpoints
expected: `POST /api/auth/login` lebih dari 5 kali dalam 15 menit dari IP yang sama mengembalikan status 429 dengan code "RATE_LIMITED".
result: pass

### 12. Health Check Endpoint
expected: `GET /health` mengembalikan status 200 dengan `{"status":"ok","timestamp":"..."}` tanpa perlu autentikasi.
result: pass

### 13. Seed Script Creates Dev Data
expected: `npm run db:seed` berjalan tanpa error, mencetak "Seeded: 1 outlet, 1 owner (admin/admin123), 7 sales records". Database terisi: 1 Outlet (Resto Utama), 1 OwnerAccount (admin), 7 DailySales records.
result: pass

## Summary

total: 13
passed: 13
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none yet]
