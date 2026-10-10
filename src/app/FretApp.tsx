import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import {
  ArrowRight, Truck, Package, MapPin, Flag, Shield, HandCoins, Zap,
  ChevronDown, Menu, X, CheckCircle2, Calculator, TrendingUp, Receipt,
  Smartphone, Phone, Mail, Globe, Facebook, Linkedin, Twitter, Info, Search, TruckIcon
} from "lucide-react";
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

function SeedoMarkIcon({ size = "md" }: { size?: "sm" | "md" }) {
  const box = size === "sm" ? "p-2 rounded-lg" : "p-2.5 rounded-xl";
  const icon = size === "sm" ? "w-5 h-5" : "w-7 h-7";
  return (
    <div className={`bg-[#0B2A4A] ${box} shadow-md flex items-center justify-center flex-shrink-0`}>
      <svg className={`${icon} text-[#FF7A00]`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
      </svg>
    </div>
  );
}

/* ── nav ────────────────────────────────────────────────── */
function FretNavbar({ onCtaClick }: { onCtaClick: () => void }) {
  const [open, setOpen] = useState(false);
  const links = [
    { label: "Pourquoi SeedoFret", href: "#pourquoi" },
    { label: "Comment ça marche", href: "#comment-ca-marche" },
    { label: "Calculateur d'Impact", href: "#calculateur" },
    { label: "L'Impact", href: "#impact" },
    { label: "FAQ", href: "#faq" },
  ];
  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <a href="#" className="flex items-center gap-3 group">
          <SeedoMarkIcon />
          <div className="flex flex-col leading-none">
            <span className="text-2xl font-extrabold tracking-tight text-[#0B2A4A]" style={{ fontFamily: "Montserrat, sans-serif" }}>
              SEEDO<span className="text-[#FF7A00]">Fret</span>
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase mt-0.5">seedo.bj • Fret SaaS Ouest Africain</span>
          </div>
        </a>
        <nav className="hidden md:flex items-center gap-7">
          {links.map(l => (
            <a key={l.label} href={l.href}
              className="text-sm text-slate-600 hover:text-[#FF7A00] transition-colors font-semibold">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden sm:flex items-center gap-3">
          <button onClick={onCtaClick} className="text-sm font-bold text-[#0B2A4A] hover:text-[#FF7A00] transition-colors px-4 py-2.5">
            Connexion
          </button>
          <button onClick={onCtaClick}
            className="flex items-center gap-2 rounded-xl bg-[#FF7A00] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#FF7A00]/25 hover:bg-[#ff8c1a] transition-all transform hover:-translate-y-0.5">
            <Truck className="h-4 w-4" /> Trouver un camion
          </button>
        </div>
        <button className="md:hidden text-slate-700 hover:text-[#0B2A4A] p-2" onClick={() => setOpen(o => !o)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 overflow-hidden">
            {links.map(l => (
              <a key={l.label} href={l.href} onClick={() => setOpen(false)}
                className="block py-2 text-slate-700 font-medium hover:text-[#FF7A00]">{l.label}</a>
            ))}
            <div className="pt-4 flex flex-col gap-3">
              <button onClick={() => { setOpen(false); onCtaClick(); }}
                className="w-full py-2.5 text-center font-bold text-[#0B2A4A] border border-slate-300 rounded-xl">
                Connexion
              </button>
              <button onClick={() => { setOpen(false); onCtaClick(); }}
                className="w-full py-2.5 text-center font-bold text-white bg-[#FF7A00] rounded-xl shadow-md">
                Trouver un camion
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ── waitlist modal (collection Firestore dédiée au fret) ─────────── */
type FretProfileId = "expediteur" | "transporteur";
const FRET_PROFILES: { id: FretProfileId; icon: React.ReactNode; label: string; desc: string }[] = [
  { id: "expediteur", icon: <Package className="h-6 w-6" />, label: "Réserver un fret", desc: "Je cherche un véhicule pour transporter une marchandise" },
  { id: "transporteur", icon: <Truck className="h-6 w-6" />, label: "Devenir transporteur", desc: "Je veux recevoir des demandes de transport compatibles" },
];

function FretWaitlistModal({ onClose, waitlistCount, setWaitlistCount }:
  { onClose: () => void; waitlistCount: number; setWaitlistCount: React.Dispatch<React.SetStateAction<number>> }) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [profile, setProfile] = useState<FretProfileId | null>(null);
  const [form, setForm] = useState({ nom: "", telephone: "", email: "", ville: "" });
  const [loading, setLoading] = useState(false);

  const selectedProfile = FRET_PROFILES.find(p => p.id === profile);
  const villes = ["Cotonou", "Parakou", "Malanville", "Autre (Bénin)", "Hors Bénin"];

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
      alert("Cet email est déjà inscrit à la liste d'attente SeedoFret.");
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
            <SeedoMarkIcon size="sm" />
            <span className="text-sm font-extrabold text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>
              SEEDO<span className="text-[#FF7A00]">Fret</span>
            </span>
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
                  Rejoindre SeedoFret
                </h2>
                <p className="mb-5 text-sm text-white/50">
                  Saisissez vos informations pour être recontacté sous 24h.
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
                      placeholder="ex: Logistique Bénin SA"
                      className="w-full rounded-xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white placeholder-white/25 focus:border-[#FF7A00] focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/15 transition-all" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-white/60">Téléphone (WhatsApp) *</label>
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
                      <option value="" disabled>Cotonou, Parakou…</option>
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
                  En vous inscrivant, vous acceptez de recevoir des notifications sur le lancement de SeedoFret.
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
                  <h3 className="mb-2 font-bold text-2xl text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>Merci ! 🎉</h3>
                  <p className="text-sm text-white/60 leading-relaxed mb-4">
                    Votre demande a bien été enregistrée. Notre équipe commerciale vous recontacte sous 24h.
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

/* ── compteur animé ─────────────────────────────────────── */
function Counter({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const { count, ref } = useCountUp(target);
  return <span ref={ref}>{prefix}{count}{suffix}</span>;
}

/* ── profils expéditeur / transporteur ─────────────────────────────── */
const SHIPPER_CARDS = [
  { icon: <HandCoins className="h-6 w-6" />, title: "Réduction des Coûts de Fret", desc: "Accédez aux tarifs préférentiels des camions effectuant leur trajet de retour. Économisez jusqu'à 35% sur vos expéditions régulières." },
  { icon: <Zap className="h-6 w-6" />, title: "Réservation Instantanée", desc: "Fini les négociations interminables. Obtenez une cotation instantanée et transparente, et confirmez votre camion certifié en 3 clics." },
  { icon: <Shield className="h-6 w-6" />, title: "Suivi & Sécurité Garantie", desc: "Visualisez en temps réel la géolocalisation de vos marchandises. Tous nos transporteurs partenaires sont scrupuleusement audités." },
];
const CARRIER_CARDS = [
  { icon: <TrendingUp className="h-6 w-6" />, title: "Maximisation des Revenus", desc: "Convertissez chaque retour à vide en profit direct. Ne roulez plus jamais à perte sur vos trajets de retour." },
  { icon: <Receipt className="h-6 w-6" />, title: "Paiement Garanti & Rapide", desc: "Bénéficiez du paiement automatisé dès la confirmation de livraison par le destinataire, évitant les retards de trésorerie." },
  { icon: <Smartphone className="h-6 w-6" />, title: "Application Chauffeur Intuitive", desc: "Une application simple conçue pour les chauffeurs et gestionnaires de flotte. Recevez des propositions d'offres directement sur votre téléphone." },
];

/* ── Calculateur Profit & CO2 ───────────────────────────────────────
   Coefficients calibrés sur l'exemple de référence (750 km, 12 camions
   → 5 400 000 FCFA gain transporteur / 2 700 000 FCFA économie -30% /
   10,8 tonnes CO2) : 600 FCFA/km pour le transporteur, 300 FCFA/km
   (= 30% d'un tarif standard ~1000 FCFA/km) pour l'expéditeur, 1,2 kg
   CO2/km évité par camion. ─────────────────────────────────────── */
function ImpactCalculator({ onCta }: { onCta: () => void }) {
  const [distance, setDistance] = useState(750);
  const [trucks, setTrucks] = useState(12);

  const revenue = distance * 600 * trucks;
  const savings = distance * 300 * trucks;
  const co2 = distance * 0.0012 * trucks;
  const trees = Math.round(co2 * (450 / 10.8));

  const fmt = (n: number) => Math.round(n).toLocaleString("fr-FR") + " FCFA";

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="p-8 sm:p-12 lg:col-span-7 flex flex-col justify-between">
          <div>
            <span className="text-[#FF7A00] font-bold text-xs uppercase tracking-wider bg-[#FFE5CC] px-3 py-1 rounded-full">
              Simulateur Économique & Écologique
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2A4A] mt-3 mb-2" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Calculez votre impact SeedoFret
            </h2>
            <p className="text-slate-600 text-sm mb-8">
              Ajustez les paramètres ci-dessous pour estimer vos gains financiers et la réduction de votre empreinte carbone sur vos corridors routiers.
            </p>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs sm:text-sm font-bold text-slate-700">Distance moyenne par trajet (km) :</label>
                <span className="text-base font-extrabold text-[#0B2A4A]">{distance} km</span>
              </div>
              <input type="range" min={200} max={2500} step={50} value={distance}
                onChange={e => setDistance(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#FF7A00]" />
              <div className="flex justify-between text-[11px] text-slate-400 font-semibold mt-1">
                <span>200 km (Cotonou-Parakou)</span>
                <span>1050 km (Cotonou-Niamey)</span>
                <span>2500 km</span>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs sm:text-sm font-bold text-slate-700">Nombre de camions par mois :</label>
                <span className="text-base font-extrabold text-[#FF7A00]">{trucks} camions</span>
              </div>
              <input type="range" min={1} max={100} step={1} value={trucks}
                onChange={e => setTrucks(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0B2A4A]" />
              <div className="flex justify-between text-[11px] text-slate-400 font-semibold mt-1">
                <span>1 camion</span>
                <span>50 camions</span>
                <span>100 camions</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3 text-xs text-slate-600">
            <Info className="h-5 w-5 text-[#FF7A00] flex-shrink-0" />
            <span>Basé sur le prix moyen constaté des trajets de fret en Afrique de l'Ouest (Bénin, Togo, Niger, Burkina).</span>
          </div>
        </div>

        <div className="bg-[#0B2A4A] p-8 sm:p-12 lg:col-span-5 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-[#FF7A00]/20 rounded-full blur-2xl" />
          <div>
            <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-4 mb-6 flex items-center justify-between" style={{ fontFamily: "Montserrat, sans-serif" }}>
              <span>Résultats Estimés / Mois</span>
              <Calculator className="h-5 w-5 text-[#FF7A00]" />
            </h3>
            <div className="space-y-6">
              <div>
                <span className="text-xs text-slate-300 font-medium block mb-1">Gain additionnel pour Transporteur</span>
                <p className="text-2xl sm:text-3xl font-black text-[#FF7A00]" style={{ fontFamily: "Montserrat, sans-serif" }}>{fmt(revenue)}</p>
                <span className="text-[11px] text-slate-400">Revenus capturés sur les retours à vide</span>
              </div>
              <div>
                <span className="text-xs text-slate-300 font-medium block mb-1">Économies pour Expéditeur (-30%)</span>
                <p className="text-2xl sm:text-3xl font-black text-emerald-400" style={{ fontFamily: "Montserrat, sans-serif" }}>{fmt(savings)}</p>
                <span className="text-[11px] text-slate-400">Économisées sur le budget fret global</span>
              </div>
              <div>
                <span className="text-xs text-slate-300 font-medium block mb-1">Réduction d'Émissions CO₂</span>
                <p className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>{co2.toFixed(1)} Tonnes</p>
                <span className="text-[11px] text-slate-400">Équivalent à ~{trees} arbres plantés</span>
              </div>
            </div>
          </div>
          <button onClick={onCta}
            className="w-full mt-8 bg-[#FF7A00] hover:bg-[#ff8c1a] text-white font-bold py-3.5 rounded-xl shadow-lg transition-all text-center">
            Profiter de ces économies
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── FAQ ────────────────────────────────────────────────── */
const FAQ_ITEMS = [
  { q: "Comment SeedoFret garantit-il la sécurité des marchandises ?", a: "Tous les transporteurs du réseau SeedoFret passent par un processus strict de vérification d'identité, de contrôle des permis et d'audit de l'état technique des véhicules. De plus, chaque chargement est géolocalisé en temps réel." },
  { q: "Quels sont les axes routiers couverts en Afrique de l'Ouest ?", a: "Nous couvrons principalement le Bénin (Cotonou, Parakou, Malanville), ainsi que les corridors inter-états vers le Niger (Niamey), le Togo (Lomé), le Burkina Faso (Ouagadougou) et le Nigeria." },
  { q: "Comment est fixé le prix de la course ?", a: "La tarification est calculée automatiquement par notre algorithme SaaS en fonction du type de marchandise, de la distance et du statut du camion (trajet de retour). Il n'y a aucun frais caché." },
];

function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <div className="space-y-4">
      {FAQ_ITEMS.map((item, i) => (
        <div key={item.q} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <button onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full text-left p-5 font-bold text-[#0B2A4A] flex justify-between items-center gap-4">
            <span className="text-sm sm:text-base">{item.q}</span>
            <ChevronDown className={`h-5 w-5 text-[#FF7A00] flex-shrink-0 transition-transform ${openIndex === i ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {openIndex === i && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden">
                <p className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">{item.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN FRET APP
═══════════════════════════════════════════════════════════ */
export default function FretApp() {
  const [showModal, setShowModal] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState(41);
  const [role, setRole] = useState<"shippers" | "carriers">("shippers");

  const [origin, setOrigin] = useState("Cotonou (Bénin)");
  const [destination, setDestination] = useState("Niamey (Niger)");
  const [searched, setSearched] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC]" style={{ fontFamily: "Inter, sans-serif" }}>
      <FretNavbar onCtaClick={() => setShowModal(true)} />

      {/* HERO */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-[#FF7A00]/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-[#0B2A4A]/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            <div className="lg:col-span-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFE5CC] border border-[#FF7A00]/20 text-[#FF7A00] text-xs font-bold uppercase tracking-wider mb-6">
                <span className="w-2 h-2 rounded-full bg-[#FF7A00] animate-ping" />
                Plateforme Fret SaaS pour le Bénin & l'Afrique de l'Ouest
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0B2A4A] leading-tight tracking-tight mb-6" style={{ fontFamily: "Montserrat, sans-serif" }}>
                Transformez chaque trajet à vide en <span className="text-[#FF7A00] underline decoration-[#FF7A00]/30">opportunité de revenu</span>.
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                La plateforme qui connecte expéditeurs et transporteurs au Bénin et en Afrique de l'Ouest. Réduisez vos coûts logistiques, rentabilisez vos retours à vide et diminuez vos émissions de CO₂ en quelques clics.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setShowModal(true)}
                  className="w-full sm:w-auto bg-[#FF7A00] hover:bg-[#ff8c1a] text-white font-bold text-base px-8 py-4 rounded-xl shadow-xl shadow-[#FF7A00]/30 transition-all flex items-center justify-center gap-3"
                  style={{ fontFamily: "Montserrat, sans-serif" }}>
                  <span>Réserver un fret maintenant</span>
                  <ArrowRight className="h-5 w-5" />
                </motion.button>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setShowModal(true)}
                  className="w-full sm:w-auto bg-white border-2 border-[#0B2A4A] text-[#0B2A4A] hover:bg-[#0B2A4A] hover:text-white font-bold text-base px-8 py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  style={{ fontFamily: "Montserrat, sans-serif" }}>
                  <Truck className="h-5 w-5" />
                  <span>Devenir Transporteur</span>
                </motion.button>
              </div>

              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#0B2A4A]" style={{ fontFamily: "Montserrat, sans-serif" }}><Counter target={99} suffix="%" /></p>
                  <p className="text-xs text-slate-500 font-medium">Taux de succès</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#0B2A4A]" style={{ fontFamily: "Montserrat, sans-serif" }}>-<Counter target={35} suffix="%" /></p>
                  <p className="text-xs text-slate-500 font-medium">Coûts de transport</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#FF7A00]" style={{ fontFamily: "Montserrat, sans-serif" }}>0 km</p>
                  <p className="text-xs text-slate-500 font-medium">Kilomètres gâchés, notre objectif</p>
                </div>
              </div>
            </div>

            {/* Widget recherche */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-8 relative">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Recherche Instantanée de Camions</span>
                  </div>
                  <span className="text-xs bg-[#0B2A4A] text-white font-bold px-2.5 py-1 rounded-md">142 Disponibles</span>
                </div>

                <form onSubmit={e => { e.preventDefault(); setSearched(true); }} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Lieu de départ (Origine)</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-[#FF7A00]" />
                      <select value={origin} onChange={e => setOrigin(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]">
                        {["Cotonou (Bénin)", "Parakou (Bénin)", "Lomé (Togo)", "Niamey (Niger)", "Ouagadougou (Burkina)"].map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Destination finale</label>
                    <div className="relative">
                      <Flag className="absolute left-3.5 top-3 h-4 w-4 text-[#0B2A4A]" />
                      <select value={destination} onChange={e => setDestination(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]">
                        {["Niamey (Niger)", "Ouagadougou (Burkina Faso)", "Malanville (Bénin)", "Lomé (Togo)", "Kano (Nigeria)"].map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Type de Marchandise</label>
                      <select className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]">
                        {["Conteneur / Vrac", "Agroalimentaire", "Matériaux BTP", "Marchandise Générale"].map(v => <option key={v}>{v}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Poids (Tonnes)</label>
                      <input type="number" placeholder="ex: 25" min={1} max={60} defaultValue={30}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" />
                    </div>
                  </div>

                  <button type="submit"
                    className="w-full bg-[#0B2A4A] hover:bg-[#14325C] text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-2">
                    <Search className="h-4 w-4 text-[#FF7A00]" />
                    <span>Voir les camions retour disponibles</span>
                  </button>
                </form>

                <div className="mt-6 pt-5 border-t border-slate-100 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#0B2A4A] flex items-center gap-1.5">
                      <TruckIcon className="h-3.5 w-3.5 text-[#FF7A00]" />Camion Plateau 35T trouvé !
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Retour à vide dans 4h</span>
                  </div>
                  <div className="text-xs text-slate-600 flex justify-between items-center">
                    <span>Axe: <strong className="text-slate-800">{searched ? `${origin} → ${destination}` : "Cotonou → Niamey"}</strong></span>
                    <span className="text-[#FF7A00] font-extrabold text-sm">-35% vs tarif standard</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* POURQUOI SEEDOFRET */}
      <section id="pourquoi" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#FF7A00] font-bold text-sm tracking-wider uppercase bg-[#FFE5CC] px-3.5 py-1.5 rounded-full">Problématique & Solution</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B2A4A] mt-4 mb-4" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Chaque année, des millions de camions traversent l'Afrique de l'Ouest à vide.
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              Nous transformons cette inefficacité logistique en valeur nette grâce au jumelage intelligent et aux données temps réel.
            </p>
          </div>

          <div className="flex justify-center mb-10">
            <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
              <button onClick={() => setRole("shippers")}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${role === "shippers" ? "bg-[#0B2A4A] text-white shadow-md" : "text-slate-600 hover:text-[#0B2A4A]"}`}>
                <Package className="h-4 w-4" />Pour les Expéditeurs
              </button>
              <button onClick={() => setRole("carriers")}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${role === "carriers" ? "bg-[#0B2A4A] text-white shadow-md" : "text-slate-600 hover:text-[#0B2A4A]"}`}>
                <Truck className="h-4 w-4" />Pour les Transporteurs
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(role === "shippers" ? SHIPPER_CARDS : CARRIER_CARDS).map(card => (
              <div key={card.title} className="p-8 rounded-2xl bg-[#F8FAFC] border border-slate-200 hover:border-[#FF7A00]/40 transition-all hover:shadow-xl">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-6 ${role === "shippers" ? "bg-[#FFE5CC] text-[#FF7A00]" : "bg-[#0B2A4A]/10 text-[#0B2A4A]"}`}>
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold text-[#0B2A4A] mb-3" style={{ fontFamily: "Montserrat, sans-serif" }}>{card.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMENT CA MARCHE */}
      <section id="comment-ca-marche" className="py-20 bg-[#0B2A4A] text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#FF7A00] font-bold text-sm tracking-wider uppercase bg-[#FF7A00]/10 px-3.5 py-1.5 rounded-full border border-[#FF7A00]/20">Processus Digitalisé</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 mb-4" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Comment fonctionne SeedoFret ? 🚛
            </h2>
            <p className="text-slate-300 text-base sm:text-lg">
              Une logistique intelligente en 3 étapes simples pour connecter les besoins de chargement et l'offre de camions disponibles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-[#FF7A00] via-slate-600 to-[#FF7A00] -translate-y-12 z-0" />

            {[
              { n: 1, title: "Accès en Temps Réel", desc: "Les transporteurs déclarent leurs trajets de retour prévus. Les expéditeurs accèdent à l'inventaire en direct des camions vides disponibles.", bg: "bg-[#FF7A00]" },
              { n: 2, title: "Réservation Instantanée", desc: "L'algorithme apparie la marchandise et le camion idéal au meilleur prix garanti. Tarification claire sans frais cachés.", bg: "bg-[#14325C] border-2 border-[#FF7A00] text-[#FF7A00]" },
              { n: 3, title: "Transport & Suivi 99%", desc: "Livraison sécurisée avec suivi GPS en direct et confirmation numérique de livraison (POD) pour débloquer le paiement instantané.", bg: "bg-emerald-500" },
            ].map(step => (
              <div key={step.n} className="relative z-10 bg-[#0B2A4A]/80 p-8 rounded-2xl border border-slate-700/80 backdrop-blur-md flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-2xl ${step.bg} text-white text-2xl font-black flex items-center justify-center shadow-lg mb-6`}
                  style={{ fontFamily: "Montserrat, sans-serif" }}>
                  {step.n}
                </div>
                <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "Montserrat, sans-serif" }}>{step.title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALCULATEUR */}
      <section id="calculateur" className="py-20 bg-[#F8FAFC] border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ImpactCalculator onCta={() => setShowModal(true)} />
        </div>
      </section>

      {/* IMPACT */}
      <section id="impact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#FF7A00] font-bold text-sm tracking-wider uppercase bg-[#FFE5CC] px-3.5 py-1.5 rounded-full">L'Impact SeedoFret 🚀</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B2A4A] mt-4 mb-4" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Des résultats concrets pour l'écosystème Ouest-Africain
            </h2>
            <p className="text-slate-600 text-base">
              Une plateforme résolument axée sur la création de valeur partagée et la durabilité.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: 99, suffix: "%", prefix: "", title: "Fiabilité du Réseau", desc: "Taux de réussite de service et respect des délais de livraison.", color: "text-[#0B2A4A]" },
              { value: 35, suffix: "%", prefix: "-", title: "Coûts Logistiques", desc: "Réduction moyenne des frais de transport routier pour nos expéditeurs.", color: "text-[#FF7A00]" },
              { value: 100, suffix: "%", prefix: "+", title: "Optimisation Retour", desc: "Opportunités de revenus supplémentaires sur des trajets auparavant à vide.", color: "text-[#0B2A4A]" },
              { value: 1500, suffix: "+", prefix: "", title: "Camions Enregistrés", desc: "Soutenant la fluidité du commerce transfrontalier en Afrique de l'Ouest.", color: "text-emerald-600" },
            ].map(m => (
              <div key={m.title} className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 text-center transform hover:-translate-y-1 transition-all">
                <div className={`text-4xl font-black mb-2 ${m.color}`} style={{ fontFamily: "Montserrat, sans-serif" }}>
                  <Counter target={m.value} suffix={m.suffix} prefix={m.prefix} />
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#FF7A00] mb-2">{m.title}</div>
                <p className="text-xs text-slate-600">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-[#F8FAFC] border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#0B2A4A]" style={{ fontFamily: "Montserrat, sans-serif" }}>Foire Aux Questions</h2>
            <p className="text-slate-600 text-sm mt-2">Tout ce que vous devez savoir pour démarrer avec SeedoFret.</p>
          </div>
          <FaqAccordion />
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#0B2A4A] relative overflow-hidden text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Rejoignez le réseau de transport routier en Afrique de l'Ouest
          </h2>
          <p className="text-slate-300 text-base max-w-2xl mx-auto mb-8">
            Que vous soyez un expéditeur cherchant à optimiser vos coûts ou un transporteur désireux d'éliminer les retours à vide, SeedoFret est votre partenaire.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={() => setShowModal(true)}
              className="bg-[#FF7A00] hover:bg-[#ff8c1a] text-white font-bold px-8 py-4 rounded-xl shadow-xl transition-all">
              Créer mon compte SeedoFret
            </button>
            <button onClick={() => setShowModal(true)}
              className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 font-bold px-8 py-4 rounded-xl transition-all">
              Contacter l'équipe commerciale
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#071e35] text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <SeedoMarkIcon size="sm" />
                <span className="text-xl font-black text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>
                  SEEDO<span className="text-[#FF7A00]">Fret</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Plateforme numérique de fret intelligente monétisant les retours à vide des camions au Bénin et en Afrique de l'Ouest.
              </p>
              <div className="flex gap-3 text-slate-300">
                {[Linkedin, Facebook, Twitter].map((Icon, i) => (
                  <a key={i} href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-[#FF7A00] transition-colors">
                    <Icon className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-4" style={{ fontFamily: "Montserrat, sans-serif" }}>Plateforme</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#pourquoi" className="hover:text-[#FF7A00]">Pour Expéditeurs</a></li>
                <li><a href="#pourquoi" className="hover:text-[#FF7A00]">Pour Transporteurs</a></li>
                <li><a href="#calculateur" className="hover:text-[#FF7A00]">Simulateur d'Impact</a></li>
                <li><a href="#impact" className="hover:text-[#FF7A00]">Couverture Régionale</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-4" style={{ fontFamily: "Montserrat, sans-serif" }}>Corridors Clés</h4>
              <ul className="space-y-2 text-xs">
                <li><span>Cotonou ↔ Niamey</span></li>
                <li><span>Lomé ↔ Ouagadougou</span></li>
                <li><span>Cotonou ↔ Parakou</span></li>
                <li><span>Cotonou ↔ Kano</span></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-4" style={{ fontFamily: "Montserrat, sans-serif" }}>Contact & Siège</h4>
              <ul className="space-y-3 text-xs">
                <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#FF7A00] flex-shrink-0" />Cotonou, Bénin</li>
                <li className="flex items-center gap-2"><Globe className="h-4 w-4 text-[#FF7A00] flex-shrink-0" /><a href="https://www.seedo.bj" className="hover:text-[#FF7A00]">seedo.bj</a></li>
                <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-[#FF7A00] flex-shrink-0" /><a href="mailto:contact@seedo.bj" className="hover:text-[#FF7A00]">contact@seedo.bj</a></li>
                <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-[#FF7A00] flex-shrink-0" /><a href="tel:+2290192004503" className="hover:text-[#FF7A00] font-bold text-white">+229 01 92 00 45 03</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs">
            <p>© 2026 SeedoFret (<a href="https://seedo.bj" className="text-[#FF7A00] font-bold hover:underline">seedo.bj</a>). Tous droits réservés.</p>
            <div className="flex gap-4 mt-2 sm:mt-0">
              <a href="#" className="hover:text-white">Mentions Légales</a>
              <a href="#" className="hover:text-white">Politique de Confidentialité</a>
            </div>
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
