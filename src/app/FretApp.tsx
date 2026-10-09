import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import {
  ArrowRight, Truck, Package, MapPin, Flag, Clock, Shield,
  ChevronDown, Menu, X, CheckCircle2, Calculator, Scale,
  Phone, Mail, Globe, Facebook, Linkedin, MessageCircle, Info
} from "lucide-react";
import { Link } from "react-router";
import logoImage from "../imports/ChatGPT_Image_1_avr._2026,_08_48_33.png";

import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";

/* ── helpers (volontairement dupliqués de App.tsx pour ne jamais risquer
   de casser la page colis existante en y touchant) ─────────────────── */
function useCountUp(target: number, duration = 1200) {
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

function SeedoLogo({ className = "h-10" }: { className?: string }) {
  return <img src={logoImage} alt="SEEDO" className={className} style={{ objectFit: "contain" }} />;
}

/* ── nav ────────────────────────────────────────────────── */
function FretNavbar({ onCtaClick }: { onCtaClick: () => void }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  const links = [
    { label: "Pourquoi", href: "#pourquoi" },
    { label: "Comment ça marche", href: "#comment-ca-marche" },
    { label: "Simulateur", href: "#calculateur" },
    { label: "Le pilote", href: "#pilote" },
    { label: "FAQ", href: "#faq" },
  ];
  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#0B2A4A]/95 shadow-2xl backdrop-blur-md" : "bg-transparent"}`}>
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <SeedoLogo className="h-9" />
          <span className="text-lg font-extrabold text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>
            <span className="text-[#FF7A00]">Fret</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <a key={l.label} href={l.href}
              className="text-sm text-white/80 hover:text-[#FF7A00] transition-colors font-medium">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <Link to="/colis" className="text-xs text-white/50 hover:text-white transition-colors">
            Envoyer un colis →
          </Link>
          <button onClick={onCtaClick}
            className="rounded-xl bg-[#FF7A00] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#FF7A00]/30 hover:bg-[#ff8c1a] transition-all"
            style={{ fontFamily: "Montserrat, sans-serif" }}>
            Obtenir une cotation
          </button>
        </div>
        <button className="md:hidden text-white" onClick={() => setOpen(o => !o)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 bg-[#0B2A4A]/98 backdrop-blur-md px-6 py-6 space-y-4">
            {links.map(l => (
              <a key={l.label} href={l.href} onClick={() => setOpen(false)}
                className="block text-white/80 hover:text-[#FF7A00] font-medium">{l.label}</a>
            ))}
            <Link to="/colis" onClick={() => setOpen(false)} className="block text-sm text-white/50 hover:text-white">
              Envoyer un colis →
            </Link>
            <button onClick={() => { setOpen(false); onCtaClick(); }}
              className="w-full rounded-xl bg-[#FF7A00] py-3 font-bold text-white"
              style={{ fontFamily: "Montserrat, sans-serif" }}>
              Obtenir une cotation
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ── waitlist modal (collection Firestore dédiée au fret) ─────────── */
type FretProfileId = "expediteur" | "transporteur";
const FRET_PROFILES: { id: FretProfileId; icon: React.ReactNode; label: string; desc: string }[] = [
  { id: "expediteur", icon: <Package className="h-6 w-6" />, label: "Envoyer du fret", desc: "Je cherche un véhicule pour transporter une marchandise" },
  { id: "transporteur", icon: <Truck className="h-6 w-6" />, label: "Devenir transporteur", desc: "Je veux recevoir des missions de transport compatibles" },
];

function FretWaitlistModal({ onClose, waitlistCount, setWaitlistCount }:
  { onClose: () => void; waitlistCount: number; setWaitlistCount: React.Dispatch<React.SetStateAction<number>> }) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [profile, setProfile] = useState<FretProfileId | null>(null);
  const [form, setForm] = useState({ nom: "", telephone: "", email: "", ville: "" });
  const [loading, setLoading] = useState(false);

  const selectedProfile = FRET_PROFILES.find(p => p.id === profile);
  const villes = ["Cotonou", "Calavi", "Godomey", "Akpakpa", "Autre"];

  const handleProfileSelect = (id: FretProfileId) => {
    setProfile(id);
    setTimeout(() => setStep(1), 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom || !form.telephone || !form.email || !form.ville || !profile) return;
    setLoading(true);

    const q = query(collection(db, "liste_attente_fret"), where("email", "==", form.email));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      alert("Cet email est déjà inscrit à la liste d'attente SEEDO Fret.");
      setLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, "liste_attente_fret"), {
        nom: form.nom,
        telephone: form.telephone,
        email: form.email,
        ville: form.ville,
        typeUtilisateur: profile,
        createdAt: serverTimestamp(),
      });
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

        <div className="h-1 w-full bg-gradient-to-r from-[#FF7A00] via-[#ffb347] to-[#FF7A00]" />
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-white/20" />
        </div>

        <div className="flex items-center justify-between px-6 pt-4 pb-3">
          <div className="flex items-center gap-2">
            <SeedoLogo className="h-8" />
            <span className="text-sm font-extrabold text-[#FF7A00]" style={{ fontFamily: "Montserrat, sans-serif" }}>Fret</span>
          </div>
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
            {step === 0 && (
              <motion.div key="step0"
                initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.22 }}>
                <h2 className="mb-1 font-bold text-xl text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>
                  Rejoindre SEEDO Fret
                </h2>
                <p className="mb-5 text-sm text-white/50">
                  Pilote Cotonou / Calavi. Soyez parmi les premiers à tester le service.
                </p>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">Je souhaite…</p>
                <div className="space-y-2.5">
                  {FRET_PROFILES.map((p, i) => (
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
                        <p className="font-bold text-sm text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>{p.label}</p>
                        <p className="text-xs text-white/45 mt-0.5 truncate">{p.desc}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 flex-shrink-0 text-white/20 group-hover:text-[#FF7A00] group-hover:translate-x-0.5 transition-all" />
                    </motion.button>
                  ))}
                </div>
                <p className="mt-5 text-center text-xs text-white/25">🔒 Aucun spam · Données sécurisées</p>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step1"
                initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.22 }}>
                <div className="mb-5 flex items-center justify-between">
                  {selectedProfile && (
                    <div className="flex items-center gap-2 rounded-xl bg-[#FF7A00]/12 border border-[#FF7A00]/25 px-3 py-2">
                      <span className="text-[#FF7A00]">{selectedProfile.icon}</span>
                      <span className="text-sm font-semibold text-[#FF7A00]">{selectedProfile.label}</span>
                    </div>
                  )}
                  <button onClick={() => setStep(0)} className="text-xs text-white/35 hover:text-white/65 transition-colors underline underline-offset-2">
                    ← Changer
                  </button>
                </div>

                <h2 className="mb-1 font-bold text-xl text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>Vos informations</h2>
                <p className="mb-5 text-sm text-white/45">Tous les champs sont requis.</p>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-white/60">Nom complet / Entreprise *</label>
                    <input type="text" required value={form.nom}
                      onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                      placeholder="Ets Dossou & Fils"
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
                      <option value="" disabled>Cotonou, Calavi…</option>
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
                      <>S'inscrire <ArrowRight className="h-5 w-5" /></>
                    )}
                  </motion.button>
                </form>
                <p className="mt-3 text-center text-xs text-white/25">
                  En vous inscrivant, vous acceptez de recevoir des notifications sur le lancement de SEEDO Fret.
                </p>
              </motion.div>
            )}

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
                    <CheckCircle2 className="h-8 w-8 text-white" />
                  </motion.div>
                </div>
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <h3 className="mb-2 font-bold text-2xl text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>Bienvenue à bord ! 🎉</h3>
                  <p className="text-sm text-white/60 leading-relaxed mb-4">
                    Vous faites partie des <span className="font-bold text-[#FF7A00]">{waitlistCount} pionniers</span> du pilote SEEDO Fret à Cotonou/Calavi.
                  </p>
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
function StatBlock({ value, suffix = "", prefix = "", label, delay = 0 }:
  { value: number; suffix?: string; prefix?: string; label: string; delay?: number }) {
  const { count, ref } = useCountUp(value);
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ delay }} className="text-center">
      <div className="mb-1 font-bold text-3xl text-[#FF7A00] md:text-4xl" style={{ fontFamily: "Montserrat, sans-serif" }}>
        {prefix}{count}{suffix}
      </div>
      <p className="text-sm font-medium text-white/70">{label}</p>
    </motion.div>
  );
}

/* ── pricing simulator (formule §9 du cahier des charges) ─────────── */
const PRICING = { forfait: 40000, coutKm: 550, coutTonne: 4000, backhaulRemise: 0.20, vitesseKmh: 50 };

function formatFcfa(n: number) {
  return Math.round(n).toLocaleString("fr-FR") + " FCFA";
}
function vehicleForTonnage(t: number) {
  if (t <= 3.5) return "Véhicule léger";
  if (t <= 19) return "Véhicule moyen";
  return "Véhicule lourd / semi-remorque";
}

function PricingSimulator({ onCta }: { onCta: () => void }) {
  const [distance, setDistance] = useState(18);
  const [tonnage, setTonnage] = useState(2);
  const [backhaul, setBackhaul] = useState(false);

  let price = PRICING.forfait + distance * PRICING.coutKm + tonnage * PRICING.coutTonne;
  if (backhaul) price *= 1 - PRICING.backhaulRemise;
  const etaHours = distance / PRICING.vitesseKmh;
  const etaLabel = etaHours < 1 ? `${Math.round(etaHours * 60)} min` : `${etaHours.toFixed(1)} h`;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
      <div className="grid lg:grid-cols-12">
        <div className="p-8 sm:p-10 lg:col-span-7">
          <span className="text-[#FF7A00] font-bold text-xs uppercase tracking-wider bg-[#FF7A00]/10 border border-[#FF7A00]/20 px-3 py-1 rounded-full">
            Simulateur indicatif
          </span>
          <h3 className="mt-4 mb-2 font-bold text-2xl text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Estimez votre course Cotonou-Calavi
          </h3>
          <p className="text-sm text-white/60 mb-8">
            Basé sur la formule de tarification SEEDO Fret : forfait + distance + tonnage, avec remise backhaul.
          </p>

          <div className="mb-7">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-white/80">Distance du trajet</label>
              <span className="font-bold text-white">{distance} km</span>
            </div>
            <input type="range" min={2} max={60} step={1} value={distance}
              onChange={e => setDistance(Number(e.target.value))}
              className="w-full h-2 bg-white/15 rounded-lg appearance-none cursor-pointer accent-[#FF7A00]" />
          </div>

          <div className="mb-7">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-white/80">Tonnage transporté</label>
              <span className="font-bold text-white">{tonnage} t</span>
            </div>
            <input type="range" min={0.5} max={20} step={0.5} value={tonnage}
              onChange={e => setTonnage(Number(e.target.value))}
              className="w-full h-2 bg-white/15 rounded-lg appearance-none cursor-pointer accent-[#FF7A00]" />
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-6 cursor-pointer">
            <input type="checkbox" checked={backhaul} onChange={e => setBackhaul(e.target.checked)}
              className="accent-[#FF7A00] w-4 h-4" />
            Trajet retour optimisé (backhaul) — remise jusqu'à 20%
          </label>

          <div className="flex items-start gap-3 text-xs text-white/40 bg-white/5 rounded-xl p-4 border border-white/8">
            <Info className="h-4 w-4 text-[#FF7A00] flex-shrink-0 mt-0.5" />
            Estimation indicative pour le pilote Cotonou/Calavi ; les tarifs réels restent administrables en back-office.
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#FF7A00]/15 to-transparent lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <span className="text-xs text-white/50 font-medium block mb-1">Prix estimé (offre Standard)</span>
              <p className="text-3xl font-black text-[#FF7A00]" style={{ fontFamily: "Montserrat, sans-serif" }}>{formatFcfa(price)}</p>
            </div>
            <div>
              <span className="text-xs text-white/50 font-medium block mb-1">ETA estimé</span>
              <p className="text-2xl font-black text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>{etaLabel}</p>
            </div>
            <div>
              <span className="text-xs text-white/50 font-medium block mb-1">Véhicule recommandé</span>
              <p className="text-xl font-black text-emerald-400" style={{ fontFamily: "Montserrat, sans-serif" }}>{vehicleForTonnage(tonnage)}</p>
            </div>
          </div>
          <button onClick={onCta}
            className="w-full mt-8 bg-[#FF7A00] hover:bg-[#ff8c1a] text-white font-bold py-3.5 rounded-xl shadow-lg transition-all">
            Obtenir la cotation exacte
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── FAQ ────────────────────────────────────────────────── */
const FAQ_ITEMS = [
  { q: "Dois-je connaître le type de camion dont j'ai besoin ?", a: "Non. Vous décrivez votre marchandise, son poids et son volume : SEEDO détermine automatiquement la catégorie et le gabarit du véhicule, y compris pour les cas particuliers (frigorifique, citerne, benne, hors gabarit, conteneur)." },
  { q: "Quelle est la zone couverte par le pilote ?", a: "Le pilote démarre sur l'axe Cotonou / Calavi avec un nombre maîtrisé de catégories de marchandises et de véhicules, avant un élargissement progressif." },
  { q: "Comment le prix de la course est-il fixé ?", a: "Le prix combine un forfait de prise en charge, un coût au kilomètre, un coût au tonnage et la manutention éventuelle, avec remise backhaul si applicable. Le détail est toujours visible avant confirmation." },
  { q: "Que se passe-t-il si le véhicule recommandé n'est plus disponible ?", a: "Le Smart Match passe automatiquement au candidat compatible suivant selon le score (adéquation, distance, fiabilité, ponctualité). Si aucun véhicule n'est compatible, un message clair vous propose de programmer la course ou de demander de l'assistance." },
];

function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <div className="space-y-3">
      {FAQ_ITEMS.map((item, i) => (
        <div key={item.q} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <button onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full text-left p-5 font-bold text-white flex justify-between items-center gap-4">
            <span className="text-sm sm:text-base">{item.q}</span>
            <ChevronDown className={`h-5 w-5 text-[#FF7A00] flex-shrink-0 transition-transform ${openIndex === i ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {openIndex === i && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden">
                <p className="px-5 pb-5 text-sm text-white/60 leading-relaxed border-t border-white/8 pt-4">{item.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN FRET APP — pilote Cotonou / Calavi
═══════════════════════════════════════════════════════════ */
export default function FretApp() {
  const [showModal, setShowModal] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState(41);
  const [role, setRole] = useState<"shippers" | "carriers">("shippers");

  const [origin, setOrigin] = useState("Cotonou");
  const [destination, setDestination] = useState("Calavi");
  const [formSubmitted, setFormSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B2A4A]" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#FF7A00]/8 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 h-[400px] w-[400px] rounded-full bg-[#FF7A00]/6 blur-[100px]" />
      </div>

      <FretNavbar onCtaClick={() => setShowModal(true)} />

      {/* HERO */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-14 items-center lg:grid-cols-12">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}
              className="lg:col-span-7">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#FF7A00]/30 bg-[#FF7A00]/10 px-4 py-2 text-xs font-semibold text-[#FF7A00]">
                <span className="h-2 w-2 rounded-full bg-[#FF7A00] animate-pulse" />
                Pilote Cotonou / Calavi — par l'équipe SEEDO
              </div>

              <h1 className="mb-6 font-bold text-4xl leading-[1.1] text-white md:text-5xl lg:text-6xl" style={{ fontFamily: "Montserrat, sans-serif" }}>
                Le fret aussi simple à commander qu'un{" "}
                <span className="bg-gradient-to-r from-[#FF7A00] to-[#ffb347] bg-clip-text text-transparent">coursier SEEDO</span>
              </h1>
              <p className="mb-8 text-lg text-white/70 leading-relaxed max-w-xl">
                Vous ne choisissez pas le camion : vous décrivez ce que vous transportez, SEEDO détermine le véhicule, calcule le prix et trouve le transporteur réellement disponible.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 max-w-lg mb-8">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setShowModal(true)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#ff8c1a] px-7 py-4 font-bold text-white shadow-xl shadow-[#FF7A00]/30 transition-all"
                  style={{ fontFamily: "Montserrat, sans-serif" }}>
                  <Package className="h-5 w-5" /> Obtenir une cotation
                </motion.button>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setShowModal(true)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#0B2A4A] border-2 border-[#1a4a7a] px-7 py-4 font-bold text-white hover:border-[#FF7A00]/50 transition-all"
                  style={{ fontFamily: "Montserrat, sans-serif" }}>
                  <Truck className="h-5 w-5 text-[#FF7A00]" /> Devenir transporteur
                </motion.button>
              </div>

              <div className="grid grid-cols-3 gap-4 max-w-md pt-6 border-t border-white/10">
                <div>
                  <p className="text-2xl font-extrabold text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>3</p>
                  <p className="text-xs text-white/50">Offres par cotation</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>8h</p>
                  <p className="text-xs text-white/50">Sameday max.</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-[#FF7A00]" style={{ fontFamily: "Montserrat, sans-serif" }}>-20%</p>
                  <p className="text-xs text-white/50">Remise backhaul</p>
                </div>
              </div>
            </motion.div>

            {/* Quote widget */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-5">
              <div className="rounded-3xl border border-white/15 bg-[#0e3558]/80 backdrop-blur-md shadow-2xl p-6 sm:p-8">
                <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-6">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white/70">Que voulez-vous transporter ?</span>
                </div>

                <form onSubmit={e => { e.preventDefault(); setFormSubmitted(true); }} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-white/60 mb-1.5">Origine</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-[#FF7A00]" />
                      <select value={origin} onChange={e => setOrigin(e.target.value)}
                        className="w-full bg-white/8 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#FF7A00] appearance-none">
                        {["Cotonou", "Calavi", "Akpakpa", "Godomey"].map(v => <option key={v} value={v} className="text-slate-900">{v}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/60 mb-1.5">Destination</label>
                    <div className="relative">
                      <Flag className="absolute left-3.5 top-3.5 h-4 w-4 text-white/70" />
                      <select value={destination} onChange={e => setDestination(e.target.value)}
                        className="w-full bg-white/8 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#FF7A00] appearance-none">
                        {["Calavi", "Cotonou", "Godomey", "Zone universitaire"].map(v => <option key={v} value={v} className="text-slate-900">{v}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-white/60 mb-1.5">Marchandise</label>
                      <select className="w-full bg-white/8 border border-white/15 rounded-xl px-3 py-3 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#FF7A00] appearance-none">
                        {["Marchandise générale", "Produit périssable", "Liquide / citerne", "Matériaux BTP", "Conteneur"].map(v => <option key={v} className="text-slate-900">{v}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/60 mb-1.5">Poids (t)</label>
                      <div className="relative">
                        <Scale className="absolute left-3 top-3.5 h-3.5 w-3.5 text-white/50" />
                        <input type="number" defaultValue={2} min={0.1} step={0.1}
                          className="w-full bg-white/8 border border-white/15 rounded-xl pl-8 pr-3 py-3 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" />
                      </div>
                    </div>
                  </div>
                  <button type="submit"
                    className="w-full bg-white text-[#0B2A4A] font-bold py-3.5 rounded-xl shadow-lg hover:bg-white/90 transition-all flex items-center justify-center gap-2">
                    Voir les 3 offres <ArrowRight className="h-4 w-4" />
                  </button>
                </form>

                <AnimatePresence>
                  {formSubmitted && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                      className="mt-5 pt-5 border-t border-white/10 overflow-hidden">
                      <div className="bg-white/8 rounded-xl p-4 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Truck className="h-3.5 w-3.5 text-[#FF7A00]" /> Véhicule compatible trouvé
                          </span>
                          <span className="bg-[#FF7A00]/20 text-[#FF7A00] text-[10px] font-bold px-2 py-0.5 rounded-full">Standard recommandée</span>
                        </div>
                        <div className="text-xs text-white/70 flex justify-between">
                          <span>{origin} → {destination}</span>
                          <span className="text-[#FF7A00] font-bold">3 offres générées</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* POURQUOI */}
      <section id="pourquoi" className="relative border-y border-white/8 bg-white/3 px-6 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#FF7A00]">Le principe SEEDO Fret</p>
            <h2 className="mb-4 font-bold text-3xl text-white md:text-4xl" style={{ fontFamily: "Montserrat, sans-serif" }}>
              « Vous ne choisissez pas le camion.<br className="hidden sm:block" /> Vous décrivez ce que vous voulez transporter. »
            </h2>
            <p className="mx-auto max-w-xl text-white/60">
              SEEDO s'occupe du reste : dimensionnement, tarification, 3 offres comparables et recherche du transporteur réellement disponible.
            </p>
          </div>

          <div className="flex justify-center mb-10">
            <div className="inline-flex p-1.5 bg-white/5 rounded-2xl border border-white/10">
              <button onClick={() => setRole("shippers")}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${role === "shippers" ? "bg-[#FF7A00] text-white shadow-md" : "text-white/60"}`}>
                Pour les expéditeurs
              </button>
              <button onClick={() => setRole("carriers")}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${role === "carriers" ? "bg-[#FF7A00] text-white shadow-md" : "text-white/60"}`}>
                Pour les transporteurs
              </button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {(role === "shippers" ? [
              { icon: <Package className="h-6 w-6" />, title: "Trois offres claires", desc: "Économique, Standard (recommandée) ou Express : prix, délai et véhicule visibles avant confirmation." },
              { icon: <Clock className="h-6 w-6" />, title: "Cotation en secondes", desc: "Décrivez la marchandise, le poids et le trajet : SEEDO calcule automatiquement le gabarit adapté et le prix final." },
              { icon: <Shield className="h-6 w-6" />, title: "Suivi & preuve de livraison", desc: "Statut de course en temps réel, confirmation OTP/QR, paiement sécurisé en séquestre jusqu'à livraison." },
            ] : [
              { icon: <Truck className="h-6 w-6" />, title: "Moins de trajets à vide", desc: "SEEDO Smart Match propose des courses compatibles avec votre position, remise backhaul jusqu'à 20%." },
              { icon: <CheckCircle2 className="h-6 w-6" />, title: "Paiement sécurisé", desc: "Paiement séquestré à la commande, débloqué dès confirmation de livraison." },
              { icon: <MapPin className="h-6 w-6" />, title: "Missions compatibles", desc: "Déclarez vos disponibilités, recevez les demandes compatibles, acceptez ou refusez en un geste." },
            ]).map(card => (
              <div key={card.title} className="rounded-2xl border border-white/10 bg-white/5 p-7 hover:border-[#FF7A00]/40 transition-all">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF7A00]/12 border border-[#FF7A00]/20 text-[#FF7A00]">
                  {card.icon}
                </div>
                <h3 className="mb-2 font-bold text-lg text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>{card.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMENT CA MARCHE */}
      <section id="comment-ca-marche" className="relative px-6 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#FF7A00]">Du besoin à la livraison</p>
            <h2 className="mb-4 font-bold text-3xl text-white md:text-4xl" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Comment fonctionne SEEDO Fret ?
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { n: 1, title: "Décrivez votre besoin", desc: "Marchandise, poids, volume, origine, destination et date. Aucun vocabulaire technique requis." },
              { n: 2, title: "SEEDO dimensionne et tarife", desc: "Type de carrosserie, nombre de véhicules et prix final calculés automatiquement. Trois offres vous sont présentées." },
              { n: 3, title: "Smart Match & suivi", desc: "SEEDO affecte le transporteur réellement disponible et vous suivez la course jusqu'à la livraison confirmée." },
            ].map(step => (
              <div key={step.n} className="relative rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF7A00] font-black text-white text-xl"
                  style={{ fontFamily: "Montserrat, sans-serif" }}>
                  {step.n}
                </div>
                <h3 className="mb-3 font-bold text-lg text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>{step.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALCULATEUR */}
      <section id="calculateur" className="relative border-y border-white/8 bg-white/3 px-6 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <PricingSimulator onCta={() => setShowModal(true)} />
        </div>
      </section>

      {/* PILOTE */}
      <section id="pilote" className="relative px-6 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#FF7A00]">Le pilote Cotonou / Calavi</p>
            <h2 className="mb-4 font-bold text-3xl text-white md:text-4xl" style={{ fontFamily: "Montserrat, sans-serif" }}>
              On démarre maîtrisé, puis on élargit
            </h2>
            <p className="mx-auto max-w-xl text-white/60">
              La priorité n'est pas de couvrir tout le fret béninois dès le départ, mais de prouver la chaîne complète.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <StatBlock value={waitlistCount} suffix="+" label="Inscrits à la liste d'attente" />
            <StatBlock value={20} prefix="-" suffix="%" label="Remise backhaul max." />
            <StatBlock value={8} suffix="h" label="Sameday max." />
            <StatBlock value={100} suffix="%" label="Surcharges bloquées" />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative border-t border-white/8 px-6 py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <h2 className="font-bold text-3xl text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>Foire aux questions</h2>
          </div>
          <FaqAccordion />
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-6 py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl border border-[#FF7A00]/25 bg-gradient-to-br from-[#FF7A00]/12 via-[#FF7A00]/6 to-transparent p-10 text-center md:p-16">
            <h2 className="mb-4 font-bold text-3xl text-white md:text-4xl" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Rejoignez le pilote SEEDO Fret
            </h2>
            <p className="mb-8 text-white/70 max-w-lg mx-auto">
              Expéditeur à la recherche d'un véhicule fiable ou transporteur voulant réduire vos trajets à vide : SEEDO Fret s'occupe du reste.
            </p>
            <button onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-3 rounded-2xl bg-white px-10 py-4 font-bold text-[#0B2A4A] shadow-2xl text-lg hover:bg-white/90 transition-all"
              style={{ fontFamily: "Montserrat, sans-serif" }}>
              Rejoindre SEEDO Fret <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative border-t border-white/10 px-6 pt-14 pb-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 md:grid-cols-4 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <SeedoLogo className="h-11" />
                <span className="text-lg font-extrabold text-[#FF7A00]" style={{ fontFamily: "Montserrat, sans-serif" }}>Fret</span>
              </div>
              <p className="text-sm text-white/55 leading-relaxed max-w-sm">
                Le volet fret de SEEDO : cotation automatique, 3 offres comparables et matching des transporteurs disponibles. Pilote Cotonou / Calavi.
              </p>
              <div className="mt-6 flex gap-3">
                {[Facebook, Linkedin, MessageCircle].map((Icon, i) => (
                  <a key={i} href="#" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white/50 hover:border-[#FF7A00]/40 hover:text-[#FF7A00] transition-all">
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="mb-4 font-bold text-sm text-white uppercase tracking-wider" style={{ fontFamily: "Montserrat, sans-serif" }}>Plateforme</h4>
              <ul className="space-y-2.5 text-sm text-white/55">
                <li><a href="#pourquoi" className="hover:text-[#FF7A00] transition-colors">Pour expéditeurs</a></li>
                <li><a href="#pourquoi" className="hover:text-[#FF7A00] transition-colors">Pour transporteurs</a></li>
                <li><a href="#calculateur" className="hover:text-[#FF7A00] transition-colors">Simulateur</a></li>
                <li><Link to="/colis" className="hover:text-[#FF7A00] transition-colors">SEEDO Colis</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-bold text-sm text-white uppercase tracking-wider" style={{ fontFamily: "Montserrat, sans-serif" }}>Contact</h4>
              <ul className="space-y-3 text-sm text-white/55">
                <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-[#FF7A00] flex-shrink-0" /><a href="mailto:contact@seedo.bj" className="hover:text-white transition-colors">contact@seedo.bj</a></li>
                <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-[#FF7A00] flex-shrink-0" /><a href="tel:+2290192004503" className="hover:text-white transition-colors">+229 01 92 00 45 03</a></li>
                <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#FF7A00] flex-shrink-0" /><span>Cotonou, Bénin 🇧🇯</span></li>
                <li className="flex items-center gap-2"><Globe className="h-4 w-4 text-[#FF7A00] flex-shrink-0" /><a href="https://www.seedo.bj" className="hover:text-white transition-colors">www.seedo.bj</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/35">© 2026 SEEDO Fret · Made in Benin 🇧🇯</p>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showModal && (
          <FretWaitlistModal onClose={() => setShowModal(false)} waitlistCount={waitlistCount} setWaitlistCount={setWaitlistCount} />
        )}
      </AnimatePresence>
    </div>
  );
}
