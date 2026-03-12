import fs from 'fs';
import csv from 'csv-parser';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Carregar variáveis de ambiente do .env local
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY devem estar definidos no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Interfaces para tipagem
interface CsvRow {
  'Mês/Ano': string;
  'Ms/Ano'?: string; // Por causa do erro de codificação do arquivo CSV
  'Receita': string;
  'Gastos Pessoais Fixo 1': string;
  'Gastos Pessoais Fixo 2': string;
  'Gastos Pessoais Variaveis 1': string;
  'Gastos Pessoais Variaveis 2': string;
  'Valor Restante Após Gastos': string;
  'Detalhe Construtora': string;
  'Valor Construtora': string;
  'Juros de Obra': string;
  'Total a Pagar (Construtora)': string;
  'Saldo do Mês': string;
  'Dinheiro Guardado Acumulado': string;
  'OBS': string;
}

// Função auxiliar para converter valores monetários (ex: "1.000,00" ou "R$ 1.000,00" -> 1000.00)
function parseCurrency(value: string | undefined): number {
  if (!value || value.trim() === '') return 0;
  // Remove "R$", pontos de milhar, espaços e troca vírgula por ponto
  const cleaned = value.replace(/R\$\s?/g, '').replace(/\./g, '').replace(',', '.').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

// Função para mapear o 'Detalhe Construtora' para o tipo aceito no Supabase
function mapPaymentType(detail: string): string {
  const lower = detail.toLowerCase();
  if (lower.includes('mensal')) return 'mensal';
  if (lower.includes('anual')) return 'anual';
  if (lower.includes('entrada')) return 'entrada';
  if (lower.includes('sinal')) return 'sinal';
  if (lower.includes('assinatura')) return 'assinatura';
  if (lower.includes('intermediaria') || lower.includes('intermediária')) return 'intermediaria';
  return 'mensal'; // fallback
}

// Para identificar se a data da parcela/evento já passou
function isPaid(dateString: string): boolean {
  const dateStr = dateString.includes('/') ? dateString.split('/').reverse().join('-') : dateString;
  const eventDate = new Date(dateStr);
  const now = new Date();
  return eventDate < now;
}

async function processCSV(filePath: string) {
  const rows: CsvRow[] = [];

  console.log('⏳ Lendo o arquivo CSV...');

  fs.createReadStream(filePath)
    .pipe(csv({ separator: ';' })) // Atualizado para usar ponto-e-vírgula em vez de vírgula
    .on('data', (data) => rows.push(data))
    .on('end', async () => {
      console.log(`✅ ${rows.length} linhas lidas do CSV. Iniciando o processamento...`);

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        
        // Regra: Pular se a OBS contiver "DESCONDERAR ESSA LINHA" (ou equivalente)
        if (row['OBS'] && (row['OBS'].toUpperCase().includes('DESCONDERAR') || row['OBS'].toUpperCase().includes('DESCONSIDERAR'))) {
          console.log(`⏭️ Ignorando linha do mês ${row['Mês/Ano']} por causa da observação.`);
          continue;
        }

        // Tentar sanitizar a data (padrão esperado para TIMESTAMP WITH TIME ZONE ou DATE: YYYY-MM-DD)
        // Lidar com problemas de acentuação ('Mês/Ano' vs 'Ms/Ano') pegando a primeira coluna do objeto
        let baseDate = row['Mês/Ano'] || row['Ms/Ano'] || Object.values(row)[0] as string;
        
        if (baseDate && baseDate.includes('/')) {
            const parts = baseDate.split('/');
            if (parts.length === 3) {
                baseDate = `${parts[2]}-${parts[1]}-${parts[0]}`; // DD/MM/YYYY to YYYY-MM-DD
            } else if (parts.length === 2) {
                baseDate = `${parts[1]}-${parts[0]}-01`; // MM/YYYY to YYYY-MM-01
            }
        }
        
        // Prevenir inserções de datas vazias corrompidas 
        if (!baseDate || baseDate.trim() === '') continue;

        const isPaidStatus = isPaid(baseDate);

        try {
          // --- 1. TABELA DE TRANSAÇÕES (RECEITA E GASTOS) ---
          
          const receita = parseCurrency(row['Receita']);
          if (receita > 0) {
            const { error: err } = await supabase.from('transactions').insert({
              description: 'Salário Base',
              category: 'Renda',
              amount: receita,
              type: 'income',
              person: 'Casal',
              date: baseDate,
              is_paid: true
            });
            if(err) throw err;
          }

          const fixo1 = parseCurrency(row['Gastos Pessoais Fixo 1']);
          if (fixo1 > 0) {
            const { error: err } = await supabase.from('transactions').insert({
              description: 'Gasto Fixo Erick',
              category: 'Fixo',
              amount: fixo1,
              type: 'expense',
              person: 'Erick',
              date: baseDate,
              is_paid: true
            });
            if(err) throw err;
          }

          const fixo2 = parseCurrency(row['Gastos Pessoais Fixo 2']);
          if (fixo2 > 0) {
            const { error: err } = await supabase.from('transactions').insert({
              description: 'Gasto Fixo Noiva',
              category: 'Fixo',
              amount: fixo2,
              type: 'expense',
              person: 'Noiva',
              date: baseDate,
              is_paid: true
            });
            if(err) throw err;
          }

          const var1 = parseCurrency(row['Gastos Pessoais Variaveis 1']);
          if (var1 > 0) {
            const { error: err } = await supabase.from('transactions').insert({
              description: 'Gasto Variável Erick',
              category: 'Variável',
              amount: var1,
              type: 'expense',
              person: 'Erick',
              date: baseDate,
              is_paid: true
            });
            if(err) throw err;
          }

          const var2 = parseCurrency(row['Gastos Pessoais Variaveis 2']);
          if (var2 > 0) {
            const { error: err } = await supabase.from('transactions').insert({
              description: 'Gasto Variável Noiva',
              category: 'Variável',
              amount: var2,
              type: 'expense',
              person: 'Noiva',
              date: baseDate,
              is_paid: true
            });
            if(err) throw err;
          }


          // --- 2. TABELA DE EXTRATO CONSTRUTORA (CONSTRUCTION PAYMENTS) ---

          const valorConstrutora = parseCurrency(row['Valor Construtora']);
          const detalheConstrutora = row['Detalhe Construtora']?.trim() || '';

          if (valorConstrutora > 0) {
            // Regra: Separar se contiver "+"
            if (detalheConstrutora.includes('+')) {
              // Exemplo clássico assumido: Mensal + Anual
              // Sabemos que a Mensal A deve ser ~999.00 e a Mensal B ~949.64. Vamos usar 999.00 como default 
              // da parcela mensal nesses casos duplos assumidos, MAS para ser preciso, ajustaremos dinamicamente.
              let mensalAmount = 949.64; 
              if (detalheConstrutora.includes('Mensal A')) mensalAmount = 999.00;

              // Prevenção, caso o valor total seja menor que a mensal (não deveria ocorrer)
              if (valorConstrutora < mensalAmount) {
                mensalAmount = valorConstrutora;
              }

              const anualAmount = valorConstrutora - mensalAmount;

              // Insere a parcela Mensal
              const { error: errMensal } = await supabase.from('construction_payments').insert({
                payment_type: 'mensal',
                amount: mensalAmount,
                due_date: baseDate,
                status: isPaidStatus ? 'pago' : 'pendente'
              });
              if(errMensal) throw errMensal;

              // Insere a parcela Anual extraída
              if (anualAmount > 0) {
                const { error: errAnual } = await supabase.from('construction_payments').insert({
                  payment_type: 'anual',
                  amount: anualAmount,
                  due_date: baseDate,
                  status: isPaidStatus ? 'pago' : 'pendente'
                });
                if(errAnual) throw errAnual;
              }
            } else {
              // Fluxo normal (sem +)
              const { error: errNormal } = await supabase.from('construction_payments').insert({
                payment_type: mapPaymentType(detalheConstrutora),
                amount: valorConstrutora,
                due_date: baseDate,
                status: isPaidStatus ? 'pago' : 'pendente'
              });
              if(errNormal) throw errNormal;
            }
          }

          // Inserir Juros de Obra (Registro separado)
          const jurosObra = parseCurrency(row['Juros de Obra']);
          if (jurosObra > 0) {
            const { error: errJuros } = await supabase.from('construction_payments').insert({
              payment_type: 'juros_obra',
              amount: jurosObra,
              due_date: baseDate,
              status: isPaidStatus ? 'pago' : 'pendente'
            });
            if(errJuros) throw errJuros;
          }


          // --- 3. TABELA CAIXINHA (DINHEIRO GUARDADO) ---
          
          const saldo = parseCurrency(row['Saldo do Mês']);
          if (saldo > 0) {
            const { error: errCaixinha } = await supabase.from('caixinha_transactions').insert({
              amount: saldo,
              type: 'deposit',
              reason: 'Sobra do mês ' + baseDate,
              date: baseDate
            });
            if(errCaixinha) throw errCaixinha;
          }

          console.log(`✅ Sucesso na linha: Mês/Ano = ${baseDate}`);

        } catch (err) {
          console.error(`❌ Erro inserindo dados da linha no mês ${baseDate}:`, err);
        }
      }

      console.log('🎉 Finalizado com sucesso! O histórico foi enviado ao Supabase.');
    });
}

// Inicia a execução do Script (Lembre-se de passar o caminho correto para o arquivo CSV de Gastos aqui)
const csvFilePath = path.resolve(process.cwd(), 'Gastos.csv');

if (!fs.existsSync(csvFilePath)) {
  console.error(`❌ Nenhum arquivo Gastos.csv encontrado em ${csvFilePath}`);
  console.log('➡️ DICA: Coloque o arquivo Gastos.csv na raiz do projeto onde está este script e tente novamente.');
  process.exit(1);
}

processCSV(csvFilePath);
