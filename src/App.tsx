import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth } from './firebase';
import { AuthModal } from './components/AuthModal';

import { 
  ChevronRight, 
  ChevronLeft, 
  ArrowUpRight, 
  Trash2, 
  X, 
  Plus, 
  Eye, 
  EyeOff, 
  ShoppingBag, 
  RotateCcw, 
  CheckCircle2, 
  Circle, 
  LogOut, 
  Sun, 
  Moon 
} from 'lucide-react';

interface Expense {
  id: string;
  groupId?: string;
  description: string;
  amount: number;
  date: string;
  monthKey: string;
  paid: boolean;
  isCreditCard?: boolean;
  cardName?: 'Nubank' | 'Itaú' | 'Inter' | 'BV';
  installmentCurrent?: number;
  installmentTotal?: number;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('orcamento_dark_mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('orcamento_dark_mode', isDark.toString());
  }, [isDark]);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'overview' | 'cards'>('overview');
  const [showValues, setShowValues] = useState(true);

  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 9, 1));
  const currentMonthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthLabel = `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  const storagePrefix = currentUser ? `user_${currentUser.uid}_` : 'guest_';

  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);

      if (user) {
        const savedIncome = localStorage.getItem(`user_${user.uid}_income`);
        const savedExpenses = localStorage.getItem(`user_${user.uid}_expenses`);
        setMonthlyIncome(savedIncome ? Number(savedIncome) : 0);
        setExpenses(savedExpenses ? JSON.parse(savedExpenses) : []);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${storagePrefix}income`, monthlyIncome.toString());
    }
  }, [monthlyIncome, currentUser, storagePrefix]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${storagePrefix}expenses`, JSON.stringify(expenses));
    }
  }, [expenses, currentUser, storagePrefix]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingIncome, setIsEditingIncome] = useState(false);
  const [tempIncome, setTempIncome] = useState('');
  const [selectedCardFilter, setSelectedCardFilter] = useState<string>('TODOS');

  const [description, setDescription] = useState('');
  const [inputAmount, setInputAmount] = useState('');
  const [amountType, setAmountType] = useState<'total' | 'installment'>('total');
  const [expenseDate, setExpenseDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });
  const [isCreditCard, setIsCreditCard] = useState(false);
  const [cardName, setCardName] = useState<'Nubank' | 'Itaú' | 'Inter' | 'BV'>('Nubank');
  const [installmentTotal, setInstallmentTotal] = useState('1');

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthExpenses = expenses.filter((e) => e.monthKey === currentMonthKey);

  const totalSpent = monthExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPaid = monthExpenses.filter(e => e.paid).reduce((acc, curr) => acc + curr.amount, 0);
  const remainingBudget = monthlyIncome - totalSpent;
  const spentPercent = monthlyIncome > 0 ? ((totalSpent / monthlyIncome) * 100).toFixed(1) : '0';

  const monthCardExpenses = monthExpenses.filter(e => e.isCreditCard);
  const totalCardsSpent = monthCardExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const rawVal = parseFloat(inputAmount.replace(',', '.'));
    if (!description.trim() || isNaN(rawVal) || rawVal <= 0) return;

    const totalParcelas = isCreditCard ? Math.max(parseInt(installmentTotal, 10) || 1, 1) : 1;
    const valorPorParcela = amountType === 'total' ? rawVal / totalParcelas : rawVal;

    const [startYear, startMonth, startDay] = expenseDate.split('-').map(Number);
    const groupId = `grp-${Date.now()}`;
    const newExpensesList: Expense[] = [];

    for (let i = 0; i < totalParcelas; i++) {
      const targetDate = new Date(startYear, startMonth - 1 + i, startDay);
      const targetMonthKey = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
      const formattedDate = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;

      newExpensesList.push({
        id: `exp-${Date.now()}-${i}`,
        groupId: totalParcelas > 1 ? groupId : undefined,
        description: description.trim(),
        amount: valorPorParcela,
        date: formattedDate,
        monthKey: targetMonthKey,
        paid: false,
        isCreditCard,
        ...(isCreditCard && {
          cardName,
          installmentCurrent: i + 1,
          installmentTotal: totalParcelas,
        }),
      });
    }

    setExpenses((prev) => [...newExpensesList, ...prev]);

    setDescription('');
    setInputAmount('');
    setIsCreditCard(false);
    setInstallmentTotal('1');
    setIsModalOpen(false);
  };

  const togglePaidStatus = (id: string) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, paid: !e.paid } : e))
    );
  };

  const handleDeleteExpense = (expense: Expense) => {
    if (expense.groupId) {
      const deleteGroup = confirm(
        'Esta despesa faz parte de uma compra parcelada.\n\nClique em OK para excluir TODAS as parcelas desta compra, ou CANCELAR para excluir apenas a parcela deste mês.'
      );
      if (deleteGroup) {
        setExpenses(expenses.filter((e) => e.groupId !== expense.groupId));
        return;
      }
    }
    setExpenses(expenses.filter((e) => e.id !== expense.id));
  };

  const handleSaveIncome = () => {
    const val = parseFloat(tempIncome.replace(',', '.'));
    if (!isNaN(val) && val >= 0) {
      setMonthlyIncome(val);
      setIsEditingIncome(false);
    }
  };

  const handleResetAll = () => {
    if (confirm('Deseja zerar todas as suas movimentações cadastradas?')) {
      setExpenses([]);
      setMonthlyIncome(0);
      if (currentUser) {
        localStorage.removeItem(`${storagePrefix}expenses`);
        localStorage.removeItem(`${storagePrefix}income`);
      }
    }
  };

  const handleSignOut = () => {
    if (confirm('Deseja sair da sua conta?')) {
      signOut(auth);
    }
  };

  const formatCurrency = (val: number) => {
    if (!showValues) return '••••••';
    return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const strokeDashoffset = 251.2 - (251.2 * Math.min(Number(spentPercent), 100)) / 100;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#eef1f6] dark:bg-[#090d16] flex flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 dark:border-slate-800 border-t-slate-900 dark:border-t-[#c6f432]" />
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Iniciando sessão...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthModal />;
  }

  return (
    <div className="min-h-screen bg-[#eef1f6] dark:bg-[#090d16] text-slate-800 dark:text-slate-100 antialiased selection:bg-[#c6f432] selection:text-black transition-colors duration-200">
      
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-5 sm:space-y-6">

        {/* CABEÇALHO */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/80 dark:bg-[#111827]/90 backdrop-blur-md px-5 py-3.5 rounded-[26px] shadow-sm border border-slate-200/60 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-emerald-400 to-[#c6f432] p-0.5 flex items-center justify-center shadow-sm">
              <div className="h-full w-full rounded-full bg-white dark:bg-[#090d16] flex items-center justify-center font-bold text-slate-900 dark:text-white text-xs">
                {currentUser.email ? currentUser.email.slice(0, 2).toUpperCase() : 'US'}
              </div>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Logado como</p>
              <h1 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[170px] sm:max-w-[220px]">
                {currentUser.email}
              </h1>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-500 transition cursor-pointer"
              title="Sair da conta"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          {/* Abas */}
          <nav className="flex items-center gap-1.5 bg-[#f1f3f7] dark:bg-[#1f293d] p-1.5 rounded-full self-stretch md:self-auto justify-center">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#c6f432] text-slate-950 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('cards')}
              className={`px-6 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                activeTab === 'cards'
                  ? 'bg-[#c6f432] text-slate-950 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Cartões
            </button>
          </nav>

          {/* Controles de Mês, Dark Mode e Ações */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <div className="flex items-center bg-[#f1f3f7] dark:bg-[#1f293d] rounded-full p-1 border border-slate-200/50 dark:border-slate-700/50">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-full hover:bg-white dark:hover:bg-[#111827] text-slate-600 dark:text-slate-300 transition cursor-pointer"
                title="Mês Anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-bold px-3 text-slate-800 dark:text-slate-200 min-w-[110px] text-center">
                {currentMonthLabel}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-full hover:bg-white dark:hover:bg-[#111827] text-slate-600 dark:text-slate-300 transition cursor-pointer"
                title="Próximo Mês"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <button 
              onClick={() => setIsDark(!isDark)}
              className="p-2.5 rounded-full bg-[#f1f3f7] dark:bg-[#1f293d] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              title={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
            </button>

            <button 
              onClick={() => setShowValues(!showValues)}
              className="p-2.5 rounded-full bg-[#f1f3f7] dark:bg-[#1f293d] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              title={showValues ? 'Ocultar valores' : 'Mostrar valores'}
            >
              {showValues ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>

            <button
              onClick={handleResetAll}
              className="p-2.5 rounded-full bg-[#f1f3f7] dark:bg-[#1f293d] text-slate-400 hover:text-rose-600 transition cursor-pointer"
              title="Zerar dados"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* CARDS PRINCIPAIS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          
          {/* Card Saldo da Conta Principal */}
          <div className="lg:col-span-7 bg-white dark:bg-[#111827] rounded-[28px] p-6 sm:p-7 shadow-sm border border-slate-200/60 dark:border-slate-800/80 flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 bg-[#f1f3f7] dark:bg-[#1f293d] px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300">
                  Conta Corrente (BRL)
                </span>
                
                {isEditingIncome ? (
                  <div className="flex items-center gap-1 bg-[#f1f3f7] dark:bg-[#1f293d] p-1 rounded-full border border-slate-300 dark:border-slate-700">
                    <span className="text-xs font-medium text-slate-400 pl-2">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={tempIncome}
                      onChange={(e) => setTempIncome(e.target.value)}
                      className="w-24 text-xs font-bold bg-transparent outline-none text-slate-900 dark:text-white"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveIncome}
                      className="bg-[#c6f432] text-slate-950 text-xs px-2.5 py-1 rounded-full font-bold cursor-pointer"
                    >
                      Salvar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setTempIncome(monthlyIncome > 0 ? monthlyIncome.toString() : '');
                      setIsEditingIncome(true);
                    }}
                    className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition cursor-pointer"
                  >
                    Renda do Mês:{' '}
                    <b className={monthlyIncome > 0 ? 'text-slate-900 dark:text-white font-extrabold' : 'text-amber-600 underline'}>
                      {monthlyIncome > 0 ? formatCurrency(monthlyIncome) : 'Cadastrar Renda'}
                    </b>{' '}
                    ✎
                  </button>
                )}
              </div>

              <div className="mt-6">
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500 tracking-wide uppercase">Saldo Disponível no Mês</span>
                <div className="flex items-center gap-3 mt-1">
                  <h2 className={`text-3xl sm:text-5xl font-extrabold tracking-tight ${remainingBudget < 0 ? 'text-rose-500' : 'text-slate-950 dark:text-white'}`}>
                    {formatCurrency(remainingBudget)}
                  </h2>
                  <button 
                    onClick={() => setShowValues(!showValues)} 
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer"
                  >
                    {showValues ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-[#122319] dark:bg-[#c6f432] hover:bg-slate-900 dark:hover:bg-[#b5e628] text-white dark:text-slate-950 px-5 py-3 rounded-full text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Novo Lançamento</span>
              </button>

              <button
                onClick={() => {
                  setTempIncome(monthlyIncome > 0 ? monthlyIncome.toString() : '');
                  setIsEditingIncome(true);
                }}
                className="flex items-center gap-2 bg-white dark:bg-[#1f293d] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 px-5 py-3 rounded-full text-xs font-bold transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>Ajustar Renda</span>
              </button>

              <button
                onClick={() => setIsModalOpen(true)}
                className="ml-auto h-11 w-11 rounded-full bg-[#c6f432] text-slate-950 flex items-center justify-center hover:scale-105 transition active:scale-95 shadow-sm cursor-pointer"
                title="Adicionar"
              >
                <ArrowUpRight className="h-5 w-5 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Card Cartões de Crédito (com suporte harmonizado a dark mode) */}
          <div className="lg:col-span-5 bg-[#c6f432] dark:bg-[#c6f432] rounded-[28px] p-6 sm:p-7 shadow-sm text-slate-950 flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between">
                <span className="bg-slate-950 text-white text-[11px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                  <span>FATURAS CARTÃO ({currentMonthLabel.split(' ')[0]})</span>
                </span>
                <span className="text-xs font-bold text-slate-800">4 Bancos</span>
              </div>

              <div className="mt-6">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Fatura Total deste Mês</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950">
                    {formatCurrency(totalCardsSpent)}
                  </h3>
                  <span className="text-xs font-bold bg-white/70 px-2.5 py-0.5 rounded-full text-slate-900">
                    {monthCardExpenses.length} parcelas ativas
                  </span>
                </div>
              </div>
            </div>

            {/* Fatura por Banco */}
            <div className="mt-6 grid grid-cols-2 gap-2 pt-4 border-t border-slate-950/15">
              {(['Nubank', 'Itaú', 'Inter', 'BV'] as const).map((banco) => {
                const subTotal = monthCardExpenses
                  .filter((e) => e.cardName === banco)
                  .reduce((acc, curr) => acc + curr.amount, 0);

                return (
                  <button
                    key={banco}
                    onClick={() => {
                      setSelectedCardFilter(banco);
                      setActiveTab('cards');
                    }}
                    className="bg-white/90 hover:bg-white backdrop-blur-xs rounded-2xl p-2.5 flex items-center justify-between text-left transition cursor-pointer shadow-2xs"
                  >
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">{banco}</p>
                      <p className="text-xs font-extrabold text-slate-950">{formatCurrency(subTotal)}</p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* PARTE INFERIOR: CONSUMO + TRANSAÇÕES */}
        {activeTab === 'overview' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
            
            {/* Card Consumo Atual */}
            <div className="lg:col-span-4 bg-white dark:bg-[#111827] rounded-[28px] p-6 shadow-sm border border-slate-200/60 dark:border-slate-800/80 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-slate-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Consumo em {currentMonthLabel.split(' ')[0]}</h3>
                </div>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Tempo Real</span>
              </div>

              <div className="my-6 flex flex-col items-center justify-center relative">
                <svg className="w-44 h-44 transform -rotate-90">
                  <circle
                    cx="88"
                    cy="88"
                    r="40"
                    stroke={isDark ? '#1e293b' : '#f1f3f7'}
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="88"
                    cy="88"
                    r="40"
                    stroke="#c6f432"
                    strokeWidth="10"
                    strokeDasharray="251.2"
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-slate-950 dark:text-white">
                    {formatCurrency(totalSpent)}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 px-2.5 py-0.5 rounded-full mt-0.5">
                    {spentPercent}% da renda
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs px-2 text-slate-500 dark:text-slate-400">
                  <span>Já Pago/Liquidado:</span>
                  <b className="text-emerald-600 dark:text-emerald-400 font-bold">{formatCurrency(totalPaid)}</b>
                </div>
                <div className="bg-[#f8f9fb] dark:bg-[#182234] p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {monthlyIncome > 0 && remainingBudget >= 0 
                      ? `Tem ${formatCurrency(remainingBudget)} disponíveis para gastar neste mês.`
                      : 'Atenção: Os gastos ultrapassaram a renda prevista deste mês.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Card Transações com Cores Corrigidas no Modo Escuro */}
            <div className="lg:col-span-8 bg-white dark:bg-[#111827] rounded-[28px] p-6 shadow-sm border border-slate-200/60 dark:border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Lançamentos de {currentMonthLabel}</h3>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">Clique na pílula para marcar como pago ou pendente</p>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="text-xs font-bold text-slate-900 dark:text-white hover:underline flex items-center gap-1 cursor-pointer bg-[#f1f3f7] dark:bg-[#1f293d] px-3 py-1.5 rounded-full"
                  >
                    <Plus className="h-3.5 w-3.5" /> Adicionar
                  </button>
                </div>

                <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-2">
                  {monthExpenses.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 dark:text-slate-500">
                      <p className="text-sm font-medium">Nenhum lançamento para {currentMonthLabel}.</p>
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="mt-3 text-xs font-bold bg-[#122319] dark:bg-[#c6f432] text-white dark:text-slate-950 px-4 py-2 rounded-full hover:bg-slate-900 dark:hover:bg-[#b5e628] cursor-pointer transition"
                      >
                        + Cadastrar lançamento
                      </button>
                    </div>
                  ) : (
                    monthExpenses.map((expense) => (
                      <div
                        key={expense.id}
                        className={`group flex items-center justify-between p-3.5 rounded-2xl transition border ${
                          expense.paid 
                            ? 'bg-slate-50/70 dark:bg-[#162032]/50 border-slate-200/60 dark:border-slate-800/50 opacity-60' 
                            : 'bg-white dark:bg-[#1a2436] border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            onClick={() => togglePaidStatus(expense.id)}
                            className="text-slate-400 hover:scale-110 transition cursor-pointer shrink-0"
                            title={expense.paid ? 'Marcar como pendente' : 'Marcar como pago'}
                          >
                            {expense.paid ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-500 fill-emerald-50 dark:fill-emerald-950/40" />
                            ) : (
                              <Circle className="h-5 w-5 text-slate-300 dark:text-slate-600" />
                            )}
                          </button>

                          <div className="min-w-0">
                            <p className={`text-xs font-bold truncate ${expense.paid ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-900 dark:text-slate-100'}`}>
                              {expense.description}
                            </p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-400 flex items-center gap-1.5 flex-wrap mt-0.5">
                              {expense.isCreditCard ? (
                                <span className="font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-[#28364f] px-2 py-0.5 rounded-md">
                                  {expense.cardName} • Parcela {expense.installmentCurrent}/{expense.installmentTotal}
                                </span>
                              ) : (
                                <span className="bg-slate-100 dark:bg-[#28364f] px-2 py-0.5 rounded-md text-slate-600 dark:text-slate-300">Débito / Pix</span>
                              )}
                              <span>• {expense.date.split('-').reverse().join('/')}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-right shrink-0">
                          <div className="flex flex-col items-end">
                            <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                              - {formatCurrency(expense.amount)}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                              expense.paid 
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400' 
                                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                            }`}>
                              {expense.paid ? 'Pago' : 'Pendente'}
                            </span>
                          </div>

                          <button
                            onClick={() => handleDeleteExpense(expense)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#243147] transition cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                <span>{monthExpenses.length} movimentações em {currentMonthLabel}</span>
                <span>{monthExpenses.filter(e => e.paid).length} pagas • {monthExpenses.filter(e => !e.paid).length} pendentes</span>
              </div>
            </div>

          </div>
        ) : (
          /* ABA CARTÕES */
          <div className="bg-white dark:bg-[#111827] rounded-[28px] p-6 shadow-sm border border-slate-200/60 dark:border-slate-800/80 space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Faturas e Parcelas ({currentMonthLabel})</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500">Selecione um banco para filtrar os lançamentos</p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 bg-[#f1f3f7] dark:bg-[#1f293d] p-1.5 rounded-full">
                {['TODOS', 'Nubank', 'Itaú', 'Inter', 'BV'].map((item) => (
                  <button
                    key={item}
                    onClick={() => setSelectedCardFilter(item)}
                    className={`px-3 py-1 text-xs font-bold rounded-full transition cursor-pointer ${
                      selectedCardFilter === item
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {monthCardExpenses
                .filter(e => selectedCardFilter === 'TODOS' || e.cardName === selectedCardFilter)
                .length === 0 ? (
                <div className="py-16 text-center text-slate-400 dark:text-slate-500 text-xs">
                  Nenhuma compra encontrada para este filtro no mês de {currentMonthLabel}.
                </div>
              ) : (
                monthCardExpenses
                  .filter(e => selectedCardFilter === 'TODOS' || e.cardName === selectedCardFilter)
                  .map((exp) => (
                    <div key={exp.id} className="py-3.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => togglePaidStatus(exp.id)}
                          className="cursor-pointer"
                        >
                          {exp.paid ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 fill-emerald-50 dark:fill-emerald-950/40" />
                          ) : (
                            <Circle className="h-5 w-5 text-slate-300 dark:text-slate-600" />
                          )}
                        </button>
                        <div>
                          <p className={`font-bold text-sm ${exp.paid ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-900 dark:text-slate-100'}`}>
                            {exp.description}
                          </p>
                          <p className="text-slate-400 dark:text-slate-400">
                            {exp.cardName} • Parcela <b className="text-slate-700 dark:text-slate-200">{exp.installmentCurrent}/{exp.installmentTotal}</b> • Data: {exp.date.split('-').reverse().join('/')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                            {formatCurrency(exp.amount)}
                          </span>
                          <p className={`text-[10px] font-bold ${exp.paid ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {exp.paid ? 'Fatura Liquidada' : 'A Vencer'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteExpense(exp)}
                          className="text-slate-400 hover:text-rose-500 cursor-pointer p-1"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

      </div>

      {/* BOTÃO FLUTUANTE MOBILE */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="md:hidden fixed bottom-6 right-5 z-40 h-14 w-14 rounded-full bg-[#c6f432] text-slate-950 flex items-center justify-center shadow-lg shadow-black/10 active:scale-95 transition cursor-pointer"
        aria-label="Adicionar lançamento"
      >
        <Plus className="h-6 w-6 stroke-[2.5]" />
      </button>

      {/* MODAL DE NOVO LANÇAMENTO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-xs p-0 sm:p-4">
          <div className="w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] bg-white dark:bg-[#111827] p-6 sm:p-8 shadow-2xl space-y-5 animate-in slide-in-from-bottom duration-200 border border-slate-100 dark:border-slate-800">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Novo Lançamento</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Compras parceladas serão agendadas nos próximos meses</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 rounded-full bg-[#f1f3f7] dark:bg-[#1f293d] flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Descrição</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Ténis Nike, Mercado Mensal, Farmácia"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-2xl bg-[#f8f9fb] dark:bg-[#090d16] border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:border-slate-900 dark:focus:border-[#c6f432] transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Valor (R$)</label>
                    {isCreditCard && (
                      <button
                        type="button"
                        onClick={() => setAmountType(amountType === 'total' ? 'installment' : 'total')}
                        className="text-[10px] font-bold text-emerald-600 dark:text-[#c6f432] underline"
                      >
                        {amountType === 'total' ? 'Total' : 'Por Parcela'}
                      </button>
                    )}
                  </div>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    placeholder="0,00"
                    value={inputAmount}
                    onChange={(e) => setInputAmount(e.target.value)}
                    className="w-full rounded-2xl bg-[#f8f9fb] dark:bg-[#090d16] border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:border-slate-900 dark:focus:border-[#c6f432] transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Data da 1ª Parcela</label>
                  <input 
                    type="date" 
                    required
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full rounded-2xl bg-[#f8f9fb] dark:bg-[#090d16] border border-slate-200 dark:border-slate-700 px-3.5 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-[#c6f432] transition"
                  />
                </div>
              </div>

              {/* Cartão de Crédito */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={isCreditCard}
                    onChange={(e) => setIsCreditCard(e.target.checked)}
                    className="h-4 w-4 rounded-md text-slate-900 focus:ring-0 cursor-pointer"
                  />
                  <span>Compra realizada no Cartão de Crédito?</span>
                </label>

                {isCreditCard && (
                  <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Qual Banco/Cartão?</label>
                      <select 
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value as any)}
                        className="w-full rounded-xl bg-[#f8f9fb] dark:bg-[#090d16] border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white outline-none cursor-pointer"
                      >
                        <option value="Nubank">Nubank</option>
                        <option value="Itaú">Itaú</option>
                        <option value="Inter">Inter</option>
                        <option value="BV">BV</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Qtd de Parcelas</label>
                      <input 
                        type="number" 
                        min="1"
                        max="48"
                        required
                        value={installmentTotal}
                        onChange={(e) => setInstallmentTotal(e.target.value)}
                        className="w-full rounded-xl bg-[#f8f9fb] dark:bg-[#090d16] border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-center font-bold text-slate-900 dark:text-white outline-none"
                        placeholder="Ex: 3"
                      />
                    </div>

                    <div className="col-span-2 bg-[#f8f9fb] dark:bg-[#090d16] p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                      ℹ️ O app agendará automaticamente 1 parcela por mês a partir de <b>{expenseDate.split('-').reverse().join('/')}</b>.
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full rounded-full bg-[#122319] dark:bg-[#c6f432] py-3.5 text-xs font-bold text-white dark:text-slate-950 hover:bg-slate-900 dark:hover:bg-[#b5e628] active:scale-[0.99] transition shadow-md cursor-pointer"
                >
                  Confirmar Lançamento
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}