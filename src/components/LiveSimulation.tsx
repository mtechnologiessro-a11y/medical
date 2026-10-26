import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Download, Terminal, Search, ExternalLink, Code2, Check, AlertCircle } from 'lucide-react';
import { DoctorRecord, LogEntry, ScraperConfig } from '../types';
import { MOCK_DIRECTORY_PAGES } from '../data/sampleDoctors';

interface LiveSimulationProps {
  config: ScraperConfig;
}

export const LiveSimulation: React.FC<LiveSimulationProps> = ({ config }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState<number>(2); // 1 = 1500ms, 2 = 600ms, 5 = 200ms, 99 = 30ms
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [currentDoctorIndex, setCurrentDoctorIndex] = useState<number>(0);
  const [currentStage, setCurrentStage] = useState<'idle' | 'listing' | 'detail' | 'completed'>('idle');
  const [records, setRecords] = useState<DoctorRecord[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString(),
      level: 'info',
      stage: 'system',
      message: `System ready. Target portal: ${config.baseUrl}?${config.paginationParam}=1`
    }
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMissing, setFilterMissing] = useState<'all' | 'missing-email' | 'missing-phone'>('all');
  const [selectedHtmlPreview, setSelectedHtmlPreview] = useState<string | null>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);

  const addLog = (level: LogEntry['level'], stage: LogEntry['stage'], message: string, httpStatus?: number) => {
    setLogs((prev) => [
      ...prev,
      {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toLocaleTimeString(),
        level,
        stage,
        message,
        httpStatus
      }
    ]);
  };

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Crawler Simulation Loop
  useEffect(() => {
    if (!isRunning) return;

    const delayMs = speed === 99 ? 30 : speed === 5 ? 200 : speed === 2 ? 650 : 1600;

    const timer = setTimeout(() => {
      // If we haven't started page 1 yet
      if (currentPage === 0) {
        setCurrentPage(1);
        setCurrentStage('listing');
        addLog('info', 'listing', `[Listing Page 1] Fetching GET ${config.baseUrl}?${config.paginationParam}=1 (User-Agent: Chrome/124)`, 200);
        return;
      }

      const activePageData = MOCK_DIRECTORY_PAGES.find((p) => p.pageNumber === currentPage);

      // Check if page exists
      if (!activePageData) {
        setCurrentStage('completed');
        setIsRunning(false);
        addLog('success', 'system', `Reached end of paginated listings (Page ${currentPage} returned 0 results). CSV closed.`);
        return;
      }

      // Step 1: Listing page has just been fetched, discover links
      if (currentStage === 'listing') {
        const profileCount = activePageData.doctors.length;
        addLog('success', 'listing', `[Listing Page ${currentPage}] DOMXPath discovered ${profileCount} doctor profile links.`);
        setCurrentStage('detail');
        setCurrentDoctorIndex(0);
        return;
      }

      // Step 2: Detail profile extraction
      if (currentStage === 'detail') {
        if (currentDoctorIndex < activePageData.doctors.length) {
          const doc = activePageData.doctors[currentDoctorIndex];
          const profileUrl = `${config.baseUrl}/profil/${doc.slug}`;

          addLog('info', 'detail', `Fetching detail profile: ${profileUrl} (HTTP 200 OK)`);

          const newRecord: DoctorRecord = {
            id: doc.id,
            name: doc.name,
            clinicAddress: doc.address,
            phoneNumber: doc.phone,
            emailAddress: doc.email,
            specialty: doc.specialty,
            profileUrl,
            sourcePage: currentPage,
            scrapedAt: new Date().toLocaleTimeString(),
            status: !doc.email || !doc.phone ? 'partial' : 'success'
          };

          setRecords((prev) => [...prev, newRecord]);

          const missingNotes = [];
          if (!doc.phone) missingNotes.push('missing phone');
          if (!doc.email) missingNotes.push('missing email');
          const noteText = missingNotes.length > 0 ? ` (${missingNotes.join(', ')})` : '';

          addLog('success', 'csv', `fputcsv() -> Appended "${doc.name}"${noteText} to ${config.outputFilename}`);
          setCurrentDoctorIndex((prev) => prev + 1);
        } else {
          // Finished all doctors on this page, move to next page
          const nextPg = currentPage + 1;
          if (nextPg > MOCK_DIRECTORY_PAGES.length) {
            setCurrentStage('completed');
            setIsRunning(false);
            addLog('success', 'system', `[Crawl Finished] All pages processed. Total ${records.length + 1} doctor records written.`);
          } else {
            setCurrentPage(nextPg);
            setCurrentStage('listing');
            addLog('info', 'listing', `[Politeness Delay] Sleeping before fetching Listing Page ${nextPg}...`);
          }
        }
      }
    }, delayMs);

    return () => clearTimeout(timer);
  }, [isRunning, currentPage, currentStage, currentDoctorIndex, speed, records.length, config]);

  const handleStart = () => {
    if (currentStage === 'completed') {
      handleReset();
    }
    setIsRunning(true);
    addLog('info', 'system', 'Crawler process started.');
  };

  const handlePause = () => {
    setIsRunning(false);
    addLog('warn', 'system', 'Crawler paused by user.');
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentPage(0);
    setCurrentDoctorIndex(0);
    setCurrentStage('idle');
    setRecords([]);
    setLogs([
      {
        id: `reset-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        level: 'info',
        stage: 'system',
        message: 'Crawler simulation reset. Ready.'
      }
    ]);
  };

  const downloadCsv = () => {
    if (records.length === 0) return;

    const headers = ['Meno lekára', 'Adresa', 'Telefón', 'E-mail', 'Profil URL', 'Dátum extrakcie'];
    const rows = records.map((r) => [
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.clinicAddress.replace(/"/g, '""')}"`,
      `"${r.phoneNumber.replace(/"/g, '""')}"`,
      `"${r.emailAddress.replace(/"/g, '""')}"`,
      `"${r.profileUrl.replace(/"/g, '""')}"`,
      `"${r.scrapedAt}"`
    ]);

    // Optional UTF-8 BOM (\uFEFF) for Excel Central European diacritics
    const bom = config.includeBom ? '\uFEFF' : '';
    const csvContent = bom + [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = config.outputFilename || 'doctors_database.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered records
  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.clinicAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.emailAddress.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterMissing === 'missing-email') return r.emailAddress === '';
    if (filterMissing === 'missing-phone') return r.phoneNumber === '';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Title + Action Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Live Scraper Pipeline Simulation
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1.5">
            <span>Target: Zoznam Lekárov Directory</span>
            <span aria-hidden="true">·</span>
            <span>2-Step Crawler</span>
            <span aria-hidden="true">·</span>
            <span>Real-time CSV Streaming</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Speed Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
            <span className="text-slate-400 px-2 text-[11px]">Speed:</span>
            {[
              { label: '1x', val: 1 },
              { label: '2x', val: 2 },
              { label: '5x', val: 5 },
              { label: 'Max', val: 99 }
            ].map((s) => (
              <button
                key={s.val}
                onClick={() => setSpeed(s.val)}
                className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                  speed === s.val ? 'bg-sky-500 text-slate-950 font-semibold' : 'text-slate-300 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {!isRunning ? (
            <button
              onClick={handleStart}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{currentStage === 'completed' ? 'Restart Scraper' : 'Run Scraper'}</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause</span>
            </button>
          )}

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
            title="Reset Simulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={downloadCsv}
            disabled={records.length === 0}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              records.length > 0
                ? 'bg-sky-400 text-slate-950 hover:bg-sky-300'
                : 'bg-slate-800/60 text-slate-500 cursor-not-allowed border border-slate-800'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV ({records.length})</span>
          </button>
        </div>
      </div>

      {/* Metric Counters Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Pipeline State</div>
          <div className="mt-1 flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isRunning ? 'bg-emerald-400 animate-ping' : currentStage === 'completed' ? 'bg-sky-400' : 'bg-slate-500'
              }`}
            />
            <span className="text-base font-semibold text-white capitalize">
              {currentStage === 'listing' ? `Crawl Page ${currentPage}` : currentStage === 'detail' ? 'Parsing Profiles' : currentStage}
            </span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Doctors Extracted</div>
          <div className="mt-1 text-2xl font-bold font-mono text-white tabular-nums">
            {records.length}
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Data Completeness</div>
          <div className="mt-1 text-xs text-slate-300 space-y-1">
            <div className="flex justify-between font-mono tabular-nums">
              <span className="text-slate-400">Complete:</span>
              <span className="text-emerald-400">{records.filter((r) => r.phoneNumber && r.emailAddress).length}</span>
            </div>
            <div className="flex justify-between font-mono tabular-nums">
              <span className="text-slate-400">Missing Email:</span>
              <span className="text-amber-400">{records.filter((r) => !r.emailAddress).length}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Streaming CSV Destination</div>
          <div className="mt-1 text-xs font-mono text-sky-400 truncate" title={config.outputFilename}>
            {config.outputFilename}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Immediate <code className="text-slate-400">fputcsv()</code> flush
          </div>
        </div>
      </div>

      {/* Main Workspace: Left Log Console + Right Extracted Doctors Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: PHP CLI Console Output */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-[600px]">
          {/* Header bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <Terminal className="w-4 h-4 text-sky-400" />
              <span>PHP CLI Execution Log</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500 tabular-nums">{logs.length} entries</span>
          </div>

          {/* Terminal log messages container */}
          <div className="flex-1 p-3 overflow-y-auto font-mono text-xs space-y-1.5 bg-[#090d14] text-slate-300">
            {logs.map((log) => {
              const levelColor =
                log.level === 'success'
                  ? 'text-emerald-400'
                  : log.level === 'warn'
                  ? 'text-amber-400'
                  : log.level === 'error'
                  ? 'text-rose-400'
                  : 'text-sky-400';

              return (
                <div key={log.id} className="leading-snug break-words">
                  <span className="text-slate-600 select-none">[{log.timestamp}] </span>
                  <span className={`${levelColor} font-semibold`}>
                    [{log.level.toUpperCase()}]{' '}
                  </span>
                  <span className="text-slate-200">{log.message}</span>
                </div>
              );
            })}
            <div ref={logsEndRef} />
          </div>

          {/* Bottom info footer */}
          <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Random delay: {config.minDelay}s–{config.maxDelay}s per request</span>
            <span className="text-slate-400 font-mono">cURL CURLOPT_FOLLOWLOCATION</span>
          </div>
        </div>

        {/* Right Column: Live Streaming Doctors Database Table */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[600px]">
          {/* Table Header toolbar */}
          <div className="p-3 border-b border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search extracted doctors, clinics, phones..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setFilterMissing('all')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  filterMissing === 'all' ? 'bg-slate-800 text-sky-400 font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({records.length})
              </button>
              <button
                onClick={() => setFilterMissing('missing-email')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  filterMissing === 'missing-email' ? 'bg-slate-800 text-amber-400 font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Missing Email ({records.filter((r) => !r.emailAddress).length})
              </button>
              <button
                onClick={() => setFilterMissing('missing-phone')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  filterMissing === 'missing-phone' ? 'bg-slate-800 text-amber-400 font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Missing Phone ({records.filter((r) => !r.phoneNumber).length})
              </button>
            </div>
          </div>

          {/* Table Content */}
          <div className="flex-1 overflow-auto">
            {records.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-center text-slate-400">
                  <Terminal className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-300">No Doctors Scraped Yet</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Click &ldquo;Run Scraper&rdquo; to start the simulated 2-stage crawler and watch the database stream live.
                  </p>
                </div>
                <button
                  onClick={handleStart}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors cursor-pointer"
                >
                  Start Scraper
                </button>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                No doctors match current search or filter.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-950/80 sticky top-0 border-b border-slate-800 text-slate-400 font-medium">
                  <tr>
                    <th className="py-2.5 px-3">Meno lekára</th>
                    <th className="py-2.5 px-3">Adresa kliniky</th>
                    <th className="py-2.5 px-3">Telefón</th>
                    <th className="py-2.5 px-3">E-mail</th>
                    <th className="py-2.5 px-3 text-right">HTML</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredRecords.map((doc) => {
                    return (
                      <tr key={doc.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-2.5 px-3 font-medium text-slate-200">
                          <div>{doc.name}</div>
                          {doc.specialty && (
                            <div className="text-[11px] text-slate-400">{doc.specialty}</div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300 max-w-[180px] truncate" title={doc.clinicAddress}>
                          {doc.clinicAddress}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-300">
                          {doc.phoneNumber ? (
                            <span className="text-slate-200">{doc.phoneNumber}</span>
                          ) : (
                            <span className="text-amber-500 text-[11px] italic font-sans">[N/A &ndash; empty string]</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">
                          {doc.emailAddress ? (
                            <span className="text-sky-400 font-mono text-[11px]">{doc.emailAddress}</span>
                          ) : (
                            <span className="text-amber-500 text-[11px] italic">[N/A &ndash; empty string]</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => {
                              const found = MOCK_DIRECTORY_PAGES.flatMap((p) => p.doctors).find((d) => d.id === doc.id);
                              if (found) setSelectedHtmlPreview(found.htmlSnippet);
                            }}
                            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-sky-400 rounded transition-colors cursor-pointer"
                            title="Inspect Profile HTML"
                          >
                            <Code2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Table footer */}
          <div className="p-3 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing {filteredRecords.length} of {records.length} doctors
            </span>
            <div className="flex items-center gap-3">
              <span className="text-slate-500">Missing fields safely set to &quot;&quot;</span>
            </div>
          </div>
        </div>
      </div>

      {/* HTML Inspection Modal */}
      {selectedHtmlPreview && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <Code2 className="w-4 h-4 text-sky-400" />
                <span>Doctor Detail Page HTML Snippet</span>
              </div>
              <button
                onClick={() => setSelectedHtmlPreview(null)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="p-4 bg-[#090d14] text-slate-300 font-mono text-xs overflow-x-auto max-h-[400px]">
              <pre>{selectedHtmlPreview}</pre>
            </div>
            <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>Parsed using PHP DOMXPath queries</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedHtmlPreview);
                  alert('HTML copied to clipboard!');
                }}
                className="text-sky-400 hover:text-sky-300 text-xs font-medium cursor-pointer"
              >
                Copy HTML Snippet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
