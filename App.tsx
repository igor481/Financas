import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TransactionScreen from './components/TransactionScreen';
import { Transaction, Goal, Category, TransactionType } from './types';
import { Search, Filter, AlertTriangle, TrendingUp, TrendingDown, Target, Bot, Pencil, X, Check } from 'lucide-react';
// import { getFullConsultancy } from './services/geminiService';

// Mock Initial Data
const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2023-10-01', description: 'Salário Mensal', amount: 5500, type: 'income', category: 'Salário' },
  { id: '2', date: '2023-10-05', description: 'Aluguel', amount: 1800, type: 'expense_fixed', category: 'Moradia', isRecurring: true },
  { id: '3', date: '2023-10-07', description: 'Supermercado Semanal', amount: 450, type: 'expense_variable', category: 'Alimentação' },
  { id: '4', date: '2023-10-10', description: 'Internet Fibra', amount: 120, type: 'expense_fixed', category: 'Contas', isRecurring: true },
  { id: '5', date: '2023-10-12', description: 'Jantar Fora', amount: 180, type: 'expense_variable', category: 'Lazer' },
];

const INITIAL_GOALS: Goal[] = [
  { id: '1', name: 'Reserva de Emergência', targetAmount: 15000, currentAmount: 3500, deadline: '2024-12-31', category: 'Segurança' }
];

const INITIAL_CATEGORIES: Category[] = [
    { id: '1', name: 'Salário', icon: 'Wallet', type: 'income' },
    { id: '2', name: 'Investimentos', icon: 'TrendingUp', type: 'income' },
    { id: '3', name: 'Freelance/Extra', icon: 'Briefcase', type: 'income' },
    { id: '4', name: 'Moradia', icon: 'Home', type: 'expense' },
    { id: '5', name: 'Alimentação', icon: 'Utensils', type: 'expense' },
    { id: '6', name: 'Transporte', icon: 'Car', type: 'expense' },
    { id: '7', name: 'Lazer', icon: 'PartyPopper', type: 'expense' },
    { id: '8', name: 'Saúde', icon: 'Heart', type: 'expense' },
    { id: '9', name: 'Educação', icon: 'BookOpen', type: 'expense' },
    { id: '10', name: 'Compras', icon: 'ShoppingBag', type: 'expense' },
    { id: '11', name: 'Contas', icon: 'Zap', type: 'expense' },
];

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newT = { ...t, id: Math.random().toString(36).substr(2, 9) };
    setTransactions(prev => [...prev, newT]);
  };

  const updateTransaction = (updatedT: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedT.id ? updatedT : t));
  };

  const addCategory = (name: string, icon: string, type: 'income' | 'expense') => {
      const newCat: Category = {
          id: Math.random().toString(),
          name,
          icon,
          type
      };
      setCategories([...categories, newCat]);
  };

  const renderScreen = () => {
    switch(currentScreen) {
      case 'dashboard':
        return <Dashboard 
            transactions={transactions} 
            goals={goals} 
            categories={categories}
            onAddTransaction={addTransaction}
        />;
      case 'extract':
        return <ExtractView 
          transactions={transactions} 
          categories={categories}
          onUpdateTransaction={updateTransaction}
        />;
      case 'incomes':
        return <TransactionScreen 
          type="income" 
          transactions={transactions} 
          onAdd={addTransaction} 
          categories={categories}
          onAddCategory={addCategory}
          title="Receitas" 
          description="Gerencie suas fontes de renda." 
        />;
      case 'fixed':
        return <TransactionScreen 
          type="expense_fixed" 
          transactions={transactions} 
          onAdd={addTransaction} 
          categories={categories}
          onAddCategory={addCategory}
          title="Despesas Fixas" 
          description="Gastos recorrentes como aluguel e assinaturas." 
        />;
      case 'variable':
        return <TransactionScreen 
          type="expense_variable" 
          transactions={transactions} 
          onAdd={addTransaction} 
          categories={categories}
          onAddCategory={addCategory}
          title="Despesas Variáveis" 
          description="Gastos do dia a dia e compras parceladas." 
        />;
      case 'consultant':
        return <AIConsultant transactions={transactions} goals={goals} />;
      case 'goals':
        return <GoalsView goals={goals} setGoals={setGoals} />;
      default:
        return <Dashboard 
            transactions={transactions} 
            goals={goals} 
            categories={categories}
            onAddTransaction={addTransaction}
        />;
    }
  };

  return (
    <Layout currentScreen={currentScreen} onNavigate={setCurrentScreen}>
      {renderScreen()}
    </Layout>
  );
};

// -- Sub-Views Implementation --

interface ExtractViewProps {
  transactions: Transaction[];
  categories: Category[];
  onUpdateTransaction: (t: Transaction) => void;
}

const ExtractView: React.FC<ExtractViewProps> = ({ transactions, categories, onUpdateTransaction }) => {
  const [filter, setFilter] = useState('all');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  const filtered = transactions.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'income') return t.type === 'income';
    return t.type.includes('expense');
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTransaction) {
      onUpdateTransaction(editingTransaction);
      setEditingTransaction(null);
    }
  };

  return (
    <div className="space-y-6 relative">
      <h2 className="text-2xl font-bold text-gray-800">Extrato</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>Todos</button>
          <button onClick={() => setFilter('income')} className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === 'income' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700'}`}>Receitas</button>
          <button onClick={() => setFilter('expense')} className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === 'expense' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700'}`}>Saídas</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3">Descrição</th>
                <th className="px-6 py-3">Categoria</th>
                <th className="px-6 py-3">Tipo</th>
                <th className="px-6 py-3 text-right">Valor</th>
                <th className="px-6 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{new Date(t.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{t.description}</td>
                  <td className="px-6 py-4"><span className="bg-gray-100 px-2 py-1 rounded text-xs">{t.category}</span></td>
                  <td className="px-6 py-4">
                    {t.type === 'income' ? 
                      <span className="flex items-center gap-1 text-green-600"><TrendingUp className="w-4 h-4" /> Receita</span> : 
                      <span className="flex items-center gap-1 text-red-600"><TrendingDown className="w-4 h-4" /> Despesa</span>
                    }
                  </td>
                  <td className={`px-6 py-4 text-right font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => setEditingTransaction(t)}
                      className="text-gray-400 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingTransaction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Editar Transação</h3>
              <button 
                onClick={() => setEditingTransaction(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditSave} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Descrição</label>
                <input 
                  type="text" 
                  value={editingTransaction.description}
                  onChange={e => setEditingTransaction({...editingTransaction, description: e.target.value})}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                  required
                />
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Valor (R$)</label>
                  <input 
                    type="number" step="0.01"
                    value={editingTransaction.amount}
                    onChange={e => setEditingTransaction({...editingTransaction, amount: parseFloat(e.target.value)})}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Data</label>
                  <input 
                    type="date"
                    value={editingTransaction.date}
                    onChange={e => setEditingTransaction({...editingTransaction, date: e.target.value})}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Categoria</label>
                <select 
                  value={editingTransaction.category}
                  onChange={e => setEditingTransaction({...editingTransaction, category: e.target.value})}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900"
                >
                  {categories.filter(c => 
                    c.type === 'both' || 
                    (editingTransaction.type === 'income' ? c.type === 'income' : c.type === 'expense')
                  ).map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                 <label className="text-xs font-semibold text-gray-500 uppercase">Tipo</label>
                 <div className="flex gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setEditingTransaction({...editingTransaction, type: 'income'})}
                      className={`flex-1 py-2 text-sm rounded-lg border ${editingTransaction.type === 'income' ? 'bg-green-50 border-green-500 text-green-700 font-bold' : 'border-gray-200 text-gray-500'}`}
                    >Receita</button>
                    <button
                      type="button"
                      onClick={() => setEditingTransaction({...editingTransaction, type: 'expense_variable'})}
                      className={`flex-1 py-2 text-sm rounded-lg border ${editingTransaction.type !== 'income' ? 'bg-red-50 border-red-500 text-red-700 font-bold' : 'border-gray-200 text-gray-500'}`}
                    >Despesa</button>
                 </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition mt-4 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" /> Salvar Alterações
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const GoalsView: React.FC<{goals: Goal[], setGoals: Function}> = ({ goals, setGoals }) => {
    const [newGoal, setNewGoal] = useState({ name: '', target: '', current: '', deadline: '', category: '' });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        setGoals([...goals, {
            id: Math.random().toString(),
            name: newGoal.name,
            targetAmount: parseFloat(newGoal.target),
            currentAmount: parseFloat(newGoal.current),
            deadline: newGoal.deadline,
            category: newGoal.category
        }]);
        setNewGoal({ name: '', target: '', current: '', deadline: '', category: '' });
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Metas Financeiras</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {goals.map(g => {
                    const progress = Math.min((g.currentAmount / g.targetAmount) * 100, 100);
                    return (
                        <div key={g.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg">{g.name}</h3>
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{g.category}</span>
                                </div>
                                <Target className="text-blue-500" />
                            </div>
                            <div className="mb-2 flex justify-between text-sm">
                                <span className="text-gray-600">Atual: R$ {g.currentAmount}</span>
                                <span className="font-bold">Meta: R$ {g.targetAmount}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                            </div>
                            <p className="text-xs text-gray-400 text-right">Prazo: {new Date(g.deadline).toLocaleDateString()}</p>
                        </div>
                    );
                })}
                
                <form onSubmit={handleAdd} className="bg-blue-50 p-6 rounded-xl border border-blue-100 border-dashed flex flex-col justify-center">
                    <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2">Nova Meta</h3>
                    <input className="mb-2 p-2 rounded border border-blue-200 text-sm text-gray-900" placeholder="Nome da Meta" required value={newGoal.name} onChange={e => setNewGoal({...newGoal, name: e.target.value})} />
                    <input className="mb-2 p-2 rounded border border-blue-200 text-sm text-gray-900" placeholder="Valor Alvo (R$)" type="number" required value={newGoal.target} onChange={e => setNewGoal({...newGoal, target: e.target.value})} />
                    <input className="mb-2 p-2 rounded border border-blue-200 text-sm text-gray-900" placeholder="Valor Inicial (R$)" type="number" required value={newGoal.current} onChange={e => setNewGoal({...newGoal, current: e.target.value})} />
                    <input className="mb-2 p-2 rounded border border-blue-200 text-sm text-gray-900" type="date" required value={newGoal.deadline} onChange={e => setNewGoal({...newGoal, deadline: e.target.value})} />
                    <button type="submit" className="bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition">Criar Meta</button>
                </form>
            </div>
        </div>
    );
};

const AIConsultant: React.FC<{transactions: Transaction[], goals: Goal[]}> = ({ transactions, goals }) => {
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
  setLoading(true);
  setTimeout(() => {
    setReport({
      status: "Saudável",
      healthScore: 82,
      analysis: "Simulação local funcionando.",
      cutSuggestions: ["Reduzir gastos com lazer"],
      investmentTips: ["Renda fixa", "Tesouro Selic"]
    });
    setLoading(false);
  }, 1000);
};


    if (!report && !loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                    <Bot className="w-10 h-10 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Consultor Financeiro AI</h2>
                <p className="text-gray-500 max-w-md mb-8">
                    Vou analisar todo o seu histórico, encontrar padrões de gastos, gargalos e sugerir investimentos baseados no cenário econômico atual.
                </p>
                <button onClick={handleAnalyze} className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
                    Gerar Relatório Completo
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-500 animate-pulse">Analisando dados financeiros...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-4 mb-4">
                 <button onClick={() => setReport(null)} className="text-sm text-gray-500 hover:text-gray-800">&larr; Voltar</button>
                 <h2 className="text-2xl font-bold text-gray-800">Relatório do Consultor</h2>
            </div>

            <div className={`p-6 rounded-xl border-l-8 ${report.status === 'Saudável' ? 'border-green-500 bg-green-50' : 'border-yellow-500 bg-yellow-50'}`}>
                <h3 className="text-xl font-bold mb-2">Saúde Financeira: {report.status} ({report.healthScore}/100)</h3>
                <p className="text-gray-800 leading-relaxed">{report.analysis}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h4 className="font-bold text-red-600 flex items-center gap-2 mb-4"><TrendingDown className="w-5 h-5" /> Onde Cortar</h4>
                    <ul className="space-y-2">
                        {report.cutSuggestions.map((s: string, i: number) => (
                            <li key={i} className="flex gap-2 text-sm text-gray-700">
                                <span className="text-red-400">•</span> {s}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h4 className="font-bold text-green-600 flex items-center gap-2 mb-4"><TrendingUp className="w-5 h-5" /> Onde Investir</h4>
                    <ul className="space-y-2">
                        {report.investmentTips.map((s: string, i: number) => (
                            <li key={i} className="flex gap-2 text-sm text-gray-700">
                                <span className="text-green-400">•</span> {s}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default App;