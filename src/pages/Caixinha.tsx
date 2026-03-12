import React, { useState } from 'react';

export function Caixinha() {
  const [modalType, setModalType] = useState<'deposito' | 'saque' | null>(null);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const submitTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!amount || Number(amount) <= 0) {
      setError('Por favor, digite um valor válido.');
      return;
    }

    // REGRA DE OURO: Saque Blindado (Atrito Positivo)
    if (modalType === 'saque' && reason.trim().length <= 5) {
      setError('Atenção: Você precisa preencher um motivo real e detalhado para essa retirada.');
      return;
    }

    alert(`${modalType === 'saque' ? 'Saque' : 'Depósito'} de R$ ${amount} registrado!`);
    setModalType(null);
    setAmount('');
    setReason('');
  };

  return (
    <div className="p-5 animate-in fade-in zoom-in-95 duration-300">
      <h2 className="text-2xl font-bold text-primary mb-6 text-center mt-2">Nossa Caixinha</h2>
      
      {/* Saldo Preservado */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center mb-8 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-30"></div>
        <span className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Guardado para o Apê</span>
        <h3 className="text-5xl font-black text-primary mt-3">R$ 15.000</h3>
        <span className="text-xs bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full mt-4">
          Estamos indo muito bem!
        </span>
      </div>

      {/* Botões de Ação */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => { setModalType('deposito'); setError(''); }}
          className="bg-primary hover:bg-blue-900 active:scale-95 transition-all text-white py-4 rounded-2xl font-bold text-lg shadow-md"
        >
          Guardar (+)
        </button>
        <button 
          onClick={() => { setModalType('saque'); setError(''); }}
          className="bg-white hover:bg-red-50 active:scale-95 transition-all border-2 border-red-500 text-red-600 py-4 rounded-2xl font-bold text-lg shadow-sm"
        >
          Retirar (-)
        </button>
      </div>

      {/* Modal Embutido com Atrito Positivo */}
      {modalType && (
        <div className={`mt-8 p-5 rounded-2xl shadow-inner border-2 animate-in slide-in-from-bottom-4 duration-300 ${
            modalType === 'deposito' ? 'bg-blue-50/50 border-blue-200' : 'bg-red-50/50 border-red-200'
        }`}>
          <h4 className={`font-black text-xl mb-4 ${modalType === 'deposito' ? 'text-primary' : 'text-red-700'}`}>
            {modalType === 'deposito' ? 'Investir no nosso sonho' : 'Confirmar Retirada Crítica'}
          </h4>
          
          <form onSubmit={submitTransaction} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Valor (R$)</label>
              <input 
                type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)}
                className="w-full p-3 font-semibold text-xl text-center border-2 border-white rounded-xl shadow-sm focus:border-primary outline-none transition-colors"
                placeholder="0.00"
              />
            </div>

            {/* O MOTIVO SÓ APARECE NO SAQUE */}
            {modalType === 'saque' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-black text-red-600 mb-1">
                  MOTIVO DA RETIRADA (Obrigatório)
                </label>
                <textarea 
                  value={reason} onChange={e => setReason(e.target.value)}
                  className="w-full p-3 font-medium text-red-900 border-2 border-red-300 bg-white rounded-xl shadow-sm focus:border-red-600 outline-none transition-colors"
                  placeholder="Seja sincero com a nossa meta. Por que tirar esse dinheiro?"
                  rows={3}
                />
                {error && <p className="text-sm text-red-600 font-bold mt-2 bg-red-100/50 p-2 rounded-lg border border-red-200">{error}</p>}
              </div>
            )}
            
            <button 
              type="submit" 
              className={`w-full py-4 rounded-xl font-black text-white text-lg mt-2 tracking-wide shadow-md active:scale-[0.98] transition-all ${
                modalType === 'deposito' ? 'bg-primary hover:bg-blue-900' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {modalType === 'deposito' ? 'Confirmar Depósito' : 'Sim, preciso retirar o dinheiro'}
            </button>
            
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="w-full py-3 mt-2 text-gray-500 font-bold uppercase text-sm tracking-wider"
            >
              Cancelar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
