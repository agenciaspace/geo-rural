-- Adicionar campos faltantes na tabela user_profiles
-- Estes campos são necessários para o onboarding funcionar

-- Adicionar coluna position se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'position'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN position TEXT;
    END IF;
END $$;

-- Adicionar coluna city se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'city'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN city TEXT;
    END IF;
END $$;

-- Adicionar coluna state se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'state'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN state TEXT;
    END IF;
END $$;

-- Verificar estrutura final da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;