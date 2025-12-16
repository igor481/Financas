import React, { useEffect, useState } from 'react';
import { Transaction, Goal, Category, TransactionType } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowUpCircle, ArrowDownCircle, Wallet, Sparkles, Plus, Check, ChevronDown } from 'lucide-react';
import { getDashboardInsight } from '../services/geminiService';
import * as Icons from 'lucide-react';

interface Props {
  transactions: Transaction[];
  goals: Goal[];
  categories: Category[];
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
}

const Dashboard: React.FC<Props> = ({ transactions, goals, categories, onAddTransaction }) => {
  const [insight, setInsight] = useState<string>("Analisando movimentações...");
  const [quickAmount, setQuickAmount] = useState('');
  const [quickDesc, setQuickDesc] = useState('');
  const [quickType, setQuickType] = useState<TransactionType>('expense_variable');
  const [quickCategory, setQuickCategory] = useState('');

  // Calculations
  const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expenses = transactions.filter(t => t.type !== 'income').reduce((acc, t) => acc + t.amount, 0);
  const balance = income - expenses;

  // Chart Data
  const expensesByCategory = transactions
    .filter(t => t.type !== 'income')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.keys(expensesByCategory).map(k => ({ name: k, value: expensesByCategory[k] }));
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const filteredCategories = categories.filter(c => 
    c.type === 'both' || (quickType === 'income' ? c.type === 'income' : c.type === 'expense')
  );

  useEffect(() => {
    if (transactions.length > 0) {
      getDashboardInsight(transactions).then(setInsight);
    }
  }, [transactions.length]);

  const handleQuickAdd = (e: React.FormEvent) => {
      e.preventDefault();
      if(!quickAmount || !quickDesc || !quickCategory) return;

      onAddTransaction({
          amount: parseFloat(quickAmount),
          description: quickDesc,
          type: quickType,
          category: quickCategory,
          date: new Date().toISOString().split('T')[0],
          isRecurring: quickType === 'expense_fixed'
      });

      setQuickAmount('');
      setQuickDesc('');
      setQuickCategory('');
      alert("Transação adicionada!");
  };

  const renderFormattedInsight = (text: string) => {
    // Regex to capture currency amounts (e.g. R$ 1.200,50 or R$1200)
    const parts = text.split(/(R\$\s?[\d.,]+)/g);
    
    return (
      <span className="text-slate-300 font-normal leading-relaxed text-sm md:text-base">
        {parts.map((part, i) => {
          if (part.match(/R\$\s?[\d.,]+/)) {
             // Extract value to style R$ separately if needed, or keep together
             // User wants "R$ slightly larger than texts" and numbers "similar to Saldo Disponível" (Big/Bold)
             const cleanValue = part.replace(/R\$\s?/, '');
             return (
               <span key={i} className="inline-flex items-baseline mx-1">
                 <span className="text-blue-200 font-semibold text-base mr-0.5">R$</span>
                 <span className="text-white font-bold text-xl md:text-2xl">{cleanValue}</span>
               </span>
             );
          }
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Welcome & AI Insight */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="max-w-3xl flex-1">
             <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                Diagnóstico AI
             </h2>
             <div className="flex items-start gap-4 bg-slate-800/40 p-5 rounded-xl border border-white/5 backdrop-blur-sm shadow-inner">
                <div className="p-2 bg-yellow-500/10 rounded-lg shrink-0 mt-0.5 border border-yellow-500/20">
                   <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                </div>
                <div>
                    {renderFormattedInsight(insight)}
                </div>
             </div>
          </div>
          
          <div className="text-right shrink-0 min-w-[180px]">
             <p className="text-sm text-slate-400 font-medium mb-1 uppercase tracking-wide">Saldo Disponível</p>
             <div className="flex items-baseline justify-end gap-1">
                <span className="text-xl font-medium text-slate-400">R$</span>
                <span className="text-5xl font-bold text-white tracking-tight">{balance.toFixed(2)}</span>
             </div>
          </div>
        </div>
        
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 opacity-[0.03] pointer-events-none">
            <Wallet className="w-96 h-96 -mr-20 -mt-20" />
        </div>
      </div>

       {/* Quick Add Transaction */}
       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
               <Plus className="w-4 h-4 bg-blue-100 text-blue-600 rounded-full p-0.5" />
               Lançamento Rápido
           </h3>
           <form onSubmit={handleQuickAdd} className="flex flex-col md:flex-row gap-4 items-end">
               <div className="w-full md:w-auto md:flex-1 min-w-[200px]">
                   <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Tipo</label>
                   <div className="flex bg-gray-100 rounded-lg p-1 mt-1 h-[42px]">
                       <button
                         type="button"
                         onClick={() => setQuickType('income')}
                         className={`flex-1 px-4 text-sm font-medium rounded-md transition-all duration-200 ${quickType === 'income' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500 hover:bg-gray-200/50'}`}
                       >Receita</button>
                       <button
                         type="button"
                         onClick={() => setQuickType('expense_variable')}
                         className={`flex-1 px-4 text-sm font-medium rounded-md transition-all duration-200 ${quickType.includes('expense') ? 'bg-white shadow-sm text-red-600' : 'text-gray-500 hover:bg-gray-200/50'}`}
                       >Despesa</button>
                   </div>
               </div>
               
               <div className="w-full md:w-auto md:flex-1 min-w-[150px]">
                   <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Valor</label>
                   <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none">R$</span>
                        <input 
                            type="number" step="0.01" 
                            value={quickAmount} onChange={e => setQuickAmount(e.target.value)}
                            placeholder="0,00"
                            className="w-full pl-9 pr-4 h-[42px] bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium"
                            required
                        />
                   </div>
               </div>

               <div className="w-full md:flex-[2] min-w-[200px]">
                   <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Descrição</label>
                   <input 
                      type="text"
                      value={quickDesc} onChange={e => setQuickDesc(e.target.value)}
                      placeholder="Ex: Café na padaria"
                      className="w-full mt-1 px-4 h-[42px] bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      required
                   />
               </div>

               <div className="w-full md:flex-[1.5] min-w-[180px]">
                   <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Categoria</label>
                   <div className="relative mt-1">
                       <select 
                          value={quickCategory} onChange={e => setQuickCategory(e.target.value)}
                          className="w-full px-4 h-[42px] bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none transition-all cursor-pointer bg-white"
                          required
                       >
                           <option value="">Selecione...</option>
                           {filteredCategories.map(c => (
                               <option key={c.id} value={c.name}>{c.name}</option>
                           ))}
                       </select>
                       <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                           <ChevronDown className="w-4 h-4" />
                       </div>
                   </div>
               </div>

               <button 
                type="submit" 
                className="h-[42px] w-[42px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center shadow-md shadow-blue-200 shrink-0 mt-auto"
               >
                   <Check className="w-5 h-5" />
               </button>
           </form>
       </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
           <div>
              <p className="text-sm text-gray-500 font-medium">Receitas do Mês</p>
              <p className="text-2xl font-bold text-green-600 mt-1">+ R$ {income.toFixed(2)}</p>
           </div>
           <div className="bg-green-100 p-3 rounded-full">
              <ArrowUpCircle className="w-8 h-8 text-green-600" />
           </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
           <div>
              <p className="text-sm text-gray-500 font-medium">Saídas do Mês</p>
              <p className="text-2xl font-bold text-red-600 mt-1">- R$ {expenses.toFixed(2)}</p>
           </div>
           <div className="bg-red-100 p-3 rounded-full">
              <ArrowDownCircle className="w-8 h-8 text-red-600" />
           </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4">Gastos por Categoria</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => `R$ ${val.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {pieData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-1 text-xs text-gray-600">
                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                        {entry.name}
                    </div>
                ))}
            </div>
         </div>

         <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4">Próximas Metas</h3>
            <div className="space-y-4">
               {goals.map(g => (
                   <div key={g.id}>
                       <div className="flex justify-between text-sm mb-1">
                           <span className="font-medium">{g.name}</span>
                           <span className="text-gray-500">{((g.currentAmount/g.targetAmount)*100).toFixed(0)}%</span>
                       </div>
                       <div className="w-full bg-gray-100 rounded-full h-3">
                           <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${Math.min((g.currentAmount/g.targetAmount)*100, 100)}%` }}></div>
                       </div>
                       <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>Atual: R$ {g.currentAmount}</span>
                            <span>Alvo: R$ {g.targetAmount}</span>
                       </div>
                   </div>
               ))}
               {goals.length === 0 && <p className="text-sm text-gray-400 italic">Nenhuma meta cadastrada.</p>}
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;