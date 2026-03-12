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

  const handlePay = async (id: string) => {
    setIsUpdating(true);
    const { error } = await supabase
      .from('construction_payments')
      .update({ status: 'pago' })
      .eq('id', id);
    
    if (error) {
      alert('Erro ao marcar como pago: ' + error.message);
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

  return (
    <div className="p-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h2 className="text-2xl font-bold text-primary mb-6 text-center mt-2">Dívida com a Construtora</h2>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -z-0"></div>
        <p className="text-sm text-gray-500 font-bold uppercase tracking-wider relative z-10">Total Restante em Vínculo</p>
        <p className="text-3xl font-black text-primary mt-1 relative z-10">
          {isLoading ? '...' : `R$ ${totalRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        </p>
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
                  <p className={`font-black text-lg ${isCritico && pag.status === 'pendente' ? 'text-red-700' : 'text-primary'}`}>
                    R$ {Number(pag.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  {isCritico && pag.status === 'pendente' && (
                    <p className="text-xs text-red-600 font-medium mt-2 bg-red-100 rounded p-1 inline-block">
                      Atenção ao Fluxo de Caixa!
                    </p>
                  )}
                  
                  {pag.status === 'pendente' && (
                    <label className="flex items-center gap-2 mt-3 text-sm font-bold text-gray-600 bg-gray-50 p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      <input 
                        type="checkbox" 
                        disabled={isUpdating}
                        onChange={(e) => {
                          if (e.target.checked) handlePay(pag.id);
                        }}
                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary/50 disabled:opacity-50" 
                      />
                      Marcar como paga
                    </label>
                  )}
                </div>
              </div>
            )
          })
        )}

      </div>
    </div>
  );
}
