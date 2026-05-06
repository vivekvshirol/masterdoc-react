import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://nmatlgpcvhvgeqiazutu.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tYXRsZ3Bjdmh2Z2VxaWF6dXR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNzg2NjUsImV4cCI6MjA5Mjk1NDY2NX0._nEy0wPP_mRcjPUO9v6oBBhdcCRYERwC8sDULwTUjcI"
);

const DOCTOR_EMAIL = "vivekvshirol@gmail.com";

const s = {
  app: { background: "#0a1628", minHeight: "100vh", color: "#e8f4f8", fontFamily: "Arial, sans-serif", maxWidth: 500, margin: "0 auto", padding: "0 0 80px", position: "relative" },
  navbar: { background: "#0f2040", borderBottom: "2px solid #7c3aed", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 20 },
  logo: { color: "#7c3aed", fontWeight: "bold", fontSize: 17 },
  page: { padding: "18px 16px", position: "relative" },
  title: { color: "#7c3aed", fontSize: 20, marginBottom: 4 },
  subtitle: { color: "#7fa8c9", fontSize: 13, marginBottom: 18 },
  card: { background: "#132850", border: "1px solid #1e3a5f", borderRadius: 14, padding: 16, marginBottom: 12 },
  input: { width: "100%", padding: 12, borderRadius: 10, border: "1px solid #1e3a5f", background: "#0f2040", color: "#e8f4f8", fontSize: 15, marginBottom: 14, boxSizing: "border-box", display: "block" },
  label: { color: "#7fa8c9", fontSize: 11, marginBottom: 5, display: "block", textTransform: "uppercase", letterSpacing: 0.5 },
  btn: { width: "100%", background: "#7c3aed", color: "#fff", border: "none", padding: 14, borderRadius: 12, fontSize: 15, fontWeight: "bold", cursor: "pointer", marginTop: 6 },
  btnOutline: { width: "100%", background: "#1e3a5f", color: "#7c3aed", border: "1px solid #7c3aed40", padding: 13, borderRadius: 12, fontSize: 14, fontWeight: "bold", cursor: "pointer", marginTop: 8 },
  btnBack: { width: "100%", background: "#0f2040", color: "#7fa8c9", border: "1px solid #1e3a5f", padding: 12, borderRadius: 12, fontSize: 14, cursor: "pointer", marginTop: 12 },
  bottomNav: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 500, background: "#0f2040", borderTop: "2px solid #7c3aed40", display: "flex", justifyContent: "space-around", padding: "8px 0", zIndex: 20 },
  bottomBtn: (active) => ({ background: "none", border: "none", cursor: "pointer", color: active ? "#7c3aed" : "#7fa8c9", fontSize: 9, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "3px 5px" }),
  badge: (color) => ({ background: color + "25", color, fontSize: 10, padding: "2px 8px", borderRadius: 20, display: "inline-block" }),
  seenBtn: (seen) => ({ background: seen ? "#00c9a720" : "#1e3a5f", color: seen ? "#00c9a7" : "#7fa8c9", border: seen ? "1px solid #00c9a740" : "1px solid #1e3a5f", borderRadius: 8, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontWeight: "bold", whiteSpace: "nowrap" }),
  statCard: (color) => ({ background: "#132850", border: `1px solid ${color}40`, borderRadius: 14, padding: 16, flex: 1, textAlign: "center" }),
};

const navTabs = [
  { id: "appointments", icon: "📅", label: "Appts" },
  { id: "patients", icon: "👥", label: "Patients" },
  { id: "feedback", icon: "⭐", label: "Feedback" },
  { id: "stats", icon: "📊", label: "Stats" },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

const bristolLabel = (type) => {
  const map = { 1: "Type 1 – Constipation", 2: "Type 2 – Constipation", 3: "Type 3 – Normal", 4: "Type 4 – Normal", 5: "Type 5 – Lacking Fiber", 6: "Type 6 – Mild Diarrhea", 7: "Type 7 – Diarrhea" };
  return map[type] || `Type ${type}`;
};

export default function App() {
  const [screen, setScreen] = useState("loading");
  const [activeTab, setActiveTab] = useState("appointments");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [stats, setStats] = useState({ appts: 0, patients: 0, feedback: 0, avgRating: 0 });
  const [seenKeys, setSeenKeys] = useState(() => {
    try { return JSON.parse(localStorage.getItem("md_seen") || "[]"); } catch { return []; }
  });
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [selectedApptSymptoms, setSelectedApptSymptoms] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientBristol, setPatientBristol] = useState([]);
  const [patientSymptoms, setPatientSymptoms] = useState([]);
  const [patientFeedback, setPatientFeedback] = useState([]);
  const [patientAppts, setPatientAppts] = useState([]);
  const [patientTab, setPatientTab] = useState("bristol");
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [settings, setSettings] = useState({
    doctor: "Dr. Vivek Shirol", quals: "MBBS, MD, DM Gastroenterology, SGPGI",
    clinic: "Dr. Vivek's Complete Gastro Care Clinic", address: "Belagavi, Karnataka",
    phone: "8310417749", timings: "Mon–Sat: 5:00 PM – 9:00 PM",
    holiday: "Sunday: Closed", maps_link: "https://maps.app.goo.gl/eQvb8QB8ANJPX2pU7",
  });
  const [settingsSaved, setSettingsSaved] = useState(false);

  // ── Seen helpers ──────────────────────────────────────────────────────────
  const getApptKey = (a) => a.uuid ? String(a.uuid) : `${a.phone}|${a.date}|${a.visit_type}`;
  const isSeen = (a) => seenKeys.includes(getApptKey(a));
  const markSeen = useCallback((a) => {
    const key = getApptKey(a);
    setSeenKeys(prev => {
      if (prev.includes(key)) return prev;
      const updated = [...prev, key];
      localStorage.setItem("md_seen", JSON.stringify(updated));
      return updated;
    });
  }, []);
  const unmarkSeen = (a) => {
    const key = getApptKey(a);
    setSeenKeys(prev => {
      const updated = prev.filter(k => k !== key);
      localStorage.setItem("md_seen", JSON.stringify(updated));
      return updated;
    });
  };
  const toggleSeen = (a, e) => { e.stopPropagation(); isSeen(a) ? unmarkSeen(a) : markSeen(a); };

  // ── Data fetchers ─────────────────────────────────────────────────────────
  const fetchAppointments = useCallback(async () => {
    const { data } = await supabase
      .from("appointments")
      .select("patient_name, phone, date, visit_type, uuid, Created_at")
      .order("date", { ascending: false });
    if (data) setAppointments(data);
  }, []);

  const fetchPatients = useCallback(async () => {
    const { data } = await supabase
      .from("appointments")
      .select("patient_name, phone, uuid")
      .order("date", { ascending: false });
    if (!data) return;
    const seen = new Set();
    const unique = [];
    for (const row of data) {
      const key = row.phone || row.patient_name;
      if (!seen.has(key)) { seen.add(key); unique.push(row); }
    }
    setPatients(unique);
  }, []);

  const fetchFeedback = useCallback(async () => {
    const [{ data: fbData }, { data: profileData }, { data: apptUuidData }] = await Promise.all([
      supabase.from("feedback").select("id, user_id, rating, message, created_at").order("created_at", { ascending: false }),
      supabase.from("patient_profiles").select("user_id, phone"),
      supabase.from("appointments").select("patient_name, phone, uuid"),
    ]);
    if (!fbData) return;

    const profileByUserId = {};
    (profileData || []).forEach(p => { if (p.user_id) profileByUserId[p.user_id] = p.phone; });

    const nameByPhone = {};
    const nameByUuid = {};
    (apptUuidData || []).forEach(a => {
      if (a.phone && a.patient_name) nameByPhone[a.phone] = a.patient_name;
      if (a.uuid && a.patient_name) nameByUuid[a.uuid] = a.patient_name;
    });

    const enriched = fbData.map(fb => {
      let name = null;
      if (fb.user_id && nameByUuid[fb.user_id]) name = nameByUuid[fb.user_id];
      if (!name && fb.user_id && profileByUserId[fb.user_id]) {
        name = nameByPhone[profileByUserId[fb.user_id]] || null;
      }
      return { ...fb, patient_name: name || "Unknown Patient" };
    });
    setFeedbackList(enriched);
  }, []);

  const fetchStats = useCallback(async () => {
    const [{ data: appts }, { data: fb }, { data: prof }] = await Promise.all([
      supabase.from("appointments").select("patient_name"),
      supabase.from("feedback").select("rating"),
      supabase.from("patient_profiles").select("user_id"),
    ]);
    const apptCount = appts?.length || 0;
    const patCount = prof?.length || 0;
    const fbCount = fb?.length || 0;
    const avgRating = fbCount > 0 ? (fb.reduce((s, f) => s + (f.rating || 0), 0) / fbCount).toFixed(1) : "—";
    setStats({ appts: apptCount, patients: patCount, feedback: fbCount, avgRating });
  }, []);

  const fetchSettings = useCallback(async () => {
    const { data } = await supabase.from("clinic_settings").select("key, value");
    if (data && data.length > 0) {
      const obj = {};
      data.forEach(r => { obj[r.key] = r.value; });
      setSettings(prev => ({ ...prev, ...obj }));
    }
  }, []);

  const loadAllData = useCallback(() => {
    fetchAppointments();
    fetchPatients();
    fetchFeedback();
    fetchStats();
    fetchSettings();
  }, [fetchAppointments, fetchPatients, fetchFeedback, fetchStats, fetchSettings]);

  // ── Auth check on startup ─────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email === DOCTOR_EMAIL) {
        setScreen("main");
        loadAllData();
      } else {
        setScreen("login");
      }
    });
  }, [loadAllData]);

  // ── Open appointment detail ───────────────────────────────────────────────
  const openApptDetail = async (appt) => {
    setSelectedAppt(appt);
    setSelectedApptSymptoms([]);
    setScreen("apptDetail");
    markSeen(appt);

    let userId = appt.uuid || null;
    if (!userId && appt.phone) {
      const { data: prof } = await supabase.from("patient_profiles").select("user_id").eq("phone", appt.phone).single();
      userId = prof?.user_id || null;
    }
    if (userId) {
      const { data } = await supabase.from("symptom_logs").select("symptoms, logged_at").eq("user_id", userId).order("logged_at", { ascending: false }).limit(10);
      setSelectedApptSymptoms(data || []);
    }
  };

  // ── Open patient detail ───────────────────────────────────────────────────
  const openPatient = async (patient) => {
    setSelectedPatient(patient);
    setPatientBristol([]); setPatientSymptoms([]); setPatientFeedback([]); setPatientAppts([]);
    setPatientTab("bristol");
    setScreen("patientDetail");
    setLoadingPatient(true);

    let userId = patient.uuid || null;
    if (!userId && patient.phone) {
      const { data: prof } = await supabase.from("patient_profiles").select("user_id").eq("phone", patient.phone).single();
      userId = prof?.user_id || null;
    }

    const { data: appts } = await supabase.from("appointments").select("patient_name, phone, date, visit_type, Created_at").eq("phone", patient.phone).order("date", { ascending: false });
    setPatientAppts(appts || []);

    if (userId) {
      const [{ data: bristol }, { data: symptoms }, { data: feedback }] = await Promise.all([
        supabase.from("bristol_logs").select("stool_type, tag, logged_at").eq("user_id", userId).order("logged_at", { ascending: false }).limit(30),
        supabase.from("symptom_logs").select("symptoms, logged_at").eq("user_id", userId).order("logged_at", { ascending: false }).limit(20),
        supabase.from("feedback").select("rating, message, created_at").eq("user_id", userId).order("created_at", { ascending: false }),
      ]);
      setPatientBristol(bristol || []);
      setPatientSymptoms(symptoms || []);
      setPatientFeedback(feedback || []);
    }
    setLoadingPatient(false);
  };

  // ── Save settings ─────────────────────────────────────────────────────────
  const saveSettings = async () => {
    const entries = Object.entries(settings).map(([key, value]) => ({ key, value }));
    for (const entry of entries) {
      await supabase.from("clinic_settings").upsert(entry, { onConflict: "key" });
    }
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  // ── Auth handlers ─────────────────────────────────────────────────────────
  const handleLogin = async () => {
    setLoginLoading(true); setLoginError("");
    const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    setLoginLoading(false);
    if (error) { setLoginError("❌ " + error.message); return; }
    if (data?.user?.email !== DOCTOR_EMAIL) {
      await supabase.auth.signOut();
      setLoginError("❌ Access denied. Doctor credentials only.");
      return;
    }
    loadAllData();
    setScreen("main");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setScreen("login"); setLoginEmail(""); setLoginPassword("");
  };

  // ── Loading screen ────────────────────────────────────────────────────────
  if (screen === "loading") {
    return (
      <div style={{ ...s.app, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🩺</div>
          <p style={{ color: "#7c3aed", fontSize: 16, fontWeight: "bold" }}>MasterDoc</p>
          <p style={{ color: "#7fa8c9", fontSize: 13 }}>Loading...</p>
        </div>
      </div>
    );
  }

  // ── Login screen ──────────────────────────────────────────────────────────
  if (screen === "login") {
    return (
      <div style={s.app}>
        <div style={s.navbar}><div style={s.logo}>🩺 MasterDoc</div></div>
        <div style={s.page}>
          <div style={{ textAlign: "center", padding: "30px 0 24px" }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>👨‍⚕️</div>
            <h2 style={{ color: "#7c3aed", fontSize: 22, margin: "0 0 6px" }}>Doctor Portal</h2>
            <p style={{ color: "#7fa8c9", fontSize: 13 }}>Dr. Vivek Shirol — Secure Login</p>
          </div>
          <label style={s.label}>Email</label>
          <input style={s.input} type="email" placeholder="doctor@email.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
          <label style={s.label}>Password</label>
          <input style={s.input} type="password" placeholder="Password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
          {loginError && <div style={{ background: "#ef444420", border: "1px solid #ef444440", borderRadius: 10, padding: "10px 14px", marginBottom: 12, fontSize: 13, color: "#ef4444" }}>{loginError}</div>}
          <button style={s.btn} onClick={handleLogin} disabled={loginLoading}>{loginLoading ? "Signing in..." : "🔐 Sign In to MasterDoc"}</button>
        </div>
      </div>
    );
  }

  // ── Appointment detail screen ─────────────────────────────────────────────
  if (screen === "apptDetail" && selectedAppt) {
    return (
      <div style={s.app}>
        <div style={s.navbar}>
          <div style={s.logo}>📋 Appointment Detail</div>
          <button style={{ background: "none", border: "none", color: "#7fa8c9", cursor: "pointer", fontSize: 13 }} onClick={() => setScreen("main")}>← Back</button>
        </div>
        <div style={s.page}>
          <div style={{ ...s.card, borderLeft: "3px solid #7c3aed" }}>
            <p style={{ color: "#7c3aed", fontSize: 11, fontWeight: "bold", marginBottom: 8 }}>PATIENT</p>
            <p style={{ color: "#e8f4f8", fontWeight: "bold", fontSize: 18, margin: "0 0 4px" }}>👤 {selectedAppt.patient_name}</p>
            <p style={{ color: "#7fa8c9", fontSize: 13, margin: "0 0 2px" }}>📞 {selectedAppt.phone}</p>
            <p style={{ color: "#7fa8c9", fontSize: 13, margin: "0 0 2px" }}>📅 {selectedAppt.date}</p>
            <p style={{ color: "#7fa8c9", fontSize: 13, margin: 0 }}>🏷️ {selectedAppt.visit_type}</p>
          </div>
          <p style={{ color: "#7fa8c9", fontSize: 11, fontWeight: "bold", marginBottom: 8, marginTop: 4 }}>🩺 SYMPTOMS / COMPLAINTS</p>
          {selectedApptSymptoms.length === 0
            ? <div style={s.card}><p style={{ color: "#7fa8c9", fontSize: 13, margin: 0 }}>No symptoms logged for this patient yet.</p></div>
            : selectedApptSymptoms.map((log, i) => (
              <div key={i} style={s.card}>
                <p style={{ color: "#7fa8c9", fontSize: 10, marginBottom: 6 }}>{new Date(log.logged_at).toLocaleString()}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {(log.symptoms || []).map((sym, j) => <span key={j} style={s.badge("#00c9a7")}>{sym}</span>)}
                </div>
              </div>
            ))
          }
          <button style={s.btnBack} onClick={() => setScreen("main")}>← Back to Appointments</button>
        </div>
      </div>
    );
  }

  // ── Patient detail screen ─────────────────────────────────────────────────
  if (screen === "patientDetail" && selectedPatient) {
    const tabs = [
      { id: "bristol", label: "💧 Bristol" },
      { id: "symptoms", label: "🩺 Symptoms" },
      { id: "feedback", label: "⭐ Feedback" },
      { id: "appts", label: "📅 Appts" },
    ];
    return (
      <div style={s.app}>
        <div style={s.navbar}>
          <div style={s.logo}>👤 {selectedPatient.patient_name}</div>
          <button style={{ background: "none", border: "none", color: "#7fa8c9", cursor: "pointer", fontSize: 13 }} onClick={() => setScreen("main")}>← Back</button>
        </div>
        <div style={s.page}>
          <div style={{ ...s.card, borderLeft: "3px solid #7c3aed", marginBottom: 16 }}>
            <p style={{ color: "#e8f4f8", fontWeight: "bold", fontSize: 16, margin: "0 0 3px" }}>👤 {selectedPatient.patient_name}</p>
            <p style={{ color: "#7fa8c9", fontSize: 13, margin: 0 }}>📞 {selectedPatient.phone}</p>
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto" }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setPatientTab(t.id)}
                style={{ background: patientTab === t.id ? "#7c3aed" : "#1e3a5f", color: patientTab === t.id ? "#fff" : "#7fa8c9", border: "none", borderRadius: 20, padding: "7px 14px", fontSize: 12, fontWeight: "bold", cursor: "pointer", whiteSpace: "nowrap" }}>
                {t.label}
              </button>
            ))}
          </div>
          {loadingPatient && <p style={{ color: "#7fa8c9", fontSize: 13 }}>Loading...</p>}

          {patientTab === "bristol" && !loadingPatient && (
            patientBristol.length === 0
              ? <div style={s.card}><p style={{ color: "#7fa8c9", fontSize: 13, margin: 0 }}>No Bristol logs found.</p></div>
              : patientBristol.map((b, i) => (
                <div key={i} style={s.card}>
                  <p style={{ color: "#e8f4f8", fontWeight: "bold", fontSize: 14, margin: "0 0 3px" }}>{bristolLabel(b.stool_type)}</p>
                  <p style={{ color: "#7fa8c9", fontSize: 11, margin: 0 }}>{new Date(b.logged_at).toLocaleString()}</p>
                </div>
              ))
          )}

          {patientTab === "symptoms" && !loadingPatient && (
            patientSymptoms.length === 0
              ? <div style={s.card}><p style={{ color: "#7fa8c9", fontSize: 13, margin: 0 }}>No symptom logs found.</p></div>
              : patientSymptoms.map((log, i) => (
                <div key={i} style={s.card}>
                  <p style={{ color: "#7fa8c9", fontSize: 10, marginBottom: 6 }}>{new Date(log.logged_at).toLocaleString()}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {(log.symptoms || []).map((sym, j) => <span key={j} style={s.badge("#00c9a7")}>{sym}</span>)}
                  </div>
                </div>
              ))
          )}

          {patientTab === "feedback" && !loadingPatient && (
            patientFeedback.length === 0
              ? <div style={s.card}><p style={{ color: "#7fa8c9", fontSize: 13, margin: 0 }}>No feedback from this patient yet.</p></div>
              : patientFeedback.map((fb, i) => (
                <div key={i} style={{ ...s.card, borderLeft: "3px solid #f59e0b" }}>
                  <div style={{ display: "flex", gap: 2, marginBottom: 6 }}>
                    {[1,2,3,4,5].map(star => <span key={star} style={{ color: star <= fb.rating ? "#f59e0b" : "#1e3a5f", fontSize: 20 }}>★</span>)}
                    <span style={{ color: "#f59e0b", fontWeight: "bold", fontSize: 14, marginLeft: 6 }}>{fb.rating}/5</span>
                  </div>
                  {fb.message && <p style={{ color: "#e8f4f8", fontSize: 13, margin: "0 0 4px", lineHeight: 1.5 }}>"{fb.message}"</p>}
                  {fb.created_at && <p style={{ color: "#7fa8c9", fontSize: 10, margin: 0 }}>{new Date(fb.created_at).toLocaleString()}</p>}
                </div>
              ))
          )}

          {patientTab === "appts" && !loadingPatient && (
            patientAppts.length === 0
              ? <div style={s.card}><p style={{ color: "#7fa8c9", fontSize: 13, margin: 0 }}>No appointments found.</p></div>
              : patientAppts.map((a, i) => (
                <div key={i} style={s.card}>
                  <p style={{ color: "#e8f4f8", fontWeight: "bold", fontSize: 13, margin: "0 0 3px" }}>📅 {a.date}</p>
                  <p style={{ color: "#7fa8c9", fontSize: 12, margin: "0 0 2px" }}>🏷️ {a.visit_type}</p>
                </div>
              ))
          )}

          <button style={s.btnBack} onClick={() => setScreen("main")}>← Back to Patients</button>
        </div>
      </div>
    );
  }

  // ── Main app ──────────────────────────────────────────────────────────────
  return (
    <div style={s.app}>
      <div style={s.navbar}>
        <div>
          <div style={s.logo}>🩺 MasterDoc</div>
          <div style={{ color: "#7fa8c9", fontSize: 10 }}>Dr. Vivek Shirol — Admin</div>
        </div>
        <button style={{ background: "none", border: "1px solid #7c3aed40", color: "#7fa8c9", padding: "5px 10px", borderRadius: 8, fontSize: 11, cursor: "pointer" }} onClick={handleLogout}>Logout</button>
      </div>

      {activeTab === "appointments" && (
        <div style={s.page}>
          <h2 style={s.title}>Appointments 📅</h2>
          <p style={s.subtitle}>{appointments.length} total · Tap any row to view details</p>
          {appointments.length === 0 && <div style={s.card}><p style={{ color: "#7fa8c9", margin: 0 }}>No appointments yet.</p></div>}
          {appointments.map((a, i) => (
            <div key={i} onClick={() => openApptDetail(a)}
              style={{ ...s.card, cursor: "pointer", borderLeft: isSeen(a) ? "3px solid #00c9a7" : "3px solid #7c3aed", opacity: isSeen(a) ? 0.75 : 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <p style={{ color: "#e8f4f8", fontWeight: "bold", fontSize: 14, margin: "0 0 3px" }}>👤 {a.patient_name}</p>
                  <p style={{ color: "#7fa8c9", fontSize: 12, margin: "0 0 2px" }}>📞 {a.phone}</p>
                  <p style={{ color: "#7fa8c9", fontSize: 12, margin: 0 }}>📅 {a.date} · {a.visit_type}</p>
                </div>
                <button style={s.seenBtn(isSeen(a))} onClick={(e) => toggleSeen(a, e)}>
                  {isSeen(a) ? "✓ Seen" : "Mark Seen"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "patients" && (
        <div style={s.page}>
          <h2 style={s.title}>Patients 👥</h2>
          <p style={s.subtitle}>{patients.length} unique patients · Tap to view full profile</p>
          {patients.length === 0 && <div style={s.card}><p style={{ color: "#7fa8c9", margin: 0 }}>No patients found.</p></div>}
          {patients.map((p, i) => (
            <div key={i} onClick={() => openPatient(p)}
              style={{ ...s.card, cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#7c3aed25", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>👤</div>
              <div style={{ flex: 1 }}>
                <p style={{ color: "#e8f4f8", fontWeight: "bold", fontSize: 14, margin: "0 0 3px" }}>{p.patient_name}</p>
                <p style={{ color: "#7fa8c9", fontSize: 12, margin: 0 }}>📞 {p.phone}</p>
              </div>
              <span style={{ color: "#7c3aed", fontSize: 18 }}>›</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === "feedback" && (
        <div style={s.page}>
          <h2 style={s.title}>Patient Feedback ⭐</h2>
          <p style={s.subtitle}>{feedbackList.length} reviews · Avg {stats.avgRating} stars</p>
          {feedbackList.length === 0 && <div style={s.card}><p style={{ color: "#7fa8c9", margin: 0 }}>No feedback yet.</p></div>}
          {feedbackList.map((fb, i) => (
            <div key={i} style={{ ...s.card, borderLeft: "3px solid #f59e0b" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <p style={{ color: "#e8f4f8", fontWeight: "bold", fontSize: 14, margin: 0 }}>👤 {fb.patient_name}</p>
                <div style={{ display: "flex", gap: 1 }}>
                  {[1,2,3,4,5].map(star => <span key={star} style={{ color: star <= fb.rating ? "#f59e0b" : "#1e3a5f", fontSize: 18 }}>★</span>)}
                </div>
              </div>
              {fb.message && <p style={{ color: "#e8f4f8", fontSize: 13, margin: "0 0 6px", lineHeight: 1.5, fontStyle: "italic" }}>"{fb.message}"</p>}
              {fb.created_at && <p style={{ color: "#7fa8c9", fontSize: 10, margin: 0 }}>{new Date(fb.created_at).toLocaleString()}</p>}
            </div>
          ))}
        </div>
      )}

      {activeTab === "stats" && (
        <div style={s.page}>
          <h2 style={s.title}>Statistics 📊</h2>
          <p style={s.subtitle}>Overview of your practice</p>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <div style={s.statCard("#7c3aed")}>
              <p style={{ color: "#7c3aed", fontSize: 28, fontWeight: "bold", margin: "0 0 4px" }}>{stats.appts}</p>
              <p style={{ color: "#7fa8c9", fontSize: 11, margin: 0 }}>Appointments</p>
            </div>
            <div style={s.statCard("#00c9a7")}>
              <p style={{ color: "#00c9a7", fontSize: 28, fontWeight: "bold", margin: "0 0 4px" }}>{stats.patients}</p>
              <p style={{ color: "#7fa8c9", fontSize: 11, margin: 0 }}>Patients</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={s.statCard("#f59e0b")}>
              <p style={{ color: "#f59e0b", fontSize: 28, fontWeight: "bold", margin: "0 0 4px" }}>{stats.feedback}</p>
              <p style={{ color: "#7fa8c9", fontSize: 11, margin: 0 }}>Reviews</p>
            </div>
            <div style={s.statCard("#ef4444")}>
              <p style={{ color: "#ef4444", fontSize: 28, fontWeight: "bold", margin: "0 0 4px" }}>{stats.avgRating}★</p>
              <p style={{ color: "#7fa8c9", fontSize: 11, margin: 0 }}>Avg Rating</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div style={s.page}>
          <h2 style={s.title}>Clinic Settings ⚙️</h2>
          <p style={s.subtitle}>Changes sync to GastroDoc instantly</p>
          {[
            { key: "doctor", label: "Doctor Name" },
            { key: "quals", label: "Qualifications" },
            { key: "clinic", label: "Clinic Name" },
            { key: "address", label: "Address" },
            { key: "phone", label: "Phone Number" },
            { key: "timings", label: "Clinic Timings" },
            { key: "holiday", label: "Holiday / Off Day" },
            { key: "maps_link", label: "Google Maps Link" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label style={s.label}>{label}</label>
              <input style={s.input} value={settings[key] || ""} onChange={e => setSettings(prev => ({ ...prev, [key]: e.target.value }))} />
            </div>
          ))}
          <button style={s.btn} onClick={saveSettings}>{settingsSaved ? "✅ Saved!" : "💾 Save Settings"}</button>
          <button style={s.btnOutline} onClick={handleLogout}>🚪 Logout</button>
        </div>
      )}

      <div style={s.bottomNav}>
        {navTabs.map(tab => (
          <button key={tab.id} style={s.bottomBtn(activeTab === tab.id)}
            onClick={() => { setScreen("main"); setActiveTab(tab.id); }}>
            <span style={{ fontSize: 18 }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
