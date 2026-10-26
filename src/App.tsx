import React, { useState } from 'react';
import { Header } from './components/Header';
import { ScriptStudio } from './components/ScriptStudio';
import { LiveSimulation } from './components/LiveSimulation';
import { XPathInspector } from './components/XPathInspector';
import { CliGuide } from './components/CliGuide';
import { DEFAULT_CONFIG, generatePhpCode } from './data/defaultPhpScript';
import { ScraperConfig } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'script' | 'simulation' | 'xpath' | 'cli'>('script');
  const [config, setConfig] = useState<ScraperConfig>(DEFAULT_CONFIG);

  const handleDownloadPhp = () => {
    const code = generatePhpCode(config);
    const blob = new Blob([code], { type: 'application/x-httpd-php;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scraper.php';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0c1017] text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-white">
      {/* 3-Zone Top Bar Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onDownloadPhp={handleDownloadPhp}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'script' && (
          <ScriptStudio
            config={config}
            setConfig={setConfig}
            onDownloadPhp={handleDownloadPhp}
          />
        )}

        {activeTab === 'simulation' && (
          <LiveSimulation config={config} />
        )}

        {activeTab === 'xpath' && (
          <XPathInspector
            config={config}
            setConfig={setConfig}
          />
        )}

        {activeTab === 'cli' && (
          <CliGuide />
        )}
      </main>

      {/* Quiet, minimalist footer */}
      <footer className="border-t border-slate-800/80 py-6 px-6 bg-slate-950/60 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">DocExtract PHP</span>
            <span aria-hidden="true">&middot;</span>
            <span>PHP 8.1+ Web Scraping Suite</span>
            <span aria-hidden="true">&middot;</span>
            <span>cURL &amp; DOMXPath</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setActiveTab('script')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              PHP Script
            </button>
            <button
              onClick={() => setActiveTab('simulation')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Live Simulation
            </button>
            <button
              onClick={() => setActiveTab('xpath')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              XPath Sandbox
            </button>
            <button
              onClick={() => setActiveTab('cli')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              CLI Guide
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
