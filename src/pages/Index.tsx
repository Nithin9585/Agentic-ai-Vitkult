import { useEffect, useMemo, useRef, useState } from "react";
import Particles from "react-tsparticles";
import AOS from "aos";
import "aos/dist/aos.css";
import Lottie from "lottie-react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import {
  Calendar as CalendarIcon,
  Trophy,
  Users,
  Clock,
  Rocket,
  MapPin,
  ChevronRight,
  HelpCircle,
  Bot,
  Instagram,
  Linkedin,
} from "lucide-react";

const EVENT_START_ISO = "2025-09-14T09:00:00+05:30"; // 14 Sep 09:00 IST
const EVENT_END_ISO = "2025-09-15T18:00:00+05:30"; // 15 Sep 18:00 IST
const COUNTDOWN_TARGET_IST_2359 = "2025-09-14T23:59:00+05:30"; // Countdown target
const REG_LINK = "https://forms.gle/your-form-id";

const sections = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "timeline", label: "Timeline" },
  { id: "problems", label: "Problem Statements" },
  { id: "prizes", label: "Prizes" },
  { id: "rules", label: "Rules" },
  { id: "faqs", label: "FAQs" },
  { id: "contact", label: "Contact" },
];

const formatDateForGoogle = (iso: string) =>
  new Date(iso).toISOString().replace(/[-:]|\.\d{3}/g, "");

const getGoogleCalendarLink = () => {
  const start = formatDateForGoogle(EVENT_START_ISO);
  const end = formatDateForGoogle(EVENT_END_ISO);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: "Agentic AI Hackathon",
    dates: `${start}/${end}`,
    details:
      "Agentic AI Hackathon by VITKULT at VIT Bhopal. Build autonomous agents with real-world impact.",
    location: "VIT Bhopal University",
  });
  return `https://www.google.com/calendar/render?${params.toString()}`;
};

const getOutlookCalendarLink = () => {
  const start = new Date(EVENT_START_ISO).toISOString();
  const end = new Date(EVENT_END_ISO).toISOString();
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: "Agentic AI Hackathon",
    startdt: start,
    enddt: end,
    body: "Agentic AI Hackathon by VITKULT at VIT Bhopal.",
    location: "VIT Bhopal University",
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
};

const Counter = ({ target, label }: { target: number; label: string }) => {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            let frame: number;
            const duration = 1200;
            const startT = performance.now();
            const animate = (t: number) => {
              const p = Math.min(1, (t - startT) / duration);
              setValue(Math.floor(target * (0.5 - Math.cos(Math.PI * p) / 2)));
              if (p < 1) frame = requestAnimationFrame(animate);
            };
            frame = requestAnimationFrame(animate);
            obs.disconnect();
            return () => cancelAnimationFrame(frame);
          }
        });
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-bold gradient-text">{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
};

const Navbar = ({
  active,
  onToggleMotion,
  lowMotion,
  registered,
}: {
  active: string;
  onToggleMotion: () => void;
  lowMotion: boolean;
  registered: boolean;
}) => {
  return (
    <header className="fixed top-0 inset-x-0 z-40">
      <nav className="glass backdrop-blur supports-[backdrop-filter]:backdrop-blur bg-background/40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <a href="#home" className="flex items-center gap-2">
            {/* <div className="w-8 h-8 rounded-md glow" style={{ backgroundImage: "var(--gradient-primary)" }} /> */}
            <span className="font-semibold tracking-wide">VITKULT</span>
          </a>
          <div className="hidden md:flex items-center gap-6">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`text-sm hover-scale ${active === s.id ? "gradient-text" : "text-muted-foreground"}`}
              >
                {s.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
           
              
            <a href={REG_LINK} target="_blank" rel="noreferrer">
              <Button size="sm" className="glow hover-scale">
                {registered ? "Registered ✓" : "Register Now"}
              </Button>
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
};

const Index = () => {
  const [active, setActive] = useState("home");
  const [lowMotion, setLowMotion] = useState(false);
  const [registered, setRegistered] = useState<boolean>(() =>
    typeof window !== "undefined" && localStorage.getItem("registered") === "1"
  );
  const [countdown, setCountdown] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [lottieData, setLottieData] = useState<any>(null);

  useEffect(() => {
    AOS.init({ once: true, duration: 600, easing: "ease-out", offset: 80 });
  }, []);

  useEffect(() => {
    const target = new Date(COUNTDOWN_TARGET_IST_2359).getTime();
    const t = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setCountdown({ d, h, m, s });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    // Active section highlighting
    const ids = sections.map((s) => s.id);
    const observers: IntersectionObserver[] = [];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) setActive(id);
          });
        },
        { rootMargin: "-40% 0px -55% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  useEffect(() => {
    // Load a small Lottie from CDN
    const url = "https://assets6.lottiefiles.com/packages/lf20_3vbOcw.json";
    fetch(url)
      .then((r) => r.json())
      .then((json) => setLottieData(json))
      .catch(() => setLottieData(null));
  }, []);

  const handleRegister = () => {
    confetti({ particleCount: 180, spread: 70, origin: { y: 0.65 } });
    localStorage.setItem("registered", "1");
    setRegistered(true);
    toast({ title: "Registration", description: "Opening registration form..." });
    window.open(REG_LINK, "_blank");
  };

  const isEarlyBird = useMemo(() => Date.now() < new Date("2025-09-01T00:00:00+05:30").getTime(), []);

  return (
    <div id="home" className="relative min-h-screen overflow-x-hidden">
      {!lowMotion && (
        <div className="absolute inset-0 -z-10 opacity-60">
          <Particles
            options={{
              fullScreen: { enable: false },
              background: { color: { value: "transparent" } },
              fpsLimit: 60,
              particles: {
                number: { value: 60, density: { enable: true, area: 800 } },
                color: { value: ["#7c3aed", "#06b6d4"] },
                links: { enable: true, distance: 120, opacity: 0.2, color: "#06b6d4" },
                move: { enable: true, speed: 0.6 },
                opacity: { value: 0.5 },
                size: { value: { min: 1, max: 3 } },
              },
              detectRetina: true,
            }}
            className="h-full w-full"
          />
        </div>
      )}

      <Navbar
        active={active}
        lowMotion={lowMotion}
        onToggleMotion={() => setLowMotion((v) => !v)}
        registered={registered}
      />

      {/* HERO */}
      <section className="relative pt-28 md:pt-32 pb-20 md:pb-28">
        {!lowMotion && (
          <video
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-20"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="https://cdn.coverr.co/videos/coverr-abstract-network-connection-4990/1080p.mp4" type="video/mp4" />
          </video>
        )}
        <div className="container mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs glass" data-aos="fade-in">
            <CalendarIcon className="h-4 w-4" /> Hackathon Day: 14 September
          </span>
          <h1 className="mt-6 text-4xl md:text-6xl font-bold leading-tight gradient-text" data-aos="fade-in">
            Agentic AI Hackathon
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto" data-aos="fade-in">
            Build autonomous agents that solve real-world problems.
          </p>
          <p className="mt-2 text-sm text-muted-foreground" data-aos="fade-in">
            Problem Statements announced 20 days before 14 September
          </p>

          <div className="mt-8 flex items-center justify-center gap-4" data-aos="scale-in">
            <Button size="lg" className="glow hover-scale" onClick={handleRegister}>
              Register Now
            </Button>
            <a href="#timeline">
              <Button size="lg" variant="secondary" className="hover-scale">
                View Timeline
              </Button>
            </a>
          </div>

          {/* Countdown */}
          <div className="mt-10 grid grid-cols-4 gap-3 max-w-md mx-auto" data-aos="fade-in" aria-label="Countdown to Sep 14, 23:59 IST">
            {[{k:"Days",v:countdown.d},{k:"Hours",v:countdown.h},{k:"Minutes",v:countdown.m},{k:"Seconds",v:countdown.s}].map((t)=> (
              <div key={t.k} className="glass rounded-md px-3 py-3">
                <div className="text-2xl font-semibold">{t.v.toString().padStart(2, "0")}</div>
                <div className="text-xs text-muted-foreground">{t.k}</div>
              </div>
            ))}
          </div>

          {/* Marquee */}
          <div className="mt-12 overflow-hidden">
            <div className="whitespace-nowrap animate-marquee text-sm text-muted-foreground">
              <span className="mx-8">24-hour build • Team size 1–4 • Open to all VIT Bhopal students</span>
              <span className="mx-8">Mentorship • Swags • Networking • PoC-ready projects</span>
              <span className="mx-8">Agentic AI • Automation • Real-world impact</span>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-6 gradient-text flex items-center gap-2"><Bot className="h-5 w-5 opacity-70" /> About</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="glass" data-aos="fade-in">
              <CardHeader>
                <CardTitle>Organizer • VITKULT Club</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Empowering students to build autonomous agents with real-world impact through mentorship,
                  rapid prototyping, and open-source.
                </p>
              </CardContent>
            </Card>
            <Card className="glass" data-aos="fade-in">
              <CardHeader>
                <CardTitle>Venue • VIT Bhopal University</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Inclusive campus with vibrant maker culture and strong AI community.</p>
              </CardContent>
            </Card>
            <Card className="glass" data-aos="fade-in">
              <CardHeader>
                <CardTitle>Format • 24 hours</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                  <li>Team size: 1–4</li>
                  <li>Open to all VIT Bhopal students</li>
                  <li>Benefits: mentorship, swags, networking, PoC-ready projects</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section id="timeline" className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-6 gradient-text flex items-center gap-2">
            <Bot className="h-5 w-5 opacity-70" /> Timeline
          </h2>
          <div className="relative pl-10">
            <div className="absolute left-3 top-0 bottom-0 w-px" style={{ backgroundImage: "var(--gradient-primary)" }} />
            {[
              { date: "Aug 25", title: "Problem Statements Released", Icon: CalendarIcon },
              { date: "Sep 1", title: "Info Session + Q&A", Icon: Users },
              { date: "Sep 5", title: "Team Registration Closes (11:59 PM IST)", Icon: Clock },
              { date: "Sep 10", title: "Mentor Hours Booking Opens", Icon: HelpCircle },
              { date: "Sep 13", title: "Check-in & Environment Setup Brief", Icon: MapPin },
              { date: "Sep 14", title: "Hackathon Day (Opening Ceremony, Coding Starts)", Icon: Rocket },
              { date: "Sep 15", title: "Submissions, Presentations, Judging & Results", Icon: Trophy },
            ].map((t) => (
              <div key={t.title} className="relative mb-6" data-aos="fade-in">
                <div className="absolute left-3 top-6 -translate-x-1/2 h-3 w-3 rounded-full ring-4 ring-background" style={{ backgroundImage: "var(--gradient-primary)" }} />
                <div className="ml-6 glass rounded-md p-4 flex items-start gap-3">
                  <t.Icon className="h-5 w-5 mt-1 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">{t.date}</div>
                    <div className="font-medium mt-1">{t.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM STATEMENTS */}
      <section id="problems" className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-6 gradient-text flex items-center gap-2"><Bot className="h-5 w-5 opacity-70" /> Problem Statements • Agentic AI</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Campus Ops Agent",
                desc: "Handle student requests end‑to‑end with triage, routing, and follow-ups.",
                tags: ["Forms/Sheets", "Email", "WhatsApp"],
              },
              {
                title: "Research Assistant Agent",
                desc: "Multi-agent pipeline for literature search, summarization, and experiment design.",
                tags: ["Briefs", "Citations", "Prompts"],
              },
              {
                title: "Smart Classroom Scheduler",
                desc: "Auto-generate schedules, resolve clashes, and notify stakeholders.",
                tags: ["Constraints", "Rooms", "Notifications"],
              },
              {
                title: "Vendor Compliance Checker",
                desc: "Parse PDFs/contracts to flag gaps, deadlines, and risks with suggestions.",
                tags: ["PDF", "NLP", "Compliance"],
              },
              {
                title: "Social Impact Bot",
                desc: "Match students with NGOs/causes, schedule volunteering, and report impact.",
                tags: ["APIs", "Matching", "Reports"],
              },
            ].map((p) => (
              <Card key={p.title} className="glass group hover-scale">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{p.title}</span>
                    <ChevronRight className="h-4 w-4 opacity-60 group-hover:translate-x-1 transition-transform" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{p.desc}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {p.tags.map((t) => (
                      <span key={t} className="text-xs px-2 py-1 rounded-full border border-border">
                        {t}
                      </span>
                    ))}
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="secondary" size="sm" className="mt-3 hover-scale">Learn more</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>{p.title}</DialogTitle>
                        <DialogDescription>Deep dive into scope, integrations, and expected outcomes.</DialogDescription>
                      </DialogHeader>
                      <div className="text-sm text-muted-foreground space-y-2">
                        <p>{p.desc}</p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Outline system design and data flow</li>
                          <li>Leverage open-source; document key decisions</li>
                          <li>Demonstrate a working PoC with clear metrics</li>
                        </ul>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PRIZES */}
      <section id="prizes" className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-6 gradient-text flex items-center gap-2"><Bot className="h-5 w-5 opacity-70" /> Prizes</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Winner", amt: "₹25,000", sub: "Certificate + Swag + Incubation Fast-Track" },
              { title: "1st Runner-up", amt: "₹15,000", sub: "Certificate + Swag" },
              { title: "2nd Runner-up", amt: "₹10,000", sub: "Certificate" },
              { title: "Special Awards", amt: "₹2,000 each", sub: "Architecture • UI/UX • Impact • Open-Source" },
            ].map((pr) => (
              <Card key={pr.title} className="glass hover-scale glow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" /> {pr.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold">{pr.amt}</div>
                  <div className="text-sm text-muted-foreground mt-1">{pr.sub}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* RULES */}
      <section id="rules" className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-6 gradient-text">Rules & Eligibility</h2>
          <ul className="grid md:grid-cols-2 gap-4">
            {[
              "Team size: 1–4",
              "Original work only; open-source allowed with attribution",
              "Code submitted via GitHub link + short demo video",
              "Use of AI tools permitted; disclose model(s) & datasets",
              "Respect code of conduct; plagiarism/disallowed content will be disqualified",
              "Judging: innovation(25%), feasibility(25%), technical depth(25%), impact(25%)",
            ].map((r) => (
              <li key={r} className="glass rounded-md p-4">{r}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* JUDGES & MENTORS */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-6 gradient-text">Judges & Mentors</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="group [perspective:1000px]">
                <div className="glass rounded-md p-4 transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                  <div className="[backface-visibility:hidden]">
                    <div className="h-28 rounded-md bg-cover bg-center" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1531123414780-f74286502aeb?q=80&w=1200&auto=format&fit=crop)` }} />
                    <div className="mt-3 font-medium">Mentor #{i + 1}</div>
                    <div className="text-sm text-muted-foreground">Title, Company</div>
                  </div>
                  <div className="absolute inset-0 p-4 [transform:rotateY(180deg)] [backface-visibility:hidden]">
                    <p className="text-sm text-muted-foreground">
                      Bio: Experienced in AI systems, mentoring agentic architectures and deployment.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REGISTRATION */}
      <section id="register" className="py-16 md:py-20">
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-6 items-center">
          <div>
            <h2 className="text-3xl font-semibold gradient-text flex items-center gap-2"><Bot className="h-5 w-5 opacity-70" /> Registration</h2>
            <p className="mt-2 text-muted-foreground text-sm">
              Who can register? All VIT Bhopal students. Deadline: Sep 5, 11:59 PM IST. Team formation: 1–4. Contact: vikultvitb@vitbhopal.ac.in
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button size="lg" className="glow hover-scale" onClick={handleRegister}>
                {registered ? "Registered ✓" : "Register Now"}
              </Button>
              {isEarlyBird && <span className="text-xs px-2 py-1 rounded-full border border-border">Early Bird</span>}
              <a href={getGoogleCalendarLink()} target="_blank" rel="noreferrer">
                <Button variant="secondary" className="hover-scale"><CalendarIcon className="h-4 w-4 mr-2" /> Add to Google</Button>
              </a>
              <a href={getOutlookCalendarLink()} target="_blank" rel="noreferrer">
                <Button variant="secondary" className="hover-scale">Add to Outlook</Button>
              </a>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4">
              <Counter target={120} label="Registered Teams" />
              <Counter target={30} label="Mentor Slots" />
              <Counter target={52000} label="Prize Pool (₹)" />
            </div>
          </div>
          <div className="glass rounded-md p-4">
            {lottieData ? (
              <Lottie animationData={lottieData} loop autoplay className="w-full h-72" />
            ) : (
              <div className="h-72 flex items-center justify-center text-muted-foreground">
                <Rocket className="h-8 w-8 mr-2" /> Launching your next build
              </div>
            )}
          </div>
        </div>
      </section>

     


      {/* FAQs */}
      <section id="faqs" className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-6 gradient-text flex items-center gap-2"><Bot className="h-5 w-5 opacity-70" /> FAQs</h2>
          <Accordion type="single" collapsible className="glass rounded-md">
            {[
              { q: "Who can participate?", a: "Open to all VIT Bhopal students." },
              { q: "Team size?", a: "1–4 members per team." },
              { q: "Are AI tools allowed?", a: "Yes. Disclose model(s) and datasets used." },
              { q: "Submission format?", a: "GitHub link + short demo video." },
              { q: "What are judging criteria?", a: "Innovation, feasibility, technical depth, and impact (25% each)." },
              { q: "Will there be mentors?", a: "Yes. Mentor hours open on Sep 10." },
              { q: "What to bring?", a: "Student ID, laptop, chargers, and enthusiasm!" },
              { q: "Is there food?", a: "Details will be announced in the briefing." },
            ].map((f, idx) => (
              <AccordionItem value={`item-${idx}`} key={f.q}>
                <AccordionTrigger className="px-4">{f.q}</AccordionTrigger>
                <AccordionContent className="px-4 text-sm text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CONTACT & FOOTER */}
      <section id="contact" className="py-16 md:py-20">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-6">
          <div className="glass rounded-md p-4">
            <h3 className="text-xl font-semibold">Contact</h3>
            <p className="text-sm text-muted-foreground mt-2">Email: team@vitkult.example</p>
            <div className="mt-3 flex items-center gap-2">
              <a href="https://www.linkedin.com/company/vitkult" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <Button variant="secondary" size="icon" className="hover-scale"><Linkedin className="h-4 w-4" /></Button>
              </a>
              <a href="https://instagram.com/vitkult" target="_blank" rel="noreferrer" aria-label="Instagram">
                <Button variant="secondary" size="icon" className="hover-scale"><Instagram className="h-4 w-4" /></Button>
              </a>
            </div>
            <p className="text-sm text-muted-foreground">Address: VIT Bhopal University</p>
          </div>
          <div className="glass rounded-md h-64 md:h-72 overflow-hidden">
            <iframe
              title="VIT Bhopal University Location"
              src="https://www.google.com/maps?q=VIT%20Bhopal%20University&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      <footer className="py-10 border-t border-border">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded glow" style={{ backgroundImage: "var(--gradient-primary)" }} />
            <span className="font-medium">VITKULT</span>
          </div>
          <div className="text-sm text-muted-foreground">© {new Date().getFullYear()} VITKULT Club. All rights reserved.</div>
        </div>
      </footer>

      {/* Floating Help Agent */}
      <HelpAssistant />
    </div>
  );
};

const HelpAssistant = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="glass rounded-md p-4 w-72 mb-3 animate-enter">
          <div className="font-medium flex items-center gap-2">
            <HelpCircle className="h-5 w-5" /> Hackathon Assistant
          </div>
          <ul className="mt-2 text-sm text-muted-foreground space-y-1 list-disc pl-5">
            <li>Check Timeline for key dates</li>
            <li>Use Resources for agent frameworks</li>
            <li>Follow Rules to avoid disqualification</li>
          </ul>
          <div className="mt-3 text-xs text-muted-foreground">Tip: Toggle animation intensity from the navbar.</div>
        </div>
      )}
      <Button onClick={() => setOpen((v) => !v)} className="glow hover-scale" aria-expanded={open} aria-controls="assistant">
        {open ? "Close Help" : "Help"}
      </Button>
    </div>
  );
};

export default Index;
