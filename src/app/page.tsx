"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  AppWindow,
  Atom,
  BookOpen,
  Brain,
  Brush,
  Check,
  ChevronLeft,
  ChevronRight,
  Code2,
  FileCode,
  Flag,
  Github,
  Globe,
  GraduationCap,
  Library,
  Layers,
  Languages,
  Mail,
  Moon,
  Link2,
  Palette,
  ScrollText,
  Server,
  Sun,
  Wind,
  Pencil,
} from "lucide-react";
import { PaginatedSkillPanel } from "@/components/paginated-skill-panel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { about } from "@/data/about";
import { projects } from "@/data/projects";
import { allPublications } from "@/data/publications";
import { skills } from "@/data/skills";
import { translations } from "@/data/translations";
import Link from "next/link";
import { ProjectForm } from "@/components/admin/project-form";
import { PublicationForm } from "@/components/admin/publication-form";
import { SkillForm } from "@/components/admin/skill-form";
import { iconMap as lucideIconMap } from "@/lib/icons";

type LanguageKey = "en" | "es";

const slides = ["home", "projects", "publications", "skills", "contact"] as const;
const ITEMS_PER_PAGE = 3;

type SlideKey = (typeof slides)[number];

const easing: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

const sectionReveal = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easing },
  },
};

const sectionStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const skillIcons = [
  { label: "Full Stack Development", icon: Layers },
  { label: "React", icon: Atom },
  { label: "Django", icon: Server },
  { label: "Python", icon: FileCode },
  { label: "Adobe Photoshop", icon: Palette },
  { label: "Tkinter", icon: AppWindow },
  { label: "HTML5", icon: Code2 },
  { label: "CSS3", icon: Brush },
  { label: "Tailwind CSS", icon: Wind },
  { label: "JavaScript", icon: Code2 },
];

interface ProjectData {
  id: string;
  titleEn: string;
  titleEs: string;
  shortDescEn: string;
  shortDescEs: string;
  fullDescEn: string;
  fullDescEs: string;
  year: string;
  technologies: string;
  liveUrl?: string;
  codeUrl?: string;
  tagsEn: string;
  tagsEs: string;
}

interface PublicationData {
  id: string;
  title: string;
  citationApa: string;
  url: string;
  lang: string;
  tagsEn: string;
  tagsEs: string;
}

interface SkillData {
  id: string;
  name: string;
  category: string;
  icon?: string;
}

interface PortfolioData {
  projects: ProjectData[];
  publications: PublicationData[];
  skills: SkillData[];
}

export default function Home() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { data: session } = useSession();
  const [language, setLanguage] = useState<LanguageKey>("en");
  const [mounted, setMounted] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [copied, setCopied] = useState(false);
  const [publicationPage, setPublicationPage] = useState(0);
  const [dynamicData, setDynamicData] = useState<PortfolioData>({ projects: [], publications: [], skills: [] });
  const [activeProjectForm, setActiveProjectForm] = useState<null | any>(null);
  const [activePublicationForm, setActivePublicationForm] = useState<null | any>(null);
  const [activeSkillForm, setActiveSkillForm] = useState<null | any>(null);

  const isAdmin = session?.user?.email === "ocamposimon1@gmail.com";

  const copyEmail = () => {
    navigator.clipboard.writeText("ocamposimon1@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    setMounted(true);
    const stored = window.localStorage.getItem("portfolio-language");
    if (stored === "en" || stored === "es") {
      setLanguage(stored);
    }
    
    // Fetch dynamic data
    fetch("/api/portfolio-data")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setDynamicData(data);
        }
      })
      .catch((err) => console.error("Failed to load portfolio data", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const updateScroll = () => {
      // If the body is scroll-locked by a dialog/modal, do not override overflow styles.
      // Radix UI adds 'data-scroll-locked' to the body.
      if (document.body.hasAttribute("data-scroll-locked")) {
          return;
      }

      const slideId = slides[currentSlide];
      const section = document.getElementById(slideId);
      if (!section) {
        return;
      }

      const needsScroll = section.scrollHeight > window.innerHeight;
      const overflow = needsScroll ? "auto" : "hidden";
      document.documentElement.style.overflowY = overflow;
      document.body.style.overflowY = overflow;
    };

    updateScroll();
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    const handleResize = () => updateScroll();
    window.addEventListener("resize", handleResize);

    const slideId = slides[currentSlide];
    const section = document.getElementById(slideId);
    const observer = section ? new ResizeObserver(updateScroll) : null;
    if (observer && section) {
      observer.observe(section);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [currentSlide]);

  const toggleLanguage = () => {
    setLanguage((prev) => {
      const next = prev === "en" ? "es" : "en";
      window.localStorage.setItem("portfolio-language", next);
      return next;
    });
  };

  const t = useMemo(() => translations[language], [language]);
  
  // Merge static and dynamic projects
  const mergedProjects = useMemo(() => {
    const dynamicProjects = dynamicData.projects.map((p: ProjectData) => ({
      id: p.id,
      title: { en: p.titleEn, es: p.titleEs },
      shortDescription: { en: p.shortDescEn, es: p.shortDescEs },
      fullDescription: { en: p.fullDescEn, es: p.fullDescEs },
      year: p.year,
      technologies: p.technologies ? p.technologies.split(",") : [],
      liveUrl: p.liveUrl || "#",
      codeUrl: p.codeUrl || "#",
      image: { en: [], es: [] }, // Default empty for now
      tags: { 
        en: p.tagsEn ? p.tagsEn.split(",") : [],
        es: p.tagsEs ? p.tagsEs.split(",") : []
      },
      isDynamic: true,
      isEditable: true
    }));
    const staticProjects = projects.map((p) => ({
      ...p,
      isDynamic: false,
      isEditable: true
    }));
    return [...dynamicProjects, ...staticProjects];
  }, [dynamicData.projects]);

  const currentProjects = mergedProjects;

  // Merge static and dynamic publications
  const mergedPublications = useMemo(() => {
    const dynamicPubs = dynamicData.publications.map((p: PublicationData) => ({
      id: p.id,
      title: p.title,
      citationApa: p.citationApa,
      url: p.url,
      lang: p.lang,
      tags: {
        en: p.tagsEn ? p.tagsEn.split(",") : [],
        es: p.tagsEs ? p.tagsEs.split(",") : []
      },
      isDynamic: true,
      isEditable: true
    }));
    const staticPubs = allPublications.map((p) => ({
      ...p,
      isDynamic: false,
      isEditable: false
    }));
    return [...dynamicPubs, ...staticPubs];
  }, [dynamicData.publications]);
  
  // Publications Logic
  const totalPublicationPages = Math.ceil(mergedPublications.length / ITEMS_PER_PAGE);
  const currentPublications = mergedPublications.slice(
    publicationPage * ITEMS_PER_PAGE,
    (publicationPage + 1) * ITEMS_PER_PAGE
  );
  
  // Merge static and dynamic skills
  const mergedSkills = useMemo(() => {
    // Transform static skills to object format
    const tech = skills.technical[language].map(name => ({ name }));
    const acad = skills.academic[language].map(name => ({ name }));
    const lang = skills.languages[language].map(name => ({ name }));

    dynamicData.skills.forEach((s: SkillData) => {
        const item = { id: s.id, name: s.name, category: s.category, icon: s.icon };
        if (s.category === "technical") tech.push(item);
        if (s.category === "academic") acad.push(item);
        if (s.category === "languages") lang.push(item);
    });

    return { technical: tech, academic: acad, languages: lang };
  }, [dynamicData.skills, language]);

  // Merge static and dynamic icons
  const mergedIconMap = useMemo(() => {
    const staticMap = Object.fromEntries(skillIcons.map(i => [i.label, i.icon]));
    
    const dynamicMap: Record<string, any> = {};
    dynamicData.skills.forEach((s: SkillData) => {
      if (s.icon && lucideIconMap[s.icon]) {
        dynamicMap[s.name] = lucideIconMap[s.icon];
      }
    });

    return { ...staticMap, ...dynamicMap };
  }, [dynamicData.skills]);

  const nextPage = () => {
    if (publicationPage < totalPublicationPages - 1) {
      setPublicationPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (publicationPage > 0) {
      setPublicationPage(prev => prev - 1);
    }
  };

  const cvFile = language === "en" ? "/cv-en.pdf" : "/cv-es.pdf";

  const goToSlide = (index: number) => {
    setCurrentSlide((prev) => {
      const next = Math.max(0, Math.min(slides.length - 1, index));
      return next === prev ? prev : next;
    });
  };

  const getLabel = (key: SlideKey) => t.nav[key];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 noise-bg" />

        <motion.header
          className="nav-island-wrap"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.5 }}
        >
          <div className="nav-island">
            <nav className="nav-island__links">
              {slides.map((slide, index) => (
                <button
                  key={slide}
                  type="button"
                  className={`nav-island__link ${index === currentSlide ? "is-active" : ""}`}
                  onClick={() => goToSlide(index)}
                >
                  {getLabel(slide)}
                </button>
              ))}
            </nav>
            <div className="nav-island__actions">
              <Button
                variant="ghost"
                size="icon"
                aria-label={t.hero.switchTheme}
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {mounted && theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </Button>
              <Button variant="outline" className="gap-2" onClick={toggleLanguage}>
                <Languages size={16} />
                {language === "en" ? "ES" : "EN"}
              </Button>
              <Button asChild className="hidden gap-2 md:inline-flex">
                <a href={cvFile} target="_blank" rel="noreferrer">
                  <Globe size={16} />
                  {language === "en" ? "View CV" : "Ver CV"}
                </a>
              </Button>
            </div>
          </div>
        </motion.header>

        <div className="carousel-shell">
          <motion.div
            className="carousel-track"
            animate={{ x: `-${currentSlide * 100}vw` }}
            transition={{ duration: 0.8, ease: easing }}
          >
            <section id="home" className="carousel-slide section-hero">
              <motion.div
                className="section-grid section-grid--hero"
                initial="hidden"
                animate={currentSlide === 0 ? "visible" : "hidden"}
                variants={stagger}
                transition={{ duration: 0.65, ease: easing }}
              >
                <motion.div variants={fadeUp} className="space-y-4">
                  <div className="flex flex-col items-start gap-1">
                     <p className="text-sm uppercase tracking-[0.45em] text-muted-foreground ml-1">
                        {t.hero.greeting}
                     </p>
                  </div>
                  
                  <h1 className="font-display font-black uppercase leading-[0.85] tracking-tighter text-[8vw] md:text-[6rem] lg:text-[8rem] text-primary -ml-[0.05em]">
                    SIMÓN
                    <br />
                    <span className="ml-[0.1em] text-muted-foreground/30">OCAMPO</span>
                  </h1>

                  <div className="pt-4">
                    <div className="inline-flex items-center px-4 py-2 rounded-full border border-foreground/10 bg-background/30 backdrop-blur-md shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)]">
                        <span className="w-2 h-2 rounded-full bg-primary/60 mr-3 animate-pulse"></span>
                        <p className="text-xs md:text-sm font-medium tracking-wide text-foreground/80">
                           {t.hero.title}
                        </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-4">
                    <Button onClick={() => goToSlide(1)}>{t.hero.cta}</Button>
                    <Button asChild variant="outline">
                      <a href={cvFile} target="_blank" rel="noreferrer">
                        {language === "en" ? "Download CV" : "Descargar CV"}
                      </a>
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">
                    <span>Social</span>
                    <div className="flex items-center gap-3">
                      <Button variant="ghost" size="icon" aria-label="GitHub" asChild>
                        <a href="https://github.com/SimonOcampo1" target="_blank" rel="noreferrer">
                          <Github size={16} />
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon" aria-label="Email" onClick={copyEmail}>
                        {copied ? <Check size={16} /> : <Mail size={16} />}
                      </Button>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  variants={fadeUp}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className="relative flex justify-center md:justify-self-start"
                >
                  <Image
                    key={mounted ? resolvedTheme : "theme-loading"}
                    src={mounted && (resolvedTheme === "light" || theme === "light") ? "/simon-avatar-light.png" : about.image}
                    alt="Simón Ocampo"
                    width={360}
                    height={360}
                    className="hero-avatar h-auto w-80 object-contain md:w-[20rem]"
                    priority
                  />
                </motion.div>
              </motion.div>
            </section>

            <section id="projects" className="carousel-slide">
              <div className="section-body">
                <motion.div
                  initial="hidden"
                  animate={currentSlide === 1 ? "visible" : "hidden"}
                  variants={sectionStagger}
                  transition={{ duration: 0.65, ease: easing }}
                  className="mb-8 flex items-center justify-between"
                >
                  <motion.div variants={sectionReveal}>
                    <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">
                      {t.projects.title}
                    </p>
                    <div className="flex items-center gap-2">
                        <h2 className="font-display text-3xl">
                        {language === "en" ? "Featured Works" : "Trabajos Destacados"}
                        </h2>
                        {isAdmin && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setActiveProjectForm(activeProjectForm ? null : {})}
                            aria-label="Add project"
                          >
                            <span className="text-lg leading-none">+</span>
                          </Button>
                        )}
                    </div>
                  </motion.div>
                  <motion.div variants={sectionReveal}>
                    <Button variant="outline" onClick={() => goToSlide(4)}>
                      {language === "en" ? "Get in touch" : "Contactarme"}
                    </Button>
                  </motion.div>
                </motion.div>
                {isAdmin && activeProjectForm !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: easing }}
                    className="admin-form-wrapper"
                  >
                    <ProjectForm
                      initialProject={activeProjectForm?.id ? activeProjectForm : undefined}
                      onCancel={() => setActiveProjectForm(null)}
                      onSaved={() => setActiveProjectForm(null)}
                    />
                  </motion.div>
                )}
                <div className="project-list">
                  {currentProjects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial="hidden"
                      animate={currentSlide === 1 ? "visible" : "hidden"}
                      variants={sectionReveal}
                      transition={{ delay: index * 0.1, duration: 0.6, ease: easing }}
                    >
                      <div className="project-row group relative">
                        {isAdmin && (project as any).isEditable && (
                            <div className="absolute right-2 top-2 z-10">
                              <Button
                                variant="secondary"
                                size="icon"
                                className="h-8 w-8 shadow-sm"
                                onClick={() => setActiveProjectForm(project)}
                                aria-label="Edit project"
                              >
                                <Pencil size={14} />
                              </Button>
                            </div>
                        )}
                        <div className="project-row__icon">
                          <Code2 size={18} />
                        </div>
                        <div className="project-row__content">
                          <div className="project-row__header">
                            <div>
                              <h3 className="text-base font-semibold">
                                {project.title[language]}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                {project.year}
                              </p>
                            </div>
                            <Badge variant="secondary">{project.technologies[0]}</Badge>
                          </div>
                        <p className="project-row__summary">
                          {project.shortDescription[language]}
                        </p>
                        <div className="project-row__meta">
                          <div className="project-row__actions">
                            <Button asChild size="sm" variant="ghost">
                              <a href={project.codeUrl} target="_blank" rel="noreferrer">
                                {t.projects.viewCode}
                                </a>
                              </Button>
                              <Button asChild size="sm" variant="outline">
                                <a href={project.liveUrl} target="_blank" rel="noreferrer">
                                  {t.projects.viewProject}
                                </a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            <section id="publications" className="carousel-slide">
              <div className="section-body">
                <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr]">
                  <motion.div
                    initial="hidden"
                    animate={currentSlide === 2 ? "visible" : "hidden"}
                    variants={sectionStagger}
                    transition={{ duration: 0.65, ease: easing }}
                    className="space-y-6"
                  >
                    <motion.div variants={sectionReveal}>
                      <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">
                        {t.publications.title}
                      </p>
                      <div className="flex items-center gap-2">
                        <h2 className="font-display text-3xl">
                            {language === "en"
                            ? "Academic Publications"
                            : "Publicaciones Académicas"}
                        </h2>
                        {isAdmin && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setActivePublicationForm(activePublicationForm ? null : {})}
                            aria-label="Add publication"
                          >
                            <span className="text-lg leading-none">+</span>
                          </Button>
                        )}
                      </div>
                    </motion.div>
                    <motion.p variants={sectionReveal} className="text-muted-foreground">
                      {language === "en"
                        ? "Independent research in philosophy of religion and analytic theology, published in international journals and indexed repositories."
                        : "Investigación independiente en filosofía de la religión y teología analítica, publicada en revistas internacionales y repositorios indexados."}
                    </motion.p>
                    <motion.div variants={sectionReveal}>
                      <Button asChild className="gap-2">
                        <a href="https://orcid.org/0009-0002-6246-9261" target="_blank" rel="noreferrer">
                          <GraduationCap size={16} /> ORCID
                        </a>
                      </Button>
                    </motion.div>
                  </motion.div>

                  <div className="flex flex-col gap-4">
                    {isAdmin && activePublicationForm !== null && (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: easing }}
                        className="admin-form-wrapper"
                      >
                        <PublicationForm
                          initialPublication={activePublicationForm?.id ? activePublicationForm : undefined}
                          onCancel={() => setActivePublicationForm(null)}
                          onSaved={() => setActivePublicationForm(null)}
                        />
                      </motion.div>
                    )}
                    <div className="publication-list relative min-h-[300px]">
                      {currentPublications.map((publication, index) => (
                        <motion.div
                          key={publication.id}
                          initial="hidden"
                          animate={currentSlide === 2 ? "visible" : "hidden"}
                          variants={sectionReveal}
                          transition={{ delay: index * 0.1, duration: 0.6, ease: easing }}
                        >
                          <div className="publication-row group relative">
                            <div className="publication-row__icon">
                              <BookOpen size={18} />
                            </div>
                            <div className="publication-row__content">
                              <div className="publication-row__header">
                                <h3 className="text-sm font-semibold flex items-center gap-2">
                                  {publication.title}
                                  <Badge variant="outline" className="text-[0.6rem] px-1 py-0 h-4 border-foreground/20 text-muted-foreground">
                                    {publication.lang.toUpperCase()}
                                  </Badge>
                                </h3>
                                <div className="publication-row__links">
                                  <Button asChild size="sm" variant="ghost">
                                    <a href={publication.url} target="_blank" rel="noreferrer">
                                      <Link2 size={14} />
                                      {language === "en" ? "Read" : "Leer"}
                                    </a>
                                  </Button>
                                </div>
                              </div>
                              <p className="publication-row__summary">
                                {publication.citationApa}
                              </p>
                              <div className="publication-row__meta">
                                {publication.tags[language]?.map((tag: string) => (
                                  <span key={tag} className="publication-row__tag">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                              {isAdmin && (publication as any).isEditable && (
                                <div className="publication-row__edit">
                                  <Button
                                    variant="secondary"
                                    size="icon"
                                    className="h-8 w-8 shadow-sm"
                                    onClick={() => setActivePublicationForm(publication)}
                                    aria-label="Edit publication"
                                  >
                                    <Pencil size={14} />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Pagination Controls */}
                    {allPublications.length > ITEMS_PER_PAGE && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-end gap-2 pt-2"
                      >
                         <Button
                            variant="ghost"
                            size="icon"
                            onClick={prevPage}
                            disabled={publicationPage === 0}
                            className="h-8 w-8 disabled:opacity-30 transition-opacity"
                          >
                            <ChevronLeft size={16} />
                          </Button>
                          <span className="text-xs text-muted-foreground tabular-nums tracking-widest">
                            {publicationPage + 1} / {totalPublicationPages}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={nextPage}
                            disabled={publicationPage >= totalPublicationPages - 1}
                            className="h-8 w-8 disabled:opacity-30 transition-opacity"
                          >
                            <ChevronRight size={16} />
                          </Button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section id="skills" className="carousel-slide">
              <div className="section-body">
                <motion.div
                  initial="hidden"
                  animate={currentSlide === 3 ? "visible" : "hidden"}
                  variants={sectionStagger}
                  transition={{ duration: 0.65, ease: easing }}
                  className="mb-8"
                >
                  <motion.p
                    variants={sectionReveal}
                    className="text-sm uppercase tracking-[0.35em] text-muted-foreground"
                  >
                    {t.skills.title}
                  </motion.p>
                  <div className="flex items-center gap-2">
                    <motion.h2 variants={sectionReveal} className="font-display text-3xl">
                        {language === "en" ? "My Skills" : "Mis Habilidades"}
                    </motion.h2>
                    {isAdmin && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setActiveSkillForm(activeSkillForm ? null : {})}
                        aria-label="Add skill"
                      >
                        <span className="text-lg leading-none">+</span>
                      </Button>
                    )}
                  </div>
                </motion.div>
                {isAdmin && activeSkillForm !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: easing }}
                    className="admin-form-wrapper"
                  >
                    <SkillForm
                      initialSkill={activeSkillForm?.id ? activeSkillForm : undefined}
                      onCancel={() => setActiveSkillForm(null)}
                      onSaved={() => setActiveSkillForm(null)}
                    />
                  </motion.div>
                )}
                <div className="skills-grid">
                  <PaginatedSkillPanel 
                    title={t.skills.technical} 
                    items={mergedSkills.technical} 
                    itemsPerPage={10} 
                    iconMap={mergedIconMap}
                    isAdmin={isAdmin}
                    onEditSkill={(skill) => setActiveSkillForm(skill)}
                  />
                  <PaginatedSkillPanel 
                    title={t.skills.academic} 
                    items={mergedSkills.academic} 
                    itemsPerPage={10} 
                    defaultIcon={GraduationCap}
                    isAdmin={isAdmin}
                    onEditSkill={(skill) => setActiveSkillForm(skill)}
                  />
                  <PaginatedSkillPanel 
                    title={t.skills.languages} 
                    items={mergedSkills.languages} 
                    itemsPerPage={10} 
                    defaultIcon={Globe}
                    isAdmin={isAdmin}
                    onEditSkill={(skill) => setActiveSkillForm(skill)}
                  />
                </div>
              </div>
            </section>
            
            <section id="contact" className="carousel-slide">
              <div className="section-body">
                <div className="grid gap-10 md:grid-cols-[1fr_1.2fr]">
                  <motion.div
                    initial="hidden"
                    animate={currentSlide === 4 ? "visible" : "hidden"}
                    variants={sectionStagger}
                    transition={{ duration: 0.65, ease: easing }}
                    className="space-y-4"
                  >
                    <motion.p
                      variants={sectionReveal}
                      className="text-sm uppercase tracking-[0.35em] text-muted-foreground"
                    >
                      {language === "en" ? "Let\'s connect" : "Conversemos"}
                    </motion.p>
                    <motion.h2 variants={sectionReveal} className="font-display text-3xl">
                      {t.contact.title}
                    </motion.h2>
                    <motion.p variants={sectionReveal} className="text-muted-foreground">
                      {t.contact.description}
                    </motion.p>
                    <motion.div variants={sectionReveal} className="flex flex-wrap gap-3">
                      <Button className="gap-2" onClick={copyEmail}>
                        {copied ? <Check size={16} /> : <Mail size={16} />}
                        {copied ? (language === "en" ? "Copied!" : "¡Copiado!") : t.contact.emailButton}
                      </Button>
                      <Button variant="outline" className="gap-2" asChild>
                        <a
                          href="https://www.linkedin.com/in/simon-ocampo/"
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Globe size={16} /> {t.contact.linkedinButton}
                        </a>
                      </Button>
                    </motion.div>
                    
                    {/* Admin Access Link */}
                     <div className="pt-8 flex justify-start">
                         <button 
                            onClick={() => isAdmin ? signOut() : signIn("google")}
                            className="text-[0.6rem] text-muted-foreground/20 hover:text-muted-foreground transition-colors uppercase tracking-widest"
                         >
                            {isAdmin ? "Admin Logout" : "Admin Access"}
                         </button>
                     </div>

                  </motion.div>
                  <motion.div
                    initial="hidden"
                    animate={currentSlide === 4 ? "visible" : "hidden"}
                    variants={sectionReveal}
                    transition={{ duration: 0.6, ease: easing }}
                  >
                    <Card className="border-border/80 bg-card/70 p-6">
                      <form className="space-y-4">
                        <Input placeholder={language === "en" ? "Your Name" : "Tu Nombre"} />
                        <Input
                          placeholder={
                            language === "en" ? "Your Email" : "Tu Correo Electr\u00f3nico"
                          }
                          type="email"
                        />
                        <Textarea
                          placeholder={language === "en" ? "Your Message" : "Tu Mensaje"}
                          rows={4}
                        />
                        <Button type="submit" className="w-full">
                          {language === "en" ? "Send Message" : "Enviar Mensaje"}
                        </Button>
                      </form>
                    </Card>
                  </motion.div>
                </div>
              </div>
            </section>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
