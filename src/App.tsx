import { ArrowLeft, ChevronDown, RotateCcw, Scale, Search, Trash2, Plus } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { tools } from './config/tools.config'

type Currency = '₴' | '$' | '€' | '£' | ''
type Unit = 'g' | 'kg' | 'ml' | 'L' | 'pcs' | 'pack'
type Item = { id: string; name: string; price: string; quantity: string; unit: Unit }
type Baseline = 'large' | 'small'
const storageKey = 'tools.unit-price-comparator.v1'
const currencyKey = 'tools.currency.v1'
const blank = (): Item => ({ id: crypto.randomUUID(), name: '', price: '', quantity: '', unit: 'g' })
const initialItems = () => [blank(), blank()]

function load<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) ?? '') as T } catch { return fallback }
}

function unitFamily(unit: Unit) { return unit === 'g' || unit === 'kg' ? 'weight' : unit === 'ml' || unit === 'L' ? 'volume' : 'count' }
function normalizedQuantity(quantity: number, unit: Unit) {
  if (unit === 'kg' || unit === 'L') return quantity
  if (unit === 'g' || unit === 'ml') return quantity / 1000
  return quantity
}
function unitLabel(unit: Unit, baseline: Baseline) {
  const family = unitFamily(unit)
  if (family === 'count') return 'unit'
  if (baseline === 'small') return family === 'weight' ? '100 g' : '100 ml'
  return family === 'weight' ? 'kg' : 'L'
}
function money(value: number, currency: Currency) {
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}${currency ? ` ${currency}` : ''}`
}

function App() {
  const [path, setPath] = useState(window.location.pathname)
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  const navigate = (to: string) => { history.pushState({}, '', to); setPath(to); window.scrollTo(0, 0) }
  return path === '/tools/unit-price-comparator'
    ? <Comparator onBack={() => navigate('/')} />
    : <Catalog onOpen={() => navigate('/tools/unit-price-comparator')} />
}

function Shell({ children }: { children: ReactNode }) { return <main className="mx-auto min-h-dvh max-w-4xl px-4 pb-28 pt-5 sm:px-6">{children}</main> }

function Catalog({ onOpen }: { onOpen: () => void }) {
  const [query, setQuery] = useState('')
  const matches = tools.filter((tool) => `${tool.title} ${tool.description} ${tool.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase()))
  return <Shell>
    <header className="mb-8 flex items-center gap-3"><div className="grid size-12 place-items-center rounded-2xl bg-teal-700 text-white"><Scale size={25} /></div><div><h1 className="text-xl font-bold tracking-tight">Everyday tools</h1><p className="text-sm text-slate-500">Fast, private, works offline.</p></div></header>
    <label className="relative mb-6 block"><Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20}/><input value={query} onChange={(e) => setQuery(e.target.value)} className="field pl-12" placeholder="Search tools" aria-label="Search tools" /></label>
    <p className="mb-3 text-sm font-semibold text-slate-500">TOOLS</p>
    <section className="grid gap-3 sm:grid-cols-2">{matches.map((tool) => <button key={tool.id} onClick={onOpen} className="card flex min-h-32 items-start gap-4 p-5 text-left transition hover:border-teal-300 hover:shadow-sm"><div className="grid size-12 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700"><Scale size={24}/></div><div><h2 className="font-bold">{tool.title}</h2><p className="mt-1 text-sm leading-5 text-slate-500">{tool.description}</p><div className="mt-3 flex gap-2">{tool.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}</div></div></button>)}</section>
    {!matches.length && <p className="py-12 text-center text-slate-500">No matching tools yet.</p>}
  </Shell>
}

function Comparator({ onBack }: { onBack: () => void }) {
  const [saved] = useState(() => load<{ items: Item[]; baseline: Baseline }>(storageKey, { items: initialItems(), baseline: 'large' }))
  const [items, setItems] = useState(saved.items.length ? saved.items : initialItems())
  const [baseline, setBaseline] = useState<Baseline>(saved.baseline)
  const [currency, setCurrency] = useState<Currency>(() => load<Currency>(currencyKey, '₴'))
  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify({ items, baseline })) }, [items, baseline])
  useEffect(() => { localStorage.setItem(currencyKey, JSON.stringify(currency)) }, [currency])
  const calculations = useMemo(() => items.map((item) => {
    const price = Number(item.price); const quantity = Number(item.quantity)
    const baseQuantity = normalizedQuantity(quantity, item.unit)
    const multiplier = unitFamily(item.unit) === 'count' || baseline === 'large' ? 1 : 0.1
    const value = price > 0 && baseQuantity > 0 ? price / baseQuantity * multiplier : null
    return { value, label: unitLabel(item.unit, baseline), family: unitFamily(item.unit) }
  }), [items, baseline])
  const bestByFamily = useMemo(() => Object.fromEntries(['weight', 'volume', 'count'].map((family) => [family, Math.min(...calculations.filter((v) => v.family === family && v.value !== null).map((v) => v.value!))])), [calculations]) as Record<string, number>
  const update = (id: string, patch: Partial<Item>) => setItems((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item))
  const clear = () => { setItems(initialItems()); setBaseline('large') }
  return <Shell>
    <header className="mb-5 flex items-center justify-between gap-3"><button onClick={onBack} className="icon-button" aria-label="Back to tools"><ArrowLeft size={22}/></button><h1 className="flex-1 text-center text-lg font-bold">Unit Price Comparator</h1><CurrencyMenu value={currency} onChange={setCurrency}/></header>
    <section className="card mb-5 p-4"><p className="mb-3 text-sm font-semibold">Normalization baseline</p><div className="segmented"><button className={baseline === 'large' ? 'active' : ''} onClick={() => setBaseline('large')}>Per 1 kg / L</button><button className={baseline === 'small' ? 'active' : ''} onClick={() => setBaseline('small')}>Per 100 g / ml</button></div></section>
    <div className="space-y-4">{items.map((item, index) => { const calc = calculations[index]; const best = calc.value !== null && calc.value === bestByFamily[calc.family]; const delta = calc.value && bestByFamily[calc.family] ? (calc.value / bestByFamily[calc.family] - 1) * 100 : 0; return <article key={item.id} className={`card p-4 ${best ? 'border-emerald-400 ring-1 ring-emerald-200' : ''}`}><div className="mb-4 flex items-center justify-between gap-2"><div><p className="font-bold">{item.name.trim() || `Item ${index + 1}`}</p>{best && <span className="best-badge">Best Value</span>}{!best && calc.value !== null && delta > 0.05 && <span className="text-sm font-medium text-amber-700">+{delta.toFixed(1)}% more expensive</span>}</div><button onClick={() => setItems((list) => list.filter((entry) => entry.id !== item.id))} disabled={items.length <= 2} className="icon-button text-slate-400 disabled:cursor-not-allowed disabled:opacity-30" aria-label={`Remove item ${index + 1}`}><Trash2 size={20}/></button></div><div className="grid gap-3 sm:grid-cols-2"><Field label="Name (optional)"><input className="field" value={item.name} onChange={(e) => update(item.id, { name: e.target.value })} placeholder={`Item ${index + 1}`} /></Field><Field label={`Price${currency ? ` (${currency})` : ''}`}><input className="field" type="number" min="0" step="any" inputMode="decimal" value={item.price} onChange={(e) => update(item.id, { price: e.target.value })} placeholder="0.00" /></Field></div><div className="mt-3 grid grid-cols-[1fr_110px] gap-3"><Field label="Quantity"><input className="field" type="number" min="0" step="any" inputMode="decimal" value={item.quantity} onChange={(e) => update(item.id, { quantity: e.target.value })} placeholder="0" /></Field><Field label="Unit"><select className="field" value={item.unit} onChange={(e) => update(item.id, { unit: e.target.value as Unit })}>{(['g', 'kg', 'ml', 'L', 'pcs', 'pack'] as Unit[]).map((unit) => <option key={unit}>{unit}</option>)}</select></Field></div>{calc.value !== null && <p className="mt-4 border-t border-slate-100 pt-3 text-sm text-slate-600">Normalized: <strong className="text-slate-900">{money(calc.value, currency)} / {calc.label}</strong></p>}</article>})}</div>
    <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 p-3 backdrop-blur"><div className="mx-auto flex max-w-4xl gap-3 px-1"><button onClick={() => setItems((list) => list.length < 10 ? [...list, blank()] : list)} disabled={items.length >= 10} className="primary-button flex-1 disabled:opacity-50"><Plus size={20}/> Add item</button><button onClick={clear} className="secondary-button"><RotateCcw size={20}/><span className="hidden sm:inline">Clear all</span></button></div></div>
  </Shell>
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block text-sm font-medium text-slate-700"><span className="mb-1.5 block">{label}</span>{children}</label> }
function CurrencyMenu({ value, onChange }: { value: Currency; onChange: (value: Currency) => void }) { return <label className="relative"><span className="sr-only">Currency</span><select className="h-12 appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 font-semibold" value={value} onChange={(e) => onChange(e.target.value as Currency)}>{(['₴', '$', '€', '£', ''] as Currency[]).map((entry) => <option value={entry} key={entry || 'none'}>{entry || 'None'}</option>)}</select><ChevronDown className="pointer-events-none absolute right-2 top-3" size={16}/></label> }

export default App
