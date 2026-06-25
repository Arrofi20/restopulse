-- CreateTable
CREATE TABLE "OwnerAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "outlet_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OwnerAccount_outlet_id_fkey" FOREIGN KEY ("outlet_id") REFERENCES "Outlet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Outlet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Jakarta',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "DailySales" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "revenue" REAL NOT NULL,
    "top_menu_items" TEXT NOT NULL,
    "outlet_id" TEXT NOT NULL,
    "data_source" TEXT NOT NULL DEFAULT 'REAL',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "DailySales_outlet_id_fkey" FOREIGN KEY ("outlet_id") REFERENCES "Outlet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SalesTrend" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "revenue" REAL NOT NULL,
    "menu_popularity" TEXT NOT NULL,
    "outlet_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "SalesTrend_outlet_id_fkey" FOREIGN KEY ("outlet_id") REFERENCES "Outlet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StatusLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "old_value" TEXT,
    "new_value" TEXT,
    "actor_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "DailySalesReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "period_start" DATETIME NOT NULL,
    "period_end" DATETIME NOT NULL,
    "total_revenue" REAL NOT NULL,
    "transaction_count" INTEGER NOT NULL,
    "top_items" TEXT NOT NULL,
    "generated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "outlet_id" TEXT NOT NULL,
    CONSTRAINT "DailySalesReport_outlet_id_fkey" FOREIGN KEY ("outlet_id") REFERENCES "Outlet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "OwnerAccount_username_key" ON "OwnerAccount"("username");

-- CreateIndex
CREATE INDEX "DailySales_outlet_id_date_idx" ON "DailySales"("outlet_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailySales_outlet_id_date_key" ON "DailySales"("outlet_id", "date");

-- CreateIndex
CREATE INDEX "SalesTrend_outlet_id_date_idx" ON "SalesTrend"("outlet_id", "date");

-- CreateIndex
CREATE INDEX "StatusLog_entity_type_entity_id_idx" ON "StatusLog"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "DailySalesReport_outlet_id_period_start_period_end_idx" ON "DailySalesReport"("outlet_id", "period_start", "period_end");
