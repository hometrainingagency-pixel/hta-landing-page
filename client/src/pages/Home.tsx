import { useState, useEffect } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  BookOpen,
  Globe,
  Users,
  Target,
  Clock,
  Lightbulb,
  CheckCircle2,
  Play,
  FileText,
  MessageCircle,
  Award,
  Facebook,
  Instagram,
  Send,
  Music,
  Menu,
  X,
} from "lucide-react";
import { APP_LOGO } from "@/const";
import { WhatsAppIcon, TikTokIcon } from "@/components/SocialIcons";

const heroSlides = [
  {
    id: "qui-sommes-nous",
    image: "/hero-qui-sommes-nous.jpg",
    title: "Qui sommes-nous ?",
    sectionId: "qui-sommes-nous",
  },
  {
    id: "formations",
    image: "/hero-formations.jpg",
    title: "Nos Formations",
    sectionId: "formations",
  },
  {
    id: "together",
    image: "/hero-together.jpg",
    title: "Together",
    sectionId: "together",
  },
  {
    id: "pourquoi",
    image: "/hero-pourquoi.jpg",
    title: "Pourquoi nous choisir",
    sectionId: "pourquoi",
  },
];

// Composant wrapper pour les animations au scroll
function AnimatedSection({
  children,
  className = "",
  animationType = "scroll-animate-slide-up",
}: {
  children: React.ReactNode;
  className?: string;
  animationType?: string;
}) {
  const { elementRef, isVisible } = useScrollAnimation();
  return (
    <div
      ref={elementRef}
      className={`${animationType} ${isVisible ? "visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    formation: "",
  });

  const submitContact = trpc.contact.submit.useMutation({
    onSuccess: () => {
      toast.success("Merci ! Votre inscription a été envoyée avec succès.");
      setFormData({ fullName: "", email: "", phone: "", formation: "" });
    },
    onError: (error) => {
      toast.error(
        error.message || "Une erreur s'est produite. Veuillez réessayer."
      );
    },
  });

  // Slider automatique
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion || isPaused) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Hauteur de la navbar
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
    setMobileMenuOpen(false);
  };

  const handleSlideClick = (sectionId: string) => {
    scrollToSection(sectionId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Le backend attend fullName, email, phone
    const { formation, ...backendData } = formData;
    submitContact.mutate(backendData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Barre de Navigation Fixe */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img
                src={APP_LOGO}
                alt="HTA Logo"
                className="h-12 w-12 rounded-full border-2 border-blue-500"
              />
              <span className="text-xl font-bold text-white">HTA</span>
            </div>

            {/* Menu Desktop */}
            <div className="hidden md:flex items-center gap-8">
              {heroSlides.map((slide) => (
                <button
                  key={slide.id}
                  onClick={() => scrollToSection(slide.sectionId)}
                  className="text-gray-300 hover:text-white transition-colors font-medium"
                >
                  {slide.title}
                </button>
              ))}
            </div>

            {/* Icônes Sociales + Bouton Inscription Desktop */}
            <div className="hidden md:flex items-center gap-4">
              {/* Icônes Sociales */}
              <div className="flex items-center gap-3">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-500 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="https://wa.me/243971036852"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-green-500 transition-colors"
                  aria-label="WhatsApp"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-pink-500 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://t.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                  aria-label="Telegram"
                >
                  <Send className="h-5 w-5" />
                </a>
                <a
                  href="https://www.tiktok.com/@home.training.agency?is_from_webapp=1&sender_device=pc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="TikTok"
                >
                  <TikTokIcon className="h-5 w-5" />
                </a>
              </div>
              
              {/* Bouton Inscription */}
              <Button
                onClick={() => scrollToSection("inscription")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6"
              >
                Inscription
              </Button>
            </div>

            {/* Menu Mobile Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white p-2"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Menu Mobile */}
          {mobileMenuOpen && (
            <div className="md:hidden py-6 border-t border-slate-700 bg-slate-900/98">
              <div className="flex flex-col gap-4 items-center">
                {heroSlides.map((slide) => (
                  <button
                    key={slide.id}
                    onClick={() => {
                      scrollToSection(slide.sectionId);
                      setMobileMenuOpen(false);
                    }}
                    className="text-gray-300 hover:text-white transition-colors font-medium text-center text-lg py-2 w-full max-w-xs"
                  >
                    {slide.title}
                  </button>
                ))}
                <Button
                  onClick={() => {
                    scrollToSection("inscription");
                    setMobileMenuOpen(false);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold w-full max-w-xs mt-2"
                >
                  Inscription
                </Button>
                
                {/* Icônes Sociales Mobile */}
                <div className="flex items-center gap-6 mt-4">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-500 transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-6 w-6" />
                  </a>
                  <a
                    href="https://wa.me/243971036852"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-green-500 transition-colors"
                    aria-label="WhatsApp"
                  >
                    <WhatsAppIcon className="h-6 w-6" />
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-pink-500 transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-6 w-6" />
                  </a>
                  <a
                    href="https://t.me/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-400 transition-colors"
                    aria-label="Telegram"
                  >
                    <Send className="h-6 w-6" />
                  </a>
                  <a
                    href="https://www.tiktok.com/@home.training.agency?is_from_webapp=1&sender_device=pc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="TikTok"
                  >
                    <TikTokIcon className="h-6 w-6" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section avec Slider */}
      <section
        className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-screen w-full overflow-hidden mt-20"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Slider d'images */}
        <div className="absolute inset-0">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-[900ms] ease-in-out cursor-pointer ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
              style={{
                backgroundImage: `url(${slide.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              onClick={() => handleSlideClick(slide.sectionId)}
              role="button"
              tabIndex={0}
              aria-label={`Aller à ${slide.title}`}
            />
          ))}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-blue-900/70 to-slate-900/85" />

        {/* Contenu Hero */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 sm:px-6 md:px-8 text-center">
          <h1 className="mb-4 sm:mb-6 animate-fade-in-up text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold leading-tight text-white">
            {heroSlides[currentSlide].title}
          </h1>
        </div>

        {/* Indicateurs de slides */}
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide
                  ? "w-8 bg-blue-500"
                  : "w-2 bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Aller à la diapositive ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Section 1 : Qui sommes-nous */}
      <section id="qui-sommes-nous" className="py-20 px-4 bg-slate-800/50">
        <div className="container mx-auto max-w-4xl">
          <AnimatedSection animationType="scroll-animate-fade">
            <div className="text-center mb-12">
              <span className="text-blue-400 font-semibold text-sm uppercase tracking-wider">
                À propos
              </span>
              <h2 className="mt-3 text-4xl font-bold text-white md:text-5xl">
                Qui sommes-nous ?
              </h2>
            </div>
           </AnimatedSection>

          <AnimatedSection animationType="scroll-animate-slide-up">
            <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
              <p>
                <strong className="text-white">HTA</strong> est une agence
                spécialisée dans la formation linguistique, avec un focus
                particulier sur l'apprentissage du français et de l'anglais, en
                ligne et en présentiel.
              </p>
              <p>
                Notre mission est simple :{" "}
                <strong className="text-blue-400">
                  rendre l'apprentissage accessible, flexible et motivant
                </strong>{" "}
                pour chaque apprenant.
              </p>
              <p>
                Nous créons un environnement sûr, stimulant et orienté vers la
                progression afin de permettre à chacun d'apprendre à son rythme
                et de développer de vraies compétences.
              </p>
              <p>
                Nous croyons en des{" "}
                <strong className="text-blue-400">
                  méthodes innovantes, interactives et centrées sur l'apprenant
                </strong>
                . Chaque session chez HTA est conçue pour être une expérience
                mémorable qui renforce la confiance, ouvre des opportunités et
                mène à une réelle transformation.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Section 2 : Nos Formations */}
      <section id="formations" className="py-20 px-4 bg-slate-900/50">
        <div className="container mx-auto">
          <AnimatedSection animationType="scroll-animate-fade">
            <div className="text-center mb-12">
              <span className="text-blue-400 font-semibold text-sm uppercase tracking-wider">
                Nos Programmes
              </span>
              <h2 className="mt-3 text-4xl font-bold text-white md:text-5xl">
                Nos Formations
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300">
                Des parcours adaptés à chaque profil et chaque objectif
              </p>
            </div>
          </AnimatedSection>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Formation 1 */}
            <AnimatedSection animationType="scroll-animate-scale" className="scroll-animate-delay-100">
              <Card className="group border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 hover:border-blue-500 transition-all duration-300 h-full">
              <CardContent className="p-8">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-white">
                  Anglais pour francophones
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Pour débutants ou intermédiaires désirant parler, comprendre
                  et utiliser l'anglais au quotidien dans des contextes réels
                  de la vie.
                </p>
              </CardContent>
              </Card>
            </AnimatedSection>

            {/* Formation 2 */}
            <AnimatedSection animationType="scroll-animate-scale" className="scroll-animate-delay-200">
              <Card className="group border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 hover:border-blue-500 transition-all duration-300 h-full">
              <CardContent className="p-8">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-white">
                  Français pour anglophones
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Un parcours complet pour maîtriser la langue française, de la
                  base à l'expression avancée.
                </p>
              </CardContent>
              </Card>
            </AnimatedSection>

            {/* Formation 3 */}
            <AnimatedSection animationType="scroll-animate-scale" className="scroll-animate-delay-300">
              <Card className="group border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 hover:border-blue-500 transition-all duration-300 h-full">
              <CardContent className="p-8">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-white">
                  Français pour Francophones
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Revoir les fondamentaux, améliorer votre grammaire, enrichir
                  votre vocabulaire et gagner en aisance.
                </p>
              </CardContent>
              </Card>
            </AnimatedSection>

            {/* Formation 4 */}
            <AnimatedSection animationType="scroll-animate-scale" className="scroll-animate-delay-400">
              <Card className="group border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 hover:border-blue-500 transition-all duration-300 h-full">
              <CardContent className="p-8">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-white">
                  Anglais pour anglophones
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Des séances axées sur la prononciation, la fluidité, le
                  vocabulaire et l'expression naturelle.
                </p>
              </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Section 3 : Together */}
      <section id="together" className="py-20 px-4 bg-slate-800/50">
        <div className="container mx-auto max-w-5xl">
          <AnimatedSection animationType="scroll-animate-fade">
            <div className="text-center mb-12">
              <span className="text-blue-400 font-semibold text-sm uppercase tracking-wider">
                Programme Phare
              </span>
              <h2 className="mt-3 text-4xl font-bold text-white md:text-5xl">
                Parlez Anglais avec{" "}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  Together
                </span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300">
                Notre programme d'apprentissage de l'anglais en ligne, conçu pour
                les personnes ambitieuses mais très occupées.
              </p>
            </div>

            <div className="mb-12 text-center">
              <p className="text-gray-300 text-lg">
                Avec <strong className="text-blue-400">Together</strong>, vous
                apprenez à votre rythme, où que vous soyez, sans contrainte
                d'horaires.
              </p>
            </div>
          </AnimatedSection>

          {/* Les 3 Modules */}
          <div className="mb-12">
            <AnimatedSection animationType="scroll-animate-slide-up">
              <h3 className="text-2xl font-bold text-white mb-8 text-center">
                Les trois modules du programme
              </h3>
            </AnimatedSection>
            <div className="grid gap-6 md:grid-cols-3">
              {/* Module 1 */}
              <AnimatedSection animationType="scroll-animate-scale" className="scroll-animate-delay-100">
                <Card className="border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 h-full">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-xl font-bold text-white">
                    1
                  </div>
                  <h4 className="mb-2 text-xl font-bold text-white">
                    Initiation
                  </h4>
                  <p className="text-gray-300">
                    Les bases essentielles pour commencer à communiquer.
                  </p>
                </CardContent>
                </Card>
              </AnimatedSection>

              {/* Module 2 */}
              <AnimatedSection animationType="scroll-animate-scale" className="scroll-animate-delay-200">
                <Card className="border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 h-full">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-xl font-bold text-white">
                    2
                  </div>
                  <h4 className="mb-2 text-xl font-bold text-white">Growth</h4>
                  <p className="text-gray-300">
                    Développement poussé du vocabulaire, des structures et de
                    la fluidité.
                  </p>
                </CardContent>
                </Card>
              </AnimatedSection>

              {/* Module 3 */}
              <AnimatedSection animationType="scroll-animate-scale" className="scroll-animate-delay-300">
                <Card className="border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 h-full">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-xl font-bold text-white">
                    3
                  </div>
                  <h4 className="mb-2 text-xl font-bold text-white">
                    Production
                  </h4>
                  <p className="text-gray-300">
                    Expression orale, dialogues, mise en situation, aisance
                    générale.
                  </p>
                </CardContent>
                </Card>
              </AnimatedSection>
            </div>
          </div>

          {/* Ce que Together vous offre */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-white mb-8 text-center">
              Ce que Together vous offre
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
                <p className="text-gray-300">
                  Des leçons vidéo préenregistrées, dynamiques et faciles à
                  suivre
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
                <p className="text-gray-300">
                  Des PDF de dialogues, vocabulaires et expressions utiles
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
                <p className="text-gray-300">
                  Un coaching personnalisé pour vous accompagner
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
                <p className="text-gray-300">
                  Une communauté d'apprenants et anglophones pour pratiquer en
                  continu
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button
              size="lg"
              onClick={() => scrollToSection("inscription")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-6 text-lg"
            >
              Rejoignez Together
            </Button>
          </div>
        </div>
      </section>

      {/* Section 4 : Pourquoi nous choisir */}
      <section id="pourquoi" className="py-20 px-4 bg-slate-900/50">
        <div className="container mx-auto max-w-5xl">
          <AnimatedSection animationType="scroll-animate-fade">
            <div className="text-center mb-12">
              <span className="text-blue-400 font-semibold text-sm uppercase tracking-wider">
                Notre Différence
              </span>
              <h2 className="mt-3 text-4xl font-bold text-white md:text-5xl">
                Pourquoi nous choisir
              </h2>
            </div>

            <div className="mb-12 text-center">
              <p className="text-gray-300 text-lg max-w-3xl mx-auto">
                Chez <strong className="text-white">HTA</strong>, vous êtes au
                centre de tout. Nous comprenons les défis des apprenants : manque
                de temps, contraintes de déplacement, emploi du temps chargé,
                budget limité…
              </p>
              <p className="text-gray-300 text-lg max-w-3xl mx-auto mt-4">
                C'est pourquoi nous vous proposons plus qu'un simple cours : nous
                offrons une solution pensée pour votre réalité, basée sur trois
                piliers :
              </p>
            </div>
          </AnimatedSection>

          <div className="grid gap-8 md:grid-cols-3 mb-12">
            {/* Pilier 1 */}
            <AnimatedSection animationType="scroll-animate-scale" className="scroll-animate-delay-100">
              <Card className="border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 text-center h-full">
              <CardContent className="p-8">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg">
                  <Clock className="h-10 w-10 text-white" />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-white">
                  Flexibilité
                </h3>
                <p className="text-gray-300">
                  Vous apprenez où et quand vous voulez
                </p>
              </CardContent>
              </Card>
            </AnimatedSection>

            {/* Pilier 2 */}
            <AnimatedSection animationType="scroll-animate-scale" className="scroll-animate-delay-200">
              <Card className="border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 text-center h-full">
              <CardContent className="p-8">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg">
                  <Lightbulb className="h-10 w-10 text-white" />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-white">
                  Innovation
                </h3>
                <p className="text-gray-300">
                  Des méthodes modernes et motivantes
                </p>
              </CardContent>
              </Card>
            </AnimatedSection>

            {/* Pilier 3 */}
            <AnimatedSection animationType="scroll-animate-scale" className="scroll-animate-delay-300">
              <Card className="border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 text-center h-full">
              <CardContent className="p-8">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg">
                  <Target className="h-10 w-10 text-white" />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-white">
                  Pratique
                </h3>
                <p className="text-gray-300">
                  Un apprentissage orienté mise en application réelle
                </p>
              </CardContent>
              </Card>
            </AnimatedSection>
          </div>

          <AnimatedSection animationType="scroll-animate-fade">
            <div className="text-center">
              <p className="text-gray-300 text-lg max-w-3xl mx-auto">
                <strong className="text-blue-400">HTA</strong>, c'est l'assurance
                d'une progression visible et d'une expérience d'apprentissage qui
                fait la différence.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Section 5 : Formulaire d'Inscription */}
      <section id="inscription" className="py-20 px-4 bg-slate-800/50">
        <div className="container mx-auto max-w-2xl">
          <AnimatedSection animationType="scroll-animate-fade">
            <div className="text-center mb-12">
              <span className="text-blue-400 font-semibold text-sm uppercase tracking-wider">
                Rejoignez-nous
              </span>
              <h2 className="mt-3 text-4xl font-bold text-white md:text-5xl">
                L'aventure commence ici
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-gray-300">
                Prêt à commencer ? Remplissez le formulaire ci-dessous
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection animationType="scroll-animate-slide-up">
            <Card className="border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="fullName" className="text-gray-200">
                    Nom complet
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    placeholder="Jean Dupont"
                    className="mt-2 bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-blue-500"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-gray-200">
                    Adresse e-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="jean.dupont@example.com"
                    className="mt-2 bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-blue-500"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-gray-200">
                    Téléphone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+243 XX XXX XXXX"
                    className="mt-2 bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-blue-500"
                  />
                </div>

                <div>
                  <Label htmlFor="formation" className="text-gray-200">
                    Formation choisie
                  </Label>
                  <select
                    id="formation"
                    required
                    value={formData.formation}
                    onChange={(e) =>
                      setFormData({ ...formData, formation: e.target.value })
                    }
                    className="mt-2 w-full rounded-md border border-slate-600 bg-slate-700/50 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Sélectionnez une formation</option>
                    <option value="anglais-francophones">
                      Anglais pour francophones
                    </option>
                    <option value="francais-anglophones">
                      Français pour anglophones
                    </option>
                    <option value="francais-francophones">
                      Français pour Francophones
                    </option>
                    <option value="anglais-anglophones">
                      Anglais pour anglophones
                    </option>
                    <option value="together">Together (Programme en ligne)</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={submitContact.isPending}
                  className="w-full bg-blue-600 text-lg font-semibold text-white hover:bg-blue-700 py-6 shadow-xl transition-all hover:scale-105"
                >
                  {submitContact.isPending
                    ? "Envoi en cours..."
                    : "Commencer Mon Aventure"}
                </Button>

                <p className="text-center text-sm text-gray-400">
                  En soumettant ce formulaire, vous acceptez d'être contacté
                  par HTA. Vos données sont sécurisées et ne seront jamais
                  partagées.
                </p>
              </form>
            </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-8 px-4 text-center text-gray-400">
        <div className="container mx-auto">
          <p className="text-sm">
            © {new Date().getFullYear()} Home Training Agency. Tous droits
            réservés.
          </p>
          <p className="mt-2 text-sm">
            <a href="mailto:infos@hta.org" className="hover:text-white">
              infos@hta.org
            </a>{" "}
            |{" "}
            <a href="tel:+243XXXXXXXX" className="hover:text-white">
              +243 XX XXX XXXX
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
