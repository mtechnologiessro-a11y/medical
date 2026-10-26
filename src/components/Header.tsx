import React from 'react';
import { Download, Code2, Play, Terminal, SearchCode } from 'lucide-react';

interface HeaderProps {
  activeTab: 'script' | 'simulation' | 'xpath' | 'cli';
  setActiveTab: (tab: 'script' | 'simulation' | 'xpath' | 'cli') => void;
  onDownloadPhp: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onDownloadPhp }) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a 
          href="#home" 
          onClick={(e) => { e.preventDefault(); setActiveTab('script'); }}
          className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2.5"
        >
          <div className="w-8 h-8 rounded-lg bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400 font-mono text-sm font-semibold">
            &lt;?&gt;
          </div>
          <span>DocExtract PHP</span>
        </a>
      </div>

      {/* Zone 2: 4 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
        <button
          onClick={() => setActiveTab('script')}
          className={`flex items-center gap-2 py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'script' ? 'text-sky-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>PHP Script</span>
        </button>
        <button
          onClick={() => setActiveTab('simulation')}
          className={`flex items-center gap-2 py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'simulation' ? 'text-sky-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <Play className="w-4 h-4" />
          <span>Live Simulation</span>
        </button>
        <button
          onClick={() => setActiveTab('xpath')}
          className={`flex items-center gap-2 py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'xpath' ? 'text-sky-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <SearchCode className="w-4 h-4" />
          <span>XPath Sandbox</span>
        </button>
        <button
          onClick={() => setActiveTab('cli')}
          className={`flex items-center gap-2 py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'cli' ? 'text-sky-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>CLI & Setup Guide</span>
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onDownloadPhp}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-900 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm shadow-sky-500/20 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download scraper.php</span>
        </button>
      </div>
    </header>
  );
};
