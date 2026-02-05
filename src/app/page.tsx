"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "next-themes";
import { supabaseClient } from "@/lib/supabase-client";
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
  Home as HomeIcon,
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
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
  titleEn?: string;
  titleEs?: string;
  shortDescEn?: string;
  shortDescEs?: string;
  fullDescEn?: string;
  fullDescEs?: string;
  year?: string;
  technologies?: string | string[];
  liveUrl?: string;
  codeUrl?: string;
  tagsEn?: string;
  tagsEs?: string;
  mediaImages?: string[];
  mediaVideos?: string[];
  title_en?: string;
  title_es?: string;
  short_desc_en?: string;
  short_desc_es?: string;
  full_desc_en?: string;
  full_desc_es?: string;
  live_url?: string | null;
  code_url?: string | null;
  tags_en?: string;
  tags_es?: string;
  media_images?: string[];
  media_videos?: string[];
}

interface PublicationData {
  id: string;
  title?: string;
  citationApa?: string;
  url?: string;
  lang?: string;
  tagsEn?: string;
  tagsEs?: string;
  citation_apa?: string;
  tags_en?: string;
  tags_es?: string;
}

interface SkillData {
  id: string;
  name?: string;
  category?: string;
  icon?: string;
}

interface PortfolioData {
  projects: ProjectData[];
  publications: PublicationData[];
  skills: SkillData[];
}

export default function Home() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isAdmin, setIsAdmin] = useState(false);
  const [language, setLanguage] = useState<LanguageKey>("en");
  const [mounted, setMounted] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [copied, setCopied] = useState(false);
  const [publicationPage, setPublicationPage] = useState(0);
  const [dynamicData, setDynamicData] = useState<PortfolioData>({ projects: [], publications: [], skills: [] });
  const [activeProjectForm, setActiveProjectForm] = useState<null | any>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [projectMediaIndex, setProjectMediaIndex] = useState(0);
  const [imageModalUrl, setImageModalUrl] = useState<string | null>(null);
  const [activePublicationForm, setActivePublicationForm] = useState<null | any>(null);
  const [activeSkillForm, setActiveSkillForm] = useState<null | any>(null);
  const [projectClosing, setProjectClosing] = useState(false);
  const [publicationClosing, setPublicationClosing] = useState(false);
  const [skillClosing, setSkillClosing] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
    company: "",
  });
  const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [contactError, setContactError] = useState("");

  const closeProjectForm = () => {
    setProjectClosing(true);
    setTimeout(() => {
      setActiveProjectForm(null);
      setProjectClosing(false);
    }, 220);
  };

  const closePublicationForm = () => {
    setPublicationClosing(true);
    setTimeout(() => {
      setActivePublicationForm(null);
      setPublicationClosing(false);
    }, 220);
  };

  const closeSkillForm = () => {
    setSkillClosing(true);
    setTimeout(() => {
      setActiveSkillForm(null);
      setSkillClosing(false);
    }, 220);
  };

  useEffect(() => {
    let isMounted = true;
    supabaseClient.auth.getUser().then(({ data }) => {
      if (!isMounted) return;
      setIsAdmin(data.user?.email === "ocamposimon1@gmail.com");
    });

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setIsAdmin(session?.user?.email === "ocamposimon1@gmail.com");
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const copyEmail = () => {
    navigator.clipboard.writeText("ocamposimon1@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContactChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitContactForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (contactStatus === "sending") {
      return;
    }

    const name = contactForm.name.trim();
    const email = contactForm.email.trim();
    const message = contactForm.message.trim();

    if (!name || !email || !message) {
      setContactError(t.contact.validationError);
      setContactStatus("error");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setContactError(t.contact.invalidEmail);
      setContactStatus("error");
      return;
    }

    setContactStatus("sending");
    setContactError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message,
          company: contactForm.company,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setContactError(data?.error || t.contact.sendError);
        setContactStatus("error");
        return;
      }

      setContactStatus("success");
      setContactForm({ name: "", email: "", message: "", company: "" });
    } catch (error) {
      setContactError(t.contact.sendError);
      setContactStatus("error");
    }
  };

  useEffect(() => {
    setMounted(true);
    const stored = window.localStorage.getItem("portfolio-language");
    if (stored === "en" || stored === "es") {
      setLanguage(stored);
    }

    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const updateIsMobile = () => setIsMobile(mediaQuery.matches);
    updateIsMobile();
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", updateIsMobile);
    } else {
      mediaQuery.addListener(updateIsMobile);
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
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", updateIsMobile);
      } else {
        mediaQuery.removeListener(updateIsMobile);
      }
    };
  }, []);

  useEffect(() => {
    if (!isMobile) {
      return;
    }

    setCurrentSlide(0);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [isMobile]);

  useEffect(() => {
    setProjectMediaIndex(0);
  }, [selectedProject]);

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
    const dynamicProjects = dynamicData.projects.map((p: ProjectData) => {
      const mediaImages = Array.isArray(p.mediaImages)
        ? p.mediaImages
        : Array.isArray(p.media_images)
          ? p.media_images
          : [];
      const mediaVideos = Array.isArray(p.mediaVideos)
        ? p.mediaVideos
        : Array.isArray(p.media_videos)
          ? p.media_videos
          : [];
      const titleEn = p.titleEn ?? p.title_en ?? "";
      const titleEs = p.titleEs ?? p.title_es ?? "";
      const shortDescEn = p.shortDescEn ?? p.short_desc_en ?? "";
      const shortDescEs = p.shortDescEs ?? p.short_desc_es ?? "";
      const fullDescEn = p.fullDescEn ?? p.full_desc_en ?? "";
      const fullDescEs = p.fullDescEs ?? p.full_desc_es ?? "";
      const liveUrl = p.liveUrl ?? p.live_url ?? "#";
      const codeUrl = p.codeUrl ?? p.code_url ?? "#";
      const technologies = typeof p.technologies === "string"
        ? p.technologies
        : Array.isArray(p.technologies)
          ? (p.technologies as string[]).join(",")
          : "";
      const tagsEn = p.tagsEn ?? p.tags_en ?? "";
      const tagsEs = p.tagsEs ?? p.tags_es ?? "";
      return {
        id: p.id,
        title: { en: titleEn, es: titleEs },
        shortDescription: { en: shortDescEn, es: shortDescEs },
        fullDescription: { en: fullDescEn, es: fullDescEs },
        year: p.year,
        technologies: technologies ? technologies.split(",") : [],
        liveUrl,
        codeUrl,
        image: { en: mediaImages, es: mediaImages },
        video: mediaVideos,
        additionalImages: [],
        mediaImages,
        mediaVideos,
        tags: { 
          en: tagsEn ? tagsEn.split(",") : [],
          es: tagsEs ? tagsEs.split(",") : []
        },
        isDynamic: true,
        isEditable: true
      };
    });
    const staticProjects = projects.map((p) => ({
      ...p,
      isDynamic: false,
      isEditable: true
    }));
    return [...dynamicProjects, ...staticProjects];
  }, [dynamicData.projects]);

  const currentProjects = mergedProjects;
  const viewProjectLabel = t.projects.viewProject;
  const isValidUrl = (url?: string) => Boolean(url && url !== "#" && url !== "/");

  const openProject = (project: any) => {
    setActiveProjectForm(null);
    setSelectedProject(project);
  };

  const closeProjectDetails = () => {
    setSelectedProject(null);
  };

  const getProjectMedia = (project: any) => {
    if (!project) return [];
    const images = new Set<string>();
    const videos = new Set<string>();

    const primaryImages = project.image?.[language] || project.image?.en || [];
    const secondaryImages = project.additionalImages || [];
    const mediaImages = project.mediaImages || [];
    const mediaVideos = project.mediaVideos || [];
    const projectVideos = project.video || [];

    const shouldIncludeMedia = (url: string) => {
      const cleanUrl = url.split("?")[0];
      const suffixMatch = cleanUrl.match(/-(en|es)(\.[^./]+)?$/i);
      if (!suffixMatch) return true;
      return suffixMatch[1].toLowerCase() === language;
    };

    [...primaryImages, ...secondaryImages, ...mediaImages].forEach((url: string) => {
      if (url && shouldIncludeMedia(url)) images.add(url);
    });

    [...mediaVideos, ...projectVideos].forEach((url: string) => {
      if (url && shouldIncludeMedia(url)) videos.add(url);
    });

    const mediaItems = [
      ...Array.from(images).map((url) => ({ type: "image" as const, url })),
      ...Array.from(videos).map((url) => ({ type: "video" as const, url })),
    ];

    return mediaItems;
  };

  const projectMedia = selectedProject ? getProjectMedia(selectedProject) : [];
  const activeMedia = projectMedia[projectMediaIndex];
  const hasMedia = projectMedia.length > 0;

  const goToPrevMedia = () => {
    if (!projectMedia.length) return;
    setProjectMediaIndex((prev) => (prev - 1 + projectMedia.length) % projectMedia.length);
  };

  const goToNextMedia = () => {
    if (!projectMedia.length) return;
    setProjectMediaIndex((prev) => (prev + 1) % projectMedia.length);
  };

  const openImageModal = (url: string) => {
    setImageModalUrl(url);
  };

  const closeImageModal = () => {
    setImageModalUrl(null);
  };

  // Merge static and dynamic publications
  const mergedPublications = useMemo(() => {
    const dynamicPubs = dynamicData.publications.map((p: PublicationData) => ({
      id: p.id,
      title: p.title ?? "",
      citationApa: p.citationApa ?? p.citation_apa ?? "",
      url: p.url ?? "",
      lang: p.lang ?? "",
      tags: {
        en: p.tagsEn || p.tags_en ? (p.tagsEn || p.tags_en || "").split(",") : [],
        es: p.tagsEs || p.tags_es ? (p.tagsEs || p.tags_es || "").split(",") : []
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
      if (!s.name || !s.category) return;
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
      if (s.name && s.icon && lucideIconMap[s.icon]) {
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
  const getSlideState = (index: number) => (currentSlide === index ? "visible" : "hidden");
  const navIcons: Record<SlideKey, any> = {
    home: HomeIcon,
    projects: Code2,
    publications: BookOpen,
    skills: Brain,
    contact: Mail,
  };
  const heroAvatarSrc = isMobile
    ? "/simon-avatar-head.png"
    : mounted && (resolvedTheme === "light" || theme === "light")
      ? "/simon-avatar-light.png"
      : about.image;

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
              {slides.map((slide, index) => {
                const Icon = navIcons[slide];
                return (
                <button
                  key={slide}
                  type="button"
                  className={`nav-island__link ${index === currentSlide ? "is-active" : ""}`}
                  onClick={() => goToSlide(index)}
                  aria-label={getLabel(slide)}
                  title={getLabel(slide)}
                >
                  {isMobile ? <Icon size={16} aria-hidden="true" /> : getLabel(slide)}
                </button>
              );
              })}
            </nav>
            <div className="nav-island__actions">
              <Button
                variant="ghost"
                size="icon"
                className="nav-island__theme"
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
                animate={getSlideState(0)}
                variants={stagger}
                transition={{ duration: 0.65, ease: easing }}
              >
                <motion.div variants={fadeUp} className="hero-content space-y-4">
                  <div className="flex flex-col items-center gap-1 md:items-start">
                     <p className="text-sm uppercase tracking-[0.45em] text-muted-foreground ml-1">
                        {t.hero.greeting}
                     </p>
                  </div>
                  
                  <h1 className="hero-title font-display font-black uppercase leading-[0.85] tracking-tighter text-[8vw] md:text-[6rem] lg:text-[8rem] text-primary -ml-[0.05em] text-center md:text-left">
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

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-4 md:justify-start">
                    <Button onClick={() => goToSlide(1)}>{t.hero.cta}</Button>
                    <Button asChild variant="outline">
                      <a href={cvFile} target="_blank" rel="noreferrer">
                        {language === "en" ? "Download CV" : "Descargar CV"}
                      </a>
                    </Button>
                  </div>
                  <div className="flex items-center justify-center gap-4 text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground md:justify-start">
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
                  className="hero-media relative flex justify-center md:justify-self-start"
                >
                  <Image
                    key={mounted ? resolvedTheme : "theme-loading"}
                    src={heroAvatarSrc}
                    alt="Simón Ocampo"
                    width={360}
                    height={360}
                    className="hero-avatar h-auto w-56 object-contain sm:w-64 md:w-[20rem]"
                    priority
                  />
                </motion.div>
              </motion.div>
            </section>

            <section id="projects" className="carousel-slide">
              <div className="section-body">
                <motion.div
                  initial="hidden"
                  animate={getSlideState(1)}
                  variants={sectionStagger}
                  transition={{ duration: 0.65, ease: easing }}
                  className="mb-8 flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between"
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
                            onClick={() => (activeProjectForm ? closeProjectForm() : setActiveProjectForm({}))}
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
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3, ease: easing }}
                    className={projectClosing ? "admin-form-wrapper admin-form-wrapper--closing" : "admin-form-wrapper"}
                  >
                    <ProjectForm
                      initialProject={activeProjectForm?.id ? activeProjectForm : undefined}
                      onCancel={closeProjectForm}
                      onSaved={closeProjectForm}
                      language={language}
                    />
                  </motion.div>
                )}
                <AnimatePresence mode="wait">
                  {selectedProject ? (
                    <motion.div
                      key="project-details"
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.35, ease: easing }}
                      className="project-details"
                    >
                      <div className="project-details__header">
                        <Button variant="ghost" className="gap-2" onClick={closeProjectDetails}>
                          <ChevronLeft size={16} />
                          {language === "en" ? "Back to projects" : "Volver a proyectos"}
                        </Button>
                        {isAdmin && (selectedProject as any).isEditable && (
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setActiveProjectForm(selectedProject)}
                            aria-label="Edit project"
                          >
                            <Pencil size={14} />
                          </Button>
                        )}
                      </div>

                      <div className="project-details__grid">
                        <div className="project-details__content">
                          <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                              {selectedProject.year}
                            </p>
                            <h3 className="text-2xl font-semibold">
                              {selectedProject.title[language]}
                            </h3>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {selectedProject.fullDescription[language]}
                          </p>

                          <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
                              {language === "en" ? "Tech Stack" : "Tecnologias"}
                            </p>
                            <div className="project-details__tags">
                              {selectedProject.technologies.map((tech: string) => (
                                <Badge key={tech} variant="secondary">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="project-details__links">
                            {isValidUrl(selectedProject.codeUrl) && (
                              <Button asChild variant="outline" className="gap-2">
                                <a href={selectedProject.codeUrl} target="_blank" rel="noreferrer">
                                  <Github size={16} /> {t.projects.viewCode}
                                </a>
                              </Button>
                            )}
                            {isValidUrl(selectedProject.liveUrl) && (
                              <Button asChild className="gap-2">
                                <a href={selectedProject.liveUrl} target="_blank" rel="noreferrer">
                                  <Globe size={16} /> {viewProjectLabel}
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="project-details__media">
                          {hasMedia ? (
                            <div className="project-details__carousel">
                              <div className="project-details__media-frame">
                                {activeMedia?.type === "video" ? (
                                  <video
                                    key={activeMedia.url}
                                    src={activeMedia.url}
                                    className="project-details__media-item"
                                    controls
                                    playsInline
                                  />
                                ) : (
                                  <Image
                                    key={activeMedia?.url}
                                    src={activeMedia?.url || "/vercel.svg"}
                                    alt={selectedProject.title[language]}
                                    width={960}
                                    height={540}
                                    className="project-details__media-item"
                                    onClick={() => activeMedia?.url && openImageModal(activeMedia.url)}
                                    unoptimized
                                  />
                                )}
                              </div>
                              <div className="project-details__carousel-controls">
                                <Button size="icon" variant="ghost" onClick={goToPrevMedia}>
                                  <ChevronLeft size={16} />
                                </Button>
                                <span className="text-xs text-muted-foreground">
                                  {projectMediaIndex + 1} / {projectMedia.length}
                                </span>
                                <Button size="icon" variant="ghost" onClick={goToNextMedia}>
                                  <ChevronRight size={16} />
                                </Button>
                              </div>
                              <div className="project-details__thumbnails">
                                {projectMedia.map((item, index) => (
                                  <button
                                    key={`${item.type}-${item.url}`}
                                    type="button"
                                    className={`project-details__thumbnail ${index === projectMediaIndex ? "is-active" : ""}`}
                                    onClick={() => {
                                      setProjectMediaIndex(index);
                                      if (item.type === "image") {
                                        openImageModal(item.url);
                                      }
                                    }}
                                    aria-label={`Media ${index + 1}`}
                                  >
                                    {item.type === "video" ? (
                                      <div className="project-details__thumbnail-video">
                                        <span>Video</span>
                                      </div>
                                    ) : (
                                      <Image
                                        src={item.url}
                                        alt={selectedProject.title[language]}
                                        width={140}
                                        height={90}
                                        unoptimized
                                      />
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="project-details__empty">
                              {language === "en" ? "No media added yet." : "Sin contenido multimedia."}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="project-list"
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.35, ease: easing }}
                      className="project-list"
                    >
                      {currentProjects.map((project, index) => (
                        <motion.div
                          key={project.id}
                          initial="hidden"
                          animate={getSlideState(1)}
                          variants={sectionReveal}
                          transition={{ delay: index * 0.1, duration: 0.6, ease: easing }}
                        >
                          <div className="project-row group relative">
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
                                <div className="project-row__tags">
                                  {project.technologies.map((tech: string) => (
                                    <Badge key={tech} variant="secondary">
                                      {tech}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            <p className="project-row__summary">
                              {project.shortDescription[language]}
                            </p>
                            <div className="project-row__meta">
                              <div className="project-row__actions">
                                <Button size="sm" variant="ghost" onClick={() => openProject(project)}>
                                  {viewProjectLabel}
                                </Button>
                                {isValidUrl(project.codeUrl) && (
                                  <Button asChild size="sm" variant="outline">
                                    <a href={project.codeUrl} target="_blank" rel="noreferrer">
                                      {t.projects.viewCode}
                                    </a>
                                  </Button>
                                )}
                                {isAdmin && (project as any).isEditable && (
                                  <Button
                                    variant="secondary"
                                    size="icon"
                                    className="h-8 w-8 shadow-sm"
                                    onClick={() => setActiveProjectForm(project)}
                                    aria-label="Edit project"
                                  >
                                    <Pencil size={14} />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                <Dialog open={Boolean(imageModalUrl)} onOpenChange={(open) => !open && closeImageModal()}>
                  <DialogContent className="image-viewer" showCloseButton>
                    {imageModalUrl && (
                      <div className="image-viewer__frame">
                        <img src={imageModalUrl} alt="" loading="eager" />
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </section>

            <section id="publications" className="carousel-slide">
              <div className="section-body">
                <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr]">
                  <motion.div
                    initial="hidden"
                    animate={getSlideState(2)}
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
                            onClick={() => (activePublicationForm ? closePublicationForm() : setActivePublicationForm({}))}
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
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3, ease: easing }}
                        className={publicationClosing ? "admin-form-wrapper admin-form-wrapper--closing" : "admin-form-wrapper"}
                      >
                    <PublicationForm
                      initialPublication={activePublicationForm?.id ? activePublicationForm : undefined}
                      onCancel={closePublicationForm}
                      onSaved={closePublicationForm}
                      language={language}
                    />
                      </motion.div>
                    )}
                    <div className="publication-list relative min-h-[300px]">
                      {currentPublications.map((publication, index) => (
                        <motion.div
                          key={publication.id}
                          initial="hidden"
                          animate={getSlideState(2)}
                          variants={sectionReveal}
                          transition={{ delay: index * 0.1, duration: 0.6, ease: easing }}
                        >
                          <div className="publication-row group relative">
                            <div className="publication-row__icon-stack">
                              <div className="publication-row__icon">
                                <BookOpen size={18} />
                              </div>
                              {isAdmin && (publication as any).isEditable && (
                                <Button
                                  variant="secondary"
                                  size="icon"
                                  className="h-8 w-8 shadow-sm"
                                  onClick={() => setActivePublicationForm(publication)}
                                  aria-label="Edit publication"
                                >
                                  <Pencil size={14} />
                                </Button>
                              )}
                            </div>
                            <div className="publication-row__content">
                              <div className="publication-row__header">
                                <h3 className="text-sm font-semibold">{publication.title}</h3>
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
                                <Badge variant="outline" className="text-[0.6rem] px-1 py-0 h-4 border-foreground/20 text-muted-foreground">
                                  {(publication.lang || "").toUpperCase()}
                                </Badge>
                                {publication.tags[language]?.map((tag: string) => (
                                  <span key={tag} className="publication-row__tag">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Pagination Controls */}
                    {mergedPublications.length > ITEMS_PER_PAGE && (
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
                  animate={getSlideState(3)}
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
                        onClick={() => (activeSkillForm ? closeSkillForm() : setActiveSkillForm({}))}
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
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3, ease: easing }}
                    className={skillClosing ? "admin-form-wrapper admin-form-wrapper--closing" : "admin-form-wrapper"}
                  >
                    <SkillForm
                      initialSkill={activeSkillForm?.id ? activeSkillForm : undefined}
                      onCancel={closeSkillForm}
                      onSaved={closeSkillForm}
                      language={language}
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
                    animate={getSlideState(4)}
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
                      <Button className="gap-2" asChild>
                        <a href="mailto:ocamposimon1@gmail.com">
                          <Mail size={16} />
                          {t.contact.emailButton}
                        </a>
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
                             onClick={() => {
                               if (isAdmin) {
                                 supabaseClient.auth.signOut();
                                 return;
                               }

                               supabaseClient.auth.signInWithOAuth({
                                 provider: "google",
                                 options: { redirectTo: `${window.location.origin}/auth/callback` },
                               });
                             }}
                             className="text-[0.6rem] text-muted-foreground/20 hover:text-muted-foreground transition-colors uppercase tracking-widest"
                          >
                             {isAdmin ? "Admin Logout" : "Admin Access"}
                          </button>
                     </div>

                  </motion.div>
                  <motion.div
                    initial="hidden"
                    animate={getSlideState(4)}
                    variants={sectionReveal}
                    transition={{ duration: 0.6, ease: easing }}
                  >
                    <Card className="border-border/80 bg-card/70 p-6">
                      <form className="space-y-4" onSubmit={submitContactForm}>
                        <Input
                          name="name"
                          value={contactForm.name}
                          onChange={handleContactChange}
                          placeholder={t.contact.namePlaceholder}
                          autoComplete="name"
                          required
                        />
                        <Input
                          name="email"
                          value={contactForm.email}
                          onChange={handleContactChange}
                          placeholder={t.contact.emailPlaceholder}
                          type="email"
                          autoComplete="email"
                          required
                        />
                        <Input
                          name="company"
                          value={contactForm.company}
                          onChange={handleContactChange}
                          className="hidden"
                          tabIndex={-1}
                          autoComplete="off"
                          aria-hidden="true"
                        />
                        <Textarea
                          name="message"
                          value={contactForm.message}
                          onChange={handleContactChange}
                          placeholder={t.contact.messagePlaceholder}
                          rows={4}
                          required
                        />
                        <Button type="submit" className="w-full" disabled={contactStatus === "sending"}>
                          {contactStatus === "sending" ? t.contact.sendingButton : t.contact.sendButton}
                        </Button>
                        {contactStatus === "success" && (
                          <p className="text-xs text-emerald-600">{t.contact.successMessage}</p>
                        )}
                        {contactStatus === "error" && (
                          <p className="text-xs text-red-500">{contactError || t.contact.sendError}</p>
                        )}
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
