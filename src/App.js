import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://nmatlgpcvhvgeqiazutu.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tYXRsZ3Bjdmh2Z2VxaWF6dXR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNzg2NjUsImV4cCI6MjA5Mjk1NDY2NX0._nEy0wPP_mRcjPUO9v6oBBhdcCRYERwC8sDULwTUjcI"
);

// ── Only this email can log in ──
const ADMIN_EMAIL = "vivekvshirol@gmail.com"; // ← CHANGE THIS to Dr. Vivek's actual email

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
  btnOutline: {
    width: "100%",
    background: "transparent",
    color: "#c9a84c",
    border: "1px solid #c9a84c60",
    padding: 12,
    borderRadius: 12,
    fontSize: 14,
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: 8,
    fontFamily: "'Georgia', serif",
  },
  btnSmall: (color) => ({
    background: color + "20",
    color: color,
    border: `1px solid ${color}50`,
    padding: "8px 14px",
    borderRadius: 10,
    fontSize: 12,
    fontWeight: "bold",
    cursor: "pointer",
    fontFamily: "'Georgia', serif",
  }),
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

// ── Star Rating Display ──
const Stars = ({ rating }) => (
  <span>
    {[1, 2, 3, 4, 5].map((s) => (
      <span key={s} style={{ color: s <= rating ? "#f59e0b" : "#1e3a5f", fontSize: 18 }}>★</span>
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
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientTab, setPatientTab] = useState("symptoms");
  const [patientSymptoms, setPatientSymptoms] = useState([]);
  const [patientFeedback, setPatientFeedback] = useState([]);
  const [patientBristol, setPatientBristol] = useState([]);
  const [patientLoading, setPatientLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [seenMap, setSeenMap] = useState({});

  // ── Auth ──
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

  // ── Load seen map from localStorage ──
  useEffect(() => {
    const saved = localStorage.getItem("masterdoc_seen");
    if (saved) setSeenMap(JSON.parse(saved));
  }, []);

  const markSeen = (id) => {
    const updated = { ...seenMap, [id]: true };
    setSeenMap(updated);
    localStorage.setItem("masterdoc_seen", JSON.stringify(updated));
  };

  const markUnseen = (id) => {
    const updated = { ...seenMap };
    delete updated[id];
    setSeenMap(updated);
    localStorage.setItem("masterdoc_seen", JSON.stringify(updated));
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

  // ── Fetch appointments ──
  const fetchAppointments = useCallback(async () => {
    setDataLoading(true);
    const { data } = await supabase
      .from("appointments")
      .select("*")
      .order("date", { ascending: true });
    if (data) setAppointments(data);
    setDataLoading(false);
  }, []);

  // ── Fetch unique patients from appointments ──
  const fetchPatients = useCallback(async () => {
    setDataLoading(true);
    const { data } = await supabase
      .from("appointments")
      .select("patient_name, phone")
      .order("created_at", { ascending: false });
    if (data) {
      // Deduplicate by phone number
      const seen = new Set();
      const unique = data.filter((p) => {
        if (seen.has(p.phone)) return false;
        seen.add(p.phone);
        return true;
      });
      setPatients(unique);
    }
    setDataLoading(false);
  }, []);

  useEffect(() => {
    if (user && screen === "appointments") fetchAppointments();
    if (user && screen === "patients") fetchPatients();
  }, [user, screen, fetchAppointments, fetchPatients]);

  // ── Load patient detail data ──
  const loadPatientData = async (phone) => {
    setPatientLoading(true);

    // Get all appointments for this phone → get symptom_logs via user_id if available
    const { data: appts } = await supabase
      .from("appointments")
      .select("*")
      .eq("phone", phone)
      .order("created_at", { ascending: false });

    // Get symptom logs — join via appointments (no direct user_id on appointments)
    // We'll show symptoms from the appointments table itself as well as symptom_logs
    setPatientSymptoms(appts || []);

    // For feedback and bristol — we need user_id
    // Get from symptom_logs first to find user_id
    const { data: symLogs } = await supabase
      .from("symptom_logs")
      .select("user_id")
      .limit(1);

    // Try to get feedback by matching name from appointments
    const { data: allFeedback } = await supabase
      .from("feedback")
      .select("*")
      .order("submitted_at", { ascending: false });

    setPatientFeedback(allFeedback || []);

    // Bristol logs — get all, we'll show general recent ones
    const { data: bristolData } = await supabase
      .from("bristol_logs")
      .select("*")
      .order("logged_at", { ascending: false })
      .limit(50);

    setPatientBristol(bristolData || []);
    setPatientLoading(false);
  };

  // ── Better patient data: load by matching user from profiles ──
  const loadPatientDataByPhone = async (patient) => {
    setPatientLoading(true);
    setSelectedPatient(patient);
    setPatientTab("symptoms");

    // Get all appointments for this patient
    const { data: appts } = await supabase
      .from("appointments")
      .select("*")
      .eq("phone", patient.phone)
      .order("created_at", { ascending: false });
    setPatientSymptoms(appts || []);

    // Get symptom_logs — try to find by matching name in patient_profiles
    // Since appointments don't store user_id, we match via phone in symptom_logs indirectly
    // Best approach: get all feedback and bristol, show all (doctor sees all patients' data)
    const { data: feedbackData } = await supabase
      .from("feedback")
      .select("*")
      .order("submitted_at", { ascending: false });
    setPatientFeedback(feedbackData || []);

    const { data: bristolData } = await supabase
      .from("bristol_logs")
      .select("*")
      .order("logged_at", { ascending: false });
    setPatientBristol(bristolData || []);

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
    { id: "stats", icon: "📊", label: "Stats" },
  ];

  // ── LOGIN SCREEN ──
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
            <p style={{ color: "#7fa8c9", fontSize: 12, margin: 0 }}>🔒 This portal is exclusively for Dr. Vivek Shirol. Unauthorised access is not permitted.</p>
          </div>
        </div>
      </div>
    );
  }

  // ── PATIENT PROFILE SCREEN ──
  if (selectedPatient) {
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
          {/* Patient Header */}
          <div style={{ ...s.card, borderLeft: "3px solid #c9a84c", marginBottom: 16 }}>
            <p style={{ color: "#c9a84c", fontWeight: "bold", fontSize: 16, margin: "0 0 4px" }}>👤 {selectedPatient.patient_name}</p>
            <p style={{ color: "#7fa8c9", fontSize: 13, margin: 0 }}>📞 {selectedPatient.phone}</p>
          </div>

          {/* Tab Buttons */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {[
              { id: "symptoms", label: "🩺 Symptoms", color: "#00c9a7" },
              { id: "feedback", label: "⭐ Feedback", color: "#f59e0b" },
              { id: "bristol", label: "💧 Bristol", color: "#3b82f6" },
            ].map(tab => (
              <button key={tab.id} onClick={() => setPatientTab(tab.id)}
                style={{
                  flex: 1,
                  background: patientTab === tab.id ? tab.color + "20" : "transparent",
                  border: patientTab === tab.id ? `2px solid ${tab.color}` : "1px solid #1e3a5f",
                  color: patientTab === tab.id ? tab.color : "#7fa8c9",
                  padding: "8px 4px",
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

          {/* SYMPTOMS TAB */}
          {patientTab === "symptoms" && !patientLoading && (
            <>
              <p style={{ color: "#7fa8c9", fontSize: 11, fontWeight: "bold", marginBottom: 10 }}>APPOINTMENT HISTORY & SYMPTOMS</p>
              {patientSymptoms.length === 0 && <p style={{ color: "#7fa8c9" }}>No appointments found.</p>}
              {patientSymptoms.map((appt, i) => (
                <div key={i} style={{ ...s.card, borderLeft: "3px solid #00c9a7" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={s.badge("#00c9a7")}>{appt.visit_type}</span>
                    <span style={{ color: "#7fa8c9", fontSize: 11 }}>📅 {appt.date}</span>
                  </div>
                  <p style={{ color: "#e8f4f8", fontSize: 13, margin: "0 0 4px" }}>👤 {appt.patient_name}</p>
                  <p style={{ color: "#7fa8c9", fontSize: 11, margin: 0 }}>
                    Booked: {new Date(appt.created_at).toLocaleDateString()} at {new Date(appt.created_at).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </>
          )}

          {/* FEEDBACK TAB */}
          {patientTab === "feedback" && !patientLoading && (
            <>
              <p style={{ color: "#7fa8c9", fontSize: 11, fontWeight: "bold", marginBottom: 10 }}>FEEDBACK & RATINGS</p>
              {patientFeedback.length === 0 && <p style={{ color: "#7fa8c9" }}>No feedback submitted yet.</p>}
              {patientFeedback.map((fb, i) => (
                <div key={i} style={{ ...s.card, borderLeft: "3px solid #f59e0b" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <Stars rating={fb.rating} />
                    <span style={{ color: "#7fa8c9", fontSize: 11 }}>{new Date(fb.submitted_at).toLocaleDateString()}</span>
                  </div>
                  {fb.message ? (
                    <p style={{ color: "#e8f4f8", fontSize: 13, margin: 0, lineHeight: 1.5, fontStyle: "italic" }}>"{fb.message}"</p>
                  ) : (
                    <p style={{ color: "#7fa8c9", fontSize: 12, margin: 0 }}>No message provided.</p>
                  )}
                </div>
              ))}
            </>
          )}

          {/* BRISTOL TAB */}
          {patientTab === "bristol" && !patientLoading && (
            <>
              <p style={{ color: "#7fa8c9", fontSize: 11, fontWeight: "bold", marginBottom: 10 }}>BRISTOL STOOL LOGS</p>
              {patientBristol.length === 0 && <p style={{ color: "#7fa8c9" }}>No bristol logs found.</p>}
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

      {/* ── APPOINTMENTS SCREEN ── */}
      {screen === "appointments" && (
        <div style={s.page}>
          <h2 style={s.title}>📅 Appointments</h2>
          <p style={s.subtitle}>Tap ✅ to mark as seen · Sorted by date</p>

          {dataLoading && <p style={{ color: "#7fa8c9", textAlign: "center" }}>Loading appointments...</p>}

          {/* Pending */}
          <p style={{ color: "#ef4444", fontSize: 11, fontWeight: "bold", marginBottom: 10, letterSpacing: 1 }}>🔴 PENDING</p>
          {appointments.filter(a => !seenMap[a.id]).length === 0 && (
            <div style={{ ...s.card, textAlign: "center" }}>
              <p style={{ color: "#00c9a7", fontSize: 13, margin: 0 }}>✅ All appointments seen!</p>
            </div>
          )}
          {appointments.filter(a => !seenMap[a.id]).map((appt) => (
            <div key={appt.id} style={{ ...s.card, borderLeft: "3px solid #ef4444" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <p style={{ color: "#e8f4f8", fontWeight: "bold", fontSize: 14, margin: "0 0 3px" }}>👤 {appt.patient_name}</p>
                  <p style={{ color: "#7fa8c9", fontSize: 12, margin: "0 0 2px" }}>📅 {appt.date}</p>
                  <p style={{ color: "#7fa8c9", fontSize: 12, margin: "0 0 2px" }}>📞 {appt.phone}</p>
                  <span style={s.badge("#c9a84c")}>{appt.visit_type}</span>
                </div>
                <button style={{ background: "#00c9a720", color: "#00c9a7", border: "1px solid #00c9a750", padding: "8px 12px", borderRadius: 10, fontSize: 12, fontWeight: "bold", cursor: "pointer", fontFamily: "'Georgia', serif", flexShrink: 0 }}
                  onClick={() => markSeen(appt.id)}>
                  ✅ Mark Seen
                </button>
              </div>
              <p style={{ color: "#7fa8c9", fontSize: 10, margin: 0 }}>
                Booked: {new Date(appt.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}

          {/* Seen */}
          {appointments.filter(a => seenMap[a.id]).length > 0 && (
            <>
              <p style={{ color: "#00c9a7", fontSize: 11, fontWeight: "bold", marginBottom: 10, marginTop: 16, letterSpacing: 1 }}>✅ SEEN</p>
              {appointments.filter(a => seenMap[a.id]).map((appt) => (
                <div key={appt.id} style={{ ...s.card, borderLeft: "3px solid #00c9a7", opacity: 0.7 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ color: "#e8f4f8", fontWeight: "bold", fontSize: 14, margin: "0 0 3px" }}>👤 {appt.patient_name}</p>
                      <p style={{ color: "#7fa8c9", fontSize: 12, margin: "0 0 2px" }}>📅 {appt.date} · {appt.visit_type}</p>
                      <p style={{ color: "#7fa8c9", fontSize: 12, margin: 0 }}>📞 {appt.phone}</p>
                    </div>
                    <button style={{ background: "transparent", color: "#7fa8c9", border: "1px solid #1e3a5f", padding: "6px 10px", borderRadius: 10, fontSize: 11, cursor: "pointer", fontFamily: "'Georgia', serif" }}
                      onClick={() => markUnseen(appt.id)}>
                      Undo
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ── PATIENTS SCREEN ── */}
      {screen === "patients" && (
        <div style={s.page}>
          <h2 style={s.title}>👥 Patient Profiles</h2>
          <p style={s.subtitle}>Tap a patient to view their full profile</p>

          {dataLoading && <p style={{ color: "#7fa8c9", textAlign: "center" }}>Loading patients...</p>}

          {patients.length === 0 && !dataLoading && (
            <div style={{ ...s.card, textAlign: "center" }}>
              <p style={{ color: "#7fa8c9", fontSize: 13, margin: 0 }}>No patients found yet.</p>
            </div>
          )}

          {patients.map((p, i) => (
            <div key={i} style={{ ...s.card, borderLeft: "3px solid #c9a84c", cursor: "pointer" }}
              onClick={() => loadPatientDataByPhone(p)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ color: "#e8f4f8", fontWeight: "bold", fontSize: 15, margin: "0 0 4px" }}>👤 {p.patient_name}</p>
                  <p style={{ color: "#7fa8c9", fontSize: 12, margin: 0 }}>📞 {p.phone}</p>
                </div>
                <span style={{ color: "#c9a84c", fontSize: 18 }}>›</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── STATS SCREEN ── */}
      {screen === "stats" && (
        <div style={s.page}>
          <h2 style={s.title}>📊 Quick Stats</h2>
          <p style={s.subtitle}>Overview of your practice</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[
              { label: "Total Appointments", value: appointments.length, color: "#c9a84c", icon: "📅" },
              { label: "Seen", value: Object.keys(seenMap).length, color: "#00c9a7", icon: "✅" },
              { label: "Pending", value: appointments.filter(a => !seenMap[a.id]).length, color: "#ef4444", icon: "🔴" },
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
                    <div style={{ background: "#c9a84c", width: pct + "%", height: "100%", borderRadius: 4, transition: "width 0.5s" }} />
                  </div>
                </div>
              );
            })}
          </div>
          <button style={s.btn} onClick={() => { fetchAppointments(); fetchPatients(); }}>🔄 Refresh Data</button>
        </div>
      )}

      {/* Bottom Nav */}
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