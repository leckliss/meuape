
export function Extrato() {
  return (
    <div className="p-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h2 className="text-2xl font-bold text-primary mb-6 text-center mt-2">Extrato do Mês</h2>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4 flex justify-between items-center relative overflow-hidden">
        <div className="absolute left-0 top-0 w-1 h-full bg-primary"></div>
        <div>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">Novembro / 2026</p>
          <p className="text-xs text-gray-400">Restante livre: <span className="text-primary font-bold">R$ 4.050,00</span></p>
        </div>
        <button className="bg-gray-100 text-primary p-2 rounded-xl text-sm font-bold active:scale-95 transition-all">
          Trocar Mês
        </button>
      </div>

      <div className="space-y-3">
        {/* Item de Despesa */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center active:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-lg">
              📉
            </div>
            <div>
              <p className="font-bold text-gray-800">Supermercado</p>
              <p className="text-[11px] text-gray-500 font-medium">10/11 • Débito • Erick</p>
            </div>
          </div>
          <p className="font-black text-red-600">- R$ 450,00</p>
        </div>

        {/* Item de Renda Extra */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center active:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-lg">
              📈
            </div>
            <div>
              <p className="font-bold text-gray-800">Venda no Enjoei</p>
              <p className="text-[11px] text-gray-500 font-medium">08/11 • Renda Extra • Noiva</p>
            </div>
          </div>
          <p className="font-black text-green-600">+ R$ 120,00</p>
        </div>
      </div>

      <button className="fixed bottom-24 right-5 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center text-3xl font-light hover:bg-blue-900 active:scale-90 transition-all z-40 pb-1">
        +
      </button>
    </div>
  );
}
