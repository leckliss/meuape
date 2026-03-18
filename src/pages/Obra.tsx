import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Pagamento {
  id: string;
  payment_type: string;
  amount: number;
  due_date: string;
  status: string;
}

export function Obra() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState('mensal');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [pStatus, setPStatus] = useState('pendente');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPagamentos = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('construction_payments')
      .select('*')
      .order('due_date', { ascending: true });
    
    if (data) {
      setPagamentos(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPagamentos();
  }, []);

  const totalRestante = pagamentos
    .filter(p => p.status === 'pendente')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalPago = pagamentos
    .filter(p => p.status === 'pago')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    setIsUpdating(true);
    const newStatus = currentStatus === 'pago' ? 'pendente' : 'pago';
    const { error } = await supabase
      .from('construction_payments')
      .update({ status: newStatus })
      .eq('id', id);
    
    if (error) {
      alert('Erro ao alterar status: ' + error.message);
    } else {
      await fetchPagamentos();
    }
    setIsUpdating(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const openNew = () => {
    setEditingId(null);
    setPaymentType('mensal');
    setAmount('');
    setDueDate('');
    setPStatus('pendente');
    setIsModalOpen(true);
  };

  const openEdit = (p: Pagamento) => {
    setEditingId(p.id);
    setPaymentType(p.payment_type);
    setAmount(p.amount.toString());
    setDueDate(p.due_date);
    setPStatus(p.status);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !dueDate) {
      alert('Preencha o valor e a data de vencimento.');
      return;
    }
    
    setIsSubmitting(true);
    const numericAmount = Number(amount);
    const payload = {
      payment_type: paymentType,
      amount: numericAmount,
      due_date: dueDate,
      status: pStatus
    };

    if (editingId) {
      const { error } = await supabase.from('construction_payments').update(payload).eq('id', editingId);
      if (error) alert('Erro ao atualizar: ' + error.message);
    } else {
      const { error } = await supabase.from('construction_payments').insert(payload);
      if (error) alert('Erro ao inserir: ' + error.message);
    }
    
    setIsSubmitting(false);
    setIsModalOpen(false);
    fetchPagamentos();
  };

  return (
    <div className="p-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h2 className="text-2xl font-bold text-primary mb-6 text-center mt-2">Dívida com a Construtora</h2>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -z-0"></div>
        <p className="text-sm text-gray-500 font-bold uppercase tracking-wider relative z-10">Total Restante em Vínculo</p>
        <p className="text-3xl font-black text-primary mt-1 relative z-10">
          {isLoading ? '...' : `R$ ${totalRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        </p>
        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-center items-center gap-2 relative z-10">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Já Pago</p>
          <p className="text-sm font-black text-green-600">
            {isLoading ? '...' : `R$ ${totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </p>
        </div>
      </div>

      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
        
        {isLoading ? (
          <p className="text-center text-gray-500 font-bold mt-10">Processando parcelas...</p>
        ) : pagamentos.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">Nenhuma parcela cadastrada ainda.</p>
        ) : (
          pagamentos.map((pag) => {
            const isCritico = pag.payment_type === 'anual' || pag.payment_type === 'intermediaria';
            
            return (
              <div key={pag.id} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active ${pag.status === 'pago' ? 'opacity-70' : ''}`}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 ${
                  pag.status === 'pago' ? 'bg-green-500' : isCritico ? 'bg-red-500 animate-pulse' : 'bg-gray-300'
                }`}>
                  {pag.status === 'pago' && <span className="text-white text-xs font-bold">✓</span>}
                  {pag.status === 'pendente' && isCritico && <span className="text-white text-xs font-bold">!</span>}
                </div>
                
                <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border-2 shadow-sm transition-all ${
                  isCritico && pag.status === 'pendente' ? 'border-red-400 bg-red-50/30' : 'border-gray-100'
                }`}>
                  <div className="flex justify-between items-start mb-1">
                    <p className={`font-bold uppercase text-[10px] tracking-widest ${
                      isCritico && pag.status === 'pendente' ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      Parcela {pag.payment_type.replace('_', ' ')}
                    </p>
                    <p className="text-xs font-bold text-gray-400">{formatDate(pag.due_date)}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`font-black text-lg ${isCritico && pag.status === 'pendente' ? 'text-red-700' : 'text-primary'}`}>
                      R$ {Number(pag.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <button 
                      onClick={() => openEdit(pag)}
                      className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded font-bold uppercase"
                    >
                      Editar
                    </button>
                  </div>
                  {isCritico && pag.status === 'pendente' && (
                    <p className="text-xs text-red-600 font-medium mt-2 bg-red-100 rounded p-1 inline-block">
                      Atenção ao Fluxo de Caixa!
                    </p>
                  )}
                  
                  <label className={`flex items-center gap-2 mt-3 text-sm font-bold p-2 rounded-lg cursor-pointer transition-colors ${pag.status === 'pago' ? 'text-green-700 bg-green-50 hover:bg-green-100 hover:text-green-800' : 'text-gray-600 bg-gray-50 hover:bg-gray-100'}`}>
                    <input 
                      type="checkbox" 
                      checked={pag.status === 'pago'}
                      disabled={isUpdating}
                      onChange={() => handleToggleStatus(pag.id, pag.status)}
                      className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary/50 disabled:opacity-50" 
                    />
                    {pag.status === 'pago' ? 'Paga' : 'Marcar como paga'}
                  </label>
                </div>
              </div>
            )
          })
        )}

      </div>

      <button onClick={openNew} className="fixed bottom-24 right-5 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center text-3xl font-light hover:bg-blue-900 active:scale-90 transition-all z-40 pb-1">
        +
      </button>

      {/* Modal de transação da Obra */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl p-5 animate-in slide-in-from-bottom-full duration-300">
            <h3 className="text-xl font-bold mb-4">{editingId ? 'Editar Parcela' : 'Nova Parcela'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex gap-2 mb-2">
                <button type="button" onClick={() => setPStatus('pendente')} className={`flex-1 py-2 rounded-lg font-bold ${pStatus === 'pendente' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>Pendente</button>
                <button type="button" onClick={() => setPStatus('pago')} className={`flex-1 py-2 rounded-lg font-bold ${pStatus === 'pago' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>Pago</button>
              </div>
              
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Tipo de Parcela</label>
                <select value={paymentType} onChange={e => setPaymentType(e.target.value)} className="w-full p-2 border-b-2 border-gray-200 focus:border-primary outline-none bg-white">
                  <option value="sinal">Sinal</option>
                  <option value="entrada">Entrada</option>
                  <option value="assinatura">Assinatura</option>
                  <option value="mensal">Mensal</option>
                  <option value="anual">Anual</option>
                  <option value="intermediaria">Intermediária</option>
                  <option value="juros_obra">Juros de Obra</option>
                </select>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Valor (R$)</label>
                  <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-2 border-b-2 border-gray-200 focus:border-primary outline-none" placeholder="0,00" />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Vencimento</label>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full p-2 border-b-2 border-gray-200 focus:border-primary outline-none" />
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
