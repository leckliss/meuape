import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
export function Dashboard() {
  const [data, setData] = useState({
    income: 0,
    expense: 0,
    saved: 0,
    goal: 150000
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true);
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const startOfMonth = `${year}-${month}-01`;
      const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
      const endOfMonth = `${year}-${month}-${lastDay}`;

      // 1. Puxar as transações do mês
      const { data: txs } = await supabase
        .from('transactions')
        .select('amount, type')
        .gte('date', startOfMonth)
        .lte('date', endOfMonth);

      let income = 0;
      let expense = 0;
      
      if (txs) {
        txs.forEach(t => {
          if (t.type === 'income') income += Number(t.amount);
          if (t.type === 'expense') expense += Number(t.amount);
        });
      }

      // 2. Puxar total guardado na caixinha
      const { data: cxTxs } = await supabase.from('caixinha_transactions').select('amount, type');
      let saved = 0;
      if (cxTxs) {
        saved = cxTxs.reduce((acc, curr) => {
          return curr.type === 'deposit' ? acc + Number(curr.amount) : acc - Number(curr.amount);
        }, 0);
      }

      // 3. Puxar meta do imóvel das configurações
      const { data: settings } = await supabase.from('settings').select('property_goal').eq('id', 1).single();
      const goal = settings ? Number(settings.property_goal) : 150000;

      setData({ income, expense, saved, goal });
      setIsLoading(false);
    }

    fetchDashboardData();
  }, []);

  const progress = data.goal > 0 ? Math.min(100, Math.round((data.saved / data.goal) * 100)) : 0;
  const balance = data.income - data.expense;
  
  const currentMonthName = new Date().toLocaleString('pt-BR', { month: 'long', timeZone: 'UTC' });

  return (
    <div className="p-5 space-y-6">
      <header className="flex flex-col items-center pt-4 pb-2">
        <h1 className="text-2xl font-bold text-primary">Nosso Apê</h1>
        <p className="text-sm text-gray-500 font-medium capitalize">Balanço Atual: {currentMonthName}</p>
      </header>

      {/* Meta e Progresso */}
      <section className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        {isLoading && <p className="text-xs text-gray-400 text-center absolute m-auto inset-x-0">Carregando...</p>}
        <div className={`transition-opacity ${isLoading ? 'opacity-30' : 'opacity-100'}`}>
          <div className="flex justify-between text-sm mb-2 font-bold text-primary">
            <span>Conquista das Chaves</span>
            <span>{progress}%</span>
          </div>
        <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
          <div className="bg-primary h-4 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="text-xs text-center text-gray-500 mt-3 font-medium">Cada centavo conta para o nosso sonho!</p>
        </div>
      </section>

      {/* Cards de Resumo */}
      <div className={`grid grid-cols-2 gap-4 transition-opacity ${isLoading ? 'opacity-30' : 'opacity-100'}`}>
        <div className="bg-white p-4 rounded-2xl border border-l-4 border-l-green-500 shadow-sm relative overflow-hidden">
          <p className="text-[11px] text-gray-500 uppercase tracking-widest font-bold">Renda Total</p>
          <p className="text-xl font-black text-gray-800 mt-1">
            R$ {data.income.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-l-4 border-l-red-500 shadow-sm relative overflow-hidden">
          <p className="text-[11px] text-gray-500 uppercase tracking-widest font-bold">Gastos Reais</p>
          <p className="text-xl font-black text-red-600 mt-1">
            R$ {data.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Saldo Livre */}
      <div className={`bg-primary p-6 rounded-2xl shadow-lg text-white relative overflow-hidden transition-opacity ${isLoading ? 'opacity-30' : 'opacity-100'}`}>
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <p className="text-sm opacity-90 font-medium mb-1">Nosso Saldo Livre Neste Mês</p>
        <p className="text-4xl font-black">
          R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className="text-xs mt-3 opacity-75">Deduzidos os gastos imediatos e faturas já lançadas.</p>
      </div>
    </div>
  );
}
