import React, { useState } from 'react';
import { Transaction, TransactionType, Category } from '../types';
import { Plus, Upload, Calendar, Tag, DollarSign, ListPlus, Check, X, Grid } from 'lucide-react';
import * as Icons from 'lucide-react';

interface Props {
  type: TransactionType;
  transactions: Transaction[];
  onAdd: (t: Omit<Transaction, 'id'>) => void;
  categories: Category[];
  onAddCategory: (name: string, icon: string, type: 'income' | 'expense') => void;
  title: string;
  description: string;
}

const AVAILABLE_ICONS = [
    'Tag', 'Home', 'Utensils', 'Car', 'ShoppingBag', 'Receipt', 
    'HeartPulse', 'GraduationCap', 'Briefcase', 'TrendingUp', 
    'Ticket', 'Smartphone', 'PawPrint', 'Plane', 'Dumbbell', 
    'Wrench', 'Gift', 'Music', 'Coffee', 'Banknote', 'Coins'
];

const TransactionScreen: React.FC<Props> = ({ type, transactions, onAdd, categories, onAddCategory, title, description }) => {
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [installments, setInstallments] = useState('1');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Tag');

  // Filter only relevant transactions for display
  const relevantTransactions = transactions.filter(t => t.type === type);
  
  // Filter relevant categories
  const isIncome = type === 'income';
  const displayCategories = categories.filter(c => c.type === 'both' || (isIncome ? c.type === 'income' : c.type === 'expense'));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) {
        alert("Selecione uma categoria");
        return;
    }

    const numInstallments = parseInt(installments);
    
    if (type === 'expense_variable' && numInstallments > 1) {
      // Logic for installments
      const baseAmount = parseFloat(amount) / numInstallments;
      for (let i = 0; i < numInstallments; i++) {
        const d = new Date(date);
        d.setMonth(d.getMonth() + i);
        onAdd({
          date: d.toISOString().split('T')[0],
          description: `${desc} (${i + 1}/${numInstallments})`,
          amount: baseAmount,
          type,
          category,
          installment: { current: i + 1, total: numInstallments }
        });
      }
    } else {
      onAdd({
        date,
        description: desc,
        amount: parseFloat(amount),
        type,
        category,
        isRecurring: type === 'expense_fixed' ? true : isRecurring
      });
    }

    // Reset
    setAmount('');
    setDesc('');
    setCategory('');
    setInstallments('1');
  };

  const handleCreateCategory = () => {
      if(newCatName) {
          onAddCategory(newCatName, newCatIcon, isIncome ? 'income' : 'expense');
          setCategory(newCatName);
          setNewCatName('');
          setNewCatIcon('Tag');
          setIsAddingCategory(false);
      }
  };

  const renderIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName] || Icons.Tag;
    return <Icon className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            <p className="text-gray-500">{description}</p>
        </div>
        <button 
          className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition"
        >
          <Upload className="w-4 h-4" /> Importar (PDF/CSV)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Card */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-4">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Novo Lançamento
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Valor</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2.5 text-gray-400">R$</span>
                  <input 
                    type="number" step="0.01" required 
                    value={amount} onChange={e => setAmount(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="0.00" 
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Descrição</label>
                <input 
                  type="text" required 
                  value={desc} onChange={e => setDesc(e.target.value)}
                  className="w-full mt-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="Ex: Salário, Aluguel..." 
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Categoria</label>
                    <button type="button" onClick={() => setIsAddingCategory(!isAddingCategory)} className="text-xs text-blue-600 hover:underline">
                        {isAddingCategory ? 'Cancelar' : '+ Nova Categoria'}
                    </button>
                </div>
                
                {isAddingCategory ? (
                    <div className="space-y-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-500"
                            placeholder="Nome da categoria"
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                        />
                        <div className="grid grid-cols-7 gap-1">
                             {AVAILABLE_ICONS.map(icon => (
                                 <button 
                                    key={icon}
                                    type="button"
                                    onClick={() => setNewCatIcon(icon)}
                                    className={`p-1.5 rounded hover:bg-white flex justify-center items-center transition ${newCatIcon === icon ? 'bg-white shadow text-blue-600 ring-1 ring-blue-500' : 'text-gray-400'}`}
                                 >
                                     {renderIcon(icon)}
                                 </button>
                             ))}
                        </div>
                        <button type="button" onClick={handleCreateCategory} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg flex justify-center items-center gap-2 text-sm font-medium">
                            <Check className="w-4 h-4" /> Criar Categoria
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-2 mt-1">
                        {displayCategories.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setCategory(cat.name)}
                                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs transition ${
                                    category === cat.name 
                                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' 
                                    : 'border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100'
                                }`}
                            >
                                {renderIcon(cat.icon)}
                                <span className="mt-1 truncate w-full text-center">{cat.name}</span>
                            </button>
                        ))}
                    </div>
                )}
              </div>

              <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Data</label>
                  <input 
                    type="date" required 
                    value={date} onChange={e => setDate(e.target.value)}
                    className="w-full mt-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
              </div>

              {type === 'expense_variable' && (
                 <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Parcelas</label>
                    <select 
                      value={installments} 
                      onChange={e => setInstallments(e.target.value)}
                      className="w-full mt-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 outline-none"
                    >
                        <option value="1">À vista</option>
                        <option value="2">2x</option>
                        <option value="3">3x</option>
                        <option value="6">6x</option>
                        <option value="12">12x</option>
                    </select>
                 </div>
              )}

              {type !== 'income' && type !== 'expense_variable' && (
                <div className="flex items-center gap-2 mt-2">
                  <input 
                    type="checkbox" 
                    id="rec" 
                    checked={isRecurring || type === 'expense_fixed'} 
                    disabled={type === 'expense_fixed'} // Always true for fixed
                    onChange={e => setIsRecurring(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded" 
                  />
                  <label htmlFor="rec" className="text-sm text-gray-600">Despesa Mensal Recorrente</label>
                </div>
              )}

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition shadow-md">
                Adicionar
              </button>
            </div>
          </form>
        </div>

        {/* List Card */}
        <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <span className="font-medium text-gray-600">Últimos Lançamentos</span>
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600">{relevantTransactions.length} itens</span>
                </div>
                {relevantTransactions.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                        <ListPlus className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p>Nenhuma transação cadastrada.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3">Data</th>
                                    <th className="px-6 py-3">Descrição</th>
                                    <th className="px-6 py-3">Categoria</th>
                                    <th className="px-6 py-3 text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {relevantTransactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((t) => (
                                    <tr key={t.id} className="bg-white border-b hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 font-medium text-gray-900">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                                        <td className="px-6 py-4">
                                            {t.description}
                                            {t.installment && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">{t.installment.current}/{t.installment.total}</span>}
                                            {t.isRecurring && <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">Fixo</span>}
                                        </td>
                                        <td className="px-6 py-4"><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{t.category}</span></td>
                                        <td className={`px-6 py-4 text-right font-bold ${type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                            {type !== 'income' && '- '}R$ {t.amount.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionScreen;