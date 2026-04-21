import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import {
  Zap, Eye, Check, TrendingUp, ArrowRight, Smartphone,
  Package, Star, MapPin, Clock, CreditCard, Shield,
  ChevronDown, Menu, X, Truck, Users, BarChart3,
  MessageCircle, Phone, Mail, Instagram, Facebook, Twitter,
  CheckCircle2, PackageCheck, ScanLine, Bike, Globe
} from "lucide-react";
import logoImage from "../imports/ChatGPT_Image_1_avr._2026,_08_48_33.png";
import heroImage from "../imports/hero.png";
import seedoPointRelaisImage from "../imports/SEEDO_POINT_RELAIS.png";

import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/* ── helpers ────────────────────────────────────────────── */
function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);
  return { count, ref };
}

/* ── logo ──────────────────────────────────────────────── */
function SeedoLogo({ className = "h-10" }: { className?: string }) {
  return <img src={logoImage} alt="SEEDO" className={className} style={{ objectFit: "contain" }} />;
}

/* ── nav ────────────────────────────────────────────────── */
function Navbar({ onCtaClick }: { onCtaClick: () => void }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  const links = ["Services", "Fonctionnement", "Avantages", "Témoignages"];
  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#0B2A4A]/95 shadow-2xl backdrop-blur-md" : "bg-transparent"}`}>
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <a href="#hero" className="flex items-center gap-3">
          <SeedoLogo className="h-10" />
        </a>
        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase()}`}
              className="text-sm text-white/80 hover:text-[#FF7A00] transition-colors font-medium">
              {l}
            </a>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-green-500/15 border border-green-500/30 px-4 py-1.5 text-xs font-semibold text-green-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
            Bientôt disponible
          </span>
          <button onClick={onCtaClick}
            className="rounded-xl bg-[#FF7A00] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#FF7A00]/30 hover:bg-[#ff8c1a] transition-all"
            style={{ fontFamily: "Montserrat, sans-serif" }}>
            Rejoindre la waitlist
          </button>
        </div>
        {/* Mobile burger */}
        <button className="md:hidden text-white" onClick={() => setOpen(o => !o)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 bg-[#0B2A4A]/98 backdrop-blur-md px-6 py-6 space-y-4">
            {links.map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setOpen(false)}
                className="block text-white/80 hover:text-[#FF7A00] font-medium">{l}</a>
            ))}
            <button onClick={() => { setOpen(false); onCtaClick(); }}
              className="w-full rounded-xl bg-[#FF7A00] py-3 font-bold text-white"
              style={{ fontFamily: "Montserrat, sans-serif" }}>
              Rejoindre la waitlist
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ── waitlist modal ─────────────────────────────────────── */
const PROFILES = [
  {
    id: "expediteur" as const,
    icon: <Package className="h-6 w-6" />,
    label: "Envoyer un colis",
    desc: "Je veux expédier mes colis partout au Bénin",
  },
  {
    id: "livreur" as const,
    icon: <Bike className="h-6 w-6" />,
    label: "Devenir livreur",
    desc: "Je veux rejoindre le réseau de livreurs SEEDO",
  },
  {
    id: "relais" as const,
    icon: <MapPin className="h-6 w-6" />,
    label: "Devenir point relais",
    desc: "Je veux ouvrir un point de dépôt/retrait dans ma zone",
  },
];

type ProfileId = "expediteur" | "livreur" | "relais";

function WaitlistModal({ onClose, waitlistCount, setWaitlistCount }:
  { onClose: () => void; waitlistCount: number; setWaitlistCount: React.Dispatch<React.SetStateAction<number>> }) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [profile, setProfile] = useState<ProfileId | null>(null);
  const [form, setForm] = useState({ nom: "", telephone: "", email: "", ville: "" });
  const [loading, setLoading] = useState(false);

  const selectedProfile = PROFILES.find(p => p.id === profile);
  const villes = ["Cotonou", "Porto-Novo", "Abomey-Calavi", "Parakou", "Bohicon", "Natitingou", "Ouidah", "Lokossa", "Autre"];

  const handleProfileSelect = (id: ProfileId) => {
    setProfile(id);
    setTimeout(() => setStep(1), 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!form.nom || !form.telephone || !form.email || !form.ville || !profile) return;

  setLoading(true);

  try {
    await addDoc(collection(db, "liste_attente"), {
      nom: form.nom,
      telephone: form.telephone,
      email: form.email,
      ville: form.ville,
      typeUtilisateur: profile, // 🔥 important
      createdAt: serverTimestamp(),
    });

    // UI success
    setStep(2);
    setWaitlistCount(c => c + 1);

  } catch (error) {
    console.error("Erreur Firebase :", error);
    alert("Une erreur est survenue. Réessayez.");
  } finally {
    setLoading(false);
  }
};

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        className="relative w-full max-w-md overflow-hidden rounded-t-3xl sm:rounded-3xl bg-[#071e35] shadow-2xl ring-1 ring-white/10"
        onClick={e => e.stopPropagation()}>

        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-[#FF7A00] via-[#ffb347] to-[#FF7A00]" />

        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-4 pb-3">
          <SeedoLogo className="h-8" />
          <div className="flex items-center gap-3">
            {step < 2 && (
              <span className="hidden sm:inline text-xs text-white/40">
                <span className="font-semibold text-[#FF7A00]">{waitlistCount}+</span> inscrits
              </span>
            )}
            <button onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/8 text-white/40 hover:bg-white/15 hover:text-white transition-all">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Step progress */}
        {step < 2 && (
          <div className="px-6 mb-1">
            <div className="flex items-center gap-1.5">
              <div className={`h-1 rounded-full transition-all duration-500 ${step >= 0 ? "bg-[#FF7A00]" : "bg-white/15"} ${step === 0 ? "flex-[2]" : "flex-1"}`} />
              <div className={`h-1 rounded-full transition-all duration-500 ${step >= 1 ? "bg-[#FF7A00]" : "bg-white/15"} ${step === 1 ? "flex-[2]" : "flex-1"}`} />
            </div>
            <p className="mt-1.5 text-xs text-white/30">Étape {step + 1} sur 2</p>
          </div>
        )}

        <div className="px-6 pb-7 pt-3">
          <AnimatePresence mode="wait">

            {/* ── STEP 0 : choix du profil ── */}
            {step === 0 && (
              <motion.div key="step0"
                initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.22 }}>
                <h2 className="mb-1 font-bold text-xl text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>
                  Rejoindre la liste d'attente
                </h2>
                <p className="mb-5 text-sm text-white/50">
                  Inscrivez-vous et soyez parmi les premiers à utiliser SEEDO.
                </p>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">Je souhaite…</p>
                <div className="space-y-2.5">
                  {PROFILES.map((p, i) => (
                    <motion.button key={p.id}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      whileHover={{ scale: 1.012 }} whileTap={{ scale: 0.988 }}
                      onClick={() => handleProfileSelect(p.id)}
                      className="group w-full flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-left hover:border-[#FF7A00]/60 hover:bg-[#FF7A00]/8 transition-all">
                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#FF7A00]/12 border border-[#FF7A00]/20 text-[#FF7A00] group-hover:bg-[#FF7A00] group-hover:text-white transition-all">
                        {p.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>
                          {p.label}
                        </p>
                        <p className="text-xs text-white/45 mt-0.5 truncate">{p.desc}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 flex-shrink-0 text-white/20 group-hover:text-[#FF7A00] group-hover:translate-x-0.5 transition-all" />
                    </motion.button>
                  ))}
                </div>
                <p className="mt-5 text-center text-xs text-white/25">🔒 Aucun spam · Données sécurisées</p>
              </motion.div>
            )}

            {/* ── STEP 1 : formulaire ── */}
            {step === 1 && (
              <motion.div key="step1"
                initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.22 }}>
                {/* Profile badge + back */}
                <div className="mb-5 flex items-center justify-between">
                  {selectedProfile && (
                    <div className="flex items-center gap-2 rounded-xl bg-[#FF7A00]/12 border border-[#FF7A00]/25 px-3 py-2">
                      <span className="text-[#FF7A00]">{selectedProfile.icon}</span>
                      <span className="text-sm font-semibold text-[#FF7A00]">{selectedProfile.label}</span>
                    </div>
                  )}
                  <button onClick={() => setStep(0)}
                    className="text-xs text-white/35 hover:text-white/65 transition-colors underline underline-offset-2">
                    ← Changer
                  </button>
                </div>

                <h2 className="mb-1 font-bold text-xl text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>
                  Vos informations
                </h2>
                <p className="mb-5 text-sm text-white/45">Tous les champs sont requis.</p>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-white/60">Nom complet *</label>
                    <input type="text" required value={form.nom}
                      onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                      placeholder="Votre nom"
                      className="w-full rounded-xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white placeholder-white/25 focus:border-[#FF7A00] focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/15 transition-all" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-white/60">Téléphone *</label>
                    <input type="tel" required value={form.telephone}
                      onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))}
                      placeholder="+229 XX XX XX XX XX"
                      className="w-full rounded-xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white placeholder-white/25 focus:border-[#FF7A00] focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/15 transition-all" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-white/60">Email *</label>
                    <input type="email" required value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="votre@email.com"
                      className="w-full rounded-xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white placeholder-white/25 focus:border-[#FF7A00] focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/15 transition-all" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-white/60">Ville *</label>
                    <select required value={form.ville}
                      onChange={e => setForm(f => ({ ...f, ville: e.target.value }))}
                      className="w-full rounded-xl border border-white/12 bg-[#0d2640] px-4 py-3 text-sm text-white focus:border-[#FF7A00] focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/15 transition-all cursor-pointer appearance-none">
                      <option value="" disabled>Cotonou, Porto-Novo, Calavi…</option>
                      {villes.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>

                  <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    disabled={loading}
                    className="w-full rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#ff8c1a] py-4 font-bold text-white shadow-xl shadow-[#FF7A00]/20 hover:shadow-[#FF7A00]/35 disabled:opacity-60 transition-all flex items-center justify-center gap-2 mt-1"
                    style={{ fontFamily: "Montserrat, sans-serif" }}>
                    {loading ? (
                      <>
                        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                          <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Inscription en cours…
                      </>
                    ) : (
                      <>S'inscrire sur la liste d'attente <ArrowRight className="h-5 w-5" /></>
                    )}
                  </motion.button>
                </form>
                <p className="mt-3 text-center text-xs text-white/25">
                  En vous inscrivant, vous acceptez de recevoir des notifications sur le lancement de SEEDO.
                </p>
              </motion.div>
            )}

            {/* ── STEP 2 : succès ── */}
            {step === 2 && (
              <motion.div key="step2"
                initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 240, damping: 22 }}
                className="py-2 text-center">
                <div className="relative mx-auto mb-5 flex h-24 w-24 items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-green-500/12 animate-ping" style={{ animationDuration: "2.5s" }} />
                  <div className="absolute inset-3 rounded-full bg-green-500/15" />
                  <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, delay: 0.1 }}
                    className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-2xl">
                    <Check className="h-8 w-8 text-white" />
                  </motion.div>
                </div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <h3 className="mb-2 font-bold text-2xl text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>
                    Bienvenue à bord ! 🎉
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed mb-4">
                    Vous faites partie des{" "}
                    <span className="font-bold text-[#FF7A00]">{waitlistCount} pionniers</span>{" "}
                    qui façonnent l'avenir de la logistique au Bénin.
                  </p>

                  {selectedProfile && (
                    <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-xl bg-white/6 border border-white/10 px-4 py-2.5">
                      <span className="text-[#FF7A00]">{selectedProfile.icon}</span>
                      <span className="text-sm text-white/75 font-medium">{selectedProfile.label}</span>
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    </div>
                  )}

                  <p className="text-xs text-white/35 mb-5">Un email de confirmation vous a été envoyé.</p>

                  {/* Share */}
                  <div className="rounded-2xl bg-white/5 border border-white/8 p-4 mb-5">
                    <p className="text-xs font-semibold text-white/50 mb-3">Partagez SEEDO avec vos proches 🚀</p>
                    <div className="flex justify-center gap-2">
                      {[
                        { icon: <MessageCircle className="h-4 w-4" />, label: "WhatsApp", cls: "bg-green-600/80 hover:bg-green-600" },
                        { icon: <Facebook className="h-4 w-4" />, label: "Facebook", cls: "bg-blue-600/80 hover:bg-blue-600" },
                        { icon: <Twitter className="h-4 w-4" />, label: "Twitter", cls: "bg-sky-500/80 hover:bg-sky-500" },
                      ].map(s => (
                        <button key={s.label}
                          className={`flex items-center gap-1.5 rounded-xl ${s.cls} px-3 py-2 text-xs font-semibold text-white transition-colors`}>
                          {s.icon} {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button onClick={onClose}
                    className="w-full rounded-xl border border-white/12 bg-white/6 py-3 text-sm font-semibold text-white/60 hover:bg-white/10 hover:text-white transition-all">
                    Fermer
                  </button>
                </motion.div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── stat card ──────────────────────────────────────────── */
function StatCard({ value, suffix = "", label, sublabel, delay = 0 }:
  { value: number; suffix?: string; label: string; sublabel: string; delay?: number }) {
  const { count, ref } = useCountUp(value);
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ delay }}
      className="text-center">
      <div className="mb-2 font-bold text-4xl text-[#FF7A00] md:text-5xl" style={{ fontFamily: "Montserrat, sans-serif" }}>
        {count}{suffix}
      </div>
      <p className="font-semibold text-white">{label}</p>
      <p className="text-xs text-white/50 mt-1">{sublabel}</p>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════ */
export default function App() {
  const [showModal, setShowModal] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState(523);

  useEffect(() => {
    const t = setInterval(() => setWaitlistCount(c => c + Math.floor(Math.random() * 3 + 1)), 7000);
    return () => clearInterval(t);
  }, []);

  const progress = 85;

  return (
    <div className="min-h-screen bg-[#0B2A4A]" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#FF7A00]/8 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 h-[400px] w-[400px] rounded-full bg-[#FF7A00]/6 blur-[100px]" />
        <div className="absolute -bottom-40 left-1/3 h-[400px] w-[400px] rounded-full bg-blue-400/5 blur-[100px]" />
      </div>

      <Navbar onCtaClick={() => setShowModal(true)} />

      {/* ── HERO ──────────────────────────────────────────── */}
      <section id="hero" className="relative min-h-screen flex items-center pt-20">
        <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="grid gap-14 items-center lg:grid-cols-2">
            {/* Left */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#FF7A00]/30 bg-[#FF7A00]/10 px-4 py-2 text-sm font-semibold text-[#FF7A00] backdrop-blur-sm">
                <Star className="h-4 w-4" fill="currentColor" />
                Bientôt disponible · Phase Bêta Q2 2026
              </motion.div>

              <h1 className="mb-6 font-bold text-4xl leading-[1.1] text-white md:text-5xl lg:text-6xl"
                style={{ fontFamily: "Montserrat, sans-serif" }}>
                La livraison &amp; les paiements{" "}
                <span className="bg-gradient-to-r from-[#FF7A00] to-[#ffb347] bg-clip-text text-transparent">
                  réinventés
                </span>{" "}
                pour le Bénin
              </h1>
              <p className="mb-3 text-lg text-white/75 leading-relaxed max-w-xl">
                SEEDO connecte vos colis via des points relais partout dans le pays.
              </p>
              <p className="mb-8 text-sm text-white/50 max-w-lg">
                Rejoignez les pionniers qui façonnent le futur du commerce digital en Afrique de l'Ouest.
              </p>

              {/* 3 CTA Buttons — comme sur seedo.bj */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 max-w-lg">
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setShowModal(true)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#ff8c1a] px-7 py-4 font-bold text-white shadow-xl shadow-[#FF7A00]/30 hover:shadow-[#FF7A00]/50 transition-all"
                  style={{ fontFamily: "Montserrat, sans-serif" }}>
                  <Package className="h-5 w-5" /> Envoyer un colis
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setShowModal(true)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#0B2A4A] border-2 border-[#1a4a7a] px-7 py-4 font-bold text-white shadow-xl hover:border-[#FF7A00]/50 hover:bg-[#0e3558] transition-all"
                  style={{ fontFamily: "Montserrat, sans-serif" }}>
                  <Bike className="h-5 w-5 text-[#FF7A00]" /> Devenir livreur
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setShowModal(true)}
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-white/20 bg-transparent px-7 py-4 font-bold text-white hover:border-[#FF7A00]/60 hover:bg-white/5 transition-all"
                  style={{ fontFamily: "Montserrat, sans-serif" }}>
                  <MapPin className="h-5 w-5 text-[#FF7A00]" /> Devenir point relais
                </motion.button>
              </div>

              <p className="mt-5 text-xs text-white/40">
                ⚡ <span className="font-semibold text-[#FF7A00]">{waitlistCount}+</span> inscrits · Gratuit · Sans engagement
              </p>

              {/* Pillars */}
              <div className="mt-8 flex flex-wrap gap-2.5">
                {[
                  { icon: <Bike className="h-4 w-4" />, label: "Livraison en <2h" },
                  { icon: <Smartphone className="h-4 w-4" />, label: "Mobile Money" },
                  { icon: <MapPin className="h-4 w-4" />, label: "Points Relais" },
                  { icon: <Shield className="h-4 w-4" />, label: "100% Sécurisé" },
                ].map(p => (
                  <div key={p.label} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/65">
                    <span className="text-[#FF7A00]">{p.icon}</span>
                    {p.label}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right – visual stack */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.2 }}
              className="relative hidden lg:block">
              {/* Main image */}
              <div className="relative overflow-hidden rounded-3xl border border-white/15 shadow-2xl">
                <img src={heroImage}
                  alt="Livreur SEEDO" className="h-[420px] w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B2A4A] via-[#0B2A4A]/10 to-transparent" />
              </div>
              {/* Floating card - tracking */}
              <motion.div
                animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-5 -left-6 rounded-2xl border border-white/20 bg-[#0e3558]/90 p-4 shadow-2xl backdrop-blur-md w-52">
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs font-semibold text-green-400">En route</span>
                </div>
                <p className="text-xs text-white/60 mb-1">Commande #SED-4821</p>
                <div className="h-1.5 rounded-full bg-white/10">
                  <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-[#FF7A00] to-[#ffb347]" />
                </div>
                <p className="mt-2 text-xs text-white/50">Livraison dans ~18 min</p>
              </motion.div>
              {/* Floating card - payment */}
              <motion.div
                animate={{ y: [0, 6, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -top-5 -right-4 rounded-2xl border border-white/20 bg-[#0e3558]/90 p-4 shadow-2xl backdrop-blur-md w-44">
                <div className="mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span className="text-xs font-semibold text-green-400">Payé</span>
                </div>
                <p className="font-bold text-lg text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>2 500 F</p>
                <p className="text-xs text-white/50">via MTN MoMo</p>
              </motion.div>
            </motion.div>
          </div>

          {/* Scroll hint */}
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:block">
            <ChevronDown className="h-6 w-6 text-white/30" />
          </motion.div>
        </div>
      </section>

      {/* ── PROGRESS BAR ──────────────────────────────────── */}
      <section className="relative border-y border-white/8 bg-white/3 px-6 py-8 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm text-white">Développement de la plateforme</p>
              <p className="text-xs text-white/50 mt-0.5">Lancement officiel prévu Q2 2026</p>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <span className="font-bold text-2xl text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>{progress}%</span>
            </div>
          </div>
          <div className="relative h-2.5 overflow-hidden rounded-full bg-white/10">
            <motion.div initial={{ width: 0 }} whileInView={{ width: `${progress}%` }}
              viewport={{ once: true }} transition={{ duration: 2.5, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-[#FF7A00] to-[#ffb347] relative">
              <div className="absolute inset-0 animate-pulse bg-white/15 rounded-full" />
            </motion.div>
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-1">
            {["✅ Infrastructure cloud", "✅ App Mobile", "⚙️ Réseau Livreurs", "⚙️ Partenariats Fintech"].map(item => (
              <span key={item} className="text-xs text-white/45">{item}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────── */}
      <section className="relative px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <StatCard value={waitlistCount} suffix="+" label="Entreprises en waitlist" sublabel="Et ça continue…" delay={0} />
            <StatCard value={500} suffix="+" label="Livreurs partenaires" sublabel="Réseau en expansion" delay={0.1} />
            <StatCard value={12} suffix="" label="Villes couvertes" sublabel="Tout le Bénin" delay={0.2} />
            <StatCard value={98} suffix="%" label="Satisfaction clients" sublabel="Phase pilote" delay={0.3} />
          </div>
        </div>
      </section>

      {/* ── SERVICES ──────────────────────────────────────── */}
      <section id="services" className="relative px-6 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#FF7A00]">Nos Services</p>
            <h2 className="mb-4 font-bold text-3xl text-white md:text-4xl" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Tout ce dont votre business a besoin
            </h2>
            <p className="mx-auto max-w-xl text-white/60">
              Une solution moderne pensée pour sécuriser, simplifier et optimiser la gestion des colis.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <Shield className="h-7 w-7" />,
                title: "Sécurité renforcée",
                desc: "Chaque colis est enregistré, identifié et suivi avec un code unique et un QR Code sécurisé.",
              },
              {
                icon: <MapPin className="h-7 w-7" />,
                title: "Traçabilité en temps réel",
                desc: "Suivez votre colis à chaque étape, du dépôt jusqu'au point de retrait final.",
              },
              {
                icon: <Smartphone className="h-7 w-7" />,
                title: "100% digital",
                desc: "Plus de papier. Tout est géré depuis une application moderne et une plateforme web.",
              },
              {
                icon: <Clock className="h-7 w-7" />,
                title: "Gain de temps",
                desc: "Réduction des erreurs, des pertes et des délais grâce à un processus clair et automatisé.",
              },
              {
                icon: <Package className="h-7 w-7" />,
                title: "Gestion simplifiée",
                desc: "Une solution pensée pour les agences, les transporteurs et les clients finaux.",
              },
              {
                icon: <TrendingUp className="h-7 w-7" />,
                title: "Solution évolutive",
                desc: "SEEDO s'adapte à la croissance de votre activité et à vos besoins futurs.",
              },
            ].map((svc, i) => (
              <motion.div key={svc.title}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm hover:border-[#FF7A00]/40 hover:bg-white/8 transition-all">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-[#FF7A00]/5 to-transparent rounded-2xl" />
                <div className="relative">
                  <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-[#FF7A00]/15 border border-[#FF7A00]/25 text-[#FF7A00]">
                    {svc.icon}
                  </div>
                  <h3 className="mb-3 font-bold text-lg text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>
                    {svc.title}
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed">{svc.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────── */}
      <section id="fonctionnement" className="relative border-y border-white/8 bg-white/3 px-6 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#FF7A00]">Fonctionnement</p>
            <h2 className="mb-4 font-bold text-3xl text-white md:text-4xl" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Comment fonctionne SEEDO ?
            </h2>
            <p className="mx-auto max-w-xl text-white/60">
              Un processus simple, rapide et sécurisé pour gérer vos colis du dpôt jusqu'au retrait.
            </p>
          </motion.div>

          <div className="relative">
            {/* connector line */}
            <div className="absolute top-12 left-0 right-0 hidden h-px bg-gradient-to-r from-transparent via-[#FF7A00]/30 to-transparent lg:block" />

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  step: 1,
                  icon: <PackageCheck className="h-8 w-8" />,
                  title: "Dépôt du colis",
                  desc: "L'agent enregistre le colis avec les informations essentielles et des photos.",
                },
                {
                  step: 2,
                  icon: <ScanLine className="h-8 w-8" />,
                  title: "Association du QR code",
                  desc: "Un QR code unique est scanné et associé au colis pour une traçabilité sécurisée.",
                },
                {
                  step: 3,
                  icon: <Eye className="h-8 w-8" />,
                  title: "Suivi en ligne",
                  desc: "Le client suit l'évolution du colis à tout moment via le site SEEDO.",
                },
                {
                  step: 4,
                  icon: <CheckCircle2 className="h-8 w-8" />,
                  title: "Retrait sécurisé",
                  desc: "Le colis est remis au destinataire après vérification et validation.",
                },
              ].map((step, i) => (
                <motion.div key={step.step}
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                  className="relative text-center">
                  <div className="relative inline-flex mb-6">
                    <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-[#FF7A00]/20 to-[#FF7A00]/5 border border-[#FF7A00]/25 flex items-center justify-center text-[#FF7A00]">
                      {step.icon}
                    </div>
                    <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-[#FF7A00] flex items-center justify-center font-bold text-white text-sm"
                      style={{ fontFamily: "Montserrat, sans-serif" }}>
                      {step.step}
                    </div>
                  </div>
                  <h3 className="mb-3 font-bold text-lg text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>
                    {step.title}
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Visual */}
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-14 relative overflow-hidden rounded-3xl border border-white/15 shadow-2xl">
            <img src={seedoPointRelaisImage}
              alt="SEEDO Point Relais" className="h-64 w-full object-cover md:h-80" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B2A4A]/92 via-[#0B2A4A]/60 to-[#0B2A4A]/20" />
            <div className="absolute inset-0 flex flex-col items-start justify-center px-8 md:px-16">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#FF7A00]">L'app SEEDO</p>
              <h3 className="mb-4 font-bold text-2xl text-white md:text-3xl" style={{ fontFamily: "Montserrat, sans-serif" }}>
                Gérez tout depuis votre smartphone
              </h3>
              <p className="mb-6 max-w-md text-sm text-white/70">
                L'application SEEDO centralise livraisons, paiements, historique et support en un seul endroit. Disponible sur iOS et Android dès le lancement.
              </p>
              <button onClick={() => setShowModal(true)}
                className="flex items-center gap-2 rounded-xl bg-[#FF7A00] px-6 py-3 font-bold text-sm text-white shadow-lg shadow-[#FF7A00]/30 hover:bg-[#ff8c1a] transition-all"
                style={{ fontFamily: "Montserrat, sans-serif" }}>
                Être notifié au lancement <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── WHY SEEDO ─────────────────────────────────────── */}
      <section id="avantages" className="relative px-6 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#FF7A00]">Pourquoi SEEDO</p>
            <h2 className="mb-4 font-bold text-3xl text-white md:text-4xl" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Pourquoi choisir SEEDO ?
            </h2>
            <p className="mx-auto max-w-xl text-white/60">
              Une solution pensée pour sécuriser, tracer et simplifier la gestion des colis au quotidien.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <ScanLine className="h-7 w-7" />,
                title: "Suivi en temps réel",
                desc: "Suivez l'état de vos colis à chaque étape, du dépôt jusqu'à la livraison finale.",
              },
              {
                icon: <Shield className="h-7 w-7" />,
                title: "Sécurité renforcée",
                desc: "QR codes uniques, traçabilité complète et preuves visuelles pour chaque colis.",
              },
              {
                icon: <Zap className="h-7 w-7" />,
                title: "Gain de temps",
                desc: "Réduction des erreurs, automatisation des processus et rapidité de traitement.",
              },
              {
                icon: <Users className="h-7 w-7" />,
                title: "Confiance & transparence",
                desc: "Clients, agences et partenaires partagent une information claire et fiable.",
              },
            ].map((card, i) => (
              <motion.div key={card.title}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm hover:border-[#FF7A00]/40 transition-all">
                <div className="absolute top-0 right-0 h-40 w-40 translate-x-12 -translate-y-12 rounded-full bg-[#FF7A00]/8 blur-3xl group-hover:bg-[#FF7A00]/15 transition-all" />
                <div className="relative">
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF7A00] to-[#ff8c1a] shadow-lg shadow-[#FF7A00]/20 text-white">
                    {card.icon}
                  </div>
                  <h3 className="mb-3 font-bold text-lg text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>
                    {card.title}
                  </h3>
                  <p className="text-sm text-white/65 leading-relaxed">{card.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ──────────────────────────────────── */}
      <section className="relative border-y border-white/8 bg-white/3 px-6 py-10 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl">
          <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-white/40">Propulsé & soutenu par</p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {[
              { icon: <Smartphone className="h-5 w-5 text-[#FF7A00]" />, label: "MTN Mobile Money SA" },
              { icon: <TrendingUp className="h-5 w-5 text-[#FF7A00]" />, label: "ADPME" },
              { icon: <Users className="h-5 w-5 text-[#FF7A00]" />, label: "Réseau CCIB" },
              { icon: <Truck className="h-5 w-5 text-[#FF7A00]" />, label: "AMAZONE AIRLINE" },
            ].map(p => (
              <div key={p.label} className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80">
                {p.icon} {p.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────── */}
      <section id="témoignages" className="relative px-6 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#FF7A00]">Témoignages</p>
            <h2 className="mb-4 font-bold text-3xl text-white md:text-4xl" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Ils nous font confiance
            </h2>
            <p className="text-white/60">Retours de notre phase pilote au Bénin</p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Amina Djossou",
                role: "Gérante, Boutique Lomé-Cotonou",
                avatar: "AD",
                quote: "Avant SEEDO, je perdais des clients faute de livraison fiable. Depuis la phase bêta, mes commandes ont augmenté de 60%. C'est la solution qu'on attendait.",
                stars: 5,
              },
              {
                name: "Kofi Mensah",
                role: "Fondateur, AfriShop Bénin",
                avatar: "KM",
                quote: "L'intégration MoMo change tout. Mes clients paient directement depuis leur téléphone, je reçois l'argent instantanément. Zéro litige, zéro friction.",
                stars: 5,
              },
              {
                name: "Fatou Sow",
                role: "Directrice Logistique, Dakar Export",
                avatar: "FS",
                quote: "Le suivi en temps réel est bluffant. Je sais exactement où est chaque colis, à chaque minute. Mes clients adorent les notifications WhatsApp automatiques.",
                stars: 5,
              },
            ].map((t, i) => (
              <motion.div key={t.name}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm hover:border-[#FF7A00]/30 transition-all">
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 text-[#FF7A00]" fill="#FF7A00" />
                  ))}
                </div>
                <p className="mb-6 text-sm text-white/75 leading-relaxed italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-gradient-to-br from-[#FF7A00] to-[#ff8c1a] flex items-center justify-center font-bold text-white text-sm"
                    style={{ fontFamily: "Montserrat, sans-serif" }}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{t.name}</p>
                    <p className="text-xs text-white/50">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────── */}
      <section className="relative px-6 py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl border border-[#FF7A00]/25 bg-gradient-to-br from-[#FF7A00]/12 via-[#FF7A00]/6 to-transparent p-10 text-center md:p-16 backdrop-blur-sm">
            {/* glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-[#FF7A00]/5 to-transparent" />
            <div className="relative">
              <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FF7A00]/15 border border-[#FF7A00]/30">
                <Package className="h-8 w-8 text-[#FF7A00]" />
              </div>
              <h2 className="mb-4 font-bold text-3xl text-white md:text-4xl" style={{ fontFamily: "Montserrat, sans-serif" }}>
                Rejoignez la révolution logistique
              </h2>
              <p className="mb-4 text-white/70 max-w-lg mx-auto">
                Les <span className="font-semibold text-white">early adopters</span> bénéficieront de tarifs préférentiels à vie, d'un onboarding personnalisé et d'un accès prioritaire à toutes les nouvelles fonctionnalités.
              </p>
              <p className="mb-8 text-sm text-white/50">
                ⚡ <span className="font-semibold text-[#FF7A00]">{waitlistCount}+</span> entreprises déjà inscrites — Places limitées pour la phase bêta
              </p>
              <motion.button onClick={() => setShowModal(true)}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-3 rounded-2xl bg-white px-10 py-4 font-bold text-[#0B2A4A] shadow-2xl text-lg hover:bg-white/90 transition-all"
                style={{ fontFamily: "Montserrat, sans-serif" }}>
                Obtenir mon accès bêta
                <ArrowRight className="h-5 w-5" />
              </motion.button>
              <p className="mt-4 text-xs text-white/40">Gratuit · Sans engagement · Données sécurisées</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer className="relative border-t border-white/10 px-6 pt-14 pb-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 md:grid-cols-4 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <SeedoLogo className="h-12 mb-4" />
              <p className="mb-4 font-bold text-lg text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>
                Envoyez. Payez. Livrez.
              </p>
              <p className="text-sm text-white/55 leading-relaxed max-w-sm">
                SEEDO réinvente la logistique digitale au Bénin en combinant livraison express et paiements mobiles dans un écosystème unique et accessible à tous.
              </p>
              <div className="mt-6 flex gap-3">
                {[Facebook, Instagram, Twitter].map((Icon, i) => (
                  <a key={i} href="#"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white/50 hover:border-[#FF7A00]/40 hover:text-[#FF7A00] transition-all">
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="mb-4 font-bold text-sm text-white uppercase tracking-wider" style={{ fontFamily: "Montserrat, sans-serif" }}>
                Services
              </h4>
              <ul className="space-y-2.5 text-sm text-white/55">
                {["Sécurité renforcée", "Traçabilité en temps réel", "100% digital", "Gain de temps", "Gestion simplifiée", "Solution évolutive"].map(s => (
                  <li key={s}><a href="#services" className="hover:text-[#FF7A00] transition-colors">{s}</a></li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="mb-4 font-bold text-sm text-white uppercase tracking-wider" style={{ fontFamily: "Montserrat, sans-serif" }}>
                Contact
              </h4>
              <ul className="space-y-3 text-sm text-white/55">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#FF7A00] flex-shrink-0" />
                  <a href="mailto:contact@seedo.bj" className="hover:text-white transition-colors">contact@seedo.bj</a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#FF7A00] flex-shrink-0" />
                  <a href="tel:+2290192004503" className="hover:text-white transition-colors">+229 01 92 00 45 03</a>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#FF7A00] flex-shrink-0" />
                  <span>Cotonou, Bénin 🇧🇯</span>
                </li>
                <li className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-[#FF7A00] flex-shrink-0" />
                  <a href="https://www.seedo.bj" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">www.seedo.bj</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/35">© 2026 SEEDO · Logistique & Fintech · Made in Benin 🇧🇯</p>
            <div className="flex gap-6 text-xs text-white/35">
              <a href="#" className="hover:text-white/60 transition-colors">Mentions légales</a>
              <a href="#" className="hover:text-white/60 transition-colors">Confidentialité</a>
              <a href="#" className="hover:text-white/60 transition-colors">CGU</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ── MODAL ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <WaitlistModal
            onClose={() => setShowModal(false)}
            waitlistCount={waitlistCount}
            setWaitlistCount={setWaitlistCount}
          />
        )}
      </AnimatePresence>
    </div>
  );
}