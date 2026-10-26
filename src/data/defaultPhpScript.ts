import { ScraperConfig } from '../types';

export const DEFAULT_CONFIG: ScraperConfig = {
  baseUrl: 'https://www.example-healthcare-portal.sk/lekari',
  paginationParam: 'page',
  maxPages: 50,
  minDelay: 1,
  maxDelay: 3,
  timeout: 15,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  outputFilename: 'doctors_database.csv',
  includeBom: true,
  selectors: {
    doctorLinks: "//a[contains(@class, 'doctor-link') or contains(@href, '/lekar/') or contains(@class, 'profile-link')]/@href",
    doctorName: "//h1[contains(@class, 'doctor-name') or @itemprop='name'] | //h1",
    clinicAddress: "//*[@itemprop='streetAddress' or contains(@class, 'address') or contains(@class, 'clinic-address')]",
    phoneNumber: "//a[starts-with(@href, 'tel:')]/@href | //*[contains(@class, 'doctor-phone') or contains(@class, 'phone')]",
    emailAddress: "//a[starts-with(@href, 'mailto:')]/@href | //*[contains(@class, 'doctor-email') or contains(@class, 'email')]"
  }
};

export function generatePhpCode(config: ScraperConfig = DEFAULT_CONFIG): string {
  return `<?php
/**
 * ============================================================================
 * Production Doctor Directory Web Scraper & Contact Data Extractor
 * ============================================================================
 * 
 * Requirements Met:
 * 1. Uses PHP's built-in cURL for HTTP requests.
 * 2. Uses DOMDocument and DOMXPath for robust HTML parsing (no external heavy frameworks).
 * 3. Handles automatic multi-page pagination (?${config.paginationParam}=X) until no results remain.
 * 4. Two-step extraction architecture:
 *      Step 1 -> Collects profile URLs from each paginated listing.
 *      Step 2 -> Fetches detail profiles and parses Name, Address, Phone, and Email.
 * 5. Missing values safely default to empty strings ("").
 * 6. Immediate streaming CSV export via fputcsv() with UTF-8 BOM for Excel support.
 * 7. Rate limiting (politeness delay: ${config.minDelay}-${config.maxDelay}s) to prevent IP bans.
 * 8. Resilient error handling for timeouts, 404s, and SSL without crashing.
 *
 * @version 1.2.0
 * @author  Senior Web Scraping Engineer
 * @license MIT
 */

declare(strict_types=1);

// Ensure CLI execution or web script run without timing out
set_time_limit(0);
ini_set('memory_limit', '512M');

class DoctorDirectoryScraper
{
    private string $baseUrl;
    private string $paginationParam;
    private int $maxPages;
    private int $minDelay;
    private int $maxDelay;
    private int $timeout;
    private string $userAgent;
    private string $csvFile;
    private bool $includeBom;

    /** @var resource|null CSV file handle */
    private $csvHandle = null;

    /** @var resource|null Reusable cURL multi/single handle */
    private $curlHandle = null;

    /** @var array<string, bool> Visited profile URLs cache to prevent duplicates */
    private array $visitedUrls = [];

    /** Statistics counters */
    private int $totalPagesScraped = 0;
    private int $totalProfilesExtracted = 0;
    private int $failedRequests = 0;

    public function __construct(
        string $baseUrl = '${config.baseUrl}',
        string $paginationParam = '${config.paginationParam}',
        int $maxPages = ${config.maxPages},
        int $minDelay = ${config.minDelay},
        int $maxDelay = ${config.maxDelay},
        int $timeout = ${config.timeout},
        string $userAgent = '${config.userAgent}',
        string $csvFile = '${config.outputFilename}',
        bool $includeBom = ${config.includeBom ? 'true' : 'false'}
    ) {
        $this->baseUrl = rtrim($baseUrl, '/');
        $this->paginationParam = $paginationParam;
        $this->maxPages = $maxPages;
        $this->minDelay = $minDelay;
        $this->maxDelay = $maxDelay;
        $this->timeout = $timeout;
        $this->userAgent = $userAgent;
        $this->csvFile = $csvFile;
        $this->includeBom = $includeBom;

        $this->initCsv();
        $this->initCurl();
    }

    public function __destruct()
    {
        if (is_resource($this->csvHandle)) {
            fclose($this->csvHandle);
        }
        if (is_resource($this->curlHandle)) {
            curl_close($this->curlHandle);
        }
    }

    /**
     * Initializes CSV output file and writes UTF-8 BOM and column headers.
     */
    private function initCsv(): void
    {
        $this->csvHandle = fopen($this->csvFile, 'w');
        if ($this->csvHandle === false) {
            throw new RuntimeException("Cannot open CSV file for writing: {$this->csvFile}");
        }

        // Write UTF-8 BOM for seamless Microsoft Excel rendering of accented characters (á, č, ď, é, etc.)
        if ($this->includeBom) {
            fwrite($this->csvHandle, "\\xEF\\xBB\\xBF");
        }

        // Header row: Doctor's Name, Clinic Address, Phone Number, Email Address, Profile URL
        fputcsv($this->csvHandle, [
            'Meno lekára',
            'Adresa',
            'Telefón',
            'E-mail',
            'Profil URL',
            'Dátum extrakcie'
        ]);

        fflush($this->csvHandle);
        $this->log("Initialized CSV file: {$this->csvFile} with headers.");
    }

    /**
     * Prepares reusable cURL session with browser headers.
     */
    private function initCurl(): void
    {
        $this->curlHandle = curl_init();
        if ($this->curlHandle === false) {
            throw new RuntimeException("Failed to initialize cURL.");
        }
    }

    /**
     * Main crawl routine.
     */
    public function run(): void
    {
        $this->log("=================================================");
        $this->log("Starting Doctor Directory Scraper");
        $this->log("Target Base URL: {$this->baseUrl}");
        $this->log("Output CSV: {$this->csvFile}");
        $this->log("=================================================");

        $page = 1;

        while ($page <= $this->maxPages) {
            $listingUrl = $this->buildListingUrl($page);
            $this->log("[Listing Page {$page}] Fetching: {$listingUrl}");

            $html = $this->fetchHtml($listingUrl);

            if ($html === null) {
                $this->log("[Listing Page {$page}] Failed to fetch listing page or received non-200. Halting pagination.", 'WARN');
                break;
            }

            // Step 1: Extract individual profile links from this listing page
            $profileLinks = $this->extractProfileUrls($html, $listingUrl);

            if (empty($profileLinks)) {
                $this->log("[Listing Page {$page}] No doctor profile links found. Pagination concluded.", 'SUCCESS');
                break;
            }

            $this->log("[Listing Page {$page}] Discovered " . count($profileLinks) . " doctor profile URLs.");
            $this->totalPagesScraped++;

            // Step 2: Iterate over each doctor detail page
            foreach ($profileLinks as $index => $profileUrl) {
                if (isset($this->visitedUrls[$profileUrl])) {
                    continue; // Skip duplicates
                }
                $this->visitedUrls[$profileUrl] = true;

                $profileIndex = $index + 1;
                $this->log("  -> [Profile {$profileIndex}/" . count($profileLinks) . "] Scraping: {$profileUrl}");

                // Politeness delay before requesting detail page
                $this->politenessDelay();

                $doctorData = $this->scrapeDoctorProfile($profileUrl);

                if ($doctorData !== null) {
                    // Append immediately to CSV using fputcsv()
                    fputcsv($this->csvHandle, [
                        $doctorData['name'],
                        $doctorData['address'],
                        $doctorData['phone'],
                        $doctorData['email'],
                        $profileUrl,
                        date('Y-m-d H:i:s')
                    ]);
                    fflush($this->csvHandle); // Ensure write to disk immediately

                    $this->totalProfilesExtracted++;
                    $this->log("     Extracted: {$doctorData['name']} | Tel: " . ($doctorData['phone'] ?: '[N/A]') . " | Mail: " . ($doctorData['email'] ?: '[N/A]'), 'OK');
                } else {
                    $this->log("     Skipping profile due to fetch/parsing error.", 'WARN');
                }
            }

            // Politeness delay before fetching next listing page
            $this->politenessDelay();
            $page++;
        }

        $this->log("=================================================");
        $this->log("Scraping Completed Successfully!");
        $this->log("Total Listing Pages Visited: {$this->totalPagesScraped}");
        $this->log("Total Doctor Profiles Saved: {$this->totalProfilesExtracted}");
        $this->log("Failed Requests Encountered: {$this->failedRequests}");
        $this->log("Results written to: " . realpath($this->csvFile));
        $this->log("=================================================");
    }

    /**
     * Builds paginated listing URL.
     */
    private function buildListingUrl(int $page): string
    {
        $separator = (strpos($this->baseUrl, '?') === false) ? '?' : '&';
        return "{$this->baseUrl}{$separator}{$this->paginationParam}={$page}";
    }

    /**
     * Performs robust cURL GET request with headers, redirects, and timeout handling.
     */
    private function fetchHtml(string $url): ?string
    {
        $headers = [
            'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language: sk-SK,sk;q=0.9,cs;q=0.8,en-US;q=0.7,en;q=0.6',
            'Cache-Control: no-cache',
            'Connection: keep-alive',
            'Upgrade-Insecure-Requests: 1'
        ];

        curl_setopt_array($this->curlHandle, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 5,
            CURLOPT_TIMEOUT => $this->timeout,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_USERAGENT => $this->userAgent,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
            CURLOPT_ENCODING => 'gzip, deflate',
            CURLOPT_AUTOREFERER => true,
        ]);

        $response = curl_exec($this->curlHandle);
        $httpCode = curl_getinfo($this->curlHandle, CURLINFO_HTTP_CODE);

        if ($response === false) {
            $errorMsg = curl_error($this->curlHandle);
            $this->log("cURL Error for [{$url}]: {$errorMsg}", 'ERROR');
            $this->failedRequests++;
            return null;
        }

        if ($httpCode === 404) {
            $this->log("HTTP 404 Not Found at [{$url}]. Reached end of directory.", 'WARN');
            return null;
        }

        if ($httpCode === 429) {
            $this->log("HTTP 429 Too Many Requests! Target server rate limited us. Sleeping for 10s...", 'WARN');
            sleep(10);
            return null;
        }

        if ($httpCode < 200 || $httpCode >= 300) {
            $this->log("HTTP {$httpCode} returned for [{$url}]. Skipping.", 'WARN');
            $this->failedRequests++;
            return null;
        }

        return (string) $response;
    }

    /**
     * Step 1: Extracts doctor profile URLs from listing HTML using DOMXPath.
     *
     * @return list<string> Array of absolute profile URLs
     */
    private function extractProfileUrls(string $html, string $currentUrl): array
    {
        $xpath = $this->createXPath($html);
        if ($xpath === null) {
            return [];
        }

        // Queries profile links. Adjust selector according to the target portal.
        $query = "${config.selectors.doctorLinks}";
        $nodes = $xpath->query($query);

        if ($nodes === false || $nodes->length === 0) {
            // Fallback generic heuristic: any anchor containing '/lekar/' or '/doctor/'
            $nodes = $xpath->query("//a[contains(@href, '/lekar') or contains(@href, '/profil/') or contains(@href, '/doctor')]/@href");
        }

        $urls = [];
        if ($nodes !== false) {
            foreach ($nodes as $node) {
                $rawHref = trim($node->nodeValue ?? '');
                if ($rawHref === '' || str_starts_with($rawHref, '#') || str_starts_with($rawHref, 'javascript:')) {
                    continue;
                }

                $absoluteUrl = $this->resolveAbsoluteUrl($rawHref, $currentUrl);
                if ($absoluteUrl !== null && !in_array($absoluteUrl, $urls, true)) {
                    $urls[] = $absoluteUrl;
                }
            }
        }

        return $urls;
    }

    /**
     * Step 2: Fetches and parses a single doctor detail page.
     *
     * @return array{name: string, address: string, phone: string, email: string}|null
     */
    private function scrapeDoctorProfile(string $profileUrl): ?array
    {
        $html = $this->fetchHtml($profileUrl);
        if ($html === null) {
            return null;
        }

        $xpath = $this->createXPath($html);
        if ($xpath === null) {
            return null;
        }

        // 1. Doctor's Name (Meno lekára)
        $name = $this->extractCleanText($xpath, [
            "${config.selectors.doctorName}",
            "//h1[@itemprop='name']",
            "//h1[contains(@class, 'doctor-name') or contains(@class, 'meno')]",
            "//h1"
        ]);

        // 2. Clinic Address (Adresa)
        $address = $this->extractCleanText($xpath, [
            "${config.selectors.clinicAddress}",
            "//*[@itemprop='streetAddress']",
            "//*[contains(@class, 'clinic-address') or contains(@class, 'adresa')]",
            "//address",
            "//div[contains(text(), 'Adresa')]/following-sibling::div[1]"
        ]);

        // 3. Phone Number (Telefón)
        $phone = $this->extractAttributeOrText($xpath, [
            "//a[starts-with(@href, 'tel:')]/@href",
            "${config.selectors.phoneNumber}",
            "//*[contains(@class, 'phone') or contains(@class, 'telefon')]"
        ]);
        $phone = $this->cleanPhoneNumber($phone);

        // 4. Email Address (E-mail)
        $email = $this->extractAttributeOrText($xpath, [
            "//a[starts-with(@href, 'mailto:')]/@href",
            "${config.selectors.emailAddress}",
            "//*[contains(@class, 'email') or contains(@class, 'e-mail')]"
        ]);
        $email = $this->cleanEmailAddress($email);

        // Return structured record. Missing fields default to empty string ("")
        return [
            'name'    => $name,
            'address' => $address,
            'phone'   => $phone,
            'email'   => $email,
        ];
    }

    /**
     * Builds DOMXPath instance with suppression of HTML5 warnings.
     */
    private function createXPath(string $html): ?DOMXPath
    {
        if (trim($html) === '') {
            return null;
        }

        // Suppress libxml warnings caused by modern HTML5 custom elements or unclosed tags
        $previousLibxmlUseErrors = libxml_use_internal_errors(true);

        $doc = new DOMDocument('1.0', 'UTF-8');

        // Inject UTF-8 meta tag so DOMDocument handles Central European diacritics correctly
        $htmlWithUtf8 = '<?xml encoding="UTF-8">' . $html;
        @$doc->loadHTML($htmlWithUtf8, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);

        libxml_clear_errors();
        libxml_use_internal_errors($previousLibxmlUseErrors);

        return new DOMXPath($doc);
    }

    /**
     * Tries a list of XPath queries in priority order and returns trimmed text.
     */
    private function extractCleanText(DOMXPath $xpath, array $queries): string
    {
        foreach ($queries as $query) {
            $nodes = $xpath->query($query);
            if ($nodes !== false && $nodes->length > 0) {
                $node = $nodes->item(0);
                if ($node !== null) {
                    $text = $this->normalizeWhitespace($node->textContent ?? '');
                    if ($text !== '') {
                        return $text;
                    }
                }
            }
        }
        return '';
    }

    /**
     * Extracts text or attribute value (e.g. href="tel:+421...") from queries.
     */
    private function extractAttributeOrText(DOMXPath $xpath, array $queries): string
    {
        foreach ($queries as $query) {
            $nodes = $xpath->query($query);
            if ($nodes !== false && $nodes->length > 0) {
                $node = $nodes->item(0);
                if ($node !== null) {
                    $value = $node->nodeValue ?? $node->textContent ?? '';
                    $cleaned = $this->normalizeWhitespace($value);
                    if ($cleaned !== '') {
                        return $cleaned;
                    }
                }
            }
        }
        return '';
    }

    /**
     * Cleans phone strings: strips 'tel:' protocol, trims excess characters.
     */
    private function cleanPhoneNumber(string $raw): string
    {
        if (str_starts_with($raw, 'tel:')) {
            $raw = substr($raw, 4);
        }
        $raw = trim($raw);
        // Replace multiple whitespace/dashes with single space
        return preg_replace('/\\s+/', ' ', $raw) ?? '';
    }

    /**
     * Cleans email strings: strips 'mailto:' protocol, trims URL query params.
     */
    private function cleanEmailAddress(string $raw): string
    {
        if (str_starts_with($raw, 'mailto:')) {
            $raw = substr($raw, 7);
        }
        // If mailto contains ?subject=..., strip it
        if (($pos = strpos($raw, '?')) !== false) {
            $raw = substr($raw, 0, $pos);
        }
        $raw = trim($raw);
        return filter_var($raw, FILTER_VALIDATE_EMAIL) ? $raw : $raw;
    }

    /**
     * Normalizes inner whitespace, strips non-breaking spaces and linebreaks.
     */
    private function normalizeWhitespace(string $string): string
    {
        // Replace non-breaking spaces (\\u00A0) and tabs/newlines
        $clean = str_replace(["\\xC2\\xA0", "\\t", "\\r", "\\n"], ' ', $string);
        $clean = preg_replace('/\\s+/', ' ', $clean) ?? '';
        return trim($clean);
    }

    /**
     * Converts relative links (e.g. "/lekar/jan-kovac") to absolute URLs.
     */
    private function resolveAbsoluteUrl(string $relativeUrl, string $baseUrl): ?string
    {
        if (parse_url($relativeUrl, PHP_URL_SCHEME) !== null) {
            return $relativeUrl; // Already absolute
        }

        $parts = parse_url($baseUrl);
        if ($parts === false || !isset($parts['host'])) {
            return null;
        }

        $scheme = $parts['scheme'] ?? 'https';
        $host = $parts['host'];
        $port = isset($parts['port']) ? ':' . $parts['port'] : '';

        if (str_starts_with($relativeUrl, '/')) {
            return "{$scheme}://{$host}{$port}{$relativeUrl}";
        }

        $basePath = isset($parts['path']) ? dirname($parts['path']) : '/';
        $basePath = rtrim($basePath, '/');
        return "{$scheme}://{$host}{$port}{$basePath}/{$relativeUrl}";
    }

    /**
     * Enforces polite rate limiting with randomized sleep.
     */
    private function politenessDelay(): void
    {
        $seconds = rand($this->minDelay, $this->maxDelay);
        $this->log("     [Politeness Delay] Sleeping for {$seconds}s...");
        sleep($seconds);
    }

    /**
     * Formatted console logger with timestamps and ANSI colors (CLI only).
     */
    private function log(string $message, string $level = 'INFO'): void
    {
        $timestamp = date('H:i:s');
        $color = match ($level) {
            'SUCCESS', 'OK' => "\\033[32m", // Green
            'WARN'          => "\\033[33m", // Yellow
            'ERROR'         => "\\033[31m", // Red
            default         => "\\033[0m",  // Default
        };
        $reset = "\\033[0m";

        if (php_sapi_name() === 'cli') {
            echo "[{$timestamp}] {$color}[{$level}]{$reset} {$message}" . PHP_EOL;
        } else {
            echo htmlspecialchars("[{$timestamp}] [{$level}] {$message}") . "<br>\n";
            flush();
        }
    }
}

// ============================================================================
// CLI Entry Point
// ============================================================================
if (php_sapi_name() === 'cli') {
    // Parse optional CLI options: --url=..., --max-pages=..., --delay-min=...
    $options = getopt('', ['url::', 'pages::', 'min-delay::', 'max-delay::', 'output::']);

    $url = $options['url'] ?? '${config.baseUrl}';
    $pages = isset($options['pages']) ? (int) $options['pages'] : ${config.maxPages};
    $minDelay = isset($options['min-delay']) ? (int) $options['min-delay'] : ${config.minDelay};
    $maxDelay = isset($options['max-delay']) ? (int) $options['max-delay'] : ${config.maxDelay};
    $output = $options['output'] ?? '${config.outputFilename}';

    $scraper = new DoctorDirectoryScraper(
        baseUrl: $url,
        maxPages: $pages,
        minDelay: $minDelay,
        maxDelay: $maxDelay,
        csvFile: $output
    );

    try {
        $scraper->run();
    } catch (Throwable $e) {
        fwrite(STDERR, "Fatal Scraper Error: " . $e->getMessage() . PHP_EOL);
        exit(1);
    }
}
`;
}
