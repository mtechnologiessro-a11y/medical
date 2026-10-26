import React, { useState, useEffect } from 'react';
import { SearchCode, Play, Sparkles, Check, AlertCircle, Copy, CheckCircle2 } from 'lucide-react';
import { ScraperConfig } from '../types';

interface XPathInspectorProps {
  config: ScraperConfig;
  setConfig: React.Dispatch<React.SetStateAction<ScraperConfig>>;
}

const SAMPLE_HTML_PRESETS = [
  {
    name: 'Standard Card (Complete Info)',
    html: `<article class="doctor-profile-card">
  <h1 class="doctor-name" itemprop="name">MUDr. Ján Kováč, PhD.</h1>
  <div class="doctor-specialty">Kardiológia</div>
  <div class="clinic-address-box">
    <span class="label">Adresa:</span>
    <span class="address" itemprop="streetAddress">Staré Grunty 56, 841 04 Bratislava</span>
  </div>
  <div class="contact-row">
    <span class="label">Telefón:</span>
    <a href="tel:+421268234111" class="doctor-phone">+421 2 6823 4111</a>
  </div>
  <div class="contact-row">
    <span class="label">E-mail:</span>
    <a href="mailto:kovac.kardio@poliklinika-md.sk" class="doctor-email">kovac.kardio@poliklinika-md.sk</a>
  </div>
</article>`
  },
  {
    name: 'Missing Email (Common Edge Case)',
    html: `<article class="doctor-profile-card">
  <h1 class="doctor-name" itemprop="name">MDDr. Peter Balog, MPH</h1>
  <div class="doctor-specialty">Zubné lekárstvo</div>
  <div class="clinic-address-box">
    <span class="label">Adresa:</span>
    <span class="address">Hlavná 42, 040 01 Košice</span>
  </div>
  <div class="contact-row">
    <span class="label">Telefón:</span>
    <a href="tel:+421556221845" class="doctor-phone">+421 55 622 1845</a>
  </div>
  <!-- No email provided by clinic -->
  <div class="notice-muted">E-mailová adresa nie je verejná</div>
</article>`
  },
  {
    name: 'Alternative Portal Layout (Table Structure)',
    html: `<div class="doctor-detail-container">
  <h2 class="title-primary">MUDr. Elena Nováková</h2>
  <table class="info-table">
    <tr>
      <th>Pracovisko:</th>
      <td class="clinic-address">Bezručova 5, 811 09 Bratislava</td>
    </tr>
    <tr>
      <th>Mobilný kontakt:</th>
      <td><a href="tel:+421905442819" class="phone-link">+421 905 442 819</a></td>
    </tr>
    <tr>
      <th>Elektronická pošta:</th>
      <td><a href="mailto:dr.novakova@pediatriaba.sk" class="mail-link">dr.novakova@pediatriaba.sk</a></td>
    </tr>
  </table>
</div>`
  }
];

export const XPathInspector: React.FC<XPathInspectorProps> = ({ config, setConfig }) => {
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [htmlCode, setHtmlCode] = useState(SAMPLE_HTML_PRESETS[0].html);

  // Test queries
  const [nameXpath, setNameXpath] = useState("//h1[contains(@class, 'doctor-name') or @itemprop='name'] | //h1 | //h2");
  const [addressXpath, setAddressXpath] = useState("//*[@itemprop='streetAddress' or contains(@class, 'address') or contains(@class, 'clinic-address')]");
  const [phoneXpath, setPhoneXpath] = useState("//a[starts-with(@href, 'tel:')]/@href | //*[contains(@class, 'doctor-phone') or contains(@class, 'phone')]");
  const [emailXpath, setEmailXpath] = useState("//a[starts-with(@href, 'mailto:')]/@href | //*[contains(@class, 'doctor-email') or contains(@class, 'mail')]");

  // Extracted values
  const [extractedValues, setExtractedValues] = useState<{
    name: string;
    address: string;
    phone: string;
    email: string;
    errors: Record<string, string>;
  }>({
    name: '',
    address: '',
    phone: '',
    email: '',
    errors: {}
  });

  const evaluateXPathInHtml = (html: string, query: string): { value: string; error?: string } => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const result = doc.evaluate(query, doc, null, XPathResult.ANY_TYPE, null);

      let node = result.iterateNext();
      if (!node) {
        return { value: '' }; // Clean empty string
      }

      let text = node.nodeValue ?? node.textContent ?? '';
      text = text.replace(/\s+/g, ' ').trim();

      // Clean protocol prefixes
      if (text.startsWith('tel:')) text = text.substring(4).trim();
      if (text.startsWith('mailto:')) {
        text = text.substring(7).trim();
        if (text.includes('?')) text = text.substring(0, text.indexOf('?'));
      }

      return { value: text };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { value: '', error: msg };
    }
  };

  useEffect(() => {
    const nameRes = evaluateXPathInHtml(htmlCode, nameXpath);
    const addressRes = evaluateXPathInHtml(htmlCode, addressXpath);
    const phoneRes = evaluateXPathInHtml(htmlCode, phoneXpath);
    const emailRes = evaluateXPathInHtml(htmlCode, emailXpath);

    const errors: Record<string, string> = {};
    if (nameRes.error) errors.name = nameRes.error;
    if (addressRes.error) errors.address = addressRes.error;
    if (phoneRes.error) errors.phone = phoneRes.error;
    if (emailRes.error) errors.email = emailRes.error;

    setExtractedValues({
      name: nameRes.value,
      address: addressRes.value,
      phone: phoneRes.value,
      email: emailRes.value,
      errors
    });
  }, [htmlCode, nameXpath, addressXpath, phoneXpath, emailXpath]);

  const applyToScraperConfig = () => {
    setConfig((prev) => ({
      ...prev,
      selectors: {
        ...prev.selectors,
        doctorName: nameXpath,
        clinicAddress: addressXpath,
        phoneNumber: phoneXpath,
        emailAddress: emailXpath
      }
    }));
    alert('Selectors applied to PHP scraper code generator!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            DOMXPath Query Inspector & Sandbox
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1.5">
            <span>Test Real-Time Extraction</span>
            <span aria-hidden="true">·</span>
            <span>DOMDocument Compatibility</span>
            <span aria-hidden="true">·</span>
            <span>Empty String Fallback Verification</span>
          </div>
        </div>

        <button
          onClick={applyToScraperConfig}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors cursor-pointer self-start md:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Apply Selectors to PHP Script</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: HTML Source & Presets */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200">Select Sample HTML Profile</label>
              <span className="text-[11px] text-slate-400">or edit HTML below</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {SAMPLE_HTML_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedPreset(idx);
                    setHtmlCode(p.html);
                  }}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${
                    selectedPreset === idx
                      ? 'bg-sky-500/10 border-sky-500/40 text-sky-400 font-medium'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span>Doctor Detail Page HTML</span>
                <span className="text-[11px] font-mono text-slate-500">HTML5 DOM</span>
              </div>
              <textarea
                value={htmlCode}
                onChange={(e) => setHtmlCode(e.target.value)}
                rows={14}
                className="w-full bg-[#090d14] border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500 leading-relaxed resize-y"
              />
            </div>
          </div>

          {/* Useful XPath Cheat Sheet */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 text-xs space-y-2">
            <div className="font-semibold text-slate-200">PHP DOMXPath Scraping Recipes:</div>
            <div className="space-y-1.5 text-slate-400 font-mono text-[11px]">
              <div>
                <span className="text-sky-400">//a[starts-with(@href, &apos;tel:&apos;)]/@href</span>
                <span className="text-slate-500 font-sans ml-2">&ndash; Extracts phone directly from tel: attribute</span>
              </div>
              <div>
                <span className="text-sky-400">//a[starts-with(@href, &apos;mailto:&apos;)]/@href</span>
                <span className="text-slate-500 font-sans ml-2">&ndash; Extracts email link attribute</span>
              </div>
              <div>
                <span className="text-sky-400">//*[@itemprop=&apos;streetAddress&apos;]</span>
                <span className="text-slate-500 font-sans ml-2">&ndash; Schema.org standard clinic microdata</span>
              </div>
              <div>
                <span className="text-sky-400">//h1 | //h2[contains(@class, &apos;name&apos;)]</span>
                <span className="text-slate-500 font-sans ml-2">&ndash; Union fallback expression</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: XPath Query Inputs & Live Results */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-5">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <SearchCode className="w-4 h-4 text-sky-400" />
                <span>Live XPath Extractor</span>
              </div>
              <span className="text-xs text-slate-400">Evaluates in real-time</span>
            </div>

            {/* 1. Doctor Name */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-medium text-slate-200">1. Doctor&apos;s Name (Meno lekára)</label>
                {extractedValues.errors.name && (
                  <span className="text-rose-400 text-[11px]">XPath syntax error</span>
                )}
              </div>
              <input
                type="text"
                value={nameXpath}
                onChange={(e) => setNameXpath(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
              />
              <div className="p-2.5 bg-slate-950/70 border border-slate-800/80 rounded-lg flex items-center justify-between text-xs">
                <span className="text-slate-400">Result:</span>
                <span className="font-semibold text-slate-100">
                  {extractedValues.name || <span className="text-amber-500 italic">&quot;&quot; (empty string)</span>}
                </span>
              </div>
            </div>

            {/* 2. Clinic Address */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-medium text-slate-200">2. Clinic Address (Adresa)</label>
                {extractedValues.errors.address && (
                  <span className="text-rose-400 text-[11px]">XPath syntax error</span>
                )}
              </div>
              <input
                type="text"
                value={addressXpath}
                onChange={(e) => setAddressXpath(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
              />
              <div className="p-2.5 bg-slate-950/70 border border-slate-800/80 rounded-lg flex items-center justify-between text-xs">
                <span className="text-slate-400">Result:</span>
                <span className="font-semibold text-slate-100">
                  {extractedValues.address || <span className="text-amber-500 italic">&quot;&quot; (empty string)</span>}
                </span>
              </div>
            </div>

            {/* 3. Phone Number */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-medium text-slate-200">3. Phone Number (Telefón)</label>
                {extractedValues.errors.phone && (
                  <span className="text-rose-400 text-[11px]">XPath syntax error</span>
                )}
              </div>
              <input
                type="text"
                value={phoneXpath}
                onChange={(e) => setPhoneXpath(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
              />
              <div className="p-2.5 bg-slate-950/70 border border-slate-800/80 rounded-lg flex items-center justify-between text-xs">
                <span className="text-slate-400">Result:</span>
                <span className="font-semibold text-slate-100 font-mono">
                  {extractedValues.phone || <span className="text-amber-500 italic font-sans">&quot;&quot; (empty string)</span>}
                </span>
              </div>
            </div>

            {/* 4. Email Address */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-medium text-slate-200">4. Email Address (E-mail)</label>
                {extractedValues.errors.email && (
                  <span className="text-rose-400 text-[11px]">XPath syntax error</span>
                )}
              </div>
              <input
                type="text"
                value={emailXpath}
                onChange={(e) => setEmailXpath(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
              />
              <div className="p-2.5 bg-slate-950/70 border border-slate-800/80 rounded-lg flex items-center justify-between text-xs">
                <span className="text-slate-400">Result:</span>
                <span className="font-semibold text-sky-400 font-mono">
                  {extractedValues.email || <span className="text-amber-500 italic font-sans">&quot;&quot; (empty string)</span>}
                </span>
              </div>
            </div>

            {/* Extracted Record Preview for CSV */}
            <div className="pt-3 border-t border-slate-800">
              <div className="text-xs font-semibold text-slate-300 mb-2">Resulting CSV Row:</div>
              <div className="bg-[#090d14] border border-slate-800 rounded-lg p-3 font-mono text-xs text-emerald-400 overflow-x-auto whitespace-pre">
                {`fputcsv($fp, [
  "${extractedValues.name}",
  "${extractedValues.address}",
  "${extractedValues.phone}",
  "${extractedValues.email}"
]);`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
