/* =========================================================
   storage.js
   إدارة بيانات الأدوية عبر localStorage (لا يوجد خادم خلفي —
   الموقع ساكن بالكامل ومناسب لاستضافة GitHub Pages).
   ========================================================= */

const DRUGS_KEY = "medtools_drugs_v1";
const ADMIN_PASS_KEY = "medtools_admin_pass_v1";
const ADMIN_SESSION_KEY = "medtools_admin_session_v1";

// كلمة المرور الافتراضية لأول استخدام — يجب تغييرها فورًا من داخل
// لوحة التحكم (زر "تغيير كلمة المرور") قبل نشر الموقع فعليًا.
const DEFAULT_ADMIN_PASS = "admin123";

const DEFAULT_DRUGS = [
  { id: "epi-anaphylaxis", name: "إبينفرين (تأق - عضل)", category: "طوارئ حرجة", route: "IM",
    dosePerKg: 0.01, unit: "mg", minDose: null, maxDose: 0.5, concentration: 1,
    notes: "تركيز 1:1000 (1 ملغ/مل). يُكرر كل 5–15 دقيقة عند الحاجة." },
  { id: "epi-arrest", name: "إبينفرين (سكتة قلبية - وريد/عظم)", category: "طوارئ حرجة", route: "IV/IO",
    dosePerKg: 0.01, unit: "mg", minDose: null, maxDose: 1, concentration: 0.1,
    notes: "تركيز 1:10000 (0.1 ملغ/مل). يُكرر كل 3–5 دقائق." },
  { id: "atropine", name: "أتروبين", category: "طوارئ حرجة", route: "IV/IO",
    dosePerKg: 0.02, unit: "mg", minDose: 0.1, maxDose: 0.5, concentration: null,
    notes: "الحد الأدنى للجرعة 0.1 ملغ لتفادي البطء القلبي المتناقض." },
  { id: "adenosine-1", name: "أدينوزين (الجرعة الأولى)", category: "طوارئ حرجة", route: "IV سريع",
    dosePerKg: 0.1, unit: "mg", minDose: null, maxDose: 6, concentration: null,
    notes: "يُعطى دفعة سريعة جدًا متبوعة بمحلول ملحي فورًا." },
  { id: "amiodarone", name: "أميودارون", category: "طوارئ حرجة", route: "IV/IO",
    dosePerKg: 5, unit: "mg", minDose: null, maxDose: 300, concentration: null,
    notes: "لعلاج عدم انتظام ضربات القلب المقاوم أثناء الإنعاش." },
  { id: "midazolam-iv", name: "ميدازولام (تشنجات - وريد)", category: "أعصاب", route: "IV",
    dosePerKg: 0.1, unit: "mg", minDose: null, maxDose: 10, concentration: null,
    notes: "يمكن تكرارها مرة واحدة إذا استمر التشنج." },
  { id: "diazepam-pr", name: "ديازيبام (تشنجات - شرجي)", category: "أعصاب", route: "PR",
    dosePerKg: 0.5, unit: "mg", minDose: null, maxDose: 10, concentration: null,
    notes: "بديل عند تعذّر الوصول الوريدي." },
  { id: "paracetamol", name: "باراسيتامول (خافض حرارة/مسكن)", category: "عام", route: "PO/PR",
    dosePerKg: 15, unit: "mg", minDose: null, maxDose: 1000, concentration: null,
    notes: "لا تتجاوز 4 جرعات خلال 24 ساعة." },
  { id: "ibuprofen", name: "إيبوبروفين", category: "عام", route: "PO",
    dosePerKg: 10, unit: "mg", minDose: null, maxDose: 400, concentration: null,
    notes: "يُجنّب في الجفاف أو قصور الكلى أو عمر أقل من 6 أشهر." },
  { id: "naloxone", name: "نالوكسون", category: "طوارئ حرجة", route: "IV/IM/IN",
    dosePerKg: 0.1, unit: "mg", minDose: null, maxDose: 2, concentration: null,
    notes: "يُعاير حسب الاستجابة التنفسية؛ قد يلزم تكراره." },
  { id: "ceftriaxone", name: "سيفترياكسون", category: "مضادات حيوية", route: "IV/IM",
    dosePerKg: 75, unit: "mg", minDose: null, maxDose: 2000, concentration: null,
    notes: "نطاق شائع 50–100 ملغ/كغ/اليوم؛ القيمة هنا وسطية — راجع بروتوكول الحالة." },
  { id: "ketamine-sedation", name: "كيتامين (تسكين إجرائي)", category: "تسكين وتخدير", route: "IV",
    dosePerKg: 1.5, unit: "mg", minDose: null, maxDose: 100, concentration: null,
    notes: "نطاق شائع 1–2 ملغ/كغ وريديًا مع مراقبة تنفسية." },
  { id: "dextrose10", name: "محلول غلوكوز 10٪ (نقص سكر الدم)", category: "عام", route: "IV",
    dosePerKg: 2.5, unit: "mL", minDose: null, maxDose: 250, concentration: null,
    notes: "القيمة بالمل/كغ وليست ملغ/كغ. نطاق شائع 2–5 مل/كغ." },
];

function seedIfEmpty(){
  if (!localStorage.getItem(DRUGS_KEY)){
    localStorage.setItem(DRUGS_KEY, JSON.stringify(DEFAULT_DRUGS));
  }
  if (!localStorage.getItem(ADMIN_PASS_KEY)){
    localStorage.setItem(ADMIN_PASS_KEY, DEFAULT_ADMIN_PASS);
  }
}

function getDrugs(){
  seedIfEmpty();
  try{ return JSON.parse(localStorage.getItem(DRUGS_KEY)) || []; }
  catch(e){ return []; }
}

function saveDrugs(list){
  localStorage.setItem(DRUGS_KEY, JSON.stringify(list));
}

function upsertDrug(drug){
  const list = getDrugs();
  const i = list.findIndex(d => d.id === drug.id);
  if (i >= 0) list[i] = drug; else list.push(drug);
  saveDrugs(list);
}

function deleteDrug(id){
  saveDrugs(getDrugs().filter(d => d.id !== id));
}

function resetDrugsToDefault(){
  saveDrugs(JSON.parse(JSON.stringify(DEFAULT_DRUGS)));
}

function getAdminPass(){
  seedIfEmpty();
  return localStorage.getItem(ADMIN_PASS_KEY) || DEFAULT_ADMIN_PASS;
}
function setAdminPass(p){ localStorage.setItem(ADMIN_PASS_KEY, p); }

function isAdminUnlocked(){ return sessionStorage.getItem(ADMIN_SESSION_KEY) === "1"; }
function unlockAdmin(){ sessionStorage.setItem(ADMIN_SESSION_KEY, "1"); }
function lockAdmin(){ sessionStorage.removeItem(ADMIN_SESSION_KEY); }

function slugify(str){
  return "d_" + str.toString().trim().toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/(^-|-$)/g, "") + "_" + Math.random().toString(36).slice(2,7);
}
