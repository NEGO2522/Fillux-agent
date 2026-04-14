import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../firebase/firebase";

/* ══════════════════════════════════════════════════════ THEME */
const T = {
  bg:     "#080808",
  panel:  "#0d0d0d",
  border: "rgba(255,255,255,0.07)",
  font:   "Inter, ui-sans-serif, system-ui, sans-serif",
  accent: "#34d399",
  err:    "#f87171",
  muted:  "rgba(255,255,255,0.25)",
};

/* ══════════════════════════════════════════════════════ CLOUDINARY */
const CLOUDINARY_CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/* ══════════════════════════════════════════════════════ SECTIONS */
export const SECTIONS = [
  {
    id: "personal",
    label: "Personal",
    icon: "👤",
    desc: "Basic identity and contact details",
    fields: [
      { key: "firstName",   label: "First Name",      placeholder: "Arjun",              required: true },
      { key: "lastName",    label: "Last Name",        placeholder: "Sharma",             required: true },
      { key: "dob",         label: "Date of Birth",    placeholder: "",                   required: false, type: "date" },
      { key: "gender",      label: "Gender",           placeholder: "",                   required: false, select: ["Male", "Female", "Non-binary", "Prefer not to say"] },
      { key: "nationality", label: "Nationality",      placeholder: "Indian",             required: false },
      { key: "language",    label: "Languages Known",  placeholder: "Hindi, English",     required: false },
      { key: "category",    label: "Category",         placeholder: "",                   required: false, select: ["General", "OBC", "SC", "ST", "EWS", "Other"] },
    ],
  },
  {
    id: "address",
    label: "Address",
    icon: "📍",
    desc: "Current and permanent address",
    fields: [
      { key: "addressLine1",  label: "Address Line 1",  placeholder: "123, MG Road",       required: false, span: 2 },
      { key: "addressLine2",  label: "Address Line 2",  placeholder: "Near City Mall",     required: false, span: 2 },
      { key: "city",          label: "City",            placeholder: "Jaipur",             required: false },
      { key: "state",         label: "State",           placeholder: "Rajasthan",          required: false },
      { key: "pincode",       label: "PIN / ZIP Code",  placeholder: "302001",             required: false },
      { key: "country",       label: "Country",         placeholder: "India",              required: false },
      { key: "permanentAddr", label: "Permanent Address (if different)", placeholder: "Village / Town, District, State", required: false, span: 2, textarea: true, rows: 2 },
    ],
  },
  {
    id: "academic",
    label: "Academic",
    icon: "🎓",
    desc: "Education and college details",
    fields: [
      { key: "collegeName",            label: "College / University",    placeholder: "JECRC University",        required: true,  span: 2 },
      { key: "degreeName",             label: "Degree / Program",        placeholder: "B.Tech Computer Science", required: true },
      { key: "branch",                 label: "Branch / Specialization", placeholder: "Artificial Intelligence", required: false },
      { key: "year",                   label: "Current Year",            placeholder: "",                        required: true,  select: ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "Postgraduate"] },
      { key: "semester",               label: "Current Semester",        placeholder: "6th",                     required: false },
      { key: "expectedGraduationYear", label: "Graduation Year",         placeholder: "2026",                    required: true },
      { key: "rollNumber",             label: "Roll / Enrollment No.",   placeholder: "21EJCCS001",              required: false },
      { key: "cgpa",                   label: "CGPA / Percentage",       placeholder: "8.5 / 85%",               required: false },
      { key: "tenthPercent",           label: "10th Percentage",         placeholder: "92%",                     required: false },
      { key: "twelfthPercent",         label: "12th Percentage",         placeholder: "88%",                     required: false },
      { key: "collegeEmail",           label: "College Email",           placeholder: "21ejccs001@jecrc.ac.in",  required: false, type: "email" },
      { key: "collegeCity",            label: "College City",            placeholder: "Jaipur, Rajasthan",       required: false },
    ],
  },
  {
    id: "professional",
    label: "Professional",
    icon: "💼",
    desc: "Skills, experience, and work details",
    fields: [
      { key: "skills",         label: "Technical Skills",       placeholder: "React, Node.js, Python, SQL",          required: false, span: 2 },
      { key: "softSkills",     label: "Soft Skills",            placeholder: "Leadership, Communication, Teamwork",   required: false, span: 2 },
      { key: "currentRole",    label: "Current Role / Title",   placeholder: "Full Stack Developer Intern",           required: false },
      { key: "currentCompany", label: "Current Company",        placeholder: "XYZ Technologies",                     required: false },
      { key: "totalExpYears",  label: "Total Experience",       placeholder: "1.5 years",                            required: false },
      { key: "experience",     label: "Work Experience",        placeholder: "6 months intern at XYZ Corp...",       required: false, span: 2, textarea: true, rows: 2 },
      { key: "achievements",   label: "Achievements / Awards",  placeholder: "Hackathon winner, Dean's list...",      required: false, span: 2, textarea: true, rows: 2 },
      { key: "projects",       label: "Notable Projects",       placeholder: "Fillux — form autofill Chrome ext...", required: false, span: 2, textarea: true, rows: 2 },
      { key: "bio",            label: "Short Bio / About",      placeholder: "2–3 lines about yourself...",          required: false, span: 2, textarea: true, rows: 3 },
    ],
  },
  {
    id: "social",
    label: "Social",
    icon: "🔗",
    desc: "Online profiles and portfolio",
    fields: [
      { key: "linkedin",  label: "LinkedIn URL",           placeholder: "linkedin.com/in/arjun-sharma", required: false, span: 2 },
      { key: "github",    label: "GitHub URL",             placeholder: "github.com/arjunsharma",       required: false, span: 2 },
      { key: "portfolio", label: "Portfolio / Website",    placeholder: "arjunsharma.dev",              required: false, span: 2 },
      { key: "leetcode",  label: "LeetCode / Codeforces",  placeholder: "leetcode.com/u/arjun",         required: false },
      { key: "devpost",   label: "Devpost / Devfolio",     placeholder: "devpost.com/arjun",            required: false },
      { key: "twitter",   label: "X / Twitter",            placeholder: "x.com/arjunsharma",            required: false },
      { key: "instagram", label: "Instagram",              placeholder: "instagram.com/arjun",          required: false },
      { key: "otherLink", label: "Any Other Link",         placeholder: "drive.google.com/resume...",   required: false, span: 2 },
    ],
  },
  {
    id: "identity",
    label: "Identity",
    icon: "🪪",
    desc: "Government IDs and official details",
    fields: [
      { key: "aadharNumber",   label: "Aadhar Number",        placeholder: "XXXX XXXX XXXX",   required: false },
      { key: "panNumber",      label: "PAN Number",           placeholder: "ABCDE1234F",       required: false },
      { key: "passportNumber", label: "Passport Number",      placeholder: "A1234567",         required: false },
      { key: "voterId",        label: "Voter ID",             placeholder: "ABC1234567",       required: false },
      { key: "drivingLicense", label: "Driving License No.",  placeholder: "RJ14 20110012345", required: false },
      { key: "bankAccount",    label: "Bank Account No.",     placeholder: "XXXXXXXXXXXX",     required: false },
      { key: "ifscCode",       label: "IFSC Code",            placeholder: "SBIN0001234",      required: false },
      { key: "upiId",          label: "UPI ID",               placeholder: "arjun@upi",        required: false },
    ],
  },
  {
    id: "emergency",
    label: "Emergency",
    icon: "🆘",
    desc: "Emergency contact and family details",
    fields: [
      { key: "emergencyName",     label: "Contact Name",         placeholder: "Suresh Sharma",    required: false },
      { key: "emergencyRelation", label: "Relation",             placeholder: "Father",           required: false },
      { key: "emergencyPhone",    label: "Emergency Phone",      placeholder: "+91 98765 43210",  required: false },
      { key: "emergencyEmail",    label: "Emergency Email",      placeholder: "suresh@gmail.com", required: false, type: "email" },
      { key: "emergencyAddress",  label: "Emergency Address",    placeholder: "Jaipur, Rajasthan",required: false, span: 2 },
      { key: "parentFatherName",  label: "Father's Name",        placeholder: "Suresh Sharma",    required: false },
      { key: "parentMotherName",  label: "Mother's Name",        placeholder: "Priya Sharma",     required: false },
      { key: "parentOccupation",  label: "Parent Occupation",    placeholder: "Business",         required: false },
      { key: "annualIncome",      label: "Family Annual Income", placeholder: "5–10 LPA",         required: false },
    ],
  },
];

export const EMPTY_PROFILE = SECTIONS.flatMap(s => s.fields).reduce((acc, f) => {
  acc[f.key] = "";
  return acc;
}, {});

/* ══════════════════════════════════════════════════════ HELPERS */
function getScore(profile, emails, phones) {
  const allFields = SECTIONS.flatMap(s => s.fields);
  const filled = allFields.filter(f => profile[f.key]?.trim()).length;
  const emailBonus = emails.filter(e => e.trim()).length;
  const phoneBonus = phones.filter(p => p.trim()).length;
  const total = allFields.length + 2;
  return Math.round(((filled + Math.min(emailBonus, 1) + Math.min(phoneBonus, 1)) / total) * 100);
}

/* ══════════════════════════════════════════════════════ PRIMITIVES */
function Label({ children, required }) {
  return (
    <label style={{
      display: "block", marginBottom: "0.35rem",
      fontSize: "0.625rem", fontWeight: 700,
      textTransform: "uppercase", letterSpacing: "0.12em",
      color: "rgba(255,255,255,0.28)",
    }}>
      {children}
      {required && <span style={{ color: T.err, marginLeft: 3 }}>*</span>}
    </label>
  );
}

const inputBase = (foc) => ({
  width: "100%", boxSizing: "border-box",
  borderRadius: "0.5rem",
  border: foc ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.07)",
  backgroundColor: foc ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
  padding: "0.6875rem 0.75rem",
  fontSize: "0.875rem",
  color: "white",
  outline: "none",
  transition: "border-color 0.15s, background-color 0.15s",
  fontFamily: T.font,
  WebkitAppearance: "none",
  appearance: "none",
});

function FInput({ value, onChange, type = "text", placeholder }) {
  const [foc, setFoc] = useState(false);
  return (
    <input
      type={type} placeholder={placeholder} value={value} onChange={onChange}
      onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
      style={inputBase(foc)}
    />
  );
}

function FSelect({ value, onChange, options }) {
  const [foc, setFoc] = useState(false);
  return (
    <select value={value} onChange={onChange}
      onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
      style={{ ...inputBase(foc), cursor: "pointer", color: value ? "white" : "rgba(255,255,255,0.28)" }}
    >
      <option value="" disabled style={{ backgroundColor: "#1a1a1a" }}>Select…</option>
      {options.map(o => <option key={o} value={o} style={{ backgroundColor: "#1a1a1a" }}>{o}</option>)}
    </select>
  );
}

function FTextarea({ value, onChange, placeholder, rows = 2 }) {
  const [foc, setFoc] = useState(false);
  return (
    <textarea placeholder={placeholder} value={value} onChange={onChange} rows={rows}
      onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
      style={{ ...inputBase(foc), resize: "vertical", lineHeight: 1.6 }}
    />
  );
}

/* ── Multi-value list field (emails / phones) ── */
function MultiField({ label, values, onChange, type = "text", placeholder, addLabel }) {
  const [focIdx, setFocIdx] = useState(null);

  const update = (i, val) => {
    const next = [...values];
    next[i] = val;
    onChange(next);
  };
  const add = () => onChange([...values, ""]);
  const remove = (i) => {
    if (values.length === 1) { onChange([""]); return; }
    onChange(values.filter((_, idx) => idx !== i));
  };

  return (
    <div>
      <Label>{label}</Label>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {values.map((val, i) => (
          <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input
              type={type}
              placeholder={i === 0 ? placeholder : `${label} ${i + 1}`}
              value={val}
              onChange={e => update(i, e.target.value)}
              onFocus={() => setFocIdx(i)}
              onBlur={() => setFocIdx(null)}
              style={{ ...inputBase(focIdx === i), flex: 1 }}
            />
            <button
              onClick={() => remove(i)}
              title="Remove"
              style={{
                flexShrink: 0, width: 32, height: 36, borderRadius: "0.5rem",
                border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)",
                color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: "1rem",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(248,113,113,0.4)"; e.currentTarget.style.color = T.err; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}
            >×</button>
          </div>
        ))}
        <button
          onClick={add}
          style={{
            display: "flex", alignItems: "center", gap: "0.375rem",
            padding: "0.5rem 0.75rem", borderRadius: "0.5rem",
            border: "1px dashed rgba(255,255,255,0.1)", background: "transparent",
            color: "rgba(255,255,255,0.35)", fontSize: "0.75rem", fontWeight: 600,
            cursor: "pointer", fontFamily: T.font, transition: "all 0.15s", alignSelf: "flex-start",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = `rgba(52,211,153,0.4)`; e.currentTarget.style.color = T.accent; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
        >
          + {addLabel}
        </button>
      </div>
    </div>
  );
}

/* ── File upload ── */
function FileUpload({ label, required, accept, file, url, progress, uploading, onFileChange, onViewFile }) {
  const inputRef = useRef();
  const hasFile = !!file || !!url;
  return (
    <div>
      <Label required={required}>{label}</Label>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        style={{
          border: hasFile ? "1px solid rgba(52,211,153,0.3)" : "1px dashed rgba(255,255,255,0.1)",
          borderRadius: "0.625rem", backgroundColor: hasFile ? "rgba(52,211,153,0.04)" : "rgba(255,255,255,0.02)",
          padding: "1rem", cursor: uploading ? "wait" : "pointer", transition: "all 0.2s", textAlign: "center",
          minHeight: 72, display: "flex", alignItems: "center", justifyContent: "center",
        }}
        onMouseEnter={e => { if (!uploading) e.currentTarget.style.borderColor = hasFile ? "rgba(52,211,153,0.5)" : "rgba(255,255,255,0.2)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = hasFile ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.1)"; }}
      >
        <input ref={inputRef} type="file" accept={accept} style={{ display: "none" }} onChange={e => onFileChange(e.target.files[0])} />
        {uploading ? (
          <div style={{ width: "100%" }}>
            <div style={{ height: 3, borderRadius: 9999, backgroundColor: "rgba(255,255,255,0.07)", overflow: "hidden", marginBottom: "0.4rem" }}>
              <div style={{ height: "100%", width: `${progress}%`, backgroundColor: T.accent, borderRadius: 9999, transition: "width 0.3s" }} />
            </div>
            <p style={{ margin: 0, fontSize: "0.75rem", color: T.muted }}>Uploading… {progress}%</p>
          </div>
        ) : url ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <span style={{ color: T.accent }}>✅</span>
            <button onClick={e => { e.stopPropagation(); onViewFile(); }}
              style={{ fontSize: "0.75rem", color: T.accent, textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: T.font }}>
              View file
            </button>
            <span style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.2)" }}>· tap to replace</span>
          </div>
        ) : file ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>📄</span>
            <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>{file.name}</span>
          </div>
        ) : (
          <div>
            <p style={{ margin: "0 0 0.2rem", fontSize: "0.8125rem", color: "rgba(255,255,255,0.28)" }}>
              {required ? "📎 Tap to upload (required)" : "📎 Tap to upload (optional)"}
            </p>
            <p style={{ margin: 0, fontSize: "0.6875rem", color: "rgba(255,255,255,0.15)" }}>
              {accept === "application/pdf" ? "PDF only" : "JPG, PNG, PDF"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════ CLOUDINARY */
const uploadToCloudinary = async (file, setProgress) => {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  fd.append("folder", "fillux");
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", e => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
    });
    xhr.addEventListener("load", () => {
      if (xhr.status === 200) { const r = JSON.parse(xhr.responseText); resolve({ url: r.secure_url }); }
      else reject(new Error(`Upload failed: ${xhr.status}`));
    });
    xhr.addEventListener("error", () => reject(new Error("Upload failed")));
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`);
    xhr.send(fd);
  });
};

/* ══════════════════════════════════════════════════════ MAIN */
export default function Form() {
  const navigate = useNavigate();
  const [user,    setUser]    = useState(null);
  const [profile, setProfile] = useState({ ...EMPTY_PROFILE });
  const [active,  setActive]  = useState("personal");
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [loading, setLoading] = useState(true);
  const [navOpen, setNavOpen] = useState(false);
  const [saveErr, setSaveErr] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Multi-value fields
  const [emails, setEmails] = useState([""]);
  const [phones, setPhones] = useState([""]);

  // File state
  const [resumeFile,      setResumeFile]      = useState(null);
  const [resumeURL,       setResumeURL]       = useState("");
  const [resumeProgress,  setResumeProgress]  = useState(0);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [photoFile,       setPhotoFile]       = useState(null);
  const [photoURL,        setPhotoURL]        = useState("");
  const [photoProgress,   setPhotoProgress]   = useState(0);
  const [photoUploading,  setPhotoUploading]  = useState(false);

  const contentRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate("/login"); return; }
      setUser(session.user);
      try {
        const { data } = await supabase.from("profiles").select("*").eq("uid", session.user.id).single();
        if (data) {
          setProfile(prev => ({ ...prev, ...data }));
          if (data.emails?.length)       setEmails(data.emails);
          else if (data.email)           setEmails([data.email]);
          if (data.phones?.length)       setPhones(data.phones);
          else if (data.phone)           setPhones([data.phone]);
          if (data.resumeURL)            setResumeURL(data.resumeURL);
          if (data.collegePhotoURL)      setPhotoURL(data.collegePhotoURL);
          if (data.termsAccepted !== undefined) setTermsAccepted(data.termsAccepted);
        } else if (session.user.email) {
          setEmails([session.user.email]);
        }
      } catch (_) {
        if (session.user.email) setEmails([session.user.email]);
      } finally { setLoading(false); }
    })();
  }, [navigate]);

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [active]);

  const set = useCallback(key => e => {
    setProfile(p => ({ ...p, [key]: e.target.value }));
    setSaved(false); setSaveErr("");
  }, []);

  const handleSave = async () => {
    if (!user) return;
    const validEmails = emails.filter(e => e.trim());
    const validPhones = phones.filter(p => p.trim());
    if (!validEmails.length) { setSaveErr("At least one email address is required."); return; }
    if (!validPhones.length) { setSaveErr("At least one phone number is required."); return; }
    if (!resumeURL && !resumeFile) { setSaveErr("Resume is required. Please upload your resume."); return; }

    setSaving(true); setSaveErr("");
    try {
      let finalResumeURL = resumeURL;
      let finalPhotoURL  = photoURL;
      if (resumeFile) {
        setResumeUploading(true);
        try { const r = await uploadToCloudinary(resumeFile, setResumeProgress); finalResumeURL = r.url; setResumeURL(r.url); }
        catch (e) { setSaveErr("Resume upload failed: " + e.message); setResumeUploading(false); setSaving(false); return; }
        setResumeUploading(false);
      }
      if (photoFile) {
        setPhotoUploading(true);
        try { const r = await uploadToCloudinary(photoFile, setPhotoProgress); finalPhotoURL = r.url; setPhotoURL(r.url); }
        catch (e) { setSaveErr("Photo upload failed: " + e.message); setPhotoUploading(false); setSaving(false); return; }
        setPhotoUploading(false);
      }
      const payload = {
        ...profile,
        emails: validEmails,
        phones: validPhones,
        email:  validEmails[0],
        phone:  validPhones[0],
        termsAccepted,
        resumeURL:       finalResumeURL || "",
        collegePhotoURL: finalPhotoURL  || "",
        updatedAt: new Date().toISOString(),
        uid: user.id,
      };
      const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "uid" });
      if (error) throw error;
      setSaved(true);
      setTimeout(() => { setSaved(false); navigate("/home"); }, 1800);
    } catch (e) {
      setSaveErr("Failed to save: " + e.message);
    } finally { setSaving(false); }
  };

  const score = getScore(profile, emails, phones);
  const currentSection = SECTIONS.find(s => s.id === active);
  const activeIdx = SECTIONS.findIndex(s => s.id === active);

  if (loading) return (
    <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", backgroundColor: T.bg, fontFamily: T.font }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.08)", borderTopColor: "white" }} className="spin" />
        <p style={{ color: T.muted, fontSize: "0.875rem", margin: 0 }}>Loading your profile…</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}.spin{animation:spin .9s linear infinite}`}</style>
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", backgroundColor: T.bg, fontFamily: T.font, color: "white" }}>

      {/* ════ SIDEBAR ════ */}
      <aside className="sidebar" style={{
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 40,
        width: 220, display: "flex", flexDirection: "column",
        borderRight: `1px solid ${T.border}`, backgroundColor: T.panel,
        transform: navOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.25s ease",
      }}>
        <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "1.25rem 0.875rem", overflowY: "auto" }}>

          {/* brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <div style={{ width: 28, height: 28, borderRadius: "0.5rem", backgroundColor: "white", color: "black", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.875rem", fontWeight: 900, flexShrink: 0 }}>⚡</div>
            <span style={{ fontSize: "0.9375rem", fontWeight: 700, letterSpacing: "-0.02em", fontFamily: "'Comic Sans MS', cursive" }}>Fillux</span>
          </div>

          {/* progress bar */}
          <div style={{ marginBottom: "1.25rem", padding: "0.75rem", borderRadius: "0.625rem", border: `1px solid ${T.border}`, backgroundColor: "rgba(255,255,255,0.02)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.5625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: T.muted }}>Profile complete</span>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: score >= 70 ? T.accent : score >= 40 ? "#fbbf24" : T.muted }}>{score}%</span>
            </div>
            <div style={{ height: 4, borderRadius: 9999, backgroundColor: "rgba(255,255,255,0.07)" }}>
              <div style={{ height: "100%", width: `${score}%`, borderRadius: 9999, backgroundColor: score >= 70 ? T.accent : score >= 40 ? "#fbbf24" : "rgba(255,255,255,0.25)", transition: "width 0.4s" }} />
            </div>
          </div>

          {/* nav items */}
          <nav style={{ display: "flex", flexDirection: "column", gap: "0.125rem", flex: 1 }}>
            {SECTIONS.map(sec => {
              const isAct  = active === sec.id;
              const filled = sec.fields.filter(f => profile[f.key]?.trim()).length;
              const pct    = Math.round((filled / sec.fields.length) * 100);
              return (
                <button key={sec.id}
                  onClick={() => { setActive(sec.id); setNavOpen(false); }}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.625rem",
                    padding: "0.5rem 0.625rem", borderRadius: "0.5rem",
                    border: isAct ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent",
                    backgroundColor: isAct ? "rgba(255,255,255,0.07)" : "transparent",
                    cursor: "pointer", transition: "all 0.15s", textAlign: "left", width: "100%",
                  }}
                >
                  <span style={{ fontSize: "0.875rem", flexShrink: 0 }}>{sec.icon}</span>
                  <span style={{ flex: 1, fontSize: "0.8125rem", fontWeight: isAct ? 600 : 400, color: isAct ? "white" : "rgba(255,255,255,0.4)" }}>{sec.label}</span>
                  {filled > 0 && (
                    <span style={{
                      fontSize: "0.5rem", fontWeight: 700, padding: "1px 5px", borderRadius: 9999,
                      backgroundColor: pct === 100 ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.07)",
                      color: pct === 100 ? T.accent : "rgba(255,255,255,0.3)",
                      border: `1px solid ${pct === 100 ? "rgba(52,211,153,0.2)" : "rgba(255,255,255,0.07)"}`,
                    }}>{filled}/{sec.fields.length}</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* user row */}
          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: "0.875rem", marginTop: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8125rem", flexShrink: 0 }}>👤</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ margin: 0, fontSize: "0.6875rem", fontWeight: 600, color: "rgba(255,255,255,0.6)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.user_metadata?.full_name || user?.email}</p>
                <p style={{ margin: 0, fontSize: "0.5625rem", color: "rgba(255,255,255,0.2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</p>
              </div>
              <button onClick={async () => { await supabase.auth.signOut(); navigate("/"); }}
                style={{ flexShrink: 0, background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.2)", padding: 4 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* overlay */}
      {navOpen && <div onClick={() => setNavOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 30, backgroundColor: "rgba(0,0,0,0.6)" }} />}

      {/* ════ MAIN ════ */}
      <div className="main-wrap" style={{ display: "flex", flex: 1, flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

        {/* topbar */}
        <header style={{
          display: "flex", flexShrink: 0, alignItems: "center", justifyContent: "space-between",
          borderBottom: `1px solid ${T.border}`, backgroundColor: "rgba(8,8,8,0.97)",
          padding: "0.625rem 0.875rem", backdropFilter: "blur(12px)",
          gap: "0.5rem",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", minWidth: 0 }}>
            <button className="hamburger" onClick={() => setNavOpen(true)}
              style={{ flexShrink: 0, borderRadius: "0.5rem", padding: "0.375rem 0.4rem", color: T.muted, background: "none", border: `1px solid ${T.border}`, cursor: "pointer" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontSize: "0.875rem", fontWeight: 700, color: "white", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {currentSection?.icon} {currentSection?.label}
              </h1>
              <p className="topbar-desc" style={{ margin: 0, fontSize: "0.6875rem", color: "rgba(255,255,255,0.25)" }}>{currentSection?.desc}</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", flexShrink: 0 }}>
            {/* prev / next arrows */}
            <button disabled={activeIdx === 0} onClick={() => setActive(SECTIONS[activeIdx - 1].id)}
              style={{ padding: "0.375rem 0.5rem", borderRadius: "0.5rem", border: `1px solid ${T.border}`, background: "transparent", color: activeIdx === 0 ? "rgba(255,255,255,0.1)" : T.muted, cursor: activeIdx === 0 ? "not-allowed" : "pointer", fontSize: "0.75rem" }}>←</button>
            <button disabled={activeIdx === SECTIONS.length - 1} onClick={() => setActive(SECTIONS[activeIdx + 1].id)}
              style={{ padding: "0.375rem 0.5rem", borderRadius: "0.5rem", border: `1px solid ${T.border}`, background: "transparent", color: activeIdx === SECTIONS.length - 1 ? "rgba(255,255,255,0.1)" : T.muted, cursor: activeIdx === SECTIONS.length - 1 ? "not-allowed" : "pointer", fontSize: "0.75rem" }}>→</button>

            {/* save btn */}
            <button onClick={handleSave} disabled={saving || resumeUploading || photoUploading}
              style={{
                display: "flex", alignItems: "center", gap: "0.375rem",
                borderRadius: "0.5rem", padding: "0.5rem 0.875rem",
                fontSize: "0.8125rem", fontWeight: 700,
                cursor: (saving || resumeUploading || photoUploading) ? "not-allowed" : "pointer",
                border: saved ? "1px solid rgba(52,211,153,0.3)" : "none",
                backgroundColor: saved ? "rgba(52,211,153,0.08)" : saving ? "rgba(255,255,255,0.07)" : "white",
                color: saved ? T.accent : saving ? T.muted : "black",
                opacity: (saving || resumeUploading || photoUploading) ? 0.7 : 1,
                transition: "all 0.2s", fontFamily: T.font, whiteSpace: "nowrap",
              }}>
              {saving
                ? <><span style={{ width: 11, height: 11, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.15)", borderTopColor: "rgba(255,255,255,0.5)", display: "inline-block" }} className="spin" /> Saving…</>
                : saved ? "✅ Saved!" : "Save"}
            </button>
          </div>
        </header>

        {/* error banner */}
        {saveErr && (
          <div style={{ flexShrink: 0, padding: "0.5rem 0.875rem", backgroundColor: "rgba(248,113,113,0.07)", borderBottom: "1px solid rgba(248,113,113,0.12)", fontSize: "0.8125rem", color: T.err, fontWeight: 500 }}>
            {saveErr}
          </div>
        )}

        {/* mobile section tabs strip */}
        <div className="section-tabs" style={{ display: "none", overflowX: "auto", borderBottom: `1px solid ${T.border}`, backgroundColor: T.panel, WebkitOverflowScrolling: "touch" }}>
          <div style={{ display: "flex", padding: "0 0.5rem", gap: "0.25rem", minWidth: "max-content" }}>
            {SECTIONS.map(sec => (
              <button key={sec.id} onClick={() => setActive(sec.id)}
                style={{
                  padding: "0.5rem 0.75rem", border: "none", background: "transparent",
                  color: active === sec.id ? "white" : "rgba(255,255,255,0.35)",
                  fontSize: "0.75rem", fontWeight: active === sec.id ? 600 : 400,
                  cursor: "pointer", whiteSpace: "nowrap", fontFamily: T.font,
                  borderBottom: active === sec.id ? `2px solid ${T.accent}` : "2px solid transparent",
                  transition: "all 0.15s",
                }}>
                {sec.icon} {sec.label}
              </button>
            ))}
          </div>
        </div>

        {/* content area */}
        <div ref={contentRef} style={{ flex: 1, overflowY: "auto", padding: "1.25rem 0.875rem" }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>

            {/* section header */}
            <div style={{ marginBottom: "1.25rem", paddingBottom: "0.875rem", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "1.25rem" }}>{currentSection?.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.02em" }}>{currentSection?.label}</h2>
                <p style={{ margin: 0, fontSize: "0.75rem", color: T.muted }}>{currentSection?.desc}</p>
              </div>
              {(() => {
                const sec    = currentSection;
                const filled = sec.fields.filter(f => profile[f.key]?.trim()).length;
                const pct    = Math.round((filled / sec.fields.length) * 100);
                return (
                  <span style={{ fontSize: "0.6875rem", fontWeight: 700, padding: "3px 10px", borderRadius: 9999, backgroundColor: pct === 100 ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.05)", color: pct === 100 ? T.accent : T.muted, border: `1px solid ${pct === 100 ? "rgba(52,211,153,0.2)" : T.border}`, whiteSpace: "nowrap" }}>
                    {filled}/{sec.fields.length} filled
                  </span>
                );
              })()}
            </div>

            {/* identity warning */}
            {active === "identity" && (
              <div style={{ marginBottom: "1.25rem", padding: "0.75rem 1rem", borderRadius: "0.625rem", border: "1px solid rgba(251,191,36,0.2)", backgroundColor: "rgba(251,191,36,0.05)", display: "flex", gap: "0.625rem", alignItems: "flex-start" }}>
                <span style={{ fontSize: "0.875rem", flexShrink: 0 }}>⚠️</span>
                <p style={{ margin: 0, fontSize: "0.8125rem", color: "rgba(251,191,36,0.8)", lineHeight: 1.6 }}>
                  Sensitive government IDs. Data is stored securely in Supabase and never shared. Only fill what you need.
                </p>
              </div>
            )}

            {/* emails + phones — shown on personal section */}
            {active === "personal" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }} className="fields-grid">
                <MultiField
                  label="Email Addresses"
                  values={emails}
                  onChange={v => { setEmails(v); setSaved(false); setSaveErr(""); }}
                  type="email"
                  placeholder="arjun@gmail.com"
                  addLabel="Add email"
                />
                <MultiField
                  label="Phone Numbers"
                  values={phones}
                  onChange={v => { setPhones(v); setSaved(false); setSaveErr(""); }}
                  type="tel"
                  placeholder="+91 98765 43210"
                  addLabel="Add phone"
                />
              </div>
            )}

            {/* regular fields grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", alignContent: "start" }} className="fields-grid">
              {currentSection?.fields.map(field => (
                <div key={field.key} style={{ gridColumn: field.span === 2 ? "1 / -1" : "auto" }}>
                  <Label required={field.required}>{field.label}</Label>
                  {field.select   ? <FSelect   value={profile[field.key]} onChange={set(field.key)} options={field.select} />
                  : field.textarea ? <FTextarea value={profile[field.key]} onChange={set(field.key)} placeholder={field.placeholder} rows={field.rows || 2} />
                  :                  <FInput    type={field.type || "text"} value={profile[field.key]} onChange={set(field.key)} placeholder={field.placeholder} />}
                </div>
              ))}
            </div>

            {/* document uploads — academic section */}
            {active === "academic" && (
              <div style={{ marginTop: "1.75rem" }}>
                <p style={{ margin: "0 0 0.875rem", fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: T.muted }}>Document Uploads</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="fields-grid">
                  <FileUpload label="Resume / CV" required accept="application/pdf"
                    file={resumeFile} url={resumeURL} progress={resumeProgress} uploading={resumeUploading}
                    onFileChange={f => { setResumeFile(f); setResumeURL(""); setSaveErr(""); }}
                    onViewFile={() => resumeURL && window.open(resumeURL, "_blank")} />
                  <FileUpload label="College Photo ID" required={false} accept="image/jpeg,image/png,application/pdf"
                    file={photoFile} url={photoURL} progress={photoProgress} uploading={photoUploading}
                    onFileChange={f => { setPhotoFile(f); setPhotoURL(""); }}
                    onViewFile={() => photoURL && window.open(photoURL, "_blank")} />
                </div>
                <p style={{ margin: "0.75rem 0 0", fontSize: "0.6875rem", color: "rgba(255,255,255,0.15)", textAlign: "center" }}>Files stored securely on Cloudinary.</p>
              </div>
            )}

            {/* terms + final save — emergency (last) section */}
            {active === "emergency" && (
              <div style={{ marginTop: "1.75rem" }}>
                <div onClick={() => setTermsAccepted(v => !v)}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: "0.75rem",
                    borderRadius: "0.625rem",
                    border: `1px solid ${termsAccepted ? "rgba(52,211,153,0.25)" : T.border}`,
                    backgroundColor: termsAccepted ? "rgba(52,211,153,0.04)" : "rgba(255,255,255,0.02)",
                    padding: "0.875rem 1rem", cursor: "pointer", transition: "all 0.2s",
                  }}>
                  <div style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2, borderRadius: "0.3125rem", border: termsAccepted ? "1px solid rgba(52,211,153,0.6)" : "1px solid rgba(255,255,255,0.15)", backgroundColor: termsAccepted ? T.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                    {termsAccepted && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4.2 7.2L8 3" stroke="#080808" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <p style={{ margin: 0, fontSize: "0.8125rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
                    I agree to the Terms & Conditions and Privacy Policy.{" "}
                    <span style={{ fontSize: "0.75rem", color: "rgba(52,211,153,0.6)" }}>(auto-accepted)</span>
                  </p>
                </div>
                <div style={{ display: "flex", justifyContent: "center", marginTop: "1.5rem" }}>
                  <button onClick={handleSave} disabled={saving}
                    style={{ borderRadius: "0.625rem", border: saved ? "1px solid rgba(52,211,153,0.2)" : "none", backgroundColor: saved ? "rgba(52,211,153,0.12)" : "white", padding: "0.8125rem 2.5rem", fontSize: "0.9375rem", fontWeight: 700, color: saved ? T.accent : "black", cursor: saving ? "not-allowed" : "pointer", fontFamily: T.font, width: "100%", maxWidth: 320, transition: "all 0.2s" }}>
                    {saving ? "Saving…" : saved ? "✅ Profile Saved!" : "Save & Finish"}
                  </button>
                </div>
              </div>
            )}

            {/* next button */}
            {active !== "emergency" && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem", paddingTop: "1rem", borderTop: `1px solid ${T.border}` }}>
                <button
                  onClick={() => { if (activeIdx < SECTIONS.length - 1) setActive(SECTIONS[activeIdx + 1].id); }}
                  style={{ display: "flex", alignItems: "center", gap: "0.375rem", borderRadius: "0.5rem", padding: "0.5625rem 1.125rem", border: `1px solid ${T.border}`, background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.55)", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer", fontFamily: T.font, transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "white"; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}>
                  Next: {SECTIONS[activeIdx + 1]?.label} →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.9s linear infinite; }

        /* Desktop: sidebar always visible */
        @media (min-width: 768px) {
          .sidebar {
            transform: translateX(0) !important;
            position: relative !important;
          }
          .hamburger { display: none !important; }
          .section-tabs { display: none !important; }
          .topbar-desc { display: block !important; }
        }

        /* Mobile: hide sidebar, show tab strip */
        @media (max-width: 767px) {
          .main-wrap { width: 100%; }
          .section-tabs { display: flex !important; }
          .topbar-desc { display: none !important; }
          .fields-grid { grid-template-columns: 1fr !important; }
        }

        /* Small phones */
        @media (max-width: 400px) {
          .section-tabs button { padding: 0.5rem 0.5rem !important; font-size: 0.6875rem !important; }
        }

        input, textarea, select { font-size: 16px !important; } /* prevent iOS zoom */
        @media (min-width: 480px) {
          input, textarea, select { font-size: 0.875rem !important; }
        }

        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.15); }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.3); }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 9999px; }
        select option { background: #1a1a1a; }
        button:focus-visible { outline: 2px solid rgba(52,211,153,0.4); outline-offset: 2px; }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
}
