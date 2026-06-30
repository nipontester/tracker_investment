import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  Wallet, TrendingUp, TrendingDown, RefreshCw, CalendarDays, Search, Plus, Pencil,
  Trash2, X, ChevronDown, Sun, Moon, LayoutDashboard, Receipt,
  BarChart3, Settings, Menu, ArrowUpDown, AlertTriangle, CheckCircle2,
  XCircle, Info, ChevronLeft, ChevronRight, Download, Upload, Tag, Target,
  Sparkles,
} from "lucide-react";

/* ----------------------------------------------------------------------
   Dime Investment Tracker
   A premium personal-finance dashboard for tracking Dime app deposits.
   Data persists across sessions via window.storage (personal, per-user).
------------------------------------------------------------------------- */

const THB = (n) =>
  new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(n);

const fmtDate = (iso, lang = "en") => {
  const d = new Date(iso + "T00:00:00");
  const locale = lang === "th" ? "th-TH" : "en-GB";
  return d.toLocaleDateString(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    calendar: "gregory",
  });
};

const uid = () => Math.random().toString(36).slice(2, 10);

const STORAGE_KEY = "dime:deposits";
const GOAL_KEY = "dime:goal";
const LANG_KEY = "dime:lang";

/* ---------- i18n ---------- */
const DICT = {
  en: {
    appName: "Dime!",
    appTagline: "Investment Tracker",
    navDashboard: "Dashboard",
    navTransactions: "Transactions",
    navAnnual: "Annual Summary",
    navSettings: "Settings",
    darkMode: "Dark mode",
    lightMode: "Light mode",
    welcome: "Welcome back 👋",
    welcomeSub: "Here's how your Dime! investments are growing.",
    addDeposit: "Add deposit",
    editDeposit: "Edit deposit",
    totalInvestment: "Total Investment",
    allYearsCombined: "All years combined",
    thisYear: "This Year",
    totalDeposits: "Total Deposits",
    transactionsRecorded: "Transactions recorded",
    latestDeposit: "Latest Deposit",
    mostRecentActivity: "Most recent activity",
    goalTitle: "Total investment goal",
    goalSubOf: "of",
    annualInvestment: "Annual investment",
    annualInvestmentSub: "Total deposited per year",
    deposit: "deposit",
    deposits: "deposits",
    transactionsFound: "found",
    importCsv: "Import CSV",
    exportCsv: "Export CSV",
    searchPlaceholder: "Search by note, amount, category, or date…",
    allCategories: "All categories",
    allYears: "All years",
    newest: "Newest",
    oldest: "Oldest",
    colDate: "Date",
    colAmount: "Amount",
    colCategory: "Category",
    colNote: "Note",
    colActions: "Actions",
    colYear: "Year",
    colTotalInvestment: "Total Investment",
    colPctOfTotal: "% of Total",
    edit: "Edit",
    delete: "Delete",
    page: "Page",
    of: "of",
    emptyTitle: "No deposits yet",
    emptyBody: "Add your first deposit to start tracking your Dime! investments.",
    annualSummary: "Annual Summary",
    annualSummarySub: "Year-by-year breakdown of your investment activity.",
    settings: "Settings",
    settingsSub: "Manage how Dime! Investment Tracker looks and feels.",
    appearance: "Appearance",
    appearanceDesc: "Switch between light and dark mode.",
    language: "Language",
    languageDesc: "Choose your preferred display language.",
    currency: "Currency",
    currencyDesc: "All amounts are shown in Thai Baht (฿).",
    goalSettingTitle: "Total investment goal",
    goalSettingDesc: "Used to calculate the progress bar on the Dashboard.",
    dataBackupTitle: "Data & backup",
    dataBackupDesc: "Export every record to CSV, or import from a CSV file.",
    importBtn: "Import",
    exportAllBtn: "Export all",
    cancel: "Cancel",
    save: "Save changes",
    confirmDeleteTitle: "Delete this deposit?",
    confirmDeleteMsg: "This action can't be undone. The deposit will be permanently removed from your records.",
    fieldDate: "Date",
    fieldAmount: "Amount (฿)",
    fieldCategory: "Category",
    fieldNote: "Note",
    optional: "(optional)",
    notePlaceholder: "e.g. Monthly contribution",
    errPickDate: "Pick a date for this deposit.",
    errAmount: "Enter an amount greater than 0.",
    toastUpdated: "Deposit updated.",
    toastAdded: (amt) => `Deposit of ฿${amt} added.`,
    toastDeleted: "Deposit deleted.",
    toastSaveFail: "Couldn't save your data. Please try again.",
    toastGoalFail: "Couldn't save your goal.",
    toastNoRows: "Nothing to export.",
    toastExportOk: (n) => `Exported ${n} record${n === 1 ? "" : "s"}.`,
    toastImportOk: (n) => `Imported ${n} record${n === 1 ? "" : "s"}.`,
    toastImportSkip: (n, e) => `Skipped ${n} row${n === 1 ? "" : "s"} with errors: ${e}${n > 1 ? " …" : ""}`,
    toastImportEmpty: "No data found in that file.",
    toastImportReadFail: "Couldn't read that file.",
    csvEmpty: "The file is empty.",
    csvMissingCols: "The file must have at least a date and amount column.",
    csvRowDate: (n, v) => `Row ${n}: invalid date (${v || "blank"})`,
    csvRowAmount: (n) => `Row ${n}: invalid amount`,
    vsLastYear: "vs last year",
    noPriorYear: "no prior year data",
    projectionTitle: "Year-end projection",
    projectionSub: (year) => `Estimated total by end of ${year}, based on your pace so far`,
    projectionAt: "Projected total",
    projectionPace: (amt) => `~฿${amt} / month average`,
    projectionNote: "Estimate only — actual results may vary.",
    monthlyTitle: (year) => `${year} · monthly breakdown`,
    monthlyClose: "Close",
    monthlyEmpty: "No deposits recorded for this month.",
    monthShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    clickBarHint: "Click a bar to see the monthly breakdown",
  },
  th: {
    appName: "Dime!",
    appTagline: "Investment Tracker",
    navDashboard: "Dashboard",
    navTransactions: "รายการฝาก",
    navAnnual: "สรุปรายปี",
    navSettings: "ตั้งค่า",
    darkMode: "โหมดมืด",
    lightMode: "โหมดสว่าง",
    welcome: "ยินดีต้อนรับกลับมา 👋",
    welcomeSub: "นี่คือความคืบหน้าการลงทุนใน Dime! ของคุณ",
    addDeposit: "เพิ่มเงินฝาก",
    editDeposit: "แก้ไขเงินฝาก",
    totalInvestment: "เงินลงทุนรวม",
    allYearsCombined: "รวมทุกปี",
    thisYear: "ปีนี้",
    totalDeposits: "จำนวนครั้งที่ฝาก",
    transactionsRecorded: "รายการที่บันทึกไว้",
    latestDeposit: "ฝากล่าสุด",
    mostRecentActivity: "กิจกรรมล่าสุด",
    goalTitle: "เป้าหมายการลงทุนรวม",
    goalSubOf: "จาก",
    annualInvestment: "เงินลงทุนรายปี",
    annualInvestmentSub: "ยอดเงินฝากรวมต่อปี",
    deposit: "รายการ",
    deposits: "รายการ",
    transactionsFound: "รายการ",
    importCsv: "Import CSV",
    exportCsv: "Export CSV",
    searchPlaceholder: "ค้นหาด้วยโน้ต จำนวนเงิน หมวดหมู่ หรือวันที่…",
    allCategories: "ทุกหมวดหมู่",
    allYears: "ทุกปี",
    newest: "ใหม่สุด",
    oldest: "เก่าสุด",
    colDate: "วันที่",
    colAmount: "จำนวนเงิน",
    colCategory: "หมวดหมู่",
    colNote: "โน้ต",
    colActions: "การจัดการ",
    colYear: "ปี",
    colTotalInvestment: "เงินลงทุนรวม",
    colPctOfTotal: "% ของยอดรวม",
    edit: "แก้ไข",
    delete: "ลบ",
    page: "หน้า",
    of: "จาก",
    emptyTitle: "ยังไม่มีรายการฝาก",
    emptyBody: "เพิ่มเงินฝากครั้งแรกเพื่อเริ่มติดตามการลงทุนใน Dime! ของคุณ",
    annualSummary: "สรุปรายปี",
    annualSummarySub: "ภาพรวมการลงทุนแยกตามปี",
    settings: "ตั้งค่า",
    settingsSub: "ปรับแต่งหน้าตาและการใช้งานของ Dime! Investment Tracker",
    appearance: "ธีมการแสดงผล",
    appearanceDesc: "สลับระหว่างโหมดสว่างและโหมดมืด",
    language: "ภาษา",
    languageDesc: "เลือกภาษาที่ใช้แสดงผลในแอป",
    currency: "สกุลเงิน",
    currencyDesc: "แสดงจำนวนเงินทั้งหมดเป็นบาทไทย (฿)",
    goalSettingTitle: "เป้าหมายการลงทุนรวม",
    goalSettingDesc: "ใช้คำนวณ progress bar บนหน้า Dashboard",
    dataBackupTitle: "ข้อมูลและการสำรองข้อมูล",
    dataBackupDesc: "Export ทุกรายการเป็น CSV หรือ Import จากไฟล์ CSV",
    importBtn: "Import",
    exportAllBtn: "Export ทั้งหมด",
    cancel: "ยกเลิก",
    save: "บันทึกการแก้ไข",
    confirmDeleteTitle: "ลบรายการนี้?",
    confirmDeleteMsg: "ลบแล้วจะไม่สามารถย้อนกลับได้ รายการนี้จะถูกลบออกจากระบบอย่างถาวร",
    fieldDate: "วันที่",
    fieldAmount: "จำนวนเงิน (฿)",
    fieldCategory: "หมวดหมู่",
    fieldNote: "โน้ต",
    optional: "(ไม่บังคับ)",
    notePlaceholder: "เช่น ฝากประจำเดือน",
    errPickDate: "กรุณาเลือกวันที่ของรายการฝาก",
    errAmount: "กรุณาระบุจำนวนเงินที่มากกว่า 0",
    toastUpdated: "บันทึกการแก้ไขแล้ว",
    toastAdded: (amt) => `เพิ่มเงินฝาก ฿${amt} แล้ว`,
    toastDeleted: "ลบรายการแล้ว",
    toastSaveFail: "บันทึกข้อมูลไม่สำเร็จ ลองใหม่อีกครั้ง",
    toastGoalFail: "บันทึกเป้าหมายไม่สำเร็จ",
    toastNoRows: "ไม่มีรายการให้ export",
    toastExportOk: (n) => `Export ${n} รายการเรียบร้อย`,
    toastImportOk: (n) => `Import สำเร็จ ${n} รายการ`,
    toastImportSkip: (n, e) => `ข้าม ${n} แถวที่มีปัญหา: ${e}${n > 1 ? " …" : ""}`,
    toastImportEmpty: "ไม่พบข้อมูลในไฟล์",
    toastImportReadFail: "อ่านไฟล์ไม่สำเร็จ",
    csvEmpty: "ไฟล์ไม่มีข้อมูล",
    csvMissingCols: "ไฟล์ต้องมีคอลัมน์ date และ amount เป็นอย่างน้อย",
    csvRowDate: (n, v) => `แถวที่ ${n}: รูปแบบวันที่ไม่ถูกต้อง (${v || "ว่าง"})`,
    csvRowAmount: (n) => `แถวที่ ${n}: จำนวนเงินไม่ถูกต้อง`,
    vsLastYear: "เทียบปีก่อน",
    noPriorYear: "ไม่มีข้อมูลปีก่อน",
    projectionTitle: "คาดการณ์สิ้นปี",
    projectionSub: (year) => `ประมาณการยอดรวมสิ้นปี ${year} จากอัตราการฝากที่ผ่านมา`,
    projectionAt: "ยอดรวมที่คาดการณ์",
    projectionPace: (amt) => `เฉลี่ย ~฿${amt} / เดือน`,
    projectionNote: "เป็นการประมาณการเท่านั้น ผลจริงอาจแตกต่างไป",
    monthlyTitle: (year) => `รายละเอียดรายเดือน · ${year}`,
    monthlyClose: "ปิด",
    monthlyEmpty: "ไม่มีรายการฝากในเดือนนี้",
    monthShort: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."],
    clickBarHint: "คลิกแท่งกราฟเพื่อดูรายละเอียดรายเดือน",
  },
};

const CATEGORY_LABELS = {
  en: { salary: "Salary", bonus: "Bonus", gift: "Gift", other: "Other" },
  th: { salary: "เงินเดือน", bonus: "โบนัส", gift: "ของขวัญ", other: "อื่นๆ" },
};

const CATEGORIES = [
  { id: "salary", color: "#22C55E" },
  { id: "bonus", color: "#3B82F6" },
  { id: "gift", color: "#F59E0B" },
  { id: "other", color: "#9CA3AF" },
];
const catInfo = (id, lang = "en") => {
  const c = CATEGORIES.find((c) => c.id === id) || CATEGORIES[3];
  return { ...c, label: CATEGORY_LABELS[lang]?.[c.id] || CATEGORY_LABELS.en[c.id] };
};

/* ---------- seed data ---------- */
function seedData() {
  const notes = [
    "Monthly contribution", "Bonus top-up", "Salary auto-deposit", "Extra savings",
    "Dividend reinvest", "Year-end boost", "Side income", "", "Round-up savings",
    "Mid-year top-up",
  ];
  const catWeights = ["salary", "salary", "salary", "bonus", "gift", "other"];
  const rows = [];
  const years = [2022, 2023, 2024, 2025, 2026];
  years.forEach((y) => {
    const count = y === 2026 ? 8 : 10 + Math.floor(Math.random() * 6);
    for (let i = 0; i < count; i++) {
      const month = y === 2026 ? Math.floor(Math.random() * 6) : Math.floor(Math.random() * 12);
      const day = 1 + Math.floor(Math.random() * 27);
      const amount = Math.round((1500 + Math.random() * 8000) / 50) * 50;
      rows.push({
        id: uid(),
        date: `${y}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        amount,
        note: notes[Math.floor(Math.random() * notes.length)],
        category: catWeights[Math.floor(Math.random() * catWeights.length)],
      });
    }
  });
  return rows.sort((a, b) => (a.date < b.date ? 1 : -1));
}

/* ---------- CSV helpers ---------- */
function toCSV(rows) {
  const header = ["date", "amount", "category", "note"];
  const esc = (v) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [header.join(",")];
  rows.forEach((r) => {
    lines.push([r.date, r.amount, r.category || "other", esc(r.note || "")].join(","));
  });
  return lines.join("\n");
}

function parseCSV(text, t) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length);
  if (!lines.length) return { rows: [], errors: [t.csvEmpty] };
  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const dateIdx = header.indexOf("date");
  const amountIdx = header.indexOf("amount");
  const catIdx = header.indexOf("category");
  const noteIdx = header.indexOf("note");
  if (dateIdx === -1 || amountIdx === -1) {
    return { rows: [], errors: [t.csvMissingCols] };
  }
  const rows = [];
  const errors = [];
  const splitLine = (line) => {
    const out = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQ) {
        if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (ch === '"') inQ = false;
        else cur += ch;
      } else {
        if (ch === '"') inQ = true;
        else if (ch === ",") { out.push(cur); cur = ""; }
        else cur += ch;
      }
    }
    out.push(cur);
    return out;
  };
  for (let i = 1; i < lines.length; i++) {
    const cols = splitLine(lines[i]);
    const date = (cols[dateIdx] || "").trim();
    const amount = Number((cols[amountIdx] || "").trim());
    const rawCat = (catIdx > -1 ? cols[catIdx] : "other")?.trim().toLowerCase();
    const note = noteIdx > -1 ? (cols[noteIdx] || "").trim() : "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      errors.push(t.csvRowDate(i + 1, date));
      continue;
    }
    if (!amount || isNaN(amount) || amount <= 0) {
      errors.push(t.csvRowAmount(i + 1));
      continue;
    }
    const category = CATEGORIES.some((c) => c.id === rawCat) ? rawCat : "other";
    rows.push({ id: uid(), date, amount, category, note });
  }
  return { rows, errors };
}

function downloadFile(filename, content, mime = "text/csv") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ---------- analytics helpers ---------- */
function monthlyBreakdown(deposits, year) {
  const months = Array.from({ length: 12 }, (_, i) => ({ month: i, total: 0, count: 0, rows: [] }));
  deposits.forEach((d) => {
    if (d.date.slice(0, 4) !== String(year)) return;
    const m = Number(d.date.slice(5, 7)) - 1;
    months[m].total += d.amount;
    months[m].count += 1;
    months[m].rows.push(d);
  });
  return months;
}

function yearEndProjection(deposits, year) {
  const today = new Date();
  const isCurrentYear = String(year) === String(today.getFullYear());
  const yearRows = deposits.filter((d) => d.date.slice(0, 4) === String(year));
  const totalSoFar = yearRows.reduce((s, d) => s + d.amount, 0);

  if (!isCurrentYear) {
    return { applicable: false, totalSoFar, projected: totalSoFar, monthlyAvg: 0 };
  }
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  const daysInYear = (new Date(today.getFullYear(), 1, 29).getMonth() === 1) ? 366 : 365;
  const monthsElapsed = Math.max(dayOfYear / (daysInYear / 12), 0.5);
  const monthlyAvg = totalSoFar / monthsElapsed;
  const projected = monthlyAvg * 12;
  return { applicable: true, totalSoFar, projected, monthlyAvg };
}

function yoyChange(annual, year) {
  const idx = annual.findIndex((a) => String(a.year) === String(year));
  if (idx <= 0) return null;
  const curr = annual[idx].total;
  const prev = annual[idx - 1].total;
  if (prev === 0) return null;
  return ((curr - prev) / prev) * 100;
}

/* ---------- toast system ---------- */
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((type, message) => {
    const id = uid();
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);
  const dismiss = (id) => setToasts((t) => t.filter((x) => x.id !== id));
  return { toasts, push, dismiss };
}

function ToastStack({ toasts, dismiss }) {
  const icon = { success: CheckCircle2, error: XCircle, info: Info };
  const color = {
    success: "var(--accent)",
    error: "#EF4444",
    info: "#3B82F6",
  };
  return (
    <div className="toast-stack">
      {toasts.map((t) => {
        const Icon = icon[t.type] || Info;
        return (
          <div key={t.id} className="toast" style={{ "--toast-accent": color[t.type] }}>
            <Icon size={18} style={{ color: color[t.type], flexShrink: 0 }} />
            <span className="toast-msg">{t.message}</span>
            <button className="toast-close" onClick={() => dismiss(t.id)} aria-label="Dismiss">
              <X size={14} />
            </button>
          </div>
        );
      })}
      <style>{`
        .toast-stack {
          position: fixed; top: 16px; right: 16px; z-index: 200;
          display: flex; flex-direction: column; gap: 10px;
          max-width: calc(100vw - 32px); width: 340px;
        }
        .toast {
          background: var(--card); border: 1px solid var(--border);
          border-left: 3px solid var(--toast-accent);
          border-radius: 12px; padding: 12px 14px;
          display: flex; align-items: flex-start; gap: 10px;
          box-shadow: 0 8px 24px -8px rgba(0,0,0,0.25);
          animation: toastIn 0.28s cubic-bezier(.2,.8,.2,1);
          color: var(--text);
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(16px) scale(0.98); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        .toast-msg { font-size: 13.5px; line-height: 1.4; flex: 1; padding-top: 1px; }
        .toast-close { background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 2px; border-radius: 6px; flex-shrink: 0; }
        .toast-close:hover { background: var(--hover); color: var(--text); }
      `}</style>
    </div>
  );
}

/* ---------- confirmation dialog ---------- */
function ConfirmDialog({ open, title, message, onConfirm, onCancel, t }) {
  if (!open) return null;
  return (
    <div className="overlay" onMouseDown={onCancel}>
      <div className="confirm-box" onMouseDown={(e) => e.stopPropagation()}>
        <div className="confirm-icon"><AlertTriangle size={20} /></div>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirm-actions">
          <button className="btn btn-ghost" onClick={onCancel}>{t.cancel}</button>
          <button className="btn btn-danger" onClick={onConfirm}>{t.delete}</button>
        </div>
      </div>
      <style>{`
        .confirm-box {
          background: var(--card); border-radius: 18px; padding: 24px;
          width: 100%; max-width: 360px; box-shadow: 0 24px 48px -12px rgba(0,0,0,0.35);
          animation: popIn 0.22s cubic-bezier(.2,.8,.2,1); text-align: center;
          border: 1px solid var(--border);
        }
        .confirm-icon {
          width: 44px; height: 44px; border-radius: 50%;
          background: rgba(239,68,68,0.12); color: #EF4444;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 14px;
        }
        .confirm-box h3 { font-size: 16px; font-weight: 700; margin: 0 0 6px; color: var(--text); }
        .confirm-box p { font-size: 13.5px; color: var(--text-muted); margin: 0 0 20px; line-height: 1.5; }
        .confirm-actions { display: flex; gap: 10px; }
        .confirm-actions .btn { flex: 1; }
      `}</style>
    </div>
  );
}

/* ---------- Add/Edit modal ---------- */
function DepositModal({ open, initial, onSave, onClose, t, lang }) {
  const isEdit = !!initial?.id;
  const [date, setDate] = useState(initial?.date || new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState(initial?.amount ?? "");
  const [note, setNote] = useState(initial?.note || "");
  const [category, setCategory] = useState(initial?.category || "salary");
  const [error, setError] = useState("");
  const firstRef = useRef(null);

  useEffect(() => {
    if (open) {
      setDate(initial?.date || new Date().toISOString().slice(0, 10));
      setAmount(initial?.amount ?? "");
      setNote(initial?.note || "");
      setCategory(initial?.category || "salary");
      setError("");
      setTimeout(() => firstRef.current?.focus(), 50);
    }
  }, [open, initial]);

  if (!open) return null;

  const submit = (e) => {
    e.preventDefault();
    const num = Number(amount);
    if (!date) return setError(t.errPickDate);
    if (!amount || isNaN(num) || num <= 0) return setError(t.errAmount);
    onSave({ id: initial?.id || uid(), date, amount: num, note: note.trim(), category });
  };

  return (
    <div className="overlay" onMouseDown={onClose}>
      <form className="modal-box" onMouseDown={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="modal-head">
          <h3>{isEdit ? t.editDeposit : t.addDeposit}</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <label className="field">
          <span>{t.fieldDate}</span>
          <input
            ref={firstRef}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
          />
        </label>

        <label className="field">
          <span>{t.fieldAmount}</span>
          <input
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>

        <label className="field">
          <span>{t.fieldCategory}</span>
          <div className="cat-picker">
            {CATEGORIES.map((c) => {
              const info = catInfo(c.id, lang);
              return (
                <button
                  key={c.id}
                  type="button"
                  className={`cat-pill ${category === c.id ? "active" : ""}`}
                  style={category === c.id ? { background: info.color, borderColor: info.color, color: "#fff" } : undefined}
                  onClick={() => setCategory(c.id)}
                >
                  {info.label}
                </button>
              );
            })}
          </div>
        </label>

        <label className="field">
          <span>{t.fieldNote} <em>{t.optional}</em></span>
          <input
            type="text"
            placeholder={t.notePlaceholder}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={80}
          />
        </label>

        {error && <div className="form-error">{error}</div>}

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>{t.cancel}</button>
          <button type="submit" className="btn btn-primary">{isEdit ? t.save : t.addDeposit}</button>
        </div>
      </form>

      <style>{`
        .modal-box {
          background: var(--card); border-radius: 20px; padding: 24px;
          width: 100%; max-width: 420px; box-shadow: 0 24px 48px -12px rgba(0,0,0,0.35);
          animation: popIn 0.22s cubic-bezier(.2,.8,.2,1); border: 1px solid var(--border);
        }
        .modal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
        .modal-head h3 { font-size: 17px; font-weight: 700; color: var(--text); margin: 0; }
        .field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
        .field span { font-size: 12.5px; font-weight: 600; color: var(--text-muted); }
        .field em { font-weight: 400; font-style: normal; opacity: 0.7; }
        .field input {
          background: var(--input-bg); border: 1px solid var(--border); border-radius: 10px;
          padding: 10px 12px; font-size: 14px; color: var(--text); font-family: inherit;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .field input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-ring); }
        .cat-picker { display: flex; gap: 6px; flex-wrap: wrap; }
        .cat-pill {
          padding: 6px 12px; border-radius: 999px; border: 1px solid var(--border);
          background: var(--input-bg); color: var(--text-muted); font-size: 12.5px; font-weight: 600;
          cursor: pointer; font-family: inherit; transition: all 0.15s;
        }
        .cat-pill:hover { background: var(--hover); }
        .cat-pill.active { box-shadow: 0 2px 8px -2px rgba(0,0,0,0.25); }
        .form-error { font-size: 12.5px; color: #EF4444; margin: -4px 0 14px; }
        .modal-actions { display: flex; gap: 10px; margin-top: 6px; }
        .modal-actions .btn { flex: 1; }
      `}</style>
    </div>
  );
}

/* ---------- summary card ---------- */
function SummaryCard({ icon: Icon, label, value, sub, accent, delay, badge }) {
  return (
    <div className="summary-card" style={{ animationDelay: `${delay}ms` }}>
      <div className="summary-top">
        <div className="summary-icon" style={accent ? { background: "var(--accent-soft)", color: "var(--accent)" } : undefined}>
          <Icon size={18} />
        </div>
        {badge && (
          <div className={`summary-badge ${badge.positive ? "pos" : "neg"}`}>
            {badge.positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />} {badge.text}
          </div>
        )}
      </div>
      <div className="summary-label">{label}</div>
      <div className="summary-value">{value}</div>
      <div className="summary-sub">{sub}</div>
      <style>{`
        .summary-card {
          background: var(--card); border: 1px solid var(--border); border-radius: 18px;
          padding: 18px 20px; box-shadow: var(--shadow-sm);
          animation: cardIn 0.45s cubic-bezier(.2,.8,.2,1) backwards;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .summary-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
        .summary-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; gap: 6px; }
        .summary-icon {
          width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center;
          justify-content: center; background: var(--icon-bg); color: var(--text-muted); flex-shrink: 0;
        }
        .summary-badge {
          display: inline-flex; align-items: center; gap: 3px; font-size: 10.5px; font-weight: 700;
          padding: 3px 7px; border-radius: 999px; white-space: nowrap; margin-top: 2px;
        }
        .summary-badge.pos { background: rgba(34,197,94,0.12); color: var(--accent); }
        .summary-badge.neg { background: rgba(239,68,68,0.12); color: #EF4444; }
        .summary-label {
          font-size: 12.5px; color: var(--text-muted); font-weight: 600; margin-bottom: 6px;
          line-height: 1.3; min-height: 2.6em; display: flex; align-items: flex-start;
        }
        .summary-value { font-size: 26px; font-weight: 800; color: var(--text); letter-spacing: -0.02em; line-height: 1.1; }
        .summary-sub { font-size: 12px; color: var(--text-faint); margin-top: 5px; line-height: 1.4; min-height: 2.2em; }
        @keyframes cardIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

/* ---------- chart ---------- */
function AnnualChart({ data, isDark, t, onBarClick }) {
  const [active, setActive] = useState(null);
  const maxVal = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className="chart-card">
      <div className="chart-head">
        <div>
          <h3>{t.annualInvestment}</h3>
          <p>{t.annualInvestmentSub}</p>
        </div>
      </div>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 0 }} barCategoryGap="32%"
            onMouseMove={(s) => setActive(s?.activeTooltipIndex ?? null)}
            onMouseLeave={() => setActive(null)}
          >
            <XAxis
              dataKey="year"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--chart-label)", fontSize: 12, fontWeight: 600 }}
              dy={6}
            />
            <YAxis hide domain={[0, maxVal * 1.15]} />
            <Tooltip
              cursor={false}
              content={({ active: hover, payload }) => {
                if (!hover || !payload?.length) return null;
                const p = payload[0].payload;
                return (
                  <div className="chart-tooltip">
                    <div className="tt-year">{p.year}</div>
                    <div className="tt-amount">฿{THB(p.total)}</div>
                    <div className="tt-count">{p.count} {p.count === 1 ? t.deposit : t.deposits}</div>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="total"
              radius={[8, 8, 8, 8]}
              maxBarSize={56}
              isAnimationActive
              animationDuration={700}
              animationEasing="ease-out"
              onClick={(d) => onBarClick && onBarClick(d.year)}
              style={{ cursor: onBarClick ? "pointer" : "default" }}
            >
              {data.map((d, i) => (
                <Cell
                  key={d.year}
                  fill={active === null || active === i ? "var(--accent)" : "var(--accent-dim)"}
                  style={{ transition: "fill 0.2s" }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {onBarClick && <p className="chart-hint">{t.clickBarHint}</p>}
      <style>{`
        .chart-card {
          background: var(--card); border: 1px solid var(--border); border-radius: 20px;
          padding: 22px 22px 8px; box-shadow: var(--shadow-sm);
        }
        .chart-head h3 { font-size: 15.5px; font-weight: 700; color: var(--text); margin: 0 0 2px; }
        .chart-head p { font-size: 12.5px; color: var(--text-muted); margin: 0 0 8px; }
        .chart-tooltip {
          background: var(--tooltip-bg); border: 1px solid var(--border); border-radius: 10px;
          padding: 9px 12px; box-shadow: 0 8px 20px -6px rgba(0,0,0,0.3);
        }
        .tt-year { font-size: 11px; color: var(--text-muted); font-weight: 600; }
        .tt-amount { font-size: 15px; font-weight: 800; color: var(--text); margin-top: 1px; }
        .tt-count { font-size: 11px; color: var(--text-faint); margin-top: 1px; }
        .chart-hint { text-align: center; font-size: 11.5px; color: var(--text-faint); margin: 2px 0 10px; }
      `}</style>
    </div>
  );
}

/* ---------- monthly drilldown modal ---------- */
function MonthlyDrilldownModal({ year, deposits, onClose, t }) {
  if (!year) return null;
  const months = monthlyBreakdown(deposits, year);
  const maxVal = Math.max(...months.map((m) => m.total), 1);
  const yearTotal = months.reduce((s, m) => s + m.total, 0);
  const yearCount = months.reduce((s, m) => s + m.count, 0);

  return (
    <div className="overlay" onMouseDown={onClose}>
      <div className="drilldown-box" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{t.monthlyTitle(year)}</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="month-grid">
          {months.map((m) => (
            <div key={m.month} className="month-cell">
              <div className="month-label">{t.monthShort[m.month]}</div>
              <div className="month-bar-track">
                <div
                  className="month-bar-fill"
                  style={{ height: `${m.total ? Math.max((m.total / maxVal) * 100, 6) : 0}%` }}
                />
              </div>
              <div className="month-amount">{m.total ? `฿${THB(m.total)}` : "—"}</div>
              <div className="month-count">{m.count > 0 ? `${m.count} ${m.count === 1 ? t.deposit : t.deposits}` : ""}</div>
            </div>
          ))}
        </div>
        <div className="drilldown-footer">
          <span>{t.colTotalInvestment}</span>
          <strong>฿{THB(yearTotal)} · {yearCount} {yearCount === 1 ? t.deposit : t.deposits}</strong>
        </div>
      </div>
      <style>{`
        .drilldown-box {
          background: var(--card); border-radius: 20px; padding: 24px;
          width: 100%; max-width: 720px; max-height: 86vh; overflow-y: auto;
          box-shadow: 0 24px 48px -12px rgba(0,0,0,0.35);
          animation: popIn 0.22s cubic-bezier(.2,.8,.2,1); border: 1px solid var(--border);
        }
        .month-grid {
          display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px;
        }
        .month-cell {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          background: var(--hover); border-radius: 14px; padding: 12px 8px 10px;
        }
        .month-label { font-size: 11.5px; font-weight: 700; color: var(--text-muted); }
        .month-bar-track {
          width: 100%; height: 64px; display: flex; align-items: flex-end; justify-content: center;
        }
        .month-bar-fill {
          width: 60%; min-height: 3px; border-radius: 6px 6px 2px 2px; background: var(--accent);
          transition: height 0.5s cubic-bezier(.2,.8,.2,1);
        }
        .month-amount { font-size: 11.5px; font-weight: 800; color: var(--text); text-align: center; line-height: 1.2; }
        .month-count { font-size: 10px; color: var(--text-faint); }
        .drilldown-footer {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--border);
          font-size: 12.5px; color: var(--text-muted);
        }
        .drilldown-footer strong { color: var(--text); font-size: 13.5px; }
        @media (max-width: 560px) {
          .month-grid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>
    </div>
  );
}

/* ---------- skeleton ---------- */
function Skeleton({ className }) {
  return <div className={`skeleton ${className || ""}`} />;
}

/* ---------- main app ---------- */
export default function DimeTracker() {
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState("en");
  const [loading, setLoading] = useState(true);
  const [deposits, setDeposits] = useState([]);
  const [goal, setGoal] = useState(1000000);
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const t = DICT[lang];

  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortDir, setSortDir] = useState("newest");
  const [pageNum, setPageNum] = useState(1);
  const ROWS_PER_PAGE = 8;

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [drillYear, setDrillYear] = useState(null);
  const importInputRef = useRef(null);

  const MOBILE_BREAKPOINT = 768;
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= MOBILE_BREAKPOINT : false
  );

  const { toasts, push, dismiss } = useToasts();

  /* ---- track viewport width in JS so the sidebar drawer's open/closed
     transform is driven directly by React state (sidebarOpen + isMobile)
     via inline style, rather than relying solely on a CSS media query +
     toggled class. This avoids edge cases on some mobile browsers where a
     class-toggle-driven transform can fail to re-render visually. ---- */
  useEffect(() => {
    const syncViewport = () => {
      const mobile = window.innerWidth <= MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };
    syncViewport();
    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  /* extra safety: Escape always closes the mobile drawer too */
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setSidebarOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ---- load from persistent storage on mount ---- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let storedDeposits = null;
      let storedGoal = null;
      let storedLang = null;
      try { storedDeposits = await window.storage.get(STORAGE_KEY, false); } catch {}
      try { storedGoal = await window.storage.get(GOAL_KEY, false); } catch {}
      try { storedLang = await window.storage.get(LANG_KEY, false); } catch {}
      if (cancelled) return;
      try {
        if (storedDeposits?.value) {
          const parsed = JSON.parse(storedDeposits.value);
          setDeposits(Array.isArray(parsed) && parsed.length ? parsed : seedData());
        } else {
          setDeposits(seedData());
        }
      } catch {
        setDeposits(seedData());
      }
      if (storedGoal?.value) {
        const g = Number(storedGoal.value);
        if (!isNaN(g) && g > 0) setGoal(g);
      }
      if (storedLang?.value === "th" || storedLang?.value === "en") {
        setLang(storedLang.value);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  /* ---- persist deposits whenever they change (after initial load completes) ---- */
  useEffect(() => {
    if (loading) return;
    window.storage.set(STORAGE_KEY, JSON.stringify(deposits), false).catch(() => {
      push("error", t.toastSaveFail);
    });
  }, [deposits, loading]);

  const persistGoal = useCallback((value) => {
    setGoal(value);
    window.storage.set(GOAL_KEY, String(value), false).catch(() => {
      push("error", t.toastGoalFail);
    });
  }, [push, t]);

  const persistLang = useCallback((value) => {
    setLang(value);
    window.storage.set(LANG_KEY, value, false).catch(() => {});
  }, []);

  /* derived data */
  const years = useMemo(() => {
    const s = new Set(deposits.map((d) => d.date.slice(0, 4)));
    return Array.from(s).sort((a, b) => b - a);
  }, [deposits]);

  const annual = useMemo(() => {
    const map = {};
    deposits.forEach((d) => {
      const y = d.date.slice(0, 4);
      if (!map[y]) map[y] = { year: y, total: 0, count: 0 };
      map[y].total += d.amount;
      map[y].count += 1;
    });
    return Object.values(map).sort((a, b) => a.year - b.year);
  }, [deposits]);

  const annualDesc = useMemo(() => [...annual].sort((a, b) => b.year - a.year), [annual]);

  const totalAll = useMemo(() => deposits.reduce((s, d) => s + d.amount, 0), [deposits]);
  const currentYear = new Date().getFullYear().toString();
  const totalThisYear = useMemo(
    () => deposits.filter((d) => d.date.slice(0, 4) === currentYear).reduce((s, d) => s + d.amount, 0),
    [deposits, currentYear]
  );
  const latestDate = useMemo(() => {
    if (!deposits.length) return null;
    return deposits.reduce((latest, d) => (d.date > latest ? d.date : latest), deposits[0].date);
  }, [deposits]);

  const filtered = useMemo(() => {
    let rows = [...deposits];
    if (yearFilter !== "all") rows = rows.filter((d) => d.date.slice(0, 4) === yearFilter);
    if (categoryFilter !== "all") rows = rows.filter((d) => (d.category || "other") === categoryFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (d) =>
          d.note?.toLowerCase().includes(q) ||
          String(d.amount).includes(q) ||
          fmtDate(d.date, lang).toLowerCase().includes(q) ||
          catInfo(d.category, lang).label.toLowerCase().includes(q)
      );
    }
    rows.sort((a, b) => (sortDir === "newest" ? (a.date < b.date ? 1 : -1) : a.date > b.date ? 1 : -1));
    return rows;
  }, [deposits, yearFilter, categoryFilter, search, sortDir, lang]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const pageRows = filtered.slice((pageNum - 1) * ROWS_PER_PAGE, pageNum * ROWS_PER_PAGE);

  useEffect(() => setPageNum(1), [search, yearFilter, categoryFilter, sortDir]);

  /* actions */
  const saveDeposit = (dep) => {
    const exists = deposits.some((d) => d.id === dep.id);
    setDeposits((prev) =>
      exists ? prev.map((d) => (d.id === dep.id ? dep : d)) : [dep, ...prev]
    );
    setModalOpen(false);
    setEditing(null);
    push("success", exists ? t.toastUpdated : t.toastAdded(THB(dep.amount)));
  };

  const deleteDeposit = (id) => {
    setDeposits((prev) => prev.filter((d) => d.id !== id));
    setConfirmId(null);
    push("success", t.toastDeleted);
  };

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (dep) => { setEditing(dep); setModalOpen(true); };

  const handleExport = (rows) => {
    if (!rows.length) { push("info", t.toastNoRows); return; }
    const stamp = new Date().toISOString().slice(0, 10);
    downloadFile(`dime-deposits-${stamp}.csv`, toCSV(rows));
    push("success", t.toastExportOk(rows.length));
  };

  const triggerImport = () => importInputRef.current?.click();

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const { rows, errors } = parseCSV(String(reader.result || ""), t);
      if (rows.length) {
        setDeposits((prev) => [...rows, ...prev]);
        push("success", t.toastImportOk(rows.length));
      }
      if (errors.length) {
        push("error", t.toastImportSkip(errors.length, errors[0]));
      }
      if (!rows.length && !errors.length) push("info", t.toastImportEmpty);
    };
    reader.onerror = () => push("error", t.toastImportReadFail);
    reader.readAsText(file);
  };

  /* ---------------- render ---------------- */
  return (
    <div className={dark ? "dime-root dark" : "dime-root"}>
      <ToastStack toasts={toasts} dismiss={dismiss} />
      <ConfirmDialog
        open={!!confirmId}
        title={t.confirmDeleteTitle}
        message={t.confirmDeleteMsg}
        onConfirm={() => deleteDeposit(confirmId)}
        onCancel={() => setConfirmId(null)}
        t={t}
      />
      <DepositModal
        open={modalOpen}
        initial={editing}
        onSave={saveDeposit}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        t={t}
        lang={lang}
      />
      {drillYear && (
        <MonthlyDrilldownModal
          year={drillYear}
          deposits={deposits}
          onClose={() => setDrillYear(null)}
          t={t}
        />
      )}
      <input
        ref={importInputRef}
        type="file"
        accept=".csv,text/csv"
        style={{ display: "none" }}
        onChange={handleImportFile}
      />

      <div className="shell">
        {/* Sidebar */}
        <aside
          className="sidebar"
          style={
            isMobile
              ? {
                  position: "fixed",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  zIndex: 60,
                  transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
                }
              : { position: "static", transform: "none" }
          }
        >
          <div className="brand">
            <div className="brand-mark">💰</div>
            <div className="brand-text">
              <div className="brand-title">{t.appName}</div>
              <div className="brand-sub">{t.appTagline}</div>
            </div>
          </div>
          <nav className="nav">
            {[
              { id: "dashboard", label: t.navDashboard, icon: LayoutDashboard },
              { id: "transactions", label: t.navTransactions, icon: Receipt },
              { id: "annual", label: t.navAnnual, icon: BarChart3 },
              { id: "settings", label: t.navSettings, icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = page === item.id;
              return (
                <button
                  key={item.id}
                  className={`nav-item ${isActive ? "active" : ""}`}
                  onClick={() => { setPage(item.id); setSidebarOpen(false); }}
                >
                  <Icon size={17} />
                  <span>{item.label}</span>
                  {isActive && <span className="nav-dot" />}
                </button>
              );
            })}
          </nav>
          <div className="sidebar-foot">
            <button className="dark-toggle" onClick={() => setDark((d) => !d)}>
              <span className="dt-icon">{dark ? <Moon size={15} /> : <Sun size={15} />}</span>
              <span>{dark ? t.darkMode : t.lightMode}</span>
              <span className={`dt-switch ${dark ? "on" : ""}`}><span className="dt-knob" /></span>
            </button>
          </div>
        </aside>

        {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

        {/* Main */}
        <div className="main">
          <header className="topbar">
            {isMobile && (
              <button
                className="icon-btn"
                onClick={() => setSidebarOpen((o) => !o)}
                aria-label={sidebarOpen ? "Close menu" : "Open menu"}
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
            <div className="topbar-title">
              {{ dashboard: t.navDashboard, transactions: t.navTransactions, annual: t.navAnnual, settings: t.navSettings }[page]}
            </div>
            <div className="topbar-actions">
              <div className="lang-switch topbar-lang">
                <button className={lang === "en" ? "active" : ""} onClick={() => persistLang("en")}>EN</button>
                <button className={lang === "th" ? "active" : ""} onClick={() => persistLang("th")}>ไทย</button>
              </div>
              {!isMobile && (
                <button className="icon-btn" onClick={() => setDark((d) => !d)} aria-label="Toggle dark mode">
                  {dark ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              )}
            </div>
          </header>

          <main className="content">
            {page === "dashboard" && (
              <DashboardPage
                loading={loading}
                totalAll={totalAll}
                totalThisYear={totalThisYear}
                count={deposits.length}
                latestDate={latestDate}
                annual={annual}
                deposits={deposits}
                dark={dark}
                goal={goal}
                onAdd={openAdd}
                onDrillYear={setDrillYear}
                t={t}
                lang={lang}
              />
            )}
            {page === "transactions" && (
              <TransactionsPage
                loading={loading}
                rows={pageRows}
                allCount={filtered.length}
                years={years}
                search={search}
                setSearch={setSearch}
                yearFilter={yearFilter}
                setYearFilter={setYearFilter}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                sortDir={sortDir}
                setSortDir={setSortDir}
                onAdd={openAdd}
                onEdit={openEdit}
                onDelete={(id) => setConfirmId(id)}
                pageNum={pageNum}
                totalPages={totalPages}
                setPageNum={setPageNum}
                onExport={() => handleExport(filtered)}
                onImport={triggerImport}
                t={t}
                lang={lang}
              />
            )}
            {page === "annual" && (
              <AnnualPage
                loading={loading}
                annualDesc={annualDesc}
                totalAll={totalAll}
                onDrillYear={setDrillYear}
                t={t}
              />
            )}
            {page === "settings" && (
              <SettingsPage
                dark={dark}
                setDark={setDark}
                goal={goal}
                setGoal={persistGoal}
                onExportAll={() => handleExport(deposits)}
                onImport={triggerImport}
                t={t}
                lang={lang}
                setLang={persistLang}
              />
            )}
          </main>
        </div>
      </div>

      <GlobalStyles />
    </div>
  );
}


/* ---------- Dashboard page ---------- */
function DashboardPage({ loading, totalAll, totalThisYear, count, latestDate, annual, deposits, dark, goal, onAdd, onDrillYear, t, lang }) {
  if (loading) {
    return (
      <div className="page-stack">
        <div className="summary-grid">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="sk-card" />)}
        </div>
        <Skeleton className="sk-chart" />
      </div>
    );
  }

  const pct = goal > 0 ? Math.min(100, (totalAll / goal) * 100) : 0;
  const locale = lang === "th" ? "th-TH" : "en-GB";
  const monthRange = `${new Date(new Date().getFullYear(), 0, 1).toLocaleDateString(locale, { month: "short" })} – ${new Date().toLocaleDateString(locale, { month: "short" })} ${new Date().getFullYear()}`;
  const currentYear = new Date().getFullYear();
  const yoy = yoyChange(annual, currentYear);
  const projection = yearEndProjection(deposits, currentYear);

  return (
    <div className="page-stack">
      <div className="page-row">
        <div>
          <h1 className="page-h1">{t.welcome}</h1>
          <p className="page-sub">{t.welcomeSub}</p>
        </div>
        <button className="btn btn-primary" onClick={onAdd}><Plus size={16} /> {t.addDeposit}</button>
      </div>

      <div className="summary-grid">
        <SummaryCard icon={Wallet} label={t.totalInvestment} value={`฿${THB(totalAll)}`} sub={t.allYearsCombined} accent delay={0} />
        <SummaryCard
          icon={TrendingUp}
          label={t.thisYear}
          value={`฿${THB(totalThisYear)}`}
          sub={monthRange}
          delay={60}
          badge={yoy === null ? null : { positive: yoy >= 0, text: `${yoy >= 0 ? "+" : ""}${yoy.toFixed(1)}% ${t.vsLastYear}` }}
        />
        <SummaryCard icon={RefreshCw} label={t.totalDeposits} value={count} sub={t.transactionsRecorded} delay={120} />
        <SummaryCard icon={CalendarDays} label={t.latestDeposit} value={latestDate ? fmtDate(latestDate, lang) : "—"} sub={t.mostRecentActivity} delay={180} />
      </div>

      {goal > 0 && (
        <div className="goal-card">
          <div className="goal-head">
            <div className="goal-icon"><Target size={18} /></div>
            <div className="goal-text">
              <div className="goal-title">{t.goalTitle}</div>
              <div className="goal-sub">฿{THB(totalAll)} {t.goalSubOf} ฿{THB(goal)}</div>
            </div>
            <div className="goal-pct">{pct.toFixed(1)}%</div>
          </div>
          <div className="goal-track">
            <div className="goal-fill" style={{ width: `${pct}%` }} />
          </div>
          <style>{`
            .goal-card { background: var(--card); border: 1px solid var(--border); border-radius: 18px; padding: 18px 20px; box-shadow: var(--shadow-sm); }
            .goal-head { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
            .goal-icon { width: 36px; height: 36px; border-radius: 10px; background: var(--accent-soft); color: var(--accent); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
            .goal-text { flex: 1; }
            .goal-title { font-size: 13.5px; font-weight: 700; color: var(--text); }
            .goal-sub { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
            .goal-pct { font-size: 18px; font-weight: 800; color: var(--accent); }
            .goal-track { height: 10px; border-radius: 999px; background: var(--hover); overflow: hidden; }
            .goal-fill { height: 100%; border-radius: 999px; background: var(--accent); transition: width 0.6s cubic-bezier(.2,.8,.2,1); }
          `}</style>
        </div>
      )}

      {projection.applicable && projection.totalSoFar > 0 && (
        <div className="proj-card">
          <div className="proj-icon"><Sparkles size={18} /></div>
          <div className="proj-text">
            <div className="proj-title">{t.projectionTitle}</div>
            <div className="proj-sub">{t.projectionSub(currentYear)}</div>
          </div>
          <div className="proj-figures">
            <div className="proj-amount">฿{THB(projection.projected)}</div>
            <div className="proj-pace">{t.projectionPace(THB(Math.round(projection.monthlyAvg)))}</div>
          </div>
          <style>{`
            .proj-card {
              background: var(--card); border: 1px solid var(--border); border-radius: 18px;
              padding: 16px 20px; box-shadow: var(--shadow-sm); display: flex; align-items: center; gap: 14px;
              flex-wrap: wrap;
            }
            .proj-icon {
              width: 36px; height: 36px; border-radius: 10px; background: rgba(245,158,11,0.12); color: #F59E0B;
              display: flex; align-items: center; justify-content: center; flex-shrink: 0;
            }
            .proj-text { flex: 1; min-width: 160px; }
            .proj-title { font-size: 13.5px; font-weight: 700; color: var(--text); }
            .proj-sub { font-size: 11.5px; color: var(--text-muted); margin-top: 2px; }
            .proj-figures { text-align: right; }
            .proj-amount { font-size: 18px; font-weight: 800; color: var(--text); }
            .proj-pace { font-size: 11px; color: var(--text-faint); margin-top: 1px; }
          `}</style>
        </div>
      )}

      <AnnualChart data={annual} isDark={dark} t={t} onBarClick={onDrillYear} />
    </div>
  );
}

/* ---------- Transactions page ---------- */
function TransactionsPage({
  loading, rows, allCount, years, search, setSearch, yearFilter, setYearFilter,
  categoryFilter, setCategoryFilter, sortDir, setSortDir, onAdd, onEdit, onDelete,
  pageNum, totalPages, setPageNum, onExport, onImport, t, lang,
}) {
  const [openMenu, setOpenMenu] = useState(null); // "category" | "year" | null
  const menuRef = useRef(null);

  useEffect(() => {
    if (!openMenu) return;
    const handlePointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [openMenu]);

  return (
    <div className="page-stack">
      <div className="page-row">
        <div>
          <h1 className="page-h1">{t.navTransactions}</h1>
          <p className="page-sub">{allCount} {t.transactionsFound}</p>
        </div>
        <div className="page-row-actions">
          <button className="btn btn-ghost" onClick={onImport}><Upload size={15} /> {t.importCsv}</button>
          <button className="btn btn-ghost" onClick={onExport}><Download size={15} /> {t.exportCsv}</button>
          <button className="btn btn-primary" onClick={onAdd}><Plus size={16} /> {t.addDeposit}</button>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} />
          <input placeholder={t.searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="toolbar-right" ref={menuRef}>
          <div className="select-wrap">
            <button className="select-btn" onClick={() => setOpenMenu((m) => (m === "category" ? null : "category"))}>
              {categoryFilter === "all" ? t.allCategories : catInfo(categoryFilter, lang).label} <ChevronDown size={14} />
            </button>
            {openMenu === "category" && (
              <div className="select-menu">
                <button onClick={() => { setCategoryFilter("all"); setOpenMenu(null); }} className={categoryFilter === "all" ? "active" : ""}>{t.allCategories}</button>
                {CATEGORIES.map((c) => {
                  const info = catInfo(c.id, lang);
                  return (
                    <button key={c.id} onClick={() => { setCategoryFilter(c.id); setOpenMenu(null); }} className={categoryFilter === c.id ? "active" : ""}>
                      <span className="menu-dot" style={{ background: info.color }} /> {info.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div className="select-wrap">
            <button className="select-btn" onClick={() => setOpenMenu((m) => (m === "year" ? null : "year"))}>
              {yearFilter === "all" ? t.allYears : yearFilter} <ChevronDown size={14} />
            </button>
            {openMenu === "year" && (
              <div className="select-menu">
                <button onClick={() => { setYearFilter("all"); setOpenMenu(null); }} className={yearFilter === "all" ? "active" : ""}>{t.allYears}</button>
                {years.map((y) => (
                  <button key={y} onClick={() => { setYearFilter(y); setOpenMenu(null); }} className={yearFilter === y ? "active" : ""}>{y}</button>
                ))}
              </div>
            )}
          </div>
          <button className="select-btn" onClick={() => setSortDir((s) => (s === "newest" ? "oldest" : "newest"))}>
            <ArrowUpDown size={14} /> {sortDir === "newest" ? t.newest : t.oldest}
          </button>
        </div>
      </div>

      <div className="table-card">
        {loading ? (
          <div style={{ padding: 20 }}>
            {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="sk-row" />)}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState onAdd={onAdd} t={t} />
        ) : (
          <>
            <table className="dtable">
              <thead>
                <tr>
                  <th>{t.colDate}</th>
                  <th>{t.colAmount}</th>
                  <th className="hide-sm">{t.colCategory}</th>
                  <th className="hide-sm">{t.colNote}</th>
                  <th className="actions-col">{t.colActions}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((d) => {
                  const c = catInfo(d.category, lang);
                  return (
                    <tr key={d.id}>
                      <td className="cell-date">{fmtDate(d.date, lang)}</td>
                      <td className="cell-amount">฿{THB(d.amount)}</td>
                      <td className="hide-sm">
                        <span className="cat-tag" style={{ background: `${c.color}1F`, color: c.color }}>
                          <Tag size={11} /> {c.label}
                        </span>
                      </td>
                      <td className="cell-note hide-sm">{d.note || <span className="muted">—</span>}</td>
                      <td className="cell-actions">
                        <button className="icon-btn" onClick={() => onEdit(d)} aria-label="Edit"><Pencil size={15} /></button>
                        <button className="icon-btn danger" onClick={() => onDelete(d.id)} aria-label="Delete"><Trash2 size={15} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="pagination">
              <span className="page-info">{t.page} {pageNum} {t.of} {totalPages}</span>
              <div className="page-ctrl">
                <button className="icon-btn" disabled={pageNum <= 1} onClick={() => setPageNum((p) => p - 1)}><ChevronLeft size={16} /></button>
                <button className="icon-btn" disabled={pageNum >= totalPages} onClick={() => setPageNum((p) => p + 1)}><ChevronRight size={16} /></button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState({ onAdd, t }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">🪙</div>
      <h3>{t.emptyTitle}</h3>
      <p>{t.emptyBody}</p>
      <button className="btn btn-primary" onClick={onAdd}><Plus size={16} /> {t.addDeposit}</button>
    </div>
  );
}

/* ---------- Annual Summary page ---------- */
function AnnualPage({ loading, annualDesc, totalAll, onDrillYear, t }) {
  if (loading) {
    return (
      <div className="page-stack">
        <Skeleton className="sk-chart" style={{ height: 320 }} />
      </div>
    );
  }
  const ascending = [...annualDesc].sort((a, b) => a.year - b.year);
  return (
    <div className="page-stack">
      <div>
        <h1 className="page-h1">{t.annualSummary}</h1>
        <p className="page-sub">{t.annualSummarySub}</p>
      </div>
      <div className="table-card">
        <table className="dtable">
          <thead>
            <tr>
              <th>{t.colYear}</th>
              <th>{t.colTotalInvestment}</th>
              <th>{t.totalDeposits}</th>
              <th className="hide-sm">{t.vsLastYear}</th>
              <th className="hide-sm">{t.colPctOfTotal}</th>
            </tr>
          </thead>
          <tbody>
            {annualDesc.map((row) => {
              const yoy = yoyChange(ascending, row.year);
              return (
                <tr key={row.year} className="clickable-row" onClick={() => onDrillYear && onDrillYear(row.year)}>
                  <td className="cell-year">{row.year}</td>
                  <td className="cell-amount">฿{THB(row.total)}</td>
                  <td>{row.count}</td>
                  <td className="hide-sm">
                    {yoy === null ? (
                      <span className="muted">—</span>
                    ) : (
                      <span className={`yoy-tag ${yoy >= 0 ? "pos" : "neg"}`}>
                        {yoy >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />} {yoy >= 0 ? "+" : ""}{yoy.toFixed(1)}%
                      </span>
                    )}
                  </td>
                  <td className="hide-sm">
                    <div className="pct-bar">
                      <div className="pct-fill" style={{ width: `${totalAll ? (row.total / totalAll) * 100 : 0}%` }} />
                      <span>{totalAll ? ((row.total / totalAll) * 100).toFixed(1) : 0}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- Settings page ---------- */
function SettingsPage({ dark, setDark, goal, setGoal, onExportAll, onImport, t, lang, setLang }) {
  const [goalInput, setGoalInput] = useState(String(goal));

  useEffect(() => setGoalInput(String(goal)), [goal]);

  const commitGoal = () => {
    const num = Number(goalInput);
    if (!isNaN(num) && num > 0) setGoal(num);
    else setGoalInput(String(goal));
  };

  return (
    <div className="page-stack">
      <div>
        <h1 className="page-h1">{t.settings}</h1>
        <p className="page-sub">{t.settingsSub}</p>
      </div>
      <div className="table-card" style={{ padding: 22 }}>
        <div className="settings-row">
          <div>
            <div className="settings-title">{t.appearance}</div>
            <div className="settings-desc">{t.appearanceDesc}</div>
          </div>
          <button className="dark-toggle compact" onClick={() => setDark((d) => !d)}>
            <span className="dt-icon">{dark ? <Moon size={15} /> : <Sun size={15} />}</span>
            <span className={`dt-switch ${dark ? "on" : ""}`}><span className="dt-knob" /></span>
          </button>
        </div>
        <div className="settings-row">
          <div>
            <div className="settings-title">{t.language}</div>
            <div className="settings-desc">{t.languageDesc}</div>
          </div>
          <div className="lang-switch">
            <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>EN</button>
            <button className={lang === "th" ? "active" : ""} onClick={() => setLang("th")}>ไทย</button>
          </div>
        </div>
        <div className="settings-row">
          <div>
            <div className="settings-title">{t.currency}</div>
            <div className="settings-desc">{t.currencyDesc}</div>
          </div>
          <span className="badge">THB ฿</span>
        </div>
        <div className="settings-row">
          <div>
            <div className="settings-title">{t.goalSettingTitle}</div>
            <div className="settings-desc">{t.goalSettingDesc}</div>
          </div>
          <div className="goal-input-wrap">
            <span>฿</span>
            <input
              type="number"
              min="1"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              onBlur={commitGoal}
              onKeyDown={(e) => e.key === "Enter" && commitGoal()}
            />
          </div>
        </div>
      </div>

      <div className="table-card" style={{ padding: 22 }}>
        <div className="settings-row">
          <div>
            <div className="settings-title">{t.dataBackupTitle}</div>
            <div className="settings-desc">{t.dataBackupDesc}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-ghost" onClick={onImport}><Upload size={15} /> {t.importBtn}</button>
            <button className="btn btn-ghost" onClick={onExportAll}><Download size={15} /> {t.exportAllBtn}</button>
          </div>
        </div>
      </div>

      <style>{`
        .goal-input-wrap { display: flex; align-items: center; gap: 6px; background: var(--input-bg); border: 1px solid var(--border); border-radius: 10px; padding: 0 10px; height: 36px; }
        .goal-input-wrap span { font-size: 13px; color: var(--text-muted); font-weight: 700; }
        .goal-input-wrap input { border: none; background: none; outline: none; font-size: 13.5px; color: var(--text); width: 110px; font-family: inherit; }
      `}</style>
    </div>
  );
}


/* ---------- global styles ---------- */
function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Prompt:wght@400;500;600;700&display=swap');

      .dime-root {
        --accent: #22C55E;
        --accent-dim: rgba(34,197,94,0.28);
        --accent-soft: rgba(34,197,94,0.12);
        --accent-ring: rgba(34,197,94,0.25);
        --bg: #F8FAFC;
        --card: #FFFFFF;
        --text: #111827;
        --text-muted: #6B7280;
        --text-faint: #9CA3AF;
        --border: #E5E7EB;
        --hover: #F1F5F9;
        --icon-bg: #F1F5F9;
        --input-bg: #FFFFFF;
        --tooltip-bg: #FFFFFF;
        --chart-label: #6B7280;
        --shadow-sm: 0 1px 2px rgba(15,23,42,0.04), 0 1px 6px -2px rgba(15,23,42,0.06);
        --shadow-md: 0 8px 24px -8px rgba(15,23,42,0.12);
        font-family: 'Inter', 'Prompt', sans-serif;
        background: var(--bg);
        color: var(--text);
        min-height: 100vh;
        transition: background 0.25s ease, color 0.25s ease;
      }
      .dime-root.dark {
        --bg: #111827;
        --card: #1F2937;
        --text: #F9FAFB;
        --text-muted: #9CA3AF;
        --text-faint: #6B7280;
        --border: #2D3748;
        --hover: #283142;
        --icon-bg: #283142;
        --input-bg: #161F2C;
        --tooltip-bg: #1F2937;
        --chart-label: #9CA3AF;
        --shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
        --shadow-md: 0 8px 24px -8px rgba(0,0,0,0.5);
      }
      .dime-root * { box-sizing: border-box; }

      .shell { display: flex; min-height: 100vh; }

      /* Sidebar */
      .sidebar {
        width: 232px; background: var(--card); border-right: 1px solid var(--border);
        display: flex; flex-direction: column; padding: 20px 14px;
        flex-shrink: 0;
      }
      .brand { display: flex; align-items: center; gap: 10px; padding: 6px 8px 22px; }
      .brand-mark { font-size: 22px; }
      .brand-title { font-size: 15px; font-weight: 800; color: var(--text); letter-spacing: -0.01em; }
      .brand-sub { font-size: 11px; color: var(--text-muted); font-weight: 500; }
      .nav { display: flex; flex-direction: column; gap: 2px; flex: 1; }
      .nav-item {
        display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 10px;
        background: none; border: none; cursor: pointer; font-size: 13.5px; font-weight: 600;
        color: var(--text-muted); text-align: left; position: relative;
        transition: background 0.15s, color 0.15s;
        white-space: nowrap; overflow: hidden; min-height: 38px; box-sizing: border-box;
      }
      .nav-item:hover { background: var(--hover); color: var(--text); }
      .nav-item.active { background: var(--accent-soft); color: var(--accent); }
      .nav-item span:first-of-type { flex: 1; overflow: hidden; text-overflow: ellipsis; }
      .sidebar-foot { padding-top: 12px; border-top: 1px solid var(--border); }
      .lang-switch {
        display: flex; background: var(--hover); border: 1px solid var(--border); border-radius: 10px;
        padding: 2px; gap: 2px;
      }
      .lang-switch button {
        flex: 1; padding: 6px 10px; border-radius: 8px; border: none; background: none; cursor: pointer;
        font-size: 12px; font-weight: 700; color: var(--text-muted); font-family: inherit; transition: all 0.15s;
      }
      .lang-switch button.active { background: var(--card); color: var(--accent); box-shadow: var(--shadow-sm); }
      .topbar-lang { padding: 2px; }
      .topbar-lang button { padding: 5px 9px; }

      .dark-toggle {
        display: flex; align-items: center; gap: 8px; width: 100%; padding: 8px 10px;
        background: var(--hover); border: 1px solid var(--border); border-radius: 10px;
        cursor: pointer; font-size: 12.5px; font-weight: 600; color: var(--text);
        white-space: nowrap; box-sizing: border-box;
      }
      .dark-toggle.compact { width: auto; }
      .dark-toggle span:nth-child(2) { flex: 1; text-align: left; overflow: hidden; text-overflow: ellipsis; }
      .dt-icon { display: flex; }
      .dt-switch {
        width: 32px; height: 18px; border-radius: 999px; background: var(--border);
        position: relative; transition: background 0.2s; flex-shrink: 0;
      }
      .dt-switch.on { background: var(--accent); }
      .dt-knob {
        position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; border-radius: 50%;
        background: #fff; transition: transform 0.2s cubic-bezier(.2,.8,.2,1); box-shadow: 0 1px 2px rgba(0,0,0,0.2);
      }
      .dt-switch.on .dt-knob { transform: translateX(14px); }

      .sidebar-overlay { display: none; }

      /* Main */
      .main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
      .topbar {
        height: 60px; display: flex; align-items: center; gap: 12px; padding: 0 24px;
        border-bottom: 1px solid var(--border); flex-shrink: 0;
      }
      .topbar-title { font-size: 15px; font-weight: 700; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .topbar-actions { display: flex; align-items: center; gap: 10px; }
      .content { padding: 26px 28px 60px; flex: 1; }

      .page-stack { display: flex; flex-direction: column; gap: 22px; max-width: 1180px; }
      .page-row { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
      .page-row-actions { display: flex; gap: 8px; flex-wrap: wrap; }
      .page-h1 { font-size: 22px; font-weight: 800; margin: 0 0 4px; letter-spacing: -0.02em; }
      .page-sub { font-size: 13.5px; color: var(--text-muted); margin: 0; }

      .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }

      /* buttons */
      .btn {
        display: inline-flex; align-items: center; justify-content: center; gap: 6px;
        padding: 9px 16px; border-radius: 10px; font-size: 13.5px; font-weight: 700;
        cursor: pointer; border: 1px solid transparent; transition: transform 0.12s, box-shadow 0.12s, background 0.15s;
        font-family: inherit;
      }
      .btn:active { transform: scale(0.97); }
      .btn-primary { background: var(--accent); color: #fff; box-shadow: 0 4px 14px -4px rgba(34,197,94,0.5); }
      .btn-primary:hover { background: #1ea854; }
      .btn-ghost { background: var(--hover); color: var(--text); border-color: var(--border); }
      .btn-ghost:hover { background: var(--border); }
      .btn-danger { background: #EF4444; color: #fff; }
      .btn-danger:hover { background: #dc2f2f; }

      .icon-btn {
        display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px;
        border-radius: 8px; background: none; border: none; cursor: pointer; color: var(--text-muted);
        transition: background 0.15s, color 0.15s;
      }
      .icon-btn:hover { background: var(--hover); color: var(--text); }
      .icon-btn.danger:hover { background: rgba(239,68,68,0.1); color: #EF4444; }
      .icon-btn:disabled { opacity: 0.35; cursor: not-allowed; }
      .icon-btn:disabled:hover { background: none; }

      /* toolbar */
      .toolbar { display: flex; gap: 12px; flex-wrap: wrap; justify-content: space-between; }
      .search-box {
        display: flex; align-items: center; gap: 8px; background: var(--card); border: 1px solid var(--border);
        border-radius: 10px; padding: 0 12px; height: 38px; flex: 1; min-width: 220px; max-width: 360px;
        color: var(--text-faint);
      }
      .search-box input {
        border: none; background: none; outline: none; font-size: 13.5px; color: var(--text);
        width: 100%; font-family: inherit;
      }
      .search-box input::placeholder { color: var(--text-faint); }
      .toolbar-right { display: flex; gap: 10px; }
      .select-wrap { position: relative; }
      .select-btn {
        display: flex; align-items: center; gap: 6px; height: 38px; padding: 0 13px;
        background: var(--card); border: 1px solid var(--border); border-radius: 10px;
        font-size: 13px; font-weight: 600; color: var(--text); cursor: pointer; font-family: inherit;
        white-space: nowrap;
      }
      .select-btn:hover { background: var(--hover); }
      .select-menu {
        position: absolute; top: calc(100% + 6px); right: 0; background: var(--card); border: 1px solid var(--border);
        border-radius: 12px; box-shadow: var(--shadow-md); padding: 6px; min-width: 130px; z-index: 30;
        display: flex; flex-direction: column; gap: 1px; max-height: 240px; overflow-y: auto;
        animation: popIn 0.15s ease;
      }
      .select-menu button {
        text-align: left; padding: 7px 10px; border-radius: 8px; background: none; border: none;
        cursor: pointer; font-size: 13px; color: var(--text); font-family: inherit;
        display: flex; align-items: center; gap: 7px;
      }
      .select-menu button:hover { background: var(--hover); }
      .select-menu button.active { background: var(--accent-soft); color: var(--accent); font-weight: 700; }
      .menu-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }

      /* table */
      .table-card { background: var(--card); border: 1px solid var(--border); border-radius: 18px; overflow: hidden; box-shadow: var(--shadow-sm); }
      .dtable { width: 100%; border-collapse: collapse; }
      .dtable th {
        text-align: left; font-size: 11.5px; font-weight: 700; color: var(--text-faint);
        text-transform: uppercase; letter-spacing: 0.04em; padding: 14px 20px; border-bottom: 1px solid var(--border);
      }
      .dtable td { padding: 13px 20px; font-size: 13.5px; border-bottom: 1px solid var(--border); color: var(--text); }
      .dtable tbody tr { transition: background 0.12s; }
      .dtable tbody tr:hover { background: var(--hover); }
      .dtable tbody tr:last-child td { border-bottom: none; }
      .cell-amount { font-weight: 700; font-variant-numeric: tabular-nums; }
      .cat-tag { display: inline-flex; align-items: center; gap: 4px; font-size: 11.5px; font-weight: 700; padding: 4px 9px; border-radius: 999px; white-space: nowrap; }
      .yoy-tag { display: inline-flex; align-items: center; gap: 3px; font-size: 11.5px; font-weight: 700; padding: 4px 9px; border-radius: 999px; white-space: nowrap; }
      .yoy-tag.pos { background: rgba(34,197,94,0.12); color: var(--accent); }
      .yoy-tag.neg { background: rgba(239,68,68,0.12); color: #EF4444; }
      .clickable-row { cursor: pointer; }
      .cell-year { font-weight: 800; }
      .cell-actions { display: flex; gap: 4px; }
      .muted { color: var(--text-faint); }
      .actions-col { text-align: left; }
      .pct-bar { position: relative; background: var(--hover); border-radius: 999px; height: 18px; width: 130px; overflow: hidden; }
      .pct-fill { position: absolute; inset: 0; background: var(--accent-dim); border-radius: 999px; }
      .pct-bar span { position: relative; font-size: 10.5px; font-weight: 700; padding-left: 8px; line-height: 18px; color: var(--text-muted); }

      .pagination { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; }
      .page-info { font-size: 12.5px; color: var(--text-muted); }
      .page-ctrl { display: flex; gap: 4px; }

      /* empty state */
      .empty-state { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 56px 24px; gap: 6px; }
      .empty-icon { font-size: 38px; margin-bottom: 6px; }
      .empty-state h3 { font-size: 15px; font-weight: 700; margin: 0; }
      .empty-state p { font-size: 13px; color: var(--text-muted); margin: 0 0 14px; max-width: 280px; }

      /* settings */
      .settings-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid var(--border); }
      .settings-row:last-child { border-bottom: none; }
      .settings-title { font-size: 13.5px; font-weight: 700; }
      .settings-desc { font-size: 12.5px; color: var(--text-muted); margin-top: 2px; }
      .badge { background: var(--accent-soft); color: var(--accent); font-size: 12px; font-weight: 700; padding: 5px 10px; border-radius: 999px; }

      /* skeletons */
      .skeleton {
        background: linear-gradient(90deg, var(--hover) 25%, var(--border) 37%, var(--hover) 63%);
        background-size: 400% 100%; animation: shimmer 1.4s ease infinite; border-radius: 12px;
      }
      .sk-card { height: 118px; }
      .sk-chart { height: 300px; grid-column: 1 / -1; }
      .sk-row { height: 36px; margin-bottom: 10px; border-radius: 8px; }
      @keyframes shimmer { 0% { background-position: 100% 0; } 100% { background-position: 0 0; } }

      /* overlay / modal anim */
      .overlay {
        position: fixed; inset: 0; background: rgba(15,23,42,0.45); backdrop-filter: blur(2px);
        display: flex; align-items: center; justify-content: center; z-index: 100; padding: 16px;
        animation: fadeIn 0.18s ease;
      }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes popIn { from { opacity: 0; transform: scale(0.96) translateY(4px); } to { opacity: 1; transform: scale(1) translateY(0); } }

      /* responsive */
      @media (max-width: 900px) {
        .summary-grid { grid-template-columns: repeat(2, 1fr); }
      }
      @media (max-width: 768px) {
        .sidebar {
          transition: transform 0.25s cubic-bezier(.2,.8,.2,1); box-shadow: 0 0 40px rgba(0,0,0,0.2);
        }
        .sidebar-overlay { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 55; }
        .topbar { position: relative; z-index: 56; background: var(--bg); }
        .content { padding: 18px 16px 50px; }
        .hide-sm { display: none; }
      }
      @media (max-width: 560px) {
        .summary-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
        .summary-card { padding: 14px 14px; }
        .summary-value { font-size: 20px; }
        .page-row { flex-direction: column; align-items: stretch; }
        .page-row .btn { justify-content: center; }
        .toolbar { flex-direction: column; align-items: stretch; }
        .search-box { max-width: none; }
        .toolbar-right { justify-content: stretch; }
        .toolbar-right .select-btn { flex: 1; justify-content: center; }
      }
    `}</style>
  );
}