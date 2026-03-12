
export function Dashboard() {
  const progress = 35; // Mock de progresso do apê

  return (
    <div className="p-5 space-y-6">
      <header className="flex flex-col items-center pt-4 pb-2">
        <h1 className="text-2xl font-bold text-primary">Nosso Apê</h1>
        <p className="text-sm text-gray-500 font-medium">Balanço Atual: Novembro</p>
      </header>

      {/* Meta e Progresso */}
      <section className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between text-sm mb-2 font-bold text-primary">
          <span>Conquista das Chaves</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
          <div className="bg-primary h-4 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="text-xs text-center text-gray-500 mt-3 font-medium">Cada centavo conta para o nosso sonho!</p>
      </section>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-l-4 border-l-green-500 shadow-sm relative overflow-hidden">
          <p className="text-[11px] text-gray-500 uppercase tracking-widest font-bold">Renda Total</p>
          <p className="text-xl font-black text-gray-800 mt-1">R$ 6.500,00</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-l-4 border-l-red-500 shadow-sm relative overflow-hidden">
          <p className="text-[11px] text-gray-500 uppercase tracking-widest font-bold">Gastos Reais</p>
          <p className="text-xl font-black text-red-600 mt-1">R$ 2.450,00</p>
        </div>
      </div>

      {/* Saldo Livre */}
      <div className="bg-primary p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <p className="text-sm opacity-90 font-medium mb-1">Nosso Saldo Livre Neste Mês</p>
        <p className="text-4xl font-black">R$ 4.050,00</p>
        <p className="text-xs mt-3 opacity-75">Deduzidos os gastos imediatos e faturas já lançadas.</p>
      </div>
    </div>
  );
}
