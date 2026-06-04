import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { TrendingUp, Percent, DollarSign, Users, ShieldAlert, Sparkles, Save, CheckCircle } from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { saveRevenueForecast, fetchRevenueForecast } from '../services/dbService';

export default function RevenueForecaster() {
  const { activeStartup } = useOutletContext();

  const [price, setPrice] = useState(49);
  const [initialCustomers, setInitialCustomers] = useState(100);
  const [growthRate, setGrowthRate] = useState(15);
  const [expenses, setExpenses] = useState(2500);
  const [variableCost, setVariableCost] = useState(10);
  const [savedStatus, setSavedStatus] = useState(false);

  // Sync with active startup and fetch existing forecast
  useEffect(() => {
    if (activeStartup) {
      loadExistingForecast(activeStartup.id);
    }
  }, [activeStartup]);

  const loadExistingForecast = async (startupId) => {
    try {
      const data = await fetchRevenueForecast(startupId);
      if (data && data.forecast_data) {
        const { price, initialCustomers, growthRate, expenses, variableCost } = data.forecast_data;
        setPrice(price || 49);
        setInitialCustomers(initialCustomers || 100);
        setGrowthRate(growthRate || 15);
        setExpenses(expenses || 2500);
        setVariableCost(variableCost || 10);
      }
    } catch (e) {
      console.error("Failed to load forecast:", e);
    }
  };

  const handleSaveForecast = async () => {
    if (!activeStartup) return;
    try {
      const forecastData = { price, initialCustomers, growthRate, expenses, variableCost };
      await saveRevenueForecast(activeStartup.id, forecastData);
      setSavedStatus(true);
      setTimeout(() => setSavedStatus(false), 1500);
    } catch (e) {
      console.error(e);
      alert('Failed to save financial projections.');
    }
  };

  // Generate 12 months projections
  const generate12MonthData = () => {
    const data = [];
    let customers = initialCustomers;
    let cumulativeProfit = 0;

    for (let month = 1; month <= 12; month++) {
      if (month > 1) {
        customers = customers * (1 + growthRate / 100);
      }
      const roundedCustomers = Math.round(customers);
      const grossRevenue = Math.round(roundedCustomers * price);
      const variableCosts = Math.round(roundedCustomers * variableCost);
      const totalExpenses = Math.round(expenses + variableCosts);
      const monthlyProfit = Math.round(grossRevenue - totalExpenses);
      cumulativeProfit += monthlyProfit;

      data.push({
        month: `Month ${month}`,
        customers: roundedCustomers,
        revenue: grossRevenue,
        expenses: totalExpenses,
        profit: monthlyProfit,
        cumulativeProfit: cumulativeProfit
      });
    }
    return data;
  };

  const chartData = generate12MonthData();

  // Find break even month
  const breakEvenMonth = chartData.find(d => d.profit > 0)?.month || 'N/A (Unprofitable)';
  
  // Totals for year 1
  const year1Revenue = chartData.reduce((sum, d) => sum + d.revenue, 0);
  const year1Expenses = chartData.reduce((sum, d) => sum + d.expenses, 0);
  const year1Profit = year1Revenue - year1Expenses;

  // Year 3 Projection (Simple estimate compounding Year 1)
  const y2Revenue = year1Revenue * 1.5;
  const y3Revenue = y2Revenue * 1.5;

  if (!activeStartup) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 space-y-4">
        <TrendingUp className="mx-auto text-slate-400" size={48} />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">No Active Startup Project</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Select an active startup project from the top dropdown selector, or validate a new idea on the Dashboard first.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <TrendingUp size={24} />
            </div>
            Financial Revenue Forecaster
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Simulate price tiers, expenses, and growth vectors to build visual profitability projections.
          </p>
        </div>

        <button
          onClick={handleSaveForecast}
          className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/10 flex items-center gap-1.5 transition cursor-pointer"
        >
          {savedStatus ? (
            <>
              <CheckCircle size={14} />
              Saved!
            </>
          ) : (
            <>
              <Save size={14} />
              Save projections
            </>
          )}
        </button>
      </div>

      {/* Main Grid: Sliders & KPI cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Sliders inputs */}
        <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 space-y-6">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide border-b border-slate-100 dark:border-slate-800/80 pb-3">
            Model Parameters
          </h2>

          {/* Input 1 */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <DollarSign size={14} /> Price per Unit / Sub
              </span>
              <span className="text-indigo-600 dark:text-indigo-400">${price}</span>
            </div>
            <input
              type="range"
              min="5"
              max="500"
              step="5"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* Input 2 */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Users size={14} /> Initial Customers
              </span>
              <span className="text-indigo-600 dark:text-indigo-400">{initialCustomers} users</span>
            </div>
            <input
              type="range"
              min="10"
              max="2000"
              step="10"
              value={initialCustomers}
              onChange={(e) => setInitialCustomers(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* Input 3 */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Percent size={14} /> Monthly Growth Rate
              </span>
              <span className="text-indigo-600 dark:text-indigo-400">{growthRate}% MoM</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={growthRate}
              onChange={(e) => setGrowthRate(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* Input 4 */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <ShieldAlert size={14} /> Fixed Monthly Expenses
              </span>
              <span className="text-indigo-600 dark:text-indigo-400">${expenses} / mo</span>
            </div>
            <input
              type="range"
              min="500"
              max="20000"
              step="500"
              value={expenses}
              onChange={(e) => setExpenses(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* Input 5 */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <DollarSign size={14} /> Variable Unit Cost
              </span>
              <span className="text-indigo-600 dark:text-indigo-400">${variableCost} / unit</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="2"
              value={variableCost}
              onChange={(e) => setVariableCost(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

        </div>

        {/* Right Side: Projections charts */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* KPI metrics row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            <div className="glass-panel p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Break-Even Point</span>
              <span className="text-lg font-black text-slate-800 dark:text-slate-100">{breakEvenMonth}</span>
            </div>

            <div className="glass-panel p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Year 1 Net Income</span>
              <span className={`text-lg font-black ${year1Profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                ${year1Profit.toLocaleString()}
              </span>
            </div>

            <div className="glass-panel p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Year 3 Compounded Revenue</span>
              <span className="text-lg font-black text-slate-800 dark:text-slate-100">${Math.round(y3Revenue).toLocaleString()}</span>
            </div>

          </div>

          {/* Revenue Chart Recharts */}
          <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">12-Month Financial Projections ($)</h3>
            
            <div className="h-64 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }} />
                  <Legend verticalAlign="top" height={36} />
                  <Line type="monotone" dataKey="revenue" name="Gross Revenue" stroke="#4f46e5" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="expenses" name="Operational Cost" stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="profit" name="Net Profit" stroke="#10b981" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cumulative Profit Chart */}
          <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">Cumulative Growth Balance ($)</h3>

            <div className="h-60 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }} />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="cumulativeProfit" name="Cumulative Balance" fill="#818cf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
