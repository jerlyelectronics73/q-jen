import type { Product, SearchResultItem } from "@/types/database";

/**
 * Normalize rating queries like:
 * - "15 kw" -> "15kw"
 * - "20 HP" -> "20hp"
 * - "18.5 kw / 25 hp" -> "18.5kw 25hp"
 */
export function normalizeSearchQuery(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[/,+_-]+/g, " ")
    .replace(/(\d+(?:\.\d+)?)\s*(kw|hp)\b/gi, "$1$2")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanNumber(n: number): string {
  return Number.isInteger(n) ? String(n) : String(Number(n));
}

function damerauLevenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array<number>(n + 1).fill(0)
  );
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
      if (
        i > 1 &&
        j > 1 &&
        a[i - 1] === b[j - 2] &&
        a[i - 2] === b[j - 1]
      ) {
        dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1);
      }
    }
  }
  return dp[m][n];
}

function tokenFuzzyScore(token: string, haystackTokens: string[]): number {
  let best = 0;
  for (const h of haystackTokens) {
    if (h === token) return 1;
    if (
      (token.length >= 2 && h.startsWith(token)) ||
      (token.length >= 3 && h.includes(token))
    ) {
      best = Math.max(best, 0.85);
      continue;
    }
    const maxLen = Math.max(token.length, h.length);
    if (maxLen >= 3 && Math.min(token.length, h.length) >= 2) {
      const dist = damerauLevenshtein(token, h);
      const sim = 1 - dist / maxLen;
      if (sim >= 0.58) {
        best = Math.max(best, sim * 0.75);
      }
    }
  }
  return best;
}

export function getCoverImage(product: Product): {
  url: string | null;
  alt: string | null;
} {
  const images = product.product_images || [];
  if (images.length === 0) return { url: null, alt: null };
  const sorted = [...images].sort((a, b) => {
    if (a.is_cover !== b.is_cover) return a.is_cover ? -1 : 1;
    return a.sort_order - b.sort_order;
  });
  return {
    url: sorted[0]?.image_url || null,
    alt: sorted[0]?.alt_text || product.name,
  };
}

/**
 * Deterministic ranked search over products:
 * Tier 1 (exact): exact name, model code, or exact kW/HP rating match
 * Tier 2 (partial): substring or multi-token match
 * Tier 3 (fuzzy): Levenshtein / character similarity for typos ("15wk", "qjen", "20ph")
 */
export function rankProductsSearch(
  products: Product[],
  rawQuery: string,
  limit = 30
): SearchResultItem[] {
  const trimmed = rawQuery.trim();
  if (!trimmed) {
    return products.slice(0, limit).map((p) => {
      const cover = getCoverImage(p);
      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        model_code: p.model_code,
        power_kw: p.power_kw,
        power_hp: p.power_hp,
        short_description: p.short_description,
        is_best_seller: p.is_best_seller,
        is_active: p.is_active,
        display_order: p.display_order,
        price: p.price,
        cover_image_url: cover.url,
        cover_image_alt: cover.alt,
        relevance_score: 1,
        match_type: "exact",
      };
    });
  }

  const normQ = normalizeSearchQuery(trimmed);
  const queryTokens = normQ.split(" ").filter(Boolean);
  const rawLower = trimmed.toLowerCase();

  const scored: SearchResultItem[] = [];

  for (const p of products) {
    const kwClean = cleanNumber(p.power_kw);
    const hpClean = cleanNumber(p.power_hp);
    const kwToken = `${kwClean}kw`;
    const hpToken = `${hpClean}hp`;
    const modelLower = (p.model_code || "").toLowerCase();
    const nameLower = p.name.toLowerCase();
    const normName = normalizeSearchQuery(p.name);

    const searchableText = [
      normName,
      modelLower,
      kwToken,
      hpToken,
      kwClean,
      hpClean,
      p.short_description.toLowerCase(),
      ...p.features.map((f) => f.toLowerCase()),
    ]
      .filter(Boolean)
      .join(" ");

    const haystackTokens = Array.from(
      new Set(
        searchableText
          .replace(/[^a-z0-9.]+/g, " ")
          .split(" ")
          .filter(Boolean)
      )
    );

    let score = 0;
    let matchType: "exact" | "partial" | "fuzzy" | null = null;

    // 1. Exact checks
    if (
      nameLower === rawLower ||
      normName === normQ ||
      (modelLower && modelLower === rawLower) ||
      normQ === kwToken ||
      normQ === hpToken ||
      normQ === `${kwToken} ${hpToken}` ||
      normQ === `${hpToken} ${kwToken}`
    ) {
      score = 120;
      matchType = "exact";
    } else if (
      queryTokens.length > 0 &&
      queryTokens.every(
        (t) =>
          t === kwToken ||
          t === hpToken ||
          t === kwClean ||
          t === hpClean ||
          (modelLower && modelLower === t)
      )
    ) {
      score = 105;
      matchType = "exact";
    }

    // 2. Partial substring / multi-token prefix checks
    if (matchType === null) {
      if (
        nameLower.includes(rawLower) ||
        normName.includes(normQ) ||
        (modelLower && modelLower.includes(rawLower))
      ) {
        score = 75;
        matchType = "partial";
      } else if (
        queryTokens.length > 0 &&
        queryTokens.every((t) => searchableText.includes(t))
      ) {
        score = 65;
        matchType = "partial";
      } else {
        // Check if at least one numeric rating matches partially or token-wise
        const partialHits = queryTokens.filter((t) =>
          searchableText.includes(t)
        ).length;
        if (partialHits > 0 && partialHits >= Math.ceil(queryTokens.length / 2)) {
          score = 40 + partialHits * 8;
          matchType = "partial";
        }
      }
    }

    // 3. Fuzzy checks (handles typos like "15wk", "20ph", "qjen", "22kv")
    if (matchType === null && queryTokens.length > 0) {
      const tokenScores = queryTokens.map((t) =>
        tokenFuzzyScore(t, haystackTokens)
      );
      const avg =
        tokenScores.reduce((sum, v) => sum + v, 0) / tokenScores.length;
      const minToken = Math.min(...tokenScores);
      if (avg >= 0.45 && minToken >= 0.25) {
        score = Math.round(avg * 35);
        matchType = "fuzzy";
      }
    }

    if (matchType !== null && score > 0) {
      const cover = getCoverImage(p);
      scored.push({
        id: p.id,
        slug: p.slug,
        name: p.name,
        model_code: p.model_code,
        power_kw: p.power_kw,
        power_hp: p.power_hp,
        short_description: p.short_description,
        is_best_seller: p.is_best_seller,
        is_active: p.is_active,
        display_order: p.display_order,
        price: p.price,
        cover_image_url: cover.url,
        cover_image_alt: cover.alt,
        relevance_score: score,
        match_type: matchType,
      });
    }
  }

  return scored
    .sort((a, b) => {
      if (b.relevance_score !== a.relevance_score) {
        return b.relevance_score - a.relevance_score;
      }
      if (a.display_order !== b.display_order) {
        return a.display_order - b.display_order;
      }
      return a.power_kw - b.power_kw;
    })
    .slice(0, limit);
}

