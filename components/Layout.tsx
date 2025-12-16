import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  CalendarClock, 
  Bot, 
  Target,
  Menu,
  X,
  Wallet
} from 'lucide-react';

interface Props {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  children: React.ReactNode;
}

const Layout: React.FC<Props> = ({ currentScreen, onNavigate, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'extract', label: 'Extrato', icon: FileText }, // Renomeado para Extrato
    { id: 'incomes', label: 'Receitas', icon: TrendingUp },
    { id: 'fixed', label: 'Despesas Fixas', icon: CalendarClock },
    { id: 'variable', label: 'Despesas Variáveis', icon: TrendingDown },
    { id: 'consultant', label: 'Consultor IA', icon: Bot, highlight: true },
    { id: 'goals', label: 'Metas', icon: Target },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white shadow-xl z-20">
        <div className="p-6 flex items-center gap-3 border-b border-slate-700">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Easy Coin</h1>
            <span className="text-xs text-slate-400 font-medium tracking-wider">SYSTEM</span>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                currentScreen === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${item.highlight && currentScreen !== item.id ? 'text-blue-400 group-hover:text-blue-300' : ''}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
            <p className="text-xs text-slate-400 mb-2">Plano Gratuito</p>
            <div className="w-full bg-slate-700 h-1.5 rounded-full mb-1">
              <div className="bg-green-500 h-1.5 rounded-full w-3/4"></div>
            </div>
            <p className="text-[10px] text-slate-500">Uso de IA: 75%</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-10">
            <div className="flex items-center gap-2">
                 <Wallet className="w-6 h-6 text-blue-600" />
                 <span className="font-bold text-gray-800">Easy Coin</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
            <div className="absolute top-16 left-0 w-full h-[calc(100%-4rem)] bg-slate-900 z-50 p-4 md:hidden overflow-y-auto">
                 {menuItems.map((item) => (
                    <button
                    key={item.id}
                    onClick={() => {
                        onNavigate(item.id);
                        setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl mb-2 ${
                        currentScreen === item.id 
                        ? 'bg-blue-600 text-white' 
                        : 'text-slate-400 hover:bg-slate-800'
                    }`}
                    >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    </button>
                ))}
            </div>
        )}

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 scroll-smooth">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;