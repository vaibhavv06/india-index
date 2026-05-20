export type Tone = "good" | "warn" | "bad" | "neutral";

export type Category =
  | "economy"
  | "human-development"
  | "health"
  | "environment"
  | "freedom"
  | "hunger"
  | "innovation"
  | "happiness";

export const CATEGORIES: { id: Category; label: string; emoji: string; blurb: string }[] = [
  { id: "economy", label: "Economy", emoji: "💰", blurb: "Growth, jobs, and the cost of living" },
  { id: "human-development", label: "Human Development", emoji: "📚", blurb: "Education, equality, opportunity" },
  { id: "health", label: "Health", emoji: "🩺", blurb: "Life, death, and what's in between" },
  { id: "environment", label: "Environment", emoji: "🌍", blurb: "Air, water, climate, biodiversity" },
  { id: "freedom", label: "Freedom & Governance", emoji: "⚖️", blurb: "Speech, democracy, corruption" },
  { id: "hunger", label: "Hunger & Poverty", emoji: "🍚", blurb: "What it takes to feed a billion" },
  { id: "innovation", label: "Innovation & Tech", emoji: "🚀", blurb: "Research, internet, knowledge economy" },
  { id: "happiness", label: "Happiness & Society", emoji: "😊", blurb: "How Indians feel about their lives" },
];

/**
 * One row = one live data series. Source is either:
 *   wb: World Bank indicator code → fetched from api.worldbank.org
 *   owid: Our World in Data grapher slug → CSV fetched from ourworldindata.org/grapher
 */
export type IndexSpec = {
  slug: string;
  category: Category;
  name: string;
  emoji: string;
  description: string;
  source: { name: string; url: string };
  unit?: string;
  /** When true, lower values are better (e.g. corruption rank, infant mortality) */
  invert?: boolean;
  /** Hook copy shown in concerning callouts when India ranks poorly */
  concerningWhen?: { thresholdPct: number; copy: string };
  fetcher:
    | { kind: "wb"; indicator: string }
    | { kind: "owid"; slug: string };
};

export const INDICES: IndexSpec[] = [
  // ============ ECONOMY ============
  {
    slug: "gdp-per-capita",
    category: "economy",
    name: "GDP per Capita",
    emoji: "💵",
    description:
      "Total economic output divided by population. India is the world's 5th largest economy in absolute terms but ranks ~140th per person.",
    source: { name: "World Bank", url: "https://data.worldbank.org/indicator/NY.GDP.PCAP.CD?locations=IN" },
    unit: "USD",
    fetcher: { kind: "wb", indicator: "NY.GDP.PCAP.CD" },
  },
  {
    slug: "unemployment",
    category: "economy",
    name: "Unemployment Rate",
    emoji: "🧑‍💼",
    description: "Share of the labour force that is jobless and actively seeking work. Youth unemployment is far higher.",
    source: { name: "World Bank / ILO", url: "https://data.worldbank.org/indicator/SL.UEM.TOTL.ZS?locations=IN" },
    unit: "%",
    invert: true,
    fetcher: { kind: "wb", indicator: "SL.UEM.TOTL.ZS" },
  },
  {
    slug: "gini",
    category: "economy",
    name: "Income Inequality (Gini)",
    emoji: "⚖️",
    description: "0 = perfect equality, 100 = perfect inequality. India's top 1% own ~40% of national wealth.",
    source: { name: "World Bank", url: "https://data.worldbank.org/indicator/SI.POV.GINI?locations=IN" },
    invert: true,
    fetcher: { kind: "wb", indicator: "SI.POV.GINI" },
  },
  {
    slug: "inflation",
    category: "economy",
    name: "Inflation (Consumer Prices)",
    emoji: "📈",
    description: "Annual rise in the cost of a basket of goods. Food inflation hits the poorest hardest.",
    source: { name: "World Bank", url: "https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG?locations=IN" },
    unit: "%",
    invert: true,
    fetcher: { kind: "wb", indicator: "FP.CPI.TOTL.ZG" },
  },

  // ============ HUMAN DEVELOPMENT ============
  {
    slug: "hdi",
    category: "human-development",
    name: "Human Development Index",
    emoji: "🧬",
    description: "UNDP composite of life expectancy, education, and income. India sits in the 'Medium Human Development' tier.",
    source: { name: "UNDP via OWID", url: "https://ourworldindata.org/human-development-index" },
    concerningWhen: { thresholdPct: 0.66, copy: "India ranks behind Bangladesh and Sri Lanka." },
    fetcher: { kind: "owid", slug: "human-development-index" },
  },
  {
    slug: "literacy",
    category: "human-development",
    name: "Adult Literacy Rate",
    emoji: "📖",
    description: "Share of people 15+ who can read and write a short statement. Female literacy lags male by ~14 points.",
    source: { name: "World Bank / UNESCO", url: "https://data.worldbank.org/indicator/SE.ADT.LITR.ZS?locations=IN" },
    unit: "%",
    fetcher: { kind: "wb", indicator: "SE.ADT.LITR.ZS" },
  },
  {
    slug: "education-spend",
    category: "human-development",
    name: "Education Spending (% GDP)",
    emoji: "🎓",
    description: "Government expenditure on education as a share of GDP. National Education Policy targets 6%.",
    source: { name: "World Bank", url: "https://data.worldbank.org/indicator/SE.XPD.TOTL.GD.ZS?locations=IN" },
    unit: "%",
    fetcher: { kind: "wb", indicator: "SE.XPD.TOTL.GD.ZS" },
  },
  {
    slug: "civil-liberties",
    category: "human-development",
    name: "Civil Liberties (Freedom House)",
    emoji: "🕯️",
    description: "Freedom House measure of personal freedoms — expression, assembly, individual rights. Scored 0–60.",
    source: { name: "Freedom House via OWID", url: "https://ourworldindata.org/grapher/civil-liberties-fh" },
    fetcher: { kind: "owid", slug: "civil-liberties-fh" },
  },

  // ============ HEALTH ============
  {
    slug: "life-expectancy",
    category: "health",
    name: "Life Expectancy",
    emoji: "🕰️",
    description: "Average number of years a newborn is expected to live. Has risen by ~30 years since independence.",
    source: { name: "World Bank", url: "https://data.worldbank.org/indicator/SP.DYN.LE00.IN?locations=IN" },
    unit: "years",
    fetcher: { kind: "wb", indicator: "SP.DYN.LE00.IN" },
  },
  {
    slug: "infant-mortality",
    category: "health",
    name: "Infant Mortality",
    emoji: "👶",
    description: "Deaths per 1,000 live births before age 1.",
    source: { name: "World Bank", url: "https://data.worldbank.org/indicator/SP.DYN.IMRT.IN?locations=IN" },
    unit: "per 1,000",
    invert: true,
    concerningWhen: { thresholdPct: 0.66, copy: "India still loses more infants per capita than Bangladesh and Nepal." },
    fetcher: { kind: "wb", indicator: "SP.DYN.IMRT.IN" },
  },
  {
    slug: "health-spend",
    category: "health",
    name: "Health Spending (% GDP)",
    emoji: "🏥",
    description: "Combined public + private health expenditure as a share of GDP. Public share is among the lowest in the world.",
    source: { name: "World Bank", url: "https://data.worldbank.org/indicator/SH.XPD.CHEX.GD.ZS?locations=IN" },
    unit: "%",
    fetcher: { kind: "wb", indicator: "SH.XPD.CHEX.GD.ZS" },
  },
  {
    slug: "stunting",
    category: "health",
    name: "Child Stunting",
    emoji: "🍼",
    description: "Share of children under 5 who are too short for their age — a marker of chronic undernutrition.",
    source: { name: "World Bank / UNICEF", url: "https://data.worldbank.org/indicator/SH.STA.STNT.ZS?locations=IN" },
    unit: "%",
    invert: true,
    concerningWhen: { thresholdPct: 0.66, copy: "More stunted children than sub-Saharan Africa, despite a $3.7T economy." },
    fetcher: { kind: "wb", indicator: "SH.STA.STNT.ZS" },
  },

  // ============ ENVIRONMENT ============
  {
    slug: "pm25",
    category: "environment",
    name: "Air Pollution (PM2.5)",
    emoji: "🌫️",
    description: "Mean fine particulate matter exposure. WHO guideline is 5 μg/m³; Indian cities routinely exceed 50.",
    source: { name: "World Bank", url: "https://data.worldbank.org/indicator/EN.ATM.PM25.MC.M3?locations=IN" },
    unit: "μg/m³",
    invert: true,
    concerningWhen: { thresholdPct: 0.66, copy: "10× the WHO guideline. Delhi alone shaves ~9 years off life expectancy." },
    fetcher: { kind: "wb", indicator: "EN.ATM.PM25.MC.M3" },
  },
  {
    slug: "co2-per-capita",
    category: "environment",
    name: "CO₂ Emissions per Capita",
    emoji: "🏭",
    description: "Per-person carbon emissions. India is the world's 3rd largest emitter in total but among the lowest per capita.",
    source: { name: "World Bank", url: "https://data.worldbank.org/indicator/EN.GHG.CO2.PC.CE.AR5?locations=IN" },
    unit: "tonnes",
    invert: true,
    fetcher: { kind: "wb", indicator: "EN.GHG.CO2.PC.CE.AR5" },
  },
  {
    slug: "forest-cover",
    category: "environment",
    name: "Forest Area (% land)",
    emoji: "🌳",
    description: "Share of land covered by forest.",
    source: { name: "World Bank", url: "https://data.worldbank.org/indicator/AG.LND.FRST.ZS?locations=IN" },
    unit: "%",
    fetcher: { kind: "wb", indicator: "AG.LND.FRST.ZS" },
  },

  // ============ FREEDOM ============
  {
    slug: "press-freedom",
    category: "freedom",
    name: "Press Freedom",
    emoji: "📰",
    description: "Reporters Without Borders' assessment. India is now classified as 'very serious' for journalist safety.",
    source: { name: "RSF via OWID", url: "https://ourworldindata.org/grapher/press-freedom-rsf" },
    invert: true,
    concerningWhen: { thresholdPct: 0.66, copy: "Below Afghanistan and Pakistan in some recent years." },
    fetcher: { kind: "owid", slug: "press-freedom-rsf" },
  },
  {
    slug: "democracy",
    category: "freedom",
    name: "Democracy Index",
    emoji: "🗳️",
    description: "Economist Intelligence Unit. India is classified as a 'flawed democracy'.",
    source: { name: "EIU via OWID", url: "https://ourworldindata.org/grapher/democracy-index-eiu" },
    fetcher: { kind: "owid", slug: "democracy-index-eiu" },
  },
  {
    slug: "liberal-democracy",
    category: "freedom",
    name: "Liberal Democracy (V-Dem)",
    emoji: "🏛️",
    description: "V-Dem composite of free-and-fair elections plus liberal protections like rule of law and independent courts.",
    source: { name: "V-Dem via OWID", url: "https://ourworldindata.org/grapher/v-dem-liberal-democracy-index" },
    concerningWhen: { thresholdPct: 0.66, copy: "V-Dem reclassified India as an 'electoral autocracy' in recent years." },
    fetcher: { kind: "owid", slug: "v-dem-liberal-democracy-index" },
  },
  {
    slug: "corruption",
    category: "freedom",
    name: "Corruption Perceptions",
    emoji: "🕵️",
    description: "Transparency International. 0 = highly corrupt, 100 = very clean.",
    source: { name: "TI via OWID", url: "https://ourworldindata.org/grapher/corruption-perception-index" },
    fetcher: { kind: "owid", slug: "corruption-perception-index" },
  },
  {
    slug: "rule-of-law",
    category: "freedom",
    name: "Rule of Law",
    emoji: "📜",
    description: "World Justice Project measure of constraints on government, fundamental rights, civil and criminal justice.",
    source: { name: "WJP via OWID", url: "https://ourworldindata.org/grapher/rule-of-law-index" },
    fetcher: { kind: "owid", slug: "rule-of-law-index" },
  },

  // ============ HUNGER ============
  {
    slug: "hunger",
    category: "hunger",
    name: "Global Hunger Index",
    emoji: "🥣",
    description: "Composite of undernourishment, child wasting, stunting, and mortality. Lower is better.",
    source: { name: "GHI via OWID", url: "https://ourworldindata.org/grapher/global-hunger-index" },
    invert: true,
    concerningWhen: { thresholdPct: 0.66, copy: "India scores worse on hunger than every neighbour except Afghanistan." },
    fetcher: { kind: "owid", slug: "global-hunger-index" },
  },
  {
    slug: "extreme-poverty",
    category: "hunger",
    name: "Extreme Poverty Headcount",
    emoji: "🏚️",
    description: "Share of population living on less than $2.15 per day at PPP. India has lifted hundreds of millions out of extreme poverty.",
    source: { name: "World Bank", url: "https://data.worldbank.org/indicator/SI.POV.DDAY?locations=IN" },
    unit: "%",
    invert: true,
    fetcher: { kind: "wb", indicator: "SI.POV.DDAY" },
  },

  // ============ INNOVATION ============
  {
    slug: "internet-users",
    category: "innovation",
    name: "Internet Users",
    emoji: "🌐",
    description: "Share of population using the internet. India has the world's second largest online population.",
    source: { name: "World Bank / ITU", url: "https://data.worldbank.org/indicator/IT.NET.USER.ZS?locations=IN" },
    unit: "%",
    fetcher: { kind: "wb", indicator: "IT.NET.USER.ZS" },
  },
  {
    slug: "rd-spending",
    category: "innovation",
    name: "R&D Expenditure (% GDP)",
    emoji: "🔬",
    description: "Gross domestic spending on research and development.",
    source: { name: "World Bank / UNESCO", url: "https://data.worldbank.org/indicator/GB.XPD.RSDV.GD.ZS?locations=IN" },
    unit: "%",
    concerningWhen: { thresholdPct: 0.66, copy: "Less than a quarter of what China and South Korea invest." },
    fetcher: { kind: "wb", indicator: "GB.XPD.RSDV.GD.ZS" },
  },
  {
    slug: "mobile-subscriptions",
    category: "innovation",
    name: "Mobile Subscriptions",
    emoji: "📱",
    description: "Mobile cellular subscriptions per 100 people.",
    source: { name: "World Bank / ITU", url: "https://data.worldbank.org/indicator/IT.CEL.SETS.P2?locations=IN" },
    unit: "per 100",
    fetcher: { kind: "wb", indicator: "IT.CEL.SETS.P2" },
  },

  // ============ HAPPINESS ============
  {
    slug: "happiness",
    category: "happiness",
    name: "Self-Reported Happiness",
    emoji: "😀",
    description: "Cantril Ladder: respondents rate their lives 0–10. India's score sits below Bangladesh, Pakistan, and Sri Lanka.",
    source: { name: "WHR via OWID", url: "https://ourworldindata.org/grapher/happiness-cantril-ladder" },
    concerningWhen: { thresholdPct: 0.66, copy: "Indians rate their lives lower than Bangladeshis and Pakistanis." },
    fetcher: { kind: "owid", slug: "happiness-cantril-ladder" },
  },
];

export function indicesByCategory(cat: Category): IndexSpec[] {
  return INDICES.filter((i) => i.category === cat);
}

export function findIndex(slug: string): IndexSpec | undefined {
  return INDICES.find((i) => i.slug === slug);
}

/**
 * Concern severity based on India's value vs South Asian peer set.
 * Returns "bad" when India is bottom in the peer group (after invert correction).
 */
export function concerningTone(
  value: number | null,
  peerValues: Array<{ value: number | null }>,
  invert?: boolean,
): Tone {
  if (value === null) return "neutral";
  const valid = peerValues.map((p) => p.value).filter((v): v is number => v !== null);
  if (valid.length < 2) return "neutral";
  const sorted = [...valid].sort((a, b) => a - b);
  // If invert (lower is better), being highest = worst
  // If not (higher is better), being lowest = worst
  const isWorst = invert ? value >= sorted[sorted.length - 1] : value <= sorted[0];
  const isBest = invert ? value <= sorted[0] : value >= sorted[sorted.length - 1];
  if (isWorst) return "bad";
  if (isBest) return "good";
  // Middle of peer group
  return "warn";
}
