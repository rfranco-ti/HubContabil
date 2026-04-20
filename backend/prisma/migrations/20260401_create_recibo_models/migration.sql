-- CreateTable
CREATE TABLE "recibo_modelos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "usuario_id" UUID,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "estrutura" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recibo_modelos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recibos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "usuario_id" UUID NOT NULL,
    "cliente_id" UUID NOT NULL,
    "modelo_id" UUID,
    "tipo" TEXT NOT NULL,
    "dados" JSONB NOT NULL,
    "pdf_url" TEXT,
    "valor" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'gerado',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recibos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recibo_modelos_usuario_id_idx" ON "recibo_modelos"("usuario_id");

-- CreateIndex
CREATE INDEX "recibo_modelos_tipo_idx" ON "recibo_modelos"("tipo");

-- CreateIndex
CREATE INDEX "recibos_cliente_id_idx" ON "recibos"("cliente_id");

-- CreateIndex
CREATE INDEX "recibos_usuario_id_idx" ON "recibos"("usuario_id");

-- AddForeignKey
ALTER TABLE "recibos" ADD CONSTRAINT "recibos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recibos" ADD CONSTRAINT "recibos_modelo_id_fkey" FOREIGN KEY ("modelo_id") REFERENCES "recibo_modelos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
