import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Transaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  type: string;
  person: string;
  date: string;
}

export function Extrato() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Como os dados mock do CSV estão em 2026 e 2027, o default deveria ser uma data lá, mas vamos colocar a de hoje como base
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchTransactions = async () => {
    setIsLoading(true);
    
    // Calcula início e fim do mês usando offsets UTC para evitar bugs de fuso horário
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    
    // yyyy-mm-dd
    const startOfMonth = `${year}-${month}-01`;
    const lastDay = new Date(year, currentDate.getMonth() + 1, 0).getDate();
    const endOfMonth = `${year}-${month}-${lastDay}`;

    const { data } = await supabase
      .from('transactions')
      .select('*')
      .gte('date', startOfMonth)
      .lte('date', endOfMonth)
      .order('date', { ascending: false });
      
    if (data) setTransactions(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentDate]);

  const restanteLivre = transactions.reduce((acc, curr) => {
    return curr.type === 'income' ? acc + Number(curr.amount) : acc - Number(curr.amount);
  }, 0);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const monthName = currentDate.toLocaleString('pt-BR', { month: 'long', timeZone: 'UTC' });
  const yearName = currentDate.getFullYear();

  const formatDateShort = (dateString: string) => {
    if (!dateString) return '';
    const [, m, d] = dateString.split('-');
    return `${d}/${m}`;
  };
  return (
    <div className="p-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h2 className="text-2xl font-bold text-primary mb-6 text-center mt-2">Extrato do Mês</h2>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4 flex justify-between items-center relative overflow-hidden">
        <div className="absolute left-0 top-0 w-1 h-full bg-primary"></div>
        <div>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-1 capitalize">
            {monthName} / {yearName}
          </p>
          <p className="text-xs text-gray-400">
            Saldo do Mês: <span className={`font-bold ${restanteLivre >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {restanteLivre.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="bg-gray-100 text-primary p-2 rounded-xl font-bold active:scale-95 transition-all w-10 text-center">
            &lt;
          </button>
          <button onClick={nextMonth} className="bg-gray-100 text-primary p-2 rounded-xl font-bold active:scale-95 transition-all w-10 text-center">
            &gt;
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-center text-gray-500 font-bold py-10">Buscando transações...</p>
        ) : transactions.length === 0 ? (
          <p className="text-center text-gray-500 font-medium py-10">Nenhuma transação neste mês.</p>
        ) : (
          transactions.map((t) => {
            const isIncome = t.type === 'income';
            
            return (
              <div key={t.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center active:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    isIncome ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {isIncome ? '📈' : '📉'}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{t.description}</p>
                    <p className="text-[11px] text-gray-500 font-medium capitalize">
                      {formatDateShort(t.date)} • {t.category} • {t.person}
                    </p>
                  </div>
                </div>
                <p className={`font-black ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                  {isIncome ? '+' : '-'} R$ {Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            )
          })
        )}
      </div>

      <button className="fixed bottom-24 right-5 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center text-3xl font-light hover:bg-blue-900 active:scale-90 transition-all z-40 pb-1">
        +
      </button>
    </div>
  );
}
