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
      <section className="py-20 px-6">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative aspect-[4/5] rounded-[4rem] overflow-hidden border border-white/10"
            >
              <Image 
                src="/images/about-atmosphere.png" 
                alt="Gra Pow Interior" 
                fill 
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-12 left-12">
                <p className="font-[family-name:var(--font-dancing)] text-4xl text-gold">Riverside's Home for Foodies</p>
                <p className="text-white/60 text-xs tracking-widest uppercase mt-2">Mission Grove Shopping Center</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div>
                <h2 className="text-sm font-bold tracking-[0.3em] uppercase text-gold mb-6 flex items-center gap-4">
                  <Utensils className="w-4 h-4" /> The Vision
                </h2>
                <h3 className="font-[family-name:var(--font-baskerville)] text-4xl md:text-5xl leading-tight mb-8">
                  Where Thai Heritage Meets <span className="text-gold italic">Modern Fusion</span>
                </h3>
                <div className="space-y-6 text-white/60 text-lg font-light leading-relaxed">
                  <p>
                    Founded by visionary Chef-Owner <span className="text-white font-medium">Patrick Sura</span>, Gra Pow Thai & Sports Bar was born from a desire to create a dining destination where world-class Thai cuisine and the electric energy of a sports bar could coexist harmoniously.
                  </p>
                  <p>
                    From our vibrant Pad Gra Pow to our master-crafted sushi selections, every plate is an expression of Chef Patrick's commitment to quality and innovation.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 py-8 border-y border-white/5">
                <div>
                  <Award className="text-gold w-6 h-6 mb-4" />
                  <p className="text-xs tracking-widest uppercase opacity-40 mb-2">Recognized By</p>
                  <p className="text-sm font-medium">Inland Empire Magazine</p>
                </div>
                <div>
                  <Users className="text-gold w-6 h-6 mb-4" />
                  <p className="text-xs tracking-widest uppercase opacity-40 mb-2">Community</p>
                  <p className="text-sm font-medium">Riverside's Favorite Since 2010</p>
                </div>
              </div>

              <div className="flex gap-6">
                <Link href="/menu/food" className="bg-white text-black px-10 py-5 rounded-full font-bold text-xs tracking-[0.2em] uppercase hover:scale-105 transition-transform">
                  Explore Menu
                </Link>
                <Link href="/reservations" className="bg-transparent border border-white/20 text-white px-10 py-5 rounded-full font-bold text-xs tracking-[0.2em] uppercase hover:bg-white/5 transition-colors">
                  Book Table
                </Link>
              </div>
            </motion.div>
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
