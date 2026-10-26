import React, { useState } from 'react';
import { Copy, Check, Download, Settings2, Sliders, ShieldCheck, RefreshCw, FileCode, CheckCircle2 } from 'lucide-react';
import { ScraperConfig } from '../types';
import { generatePhpCode, DEFAULT_CONFIG } from '../data/defaultPhpScript';

interface ScriptStudioProps {
  config: ScraperConfig;
  setConfig: React.Dispatch<React.SetStateAction<ScraperConfig>>;
  onDownloadPhp: () => void;
}

export const ScriptStudio: React.FC<ScriptStudioProps> = ({ config, setConfig, onDownloadPhp }) => {
  const [copied, setCopied] = useState(false);
  const [showConfig, setShowConfig] = useState(true);

  const phpCode = generatePhpCode(config);

  const handleCopy = () => {
    navigator.clipboard.writeText(phpCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadComposer = () => {
    const composerJson = JSON.stringify({
      name: "custom/doctor-directory-scraper",
      description: "Alternative Symfony DomCrawler/Goutte setup for doctor directory scraping",
      type: "project",
      require: {
        "php": ">=8.1",
        "symfony/dom-crawler": "^6.4 || ^7.0",
        "symfony/css-selector": "^6.4 || ^7.0",
        "guzzlehttp/guzzle": "^7.8"
      }
    }, null, 2);

    const blob = new Blob([composerJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'composer.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Intro hero banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Doctor Directory PHP Web Scraper
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1.5">
            <span>PHP 8.1+</span>
            <span aria-hidden="true">·</span>
            <span>cURL & DOMXPath</span>
            <span aria-hidden="true">·</span>
            <span>Zero External Dependencies</span>
            <span aria-hidden="true">·</span>
            <span>Immediate CSV Stream (fputcsv)</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              showConfig 
                ? 'bg-slate-800 border-slate-700 text-sky-400' 
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showConfig ? 'Hide Settings' : 'Customize Script'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy PHP Script'}</span>
          </button>

          <button
            onClick={onDownloadPhp}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .php</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Configurator + Code viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: Configuration Panel (if open) */}
        {showConfig && (
          <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-5 text-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Settings2 className="w-4 h-4 text-sky-400" />
                <span>Crawler Configuration</span>
              </div>
              <button
                onClick={resetConfig}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                title="Reset to defaults"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Target URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Base Portal URL</label>
              <input
                type="text"
                value={config.baseUrl}
                onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                placeholder="https://example.com/lekari"
              />
            </div>

            {/* Pagination param & max pages */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Page Param (?param=)</label>
                <input
                  type="text"
                  value={config.paginationParam}
                  onChange={(e) => setConfig({ ...config, paginationParam: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                  placeholder="page"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Max Page Safety Limit</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={config.maxPages}
                  onChange={(e) => setConfig({ ...config, maxPages: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 tabular-nums"
                />
              </div>
            </div>

            {/* Rate limiting politeness delay */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300">
                  Politeness Delay (Rate Limiting)
                </label>
                <span className="text-xs font-mono text-sky-400 tabular-nums">
                  {config.minDelay}s – {config.maxDelay}s (randomized)
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-slate-400">Min Delay (s)</span>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={config.minDelay}
                    onChange={(e) => setConfig({ ...config, minDelay: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 tabular-nums"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">Max Delay (s)</span>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={config.maxDelay}
                    onChange={(e) => setConfig({ ...config, maxDelay: Math.max(config.minDelay, parseInt(e.target.value) || 1) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 tabular-nums"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Randomized interval between requests prevents bot detection and server overload.
              </p>
            </div>

            {/* Output CSV & Timeout */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">CSV Filename</label>
                <input
                  type="text"
                  value={config.outputFilename}
                  onChange={(e) => setConfig({ ...config, outputFilename: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                  placeholder="doctors_database.csv"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">cURL Timeout (s)</label>
                <input
                  type="number"
                  min="3"
                  max="60"
                  value={config.timeout}
                  onChange={(e) => setConfig({ ...config, timeout: Math.max(3, parseInt(e.target.value) || 15) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 tabular-nums"
                />
              </div>
            </div>

            {/* Excel BOM Toggle */}
            <div className="pt-2 border-t border-slate-800/80">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.includeBom}
                  onChange={(e) => setConfig({ ...config, includeBom: e.target.checked })}
                  className="mt-0.5 rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-sky-500/20"
                />
                <div>
                  <span className="text-xs font-medium text-slate-200">Include UTF-8 BOM in CSV</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Ensures diacritics (á, č, ď, é, í, š, ť, ž) open cleanly in Microsoft Excel without character corruption.
                  </p>
                </div>
              </label>
            </div>

            {/* Alternative composer package button */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-400">Need Symfony DomCrawler?</span>
              <button
                onClick={handleDownloadComposer}
                className="text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors cursor-pointer"
              >
                Download composer.json
              </button>
            </div>
          </div>
        )}

        {/* Right column: Syntax highlighted code view */}
        <div className={`${showConfig ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-4`}>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            {/* Window bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/70 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-700" />
                <div className="w-3 h-3 rounded-full bg-slate-700" />
                <div className="w-3 h-3 rounded-full bg-slate-700" />
                <span className="text-xs font-mono text-slate-400 ml-2">scraper.php</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="font-mono tabular-nums">{phpCode.split('\n').length} lines</span>
                <span aria-hidden="true">·</span>
                <span>PHP 8.1+</span>
              </div>
            </div>

            {/* Code Content */}
            <div className="p-4 overflow-x-auto max-h-[640px] text-xs font-mono leading-relaxed bg-[#0a0e17] text-slate-200 selection:bg-sky-500/30">
              <pre className="tab-4">
                <code>{phpCode}</code>
              </pre>
            </div>
          </div>

          {/* Key Architectural Features Callouts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Resilient Two-Step Pipeline</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                Crawls paginated listings to gather doctor URLs first, then visits detail profiles with relative-to-absolute URL resolution.
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Crash-Proof CSV Streaming</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                Uses <code className="text-slate-300 font-mono">fputcsv()</code> and <code className="text-slate-300 font-mono">fflush()</code> after every parsed profile to prevent data loss on network drops.
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                <FileCode className="w-4 h-4" />
                <span>DOMXPath & Zero Warnings</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                Configured with <code className="text-slate-300 font-mono">libxml_use_internal_errors(true)</code> and multi-query fallbacks for name, clinic, phone, and email.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
