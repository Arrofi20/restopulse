-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "outlet_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Setting_outlet_id_idx" ON "Setting"("outlet_id");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_outlet_id_key_key" ON "Setting"("outlet_id", "key");
