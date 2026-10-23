import React from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types';
import { PWAInstallButton } from './PWAInstallButton';
import {
  LayoutDashboard,
  Layers,
  Building2,
  Wallet,
  Users,
  PlusCircle,
  Share2,
  Download,
  Upload,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';

interface HeaderProps {
  onOpenNewApplication: () => void;
  onOpenNewIPO: () => void;
  onOpenShareModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewApplication,
  onOpenNewIPO,
  onOpenShareModal,
}) => {
  const {
    activeTab,
    setActiveTab,
    accountsWithDeficitCount,
    resetToSampleData,
    exportBackupJson,
    importBackupJson,
    setSelectedIpoId,
  } = useApp();

  const handleTabClick = (tab: ActiveTab) => {
    if (tab === 'ipos') {
      setSelectedIpoId(null);
    }
    setActiveTab(tab);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      importBackupJson(content);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 border-b border-slate-800 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Navbar Row */}
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-linear-to-br from-emerald-500 to-blue-600 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white font-bold text-lg">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base sm:text-lg tracking-tight">
                  IPO Application Planner
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Multi-Account Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden md:block">
                Orchestrate family bids, broker demat accounts, and bank liquidity
              </p>
            </div>
          </div>

          {/* Quick Actions & Utility Tools */}
          <div className="flex items-center gap-2">
            {/* Deficit Alert Quick Badge */}
            {accountsWithDeficitCount > 0 && (
              <button
                onClick={() => setActiveTab('funding')}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 transition animate-pulse"
                title={`${accountsWithDeficitCount} bank account(s) have insufficient funds for pending mandates!`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>{accountsWithDeficitCount} Account Deficit</span>
              </button>
            )}

            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* Quick Share Summary Button */}
            <button
              onClick={onOpenShareModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white transition"
              title="Copy WhatsApp / Teams formatted bid summary"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Share Summary</span>
            </button>

            {/* Backup Dropdown / Actions */}
            <div className="hidden lg:flex items-center gap-1 border-l border-slate-800 pl-2">
              <button
                onClick={exportBackupJson}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded"
                title="Export JSON Backup"
              >
                <Download className="w-4 h-4" />
              </button>
              <label
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded cursor-pointer"
                title="Import JSON Backup"
              >
                <Upload className="w-4 h-4" />
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => {
                  if (confirm('Reset to standard sample scenario? Your current edits will be replaced.')) {
                    resetToSampleData();
                  }
                }}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded"
                title="Reset to Sample Demo Scenario"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* [+ New Application] Primary Button */}
            <button
              onClick={onOpenNewApplication}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-600/30 transition focus:ring-2 focus:ring-blue-400"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Bid</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="flex space-x-1 sm:space-x-3 overflow-x-auto py-2 border-t border-slate-800/80 scrollbar-none">
          <button
            onClick={() => handleTabClick('dashboard')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => handleTabClick('applications')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'applications'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Applications Master</span>
          </button>

          <button
            onClick={() => handleTabClick('funding')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'funding'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Funding Matrix</span>
            {accountsWithDeficitCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>

          <button
            onClick={() => handleTabClick('ipos')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'ipos'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>IPOs & Quotas</span>
          </button>

          <button
            onClick={() => handleTabClick('people-accounts')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'people-accounts'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Applicants & Accounts</span>
          </button>
        </div>
      </div>
    </header>
  );
};
