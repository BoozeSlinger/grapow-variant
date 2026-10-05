/**
 * Home `/` (spec §12.1, WP2): one day at Gra Pow, in order — tonight, game day, today, the kitchen,
 * the sushi bar, chef & the record, the turn, happy hour, the bar; then the footer (site layout).
 */
import type { Metadata } from "next";
import { BarChapter } from "@/components/home/BarChapter";
import { GameDay } from "@/components/home/GameDay";
import { HappyHourChapter } from "@/components/home/HappyHourChapter";
import { Hero } from "@/components/home/Hero";
import { KitchenChapter } from "@/components/home/KitchenChapter";
import { RecordChapter } from "@/components/home/RecordChapter";
import { SushiChapter } from "@/components/home/SushiChapter";
import { TapWallTurn } from "@/components/home/TapWallTurn";
import { TodaySection } from "@/components/home/TodaySection";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/data/venue";

export const metadata: Metadata = { title: { absolute: SITE_TITLE }, description: SITE_DESCRIPTION, alternates: { canonical: "/" } };

export default function Page() {
  return (
    <>
      <Hero />
      <GameDay />
      <TodaySection />
      <KitchenChapter />
      <SushiChapter />
      <RecordChapter />
      <TapWallTurn />
      <HappyHourChapter />
      <BarChapter />
    </>
  );
}
