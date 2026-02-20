// src/App.tsx
import { useEffect, useMemo, useState } from "react";

type Role = "student" | "faculty" | "admin";
type Screen = "login" | "library" | "case" | "faculty_case" | "admin";
type AdminTab = "cases" | "upload" | "analytics";
type CaseTab = "case" | "teaching";

type Difficulty = "Foundational" | "Intermediate" | "Advanced" | "Executive";
type Programme = "WELA" | "GEMBA" | "AMP" | "CSP";

type Case = {
  id: number;
  code: string;
  title: string;
  sector: string;
  country: string;
  theme: string[];
  programme: Programme;
  difficulty: Difficulty;
  duration: number;
  abstract: string;
  objectives: string[];
  questions: string[];
  year: number;
  protagonist: string;
  disguised: boolean;
  downloadAllowed: boolean;
  teachingNote: string;
};

const THEME = {
  // CEIBS Africa Red theme (primary)
  red: "#C8102E",
  redDark: "#8A0F1F",
  redLight: "#E23B4A",

  // Accent (premium pairing with red)
  gold: "#C9A84C",
  goldLight: "#F0D080",

  // Support
  teal: "#0E6655",
  tealLight: "#1A8870",

  // Neutrals
  bg: "#F7F8FC",
  white: "#FFFFFF",
  text: "#1A1A2E",
  muted: "#6B7280",
  border: "#E5E9F2",

  // Used for shadows/overlays
  ink: "rgba(0,0,0,0.65)",
};

const programmeColor: Record<Programme, string> = {
  WELA: THEME.teal,
  GEMBA: THEME.red,
  AMP: "#6D28D9",
  CSP: THEME.redDark,
};

const difficultyColor: Record<Difficulty, string> = {
  Foundational: "#16A34A",
  Intermediate: "#2563EB",
  Advanced: "#7C3AED",
  Executive: THEME.red,
};

const chip = (
  label: string,
  color: string,
  bg?: string
): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  padding: "3px 10px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.04em",
  background: bg ?? `${color}18`,
  color,
  border: `1px solid ${color}30`,
  marginRight: 4,
  marginBottom: 4,
});

const primaryButton = (
  variant: "solid" | "ghost" = "solid"
): React.CSSProperties =>
  variant === "solid"
    ? {
        padding: "11px 14px",
        background: `linear-gradient(135deg, ${THEME.red} 0%, ${THEME.redDark} 100%)`,
        color: THEME.white,
        border: "none",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 800,
        cursor: "pointer",
        letterSpacing: "0.02em",
        boxShadow: `0 8px 22px ${THEME.red}35`,
      }
    : {
        padding: "10px 14px",
        background: "transparent",
        color: THEME.redDark,
        border: `1px solid ${THEME.border}`,
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 800,
        cursor: "pointer",
      };

const CASES: Case[] = [
  {
    id: 1,
    code: "CA-2026-GH-001",
    title: "FinTech Disruption in Ghana",
    sector: "Banking",
    country: "Ghana",
    theme: ["Strategy", "Digital Transformation"],
    programme: "GEMBA",
    difficulty: "Advanced",
    duration: 90,
    abstract:
      "In 2024, Accra-based mobile lender PesaLink faced a strategic crisis as two international FinTech giants announced their entry into the Ghanaian market. CEO Abena Mensah must decide whether to compete head-on, seek a partnership, or pivot the business model entirely.",
    objectives: [
      "Analyse competitive dynamics in emerging FinTech markets",
      "Apply Porter's Five Forces to platform business models",
      "Evaluate strategic options under market disruption",
    ],
    questions: [
      "What strategic options are available to PesaLink?",
      "What risks does Abena face in each scenario?",
      "How would you advise the board to proceed?",
    ],
    year: 2024,
    protagonist: "Abena Mensah",
    disguised: false,
    downloadAllowed: true,
    teachingNote:
      "This case is best opened with a 10-minute individual analysis phase. Push students beyond Porter's Five Forces — the key insight is that PesaLink's moat is trust, not technology. Time breakdown: 0–15 min individual; 15–45 min small groups; 45–80 min plenary; 80–90 min faculty synthesis. Common mistake: students overweight the partnership option without analysing control and revenue share implications.",
  },
  {
    id: 2,
    code: "CA-2026-NG-002",
    title: "Succession at Adeola & Sons",
    sector: "Manufacturing",
    country: "Nigeria",
    theme: ["Leadership", "Family Business"],
    programme: "AMP",
    difficulty: "Intermediate",
    duration: 75,
    abstract:
      "A third-generation Lagos conglomerate faces a governance crisis when the founding patriarch retires unexpectedly. Two competing heirs — one with an MBA from abroad, one who grew up in the business — must be evaluated by an independent board.",
    objectives: [
      "Examine governance structures in family-owned businesses",
      "Evaluate succession planning frameworks",
      "Analyse the role of institutional investors in governance reform",
    ],
    questions: [
      "How should the board evaluate the two candidates?",
      "What governance reforms would you recommend?",
      "How does the Nigerian business context shape this decision?",
    ],
    year: 2023,
    protagonist: "Chukwuemeka Adeola",
    disguised: false,
    downloadAllowed: true,
    teachingNote:
      "Open with a role-play: assign half the class as the 'Abroad MBA' candidate's supporters and half as the 'insider' supporters. Let them argue before introducing the governance lens. Students miss that the real issue is board independence, not candidate selection.",
  },
  {
    id: 3,
    code: "CA-2026-KE-003",
    title: "M-Kopa's Climate Pivot",
    sector: "Energy",
    country: "Kenya",
    theme: ["Sustainability", "Strategy"],
    programme: "WELA",
    difficulty: "Executive",
    duration: 120,
    abstract:
      "East Africa's leading solar home system company faces pressure from impact investors to accelerate its climate commitments while simultaneously navigating a currency crisis that threatens its loan book. The CEO must balance financial survival with ESG obligations.",
    objectives: [
      "Integrate ESG frameworks into core strategic decision-making",
      "Analyse the tension between impact investing and commercial viability",
      "Develop a stakeholder communication strategy under duress",
    ],
    questions: [
      "How does currency risk interact with the ESG mandate?",
      "What should the CEO communicate to impact investors?",
      "Is ESG a constraint or a source of competitive advantage here?",
    ],
    year: 2024,
    protagonist: "Sarah Wachira (disguised)",
    disguised: true,
    downloadAllowed: false,
    teachingNote:
      "This is a WELA signature case. Women leaders in energy: use this to open a broader discussion on barriers to women in the African energy sector. The protagonist's gender is deliberate — surface it in discussion. Do not show the Download button for this case — it is under copyright review.",
  },
  {
    id: 4,
    code: "CA-2026-RW-004",
    title: "Kigali Innovation District: The Vision vs The Reality",
    sector: "Real Estate",
    country: "Rwanda",
    theme: ["Innovation", "Corporate Governance"],
    programme: "CSP",
    difficulty: "Advanced",
    duration: 90,
    abstract:
      "Rwanda's ambitious smart city initiative encounters its first major governance test when a Chinese development partner and a European impact fund disagree on land use commitments made at inception. The Minister of Infrastructure must mediate without losing either partner.",
    objectives: [
      "Examine public-private partnership governance in Africa",
      "Analyse cross-cultural negotiation dynamics",
      "Develop stakeholder alignment strategies in complex multi-party deals",
    ],
    questions: [
      "Who has the stronger legal and moral position?",
      "What negotiation strategy should the Minister adopt?",
      "What governance structures could have prevented this impasse?",
    ],
    year: 2024,
    protagonist: "Minister Jean-Paul Habimana",
    disguised: false,
    downloadAllowed: true,
    teachingNote:
      "CSP students are often public sector leaders themselves — use that. Ask: 'Have you been in this exact position?' Pair this with the OECD PPP governance checklist as a supplement reading.",
  },
  {
    id: 5,
    code: "CA-2026-ZA-005",
    title: "Standard Bank's AI Dilemma",
    sector: "Banking",
    country: "South Africa",
    theme: ["Digital Transformation", "Strategy"],
    programme: "GEMBA",
    difficulty: "Advanced",
    duration: 90,
    abstract:
      "Africa's largest bank by assets must decide whether to build, buy, or partner for AI capabilities across its 20-country footprint. The CTO faces pressure from the board to move fast while the Chief Risk Officer warns of regulatory exposure across multiple jurisdictions.",
    objectives: [
      "Apply build-buy-partner frameworks to technology strategy",
      "Analyse regulatory risk in multi-jurisdiction AI deployment",
      "Evaluate organisational readiness for AI transformation",
    ],
    questions: [
      "What criteria should drive the build/buy/partner decision?",
      "How should the board weigh speed against regulatory risk?",
      "What does successful AI transformation look like at continental scale?",
    ],
    year: 2025,
    protagonist: "Thandi Nkosi",
    disguised: false,
    downloadAllowed: true,
    teachingNote:
      "Fresh case — 2025 publication. Students will have opinions about AI from their own companies. Channel that energy. Start with a show-of-hands: 'Who is dealing with an AI build/buy decision right now?' Expected: 60–70% of GEMBA class. Then make it comparative.",
  },
  {
    id: 6,
    code: "CA-2026-ET-006",
    title: "Ethiopian Airlines: The Pan-African Champion",
    sector: "Telecoms",
    country: "Ethiopia",
    theme: ["Strategy", "Leadership"],
    programme: "AMP",
    difficulty: "Intermediate",
    duration: 60,
    abstract:
      "How did a state-owned African airline become the continent's most profitable carrier while competitors collapsed? This case examines the strategic and operational decisions behind Ethiopian Airlines' rise and the leadership philosophy of CEO Tewolde GebreMariam.",
    objectives: [
      "Analyse the strategic drivers of competitive advantage in aviation",
      "Examine the role of state ownership in African business success",
      "Identify leadership practices that drove organisational transformation",
    ],
    questions: [
      "What explains Ethiopian Airlines' success where others failed?",
      "How does state ownership enable or constrain strategy?",
      "What leadership lessons are transferable to other sectors?",
    ],
    year: 2023,
    protagonist: "Tewolde GebreMariam",
    disguised: false,
    downloadAllowed: true,
    teachingNote:
      "Energising case — strong class discussion guaranteed. Watch for students who argue the state ownership is the only reason for success; push them to identify the specific operational decisions that matter. Good pairing: contrast with a failed state airline case (Air Zimbabwe) for maximum learning.",
  },
];

const USERS: Record<string, { password: string; role: Role; name: string }> = {
  "student@ceibsafrica.org": {
    password: "student123",
    role: "student",
    name: "Kwame Asante",
  },
  "faculty@ceibsafrica.org": {
    password: "faculty123",
    role: "faculty",
    name: "Prof. Adaeze Okonkwo",
  },
  "admin@ceibsafrica.org": {
    password: "admin123",
    role: "admin",
    name: "Siyanda Dlamini",
  },
};

const PROGRAMMES: Programme[] = ["WELA", "GEMBA", "AMP", "CSP"];
const DIFFICULTIES: Difficulty[] = [
  "Foundational",
  "Intermediate",
  "Advanced",
  "Executive",
];

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [role, setRole] = useState<Role | null>(null);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<{
    sector: string;
    country: string;
    programme: Programme | "";
    difficulty: Difficulty | "";
  }>({ sector: "", country: "", programme: "", difficulty: "" });

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [activeTab, setActiveTab] = useState<CaseTab>("case");
  const [adminTab, setAdminTab] = useState<AdminTab>("cases");
  const [hovered, setHovered] = useState<number | null>(null);

  const [comments, setComments] = useState<Record<number, string[]>>({
    1: [
      "Great case — PesaLink's trust advantage is underappreciated. — Kwame A.",
      "Agreed. The FinTech giants bring capital but not local credibility. — Fatima O.",
    ],
    2: [],
    3: ["Brilliant to see an African woman in energy leading this. — Amara D."],
    4: [],
    5: [],
    6: [
      "Ethiopian Airlines is proof that African excellence is possible at global scale. — Tunde B.",
    ],
  });
  const [newComment, setNewComment] = useState("");

  const SECTORS = useMemo(() => [...new Set(CASES.map((c) => c.sector))], []);
  const COUNTRIES = useMemo(
    () => [...new Set(CASES.map((c) => c.country))],
    []
  );

  const filteredCases = useMemo(() => {
    return CASES.filter((c) => {
      if (filters.sector && c.sector !== filters.sector) return false;
      if (filters.country && c.country !== filters.country) return false;
      if (filters.programme && c.programme !== filters.programme) return false;
      if (filters.difficulty && c.difficulty !== filters.difficulty)
        return false;

      if (search) {
        const s = search.toLowerCase();
        const hit =
          c.title.toLowerCase().includes(s) ||
          c.abstract.toLowerCase().includes(s) ||
          c.code.toLowerCase().includes(s);
        if (!hit) return false;
      }
      return true;
    });
  }, [filters, search]);

  const handleLogin = () => {
    const user = USERS[loginEmail];
    if (user && user.password === loginPassword) {
      setRole(user.role);
      setScreen(user.role === "admin" ? "admin" : "library");
      setLoginError("");
    } else {
      setLoginError(
        "Invalid credentials. Try: student@ceibsafrica.org / student123"
      );
    }
  };

  const onLogout = () => {
    setScreen("login");
    setRole(null);
    setSelectedCase(null);
    setSearch("");
    setFilters({ sector: "", country: "", programme: "", difficulty: "" });
    setLoginPassword("");
    setLoginError("");
  };

  const openCase = (c: Case) => {
    setSelectedCase(c);
    setActiveTab("case");
    setScreen(role === "faculty" || role === "admin" ? "faculty_case" : "case");
  };

  const postComment = () => {
    if (!selectedCase) return;
    const text = newComment.trim();
    if (!text) return;
    const name = USERS[loginEmail]?.name ?? "Anonymous";
    setComments((prev) => ({
      ...prev,
      [selectedCase.id]: [
        ...(prev[selectedCase.id] ?? []),
        `${text} — ${name}`,
      ],
    }));
    setNewComment("");
  };

  if (screen === "login") {
    return (
      <LoginScreen
        email={loginEmail}
        setEmail={setLoginEmail}
        password={loginPassword}
        setPassword={setLoginPassword}
        onLogin={handleLogin}
        error={loginError}
      />
    );
  }

  if (screen === "library") {
    return (
      <LibraryScreen
        role={role!}
        cases={filteredCases}
        sectors={SECTORS}
        countries={COUNTRIES}
        search={search}
        setSearch={setSearch}
        filters={filters}
        setFilters={setFilters}
        onOpen={openCase}
        onLogout={onLogout}
        hovered={hovered}
        setHovered={setHovered}
      />
    );
  }

  if (screen === "admin") {
    return (
      <AdminScreen
        cases={CASES}
        tab={adminTab}
        setTab={setAdminTab}
        onLogout={onLogout}
        onOpen={openCase}
      />
    );
  }

  if ((screen === "case" || screen === "faculty_case") && selectedCase) {
    return (
      <CaseDetail
        c={selectedCase}
        onBack={() => setScreen("library")}
        role={role!}
        showTeaching={screen === "faculty_case"}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        comments={comments[selectedCase.id] ?? []}
        newComment={newComment}
        setNewComment={setNewComment}
        onPost={postComment}
      />
    );
  }

  return null;
}

function LoginScreen(props: {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  onLogin: () => void;
  error: string;
}) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${THEME.redDark} 0%, ${THEME.red} 45%, #2B0A0F 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Georgia, serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -120,
          width: 420,
          height: 420,
          borderRadius: "50%",
          background: `${THEME.gold}12`,
          border: `1px solid ${THEME.gold}25`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -90,
          left: -90,
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: `${THEME.redLight}18`,
          border: `1px solid ${THEME.redLight}25`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "8%",
          color: `${THEME.gold}22`,
          fontSize: 86,
          userSelect: "none",
        }}
      >
        ❝
      </div>

      <div
        style={{
          opacity: show ? 1 : 0,
          transform: show ? "translateY(0)" : "translateY(18px)",
          transition: "all 0.6s ease",
          width: 440,
          zIndex: 10,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 34 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                background: THEME.gold,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                color: THEME.redDark,
                fontSize: 18,
                fontFamily: "serif",
              }}
            >
              CA
            </div>
            <div>
              <div
                style={{
                  color: THEME.white,
                  fontWeight: 800,
                  fontSize: 16,
                  letterSpacing: "0.05em",
                }}
              >
                CEIBS AFRICA
              </div>
              <div
                style={{
                  color: THEME.gold,
                  fontSize: 11,
                  letterSpacing: "0.15em",
                  fontFamily: "sans-serif",
                }}
              >
                EXECUTIVE EDUCATION
              </div>
            </div>
          </div>

          <div
            style={{
              color: THEME.white,
              fontSize: 22,
              fontWeight: 650,
              marginTop: 8,
            }}
          >
            Digital Case Library
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.75)",
              fontSize: 13,
              marginTop: 4,
              fontFamily: "sans-serif",
            }}
          >
            Secure Access Portal
          </div>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.98)",
            borderRadius: 18,
            padding: "36px 40px",
            boxShadow: `0 28px 70px ${THEME.ink}`,
          }}
        >
          <Field label="INSTITUTIONAL EMAIL">
            <input
              value={props.email}
              onChange={(e) => props.setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && props.onLogin()}
              placeholder="yourname@ceibsafrica.org"
              style={inputStyle()}
            />
          </Field>

          <Field label="PASSWORD">
            <input
              value={props.password}
              onChange={(e) => props.setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && props.onLogin()}
              type="password"
              placeholder="••••••••"
              style={inputStyle()}
            />
          </Field>

          <div style={{ textAlign: "right", marginBottom: 18 }}>
            <span
              style={{
                fontSize: 12,
                color: THEME.redDark,
                cursor: "pointer",
                fontFamily: "sans-serif",
              }}
            >
              Forgot password?
            </span>
          </div>

          {props.error && (
            <div
              style={{
                background: "#FEE2E2",
                border: "1px solid #FECACA",
                borderRadius: 10,
                padding: "10px 12px",
                fontSize: 12,
                color: THEME.redDark,
                marginBottom: 16,
                fontFamily: "sans-serif",
              }}
            >
              {props.error}
            </div>
          )}

          <button
            onClick={props.onLogin}
            style={{ ...primaryButton("solid"), width: "100%" }}
          >
            Log In Securely →
          </button>

          <div
            style={{
              marginTop: 18,
              padding: "12px 12px",
              background: "#F7F8FC",
              borderRadius: 10,
              borderLeft: `3px solid ${THEME.gold}`,
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: THEME.muted,
                fontFamily: "sans-serif",
                lineHeight: 1.5,
              }}
            >
              By logging in, you confirm you are an enrolled participant or
              authorised faculty member of CEIBS Africa and agree not to
              distribute case materials externally.
            </div>
          </div>

          <div
            style={{
              marginTop: 16,
              padding: "10px 12px",
              background: "#FFF7ED",
              borderRadius: 10,
              fontSize: 11,
              color: THEME.redDark,
              fontFamily: "sans-serif",
              border: `1px solid ${THEME.gold}33`,
            }}
          >
            <strong>Demo accounts:</strong>
            <br />
            student@ceibsafrica.org / student123
            <br />
            faculty@ceibsafrica.org / faculty123
            <br />
            admin@ceibsafrica.org / admin123
          </div>
        </div>
      </div>
    </div>
  );
}

function LibraryScreen(props: {
  role: Role;
  cases: Case[];
  sectors: string[];
  countries: string[];
  search: string;
  setSearch: (v: string) => void;
  filters: {
    sector: string;
    country: string;
    programme: Programme | "";
    difficulty: Difficulty | "";
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      sector: string;
      country: string;
      programme: Programme | "";
      difficulty: Difficulty | "";
    }>
  >;
  onOpen: (c: Case) => void;
  onLogout: () => void;
  hovered: number | null;
  setHovered: (v: number | null) => void;
}) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 60);
    return () => clearTimeout(t);
  }, []);

  const toggleFilter = (
    key: "sector" | "country" | "programme" | "difficulty",
    val: any
  ) => {
    props.setFilters((f) => ({ ...f, [key]: f[key] === val ? "" : val }));
  };

  const clearAll = () =>
    props.setFilters({
      sector: "",
      country: "",
      programme: "",
      difficulty: "",
    });

  const hasFilters = Object.values(props.filters).some(Boolean);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: THEME.bg,
        fontFamily: "sans-serif",
      }}
    >
      <TopNav
        leftTitle="CEIBS Africa"
        leftSubtitle="CASE LIBRARY"
        badge={props.role}
        onLogout={props.onLogout}
      />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        <div
          style={{
            opacity: show ? 1 : 0,
            transform: show ? "none" : "translateY(10px)",
            transition: "all 0.5s",
            marginBottom: 28,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 12,
              marginBottom: 8,
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: 28,
                color: THEME.text,
                fontFamily: "Georgia, serif",
                fontWeight: 800,
              }}
            >
              Case Library
            </h1>
            <span style={{ fontSize: 13, color: THEME.muted }}>
              · {props.cases.length} case{props.cases.length !== 1 ? "s" : ""}{" "}
              available
            </span>
          </div>
          <p style={{ margin: 0, color: THEME.muted, fontSize: 14 }}>
            Search and filter cases across all CEIBS Africa executive
            programmes.
          </p>
        </div>

        <div
          style={{
            opacity: show ? 1 : 0,
            transition: "all 0.5s 0.1s",
            marginBottom: 24,
          }}
        >
          <div style={{ position: "relative", marginBottom: 14 }}>
            <span
              style={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                color: THEME.muted,
                fontSize: 16,
              }}
            >
              🔍
            </span>
            <input
              value={props.search}
              onChange={(e) => props.setSearch(e.target.value)}
              placeholder="Search by title, keyword, or case code…"
              style={{
                width: "100%",
                padding: "14px 14px 14px 44px",
                border: `1px solid ${THEME.border}`,
                borderRadius: 12,
                fontSize: 14,
                outline: "none",
                background: THEME.white,
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {PROGRAMMES.map((p) => (
              <FilterChip
                key={p}
                label={p}
                active={props.filters.programme === p}
                onClick={() => toggleFilter("programme", p)}
                color={programmeColor[p]}
              />
            ))}
            <Divider />
            {props.sectors.map((s) => (
              <FilterChip
                key={s}
                label={s}
                active={props.filters.sector === s}
                onClick={() => toggleFilter("sector", s)}
                color={THEME.redDark}
              />
            ))}
            <Divider />
            {props.countries.map((c) => (
              <FilterChip
                key={c}
                label={c}
                active={props.filters.country === c}
                onClick={() => toggleFilter("country", c)}
                color={THEME.teal}
              />
            ))}
            <Divider />
            {DIFFICULTIES.map((d) => (
              <FilterChip
                key={d}
                label={d}
                active={props.filters.difficulty === d}
                onClick={() => toggleFilter("difficulty", d)}
                color={difficultyColor[d]}
              />
            ))}
            {hasFilters && (
              <button
                onClick={clearAll}
                style={{
                  padding: "6px 12px",
                  borderRadius: 999,
                  border: "none",
                  background: "#FEE2E2",
                  color: THEME.redDark,
                  fontSize: 12,
                  cursor: "pointer",
                  fontWeight: 800,
                }}
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: 18,
          }}
        >
          {props.cases.map((c, i) => {
            const isHover = props.hovered === c.id;
            return (
              <div
                key={c.id}
                onMouseEnter={() => props.setHovered(c.id)}
                onMouseLeave={() => props.setHovered(null)}
                style={{
                  opacity: show ? 1 : 0,
                  transform: show ? "none" : "translateY(16px)",
                  transition: `all 0.5s ${0.05 * i}s`,
                  background: THEME.white,
                  borderRadius: 14,
                  border: `1px solid ${isHover ? THEME.gold : THEME.border}`,
                  overflow: "hidden",
                  boxShadow: isHover
                    ? "0 10px 34px rgba(0,0,0,0.12)"
                    : "0 1px 4px rgba(0,0,0,0.06)",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    height: 5,
                    background: `linear-gradient(90deg, ${
                      programmeColor[c.programme]
                    }, ${THEME.gold})`,
                  }}
                />
                <div style={{ padding: "18px 20px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        color: THEME.muted,
                        fontFamily: "monospace",
                        fontWeight: 700,
                      }}
                    >
                      {c.code}
                    </span>
                    <span
                      style={{
                        ...chip(c.programme, programmeColor[c.programme]),
                        marginBottom: 0,
                      }}
                    >
                      {c.programme}
                    </span>
                  </div>

                  <h3
                    style={{
                      margin: "0 0 8px",
                      fontSize: 16,
                      color: THEME.text,
                      fontFamily: "Georgia, serif",
                      fontWeight: 800,
                      lineHeight: 1.3,
                    }}
                  >
                    {c.title}
                  </h3>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 6,
                      marginBottom: 12,
                    }}
                  >
                    <span style={chip(c.sector, THEME.redDark)}>
                      🏭 {c.sector}
                    </span>
                    <span style={chip(c.country, THEME.teal)}>
                      📍 {c.country}
                    </span>
                    <span
                      style={chip(c.difficulty, difficultyColor[c.difficulty])}
                    >
                      ⭐ {c.difficulty}
                    </span>
                    <span style={chip(`${c.duration} min`, "#666")}>
                      ⏱ {c.duration} min
                    </span>
                  </div>

                  <p
                    style={{
                      margin: "0 0 14px",
                      fontSize: 13,
                      color: THEME.muted,
                      lineHeight: 1.55,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {c.abstract}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      marginBottom: 14,
                    }}
                  >
                    {c.theme.map((t) => (
                      <span
                        key={t}
                        style={{
                          fontSize: 11,
                          color: THEME.redDark,
                          background: `${THEME.redDark}0E`,
                          border: `1px solid ${THEME.redDark}20`,
                          borderRadius: 6,
                          padding: "2px 8px",
                          marginRight: 4,
                          marginBottom: 4,
                        }}
                      >
                        {t}
                      </span>
                    ))}
                    {c.disguised && (
                      <span
                        style={{
                          fontSize: 11,
                          color: "#777",
                          background: "#77777710",
                          border: "1px solid #77777720",
                          borderRadius: 6,
                          padding: "2px 8px",
                        }}
                      >
                        Disguised
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => props.onOpen(c)}
                    style={{
                      width: "100%",
                      padding: "11px",
                      background: isHover ? THEME.red : THEME.bg,
                      color: isHover ? THEME.white : THEME.redDark,
                      border: `1px solid ${THEME.red}35`,
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 900,
                      cursor: "pointer",
                      transition: "all 0.15s",
                      letterSpacing: "0.02em",
                    }}
                  >
                    Open Case →
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {props.cases.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "80px 0",
              color: THEME.muted,
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>
              No cases match your current filters.
            </div>
            <div style={{ fontSize: 13 }}>
              Try clearing some filters or changing your search.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CaseDetail(props: {
  c: Case;
  onBack: () => void;
  role: Role;
  showTeaching: boolean;
  activeTab: CaseTab;
  setActiveTab: (t: CaseTab) => void;
  comments: string[];
  newComment: string;
  setNewComment: (v: string) => void;
  onPost: () => void;
}) {
  const canSeeTeaching = props.showTeaching;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: THEME.bg,
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          background: THEME.redDark,
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          height: 58,
          boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
        }}
      >
        <button
          onClick={props.onBack}
          style={{
            ...primaryButton("ghost"),
            background: "rgba(255,255,255,0.12)",
            color: THEME.white,
            border: "none",
            padding: "7px 14px",
            borderRadius: 10,
            marginRight: 16,
          }}
        >
          ← Back
        </button>
        <span
          style={{
            color: THEME.gold,
            fontSize: 12,
            fontFamily: "monospace",
            fontWeight: 800,
          }}
        >
          {props.c.code}
        </span>
        <span
          style={{
            color: "rgba(255,255,255,0.55)",
            fontSize: 13,
            margin: "0 8px",
          }}
        >
          /
        </span>
        <span
          style={{
            color: THEME.white,
            fontSize: 13,
            fontWeight: 800,
            fontFamily: "Georgia, serif",
          }}
        >
          {props.c.title}
        </span>

        {canSeeTeaching && (
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            {(["case", "teaching"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => props.setActiveTab(tab)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 900,
                  background:
                    props.activeTab === tab
                      ? THEME.gold
                      : "rgba(255,255,255,0.12)",
                  color: props.activeTab === tab ? THEME.redDark : THEME.white,
                  transition: "all 0.15s",
                }}
              >
                {tab === "case" ? "📄 Case" : "🔒 Teaching Notes"}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ maxWidth: 880, margin: "0 auto", padding: "28px 24px" }}>
        {props.activeTab === "case" && (
          <>
            <div
              style={{
                background: THEME.white,
                borderRadius: 14,
                padding: "30px 32px",
                marginBottom: 18,
                border: `1px solid ${THEME.border}`,
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  marginBottom: 12,
                }}
              >
                <span
                  style={chip(
                    props.c.programme,
                    programmeColor[props.c.programme]
                  )}
                >
                  {props.c.programme}
                </span>
                <span style={chip(props.c.sector, THEME.redDark)}>
                  🏭 {props.c.sector}
                </span>
                <span style={chip(props.c.country, THEME.teal)}>
                  📍 {props.c.country}
                </span>
                <span
                  style={chip(
                    props.c.difficulty,
                    difficultyColor[props.c.difficulty]
                  )}
                >
                  ⭐ {props.c.difficulty}
                </span>
                <span style={chip(`${props.c.duration} min`, "#666")}>
                  ⏱ {props.c.duration} min
                </span>
                {props.c.disguised && (
                  <span style={chip("Anonymised", "#777")}>🔐 Anonymised</span>
                )}
              </div>

              <h1
                style={{
                  margin: "0 0 14px",
                  fontSize: 26,
                  color: THEME.text,
                  fontFamily: "Georgia, serif",
                  fontWeight: 900,
                  lineHeight: 1.25,
                }}
              >
                {props.c.title}
              </h1>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: "#374151",
                  lineHeight: 1.75,
                }}
              >
                {props.c.abstract}
              </p>
            </div>

            <Section title="LEARNING OBJECTIVES">
              {props.c.objectives.map((o, i) => (
                <div
                  key={i}
                  style={{ display: "flex", gap: 12, marginBottom: 10 }}
                >
                  <span
                    style={{ color: THEME.gold, fontWeight: 900, minWidth: 22 }}
                  >
                    {i + 1}.
                  </span>
                  <span
                    style={{ fontSize: 14, color: THEME.text, lineHeight: 1.5 }}
                  >
                    {o}
                  </span>
                </div>
              ))}
            </Section>

            <div
              style={{
                background: THEME.white,
                borderRadius: 14,
                border: `1px solid ${THEME.border}`,
                marginBottom: 18,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "14px 18px",
                  borderBottom: `1px solid ${THEME.border}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 900,
                    color: THEME.redDark,
                    letterSpacing: "0.05em",
                  }}
                >
                  📄 CASE DOCUMENT
                </span>
                {props.c.downloadAllowed && (
                  <button
                    style={{
                      padding: "7px 12px",
                      background: THEME.redDark,
                      color: THEME.white,
                      border: "none",
                      borderRadius: 10,
                      fontSize: 12,
                      cursor: "pointer",
                      fontWeight: 900,
                    }}
                  >
                    ⬇ Download PDF
                  </button>
                )}
              </div>

              <div
                style={{ background: "#F3F4F6", padding: 22, minHeight: 380 }}
              >
                <div
                  style={{
                    background: THEME.white,
                    maxWidth: 660,
                    margin: "0 auto",
                    padding: "38px 46px",
                    boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
                    borderRadius: 4,
                  }}
                >
                  <div
                    style={{
                      textAlign: "right",
                      fontSize: 10,
                      color: "#9CA3AF",
                      marginBottom: 22,
                      borderBottom: "1px solid #EEE",
                      paddingBottom: 10,
                    }}
                  >
                    {props.c.code} · For Academic Use Only · CEIBS Africa · Do
                    Not Distribute
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: THEME.teal,
                      fontWeight: 900,
                      letterSpacing: "0.1em",
                      marginBottom: 8,
                    }}
                  >
                    {props.c.programme} · {props.c.sector}
                  </div>
                  <div
                    style={{
                      fontSize: 20,
                      fontFamily: "Georgia, serif",
                      fontWeight: 900,
                      color: THEME.redDark,
                      marginBottom: 4,
                      lineHeight: 1.3,
                    }}
                  >
                    {props.c.title}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: THEME.muted,
                      marginBottom: 18,
                    }}
                  >
                    CEIBS Africa Case Library · {props.c.year}
                  </div>
                  <div
                    style={{
                      height: 1,
                      background: "#E5E7EB",
                      marginBottom: 18,
                    }}
                  />
                  <div
                    style={{ fontSize: 12, lineHeight: 1.85, color: "#374151" }}
                  >
                    <strong>Abstract</strong>
                    <br />
                    {props.c.abstract}
                    <br />
                    <br />
                    <em style={{ fontSize: 11, color: "#9CA3AF" }}>
                      [Full case document continues. In the live portal, this
                      area shows the complete embedded PDF. Students read the
                      full case here with scroll and zoom controls.]
                    </em>
                  </div>
                  <div
                    style={{
                      marginTop: 22,
                      padding: "10px 14px",
                      background: "#FFFBEB",
                      border: `1px solid ${THEME.gold}35`,
                      borderRadius: 10,
                      fontSize: 10,
                      color: "#6B7280",
                      textAlign: "center",
                    }}
                  >
                    Watermarked: {new Date().toLocaleDateString()} ·{" "}
                    {props.c.code}
                  </div>
                </div>
              </div>
            </div>

            <Section title="DISCUSSION QUESTIONS">
              {props.c.questions.map((q, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 10,
                    marginBottom: 10,
                    padding: "10px 14px",
                    background: THEME.bg,
                    borderRadius: 12,
                  }}
                >
                  <span
                    style={{ color: THEME.gold, fontWeight: 900, fontSize: 14 }}
                  >
                    Q{i + 1}
                  </span>
                  <span style={{ fontSize: 14, color: THEME.text }}>{q}</span>
                </div>
              ))}

              <div
                style={{
                  marginTop: 18,
                  borderTop: `1px solid ${THEME.border}`,
                  paddingTop: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    color: THEME.muted,
                    letterSpacing: "0.1em",
                    marginBottom: 12,
                  }}
                >
                  💬 CLASS DISCUSSION
                </div>

                {(props.comments ?? []).map((cm, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "10px 14px",
                      background: "#FAFAFA",
                      borderRadius: 12,
                      marginBottom: 8,
                      fontSize: 13,
                      color: THEME.text,
                      borderLeft: `3px solid ${THEME.gold}`,
                      lineHeight: 1.5,
                    }}
                  >
                    {cm}
                  </div>
                ))}

                {(props.comments ?? []).length === 0 && (
                  <div
                    style={{
                      fontSize: 13,
                      color: THEME.muted,
                      marginBottom: 12,
                    }}
                  >
                    No comments yet — be the first to post your insight.
                  </div>
                )}

                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <input
                    value={props.newComment}
                    onChange={(e) => props.setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && props.onPost()}
                    placeholder="Share your pre-class analysis or reaction…"
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      border: `1px solid ${THEME.border}`,
                      borderRadius: 12,
                      fontSize: 13,
                      outline: "none",
                      background: THEME.white,
                    }}
                  />
                  <button
                    onClick={props.onPost}
                    style={{ ...primaryButton("solid"), borderRadius: 12 }}
                  >
                    Post
                  </button>
                </div>
              </div>
            </Section>
          </>
        )}

        {props.activeTab === "teaching" && (
          <>
            <div
              style={{
                background: `linear-gradient(135deg, ${THEME.redDark}, ${THEME.red})`,
                borderRadius: 14,
                padding: "22px 24px",
                marginBottom: 18,
                border: `2px solid ${THEME.gold}40`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 20 }}>🔒</span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 900,
                    color: THEME.gold,
                    letterSpacing: "0.1em",
                  }}
                >
                  TEACHING NOTES — FACULTY & ADMIN ONLY
                </span>
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.82)" }}>
                This section is not visible to students. Do not share this link
                or content externally.
              </div>
            </div>

            <Section title="FACILITATION OVERVIEW">
              <p
                style={{
                  fontSize: 14,
                  color: THEME.text,
                  lineHeight: 1.75,
                  margin: 0,
                }}
              >
                {props.c.teachingNote}
              </p>
            </Section>

            {[
              {
                label: "TIME BREAKDOWN",
                icon: "⏱",
                content: `0–15 min: Individual silent analysis\n15–45 min: Small group discussion (4–5 students)\n45–75 min: Full plenary — faculty-facilitated\n75–${props.c.duration} min: Synthesis and frameworks`,
              },
              {
                label: "BOARD PLAN",
                icon: "🗂",
                content: `Column 1: Strategic Options\nColumn 2: Risk Analysis (probability × impact)\nColumn 3: Recommendation + rationale\nFaculty synthesis: introduce the framework after options are surfaced, not before.`,
              },
              {
                label: "COMMON STUDENT MISTAKES",
                icon: "⚠️",
                content:
                  "Students often jump to a recommendation before fully mapping the option space. Force them to name at least 4 strategic paths before evaluating any.\nSecond error: treating this as a finance case when it is fundamentally a leadership/identity case.",
              },
            ].map(({ label, icon, content }) => (
              <Section key={label} title={`${icon} ${label}`}>
                <pre
                  style={{
                    fontSize: 13,
                    color: THEME.text,
                    lineHeight: 1.75,
                    margin: 0,
                    whiteSpace: "pre-wrap",
                    fontFamily: "sans-serif",
                  }}
                >
                  {content}
                </pre>
              </Section>
            ))}

            <div
              style={{
                background: THEME.white,
                borderRadius: 14,
                padding: "18px 18px",
                border: `1px solid ${THEME.border}`,
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  background: THEME.redDark,
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                }}
              >
                📄
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{ fontSize: 13, fontWeight: 900, color: THEME.text }}
                >
                  {props.c.title} — Teaching Note v1.0
                </div>
                <div style={{ fontSize: 12, color: THEME.muted }}>
                  Full facilitation guide PDF
                </div>
              </div>
              <button
                style={{
                  ...primaryButton("solid"),
                  padding: "9px 14px",
                  borderRadius: 12,
                }}
              >
                ⬇ Download TN
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function AdminScreen(props: {
  cases: Case[];
  tab: AdminTab;
  setTab: (t: AdminTab) => void;
  onLogout: () => void;
  onOpen: (c: Case) => void;
}) {
  const stats = [
    {
      label: "Total Cases",
      value: props.cases.length + 3,
      color: THEME.redDark,
      icon: "📚",
    },
    {
      label: "Published",
      value: props.cases.length,
      color: THEME.teal,
      icon: "✅",
    },
    { label: "In Review", value: 1, color: THEME.gold, icon: "🔍" },
    { label: "Draft", value: 2, color: THEME.muted, icon: "✏️" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: THEME.bg,
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          background: THEME.redDark,
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          height: 64,
          boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginRight: 34,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              background: THEME.gold,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              color: THEME.redDark,
              fontSize: 13,
            }}
          >
            CA
          </div>
          <div>
            <div
              style={{
                color: THEME.white,
                fontWeight: 900,
                fontSize: 14,
                fontFamily: "Georgia, serif",
              }}
            >
              CEIBS Africa
            </div>
            <div
              style={{
                color: THEME.gold,
                fontSize: 10,
                letterSpacing: "0.12em",
              }}
            >
              ADMIN DASHBOARD
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {(["cases", "upload", "analytics"] as const).map((t) => (
            <button
              key={t}
              onClick={() => props.setTab(t)}
              style={{
                padding: "8px 14px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: props.tab === t ? 900 : 600,
                background:
                  props.tab === t ? "rgba(255,255,255,0.16)" : "transparent",
                color: props.tab === t ? THEME.white : "rgba(255,255,255,0.72)",
                textTransform: "capitalize",
              }}
            >
              {t === "cases"
                ? "📚 Cases"
                : t === "upload"
                ? "⬆ Upload"
                : "📊 Analytics"}
            </button>
          ))}
        </div>

        <button
          onClick={props.onLogout}
          style={{
            marginLeft: "auto",
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.75)",
            fontSize: 12,
            cursor: "pointer",
            fontWeight: 800,
          }}
        >
          Log out
        </button>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        {props.tab === "cases" && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 16,
                marginBottom: 24,
              }}
            >
              {stats.map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: THEME.white,
                    borderRadius: 14,
                    padding: "18px 18px",
                    border: `1px solid ${THEME.border}`,
                    borderTop: `3px solid ${s.color}`,
                  }}
                >
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 900,
                      color: s.color,
                      fontFamily: "Georgia, serif",
                    }}
                  >
                    {s.value}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: THEME.muted,
                      marginTop: 2,
                      fontWeight: 700,
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                background: THEME.white,
                borderRadius: 14,
                border: `1px solid ${THEME.border}`,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "16px 18px",
                  borderBottom: `1px solid ${THEME.border}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{ fontWeight: 900, color: THEME.text, fontSize: 14 }}
                >
                  Case Registry
                </span>
                <button
                  onClick={() => props.setTab("upload")}
                  style={{
                    ...primaryButton("solid"),
                    padding: "9px 12px",
                    borderRadius: 12,
                  }}
                >
                  + Upload New Case
                </button>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F7F8FC" }}>
                    {[
                      "Code",
                      "Title",
                      "Programme",
                      "Sector",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "10px 14px",
                          textAlign: "left",
                          fontSize: 11,
                          color: THEME.muted,
                          fontWeight: 900,
                          letterSpacing: "0.06em",
                          borderBottom: `1px solid ${THEME.border}`,
                        }}
                      >
                        {h.toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {props.cases.map((c, i) => (
                    <tr
                      key={c.id}
                      style={{
                        borderBottom: `1px solid ${THEME.border}`,
                        background: i % 2 === 0 ? THEME.white : "#FAFBFE",
                      }}
                    >
                      <td
                        style={{
                          padding: "10px 14px",
                          fontSize: 11,
                          fontFamily: "monospace",
                          color: THEME.muted,
                          fontWeight: 700,
                        }}
                      >
                        {c.code}
                      </td>
                      <td
                        style={{
                          padding: "10px 14px",
                          fontSize: 13,
                          fontWeight: 800,
                          color: THEME.text,
                          maxWidth: 280,
                        }}
                      >
                        {c.title}
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <span
                          style={{
                            ...chip(c.programme, programmeColor[c.programme]),
                            fontSize: 10,
                          }}
                        >
                          {c.programme}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "10px 14px",
                          fontSize: 12,
                          color: THEME.muted,
                        }}
                      >
                        {c.sector}
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <span
                          style={{
                            ...chip("Published", THEME.teal),
                            fontSize: 10,
                          }}
                        >
                          Published
                        </span>
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={() => props.onOpen(c)}
                            style={primaryButton("ghost")}
                          >
                            View
                          </button>
                          <button
                            style={{
                              ...primaryButton("ghost"),
                              color: THEME.muted,
                            }}
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {props.tab === "upload" && (
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <h2
              style={{
                fontFamily: "Georgia, serif",
                color: THEME.text,
                marginBottom: 18,
                fontWeight: 900,
              }}
            >
              Upload New Case
            </h2>
            <div
              style={{
                background: THEME.white,
                borderRadius: 14,
                padding: "28px 28px",
                border: `1px solid ${THEME.border}`,
              }}
            >
              <Field label="CASE TITLE">
                <input
                  placeholder="e.g. FinTech Disruption in Ghana"
                  style={inputStyle()}
                />
              </Field>
              <Field label="CASE CODE">
                <input placeholder="e.g. CA-2026-GH-001" style={inputStyle()} />
              </Field>
              <Field label="ABSTRACT">
                <textarea
                  placeholder="5–8 sentence case synopsis…"
                  style={{ ...inputStyle(), height: 90, resize: "none" }}
                />
              </Field>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                  marginBottom: 16,
                }}
              >
                <div>
                  <label style={labelStyle()}>PROGRAMME</label>
                  <select style={inputStyle()}>
                    {PROGRAMMES.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle()}>STATUS</label>
                  <select style={inputStyle()}>
                    {["Draft", "Under Review", "Approved", "Published"].map(
                      (s) => (
                        <option key={s}>{s}</option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <Field label="CASE PDF (Google Drive /preview link)">
                <input
                  placeholder="https://drive.google.com/file/d/.../preview"
                  style={inputStyle()}
                />
              </Field>

              <Field label="TEACHING NOTE PDF (Faculty-only link)">
                <input
                  placeholder="Restricted Google Drive link — faculty only"
                  style={{ ...inputStyle(), borderColor: `${THEME.gold}` }}
                />
              </Field>

              <button
                style={{
                  ...primaryButton("solid"),
                  width: "100%",
                  borderRadius: 12,
                }}
              >
                Save Case (as Draft)
              </button>
            </div>
          </div>
        )}

        {props.tab === "analytics" && (
          <div>
            <h2
              style={{
                fontFamily: "Georgia, serif",
                color: THEME.text,
                marginBottom: 18,
                fontWeight: 900,
              }}
            >
              Programme Analytics
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 18,
                marginBottom: 18,
              }}
            >
              {[
                {
                  title: "Most Active Programme",
                  value: "GEMBA 2025",
                  sub: "847 case opens this semester",
                  icon: "🏆",
                },
                {
                  title: "Pre-class Completion Rate",
                  value: "82%",
                  sub: "Students reading before class",
                  icon: "📖",
                },
                {
                  title: "Avg. Discussion Posts / Case",
                  value: "12.4",
                  sub: "Up 34% from last cohort",
                  icon: "💬",
                },
                {
                  title: "Most Opened Case",
                  value: "Standard Bank AI Dilemma",
                  sub: "CA-2026-ZA-005 · 124 opens",
                  icon: "🔥",
                },
              ].map((s) => (
                <div
                  key={s.title}
                  style={{
                    background: THEME.white,
                    borderRadius: 14,
                    padding: "18px 18px",
                    border: `1px solid ${THEME.border}`,
                  }}
                >
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                  <div
                    style={{
                      fontSize: 11,
                      color: THEME.muted,
                      fontWeight: 900,
                      letterSpacing: "0.08em",
                      marginBottom: 6,
                    }}
                  >
                    {s.title.toUpperCase()}
                  </div>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 900,
                      color: THEME.text,
                      fontFamily: "Georgia, serif",
                    }}
                  >
                    {s.value}
                  </div>
                  <div
                    style={{ fontSize: 12, color: THEME.muted, marginTop: 4 }}
                  >
                    {s.sub}
                  </div>
                </div>
              ))}
            </div>

            <Section title="CASES BY SECTOR">
              {[
                ["Banking", 2, THEME.redDark],
                ["Manufacturing", 1, THEME.teal],
                ["Energy", 1, THEME.gold],
                ["Real Estate", 1, "#7C3AED"],
                ["Telecoms", 1, THEME.red],
              ].map(([sector, count, color]) => (
                <div
                  key={String(sector)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      width: 110,
                      fontSize: 12,
                      color: THEME.text,
                      fontWeight: 800,
                    }}
                  >
                    {sector as string}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      height: 10,
                      background: "#EEF2F7",
                      borderRadius: 999,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${Number(count) * 33}%`,
                        height: "100%",
                        background: color as string,
                        borderRadius: 999,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      width: 24,
                      fontSize: 12,
                      color: THEME.muted,
                      textAlign: "right",
                      fontWeight: 800,
                    }}
                  >
                    {count as number}
                  </div>
                </div>
              ))}
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}

function TopNav(props: {
  leftTitle: string;
  leftSubtitle: string;
  badge: string;
  onLogout: () => void;
}) {
  return (
    <div
      style={{
        background: THEME.redDark,
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 64,
        boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 34,
            height: 34,
            background: THEME.gold,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            color: THEME.redDark,
            fontSize: 13,
          }}
        >
          CA
        </div>
        <div>
          <div
            style={{
              color: THEME.white,
              fontWeight: 900,
              fontSize: 14,
              fontFamily: "Georgia, serif",
              letterSpacing: "0.03em",
            }}
          >
            {props.leftTitle}
          </div>
          <div
            style={{ color: THEME.gold, fontSize: 10, letterSpacing: "0.12em" }}
          >
            {props.leftSubtitle}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div
          style={{
            display: "flex",
            gap: 4,
            background: "rgba(255,255,255,0.10)",
            borderRadius: 999,
            padding: "4px 12px",
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: THEME.gold,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontWeight: 900,
            }}
          >
            {props.badge}
          </span>
        </div>
        <div
          style={{ width: 1, height: 20, background: "rgba(255,255,255,0.22)" }}
        />
        <button
          onClick={props.onLogout}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.75)",
            fontSize: 12,
            cursor: "pointer",
            fontWeight: 900,
          }}
        >
          Log out
        </button>
      </div>
    </div>
  );
}

function FilterChip(props: {
  label: string;
  active: boolean;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      onClick={props.onClick}
      style={{
        padding: "6px 12px",
        borderRadius: 999,
        border: `1px solid ${props.active ? props.color : THEME.border}`,
        background: props.active ? props.color : THEME.white,
        color: props.active ? THEME.white : THEME.text,
        fontSize: 12,
        fontWeight: props.active ? 900 : 700,
        cursor: "pointer",
        transition: "all 0.12s",
      }}
    >
      {props.label}
    </button>
  );
}

function Section(props: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: THEME.white,
        borderRadius: 14,
        padding: "22px 22px",
        marginBottom: 18,
        border: `1px solid ${THEME.border}`,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 900,
          color: THEME.muted,
          letterSpacing: "0.1em",
          marginBottom: 14,
        }}
      >
        {props.title}
      </div>
      {props.children}
    </div>
  );
}

function Divider() {
  return (
    <div style={{ width: 1, background: THEME.border, margin: "0 6px" }} />
  );
}

function Field(props: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle()}>{props.label}</label>
      {props.children}
    </div>
  );
}

function labelStyle(): React.CSSProperties {
  return {
    display: "block",
    fontSize: 11,
    fontWeight: 900,
    color: THEME.muted,
    marginBottom: 6,
    letterSpacing: "0.08em",
    fontFamily: "sans-serif",
  };
}

function inputStyle(): React.CSSProperties {
  return {
    width: "100%",
    padding: "12px 14px",
    border: `1px solid ${THEME.border}`,
    borderRadius: 12,
    fontSize: 14,
    fontFamily: "sans-serif",
    outline: "none",
    boxSizing: "border-box",
    background: "#FAFBFE",
  };
}
