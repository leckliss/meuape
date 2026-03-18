import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function Config() {
  const [partnerA] = useState('Erick');
  const [partnerB] = useState('Rapha');
  const [incomeA, setIncomeA] = useState('3500.00');
  const [incomeB, setIncomeB] = useState('3000.00');
  const [originalIncomeA, setOriginalIncomeA] = useState('3500.00');
  const [originalIncomeB, setOriginalIncomeB] = useState('3000.00');
  const [goal, setGoal] = useState('150000.00');

  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .single();
      
      if (data) {
        setIncomeA(data.income_a.toString());
        setOriginalIncomeA(data.income_a.toString());
        setIncomeB(data.income_b.toString());
        setOriginalIncomeB(data.income_b.toString());
        setGoal(data.property_goal.toString());
      }
      setIsLoading(false);
    }
    loadSettings();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Se a renda mudou, e ainda não mostramos o modal, mostra o modal
    if ((incomeA !== originalIncomeA || incomeB !== originalIncomeB) && e) {
      setShowConfirmModal(true);
      return;
    }
    
    await executeSave(false);
  };

  const executeSave = async (applyToPast: boolean) => {
    setIsLoading(true);
    setShowConfirmModal(false);

    // 1. Salvar configurações
    const { error } = await supabase
      .from('settings')
      .update({
        income_a: Number(incomeA),
        income_b: Number(incomeB),
        property_goal: Number(goal)
      })
      .eq('id', 1);

    // 2. Atualizar transactions de Salário, se houver
    if (incomeA !== originalIncomeA || incomeB !== originalIncomeB) {
      const now = new Date();
      const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      
      // Update Salário Erick
      let queryA = supabase.from('transactions').update({ amount: Number(incomeA) }).eq('category', 'Salário').eq('person', 'Erick');
      if (!applyToPast) queryA = queryA.gte('date', firstDay);
      await queryA;

      // Update Salário Rapha
      let queryB = supabase.from('transactions').update({ amount: Number(incomeB) }).eq('category', 'Salário').eq('person', 'Rapha');
      if (!applyToPast) queryB = queryB.gte('date', firstDay);
      await queryB;

      setOriginalIncomeA(incomeA);
      setOriginalIncomeB(incomeB);
    }

    if (error) {
      alert('Erro ao salvar as configurações: ' + error.message);
    } else {
      alert('Configurações atualizadas com sucesso!');
    }
    setIsLoading(false);
  };

  return (
    <div className="p-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h2 className="text-2xl font-bold text-primary mb-6 text-center mt-2">Ajustes</h2>
      
      <form onSubmit={handleSave} className="space-y-6">
        {/* Bloco de Rendas */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-primary mb-4 border-b pb-2">Rendas Base (Mensal)</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Renda do {partnerA}</label>
              <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all overflow-hidden">
                <span className="pl-3 text-gray-400 font-bold">R$</span>
                <input 
                  type="number" step="0.01" value={incomeA} onChange={e => setIncomeA(e.target.value)}
                  className="w-full p-3 font-semibold text-gray-800 bg-transparent outline-none"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Renda da {partnerB}</label>
              <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all overflow-hidden">
                <span className="pl-3 text-gray-400 font-bold">R$</span>
                <input 
                  type="number" step="0.01" value={incomeB} onChange={e => setIncomeB(e.target.value)}
                  className="w-full p-3 font-semibold text-gray-800 bg-transparent outline-none"
                />
              </div>
            </div>
          </div>
          
          <p className="text-xs text-amber-600 mt-3 font-medium bg-amber-50 p-2 rounded-lg">
            ⚠️ Alterar a renda exigirá confirmar se afeta o passado ou apenas o futuro.
          </p>
        </section>

        {/* Bloco de Meta do Apê */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-primary mb-4 border-b pb-2">Nosso Grande Sonho</h3>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Custo Total do Imóvel</label>
            <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all overflow-hidden">
              <span className="pl-3 text-gray-400 font-bold">R$</span>
              <input 
                type="number" step="0.01" value={goal} onChange={e => setGoal(e.target.value)}
                className="w-full p-3 font-semibold text-gray-800 bg-transparent outline-none"
              />
            </div>
          </div>
        </section>

        <button 
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-blue-900 active:scale-95 transition-all text-white py-4 rounded-xl font-black text-lg shadow-md mb-8 disabled:opacity-50"
        >
          {isLoading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </form>

      {/* Modal de Confirmação de Renda */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl p-6 animate-in slide-in-from-bottom-full duration-300 shadow-xl">
            <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6"></div>
            <h3 className="text-xl font-black text-primary mb-2">Atualizar Salário Base</h3>
            <p className="text-sm text-gray-500 mb-6">
              Você alterou o valor da renda base. Deseja que essa alteração reflita em todos os meses anteriores no extrato, ou apenas deste mês em diante?
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={() => executeSave(false)} 
                className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-md active:scale-95 transition-all"
              >
                Apenas deste mês em diante
              </button>
              <button 
                onClick={() => executeSave(true)} 
                className="w-full py-4 bg-gray-100 text-primary font-bold rounded-xl active:scale-95 transition-all"
              >
                Aplicar para todo o passado
              </button>
              <button 
                onClick={() => setShowConfirmModal(false)} 
                className="w-full py-3 text-gray-400 font-bold uppercase text-xs tracking-wider pt-2"
              >
                Cancelar Edição
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
