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
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Geral');
  const [person, setPerson] = useState('Ambos');
  const [txDate, setTxDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    // Auto-injetar salários se não existirem neste mês
    const { data: salaryCheck } = await supabase
      .from('transactions')
      .select('id')
      .eq('category', 'Salário')
      .gte('date', startOfMonth)
      .lte('date', endOfMonth)
      .limit(1);

    if (!salaryCheck || salaryCheck.length === 0) {
      const { data: settings } = await supabase.from('settings').select('*').eq('id', 1).single();
      if (settings) {
        await supabase.from('transactions').insert([
          { description: 'Salário Base', category: 'Salário', amount: settings.income_a, type: 'income', person: 'Erick', date: startOfMonth, is_paid: true },
          { description: 'Salário Base', category: 'Salário', amount: settings.income_b, type: 'income', person: 'Rapha', date: startOfMonth, is_paid: true }
        ]);
      }
    }

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

  const openNew = () => {
    setEditingId(null);
    setDesc('');
    setAmount('');
    setType('expense');
    setCategory('Geral');
    setPerson('Ambos');
    
    // Tentar setar a data atual do mês que a pessoa está visualizando
    const pad = (n: number) => String(n).padStart(2, '0');
    // Para não cair no passado se não for o mês atual, usar uma data dentro do mês do currentDate
    const today = new Date();
    if (today.getFullYear() === currentDate.getFullYear() && today.getMonth() === currentDate.getMonth()) {
      setTxDate(`${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`);
    } else {
      setTxDate(`${currentDate.getFullYear()}-${pad(currentDate.getMonth() + 1)}-01`);
    }
    
    setIsModalOpen(true);
  };

  const openEdit = (t: Transaction) => {
    setEditingId(t.id);
    setDesc(t.description);
    setAmount(t.amount.toString());
    setType(t.type);
    setCategory(t.category);
    setPerson(t.person);
    setTxDate(t.date);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount || !txDate) {
      alert('Preencha descrição, valor e data.');
      return;
    }
    
    setIsSubmitting(true);
    const numericAmount = Number(amount);
    const payload = {
      description: desc,
      amount: numericAmount,
      type: type,
      category,
      person,
      date: txDate,
      is_paid: true
    };

    if (editingId) {
      const { error } = await supabase.from('transactions').update(payload).eq('id', editingId);
      if (error) alert('Erro ao atualizar: ' + error.message);
    } else {
      const { error } = await supabase.from('transactions').insert(payload);
      if (error) alert('Erro ao inserir: ' + error.message);

      // Vínculo cruzado com Dívida da Obra
      if (!error && type === 'expense') {
        const descLower = desc.toLowerCase();
        let matchedType: string | null = null;
        if (descLower.includes('ato') || descLower.includes('sinal')) matchedType = 'sinal';
        else if (descLower.includes('entrada')) matchedType = 'entrada';
        else if (descLower.includes('assinatura')) matchedType = 'assinatura';
        else if (descLower.includes('mensal')) matchedType = 'mensal';
        else if (descLower.includes('anual')) matchedType = 'anual';
        else if (descLower.includes('intermediaria') || descLower.includes('intermediária')) matchedType = 'intermediaria';
        else if (descLower.includes('juros') || descLower.includes('juro')) matchedType = 'juros_obra';

        if (matchedType) {
          const { data: pendingPayments } = await supabase
            .from('construction_payments')
            .select('id')
            .eq('status', 'pendente')
            .eq('payment_type', matchedType)
            .order('due_date', { ascending: true })
            .limit(1);
            
          if (pendingPayments && pendingPayments.length > 0) {
            await supabase.from('construction_payments').update({ status: 'pago' }).eq('id', pendingPayments[0].id);
          }
        }
      }
    }
    
    setIsSubmitting(false);
    setIsModalOpen(false);
    fetchTransactions();
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
              <div 
                key={t.id} 
                onClick={() => openEdit(t)}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center active:bg-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
              >
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

      <button onClick={openNew} className="fixed bottom-24 right-5 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center text-3xl font-light hover:bg-blue-900 active:scale-90 transition-all z-40 pb-1">
        +
      </button>

      {/* Modal de transação */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl p-5 animate-in slide-in-from-bottom-full duration-300">
            <h3 className="text-xl font-bold mb-4">{editingId ? 'Editar Transação' : 'Nova Transação'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex gap-2 mb-2">
                <button type="button" onClick={() => setType('expense')} className={`flex-1 py-2 rounded-lg font-bold ${type === 'expense' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>Gasto</button>
                <button type="button" onClick={() => setType('income')} className={`flex-1 py-2 rounded-lg font-bold ${type === 'income' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>Ganho</button>
              </div>
              
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Descrição</label>
                <input type="text" value={desc} onChange={e => setDesc(e.target.value)} className="w-full p-2 border-b-2 border-gray-200 focus:border-primary outline-none" placeholder="Ex: Conta de Luz" />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Valor (R$)</label>
                  <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-2 border-b-2 border-gray-200 focus:border-primary outline-none" placeholder="0,00" />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Data</label>
                  <input type="date" value={txDate} onChange={e => setTxDate(e.target.value)} className="w-full p-2 border-b-2 border-gray-200 focus:border-primary outline-none" />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Categoria</label>
                  <input type="text" value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 border-b-2 border-gray-200 focus:border-primary outline-none" placeholder="Geral" />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Pessoa</label>
                  <select value={person} onChange={e => setPerson(e.target.value)} className="w-full p-2 border-b-2 border-gray-200 focus:border-primary outline-none bg-white">
                    <option value="Ambos">Ambos</option>
                    <option value="Erick">Erick</option>
                    <option value="Rapha">Rapha</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-500 font-bold rounded-xl active:scale-95 transition-all uppercase text-sm">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl shadow-md active:scale-95 transition-all disabled:opacity-50">
                  {isSubmitting ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
