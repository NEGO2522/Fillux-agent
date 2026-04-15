/**
 * FILLUX — Content Script (v3)
 * Runs inside every webpage. Listens for FILLUX_FILL from the popup.
 *
 * Profile keys now match Form.jsx's SECTIONS exactly:
 *   Personal   : firstName, lastName, dob, gender, nationality, language, category
 *   Address    : addressLine1, addressLine2, city, state, pincode, country, permanentAddr
 *   Academic   : collegeName, degreeName, branch, year, semester, expectedGraduationYear,
 *                rollNumber, cgpa, tenthPercent, twelfthPercent, collegeEmail, collegeCity
 *   Professional: skills, softSkills, currentRole, currentCompany, totalExpYears,
 *                experience, achievements, projects, bio
 *   Social     : linkedin, github, portfolio, leetcode, devpost, twitter, instagram, otherLink
 *   Identity   : aadharNumber, panNumber, passportNumber, voterId, drivingLicense,
 *                bankAccount, ifscCode, upiId
 *   Emergency  : emergencyName, emergencyRelation, emergencyPhone, emergencyEmail,
 *                emergencyAddress, parentFatherName, parentMotherName, parentOccupation, annualIncome
 *   Multi-value: emails[] → email (first), phones[] → phone (first)
 *   Yes/No     : yesNoFields.firstHackathon, yesNoFields.teamFormed, yesNoFields.dietaryNeeds
 */

console.log("⚡ Fillux content script loaded.");

/* ══════════════════════════════════════════════════════
   COMPREHENSIVE FIELD MAP
   Each entry: { keys: string[], profile: keyof profile }
   Keys are matched against lowercased field hints from the page.
══════════════════════════════════════════════════════ */
const FIELD_MAP = [

  // ── 1. EDUCATION (high priority — match before generic "name") ──────────────
  { keys: ["college name","college","university","university name","institution","school","institute","collegename","clg","campus","college/university"], profile: "collegeName" },
  { keys: ["degree","program","course","qualification","degree name","degreename","degree/program"], profile: "degreeName" },
  { keys: ["branch","specialization","stream","major","field of study","branch/specialization"],    profile: "branch" },
  { keys: ["current year","year of study","study year","currentyear","yearofstudy","studying in","class","standing"], profile: "year" },
  { keys: ["semester","sem","current semester"],                                                     profile: "semester" },
  { keys: ["graduation year","expected graduation","graduationyear","passing year","passout year","passout","batch","graduating year","passout_year","expected grad"], profile: "expectedGraduationYear" },
  { keys: ["roll no","roll number","rollno","rollnumber","roll_no","enrollment no","enrollment number","reg no","registrationnumber","student id","usn","prn","reg_no"], profile: "rollNumber" },
  { keys: ["cgpa","gpa","percentage","marks","aggregate","grades","score","current cgpa","overall percentage"], profile: "cgpa" },
  { keys: ["10th","tenth","ssc","class 10","matriculation","10th percentage","10th marks"],          profile: "tenthPercent" },
  { keys: ["12th","twelfth","hsc","class 12","intermediate","12th percentage","12th marks","plus two"], profile: "twelfthPercent" },
  { keys: ["college email","institute email","university email","college mail","collegeemail"],      profile: "collegeEmail" },
  { keys: ["college city","college location","campus city","university city"],                       profile: "collegeCity" },

  // ── 2. PROFESSIONAL ──────────────────────────────────────────────────────────
  { keys: ["technical skills","skills","tech stack","technologies","expertise","skillset","skill set","tools","tech skills"], profile: "skills" },
  { keys: ["soft skills","softskills","interpersonal skills","non-technical skills"],                profile: "softSkills" },
  { keys: ["current role","job title","designation","role","position","title","current position","jobtitle"], profile: "currentRole" },
  { keys: ["current company","company","organization","employer","workplace","organisation","firm","company name"], profile: "currentCompany" },
  { keys: ["total experience","years of experience","experience years","yoe","exp","work exp","total exp"], profile: "totalExpYears" },
  { keys: ["work experience","experience","past experience","professional experience","job experience"], profile: "experience" },
  { keys: ["achievements","awards","accomplishments","honors","accolades","prizes","awards & achievements"], profile: "achievements" },
  { keys: ["projects","notable projects","project","project description","key projects"],            profile: "projects" },
  { keys: ["bio","about","about you","about yourself","introduction","intro","tell us about yourself","self introduction","summary"], profile: "bio" },

  // ── 3. SOCIAL / LINKS ────────────────────────────────────────────────────────
  { keys: ["linkedin","linkedin url","linkedin profile","linkedin link","linkedin_url","linkedin.com"], profile: "linkedin" },
  { keys: ["github","github url","github profile","github link","github_url","github.com","github repo","repo"], profile: "github" },
  { keys: ["portfolio","personal website","website","portfolio url","personal site","portfolio link"], profile: "portfolio" },
  { keys: ["leetcode","codeforces","competitive programming","coding profile","leetcode/codeforces"], profile: "leetcode" },
  { keys: ["devpost","devfolio","hackathon profile"],                                                profile: "devpost" },
  { keys: ["twitter","x.com","x / twitter","tweet"],                                                profile: "twitter" },
  { keys: ["instagram","insta"],                                                                     profile: "instagram" },
  { keys: ["other link","any other link","other url","additional link","drive link","other profile"], profile: "otherLink" },

  // ── 4. PERSONAL IDENTITY (after college/skills to avoid collisions) ──────────
  { keys: ["first name","firstname","fname","first_name","given name","given_name"],                 profile: "firstName" },
  { keys: ["last name","lastname","lname","last_name","surname","family name","family_name"],         profile: "lastName" },
  { keys: ["full name","fullname","full_name","your name","participant name","candidate name","name","applicant name","student name"], profile: "__fullName" },
  { keys: ["email","e-mail","email address","emailaddress","email_address","email id","emailid","mail id","mail"], profile: "email" },
  { keys: ["phone","mobile","contact number","phone number","phonenumber","phone_number","mobile number","whatsapp","contact","mob","ph"], profile: "phone" },
  { keys: ["gender","sex","identify as","your gender"],                                              profile: "gender" },
  { keys: ["date of birth","dob","birth date","birthday","dateofbirth","date_of_birth","birthdate"], profile: "dob" },
  { keys: ["nationality","citizenship","nation"],                                                    profile: "nationality" },
  { keys: ["language","languages","languages known","mother tongue","native language"],              profile: "language" },
  { keys: ["category","caste category","reservation"],                                               profile: "category" },

  // ── 5. ADDRESS ───────────────────────────────────────────────────────────────
  { keys: ["address line 1","address1","addressline1","street address","street","house no","flat no","address","current address","line 1"], profile: "addressLine1" },
  { keys: ["address line 2","address2","addressline2","landmark","near","line 2"],                   profile: "addressLine2" },
  { keys: ["city","town","district","location","city & state","city and state"],                     profile: "city" },
  { keys: ["state","province","region"],                                                             profile: "state" },
  { keys: ["pin","pincode","zip","postal","zipcode","postalcode","zip code","postal code","pin code"], profile: "pincode" },
  { keys: ["country"],                                                                               profile: "country" },
  { keys: ["permanent address","permanentaddr","home address","native address","permanent_address"],  profile: "permanentAddr" },

  // ── 6. GOVERNMENT IDENTITY ───────────────────────────────────────────────────
  { keys: ["aadhar","aadhaar","aadhar number","aadhaar number","uid"],                               profile: "aadharNumber" },
  { keys: ["pan","pan number","pan card","panno"],                                                   profile: "panNumber" },
  { keys: ["passport","passport number","passport no"],                                              profile: "passportNumber" },
  { keys: ["voter id","voterid","voter card","epic"],                                                profile: "voterId" },
  { keys: ["driving license","drivinglicense","dl no","dl number","driving licence"],                profile: "drivingLicense" },
  { keys: ["bank account","account number","bank account number","account no"],                      profile: "bankAccount" },
  { keys: ["ifsc","ifsc code","ifsccode","branch code"],                                             profile: "ifscCode" },
  { keys: ["upi","upi id","upiid","payment id","upi address"],                                       profile: "upiId" },

  // ── 7. EMERGENCY / FAMILY ────────────────────────────────────────────────────
  { keys: ["emergency name","emergency contact name","contact name","guardian name","emergency person"], profile: "emergencyName" },
  { keys: ["relation","relationship","emergency relation","guardian relation"],                       profile: "emergencyRelation" },
  { keys: ["emergency phone","emergency mobile","emergency contact number","emergency number","guardian phone"], profile: "emergencyPhone" },
  { keys: ["emergency email","guardian email"],                                                      profile: "emergencyEmail" },
  { keys: ["emergency address","guardian address"],                                                  profile: "emergencyAddress" },
  { keys: ["father name","father's name","dad name","paternal name"],                                profile: "parentFatherName" },
  { keys: ["mother name","mother's name","mom name","maternal name"],                                profile: "parentMotherName" },
  { keys: ["parent occupation","guardian occupation","parent's occupation"],                         profile: "parentOccupation" },
  { keys: ["annual income","family income","household income","yearly income"],                      profile: "annualIncome" },

  // ── 8. HACKATHON EXTRAS ──────────────────────────────────────────────────────
  { keys: ["team name","teamname","team_name","your team","group name"],                             profile: "teamName" },
  { keys: ["team size","teamsize","number of members","no of members","team_size"],                  profile: "teamSize" },
  { keys: ["project name","project title","projectname","project_name"],                             profile: "projectName" },

  // ── 9. YES/NO QUESTIONS ──────────────────────────────────────────────────────
  { keys: ["first hackathon","first time","first timer","have you ever been","firsthackathon"],      profile: "firstHackathon" },
  { keys: ["team ready","team formed","formed a team","pre-formed","teamformed"],                    profile: "teamFormed" },
  { keys: ["dietary","food preference","vegetarian","meal","allergy","dietary needs","accessibility needs"], profile: "dietaryNeeds" },

  // ── 10. MISC ─────────────────────────────────────────────────────────────────
  { keys: ["resume","cv","resume url","resume link","upload resume","resumeurl","curriculum vitae"],  profile: "resumeURL" },
  { keys: ["why us","why join","why hackathon","why participate","motivation","why do you want","whyus"], profile: "whyUs" },
  { keys: ["message","additional info","anything else","comments","remarks","other info","extra info"], profile: "message" },
];

const AUTO_CHECK_KEYWORDS = [
  "terms","condition","privacy","policy","agree","consent",
  "accept","certify","confirm","acknowledge","newsletter",
  "code of conduct","mlh","18","above","rules","waiver",
];

/* ══════════════════════════════════════════════════════
   BUILD FULL PROFILE (flattens all edge cases)
══════════════════════════════════════════════════════ */
function buildFullProfile(profile) {
  const yesNo = profile.yesNoFields || {};

  // Resolve email: prefer first of emails[] array, fallback to flat email field
  const email = (Array.isArray(profile.emails) && profile.emails[0]) || profile.email || "";
  // Resolve phone: prefer first of phones[] array, fallback to flat phone field
  const phone = (Array.isArray(profile.phones) && profile.phones[0]) || profile.phone || "";

  return {
    ...profile,
    // Flatten yes/no
    firstHackathon: yesNo.firstHackathon || profile.firstHackathon || "",
    teamFormed:     yesNo.teamFormed     || profile.teamFormed     || "",
    dietaryNeeds:   yesNo.dietaryNeeds   || profile.dietaryNeeds   || "",
    // Normalised contact
    email,
    phone,
    // Virtual computed
    __fullName: [profile.firstName, profile.lastName].filter(Boolean).join(" "),
  };
}

/* ══════════════════════════════════════════════════════
   REACT-COMPATIBLE VALUE SETTER
══════════════════════════════════════════════════════ */
function setNativeValue(el, value) {
  const proto = el.tagName === "TEXTAREA"
    ? window.HTMLTextAreaElement.prototype
    : window.HTMLInputElement.prototype;
  const nativeSetter = Object.getOwnPropertyDescriptor(proto, "value")?.set;

  if (nativeSetter) {
    nativeSetter.call(el, value);
  } else {
    el.value = value;
  }

  el.dispatchEvent(new Event("input",  { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
  el.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true }));
  el.dispatchEvent(new KeyboardEvent("keyup",   { bubbles: true }));
}

/* ══════════════════════════════════════════════════════
   GET FIELD HINTS FROM A DOM ELEMENT
══════════════════════════════════════════════════════ */
function getFieldHints(el) {
  const raw = [];
  const add = (v) => {
    if (v && typeof v === "string") {
      const clean = v.toLowerCase().trim().replace(/[:*]/g, "");
      if (clean) raw.push(clean);
    }
  };

  add(el.name);
  add(el.id);
  add(el.placeholder);
  add(el.getAttribute("aria-label"));
  add(el.getAttribute("data-label"));
  add(el.getAttribute("data-field"));
  add(el.getAttribute("title"));
  add(el.getAttribute("autocomplete"));

  // Associated <label for="id">
  if (el.id) {
    const lbl = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
    if (lbl) add(lbl.innerText);
  }

  // aria-labelledby
  const labelledBy = el.getAttribute("aria-labelledby");
  if (labelledBy) {
    labelledBy.split(/\s+/).forEach(id => {
      const lbl = document.getElementById(id);
      if (lbl) add(lbl.innerText);
    });
  }

  // Wrapping <label>
  const parentLabel = el.closest("label");
  if (parentLabel) add(parentLabel.innerText);

  // Google Forms & modern apps: walk up looking for label-like containers
  let runner = el.parentElement;
  let depth = 0;
  while (runner && depth < 5) {
    const heading = runner.querySelector('[role="heading"], [role="label"], .M7pj6b, .m7ZMe');
    if (heading) { add(heading.innerText); break; }
    const text = runner.innerText?.split("\n")[0]?.trim();
    if (text && text.length > 1 && text.length < 100 && text !== el.value) add(text);
    runner = runner.parentElement;
    depth++;
  }

  // Next sibling that looks like a label (radio/checkbox)
  const next = el.nextElementSibling;
  if (next && ["LABEL","SPAN","P","H3","H4","DIV"].includes(next.tagName)) {
    const t = next.innerText?.trim();
    if (t && t.length < 80) add(t);
  }

  // Parent's first-line text
  if (el.parentElement) {
    const pt = el.parentElement.innerText?.split("\n")[0]?.trim();
    if (pt && pt.length > 1 && pt.length < 100) add(pt);
  }

  return [...new Set(raw)].filter(h => h.length > 0 && h.length < 120);
}

/* ══════════════════════════════════════════════════════
   MATCH HINTS → PROFILE VALUE
══════════════════════════════════════════════════════ */
function findProfileValue(hints, fullProfile) {
  for (const entry of FIELD_MAP) {
    for (const keyword of entry.keys) {
      for (const hint of hints) {
        if (hint.includes(keyword) || keyword.includes(hint)) {
          let val = fullProfile[entry.profile];

          // Fallbacks for address sub-fields if specific key is empty
          if (!val && entry.profile === "city")        val = fullProfile.location;
          if (!val && entry.profile === "state")       val = fullProfile.location;
          if (!val && entry.profile === "addressLine1") val = fullProfile.address || fullProfile.addr;

          if (val && String(val).trim()) return String(val).trim();
        }
      }
    }
  }
  return null;
}

/* ══════════════════════════════════════════════════════
   SELECT OPTION HELPER
══════════════════════════════════════════════════════ */
function selectBestOption(el, value) {
  const options = Array.from(el.options);
  const v = value.toLowerCase();

  let best = options.find(o => o.value.toLowerCase() === v)
    || options.find(o => o.text.toLowerCase() === v)
    || options.find(o => o.text.toLowerCase().includes(v))
    || options.find(o => v.includes(o.text.toLowerCase()) && o.text.length > 2);

  if (best) {
    el.value = best.value;
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }
  return false;
}

/* ══════════════════════════════════════════════════════
   HIGHLIGHT HELPER
══════════════════════════════════════════════════════ */
function highlight(el) {
  const prev = el.style.outline;
  el.style.outline = "2px solid rgba(52,211,153,0.8)";
  el.style.outlineOffset = "2px";
  setTimeout(() => { el.style.outline = prev; el.style.outlineOffset = ""; }, 2500);
}

/* ══════════════════════════════════════════════════════
   MAIN FILL FUNCTION
══════════════════════════════════════════════════════ */
async function fillForm(rawProfile) {
  let filled = 0;
  const log = [];
  const delay = (ms) => new Promise(r => setTimeout(r, ms));

  // Build a flat, normalised version of the profile
  const profile = buildFullProfile(rawProfile);

  const selector = [
    "input:not([type='hidden']):not([type='submit']):not([type='button']):not([type='image'])",
    "textarea",
    "select",
    "input[type='checkbox']",
    "input[type='radio']",
    "[role='checkbox']",
    "[role='radio']",
    "[role='option']",
    ".whsOnd", // Google Forms specialised inputs
  ].join(", ");

  const elements = Array.from(document.querySelectorAll(selector));

  for (const el of elements) {
    const isCustom = el.getAttribute("role") || el.classList.contains("whsOnd");
    if (el.offsetParent === null && el.type !== "hidden" && !isCustom) continue;
    if (el.disabled || el.getAttribute("aria-disabled") === "true") continue;
    if (el.readOnly) continue;

    const hints = getFieldHints(el);
    if (hints.length === 0) continue;

    // ── Checkbox ──
    if (el.type === "checkbox" || el.getAttribute("role") === "checkbox") {
      const combined = hints.join(" ");
      if (AUTO_CHECK_KEYWORDS.some(k => combined.includes(k))) {
        const isChecked = el.type === "checkbox" ? el.checked : (el.getAttribute("aria-checked") === "true");
        if (!isChecked) {
          el.click();
          log.push(`☑️ Checked: ${hints[0]}`);
          filled++;
          await delay(60);
        }
      }
      continue;
    }

    // ── Radio ──
    if (el.type === "radio" || el.getAttribute("role") === "radio") {
      const value = findProfileValue(hints, profile);
      if (value) {
        const profileVal = value.toLowerCase();
        const isMatch = hints.some(h => {
          const hh = h.toLowerCase();
          return (hh.includes(profileVal) || profileVal.includes(hh)) && hh.length > 1;
        });
        if (isMatch) {
          const isSelected = el.type === "radio" ? el.checked : (el.getAttribute("aria-checked") === "true");
          if (!isSelected) {
            el.click();
            log.push(`🔘 Selected radio: ${hints[0]} → ${value}`);
            filled++;
            await delay(60);
          }
        }
      }
      continue;
    }

    // ── Select ──
    if (el.tagName === "SELECT") {
      const value = findProfileValue(hints, profile);
      if (value) {
        const ok = selectBestOption(el, value);
        if (ok) {
          log.push(`📋 Selected: ${hints[0]} → ${value}`);
          highlight(el);
          filled++;
          await delay(80);
        }
      }
      continue;
    }

    // ── Text / email / tel / number / textarea ──
    const value = findProfileValue(hints, profile);
    if (value) {
      el.focus();
      setNativeValue(el, value);
      el.blur();
      highlight(el);
      log.push(`✏️ Filled: ${hints[0]} → ${value.slice(0, 40)}${value.length > 40 ? "…" : ""}`);
      filled++;
      await delay(80);
    }
  }

  return { filled, log };
}

/* ══════════════════════════════════════════════════════
   MESSAGE LISTENER
══════════════════════════════════════════════════════ */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "FILLUX_FILL") {
    console.log("⚡ Fillux: Starting fill with profile keys:", Object.keys(request.profile));
    fillForm(request.profile).then(({ filled, log }) => {
      console.log(`⚡ Fillux: Filled ${filled} fields.`, log);
      sendResponse({ status: "done", filled, log });
    }).catch(err => {
      console.error("⚡ Fillux fill error:", err);
      sendResponse({ status: "error", filled: 0, log: [] });
    });
    return true;
  }

  if (request.action === "FILLUX_PING") {
    sendResponse({ status: "ready" });
    return true;
  }
});
