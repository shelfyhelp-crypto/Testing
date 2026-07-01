import { useState, useEffect, useCallback } from "react";

// ─── Palette & Design Tokens ──────────────────────────────────────────────
// Fresh-pantry palette: deep slate bg, warm white text, amber-gold accent,
// red-alert, green-safe. Signature: animated "days remaining" radial rings.

const COLORS = {
  bg: "#0F1117",
  surface: "#1A1D27",
  card: "#22263A",
  border: "#2E3250",
  amber: "#F59E0B",
  amberLight: "#FDE68A",
  red: "#EF4444",
  redSoft: "#7F1D1D",
  orange: "#F97316",
  green: "#22C55E",
  greenSoft: "#14532D",
  blue: "#3B82F6",
  text: "#F1F5F9",
  muted: "#94A3B8",
  white: "#FFFFFF",
};

// ─── Seed Data ────────────────────────────────────────────────────────────
const SEED_STORES = [
  { id: "s1", name: "FreshMart - Downtown", manager: "Alice Wong" },
  { id: "s2", name: "QuickBite - Airport", manager: "Carlos Rivera" },
  { id: "s3", name: "GreenTable - Eastside", manager: "Priya Nair" },
];

const CATEGORIES = ["Food Item", "Chemical", "Document", "Beverage", "Equipment Certificate", "Other"];

const today = new Date();
const addDays = (d) => { const x = new Date(today); x.setDate(x.getDate() + d); return x.toISOString().split("T")[0]; };

const SEED_ITEMS = [
  { id: "i1", storeId: "s1", name: "Cooking Oil (5L)", category: "Food Item", expiryDate: addDays(5), quantity: "12 bottles", notes: "Bulk supply", addedBy: "alice" },
  { id: "i2", storeId: "s1", name: "Food Safety Certificate", category: "Document", expiryDate: addDays(12), quantity: "1", notes: "Renewal in progress", addedBy: "alice" },
  { id: "i3", storeId: "s1", name: "Sanitizer Solution", category: "Chemical", expiryDate: addDays(25), quantity: "20L", notes: "Kitchen supply", addedBy: "alice" },
  { id: "i4", storeId: "s1", name: "Frozen Chicken Stock", category: "Food Item", expiryDate: addDays(2), quantity: "8 packs", notes: "Priority", addedBy: "alice" },
  { id: "i5", storeId: "s2", name: "Fire Suppression Certificate", category: "Document", expiryDate: addDays(8), quantity: "1", notes: "Annual inspection due", addedBy: "carlos" },
  { id: "i6", storeId: "s2", name: "Grease Trap Cleaning Log", category: "Document", expiryDate: addDays(18), quantity: "1", notes: "", addedBy: "carlos" },
  { id: "i7", storeId: "s2", name: "Industrial Degreaser", category: "Chemical", expiryDate: addDays(45), quantity: "5L", notes: "", addedBy: "carlos" },
  { id: "i8", storeId: "s3", name: "Organic Milk", category: "Beverage", expiryDate: addDays(3), quantity: "50 cartons", notes: "Daily restock", addedBy: "priya" },
  { id: "i9", storeId: "s3", name: "HACCP Compliance Doc", category: "Document", expiryDate: addDays(20), quantity: "1", notes: "", addedBy: "priya" },
  { id: "i10", storeId: "s3", name: "Pest Control Certificate", category: "Document", expiryDate: addDays(29), quantity: "1", notes: "Quarterly", addedBy: "priya" },
];

const USERS = {
  alice: { id: "alice", name: "Alice Wong", storeId: "s1", role: "user", password: "alice123" },
  carlos: { id: "carlos", name: "Carlos Rivera", storeId: "s2", role: "user", password: "carlos123" },
  priya: { id: "priya", name: "Priya Nair", storeId: "s3", role: "user", password: "priya123" },
  admin: { id: "admin", name: "Super Admin", storeId: null, role: "admin", password: "admin2024" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────
const daysUntil = (dateStr) => {
  const exp = new Date(dateStr);
  const diff = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
  return diff;
};

const urgency = (days) => {
  if (days < 0) return "expired";
  if (days <= 7) return "critical";
  if (days <= 14) return "warning";
  if (days <= 30) return "notice";
  return "safe";
};

const urgencyColor = (u) => ({
  expired: COLORS.red,
  critical: COLORS.red,
  warning: COLORS.orange,
  notice: COLORS.amber,
  safe: COLORS.green,
}[u]);

const urgencyBg = (u) => ({
  expired: "#2D0A0A",
  critical: "#2D0A0A",
  warning: "#1C0F03",
  notice: "#1C1003",
  safe: "#0A1A0A",
}[u]);

// ─── Components ───────────────────────────────────────────────────────────

function DaysRing({ days }) {
  const maxDays = 30;
  const pct = Math.max(0, Math.min(1, days / maxDays));
  const r = 22; const circ = 2 * Math.PI * r;
  const dash = circ * pct;
  const u = urgency(days);
  const color = urgencyColor(u);

  return (
    <div style={{ position: "relative", width: 56, height: 56, flexShrink: 0 }}>
      <svg width="56" height="56" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={r} fill="none" stroke={COLORS.border} strokeWidth="4" />
        <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${dash} ${circ}`} strokeDashoffset={circ * 0.25}
          strokeLinecap="round" style={{ transition: "stroke-dasharray 0.6s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: days < 0 ? 9 : 13, fontWeight: 700, color, lineHeight: 1, textAlign: "center" }}>
          {days < 0 ? "EXP" : days}
        </span>
      </div>
    </div>
  );
}

function Badge({ label, color, bg }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99,
      background: bg || "#22263A", color: color || COLORS.muted, border: `1px solid ${color || COLORS.border}`,
      letterSpacing: "0.04em", textTransform: "uppercase" }}>
      {label}
    </span>
  );
}

function ItemCard({ item, onEdit, onDelete, storeName }) {
  const days = daysUntil(item.expiryDate);
  const u = urgency(days);
  const col = urgencyColor(u);
  const bg = urgencyBg(u);

  return (
    <div style={{ background: COLORS.card, border: `1px solid ${u !== "safe" ? col + "55" : COLORS.border}`,
      borderRadius: 14, padding: "14px 16px", display: "flex", gap: 14, alignItems: "center",
      boxShadow: u === "critical" || u === "expired" ? `0 0 16px ${col}22` : "none",
      transition: "box-shadow 0.3s" }}>
      <DaysRing days={days} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: COLORS.text }}>{item.name}</span>
          <Badge label={item.category}
            color={item.category === "Chemical" ? "#A78BFA" : item.category === "Document" ? COLORS.blue : item.category === "Food Item" ? COLORS.green : COLORS.amber}
            bg={item.category === "Chemical" ? "#1E1433" : item.category === "Document" ? "#0F1F3A" : item.category === "Food Item" ? "#0A1A0A" : "#1C1003"} />
        </div>
        <div style={{ marginTop: 4, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: COLORS.muted }}>Expires: <span style={{ color: col, fontWeight: 600 }}>{item.expiryDate}</span></span>
          <span style={{ fontSize: 12, color: COLORS.muted }}>Qty: {item.quantity}</span>
          {storeName && <span style={{ fontSize: 12, color: COLORS.blue }}>📍 {storeName}</span>}
        </div>
        {item.notes && <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 3 }}>📝 {item.notes}</div>}
      </div>
      {(onEdit || onDelete) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {onEdit && <button onClick={() => onEdit(item)} style={btnSm("#1E40AF", "#3B82F620")}>Edit</button>}
          {onDelete && <button onClick={() => onDelete(item.id)} style={btnSm("#7F1D1D", "#EF444420")}>Del</button>}
        </div>
      )}
    </div>
  );
}

const btnSm = (border, bg) => ({
  background: bg, border: `1px solid ${border}`, color: COLORS.text,
  borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer"
});

function StatsBar({ items }) {
  const expired = items.filter(i => daysUntil(i.expiryDate) < 0).length;
  const critical = items.filter(i => { const d = daysUntil(i.expiryDate); return d >= 0 && d <= 7; }).length;
  const warning = items.filter(i => { const d = daysUntil(i.expiryDate); return d > 7 && d <= 14; }).length;
  const notice = items.filter(i => { const d = daysUntil(i.expiryDate); return d > 14 && d <= 30; }).length;

  const stats = [
    { label: "Expired", value: expired, color: COLORS.red },
    { label: "Critical (≤7d)", value: critical, color: COLORS.orange },
    { label: "Warning (≤14d)", value: warning, color: COLORS.amber },
    { label: "Due (≤30d)", value: notice, color: COLORS.amberLight },
    { label: "Total Tracked", value: items.length, color: COLORS.muted },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 10, marginBottom: 20 }}>
      {stats.map(s => (
        <div key={s.label} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "12px 14px" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
          <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Item Modal ───────────────────────────────────────────────────────────
function ItemModal({ item, onSave, onClose }) {
  const blank = { name: "", category: "Food Item", expiryDate: addDays(30), quantity: "", notes: "" };
  const [form, setForm] = useState(item ? { ...item } : blank);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000099", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 18, padding: 24, width: "100%", maxWidth: 440 }}>
        <h3 style={{ margin: "0 0 18px", color: COLORS.text, fontSize: 18 }}>{item ? "Edit Item" : "Add New Item"}</h3>
        {[
          { label: "Item Name *", key: "name", type: "text", placeholder: "e.g. Olive Oil 5L" },
          { label: "Expiry Date *", key: "expiryDate", type: "date" },
          { label: "Quantity", key: "quantity", type: "text", placeholder: "e.g. 12 bottles" },
          { label: "Notes", key: "notes", type: "text", placeholder: "Optional notes" },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 12, color: COLORS.muted, marginBottom: 4 }}>{f.label}</label>
            <input type={f.type} value={form[f.key]} placeholder={f.placeholder}
              onChange={e => set(f.key, e.target.value)}
              style={{ width: "100%", background: COLORS.card, border: `1px solid ${COLORS.border}`, color: COLORS.text,
                borderRadius: 8, padding: "8px 12px", fontSize: 14, boxSizing: "border-box",
                colorScheme: "dark" }} />
          </div>
        ))}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontSize: 12, color: COLORS.muted, marginBottom: 4 }}>Category *</label>
          <select value={form.category} onChange={e => set("category", e.target.value)}
            style={{ width: "100%", background: COLORS.card, border: `1px solid ${COLORS.border}`, color: COLORS.text,
              borderRadius: 8, padding: "8px 12px", fontSize: 14 }}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => { if (form.name && form.expiryDate) onSave(form); }}
            style={{ flex: 1, background: COLORS.amber, color: "#000", border: "none", borderRadius: 10, padding: "10px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
            {item ? "Save Changes" : "Add Item"}
          </button>
          <button onClick={onClose}
            style={{ flex: 1, background: COLORS.card, color: COLORS.muted, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "10px", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [showHint, setShowHint] = useState(false);

  const login = () => {
    const u = USERS[id.trim().toLowerCase()];
    if (u && u.password === pw) { setErr(""); onLogin(u); }
    else { setErr("Invalid username or password."); }
  };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', system-ui, sans-serif", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏪</div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: COLORS.text, letterSpacing: "-0.5px" }}>
            Shelf<span style={{ color: COLORS.amber }}>Guard</span>
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: COLORS.muted }}>F&B Expiry Tracking — Multi-Store</p>
        </div>

        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 18, padding: 28 }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, color: COLORS.muted, marginBottom: 5 }}>Username</label>
            <input value={id} onChange={e => setId(e.target.value)} placeholder="alice / carlos / priya / admin"
              style={{ width: "100%", background: COLORS.card, border: `1px solid ${COLORS.border}`, color: COLORS.text,
                borderRadius: 10, padding: "10px 14px", fontSize: 14, boxSizing: "border-box" }}
              onKeyDown={e => e.key === "Enter" && login()} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 12, color: COLORS.muted, marginBottom: 5 }}>Password</label>
            <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••"
              style={{ width: "100%", background: COLORS.card, border: `1px solid ${COLORS.border}`, color: COLORS.text,
                borderRadius: 10, padding: "10px 14px", fontSize: 14, boxSizing: "border-box" }}
              onKeyDown={e => e.key === "Enter" && login()} />
          </div>
          {err && <div style={{ background: "#2D0A0A", border: "1px solid #EF4444", color: "#FCA5A5", borderRadius: 8, padding: "8px 12px", fontSize: 13, marginBottom: 14 }}>{err}</div>}
          <button onClick={login} style={{ width: "100%", background: COLORS.amber, color: "#000", border: "none", borderRadius: 12, padding: "12px", fontWeight: 800, cursor: "pointer", fontSize: 15 }}>
            Sign In →
          </button>

          <button onClick={() => setShowHint(!showHint)}
            style={{ background: "none", border: "none", color: COLORS.muted, fontSize: 12, marginTop: 14, cursor: "pointer", textDecoration: "underline", display: "block", margin: "14px auto 0" }}>
            {showHint ? "Hide" : "Show"} demo credentials
          </button>
          {showHint && (
            <div style={{ marginTop: 10, background: COLORS.card, borderRadius: 10, padding: 12, fontSize: 12, color: COLORS.muted, lineHeight: 1.7 }}>
              <strong style={{ color: COLORS.text }}>Store Users:</strong><br />
              alice / alice123 — FreshMart Downtown<br />
              carlos / carlos123 — QuickBite Airport<br />
              priya / priya123 — GreenTable Eastside<br />
              <strong style={{ color: COLORS.amber }}>Super Admin:</strong><br />
              admin / admin2024
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Notification Bell ────────────────────────────────────────────────────
function NotifBell({ items }) {
  const [open, setOpen] = useState(false);
  const alerts = items.filter(i => daysUntil(i.expiryDate) <= 30).sort((a, b) => daysUntil(a.expiryDate) - daysUntil(b.expiryDate));
  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)}
        style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "8px 12px", color: COLORS.text, cursor: "pointer", position: "relative", fontSize: 18 }}>
        🔔
        {alerts.length > 0 && (
          <span style={{ position: "absolute", top: 4, right: 4, width: 16, height: 16, background: COLORS.red, borderRadius: "50%", fontSize: 10, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {alerts.length > 9 ? "9+" : alerts.length}
          </span>
        )}
      </button>
      {open && (
        <div style={{ position: "absolute", right: 0, top: 46, width: 300, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, boxShadow: "0 8px 32px #00000088", zIndex: 50, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}`, fontWeight: 700, fontSize: 13, color: COLORS.text }}>
            🔔 {alerts.length} item{alerts.length !== 1 ? "s" : ""} expiring soon
          </div>
          <div style={{ maxHeight: 300, overflowY: "auto" }}>
            {alerts.length === 0 && <div style={{ padding: 16, color: COLORS.muted, fontSize: 13 }}>All clear! No items expiring within 30 days.</div>}
            {alerts.map(i => {
              const d = daysUntil(i.expiryDate);
              const col = urgencyColor(urgency(d));
              return (
                <div key={i.id} style={{ padding: "10px 16px", borderBottom: `1px solid ${COLORS.border}20`, display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 20 }}>{d < 0 ? "💀" : d <= 7 ? "🚨" : d <= 14 ? "⚠️" : "📅"}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{i.name}</div>
                    <div style={{ fontSize: 11, color: col }}>{d < 0 ? "EXPIRED" : `${d} days left`} · {i.expiryDate}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── User Dashboard ───────────────────────────────────────────────────────
function UserDashboard({ user, items, setItems }) {
  const [modal, setModal] = useState(null); // null | "add" | item
  const [filter, setFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("All");
  const store = SEED_STORES.find(s => s.id === user.storeId);
  const myItems = items.filter(i => i.storeId === user.storeId);

  const filtered = myItems
    .filter(i => {
      const d = daysUntil(i.expiryDate);
      if (filter === "expired") return d < 0;
      if (filter === "critical") return d >= 0 && d <= 7;
      if (filter === "warning") return d > 7 && d <= 30;
      return true;
    })
    .filter(i => catFilter === "All" || i.category === catFilter)
    .sort((a, b) => daysUntil(a.expiryDate) - daysUntil(b.expiryDate));

  const saveItem = (form) => {
    if (modal === "add") {
      setItems(prev => [...prev, { ...form, id: "i" + Date.now(), storeId: user.storeId, addedBy: user.id }]);
    } else {
      setItems(prev => prev.map(i => i.id === form.id ? form : i));
    }
    setModal(null);
  };

  const deleteItem = (id) => setItems(prev => prev.filter(i => i.id !== id));

  return (
    <div>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, color: COLORS.text }}>{store?.name}</h2>
          <p style={{ margin: "2px 0 0", color: COLORS.muted, fontSize: 13 }}>Manager: {store?.manager}</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <NotifBell items={myItems} />
          <button onClick={() => setModal("add")}
            style={{ background: COLORS.amber, color: "#000", border: "none", borderRadius: 10, padding: "8px 16px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
            + Add Item
          </button>
        </div>
      </div>

      <StatsBar items={myItems} />

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        {[["all", "All"], ["expired", "🚫 Expired"], ["critical", "🚨 Critical (≤7d)"], ["warning", "⚠️ Due (≤30d)"]].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            style={{ background: filter === v ? COLORS.amber : COLORS.card, color: filter === v ? "#000" : COLORS.muted,
              border: `1px solid ${filter === v ? COLORS.amber : COLORS.border}`, borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            {l}
          </button>
        ))}
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, color: COLORS.muted, borderRadius: 8, padding: "5px 10px", fontSize: 12 }}>
          {["All", ...CATEGORIES].map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Item list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.length === 0 && <div style={{ textAlign: "center", color: COLORS.muted, padding: 40, background: COLORS.card, borderRadius: 14 }}>No items match this filter.</div>}
        {filtered.map(item => (
          <ItemCard key={item.id} item={item} onEdit={i => setModal(i)} onDelete={deleteItem} />
        ))}
      </div>

      {modal && <ItemModal item={modal === "add" ? null : modal} onSave={saveItem} onClose={() => setModal(null)} />}
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────
function AdminDashboard({ items, setItems }) {
  const [storeFilter, setStoreFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("overview");

  const filtered = items
    .filter(i => storeFilter === "all" || i.storeId === storeFilter)
    .filter(i => {
      const d = daysUntil(i.expiryDate);
      if (urgencyFilter === "expired") return d < 0;
      if (urgencyFilter === "critical") return d >= 0 && d <= 7;
      if (urgencyFilter === "warning") return d > 7 && d <= 30;
      return true;
    })
    .filter(i => catFilter === "All" || i.category === catFilter)
    .sort((a, b) => daysUntil(a.expiryDate) - daysUntil(b.expiryDate));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, color: COLORS.text }}>
            <span style={{ color: COLORS.amber }}>⚡ Super Admin</span> — All Stores
          </h2>
          <p style={{ margin: "2px 0 0", color: COLORS.muted, fontSize: 13 }}>{SEED_STORES.length} stores · {items.length} items tracked</p>
        </div>
        <NotifBell items={items} />
      </div>

      {/* Tab nav */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: COLORS.card, borderRadius: 12, padding: 4, width: "fit-content" }}>
        {[["overview", "📊 Overview"], ["items", "📋 All Items"], ["stores", "🏪 By Store"]].map(([v, l]) => (
          <button key={v} onClick={() => setActiveTab(v)}
            style={{ background: activeTab === v ? COLORS.amber : "none", color: activeTab === v ? "#000" : COLORS.muted,
              border: "none", borderRadius: 9, padding: "7px 14px", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
            {l}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div>
          <StatsBar items={items} />
          <h3 style={{ color: COLORS.text, fontSize: 15, margin: "0 0 12px" }}>🚨 Most Urgent Items (All Stores)</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {items.filter(i => daysUntil(i.expiryDate) <= 14).sort((a, b) => daysUntil(a.expiryDate) - daysUntil(b.expiryDate)).slice(0, 8).map(item => {
              const store = SEED_STORES.find(s => s.id === item.storeId);
              return <ItemCard key={item.id} item={item} storeName={store?.name} />;
            })}
            {items.filter(i => daysUntil(i.expiryDate) <= 14).length === 0 && (
              <div style={{ textAlign: "center", color: COLORS.green, padding: 30, background: COLORS.card, borderRadius: 14 }}>
                ✅ No critical or warning items across all stores!
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "items" && (
        <div>
          {/* Filters */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            <select value={storeFilter} onChange={e => setStoreFilter(e.target.value)}
              style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, color: COLORS.text, borderRadius: 8, padding: "6px 10px", fontSize: 12 }}>
              <option value="all">All Stores</option>
              {SEED_STORES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select value={urgencyFilter} onChange={e => setUrgencyFilter(e.target.value)}
              style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, color: COLORS.text, borderRadius: 8, padding: "6px 10px", fontSize: 12 }}>
              <option value="all">All Urgency</option>
              <option value="expired">Expired</option>
              <option value="critical">Critical (≤7d)</option>
              <option value="warning">Due (≤30d)</option>
            </select>
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
              style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, color: COLORS.text, borderRadius: 8, padding: "6px 10px", fontSize: 12 }}>
              {["All", ...CATEGORIES].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 10 }}>{filtered.length} items found</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map(item => {
              const store = SEED_STORES.find(s => s.id === item.storeId);
              return <ItemCard key={item.id} item={item} storeName={store?.name} />;
            })}
          </div>
        </div>
      )}

      {activeTab === "stores" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {SEED_STORES.map(store => {
            const storeItems = items.filter(i => i.storeId === store.id);
            const urgent = storeItems.filter(i => daysUntil(i.expiryDate) <= 14).length;
            return (
              <div key={store.id}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "10px 16px", flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, color: COLORS.text }}>{store.name}</div>
                      <div style={{ fontSize: 12, color: COLORS.muted }}>Manager: {store.manager}</div>
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.amber }}>{storeItems.length}</div>
                        <div style={{ fontSize: 10, color: COLORS.muted }}>Items</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: urgent > 0 ? COLORS.red : COLORS.green }}>{urgent}</div>
                        <div style={{ fontSize: 10, color: COLORS.muted }}>Urgent</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {storeItems.sort((a, b) => daysUntil(a.expiryDate) - daysUntil(b.expiryDate)).map(item => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState(SEED_ITEMS);

  if (!user) return <LoginScreen onLogin={setUser} />;

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, fontFamily: "'Inter', system-ui, sans-serif", color: COLORS.text }}>
      {/* Header */}
      <div style={{ background: COLORS.surface, borderBottom: `1px solid ${COLORS.border}`, padding: "0 20px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>🏪</span>
            <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.3px" }}>
              Shelf<span style={{ color: COLORS.amber }}>Guard</span>
            </span>
            {user.role === "admin" && <Badge label="Super Admin" color={COLORS.amber} bg="#1C1003" />}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, color: COLORS.muted }}>👤 {user.name}</span>
            <button onClick={() => setUser(null)}
              style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, color: COLORS.muted, borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontSize: 12 }}>
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px 48px" }}>
        {user.role === "admin"
          ? <AdminDashboard items={items} setItems={setItems} />
          : <UserDashboard user={user} items={items} setItems={setItems} />
        }
      </div>
    </div>
  );
}
