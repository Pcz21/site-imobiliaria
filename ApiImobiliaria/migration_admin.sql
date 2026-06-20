-- ============================================================
-- Migration: AddCorretores + setar admins iniciais
-- Execute APENAS UMA VEZ no banco de produção
-- ============================================================

-- 1. Criar tabela Corretores (se ainda não existir)
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Corretores')
BEGIN
    CREATE TABLE [Corretores] (
        [Id]               INT IDENTITY(1,1) NOT NULL,
        [Email]            NVARCHAR(200)     NOT NULL,
        [SenhaHash]        NVARCHAR(MAX)     NOT NULL,
        [IsAdmin]          BIT               NOT NULL DEFAULT 0,
        [EmailVerificado]  BIT               NOT NULL DEFAULT 1,
        [CriadoEm]         DATETIME2         NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT [PK_Corretores] PRIMARY KEY ([Id])
    );

    CREATE UNIQUE INDEX [IX_Corretores_Email] ON [Corretores] ([Email]);
END;

-- 2. Marcar admins iniciais (quando o auto-seed criar as entradas via primeiro login)
-- Execute APÓS cada admin ter feito login pela primeira vez:
UPDATE [Corretores]
SET    [IsAdmin] = 1
WHERE  [Email] IN (
    'corretora.fabiju243454@gmail.com',
    'spaulo456.com@gmail.com'
);

-- 3. Registrar migration no histórico do EF (para não aplicar novamente)
IF NOT EXISTS (
    SELECT 1 FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = '20260620000001_AddCorretores'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES ('20260620000001_AddCorretores', '10.0.8');
END;