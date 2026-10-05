/** Awards (spec §9.11). The 2020 badge art reads "Voted #1" and is never shown (C-6). */
export const AWARD_LINE = "Voted #1 Best Thai Food — Press-Enterprise Best of Inland Empire 2018 & 2019 · Top 3 in 2020 & 2023"; // OWNER-CONFIRM(C-6): award wording
export const AWARD_SHORT = "Voted #1 Best Thai Food — Press-Enterprise Best of Inland Empire 2018 & 2019";

export const PE2019 = "https://www.pressenterprise.com/2019/09/12/best-of-inland-empire-2019-best-thai-food/";
export const PE2020 = "https://www.pressenterprise.com/2020/09/20/best-of-inland-empire-2020-best-thai-food/";
export const PE2023 = "https://www.pressenterprise.com/2023/09/10/best-of-inland-empire-2023-best-thai-food/";

export type Award = {
  year: number; label: "Voted #1" | "Top 3"; rank: 1 | 3; title: "Best Thai Food";
  source: "Press-Enterprise Best of Inland Empire"; url: string; badge?: "bie2019" | "bie2023"; note?: string;
};

const BASE = { title: "Best Thai Food", source: "Press-Enterprise Best of Inland Empire" } as const;

export const AWARDS: Award[] = [
  { year: 2018, label: "Voted #1", rank: 1, ...BASE, url: PE2019, note: "Per the 2019 article: top honors “for the second consecutive year.”" },
  { year: 2019, label: "Voted #1", rank: 1, ...BASE, url: PE2019, badge: "bie2019" },
  { year: 2020, label: "Top 3", rank: 3, ...BASE, url: PE2020 }, // the 2020 badge art reads "Voted #1" — never shown
  { year: 2023, label: "Top 3", rank: 3, ...BASE, url: PE2023, badge: "bie2023" },
];
