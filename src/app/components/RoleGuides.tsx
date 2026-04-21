import { motion } from "motion/react";
import { Code2, Paintbrush, PrinterIcon, Megaphone, Truck, MapPin, Download, FileCode, Package2, Layers, Palette, ImageIcon } from "lucide-react";
import logoImage from "../../imports/ChatGPT_Image_1_avr._2026,_08_48_33.png";

function SeedoMiniLogo() {
  return (
    <img src={logoImage} alt="SEEDO" style={{ height: 32, objectFit: 'contain' }} />
  );
}

interface RoleGuidesProps {
  selectedRole: string | null;
}

export function RoleGuides({ selectedRole }: RoleGuidesProps) {
  return (
    <>
      {selectedRole === 'dev' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-8 overflow-hidden rounded-2xl border-2 border-[#FF7A00] bg-white shadow-2xl"
        >
          <div className="bg-gradient-to-r from-[#0B2A4A] to-[#0e3558] p-6">
            <div className="flex items-center gap-3">
              <Code2 className="h-8 w-8 text-[#FF7A00]" />
              <h3 className="font-bold text-2xl text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Guide Développeur
              </h3>
            </div>
          </div>
          
          <div className="p-8">
            <div className="mb-8">
              <h4 className="mb-4 font-bold text-xl text-[#0B2A4A]">🎨 Tokens CSS / Variables Design</h4>
              <div className="rounded-lg bg-gray-900 p-6 font-mono text-sm">
                <pre className="overflow-x-auto text-green-400">
{`:root {
  /* Couleurs Principales */
  --seedo-orange: #FF7A00;
  --seedo-blue: #0B2A4A;
  
  /* Couleurs Secondaires */
  --seedo-orange-light: #FF8C1A;
  --seedo-orange-lighter: #FFE5CC;
  --seedo-blue-light: #0E3558;
  --seedo-blue-lighter: #E3EAF1;
  
  /* Neutrals */
  --seedo-gray-900: #1A1A1A;
  --seedo-gray-600: #666666;
  --seedo-gray-300: #CCCCCC;
  --seedo-gray-100: #F5F5F5;
  
  /* Typographie */
  --font-heading: 'Montserrat', sans-serif;
  --font-body: 'Inter', sans-serif;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
}`}</pre>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="mb-4 font-bold text-xl text-[#0B2A4A]">⚛️ Composants React</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-gray-200 p-4">
                  <h5 className="mb-2 font-semibold text-gray-900">Button Primary</h5>
                  <div className="mb-3 rounded bg-gray-100 p-3">
                    <button className="rounded-lg bg-[#FF7A00] px-6 py-3 font-semibold text-white">
                      Envoyer un colis
                    </button>
                  </div>
                  <code className="text-xs text-gray-600">
                    className="bg-[#FF7A00] text-white px-6 py-3 rounded-lg font-semibold"
                  </code>
                </div>
                
                <div className="rounded-lg border border-gray-200 p-4">
                  <h5 className="mb-2 font-semibold text-gray-900">Button Secondary</h5>
                  <div className="mb-3 rounded bg-gray-100 p-3">
                    <button className="rounded-lg border-2 border-[#0B2A4A] bg-white px-6 py-3 font-semibold text-[#0B2A4A]">
                      En savoir plus
                    </button>
                  </div>
                  <code className="text-xs text-gray-600">
                    className="border-2 border-[#0B2A4A] bg-white text-[#0B2A4A] px-6 py-3 rounded-lg"
                  </code>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="mb-4 font-bold text-xl text-[#0B2A4A]">📏 Guidelines de Code</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-lg bg-green-50 p-4">
                  <div className="text-2xl">✓</div>
                  <div>
                    <p className="font-semibold text-green-900">Utiliser les tokens CSS</p>
                    <p className="text-green-800 text-sm">Toujours utiliser var(--seedo-orange) au lieu de #FF7A00 en dur</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-green-50 p-4">
                  <div className="text-2xl">✓</div>
                  <div>
                    <p className="font-semibold text-green-900">Accessibilité d'abord</p>
                    <p className="text-green-800 text-sm">Ratio de contraste minimum 4.5:1, aria-labels sur tous les boutons</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-green-50 p-4">
                  <div className="text-2xl">✓</div>
                  <div>
                    <p className="font-semibold text-green-900">Responsive by default</p>
                    <p className="text-green-800 text-sm">Mobile-first, breakpoints standards : 640px, 768px, 1024px, 1280px</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-4 font-bold text-xl text-[#0B2A4A]">📦 Ressources Téléchargeables</h4>
              <div className="grid gap-3 md:grid-cols-2">
                <button className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 text-left transition-all hover:border-[#FF7A00] hover:shadow-md">
                  <FileCode className="h-8 w-8 text-[#FF7A00]" />
                  <div>
                    <p className="font-semibold text-gray-900">Tokens CSS complets</p>
                    <p className="text-gray-600 text-sm">seedo-tokens.css - 8 KB</p>
                  </div>
                </button>
                <button className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 text-left transition-all hover:border-[#FF7A00] hover:shadow-md">
                  <Package2 className="h-8 w-8 text-[#FF7A00]" />
                  <div>
                    <p className="font-semibold text-gray-900">Composants React</p>
                    <p className="text-gray-600 text-sm">@seedo/ui-components - NPM</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {selectedRole === 'designer' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-8 overflow-hidden rounded-2xl border-2 border-[#FF7A00] bg-white shadow-2xl"
        >
          <div className="bg-gradient-to-r from-[#FF7A00] to-[#ff8c1a] p-6">
            <div className="flex items-center gap-3">
              <Paintbrush className="h-8 w-8 text-white" />
              <h3 className="font-bold text-2xl text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Guide Designer
              </h3>
            </div>
          </div>
          
          <div className="p-8">
            <div className="mb-8">
              <h4 className="mb-4 font-bold text-xl text-[#0B2A4A]">🎨 Palette Couleurs Complète</h4>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <div className="h-24 rounded-lg bg-[#FF7A00] shadow-md"></div>
                  <p className="font-mono text-sm text-gray-900">#FF7A00</p>
                  <p className="text-xs text-gray-600">Orange Principal</p>
                </div>
                <div className="space-y-2">
                  <div className="h-24 rounded-lg bg-[#0B2A4A] shadow-md"></div>
                  <p className="font-mono text-sm text-gray-900">#0B2A4A</p>
                  <p className="text-xs text-gray-600">Bleu Nuit</p>
                </div>
                <div className="space-y-2">
                  <div className="h-24 rounded-lg bg-[#FFE5CC] shadow-md"></div>
                  <p className="font-mono text-sm text-gray-900">#FFE5CC</p>
                  <p className="text-xs text-gray-600">Orange Pastel</p>
                </div>
                <div className="space-y-2">
                  <div className="h-24 rounded-lg bg-[#E3EAF1] shadow-md"></div>
                  <p className="font-mono text-sm text-gray-900">#E3EAF1</p>
                  <p className="text-xs text-gray-600">Bleu Pastel</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="mb-4 font-bold text-xl text-[#0B2A4A]">📐 Système de Grille & Spacing</h4>
              <div className="rounded-lg border border-gray-200 p-6">
                <div className="mb-4 grid grid-cols-8 gap-2">
                  {[4, 8, 16, 24, 32, 48, 64, 96].map((space) => (
                    <div key={space} className="text-center">
                      <div className="mb-2 h-16 rounded bg-[#FF7A00]" style={{ height: `${space}px` }}></div>
                      <p className="text-xs text-gray-600">{space}px</p>
                    </div>
                  ))}
                </div>
                <p className="text-gray-600 text-sm">
                  <strong>Échelle 8pt :</strong> Tous les espacements sont multiples de 8 (4, 8, 16, 24, 32, 48, 64, 96)
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="mb-4 font-bold text-xl text-[#0B2A4A]">✏️ Typographie Hiérarchie</h4>
              <div className="space-y-4 rounded-lg border border-gray-200 p-6">
                <div>
                  <p className="mb-1 text-xs text-gray-500">H1 - Montserrat Bold 48px</p>
                  <p className="font-bold text-5xl" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Titre Principal
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs text-gray-500">H2 - Montserrat Bold 32px</p>
                  <p className="font-bold text-3xl" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Sous-titre Section
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs text-gray-500">Body - Inter Regular 16px</p>
                  <p className="text-base" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Texte courant pour le contenu principal, lisible et accessible
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-4 font-bold text-xl text-[#0B2A4A]">📦 Fichiers Design</h4>
              <div className="grid gap-3 md:grid-cols-2">
                <button className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 text-left transition-all hover:border-[#FF7A00] hover:shadow-md">
                  <Layers className="h-8 w-8 text-[#FF7A00]" />
                  <div>
                    <p className="font-semibold text-gray-900">Bibliothèque Figma</p>
                    <p className="text-gray-600 text-sm">Design System complet</p>
                  </div>
                </button>
                <button className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 text-left transition-all hover:border-[#FF7A00] hover:shadow-md">
                  <Palette className="h-8 w-8 text-[#FF7A00]" />
                  <div>
                    <p className="font-semibold text-gray-900">Palette ASE/ACO</p>
                    <p className="text-gray-600 text-sm">Pour Adobe CC et Sketch</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {selectedRole === 'print' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-8 overflow-hidden rounded-2xl border-2 border-[#FF7A00] bg-white shadow-2xl"
        >
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6">
            <div className="flex items-center gap-3">
              <PrinterIcon className="h-8 w-8 text-[#FF7A00]" />
              <h3 className="font-bold text-2xl text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Guide Imprimeur
              </h3>
            </div>
          </div>
          
          <div className="p-8">
            <div className="mb-8">
              <h4 className="mb-4 font-bold text-xl text-[#0B2A4A]">🎨 Couleurs CMJN (Print)</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border-2 border-[#FF7A00] p-6">
                  <div className="mb-4 h-24 rounded-lg bg-[#FF7A00]"></div>
                  <h5 className="mb-2 font-bold text-lg text-gray-900">Orange SEEDO</h5>
                  <div className="space-y-1 text-sm">
                    <p><strong>HEX:</strong> #FF7A00</p>
                    <p><strong>RGB:</strong> R255 G122 B0</p>
                    <p><strong>CMJN:</strong> C0 M52 J100 N0</p>
                    <p><strong>Pantone:</strong> 1505 C</p>
                  </div>
                </div>
                
                <div className="rounded-lg border-2 border-[#0B2A4A] p-6">
                  <div className="mb-4 h-24 rounded-lg bg-[#0B2A4A]"></div>
                  <h5 className="mb-2 font-bold text-lg text-gray-900">Bleu Nuit SEEDO</h5>
                  <div className="space-y-1 text-sm">
                    <p><strong>HEX:</strong> #0B2A4A</p>
                    <p><strong>RGB:</strong> R11 G42 B74</p>
                    <p><strong>CMJN:</strong> C100 M77 J32 N48</p>
                    <p><strong>Pantone:</strong> 7463 C</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="mb-4 font-bold text-xl text-[#0B2A4A]">📄 Formats Standards</h4>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h5 className="mb-2 font-semibold text-gray-900">Carte de Visite</h5>
                  <p className="text-sm text-gray-700">85 × 55 mm</p>
                  <p className="text-xs text-gray-600">+3mm fond perdu</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h5 className="mb-2 font-semibold text-gray-900">Flyer A5</h5>
                  <p className="text-sm text-gray-700">148 × 210 mm</p>
                  <p className="text-xs text-gray-600">+3mm fond perdu</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h5 className="mb-2 font-semibold text-gray-900">Affiche A3</h5>
                  <p className="text-sm text-gray-700">297 × 420 mm</p>
                  <p className="text-xs text-gray-600">+3mm fond perdu</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="mb-4 font-bold text-xl text-[#0B2A4A]">⚙️ Spécifications Techniques</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4">
                  <div className="text-2xl">📐</div>
                  <div>
                    <p className="font-semibold text-gray-900">Résolution minimum</p>
                    <p className="text-gray-600 text-sm">300 DPI pour tous les visuels print</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4">
                  <div className="text-2xl">📁</div>
                  <div>
                    <p className="font-semibold text-gray-900">Formats acceptés</p>
                    <p className="text-gray-600 text-sm">PDF/X-1a:2001, AI, EPS (logos en vectoriel uniquement)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4">
                  <div className="text-2xl">🎯</div>
                  <div>
                    <p className="font-semibold text-gray-900">Zones de sécurité</p>
                    <p className="text-gray-600 text-sm">Marge intérieure minimum 5mm pour textes importants</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-4 font-bold text-xl text-[#0B2A4A]">📦 Fichiers Print-Ready</h4>
              <div className="grid gap-3 md:grid-cols-2">
                <button className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 text-left transition-all hover:border-[#FF7A00] hover:shadow-md">
                  <Download className="h-8 w-8 text-[#FF7A00]" />
                  <div>
                    <p className="font-semibold text-gray-900">Logos Vectoriels</p>
                    <p className="text-gray-600 text-sm">EPS, AI, PDF - 2.4 MB</p>
                  </div>
                </button>
                <button className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 text-left transition-all hover:border-[#FF7A00] hover:shadow-md">
                  <Download className="h-8 w-8 text-[#FF7A00]" />
                  <div>
                    <p className="font-semibold text-gray-900">Templates InDesign</p>
                    <p className="text-gray-600 text-sm">INDD + PDF - 12 MB</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {selectedRole === 'marketing' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-8 overflow-hidden rounded-2xl border-2 border-[#FF7A00] bg-white shadow-2xl"
        >
          <div className="bg-gradient-to-r from-[#FF7A00] to-[#ff8c1a] p-6">
            <div className="flex items-center gap-3">
              <Megaphone className="h-8 w-8 text-white" />
              <h3 className="font-bold text-2xl text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Guide Marketing
              </h3>
            </div>
          </div>
          
          <div className="p-8">
            <div className="mb-8">
              <h4 className="mb-4 font-bold text-xl text-[#0B2A4A]">🎯 Positionnement & Messages Clés</h4>
              <div className="space-y-4 rounded-lg border-2 border-[#0B2A4A] bg-blue-50 p-6">
                <div>
                  <h5 className="mb-2 font-semibold text-[#0B2A4A]">Mission SEEDO</h5>
                  <p className="text-gray-700">
                    "Simplifier la livraison et les paiements pour tous les Béninois, avec rapidité et confiance."
                  </p>
                </div>
                <div>
                  <h5 className="mb-2 font-semibold text-[#0B2A4A]">Promesse</h5>
                  <p className="font-bold text-2xl text-[#FF7A00]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    "Envoyez. Payez. Livrez."
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="mb-4 font-bold text-xl text-[#0B2A4A]">💬 Ton de Voix</h4>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                  <div className="mb-2 text-3xl">✂️</div>
                  <h5 className="mb-2 font-semibold text-gray-900">Simple</h5>
                  <p className="text-sm text-gray-700">Phrases courtes. Mots du quotidien. Pas de jargon.</p>
                </div>
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                  <div className="mb-2 text-3xl">🎯</div>
                  <h5 className="mb-2 font-semibold text-gray-900">Direct</h5>
                  <p className="text-sm text-gray-700">Toujours un verbe d'action. Ce qu'on peut faire, maintenant.</p>
                </div>
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                  <div className="mb-2 text-3xl">🤝</div>
                  <h5 className="mb-2 font-semibold text-gray-900">Rassurant</h5>
                  <p className="text-sm text-gray-700">Confirmer, accompagner, sécuriser. Transparence totale.</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="mb-4 font-bold text-xl text-[#0B2A4A]">📱 Templates Social Media</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="mb-3 aspect-square rounded-lg bg-gradient-to-br from-[#FF7A00] to-[#ff8c1a] p-6 text-white">
                    <p className="mb-2 font-bold text-2xl" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Nouveau !
                    </p>
                    <p className="text-lg">Livraison en 2h à Cotonou</p>
                  </div>
                  <p className="text-sm text-gray-600">Post Instagram - Format carré 1080×1080</p>
                </div>
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="mb-3 aspect-video rounded-lg bg-gradient-to-br from-[#0B2A4A] to-[#0e3558] p-6 text-white">
                    <p className="mb-2 font-bold text-xl" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Témoignage Client
                    </p>
                    <p className="text-sm">"Rapide, fiable, simple."</p>
                  </div>
                  <p className="text-sm text-gray-600">Post Facebook - Format 1200×630</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="mb-4 font-bold text-xl text-[#0B2A4A]">✅ Slogans Approuvés</h4>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border-2 border-[#FF7A00] bg-white px-4 py-2 text-[#0B2A4A]">
                  "Votre colis. Notre priorité."
                </span>
                <span className="rounded-full border-2 border-[#FF7A00] bg-white px-4 py-2 text-[#0B2A4A]">
                  "La livraison, simplement."
                </span>
                <span className="rounded-full border-2 border-[#FF7A00] bg-white px-4 py-2 text-[#0B2A4A]">
                  "Proche de vous. Partout au Bénin."
                </span>
                <span className="rounded-full border-2 border-[#FF7A00] bg-white px-4 py-2 text-[#0B2A4A]">
                  "Rapide. Sûr. SEEDO."
                </span>
              </div>
            </div>

            <div>
              <h4 className="mb-4 font-bold text-xl text-[#0B2A4A]">📦 Assets Marketing</h4>
              <div className="grid gap-3 md:grid-cols-2">
                <button className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 text-left transition-all hover:border-[#FF7A00] hover:shadow-md">
                  <ImageIcon className="h-8 w-8 text-[#FF7A00]" />
                  <div>
                    <p className="font-semibold text-gray-900">Bibliothèque Photos</p>
                    <p className="text-gray-600 text-sm">Images approuvées - ZIP</p>
                  </div>
                </button>
                <button className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 text-left transition-all hover:border-[#FF7A00] hover:shadow-md">
                  <Layers className="h-8 w-8 text-[#FF7A00]" />
                  <div>
                    <p className="font-semibold text-gray-900">Templates Figma</p>
                    <p className="text-gray-600 text-sm">Posts, Stories, Bannières</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {selectedRole === 'delivery' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-8 overflow-hidden rounded-2xl border-2 border-[#FF7A00] bg-white shadow-2xl"
        >
          <div className="bg-gradient-to-r from-[#0B2A4A] to-[#0e3558] p-6">
            <div className="flex items-center gap-3">
              <Truck className="h-8 w-8 text-[#FF7A00]" />
              <h3 className="font-bold text-2xl text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Guide Livreur
              </h3>
            </div>
          </div>
          
          <div className="p-8">
            <div className="mb-8">
              <h4 className="mb-4 font-bold text-xl text-[#0B2A4A]">👕 Uniformes & Tenue</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border-2 border-[#0B2A4A] p-6">
                  <div className="mb-4 flex h-32 items-center justify-center rounded-lg bg-[#0B2A4A]">
                    <div className="text-center">
                      <div className="mb-2 text-6xl text-white">👔</div>
                      <p className="font-bold text-white text-sm">Polo SEEDO</p>
                    </div>
                  </div>
                  <h5 className="mb-2 font-semibold text-gray-900">Polo Officiel</h5>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Couleur : Bleu Nuit #0B2A4A</li>
                    <li>• Logo SEEDO brodé poitrine gauche</li>
                    <li>• Bande orange sur manches</li>
                    <li>• Tissu respirant et confortable</li>
                  </ul>
                </div>
                
                <div className="rounded-lg border-2 border-[#FF7A00] p-6">
                  <div className="mb-4 flex h-32 items-center justify-center rounded-lg bg-[#FF7A00]">
                    <div className="text-center">
                      <div className="mb-2 text-6xl text-white">🎽</div>
                      <p className="font-bold text-white text-sm">Gilet Réfléchissant</p>
                    </div>
                  </div>
                  <h5 className="mb-2 font-semibold text-gray-900">Gilet de Sécurité</h5>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Couleur : Orange #FF7A00</li>
                    <li>• Bandes réfléchissantes</li>
                    <li>• Logo SEEDO dos et devant</li>
                    <li>• Obligatoire pour livraisons à moto</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="mb-4 font-bold text-xl text-[#0B2A4A]">🚗 Branding Véhicule</h4>
              <div className="rounded-lg border border-gray-200 p-6">
                <div className="mb-4 aspect-video rounded-lg bg-gradient-to-r from-[#0B2A4A] to-[#0e3558] p-6 text-white">
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <div className="mb-3 text-6xl">🚐</div>
                      <p className="font-bold text-2xl" style={{ fontFamily: 'Montserrat, sans-serif' }}>SEEDO</p>
                      <p className="text-sm">Envoyez. Payez. Livrez.</p>
                    </div>
                  </div>
                </div>
                <h5 className="mb-3 font-semibold text-gray-900">Éléments Obligatoires</h5>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Logo SEEDO sur portières (minimum 40cm de large)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Slogan "Envoyez. Payez. Livrez." visible</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Numéro de contact : +229 XX XX XX XX</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Bande orange sur le bas du véhicule</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="mb-4 font-bold text-xl text-[#0B2A4A]">📋 Protocoles Terrain</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-lg bg-green-50 p-4">
                  <div className="text-2xl">1️⃣</div>
                  <div>
                    <p className="font-semibold text-green-900">Accueil Client</p>
                    <p className="text-green-800 text-sm">Se présenter avec sourire : "Bonjour, SEEDO, votre livraison"</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-green-50 p-4">
                  <div className="text-2xl">2️⃣</div>
                  <div>
                    <p className="font-semibold text-green-900">Vérification</p>
                    <p className="text-green-800 text-sm">Confirmer nom, téléphone et adresse avant remise</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-green-50 p-4">
                  <div className="text-2xl">3️⃣</div>
                  <div>
                    <p className="font-semibold text-green-900">Confirmation</p>
                    <p className="text-green-800 text-sm">Photo de preuve de livraison + signature digitale</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-4 font-bold text-xl text-[#0B2A4A]">📦 Matériel Livreur</h4>
              <div className="grid gap-3 md:grid-cols-2">
                <button className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 text-left transition-all hover:border-[#FF7A00] hover:shadow-md">
                  <Download className="h-8 w-8 text-[#FF7A00]" />
                  <div>
                    <p className="font-semibold text-gray-900">Badge Livreur</p>
                    <p className="text-gray-600 text-sm">Template PDF à imprimer</p>
                  </div>
                </button>
                <button className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 text-left transition-all hover:border-[#FF7A00] hover:shadow-md">
                  <Download className="h-8 w-8 text-[#FF7A00]" />
                  <div>
                    <p className="font-semibold text-gray-900">Guide Protocoles</p>
                    <p className="text-gray-600 text-sm">PDF - Manuel complet</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {selectedRole === 'agent' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-8 overflow-hidden rounded-2xl border-2 border-[#FF7A00] bg-white shadow-2xl"
        >
          <div className="bg-gradient-to-r from-[#FF7A00] to-[#ff8c1a] p-6">
            <div className="flex items-center gap-3">
              <MapPin className="h-8 w-8 text-white" />
              <h3 className="font-bold text-2xl text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Guide Agent Point Relais
              </h3>
            </div>
          </div>
          
          <div className="p-8">
            <div className="mb-8">
              <h4 className="mb-4 font-bold text-xl text-[#0B2A4A]">🏪 Signalétique Point Relais</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border-2 border-[#FF7A00] p-6">
                  <div className="mb-4 flex h-32 items-center justify-center rounded-lg bg-[#FF7A00] text-white">
                    <div className="text-center">
                      <div className="mb-2 text-4xl">📍</div>
                      <p className="font-bold text-xl" style={{ fontFamily: 'Montserrat, sans-serif' }}>POINT RELAIS</p>
                      <p className="text-sm">SEEDO</p>
                    </div>
                  </div>
                  <h5 className="mb-2 font-semibold text-gray-900">Sticker Vitrine</h5>
                  <p className="text-sm text-gray-700">30×30 cm - Visible de l'extérieur - Autocollant permanent</p>
                </div>
                
                <div className="rounded-lg border-2 border-[#0B2A4A] p-6">
                  <div className="mb-4 flex h-32 items-center justify-center rounded-lg bg-[#0B2A4A] text-white">
                    <div className="text-center">
                      <div className="mb-2 text-4xl">📋</div>
                      <p className="font-bold text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>ICI :</p>
                      <p className="text-xs">Dépôt & Retrait Colis</p>
                    </div>
                  </div>
                  <h5 className="mb-2 font-semibold text-gray-900">Affichette A4</h5>
                  <p className="text-sm text-gray-700">21×29.7 cm - Comptoir ou mur - Papier 200g</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="mb-4 font-bold text-xl text-[#0B2A4A]">📱 QR Code & Digital</h4>
              <div className="rounded-lg border border-gray-200 p-6">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-lg border-4 border-[#0B2A4A] bg-white p-4">
                    <div className="mb-2 h-32 w-32 rounded bg-gray-200"></div>
                    <p className="text-center text-xs text-gray-600">QR Code Point Relais</p>
                  </div>
                </div>
                <p className="mb-3 text-center text-sm text-gray-700">
                  Chaque point relais dispose d'un QR code unique pour :
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="text-[#FF7A00]">•</span>
                    <span>Localisation GPS du point relais</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#FF7A00]">•</span>
                    <span>Horaires d'ouverture</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#FF7A00]">•</span>
                    <span>Contact direct de l'agent</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="mb-4 font-bold text-xl text-[#0B2A4A]">🤝 Protocole Accueil Client</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4">
                  <div className="text-2xl">👋</div>
                  <div>
                    <p className="font-semibold text-[#0B2A4A]">Salutation</p>
                    <p className="text-gray-700 text-sm">"Bonjour, bienvenue chez SEEDO. Dépôt ou retrait ?"</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4">
                  <div className="text-2xl">📲</div>
                  <div>
                    <p className="font-semibold text-[#0B2A4A]">Vérification</p>
                    <p className="text-gray-700 text-sm">Scanner le code colis ou saisir numéro de tracking</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4">
                  <div className="text-2xl">✅</div>
                  <div>
                    <p className="font-semibold text-[#0B2A4A]">Confirmation</p>
                    <p className="text-gray-700 text-sm">Faire signer et confirmer dans l'app SEEDO Agent</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="mb-4 font-bold text-xl text-[#0B2A4A]">🎫 Badge Agent</h4>
              <div className="flex justify-center">
                <div className="w-64 rounded-lg border-2 border-[#0B2A4A] bg-white p-4 shadow-lg">
                  <div className="mb-3 flex items-center justify-between">
                    <SeedoMiniLogo />
                    <div className="rounded-full bg-[#FF7A00] px-3 py-1 text-white text-xs">AGENT</div>
                  </div>
                  <div className="mb-2 h-24 rounded bg-gray-200"></div>
                  <p className="mb-1 font-bold text-center text-[#0B2A4A]">Nom de l'Agent</p>
                  <p className="text-center text-gray-600 text-xs">Point Relais Cotonou</p>
                  <p className="mt-2 text-center text-xs text-gray-500">ID: PR-00123</p>
                </div>
              </div>
              <p className="mt-3 text-center text-sm text-gray-600">
                Badge officiel à porter de façon visible pendant les heures de service
              </p>
            </div>

            <div>
              <h4 className="mb-4 font-bold text-xl text-[#0B2A4A]">📦 Matériel Point Relais</h4>
              <div className="grid gap-3 md:grid-cols-2">
                <button className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 text-left transition-all hover:border-[#FF7A00] hover:shadow-md">
                  <Download className="h-8 w-8 text-[#FF7A00]" />
                  <div>
                    <p className="font-semibold text-gray-900">Kit Signalétique</p>
                    <p className="text-gray-600 text-sm">Stickers + Affichettes PDF</p>
                  </div>
                </button>
                <button className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 text-left transition-all hover:border-[#FF7A00] hover:shadow-md">
                  <Download className="h-8 w-8 text-[#FF7A00]" />
                  <div>
                    <p className="font-semibold text-gray-900">Manuel Agent</p>
                    <p className="text-gray-600 text-sm">Guide complet - PDF</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}