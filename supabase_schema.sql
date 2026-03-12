-- Drop existing tables if they exist (cuidado ao rodar em produção!)
-- DROP TABLE IF EXISTS transactions;
-- DROP TABLE IF EXISTS caixinha_transactions;
-- DROP TABLE IF EXISTS construction_payments;
-- DROP TABLE IF EXISTS settings;

-- 1. Tabela de Transações (Extrato / Rendas e Gastos)
CREATE TABLE transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Geral',
    amount NUMERIC(10, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    person TEXT NOT NULL, -- Ex: 'Erick' ou 'Noiva'
    date DATE NOT NULL,
    is_paid BOOLEAN DEFAULT true
);

-- 2. Tabela da Caixinha (Depósitos e Saques Blindados)
CREATE TABLE caixinha_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
    reason TEXT, -- Obrigatório apenas para saques
    date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- 3. Tabela de Dívida com a Construtora (Obra)
CREATE TABLE construction_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    payment_type TEXT NOT NULL CHECK (payment_type IN ('sinal', 'entrada', 'assinatura', 'mensal', 'anual', 'intermediaria', 'juros_obra')),
    amount NUMERIC(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pendente', 'pago')) DEFAULT 'pendente'
);

-- 4. Tabela de Configurações (Ajustes e Metas)
-- Usaremos sempre id = 1 para manter um único registro de configuração global
CREATE TABLE settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    partner_a_name TEXT NOT NULL DEFAULT 'Erick',
    partner_b_name TEXT NOT NULL DEFAULT 'Noiva',
    income_a NUMERIC(10, 2) NOT NULL DEFAULT 3500.00,
    income_b NUMERIC(10, 2) NOT NULL DEFAULT 3000.00,
    property_goal NUMERIC(12, 2) NOT NULL DEFAULT 150000.00
);

-- Inserir o registro padrão de configurações
INSERT INTO settings (id, partner_a_name, partner_b_name, income_a, income_b, property_goal)
VALUES (1, 'Erick', 'Noiva', 3500.00, 3000.00, 150000.00)
ON CONFLICT (id) DO NOTHING;

-- Opcional: Habilitar Row Level Security (RLS) se houver autenticação no futuro
-- Por enquanto, como o app é focado sem autenticação local forte (ou autenticação anônima),
-- podemos deixar as políticas permissivas para o acesso anônimo inicial (CUIDADO EM PRODUÇÃO):
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE caixinha_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE construction_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous select on transactions" ON transactions FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert on transactions" ON transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update on transactions" ON transactions FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete on transactions" ON transactions FOR DELETE USING (true);

CREATE POLICY "Allow anonymous select on caixinha_transactions" ON caixinha_transactions FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert on caixinha_transactions" ON caixinha_transactions FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous select on construction_payments" ON construction_payments FOR SELECT USING (true);
CREATE POLICY "Allow anonymous update on construction_payments" ON construction_payments FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous insert on construction_payments" ON construction_payments FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous select on settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Allow anonymous update on settings" ON settings FOR UPDATE USING (true);

-- Lembrete: Se for implantar de verdade para vocês usarem, considere usar no mínimo a 
-- funcionalidade de usuários autenticados (mesmo que estaticamente) para evitar que
-- qualquer um com a Chave Pública do seu Supabase modifique os dados.
