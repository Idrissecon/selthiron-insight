export interface Transaction {
  date: string;
  description: string;
  amount: number;
  raw: string;
  category?: "reconcilable" | "non-reconcilable" | "external" | "manual";
}

export interface MatchResult {
  bankTx: Transaction | null;
  providerTx: Transaction | null;
  status: "matched" | "unmatched" | "discrepancy";
  amountDiff?: number;
  dateDiff?: number;
}

export interface ReconciliationReport {
  totalBank: number;
  totalProvider: number;
  matched: number;
  unmatched: number;
  discrepancies: number;
  matchRate: number;
  results: MatchResult[];
  reconcilableBank: number;
  reconcilableProvider: number;
}

function parseCSV(text: string): string[][] {
  const lines = text.trim().split(/\r?\n/);
  return lines.map((line) => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  });
}

function parseAmount(value: string): number {
  const cleaned = value.replace(/[^0-9.\-]/g, "");
  const amount = parseFloat(cleaned) || 0;
  // Normalize to absolute value to eliminate sign inconsistencies
  return Math.abs(amount);
}

function normalizeDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toISOString().split("T")[0];
}

function findAmountColumn(headers: string[]): number {
  // Prioritize net_amount over gross_amount for provider files
  const netKeywords = ["net_amount", "net amount", "net-amount"];
  const grossKeywords = ["gross_amount", "gross amount", "gross-amount", "amount", "total", "sum", "value", "price", "debit", "credit"];
  
  const netIdx = headers.findIndex((h) =>
    netKeywords.some((k) => h.toLowerCase().includes(k))
  );
  
  if (netIdx >= 0) return netIdx;
  
  const idx = headers.findIndex((h) =>
    grossKeywords.some((k) => h.toLowerCase().includes(k))
  );
  return idx >= 0 ? idx : headers.length - 1;
}

function findDateColumn(headers: string[]): number {
  const keywords = ["date", "time", "created", "posted"];
  const idx = headers.findIndex((h) =>
    keywords.some((k) => h.toLowerCase().includes(k))
  );
  return idx >= 0 ? idx : 0;
}

function findDescColumn(headers: string[]): number {
  const keywords = ["description", "desc", "memo", "reference", "name", "narrative"];
  const idx = headers.findIndex((h) =>
    keywords.some((k) => h.toLowerCase().includes(k))
  );
  return idx >= 0 ? idx : Math.min(1, headers.length - 1);
}

function findSourceColumn(headers: string[]): number {
  const keywords = ["source", "type", "provider", "gateway"];
  const idx = headers.findIndex((h) =>
    keywords.some((k) => h.toLowerCase().includes(k))
  );
  return idx >= 0 ? idx : -1;
}

function classifyTransaction(description: string, amount: number): "reconcilable" | "non-reconcilable" | "external" | "manual" {
  const descLower = description.toLowerCase();
  
  // Stripe and PayPal transactions are always reconcilable (including payouts and transfers)
  if (descLower.includes("stripe") || descLower.includes("paypal")) {
    return "reconcilable";
  }
  
  // Only true fees are non-reconcilable
  const trueFeeKeywords = ["fee", "charge"];
  if (trueFeeKeywords.some(k => descLower.includes(k))) {
    return "non-reconcilable";
  }
  
  // External/manual: manual entries, corrections
  const manualKeywords = ["manual", "correction", "adjustment", "journal", "entry"];
  if (manualKeywords.some(k => descLower.includes(k))) {
    return "manual";
  }
  
  // Default to reconcilable for normal transactions
  return "reconcilable";
}

export function parseTransactions(csvText: string): Transaction[] {
  const rows = parseCSV(csvText);
  if (rows.length < 2) return [];

  const headers = rows[0];
  const dateCol = findDateColumn(headers);
  const amountCol = findAmountColumn(headers);
  const descCol = findDescColumn(headers);
  const sourceCol = findSourceColumn(headers);

  return rows.slice(1).filter(r => r.length > 1).map((row) => {
    let description = row[descCol] || "";
    
    // Fallback to source column if description is empty
    if (!description.trim() && sourceCol >= 0) {
      description = row[sourceCol] || "";
    }
    
    const amount = parseAmount(row[amountCol] || "0");
    return {
      date: normalizeDate(row[dateCol] || ""),
      description,
      amount,
      raw: row.join(", "),
      category: classifyTransaction(description, amount),
    };
  });
}

export function reconcile(
  bankTxs: Transaction[],
  providerTxs: Transaction[]
): ReconciliationReport {
  // Filter to only reconcilable transactions
  const reconcilableBank = bankTxs.filter(tx => tx.category === "reconcilable");
  const reconcilableProvider = providerTxs.filter(tx => tx.category === "reconcilable");

  const results: MatchResult[] = [];
  const usedProvider = new Set<number>();

  for (const bankTx of reconcilableBank) {
    let bestMatch: { idx: number; tx: Transaction; amountDiff: number; dateDiff: number } | null = null;

    for (let i = 0; i < reconcilableProvider.length; i++) {
      if (usedProvider.has(i)) continue;
      const pTx = reconcilableProvider[i];
      
      const amountDiff = Math.abs(bankTx.amount - pTx.amount);
      const dateDiffMs = Math.abs(
        new Date(bankTx.date).getTime() - new Date(pTx.date).getTime()
      );
      const dateDiffDays = dateDiffMs / (1000 * 60 * 60 * 24);

      // Require BOTH amount tolerance (<0.01) AND date proximity (±3 days)
      if (amountDiff < 0.01 && dateDiffDays <= 3) {
        if (!bestMatch || amountDiff < bestMatch.amountDiff) {
          bestMatch = { idx: i, tx: pTx, amountDiff, dateDiff: dateDiffDays };
        }
      }
    }

    if (bestMatch) {
      usedProvider.add(bestMatch.idx);
      results.push({
        bankTx,
        providerTx: bestMatch.tx,
        status: "matched",
        amountDiff: bestMatch.amountDiff,
        dateDiff: bestMatch.dateDiff,
      });
    } else {
      results.push({ bankTx, providerTx: null, status: "unmatched" });
    }
  }

  // Unmatched provider transactions
  for (let i = 0; i < reconcilableProvider.length; i++) {
    if (!usedProvider.has(i)) {
      results.push({
        bankTx: null as any,
        providerTx: reconcilableProvider[i],
        status: "unmatched",
      });
    }
  }

  const matched = results.filter((r) => r.status === "matched").length;
  const unmatched = results.filter((r) => r.status === "unmatched").length;
  const discrepancies = results.filter((r) => r.status === "discrepancy").length;

  return {
    totalBank: bankTxs.length,
    totalProvider: providerTxs.length,
    matched,
    unmatched,
    discrepancies,
    matchRate: results.length > 0 ? (matched / results.length) * 100 : 0,
    results,
    reconcilableBank: reconcilableBank.length,
    reconcilableProvider: reconcilableProvider.length,
  };
}
