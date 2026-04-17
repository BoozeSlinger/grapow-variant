import VideoHero        from "@/components/VideoHero";
import HeroDiagonal    from "@/components/HeroDiagonal";
import SectionSplit    from "@/components/SectionSplit";
import AwardsPress     from "@/components/AwardsPress";
import ScrollReveal    from "@/components/ScrollReveal";
import MobileImageStrip from "@/components/MobileImageStrip";
import { cldImage, ASSETS } from "@/lib/cloudinary";

export default function Home() {
  return (
    <main>
      {/* 1. Full-screen video hero */}
      <VideoHero />

      {/* 2. 3-column diagonal menu selector */}
      <HeroDiagonal />

      {/* 3. Tagline */}
      <section className="bg-[#111111] py-16 md:py-24 text-center px-6">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <h2 className="font-[family-name:var(--font-dancing)] text-4xl md:text-[5.5rem] text-[#E8A000] leading-tight mobile-text-balance">
              Gra Pow Riverside
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className="h-px w-24 bg-gold/30 mx-auto my-8" />
          </ScrollReveal>
          <ScrollReveal delay={0.3}>
            <p className="font-[family-name:var(--font-baskerville)] text-gray-400 tracking-[0.3em] text-[0.75rem] md:text-base uppercase max-w-lg mx-auto leading-relaxed">
              Authentic Thai Kitchen &amp; Premium Sports Bar — Heart of Riverside, CA
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* 4. Events — image left, text right */}
      <SectionSplit
        id="events"
        eyebrow="What's Poppin'"
        heading={"Events &\nGame Days"}
        body="From watch parties on the big screens to live DJ nights and themed happy hours, Gra Pow keeps it loud, lively, and full of flavor. Check what's on and never miss a moment."
        ctaLabel="See Events"
        ctaHref="#events-list"
        imageSrc={cldImage(ASSETS.eventsBg)}
        imageAlt="Gra Pow sports bar — game day atmosphere"
      />

      {/* 4b. Mobile-only image break — between Events and The Wok */}
      <MobileImageStrip
        src={cldImage(ASSETS.fromTheWokBg, "w_800,h_560,c_fill,f_auto,q_auto")}
        alt="From The Wok — Gra Pow kitchen"
      />

      {/* 5. The Wok blog — text left, image right */}
      <SectionSplit
        id="wook"
        eyebrow="Stories & Recipes"
        heading="The Wok"
        body="Dive behind the wok. From the origin of Thai basil stir fry to the recipe behind the Gra Pow Mule — our blog brings you the flavors, the stories, and the Riverside dining scene."
        ctaLabel="Read The Wok"
        ctaHref="#wok-posts"
        imageSrc={cldImage(ASSETS.wookBg)}
        imageAlt="Thai food close-up"
        reverse
        dark
      />

      {/* 6. Sushi bar — text first on mobile, image right on desktop */}
      <SectionSplit
        id="sushi"
        eyebrow="Opens at 5PM · Closed Sun & Mon"
        heading="Sushi Bar"
        body="When evening sets in, so does the Sushi Bar. Fresh sashimi, house specialty rolls, and creative small bites — crafted nightly from 5PM. Try the Hangover Roll or the Yellowtail Crudo while they last."
        ctaLabel="Sushi Menu"
        ctaHref="/menu/sushi"
        imageSrc={cldImage(ASSETS.sushiBg)}
        imageAlt="Gra Pow sushi bar"
        mobileTextFirst
      />

      {/* 7. Awards & Press */}
      <AwardsPress />

      {/* 8. About — text left, image right */}
      <SectionSplit
        id="about"
        eyebrow="Our Story"
        heading={"Gra Pow\nRiverside"}
        body="Born from a love of authentic Thai flavors and community, Gra Pow has been Riverside's gathering place for years. Named after the Thai basil stir fry that started it all, we blend bold Southeast Asian cuisine with a laid-back sports bar vibe — and we wouldn't have it any other way."
        ctaLabel="Find Us"
        ctaHref="#site-footer"
        imageSrc={cldImage(ASSETS.aboutBg)}
        imageAlt="Gra Pow interior — sports bar dining room"
        reverse
      />
    </main>
  );
}
