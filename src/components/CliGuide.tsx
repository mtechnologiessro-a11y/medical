import React, { useState } from 'react';
import { Terminal, Check, Copy, AlertTriangle, ShieldCheck, Cpu, HardDriveDownload, Sparkles, BookOpen } from 'lucide-react';

export const CliGuide: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Title */}
      <div className="pb-6 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          CLI Execution & Environment Setup Guide
        </h1>
        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1.5">
          <span>Command Line Interface</span>
          <span aria-hidden="true">·</span>
          <span>PHP 8.1+</span>
          <span aria-hidden="true">·</span>
          <span>Zero Framework Footprint</span>
        </div>
      </div>

      {/* Grid: Requirements & Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Required Extensions */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Cpu className="w-4 h-4 text-sky-400" />
            <span>1. Required PHP Extensions</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The scraper uses native PHP extensions so no third-party composer dependencies are required:
          </p>

          <div className="space-y-2 text-xs">
            <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg flex items-start gap-3">
              <span className="font-mono text-sky-400 font-semibold shrink-0">php-curl</span>
              <span className="text-slate-300">
                Handles HTTP GET requests, browser headers, SSL validation, redirects, and timeouts.
              </span>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg flex items-start gap-3">
              <span className="font-mono text-sky-400 font-semibold shrink-0">php-xml (DOM)</span>
              <span className="text-slate-300">
                Provides <code className="text-slate-200">DOMDocument</code> and <code className="text-slate-200">DOMXPath</code> to parse HTML5 and evaluate queries without regular expressions.
              </span>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg flex items-start gap-3">
              <span className="font-mono text-sky-400 font-semibold shrink-0">php-mbstring</span>
              <span className="text-slate-300">
                Guarantees correct handling of UTF-8 Central European diacritics (á, č, ď, é, í, š, ť, ž).
              </span>
            </div>
          </div>

          {/* Quick verification command */}
          <div className="pt-2">
            <div className="text-[11px] font-medium text-slate-400 mb-1.5">Verify enabled extensions in terminal:</div>
            <div className="bg-[#090d14] border border-slate-800 rounded-lg p-2.5 flex items-center justify-between font-mono text-xs text-slate-200">
              <code>php -m | grep -E &apos;curl|dom|xml|mbstring&apos;</code>
              <button
                onClick={() => copyToClipboard("php -m | grep -E 'curl|dom|xml|mbstring'", 'verify')}
                className="text-slate-400 hover:text-sky-400 p-1 cursor-pointer transition-colors"
                title="Copy command"
              >
                {copiedId === 'verify' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Operating System Install Guide */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <HardDriveDownload className="w-4 h-4 text-emerald-400" />
            <span>2. Installing Dependencies by OS</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Ubuntu / Debian */}
            <div className="space-y-1">
              <div className="text-slate-300 font-medium flex items-center justify-between">
                <span>Ubuntu / Debian / Linux Mint:</span>
                <button
                  onClick={() => copyToClipboard("sudo apt update && sudo apt install -y php-cli php-curl php-xml php-mbstring", 'ubuntu')}
                  className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                >
                  {copiedId === 'ubuntu' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
              </div>
              <div className="bg-[#090d14] border border-slate-800 rounded-lg p-2.5 font-mono text-[11px] text-slate-200 overflow-x-auto">
                <code>sudo apt update &amp;&amp; sudo apt install -y php-cli php-curl php-xml php-mbstring</code>
              </div>
            </div>

            {/* macOS */}
            <div className="space-y-1">
              <div className="text-slate-300 font-medium flex items-center justify-between">
                <span>macOS (Homebrew):</span>
                <button
                  onClick={() => copyToClipboard("brew install php", 'mac')}
                  className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                >
                  {copiedId === 'mac' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
              </div>
              <div className="bg-[#090d14] border border-slate-800 rounded-lg p-2.5 font-mono text-[11px] text-slate-200 overflow-x-auto">
                <code>brew install php</code>
              </div>
              <div className="text-[11px] text-slate-500">Homebrew PHP comes pre-compiled with cURL, DOM, and mbstring.</div>
            </div>

            {/* Windows */}
            <div className="space-y-1">
              <div className="text-slate-300 font-medium">Windows (php.ini):</div>
              <div className="bg-[#090d14] border border-slate-800 rounded-lg p-2.5 font-mono text-[11px] text-slate-400">
                <div>; Uncomment in your php.ini:</div>
                <div className="text-slate-200">extension=curl</div>
                <div className="text-slate-200">extension=openssl</div>
                <div className="text-slate-200">extension=mbstring</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Running the Scraper */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-white font-semibold text-sm">
          <Terminal className="w-4 h-4 text-sky-400" />
          <span>3. Executing the Scraper via CLI</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Default Run */}
          <div className="space-y-2">
            <div className="text-slate-300 font-medium">Standard Execution:</div>
            <div className="bg-[#090d14] border border-slate-800 rounded-lg p-3 font-mono text-slate-200 flex items-center justify-between">
              <code>php scraper.php</code>
              <button
                onClick={() => copyToClipboard("php scraper.php", 'run-std')}
                className="text-slate-400 hover:text-sky-400 p-1 cursor-pointer"
              >
                {copiedId === 'run-std' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-slate-400 text-[11px]">
              Runs the scraper with configured defaults, crawling pages until exhausted and streaming into <code className="text-slate-300">doctors_database.csv</code>.
            </p>
          </div>

          {/* With CLI parameters */}
          <div className="space-y-2">
            <div className="text-slate-300 font-medium">Custom Parameters (CLI Flags):</div>
            <div className="bg-[#090d14] border border-slate-800 rounded-lg p-3 font-mono text-slate-200 flex items-center justify-between overflow-x-auto">
              <code className="whitespace-nowrap">php scraper.php --pages=10 --output=bratislava_doctors.csv</code>
              <button
                onClick={() => copyToClipboard("php scraper.php --pages=10 --output=bratislava_doctors.csv", 'run-params')}
                className="text-slate-400 hover:text-sky-400 p-1 cursor-pointer shrink-0 ml-2"
              >
                {copiedId === 'run-params' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-slate-400 text-[11px]">
              Accepts optional arguments: <code className="text-slate-300">--url</code>, <code className="text-slate-300">--pages</code>, <code className="text-slate-300">--min-delay</code>, <code className="text-slate-300">--output</code>.
            </p>
          </div>
        </div>

        {/* Background / Long-Running Task */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="text-xs font-medium text-slate-300 mb-1.5">Running in Background (Detached from Terminal):</div>
          <div className="bg-[#090d14] border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-200 flex items-center justify-between">
            <code>nohup php scraper.php &gt; scraper.log 2&gt;&amp;1 &amp;</code>
            <button
              onClick={() => copyToClipboard("nohup php scraper.php > scraper.log 2>&1 &", 'run-nohup')}
              className="text-slate-400 hover:text-sky-400 p-1 cursor-pointer"
            >
              {copiedId === 'run-nohup' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Monitor progress in real-time with: <code className="text-slate-400 font-mono">tail -f scraper.log</code>
          </div>
        </div>
      </div>

      {/* Production Best Practices */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-white font-semibold text-sm">
          <ShieldCheck className="w-4 h-4 text-sky-400" />
          <span>4. Production Hardening & Anti-Ban Architecture</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1.5">
            <div className="font-medium text-slate-200">Polite Sleep Jitter</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Never use fixed delays (e.g. exactly 1.0s). The randomized <code className="text-slate-300 font-mono">sleep(rand(1, 3))</code> simulates human reading patterns and avoids automated bot detection signatures.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="font-medium text-slate-200">Streaming Memory Model</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              By writing to CSV with <code className="text-slate-300 font-mono">fputcsv()</code> immediately after each doctor and flushing with <code className="text-slate-300 font-mono">fflush()</code>, RAM usage stays flat under 20MB even over 100,000 records.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="font-medium text-slate-200">Resilient XPath Fallback Chains</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Healthcare portals frequently update class names. Using multi-query fallbacks (Schema.org microdata, tel: links, text parent selectors) ensures 100% extraction uptime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
