
export function Obra() {
  const pagamentos = [
    { id: 1, tipo: 'mensal', valor: 950.00, data: '15/11/2026', status: 'pago' },
    { id: 2, tipo: 'mensal', valor: 950.00, data: '15/12/2026', status: 'pendente' },
    { id: 3, tipo: 'anual', valor: 8500.00, data: '15/12/2026', status: 'pendente' }, // Destacar
  ];

  return (
    <div className="p-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h2 className="text-2xl font-bold text-primary mb-6 text-center mt-2">Dívida com a Construtora</h2>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -z-0"></div>
        <p className="text-sm text-gray-500 font-bold uppercase tracking-wider relative z-10">Total Restante em Vínculo</p>
        <p className="text-3xl font-black text-primary mt-1 relative z-10">R$ 145.200,00</p>
      </div>

      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
        
        {pagamentos.map((pag) => {
          const isCritico = pag.tipo === 'anual' || pag.tipo === 'intermediaria';
          
          return (
            <div key={pag.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 ${
                pag.status === 'pago' ? 'bg-green-500' : isCritico ? 'bg-red-500 animate-pulse' : 'bg-gray-300'
              }`}>
                {pag.status === 'pago' && <span className="text-white text-xs font-bold">✓</span>}
                {pag.status === 'pendente' && isCritico && <span className="text-white text-xs font-bold">!</span>}
              </div>
              
              <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border-2 shadow-sm transition-all ${
                isCritico ? 'border-red-400 bg-red-50/30' : 'border-gray-100'
              }`}>
                <div className="flex justify-between items-start mb-1">
                  <p className={`font-bold uppercase text-[10px] tracking-widest ${
                    isCritico ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    Parcela {pag.tipo}
                  </p>
                  <p className="text-xs font-bold text-gray-400">{pag.data}</p>
                </div>
                <p className={`font-black text-lg ${isCritico ? 'text-red-700' : 'text-primary'}`}>
                  R$ {pag.valor.toFixed(2).replace('.', ',')}
                </p>
                {isCritico && (
                  <p className="text-xs text-red-600 font-medium mt-2 bg-red-100 rounded p-1 inline-block">
                    Atenção ao Fluxo de Caixa!
                  </p>
                )}
                
                {pag.status === 'pendente' && (
                  <label className="flex items-center gap-2 mt-3 text-sm font-bold text-gray-600 bg-gray-50 p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary/50" />
                    Marcar como paga
                  </label>
                )}
              </div>
            </div>
          )
        })}

      </div>
    </div>
  );
}
