import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://nmatlgpcvhvgeqiazutu.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tYXRsZ3Bjdmh2Z2VxaWF6dXR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNzg2NjUsImV4cCI6MjA5Mjk1NDY2NX0._nEy0wPP_mRcjPUO9v6oBBhdcCRYERwC8sDULwTUjcI"
);

const ADMIN_EMAIL = "vivekvshirol@gmail.com";

const s = {
  app: {
    background: "#0a0f1e",
    minHeight: "100vh",
    color: "#e8f4f8",
    fontFamily: "'Georgia', serif",
    maxWidth: 500,
    margin: "0 auto",
    padding: "0 0 80px",
    position: "relative",
  },
  navbar: {
    background: "linear-gradient(135deg, #0f1f3d, #162d4a)",
    borderBottom: "2px solid #c9a84c",
    padding: "14px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: { color: "#c9a84c", fontWeight: "bold", fontSize: 17, letterSpacing: 1 },
  page: { padding: "20px 16px" },
  title: { color: "#c9a84c", fontSize: 20, marginBottom: 4, fontWeight: "bold" },
  subtitle: { color: "#7fa8c9", fontSize: 13, marginBottom: 20 },
  card: {
    background: "linear-gradient(135deg, #0f1f3d, #0d1a30)",
    border: "1px solid #1e3a5f",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  input: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "1px solid #c9a84c40",
    background: "#0f1f3d",
    color: "#e8f4f8",
    fontSize: 15,
    marginBottom: 14,
    boxSizing: "border-box",
    display: "block",
    fontFamily: "'Georgia', serif",
  },
  label: {
    color: "#c9a84c",
    fontSize: 11,
    marginBottom: 5,
    display: "block",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  btn: {
    width: "100%",
    background: "linear-gradient(135deg, #c9a84c, #a8832a)",
    color: "#0a0f1e",
    border: "none",
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: 6,
    fontFamily: "'Georgia', serif",
  },
  badge: (color) => ({
    background: color + "20",
    color: color,
    fontSize: 10,
    padding: "3px 10px",
    borderRadius: 20,
    fontWeight: "bold",
    display: "inline-block",
  }),
  bottomNav: {
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: 500,
    background: "#0f1f3d",
    borderTop: "1px solid #c9a84c40",
    display: "flex",
    justifyContent: "space-around",
    padding: "8px 0",
    zIndex: 10,
  },
  bottomBtn: (active) => ({
    background: "none",
    border: "none",
    cursor: "pointer",
    color: active ? "#c9a84c" : "#7fa8c9",
    fontSize: 9,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    padding: "3px 5px",
    fontFamily: "'Georgia', serif",
  }),
};

const Stars = ({ rating }) => (
  <span>
    {[1, 2, 3, 4, 5].map((n) => (
      <span key={n} style={{ color: n <= rating ? "#f59e0b" : "#1e3a5f", fontSize: 18 }}>★</span>
    ))}
  </span>
);

export default function MasterDoc() {
  const [user, setUser] = useState(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [screen, setScreen] = useState("appointments");

  // Appointments
  const [appointments, setAppointments] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  // SEEN IDS — stored as array of strings, compared strictly as strings
  const [seenIds, setSeenIds] = useState([]);

  // Selected appointment detail
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [apptSymptoms, setApptSymptoms] = useState([]);
  const [apptDetailLoading, setApptDetailLoading] = useState(false);

  // Patients
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientTab, setPatientTab] = useState("complaints");
  const [patientAppts, setPatientAppts] = useState([]);
  const [patientBristol, setPatientBristol] = useState([]);
  const [patientSymptomLogs, setPatientSymptomLogs] = useState([]);
  const [patientFeedback, setPatientFeedback] = useState([]);
  const [patientLoading, setPatientLoading] = useState(false);

  // Feedback
  const [allFeedback, setAllFeedback] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email === ADMIN_EMAIL) setUser(session.user);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user?.email === ADMIN_EMAIL) setUser(session.user);
      else setUser(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load seen IDs from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("masterdoc_seen_v4");
      if (saved) setSeenIds(JSON.parse(saved));
    } catch { setSeenIds([]); }
  }, []);

  // ISSUE 2 FIX: compare strictly as strings — UUIDs from Supabase are strings
  const isSeen = (id) => seenIds.includes(String(id));

  const markSeen = (e, id) => {
    e.stopPropagation();
    const sid = String(id);
    if (seenIds.includes(sid)) return;
    const updated = [...seenIds, sid];
    setSeenIds(updated);
    localStorage.setItem("masterdoc_seen_v4", JSON.stringify(updated));
  };

  const markUnseen = (e, id) => {
    e.stopPropagation();
    const sid = String(id);
    const updated = seenIds.filter((x) => x !== sid);
    setSeenIds(updated);
    localStorage.setItem("masterdoc_seen_v4", JSON.stringify(updated));
  };

  const handleLogin = async () => {
    if (!authEmail || !authPassword) { setAuthError("Please enter email and password."); return; }
    setAuthLoading(true); setAuthError("");
    const { data, error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
    setAuthLoading(false);
    if (error) { setAuthError("❌ " + error.message); return; }
    if (data?.user?.email !== ADMIN_EMAIL) {
      await supabase.auth.signOut();
      setAuthError("❌ Access denied. This app is for Dr. Vivek only.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Fetch appointments
  const fetchAppointments = useCallback(async () => {
    setDataLoading(true);
    const { data } = await supabase
      .from("appointments")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setAppointments(data);
    setDataLoading(false);
  }, []);

  // ISSUE 1 FIX: Fetch patients — try patient_profiles first, fallback to appointments
  const fetchPatients = useCallback(async () => {
    setDataLoading(true);

    // Try patient_profiles table first (registered GastroDoc users)
    const { data: profiles } = await supabase
      .from("patient_profiles")
      .select("*");

    // Also get appointments for name/phone enrichment
    const { data: appts } = await supabase
      .from("appointments")
      .select("patient_name, phone, user_id")
      .order("created_at", { ascending: false });

    if (profiles && profiles.length > 0) {
      // Build from profiles, enrich with appointment data
      const enriched = profiles.map((profile) => {
        const matchAppt = appts
          ? appts.find((a) => a.user_id === profile.user_id)
          : null;
        return {
          user_id: profile.user_id,
          patient_name:
            matchAppt?.patient_name ||
            profile.full_name ||
            profile.name ||
            profile.display_name ||
            "Unknown Patient",
          phone:
            matchAppt?.phone ||
            profile.phone ||
            profile.mobile ||
            "—",
          email: profile.email || "",
        };
      });
      setPatients(enriched);
    } else if (appts && appts.length > 0) {
      // Fallback: derive unique patients directly from appointments table
      const seen = new Set();
      const unique = [];
      for (const a of appts) {
        const key = String(a.phone || a.user_id || a.patient_name || "");
        if (key && !seen.has(key)) {
          seen.add(key);
          unique.push({
            user_id: a.user_id || null,
            patient_name: a.patient_name || "Unknown",
            phone: a.phone || "—",
          });
        }
      }
      setPatients(unique);
    } else {
      setPatients([]);
    }

    setDataLoading(false);
  }, []);

  // ISSUE 3 FIX: Fetch feedback with name from patient_profiles first, then appointments
  const fetchAllFeedback = useCallback(async () => {
    setFeedbackLoading(true);

    const { data: fbData } = await supabase
      .from("feedback")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (!fbData || fbData.length === 0) {
      setAllFeedback([]);
      setFeedbackLoading(false);
      return;
    }

    // Get patient_profiles for the most reliable name lookup
    const { data: profiles } = await supabase
      .from("patient_profiles")
      .select("user_id, full_name, name, display_name, phone, email");

    // Get appointments as fallback name source
    const { data: allAppts } = await supabase
      .from("appointments")
      .select("patient_name, phone, user_id");

    const enriched = fbData.map((fb) => {
      let patientName = null;

      // 1. Match via patient_profiles by user_id (most reliable)
      if (profiles && fb.user_id) {
        const profile = profiles.find((p) => p.user_id === fb.user_id);
        if (profile) {
          patientName =
            profile.full_name ||
            profile.name ||
            profile.display_name ||
            null;
        }
      }

      // 2. Match via appointments by user_id
      if (!patientName && allAppts && fb.user_id) {
        const appt = allAppts.find((a) => a.user_id === fb.user_id);
        if (appt) patientName = appt.patient_name;
      }

      // 3. Match via appointments by phone
      if (!patientName && allAppts && fb.phone) {
        const appt = allAppts.find((a) => a.phone === fb.phone);
        if (appt) patientName = appt.patient_name;
      }

      // 4. Match via profiles by phone
      if (!patientName && profiles && fb.phone) {
        const profile = profiles.find((p) => p.phone === fb.phone);
        if (profile) {
          patientName = profile.full_name || profile.name || null;
        }
      }

      return { ...fb, patientName: patientName || "Patient" };
    });

    setAllFeedback(enriched);
    setFeedbackLoading(false);
  }, []);

  useEffect(() => {
    if (!user) return;
    if (screen === "appointments") fetchAppointments();
    if (screen === "patients") fetchPatients();
    if (screen === "feedback") fetchAllFeedback();
    if (screen === "stats") { fetchAppointments(); fetchPatients(); }
  }, [user, screen, fetchAppointments, fetchPatients, fetchAllFeedback]);

  // Open appointment detail
  const openApptDetail = async (appt) => {
    setSelectedAppt(appt);
    setApptSymptoms([]);
    setApptDetailLoading(true);
    let symptoms = [];
    if (appt.user_id) {
      const { data } = await supabase
        .from("symptom_logs")
        .select("*")
        .eq("user_id", appt.user_id)
        .order("logged_at", { ascending: false });
      if (data) symptoms = data;
    }
    setApptSymptoms(symptoms);
    setApptDetailLoading(false);
  };

  // Open patient profile
  const openPatient = async (patient) => {
    setPatientLoading(true);
    setSelectedPatient(patient);
    setPatientTab("complaints");
    setPatientAppts([]);
    setPatientBristol([]);
    setPatientSymptomLogs([]);
    setPatientFeedback([]);

    // Appointments: match by phone first, then user_id
    if (patient.phone && patient.phone !== "—") {
      const { data: appts } = await supabase
        .from("appointments")
        .select("*")
        .eq("phone", patient.phone)
        .order("created_at", { ascending: false });
      setPatientAppts(appts || []);
    } else if (patient.user_id) {
      const { data: appts } = await supabase
        .from("appointments")
        .select("*")
        .eq("user_id", patient.user_id)
        .order("created_at", { ascending: false });
      setPatientAppts(appts || []);
    }

    // Symptom logs, Bristol logs, Feedback — all by user_id
    if (patient.user_id) {
      const { data: symData } = await supabase
        .from("symptom_logs")
        .select("*")
        .eq("user_id", patient.user_id)
        .order("logged_at", { ascending: false });
      setPatientSymptomLogs(symData || []);

      const { data: bristolData } = await supabase
        .from("bristol_logs")
        .select("*")
        .eq("user_id", patient.user_id)
        .order("logged_at", { ascending: false });
      setPatientBristol(bristolData || []);

      const { data: fbData } = await supabase
        .from("feedback")
        .select("*")
        .eq("user_id", patient.user_id)
        .order("submitted_at", { ascending: false });
      setPatientFeedback(fbData || []);
    }

    setPatientLoading(false);
  };

  const bristolTag = (type) => {
    if (type <= 2) return { label: "Constipation", color: "#ef4444" };
    if (type <= 4) return { label: "Normal", color: "#00c9a7" };
    if (type === 5) return { label: "Lacking Fiber", color: "#f59e0b" };
    if (type === 6) return { label: "Mild Diarrhea", color: "#f97316" };
    return { label: "Diarrhea", color: "#ef4444" };
  };

  const navScreens = [
    { id: "appointments", icon: "📅", label: "Appts" },
    { id: "patients", icon: "👥", label: "Patients" },
    { id: "feedback", icon: "⭐", label: "Feedback" },
    { id: "stats", icon: "📊", label: "Stats" },
  ];

  // ── LOGIN ──
  if (!user) {
    return (
      <div style={s.app}>
        <div style={s.navbar}>
          <div>
            <div style={s.logo}>⚕️ MasterDoc</div>
            <div style={{ color: "#7fa8c9", fontSize: 10 }}>Dr. Vivek Shirol — Admin Portal</div>
          </div>
        </div>
        <div style={s.page}>
          <div style={{ textAlign: "center", padding: "30px 0 28px" }}>
            <div style={{ fontSize: 64, marginBottom: 12 }}>🩺</div>
            <h2 style={{ color: "#c9a84c", fontSize: 22, margin: "0 0 6px" }}>Doctor Portal</h2>
            <p style={{ color: "#7fa8c9", fontSize: 13, margin: 0 }}>Restricted access — Dr. Vivek Shirol only</p>
          </div>
          <label style={s.label}>Email Address</label>
          <input style={s.input} placeholder="your@email.com" type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} />
          <label style={s.label}>Password</label>
          <input style={s.input} placeholder="Password" type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} />
          {authError && (
            <div style={{ background: "#ef444420", border: "1px solid #ef444440", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#ef4444" }}>
              {authError}
            </div>
          )}
          <button style={s.btn} onClick={handleLogin} disabled={authLoading}>
            {authLoading ? "Signing in..." : "🔐 Sign In to MasterDoc"}
          </button>
          <div style={{ ...s.card, marginTop: 24, textAlign: "center" }}>
            <p style={{ color: "#7fa8c9", fontSize: 12, margin: 0 }}>🔒 This portal is exclusively for Dr. Vivek Shirol.</p>
          </div>
        </div>
      </div>
    );
  }

  // ── APPOINTMENT DETAIL ──
  if (selectedAppt) {
    return (
      <div style={s.app}>
        <div style={s.navbar}>
          <div>
            <div style={s.logo}>⚕️ MasterDoc</div>
            <div style={{ color: "#7fa8c9", fontSize: 10 }}>Appointment Detail</div>
          </div>
          <button style={{ background: "none", border: "none", color: "#c9a84c", cursor: "pointer", fontSize: 13 }} onClick={() => setSelectedAppt(null)}>← Back</button>
        </div>
        <div style={s.page}>
          <div style={{ ...s.card, borderLeft: "3px solid #c9a84c", marginBottom: 16 }}>
            <p style={{ color: "#c9a84c", fontWeight: "bold", fontSize: 16, margin: "0 0 10px" }}>👤 {selectedAppt.patient_name}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <p style={{ color: "#7fa8c9", fontSize: 13, margin: 0 }}>📞 {selectedAppt.phone}</p>
              <p style={{ color: "#7fa8c9", fontSize: 13, margin: 0 }}>📅 Requested Date: <span style={{ color: "#e8f4f8", fontWeight: "bold" }}>{selectedAppt.date}</span></p>
              <p style={{ color: "#7fa8c9", fontSize: 13, margin: 0 }}>🏥 Visit Type: <span style={{ color: "#c9a84c" }}>{selectedAppt.visit_type}</span></p>
              <p style={{ color: "#7fa8c9", fontSize: 12, margin: 0 }}>🕐 Booked: {new Date(selectedAppt.created_at).toLocaleDateString()} at {new Date(selectedAppt.created_at).toLocaleTimeString()}</p>
            </div>
          </div>

          <div style={{ ...s.card, borderLeft: "3px solid #f59e0b", marginBottom: 16 }}>
            <p style={{ color: "#f59e0b", fontSize: 11, fontWeight: "bold", margin: "0 0 8px", letterSpacing: 1 }}>📝 COMPLAINTS / REASON FOR VISIT</p>
            {selectedAppt.complaints || selectedAppt.reason || selectedAppt.notes ? (
              <p style={{ color: "#e8f4f8", fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                {selectedAppt.complaints || selectedAppt.reason || selectedAppt.notes}
              </p>
            ) : (
              <p style={{ color: "#7fa8c9", fontSize: 13, margin: 0 }}>No complaint text recorded for this appointment.</p>
            )}
          </div>

          <p style={{ color: "#00c9a7", fontSize: 11, fontWeight: "bold", marginBottom: 10, letterSpacing: 1 }}>🩺 SYMPTOM LOGS</p>
          {apptDetailLoading && <p style={{ color: "#7fa8c9", textAlign: "center" }}>Loading...</p>}
          {!apptDetailLoading && apptSymptoms.length === 0 && (
            <div style={{ ...s.card, textAlign: "center" }}>
              <p style={{ color: "#7fa8c9", fontSize: 13, margin: 0 }}>No symptom logs found for this patient.</p>
            </div>
          )}
          {apptSymptoms.map((log, i) => (
            <div key={i} style={{ ...s.card, borderLeft: "3px solid #00c9a7" }}>
              <p style={{ color: "#00c9a7", fontSize: 11, fontWeight: "bold", margin: "0 0 8px" }}>
                {new Date(log.logged_at).toLocaleDateString()} at {new Date(log.logged_at).toLocaleTimeString()}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {(log.symptoms || []).map((sym, j) => (
                  <span key={j} style={{ background: "#00c9a720", color: "#00c9a7", fontSize: 11, padding: "3px 10px", borderRadius: 20, border: "1px solid #00c9a740" }}>{sym}</span>
                ))}
              </div>
              {log.notes && <p style={{ color: "#e8f4f8", fontSize: 12, margin: "8px 0 0", fontStyle: "italic" }}>{log.notes}</p>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── PATIENT PROFILE ──
  if (selectedPatient) {
    const tabs = [
      { id: "complaints", label: "📝 Complaints", color: "#f59e0b" },
      { id: "bristol", label: "💧 Bristol", color: "#3b82f6" },
      { id: "feedback", label: "⭐ Feedback", color: "#c9a84c" },
    ];

    return (
      <div style={s.app}>
        <div style={s.navbar}>
          <div>
            <div style={s.logo}>⚕️ MasterDoc</div>
            <div style={{ color: "#7fa8c9", fontSize: 10 }}>Patient Profile</div>
          </div>
          <button style={{ background: "none", border: "none", color: "#c9a84c", cursor: "pointer", fontSize: 13 }} onClick={() => setSelectedPatient(null)}>← Back</button>
        </div>
        <div style={s.page}>
          <div style={{ ...s.card, borderLeft: "3px solid #c9a84c", marginBottom: 16 }}>
            <p style={{ color: "#c9a84c", fontWeight: "bold", fontSize: 16, margin: "0 0 6px" }}>👤 {selectedPatient.patient_name}</p>
            <p style={{ color: "#7fa8c9", fontSize: 13, margin: "0 0 6px" }}>📞 {selectedPatient.phone}</p>
            <div style={{ display: "flex", gap: 16 }}>
              <span style={{ color: "#7fa8c9", fontSize: 12 }}>Appts: <span style={{ color: "#c9a84c", fontWeight: "bold" }}>{patientAppts.length}</span></span>
              <span style={{ color: "#7fa8c9", fontSize: 12 }}>Symptoms: <span style={{ color: "#00c9a7", fontWeight: "bold" }}>{patientSymptomLogs.length}</span></span>
              <span style={{ color: "#7fa8c9", fontSize: 12 }}>Bristol: <span style={{ color: "#3b82f6", fontWeight: "bold" }}>{patientBristol.length}</span></span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setPatientTab(tab.id)}
                style={{
                  flex: 1,
                  background: patientTab === tab.id ? tab.color + "20" : "transparent",
                  border: patientTab === tab.id ? `2px solid ${tab.color}` : "1px solid #1e3a5f",
                  color: patientTab === tab.id ? tab.color : "#7fa8c9",
                  padding: "10px 4px",
                  borderRadius: 10,
                  fontSize: 11,
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontFamily: "'Georgia', serif",
                }}>
                {tab.label}
              </button>
            ))}
          </div>

          {patientLoading && <p style={{ color: "#7fa8c9", textAlign: "center" }}>Loading...</p>}

          {/* COMPLAINTS TAB */}
          {patientTab === "complaints" && !patientLoading && (
            <>
              <p style={{ color: "#f59e0b", fontSize: 11, fontWeight: "bold", marginBottom: 10, letterSpacing: 1 }}>APPOINTMENT COMPLAINTS</p>
              {patientAppts.length === 0 && patientSymptomLogs.length === 0 && (
                <div style={{ ...s.card, textAlign: "center" }}>
                  <p style={{ color: "#7fa8c9", fontSize: 13, margin: 0 }}>No complaints or appointments found.</p>
                </div>
              )}
              {patientAppts.map((appt, i) => (
                <div key={i} style={{ ...s.card, borderLeft: "3px solid #f59e0b" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={s.badge("#c9a84c")}>{appt.visit_type}</span>
                    <span style={{ color: "#7fa8c9", fontSize: 11 }}>📅 {appt.date}</span>
                  </div>
                  {(appt.complaints || appt.reason || appt.notes) ? (
                    <p style={{ color: "#e8f4f8", fontSize: 13, margin: "0 0 6px", lineHeight: 1.5 }}>
                      📝 {appt.complaints || appt.reason || appt.notes}
                    </p>
                  ) : (
                    <p style={{ color: "#7fa8c9", fontSize: 12, margin: "0 0 6px" }}>No complaint text for this visit.</p>
                  )}
                  <p style={{ color: "#7fa8c9", fontSize: 11, margin: 0 }}>Booked: {new Date(appt.created_at).toLocaleDateString()}</p>
                </div>
              ))}

              {patientSymptomLogs.length > 0 && (
                <>
                  <p style={{ color: "#00c9a7", fontSize: 11, fontWeight: "bold", margin: "16px 0 10px", letterSpacing: 1 }}>🩺 SYMPTOM LOGS</p>
                  {patientSymptomLogs.map((log, i) => (
                    <div key={i} style={{ ...s.card, borderLeft: "3px solid #00c9a7" }}>
                      <p style={{ color: "#00c9a7", fontSize: 11, fontWeight: "bold", margin: "0 0 8px" }}>
                        {new Date(log.logged_at).toLocaleDateString()} at {new Date(log.logged_at).toLocaleTimeString()}
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {(log.symptoms || []).map((sym, j) => (
                          <span key={j} style={{ background: "#00c9a720", color: "#00c9a7", fontSize: 11, padding: "3px 10px", borderRadius: 20, border: "1px solid #00c9a740" }}>{sym}</span>
                        ))}
                      </div>
                      {log.notes && <p style={{ color: "#e8f4f8", fontSize: 12, margin: "8px 0 0", fontStyle: "italic" }}>{log.notes}</p>}
                    </div>
                  ))}
                </>
              )}
            </>
          )}

          {/* BRISTOL TAB */}
          {patientTab === "bristol" && !patientLoading && (
            <>
              <p style={{ color: "#3b82f6", fontSize: 11, fontWeight: "bold", marginBottom: 10, letterSpacing: 1 }}>BRISTOL STOOL LOGS</p>
              {patientBristol.length === 0 && (
                <div style={{ ...s.card, textAlign: "center" }}>
                  <p style={{ color: "#7fa8c9", fontSize: 13, margin: 0 }}>No Bristol logs found for this patient.</p>
                </div>
              )}
              {patientBristol.map((log, i) => {
                const { label, color } = bristolTag(log.stool_type);
                return (
                  <div key={i} style={{ ...s.card, borderLeft: `3px solid ${color}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ color: "#e8f4f8", fontWeight: "bold", fontSize: 14 }}>Type {log.stool_type}</span>
                        <span style={{ ...s.badge(color), marginLeft: 8 }}>{label}</span>
                      </div>
                      <span style={{ color: "#7fa8c9", fontSize: 11 }}>
                        {new Date(log.logged_at).toLocaleDateString()} {new Date(log.logged_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* FEEDBACK TAB */}
          {patientTab === "feedback" && !patientLoading && (
            <>
              <p style={{ color: "#c9a84c", fontSize: 11, fontWeight: "bold", marginBottom: 10, letterSpacing: 1 }}>⭐ FEEDBACK & RATINGS</p>
              {patientFeedback.length === 0 && (
                <div style={{ ...s.card, textAlign: "center" }}>
                  <p style={{ color: "#7fa8c9", fontSize: 13, margin: 0 }}>No feedback submitted by this patient.</p>
                </div>
              )}
              {patientFeedback.map((fb, i) => (
                <div key={i} style={{ ...s.card, borderLeft: "3px solid #f59e0b" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <Stars rating={fb.rating} />
                    <span style={{ color: "#7fa8c9", fontSize: 11 }}>{new Date(fb.submitted_at).toLocaleDateString()}</span>
                  </div>
                  <p style={{ color: "#c9a84c", fontSize: 12, margin: "0 0 6px" }}>Rating: {fb.rating}/5</p>
                  {fb.message ? (
                    <p style={{ color: "#e8f4f8", fontSize: 13, margin: "8px 0 0", lineHeight: 1.6, fontStyle: "italic", borderTop: "1px solid #1e3a5f", paddingTop: 8 }}>"{fb.message}"</p>
                  ) : (
                    <p style={{ color: "#7fa8c9", fontSize: 12, margin: "8px 0 0", borderTop: "1px solid #1e3a5f", paddingTop: 8 }}>No written message.</p>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    );
  }

  // ── MAIN APP ──
  return (
    <div style={s.app}>
      <div style={s.navbar}>
        <div>
          <div style={s.logo}>⚕️ MasterDoc</div>
          <div style={{ color: "#7fa8c9", fontSize: 10 }}>Dr. Vivek Shirol — Admin Portal</div>
        </div>
        <button style={{ background: "none", border: "none", color: "#7fa8c9", cursor: "pointer", fontSize: 12 }} onClick={handleLogout}>Sign Out</button>
      </div>

      {/* APPOINTMENTS */}
      {screen === "appointments" && (
        <div style={s.page}>
          <h2 style={s.title}>📅 Appointments</h2>
          <p style={s.subtitle}>Tap a card to view details · Tap ✅ to mark seen</p>
          {dataLoading && <p style={{ color: "#7fa8c9", textAlign: "center" }}>Loading...</p>}

          <p style={{ color: "#ef4444", fontSize: 11, fontWeight: "bold", marginBottom: 10, letterSpacing: 1 }}>🔴 PENDING</p>
          {appointments.filter(a => !isSeen(a.id)).length === 0 && !dataLoading && (
            <div style={{ ...s.card, textAlign: "center" }}>
              <p style={{ color: "#00c9a7", fontSize: 13, margin: 0 }}>✅ All appointments seen!</p>
            </div>
          )}
          {appointments.filter(a => !isSeen(a.id)).map((appt) => (
            <div key={appt.id}
              onClick={() => openApptDetail(appt)}
              style={{ ...s.card, borderLeft: "3px solid #ef4444", cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div>
                  <p style={{ color: "#e8f4f8", fontWeight: "bold", fontSize: 14, margin: "0 0 3px" }}>👤 {appt.patient_name}</p>
                  <p style={{ color: "#7fa8c9", fontSize: 12, margin: "0 0 2px" }}>📅 {appt.date}</p>
                  <p style={{ color: "#7fa8c9", fontSize: 12, margin: "0 0 6px" }}>📞 {appt.phone}</p>
                  <span style={s.badge("#c9a84c")}>{appt.visit_type}</span>
                </div>
                <button
                  style={{ background: "#00c9a720", color: "#00c9a7", border: "1px solid #00c9a750", padding: "8px 12px", borderRadius: 10, fontSize: 12, fontWeight: "bold", cursor: "pointer", fontFamily: "'Georgia', serif", flexShrink: 0 }}
                  onClick={(e) => markSeen(e, appt.id)}>
                  ✅ Seen
                </button>
              </div>
              <p style={{ color: "#c9a84c", fontSize: 10, margin: 0 }}>Tap to view details →</p>
            </div>
          ))}

          {appointments.filter(a => isSeen(a.id)).length > 0 && (
            <>
              <p style={{ color: "#00c9a7", fontSize: 11, fontWeight: "bold", marginBottom: 10, marginTop: 16, letterSpacing: 1 }}>✅ SEEN</p>
              {appointments.filter(a => isSeen(a.id)).map((appt) => (
                <div key={appt.id}
                  onClick={() => openApptDetail(appt)}
                  style={{ ...s.card, borderLeft: "3px solid #00c9a7", opacity: 0.7, cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ color: "#e8f4f8", fontWeight: "bold", fontSize: 14, margin: "0 0 3px" }}>👤 {appt.patient_name}</p>
                      <p style={{ color: "#7fa8c9", fontSize: 12, margin: "0 0 2px" }}>📅 {appt.date} · {appt.visit_type}</p>
                      <p style={{ color: "#7fa8c9", fontSize: 12, margin: 0 }}>📞 {appt.phone}</p>
                    </div>
                    <button
                      style={{ background: "transparent", color: "#7fa8c9", border: "1px solid #1e3a5f", padding: "6px 10px", borderRadius: 10, fontSize: 11, cursor: "pointer", fontFamily: "'Georgia', serif" }}
                      onClick={(e) => markUnseen(e, appt.id)}>
                      Undo
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
          <button style={{ ...s.btn, marginTop: 20 }} onClick={fetchAppointments}>🔄 Refresh</button>
        </div>
      )}

      {/* PATIENTS */}
      {screen === "patients" && (
        <div style={s.page}>
          <h2 style={s.title}>👥 Patient Profiles</h2>
          <p style={s.subtitle}>Tap a patient to view complaints, Bristol logs & feedback</p>
          {dataLoading && <p style={{ color: "#7fa8c9", textAlign: "center" }}>Loading...</p>}
          {patients.length === 0 && !dataLoading && (
            <div style={{ ...s.card, textAlign: "center" }}>
              <p style={{ color: "#7fa8c9", fontSize: 13, margin: "0 0 8px" }}>No patients found.</p>
              <p style={{ color: "#7fa8c9", fontSize: 11, margin: 0 }}>Patients appear here once they book an appointment or register in GastroDoc.</p>
            </div>
          )}
          {patients.map((p, i) => (
            <div key={i}
              style={{ ...s.card, borderLeft: "3px solid #c9a84c", cursor: "pointer" }}
              onClick={() => openPatient(p)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ color: "#e8f4f8", fontWeight: "bold", fontSize: 15, margin: "0 0 4px" }}>👤 {p.patient_name}</p>
                  <p style={{ color: "#7fa8c9", fontSize: 12, margin: 0 }}>📞 {p.phone}</p>
                </div>
                <span style={{ color: "#c9a84c", fontSize: 22 }}>›</span>
              </div>
            </div>
          ))}
          <button style={{ ...s.btn, marginTop: 8 }} onClick={fetchPatients}>🔄 Refresh</button>
        </div>
      )}

      {/* FEEDBACK */}
      {screen === "feedback" && (
        <div style={s.page}>
          <h2 style={s.title}>⭐ Patient Feedback</h2>
          <p style={s.subtitle}>All ratings and messages from your patients</p>
          {feedbackLoading && <p style={{ color: "#7fa8c9", textAlign: "center" }}>Loading feedback...</p>}
          {allFeedback.length === 0 && !feedbackLoading && (
            <div style={{ ...s.card, textAlign: "center" }}>
              <p style={{ color: "#7fa8c9", fontSize: 13, margin: 0 }}>No feedback submitted yet.</p>
            </div>
          )}
          {allFeedback.map((fb, i) => (
            <div key={i} style={{ ...s.card, borderLeft: "3px solid #f59e0b" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <p style={{ color: "#c9a84c", fontWeight: "bold", fontSize: 14, margin: "0 0 5px" }}>👤 {fb.patientName}</p>
                  <Stars rating={fb.rating} />
                  <p style={{ color: "#7fa8c9", fontSize: 11, margin: "4px 0 0" }}>Rating: {fb.rating}/5</p>
                </div>
                <span style={{ color: "#7fa8c9", fontSize: 11 }}>{new Date(fb.submitted_at).toLocaleDateString()}</span>
              </div>
              {fb.message ? (
                <p style={{ color: "#e8f4f8", fontSize: 13, margin: "8px 0 0", lineHeight: 1.6, fontStyle: "italic", borderTop: "1px solid #1e3a5f", paddingTop: 8 }}>"{fb.message}"</p>
              ) : (
                <p style={{ color: "#7fa8c9", fontSize: 12, margin: "8px 0 0", borderTop: "1px solid #1e3a5f", paddingTop: 8 }}>No written message.</p>
              )}
            </div>
          ))}
          <button style={{ ...s.btn, marginTop: 8 }} onClick={fetchAllFeedback}>🔄 Refresh</button>
        </div>
      )}

      {/* STATS */}
      {screen === "stats" && (
        <div style={s.page}>
          <h2 style={s.title}>📊 Quick Stats</h2>
          <p style={s.subtitle}>Overview of your practice</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[
              { label: "Total Appointments", value: appointments.length, color: "#c9a84c", icon: "📅" },
              { label: "Seen", value: seenIds.length, color: "#00c9a7", icon: "✅" },
              { label: "Pending", value: appointments.filter(a => !isSeen(a.id)).length, color: "#ef4444", icon: "🔴" },
              { label: "Unique Patients", value: patients.length, color: "#3b82f6", icon: "👥" },
            ].map((stat, i) => (
              <div key={i} style={{ ...s.card, textAlign: "center", borderTop: `3px solid ${stat.color}` }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{stat.icon}</div>
                <div style={{ color: stat.color, fontSize: 28, fontWeight: "bold" }}>{stat.value}</div>
                <div style={{ color: "#7fa8c9", fontSize: 11, marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>
          <div style={{ ...s.card, borderLeft: "3px solid #c9a84c" }}>
            <p style={{ color: "#c9a84c", fontSize: 11, fontWeight: "bold", marginBottom: 8 }}>VISIT TYPES BREAKDOWN</p>
            {["First Consultation", "Follow-up", "Post-Procedure", "Emergency"].map(type => {
              const count = appointments.filter(a => a.visit_type === type).length;
              const pct = appointments.length ? Math.round((count / appointments.length) * 100) : 0;
              return (
                <div key={type} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: "#e8f4f8", fontSize: 12 }}>{type}</span>
                    <span style={{ color: "#c9a84c", fontSize: 12, fontWeight: "bold" }}>{count}</span>
                  </div>
                  <div style={{ background: "#1e3a5f", borderRadius: 4, height: 6 }}>
                    <div style={{ background: "#c9a84c", width: pct + "%", height: "100%", borderRadius: 4 }} />
                  </div>
                </div>
              );
            })}
          </div>
          <button style={{ ...s.btn, marginTop: 8 }} onClick={() => { fetchAppointments(); fetchPatients(); }}>🔄 Refresh Data</button>
        </div>
      )}

      <div style={s.bottomNav}>
        {navScreens.map(n => (
          <button key={n.id} style={s.bottomBtn(screen === n.id)} onClick={() => setScreen(n.id)}>
            <span style={{ fontSize: 18 }}>{n.icon}</span>{n.label}
          </button>
        ))}
      </div>
    </div>
  );
}