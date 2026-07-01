-- CreateTable
CREATE TABLE "MonthlyExpense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "outlet_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MonthlyExpense_outlet_id_fkey" FOREIGN KEY ("outlet_id") REFERENCES "Outlet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CateringOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "outlet_id" TEXT NOT NULL,
    "client_name" TEXT NOT NULL,
    "order_date" DATETIME NOT NULL,
    "total_amount" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CateringOrder_outlet_id_fkey" FOREIGN KEY ("outlet_id") REFERENCES "Outlet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "MonthlyExpense_outlet_id_month_year_idx" ON "MonthlyExpense"("outlet_id", "month", "year");

-- CreateIndex
CREATE INDEX "CateringOrder_outlet_id_order_date_idx" ON "CateringOrder"("outlet_id", "order_date");
