"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, MapPin, Phone, Mail, Award, Users, Utensils } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/10 via-transparent to-transparent -z-10" />
        <div className="max-w-screen-xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex justify-center"
          >
            <Breadcrumbs />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-[family-name:var(--font-dancing)] text-7xl md:text-9xl mb-8"
          >
            Our Story
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-[family-name:var(--font-baskerville)] text-white/50 text-xs tracking-[0.4em] uppercase max-w-2xl mx-auto leading-loose"
          >
            A Fusion of Tradition, Taste, and Team Spirit in the Heart of Riverside.
          </motion.p>
        </div>
      </section>

      {/* Atmosphere Section */}
      <section className="py-32 px-6">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative aspect-[4/5] rounded-[5rem] overflow-hidden border border-white/5 shadow-2xl group"
            >
              <Image 
                src="https://res.cloudinary.com/dqj3xyvey/image/upload/v1773467162/bar-interior_e3lutg.jpg" 
                alt="Gra Pow Interior" 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-[2s]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-16 left-16">
                <span className="text-gold text-[10px] font-black tracking-[0.5em] uppercase mb-4 block">The Vibe</span>
                <p className="font-[family-name:var(--font-dancing)] text-5xl text-white leading-tight">Riverside's Home <br/>for Foodies</p>
              </div>
            </motion.div>

            <div className="space-y-16">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-[10px] font-black tracking-[0.4em] uppercase text-gold mb-8 flex items-center gap-4">
                  <div className="w-8 h-px bg-gold/30" /> OUR PHILOSOPHY
                </h2>
                <h3 className="font-[family-name:var(--font-baskerville)] text-5xl md:text-6xl leading-[1.1] mb-10 italic">
                  Where Thai Heritage Meets <span className="text-gold not-italic font-sans font-bold tracking-tighter">MODERN FUSION</span>
                </h3>
                <div className="space-y-8 text-white/50 text-xl font-light leading-relaxed font-[family-name:var(--font-opensans)]">
                  <p>
                    Founded by visionary Chef-Owner <span className="text-white font-bold underline decoration-gold/30 decoration-4 underline-offset-8">Patrick Sura</span>, Gra Pow was born from a desire to create a dining destination where world-class Thai cuisine and the electric energy of a sports bar could coexist harmoniously.
                  </p>
                  <p>
                    From our vibrant Pad Gra Pow to our master-crafted sushi selections, every plate is an expression of Chef Patrick's commitment to quality and innovation.
                  </p>
                </div>
              </motion.div>

              <div className="grid grid-cols-2 gap-12 py-12 border-y border-white/10">
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                  <Award className="text-gold w-6 h-6 mb-4" />
                  <p className="text-[9px] tracking-[0.3em] uppercase text-white/30 mb-2">Recognized By</p>
                  <p className="text-sm font-bold tracking-wide">Inland Empire Magazine</p>
                </motion.div>
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                  <Users className="text-gold w-6 h-6 mb-4" />
                  <p className="text-[9px] tracking-[0.3em] uppercase text-white/30 mb-2">Community</p>
                  <p className="text-sm font-bold tracking-wide">Favorite Since 2010</p>
                </motion.div>
              </div>

              <div className="flex flex-col sm:flex-row gap-8">
                <Link href="/menu/food">
                  <motion.button 
                    whileHover={{ scale: 1.05, x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-gold w-full sm:w-auto px-12 py-6 text-[10px] font-black tracking-[0.3em]"
                  >
                    EXPLORE THE MENU
                  </motion.button>
                </Link>
                <motion.button 
                  onClick={() => window.dispatchEvent(new CustomEvent("open-reservation"))}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-outline w-full sm:w-auto px-12 py-6 text-[10px] font-black tracking-[0.3em] border-white/10 hover:border-gold"
                >
                  RESERVE A TABLE
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-32 px-6 bg-white flex items-center justify-center text-center">
        <div className="max-w-4xl">
          <Star className="text-gold w-10 h-10 mx-auto mb-10" />
          <h2 className="text-black font-[family-name:var(--font-dancing)] text-5xl md:text-7xl mb-12">
            "We believe that great food brings people together, but great atmosphere makes them stay."
          </h2>
          <p className="text-black/40 text-xs tracking-[0.5em] uppercase font-bold">— Chef Patrick Sura</p>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="py-20 px-6">
        <div className="max-w-screen-xl mx-auto flex flex-col items-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full">
                <div className="p-12 rounded-[3rem] bg-white/5 border border-white/10 text-center group hover:border-gold/50 transition-colors">
                    <MapPin className="text-gold w-8 h-8 mx-auto mb-6 group-hover:scale-110 transition-transform" />
                    <h4 className="text-xs tracking-widest uppercase mb-4 opacity-50">Visit Us</h4>
                    <p className="text-sm leading-loose">
                        497 East Alessandro Blvd.<br />
                        Riverside, CA 92508
                    </p>
                </div>
                <div className="p-12 rounded-[3rem] bg-white/5 border border-white/10 text-center group hover:border-gold/50 transition-colors">
                    <Phone className="text-gold w-8 h-8 mx-auto mb-6 group-hover:scale-110 transition-transform" />
                    <h4 className="text-xs tracking-widest uppercase mb-4 opacity-50">Call Us</h4>
                    <p className="text-sm leading-loose">
                        (951) 780-5699
                    </p>
                </div>
                <div className="p-12 rounded-[3rem] bg-white/5 border border-white/10 text-center group hover:border-gold/50 transition-colors">
                    <Mail className="text-gold w-8 h-8 mx-auto mb-6 group-hover:scale-110 transition-transform" />
                    <h4 className="text-xs tracking-widest uppercase mb-4 opacity-50">Email</h4>
                    <p className="text-sm leading-loose">
                        hello@grapow.net
                    </p>
                </div>
            </div>
            <div className="mt-20">
                <Link href="/" className="text-xs tracking-[0.3em] uppercase font-bold text-white/30 hover:text-gold transition-colors">
                    Return Home
                </Link>
            </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
