import React, { useState, useMemo, useCallback } from "react";
import {
 LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
 Tooltip, Legend, ResponsiveContainer, ReferenceLine, AreaChart, Area,
 RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
 ScatterChart, Scatter, ZAxis,
} from "recharts";
import {
 calcular, ZONAS_SISMICAS, TIPOS_SUELO,
 CATEGORIAS_USO, SISTEMAS_ESTRUCTURALES,
 CARGAS_VIVAS_E020, CARGAS_MUERTAS_TIPICAS,
} from "./engine.js";
import {
 SvgViga, SvgColumna, SvgLosa, SvgZapata, SvgPlaca, SvgEscalera,
 SvgPlantaEjes,
} from "./svgFigures.jsx";
import { exportarPDF } from "./exportPDF.js";
import { exportarExcel } from "./exportExcel.js";
import { exportarWord } from "./exportWord.js";
import { exportarPPTX } from "./exportPPTX.js";

// ════════════════════════════════════════════════════════════
// PALETA
// ════════════════════════════════════════════════════════════
const C = {
 primary:"#1E40AF", primaryDk:"#1E3A8A", secondary:"#3B82F6",
 accent:"#0EA5E9", bg:"#F8FAFC", bgPanel:"#FFFFFF", bgInput:"#F1F5F9",
 border:"#E2E8F0", borderHl:"#CBD5E0", text:"#0F172A", textSec:"#475569", textMute:"#94A3B8",
 green:"#059669", greenBg:"#D1FAE5", red:"#DC2626", redBg:"#FEE2E2",
 orange:"#EA580C", orangeBg:"#FED7AA", yellow:"#CA8A04", yellowBg:"#FEF3C7",
 purple:"#7C3AED", purpleBg:"#EDE9FE", lblue:"#DBEAFE",
};

// ════════════════════════════════════════════════════════════
// COMPONENTES BASE
// ════════════════════════════════════════════════════════════
function Badge({ ok, text }) {
 return (
 <span style={{
 display:"inline-flex", alignItems:"center", gap:4,
 background: ok ? C.greenBg : C.redBg, color: ok ? C.green : C.red,
 padding:"3px 10px", borderRadius:14, fontSize:11, fontWeight:600,
 }}>
 {ok ? "✓" : "✗"} {text || (ok ? "Cumple" : "Revisar")}
 </span>
 );
}

function Card({ title, subtitle, children, accent=C.primary, icon, action }) {
 return (
 <div style={{
 background: C.bgPanel, borderRadius:10, border:`1px solid ${C.border}`,
 boxShadow:"0 1px 3px rgba(0,0,0,0.04)", overflow:"hidden", marginBottom:12,
 }}>
 <div style={{
 padding:"10px 14px", borderBottom:`1px solid ${C.border}`, background:"#FAFBFD",
 display:"flex", alignItems:"center", justifyContent:"space-between",
 }}>
 <div style={{display:"flex", alignItems:"center", gap:8}}>
 {icon && <span style={{fontSize:14}}>{icon}</span>}
 <div>
 <div style={{fontSize:13, fontWeight:700, color:accent, letterSpacing:0.2}}>{title}</div>
 {subtitle && <div style={{fontSize:10.5, color:C.textMute, marginTop:1}}>{subtitle}</div>}
 </div>
 </div>
 {action}
 </div>
 <div style={{padding:"12px 14px"}}>{children}</div>
 </div>
 );
}

function Row({ label, value, unit, hi, ok, norma }) {
 return (
 <div style={{
 display:"flex", justifyContent:"space-between", alignItems:"center",
 padding:"6px 0", borderBottom:`1px solid ${C.border}`,
 background: hi ? "#F8FAFF" : "transparent",
 }}>
 <span style={{fontSize:11.5, color:C.textSec, flex:1}}>
 {label}
 {norma && <span style={{fontSize:9.5, color:C.textMute, marginLeft:5, fontStyle:"italic"}}>({norma})</span>}
 </span>
 <span style={{fontSize:11.5, fontWeight:700, color:C.primary, display:"flex", alignItems:"center", gap:6}}>
 {typeof value==="number" ? value.toFixed(3) : value}
 {unit && <span style={{fontWeight:400, color:C.textMute, fontSize:10.5}}>{unit}</span>}
 {ok !== undefined && <Badge ok={ok}/>}
 </span>
 </div>
 );
}

function Slider({ label, min, max, step, value, onChange, unit, fmt, hint, locked, onReset }) {
 return (
 <div style={{marginBottom:10, opacity: locked ? 0.6 : 1}}>
 <div style={{display:"flex", justifyContent:"space-between", marginBottom:4}}>
 <span style={{fontSize:11.5, color:C.textSec, fontWeight:600}}>{label}</span>
 <div style={{display:"flex", alignItems:"center", gap:4}}>
 <input type="number" value={value} step={step} min={min} max={max}
 onChange={e=>{ const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(v); }}
 disabled={locked}
 style={{
 width:64, padding:"3px 6px", borderRadius:5, border:`1px solid ${C.border}`,
 fontSize:11, fontWeight:700, color:C.primary, background:locked?C.bgInput:"#fff",
 textAlign:"right", fontFamily:"Inter,Arial",
 }}/>
 {unit && <span style={{fontSize:10.5, color:C.textMute}}>{unit}</span>}
 {onReset && (
 <button onClick={onReset} title="Restaurar"
 style={{background:"transparent", border:"none", padding:"2px 4px",
 fontSize:10, color:C.textMute, cursor:"pointer"}}>↺</button>
 )}
 </div>
 </div>
 <input type="range" min={min} max={max} step={step} value={value}
 onChange={e=>onChange(Number(e.target.value))} disabled={locked}/>
 {hint && <div style={{fontSize:10, color:C.textMute, marginTop:3, fontStyle:"italic"}}>{hint}</div>}
 </div>
 );
}

function Select({ label, value, options, onChange, hint }) {
 return (
 <div style={{marginBottom:10}}>
 <div style={{fontSize:11.5, color:C.textSec, fontWeight:600, marginBottom:4}}>{label}</div>
 <select value={value} onChange={e=>onChange(e.target.value)}
 style={{
 width:"100%", padding:"6px 10px", borderRadius:5, border:`1px solid ${C.border}`,
 fontSize:11.5, color:C.text, background:"#fff", cursor:"pointer", fontFamily:"Inter,Arial",
 }}>
 {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
 </select>
 {hint && <div style={{fontSize:10, color:C.textMute, marginTop:3, fontStyle:"italic"}}>{hint}</div>}
 </div>
 );
}

function Section({ title, icon, color=C.primary, children, defaultOpen=true }) {
 const [open, setOpen] = useState(defaultOpen);
 return (
 <div style={{marginBottom:12, border:`1px solid ${C.border}`, borderRadius:8, overflow:"hidden", background:"#fff"}}>
 <button onClick={()=>setOpen(!open)} style={{
 width:"100%", padding:"8px 12px", border:"none",
 background: open ? "#F1F5F9" : "#F8FAFC", borderLeft:`3px solid ${color}`,
 display:"flex", alignItems:"center", justifyContent:"space-between",
 cursor:"pointer", fontFamily:"Inter,Arial",
 }}>
 <span style={{fontSize:11, fontWeight:700, color:C.text, letterSpacing:0.3, textTransform:"uppercase"}}>
 {icon} {title}
 </span>
 <span style={{fontSize:10, color:C.textMute}}>{open?"▲":"▼"}</span>
 </button>
 {open && <div style={{padding:"12px 12px 6px"}} className="fade-in">{children}</div>}
 </div>
 );
}

// ════════════════════════════════════════════════════════════
// EJES · editor de separaciones
// ════════════════════════════════════════════════════════════
function EditorEjes({ direccion, ejes, onChange, color=C.primary }) {
 const addEje = () => onChange([...ejes, 5.0]);
 const delEje = (idx) => {
 if (ejes.length <= 1) return;
 onChange(ejes.filter((_,i) => i !== idx));
 };
 const updEje = (idx, v) => {
 const ne = [...ejes];
 ne[idx] = v;
 onChange(ne);
 };
 const total = ejes.reduce((a,b)=>a+b, 0);
 const dirLabel = direccion === "X" ? "X (A → B → C...)" : "Y (1 → 2 → 3...)";

 return (
 <div style={{marginBottom:14}}>
 <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8}}>
 <span style={{fontSize:11.5, fontWeight:700, color, textTransform:"uppercase", letterSpacing:0.3}}>
 Eje {dirLabel}
 </span>
 <span style={{fontSize:11, color:C.textSec}}>
 {ejes.length+1} ejes / {ejes.length} vanos · L<sub>{direccion}</sub>=<b>{total.toFixed(2)} m</b>
 </span>
 </div>
 <div style={{
 background:C.bgInput, border:`1px solid ${C.border}`, borderRadius:6,
 padding:8, maxHeight:200, overflowY:"auto",
 }}>
 {ejes.map((e, i) => {
 const nLabel = direccion === "X"
 ? `${String.fromCharCode(65+i)} → ${String.fromCharCode(66+i)}`
 : `${i+1} → ${i+2}`;
 return (
 <div key={i} style={{display:"flex", alignItems:"center", gap:6, marginBottom:5}}>
 <span style={{
 fontSize:10.5, color:C.textSec, minWidth:60,
 fontFamily:"monospace", fontWeight:600,
 }}>{nLabel}</span>
 <input
 type="number" step={0.05} min={1.0} max={12.0} value={e}
 onChange={ev => updEje(i, parseFloat(ev.target.value) || 0)}
 style={{
 flex:1, padding:"4px 6px", borderRadius:4, border:`1px solid ${C.border}`,
 fontSize:11, color:C.primary, fontWeight:600, textAlign:"right",
 background:"#fff",
 }}/>
 <span style={{fontSize:10, color:C.textMute, width:14}}>m</span>
 {ejes.length > 1 && (
 <button onClick={()=>delEje(i)} title="Eliminar este vano"
 style={{
 background:C.redBg, color:C.red, border:`1px solid ${C.red}`,
 borderRadius:4, padding:"1px 6px", fontSize:11, cursor:"pointer",
 fontWeight:700, lineHeight:1,
 }}>−</button>
 )}
 </div>
 );
 })}
 <button onClick={addEje} style={{
 width:"100%", padding:"5px", marginTop:4, background:"transparent",
 color, border:`1px dashed ${color}`, borderRadius:4,
 fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"Inter,Arial",
 }}>+ Agregar eje</button>
 </div>
 </div>
 );
}

// ════════════════════════════════════════════════════════════
// APP PRINCIPAL
// ════════════════════════════════════════════════════════════
export default function App() {
 const [fase, setFase] = useState(1);
 const [tab, setTab] = useState("plano");

 const [params, setParams] = useState({
 proyecto: "Edificio Multifamiliar",
 descripcion: "Edificio de concreto armado",
 ubicacion: "Lima, Perú",
 hpiso: 3.00, N: 5,
 // Alturas variables por piso (vacío = usar hpiso constante)
 alturas: [3.0, 3.0, 3.0, 3.0, 3.0],
 // Uso del edificio (CV por E.020)
 usoEdificio: "vivienda",
 // Cargas muertas seleccionadas (acabados, tabiquería, etc.)
 cargasMuertas: [
 {id:"piso_ceramico", peso:100, activa:true},
 {id:"tab_ladrillo", peso:150, activa:true},
 {id:"cielo_yeso", peso:30, activa:true},
 {id:"instalaciones", peso:20, activa:true},
 ],
 // Análisis sísmico (opcional · desactivar para curso de concreto puro)
 incluirSismo: false,
 fc: 280, fy: 4200,
 qcm: 0.28, qcv: 0.20, qcvCorr: 0.40,
 qadm: 25.0, Df: 1.50, gs: 1.80,
 zonaSismica: 4, sueloId: "S2",
 categoriaId: "B", sistemaId: "dual",
 ejesX: [5.0, 6.0, 5.5, 4.5],
 ejesY: [4.5, 5.0, 4.5],
 nPlacas_x: 2, nPlacas_y: 2,
 tw_placa: 0.25, Lw_placa: 5.0,
 h_al_user: 0, h_mac_user: 0,
 h_vp_user: 0, b_vp_user: 0, h_vs_user: 0, b_vs_user: 0,
 b_col_user: 0, n_cp_user: 0, paso_user: 0,
 L_zap_C_user: 0, hz_zap_C_user: 0,
 L_zap_PX_user: 0, hz_zap_PX_user: 0,
 L_zap_PY_user: 0, hz_zap_PY_user: 0,
 L_zap_E_user: 0, hz_zap_E_user: 0,
 });

 const set = useCallback((k, v) => {
 setParams(prev => {
 const np = {...prev, [k]: v};
 // Si cambia N, ajustar el array de alturas
 if (k === "N") {
 const cur = prev.alturas || [];
 const def = prev.hpiso || 3.0;
 if (v > cur.length) {
 np.alturas = [...cur, ...Array(v-cur.length).fill(def)];
 } else if (v < cur.length) {
 np.alturas = cur.slice(0, v);
 }
 }
 // Si cambia uso, actualizar qcv automáticamente
 if (k === "usoEdificio") {
 const uso = CARGAS_VIVAS_E020.find(u=>u.id===v);
 if (uso) {
 np.qcv = uso.cv / 1000;
 np.qcvCorr = uso.cv_corr / 1000;
 }
 }
 // Si cambian cargas muertas, recalcular qcm
 if (k === "cargasMuertas") {
 const total = (v || []).filter(c=>c.activa).reduce((a,c)=>a+c.peso, 0);
 np.qcm = total / 1000;
 }
 return np;
 });
 }, []);
 const reset = useCallback((k) => setParams(p => ({...p, [k]: 0})), []);

 const r = useMemo(() => calcular(params), [params]);

 const verifs = [
 {label:"Losa cortante", ok:r.losa_ok, tab:"losas"},
 {label:"Losa deflexión", ok:r.defl_al_ok, tab:"losas"},
 {label:"Viga principal cortante", ok:r.cort_vp_ok, tab:"vigas"},
 {label:"Viga principal flexión", ok:r.flex_vp_ok, tab:"vigas"},
 {label:"Cuantía esquinera", ok:r.rho_esq >= 0.01, tab:"columnas"},
 {label:"Esbeltez columna", ok:r.esb_ok, tab:"columnas"},
 {label:"Placa cortante", ok:r.placa_ok, tab:"placas"},
 {label:"Deriva entrepiso", ok:r.deriva_ok, tab:"placas"},
 {label:"Geometría Blondel", ok:r.blon_ok, tab:"escaleras"},
 {label:"Punz. Zap. Central", ok:r.zap_C.punz_ok, tab:"zapatas"},
 {label:"Punz. Zap. Perim. X", ok:r.zap_PX.punz_ok, tab:"zapatas"},
 {label:"Punz. Zap. Perim. Y", ok:r.zap_PY.punz_ok, tab:"zapatas"},
 {label:"Punz. Zap. Esquinera", ok:r.zap_E.punz_ok, tab:"zapatas"},
 ];
 const todoOK = verifs.every(v=>v.ok);
 const verifsPendientes = verifs.filter(v=>!v.ok);

 const TABS = [
 {id:"general", label:"Datos Generales", icon:"01"},
 {id:"metrado", label:"Metrado E.020", icon:"02"},
 {id:"plano", label:"Plano y Ejes", icon:"03"},
 {id:"sismico", label:"Análisis Sísmico", icon:"04"},
 {id:"losas", label:"Losas", icon:"05"},
 {id:"vigas", label:"Vigas", icon:"06"},
 {id:"columnas", label:"Columnas", icon:"07"},
 {id:"placas", label:"Placas y Derivas", icon:"08"},
 {id:"escaleras", label:"Escaleras", icon:"09"},
 {id:"zapatas", label:"Zapatas", icon:"10"},
 {id:"resumen", label:"Resumen", icon:"11"},
 ];

 return (
 <div style={{fontFamily:"Inter,'Segoe UI',Arial,sans-serif", background:C.bg, minHeight:"100vh", color:C.text}}>

 {/* ═══════════ HEADER ═══════════ */}
 <header style={{
 background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryDk} 100%)`,
 color: "#fff", padding: "12px 24px",
 boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
 }}>
 <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12}}>
 <div style={{display:"flex", alignItems:"center", gap:14}}>
 <div style={{
 width:42, height:42, background:"rgba(255,255,255,0.15)", borderRadius:8,
 display:"flex", alignItems:"center", justifyContent:"center", fontSize:22,
 border:"1px solid rgba(255,255,255,0.2)",
 }}>🏗</div>
 <div>
 <div style={{fontSize:16, fontWeight:800, letterSpacing:0.3}}>
 ANÁLISIS ESTRUCTURAL · Plataforma Profesional v12
 </div>
 <div style={{fontSize:11, opacity:0.85, marginTop:2}}>
 NTE E.020-2006 · E.030-2018 · E.060-2009 · ACI 318-19 · CIRSOC 201
 </div>
 </div>
 </div>

 <div style={{display:"flex", gap:0, alignItems:"center", background:"rgba(255,255,255,0.1)", padding:3, borderRadius:8}}>
 <button onClick={()=>setFase(1)} style={{
 padding:"8px 18px", border:"none", borderRadius:6,
 background: fase===1 ? "#fff" : "transparent",
 color: fase===1 ? C.primary : "#fff", fontSize:12, fontWeight:700,
 cursor:"pointer", fontFamily:"Inter,Arial",
 }}>FASE 1 · PREDIMENSIONAMIENTO</button>
 <button
 onClick={()=> todoOK && setFase(2)} disabled={!todoOK}
 title={todoOK ? "Continuar a diseño detallado" : `Faltan ${verifsPendientes.length}: ${verifsPendientes.map(v=>v.label).join(", ")}`}
 style={{
 padding:"8px 18px", border:"none", borderRadius:6,
 background: fase===2 ? "#fff" : "transparent",
 color: fase===2 ? C.primary : (todoOK?"#fff":"rgba(255,255,255,0.45)"),
 fontSize:12, fontWeight:700,
 cursor: todoOK ? "pointer" : "not-allowed", fontFamily:"Inter,Arial",
 }}>
 FASE 2 · DISEÑO {todoOK ? "" : `🔒(${verifsPendientes.length})`}
 </button>
 </div>

 <div style={{display:"flex", gap:6}}>
 <button onClick={()=>exportarExcel(params, r)} style={btnStyle(C.green)}>Excel</button>
 <button onClick={()=>exportarWord(params, r, fase===2)} style={btnStyle("#2B579A")}>Word</button>
 <button onClick={()=>exportarPDF(params, r, fase===2)} style={btnStyle(C.red)}>PDF</button>
 <button onClick={()=>exportarPPTX(params, r, fase===2)} style={btnStyle("#D24726")}>PPTX</button>
 </div>
 </div>

 <div style={{display:"flex", gap:8, marginTop:10, flexWrap:"wrap", alignItems:"center", fontSize:11}}>
 <span style={{opacity:0.85, fontWeight:600}}>
 📍 {params.proyecto} · {params.ubicacion} · Zona {r.zona.id} (Z={r.Z}) · {r.suelo.id} · Cat. {r.categoria.id} · {r.sistema.desc}
 </span>
 </div>
 </header>

 {fase === 1 && (
 <div style={{display:"grid", gridTemplateColumns:"340px 1fr", minHeight:"calc(100vh - 116px)"}}>
 <aside style={{
 background:"#fff", borderRight:`1px solid ${C.border}`,
 padding:16, overflowY:"auto", maxHeight:"calc(100vh - 116px)",
 }}>
 <div style={{marginBottom:14, paddingBottom:10, borderBottom:`1px solid ${C.border}`}}>
 <div style={{fontSize:10, fontWeight:700, color:C.textMute, letterSpacing:1.5, textTransform:"uppercase"}}>
 Parámetros del Proyecto
 </div>
 </div>

 <Section title="Identificación" icon="📋" color={C.primary}>
 <div style={{marginBottom:10}}>
 <div style={{fontSize:11, color:C.textSec, fontWeight:600, marginBottom:4}}>Proyecto</div>
 <input type="text" value={params.proyecto} onChange={e=>set("proyecto",e.target.value)}
 style={{width:"100%", padding:"6px 10px", borderRadius:5, border:`1px solid ${C.border}`,
 fontSize:11.5, background:"#fff", fontFamily:"Inter,Arial"}}/>
 </div>
 <div style={{marginBottom:10}}>
 <div style={{fontSize:11, color:C.textSec, fontWeight:600, marginBottom:4}}>Ubicación</div>
 <input type="text" value={params.ubicacion} onChange={e=>set("ubicacion",e.target.value)}
 style={{width:"100%", padding:"6px 10px", borderRadius:5, border:`1px solid ${C.border}`,
 fontSize:11.5, background:"#fff", fontFamily:"Inter,Arial"}}/>
 </div>
 </Section>

 <Section title="Geometría y Ejes" icon="📐" color={C.primary}>
 <Slider label="Altura entrepiso" min={2.40} max={5.00} step={0.05}
 value={params.hpiso} onChange={v=>set("hpiso",v)} unit="m" fmt={v=>v.toFixed(2)}/>
 <Slider label="N° de pisos" min={1} max={20} step={1}
 value={params.N} onChange={v=>set("N",v)} unit=""/>

 <div style={{marginTop:12, padding:10, background:C.bgInput, borderRadius:6}}>
 <EditorEjes direccion="X" ejes={params.ejesX} onChange={v=>set("ejesX",v)} color={C.primary}/>
 <EditorEjes direccion="Y" ejes={params.ejesY} onChange={v=>set("ejesY",v)} color={C.accent}/>
 </div>
 </Section>

 <Section title="Materiales" icon="🏗" color={C.accent}>
 <Select label="f'c · Concreto" value={params.fc}
 options={[175,210,245,280,315,350,420].map(v=>({value:v, label:`${v} kg/cm²`}))}
 onChange={v=>set("fc",Number(v))}/>
 <Select label="fy · Acero" value={params.fy}
 options={[2800,4200,5000,6000].map(v=>({value:v, label:`${v} kg/cm² (${v===4200?"Gr. 60":v===2800?"Gr. 40":v===5000?"Gr. 75":"Gr. 90"})`}))}
 onChange={v=>set("fy",Number(v))}/>
 </Section>

 <Section title="Cargas (tf/m²)" icon="⬇" color={C.accent}>
 <Slider label="CM · Carga muerta" min={0.10} max={0.80} step={0.01}
 value={params.qcm} onChange={v=>set("qcm",v)} unit="tf/m²" fmt={v=>v.toFixed(2)}/>
 <Slider label="CV · Habitaciones" min={0.10} max={0.60} step={0.01}
 value={params.qcv} onChange={v=>set("qcv",v)} unit="tf/m²" fmt={v=>v.toFixed(2)}/>
 <Slider label="CV · Corredores/Escal." min={0.20} max={0.80} step={0.01}
 value={params.qcvCorr} onChange={v=>set("qcvCorr",v)} unit="tf/m²" fmt={v=>v.toFixed(2)}/>
 </Section>

 <Section title="Suelo y Cimentación" icon="⊥" color={C.orange}>
 <Slider label="qadm · Cap. portante" min={5} max={50} step={0.5}
 value={params.qadm} onChange={v=>set("qadm",v)} unit="tf/m²" fmt={v=>v.toFixed(1)}/>
 <Slider label="Df · Profundidad" min={0.80} max={4.00} step={0.05}
 value={params.Df} onChange={v=>set("Df",v)} unit="m" fmt={v=>v.toFixed(2)}/>
 <Slider label="γs · Peso suelo" min={1.40} max={2.20} step={0.01}
 value={params.gs} onChange={v=>set("gs",v)} unit="tf/m³" fmt={v=>v.toFixed(2)}/>
 </Section>

 <Section title="Análisis Sísmico" icon="🌐" color={C.red}>
 <Select label="Zona sísmica" value={params.zonaSismica}
 options={ZONAS_SISMICAS.map(z=>({value:z.id, label:`Zona ${z.id} (Z=${z.Z}) · ${z.ejemplos}`}))}
 onChange={v=>set("zonaSismica",Number(v))}/>
 <Select label="Tipo de suelo" value={params.sueloId}
 options={TIPOS_SUELO.map(s=>({value:s.id, label:`${s.id} · ${s.desc}`}))}
 onChange={v=>set("sueloId",v)}/>
 <Select label="Categoría de uso" value={params.categoriaId}
 options={CATEGORIAS_USO.map(c=>({value:c.id, label:c.desc}))}
 onChange={v=>set("categoriaId",v)}/>
 <Select label="Sistema estructural" value={params.sistemaId}
 options={SISTEMAS_ESTRUCTURALES.map(s=>({value:s.id, label:`${s.desc} (R=${s.R})`}))}
 onChange={v=>set("sistemaId",v)}/>
 </Section>

 <Section title="Placas / Muros" icon="▥" color={C.yellow} defaultOpen={false}>
 <Slider label="tw · Espesor placa" min={0.15} max={0.40} step={0.01}
 value={params.tw_placa} onChange={v=>set("tw_placa",v)} unit="m" fmt={v=>v.toFixed(2)}/>
 <Slider label="lw · Longitud placa" min={2.0} max={10.0} step={0.05}
 value={params.Lw_placa} onChange={v=>set("Lw_placa",v)} unit="m" fmt={v=>v.toFixed(2)}/>
 <Slider label="N° placas (dir. X)" min={1} max={8} step={1}
 value={params.nPlacas_x} onChange={v=>set("nPlacas_x",v)} unit=""/>
 <Slider label="N° placas (dir. Y)" min={1} max={8} step={1}
 value={params.nPlacas_y} onChange={v=>set("nPlacas_y",v)} unit=""/>
 </Section>

 {/* Resultados sísmicos */}
 <div style={{
 background:C.bgInput, border:`1px solid ${C.border}`, borderRadius:8,
 padding:10, marginTop:6, fontSize:10.5,
 }}>
 <div style={{fontWeight:700, color:C.primary, marginBottom:6, fontSize:11}}>📊 Resultados Sísmicos</div>
 <div style={{display:"grid", gridTemplateColumns:"auto 1fr", gap:"2px 8px"}}>
 <span style={{color:C.textMute}}>T:</span><span style={{fontWeight:600}}>{r.T.toFixed(3)} s</span>
 <span style={{color:C.textMute}}>C:</span><span style={{fontWeight:600}}>{r.C_sis.toFixed(3)}</span>
 <span style={{color:C.textMute}}>ZUCS/R:</span><span style={{fontWeight:600}}>{r.ZUCS_R.toFixed(4)}</span>
 <span style={{color:C.textMute}}>Ws:</span><span style={{fontWeight:600}}>{r.Ws.toFixed(1)} tf</span>
 <span style={{color:C.textMute}}>V basal:</span><span style={{fontWeight:700, color:C.red}}>{r.V_basal.toFixed(2)} tf</span>
 <span style={{color:C.textMute}}>Junta s:</span><span style={{fontWeight:600}}>{(r.s_junta*100).toFixed(1)} cm</span>
 <span style={{color:C.textMute}}>Cols:</span><span style={{fontWeight:600}}>{r.nColTotal} ({r.nColC}c+{r.nColP}p+{r.nColE}e)</span>
 </div>
 <div style={{marginTop:8, padding:8, background:r.deriva_ok?C.greenBg:C.redBg, borderRadius:4}}>
 <span style={{fontSize:10, fontWeight:700, color:r.deriva_ok?C.green:C.red}}>
 Deriva máx: {(r.drift_max*1000).toFixed(2)}‰ / 7.0‰
 </span>
 </div>
 </div>
 </aside>

 <main style={{padding:16, overflowY:"auto", maxHeight:"calc(100vh - 116px)"}}>
 <div style={{display:"flex", gap:2, marginBottom:14, borderBottom:`1px solid ${C.border}`, flexWrap:"wrap"}}>
 {TABS.map(t=>(
 <button key={t.id} onClick={()=>setTab(t.id)} style={{
 padding:"8px 14px", borderRadius:"6px 6px 0 0", border:"none",
 borderBottom: tab===t.id ? `2px solid ${C.primary}` : `2px solid transparent`,
 marginBottom:-1, cursor:"pointer", fontSize:11.5,
 fontWeight: tab===t.id ? 700 : 500,
 background: tab===t.id ? "#fff" : "transparent",
 color: tab===t.id ? C.primary : C.textSec, fontFamily:"Inter,Arial",
 }}>
 {t.icon} {t.label}
 </button>
 ))}
 </div>

 {tab === "general" && <TabGeneral params={params} r={r}/>}
 {tab === "metrado" && <TabMetrado params={params} r={r} set={set}/>}
 {tab === "plano" && <TabPlano r={r} params={params}/>}
 {tab === "sismico" && <TabSismico r={r} params={params}/>}
 {tab === "losas" && <TabLosas r={r} params={params} set={set} reset={reset}/>}
 {tab === "vigas" && <TabVigas r={r} params={params} set={set} reset={reset}/>}
 {tab === "columnas" && <TabColumnas r={r} params={params} set={set} reset={reset}/>}
 {tab === "placas" && <TabPlacas r={r} params={params} set={set}/>}
 {tab === "escaleras" && <TabEscaleras r={r} params={params} set={set} reset={reset}/>}
 {tab === "zapatas" && <TabZapatas r={r} params={params} set={set} reset={reset}/>}
 {tab === "resumen" && <TabResumen r={r} params={params} verifs={verifs} todoOK={todoOK} onContinue={()=>setFase(2)} setTab={setTab}/>}
 </main>
 </div>
 )}

 {fase === 2 && <Fase2 r={r} params={params} setFase={setFase}/>}
 </div>
 );
}

const btnStyle = (color) => ({
 background: color, color: "#fff", border:"none", borderRadius:6,
 padding:"7px 14px", cursor:"pointer", fontWeight:700, fontSize:11.5,
 fontFamily:"Inter,Arial", boxShadow:"0 1px 3px rgba(0,0,0,0.15)",
});


// ════════════════════════════════════════════════════════════
// FASE 1 · PESTAÑAS
// ════════════════════════════════════════════════════════════

// ── TAB 1: DATOS GENERALES ─────────────────────────────────
function TabGeneral({params, r}) {
 return (
 <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
 <Card title="📋 Datos del Proyecto" accent={C.primary}>
 <Row label="Proyecto" value={params.proyecto}/>
 <Row label="Ubicación" value={params.ubicacion}/>
 <Row label="N° pisos" value={params.N}/>
 <Row label="Altura de entrepiso" value={params.hpiso} unit="m"/>
 <Row label="Altura total" value={(params.hpiso*params.N).toFixed(2)} unit="m"/>
 <Row label="Sistema estructural" value={r.sistema.desc}/>
 <Row label="Categoría de uso" value={r.categoria.desc}/>
 <Row label="Junta sísmica E.030 §5.3" value={(r.s_junta*100).toFixed(1)} unit="cm"/>
 </Card>

 <Card title="🏗 Materiales" accent={C.accent}>
 <Row label="f'c · concreto" value={params.fc} unit="kg/cm²"/>
 <Row label="Ec = 15100·√f'c" value={(15100*Math.sqrt(params.fc)).toFixed(0)} unit="kg/cm²"/>
 <Row label="fy · acero" value={params.fy} unit="kg/cm²"/>
 <Row label="γc · concreto armado" value="2.40" unit="tf/m³"/>
 </Card>

 <Card title="⬇ Cargas" accent={C.accent}>
 <Row label="CM" value={params.qcm} unit="tf/m²"/>
 <Row label="CV habitaciones" value={params.qcv} unit="tf/m²" norma="E.020"/>
 <Row label="CV corredores" value={params.qcvCorr} unit="tf/m²"/>
 <Row label="Wu = 1.4CM + 1.7CV" value={r.Wu_hab.toFixed(3)} unit="tf/m²" hi norma="E.060 §9.2"/>
 <Row label="Ws sísmico (CM + 25%CV)" value={r.Ws.toFixed(1)} unit="tf" hi norma="E.030 Art.26"/>
 </Card>

 <Card title="📐 Geometría en planta" accent={C.primary}>
 <Row label="Lx total (con ejes)" value={r.Lx_total.toFixed(2)} unit="m"/>
 <Row label="Ly total (con ejes)" value={r.Ly_total.toFixed(2)} unit="m"/>
 <Row label="Vanos X × Y" value={`${r.nVanosX} × ${r.nVanosY}`}/>
 <Row label="Ejes A→... × 1→..." value={`${r.nEjesX} × ${r.nEjesY}`}/>
 <Row label="N° de columnas" value={r.nColTotal}/>
 <Row label=" → Centrales" value={r.nColC}/>
 <Row label=" → Perimetrales" value={r.nColP}/>
 <Row label=" → Esquineras" value={r.nColE}/>
 <Row label="Área en planta" value={r.area_planta.toFixed(1)} unit="m²"/>
 </Card>
 </div>
 );
}

// ── TAB 2: PLANO Y EJES ────────────────────────────────────
function TabPlano({r, params}) {
 return (
 <div>
 <Card title="📐 PLANO ARQUITECTÓNICO ESTRUCTURAL · Vista en Planta"
 subtitle={`Edificación de ${r.Lx_total.toFixed(2)} × ${r.Ly_total.toFixed(2)} m · ${r.nEjesX} ejes en X · ${r.nEjesY} ejes en Y`}
 accent={C.primary}>
 <div style={{background:"#FAFCFE", borderRadius:8, padding:14, border:`1px solid ${C.border}`}}>
 <SvgPlantaEjes
 coordEjesX={r.coordEjesX}
 coordEjesY={r.coordEjesY}
 columnas={r.columnasEnPlanta}
 Lx_total={r.Lx_total}
 Ly_total={r.Ly_total}
 b_col={r.b_unif}
 tw_placa={r.tw}
 Lw_placa={r.Lw_placa || 5}
 />
 </div>
 <div style={{marginTop:10, padding:10, background:C.bgInput, borderRadius:6, fontSize:11, lineHeight:1.6}}>
 <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:8}}>
 <div><span style={{color:C.red, fontWeight:700}}>■ C-1</span> Esquinera ({r.nColE})</div>
 <div><span style={{color:C.orange, fontWeight:700}}>■ C-2</span> Perimetral ({r.nColP})</div>
 <div><span style={{color:C.primary, fontWeight:700}}>■ C-3</span> Central ({r.nColC})</div>
 <div><span style={{color:C.yellow, fontWeight:700}}>▥</span> Placa Lw={params.Lw_placa}m</div>
 </div>
 </div>
 </Card>

 <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
 <Card title="📏 Separaciones entre ejes · Dir. X" accent={C.primary}>
 <table style={{width:"100%", fontSize:11.5, borderCollapse:"collapse"}}>
 <thead>
 <tr style={{background:C.primary, color:"#fff"}}>
 <th style={{padding:"6px 9px", textAlign:"left"}}>Vano</th>
 <th style={{padding:"6px 9px", textAlign:"right"}}>Separación (m)</th>
 <th style={{padding:"6px 9px", textAlign:"right"}}>Pos. acum. (m)</th>
 </tr>
 </thead>
 <tbody>
 {params.ejesX.map((sep, i) => {
 const acum = params.ejesX.slice(0, i+1).reduce((a,b)=>a+b, 0);
 return (
 <tr key={i} style={{background: i%2 ? C.bgInput : "#fff"}}>
 <td style={{padding:"6px 9px", fontWeight:600}}>
 {String.fromCharCode(65+i)} → {String.fromCharCode(66+i)}
 </td>
 <td style={{padding:"6px 9px", textAlign:"right"}}>{sep.toFixed(2)}</td>
 <td style={{padding:"6px 9px", textAlign:"right", color:C.textSec}}>{acum.toFixed(2)}</td>
 </tr>
 );
 })}
 <tr style={{background:C.primary, color:"#fff", fontWeight:700}}>
 <td style={{padding:"6px 9px"}}>TOTAL Lx</td>
 <td style={{padding:"6px 9px", textAlign:"right"}}>{r.Lx_total.toFixed(2)}</td>
 <td></td>
 </tr>
 </tbody>
 </table>
 </Card>

 <Card title="📏 Separaciones entre ejes · Dir. Y" accent={C.accent}>
 <table style={{width:"100%", fontSize:11.5, borderCollapse:"collapse"}}>
 <thead>
 <tr style={{background:C.accent, color:"#fff"}}>
 <th style={{padding:"6px 9px", textAlign:"left"}}>Vano</th>
 <th style={{padding:"6px 9px", textAlign:"right"}}>Separación (m)</th>
 <th style={{padding:"6px 9px", textAlign:"right"}}>Pos. acum. (m)</th>
 </tr>
 </thead>
 <tbody>
 {params.ejesY.map((sep, i) => {
 const acum = params.ejesY.slice(0, i+1).reduce((a,b)=>a+b, 0);
 return (
 <tr key={i} style={{background: i%2 ? C.bgInput : "#fff"}}>
 <td style={{padding:"6px 9px", fontWeight:600}}>{i+1} → {i+2}</td>
 <td style={{padding:"6px 9px", textAlign:"right"}}>{sep.toFixed(2)}</td>
 <td style={{padding:"6px 9px", textAlign:"right", color:C.textSec}}>{acum.toFixed(2)}</td>
 </tr>
 );
 })}
 <tr style={{background:C.accent, color:"#fff", fontWeight:700}}>
 <td style={{padding:"6px 9px"}}>TOTAL Ly</td>
 <td style={{padding:"6px 9px", textAlign:"right"}}>{r.Ly_total.toFixed(2)}</td>
 <td></td>
 </tr>
 </tbody>
 </table>
 </Card>
 </div>

 <Card title="🏷 Listado de Columnas (ubicación en planta)" subtitle={`${r.nColTotal} columnas totales`} accent={C.primary}>
 <div style={{maxHeight:300, overflowY:"auto"}}>
 <table style={{width:"100%", fontSize:11, borderCollapse:"collapse"}}>
 <thead style={{position:"sticky", top:0}}>
 <tr style={{background:C.primary, color:"#fff"}}>
 <th style={{padding:"6px 8px", textAlign:"left"}}>ID</th>
 <th style={{padding:"6px 8px", textAlign:"left"}}>Tipo</th>
 <th style={{padding:"6px 8px", textAlign:"right"}}>X (m)</th>
 <th style={{padding:"6px 8px", textAlign:"right"}}>Y (m)</th>
 </tr>
 </thead>
 <tbody>
 {r.columnasEnPlanta.map((c, i) => {
 const tipos = {C:"Central", PX:"Perimetral X", PY:"Perimetral Y", E:"Esquinera"};
 const colores = {C:C.primary, PX:C.orange, PY:C.orange, E:C.red};
 return (
 <tr key={i} style={{background: i%2 ? C.bgInput : "#fff"}}>
 <td style={{padding:"5px 8px", fontWeight:700, color:colores[c.tipo]}}>{c.id}</td>
 <td style={{padding:"5px 8px"}}>{tipos[c.tipo]}</td>
 <td style={{padding:"5px 8px", textAlign:"right"}}>{c.x.toFixed(2)}</td>
 <td style={{padding:"5px 8px", textAlign:"right"}}>{c.y.toFixed(2)}</td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </Card>
 </div>
 );
}

// ── TAB 3: SÍSMICO ─────────────────────────────────────────
function TabSismico({r, params}) {
 return (
 <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
 <Card title="🌐 Análisis Sísmico Estático" subtitle="E.030-2018 Art. 28" accent={C.red}>
 <Row label="Z · Factor de zona" value={r.Z} norma={`Zona ${r.zona.id}`}/>
 <Row label="U · Factor de uso" value={r.U} norma={`Cat. ${r.categoria.id}`}/>
 <Row label="S · Factor de suelo" value={r.S.toFixed(2)} norma={`Tipo ${r.suelo.id}`}/>
 <Row label="Tp" value={r.Tp.toFixed(2)} unit="s"/>
 <Row label="TL" value={r.Tl.toFixed(2)} unit="s"/>
 <Row label="R · Reducción sísmica" value={r.R} norma={r.sistema.desc}/>
 <Row label="Ct" value={r.Ct_sist}/>
 <Row label="T = H/Ct" value={r.T.toFixed(3)} unit="s" hi/>
 <Row label="C" value={r.C_sis.toFixed(3)} hi/>
 <Row label="ZUCS/R" value={r.ZUCS_R.toFixed(4)}/>
 <Row label="C/R ≥ 0.11" value={r.C_R_min_ok?"Cumple":"Aplicar mín."} ok={r.C_R_min_ok}/>
 <Row label="ZUCS/R efectivo" value={r.ZUCS_R_efectivo.toFixed(4)}/>
 </Card>

 <Card title="📊 Fuerza Sísmica" subtitle="Predimensionamiento" accent={C.primary}>
 <Row label="Factor CV para Ws" value={`${(r.factor_CV*100).toFixed(0)} %`} norma={`Cat. ${r.categoria.id}`}/>
 <Row label="Peso por piso Pi" value={r.distribucion[0].Pi.toFixed(1)} unit="tf"/>
 <Row label="Peso total Ws" value={r.Ws.toFixed(1)} unit="tf" hi norma="E.030 Art. 26"/>
 <Row label="V basal" value={r.V_basal.toFixed(2)} unit="tf" hi/>
 <Row label="Exponente k (Fi)" value={r.k_dist.toFixed(3)} norma="E.030 Art. 28.6"/>
 <Row label="Momento volteo total" value={r.M_volteo.toFixed(1)} unit="tf·m"/>
 <Row label="Junta sísmica" value={(r.s_junta*100).toFixed(1)} unit="cm" norma="E.030 §5.3"/>
 </Card>

 <div style={{gridColumn:"1/-1"}}>
 <Card title="📈 Espectro de respuesta C(T)" accent={C.primary}>
 <div style={{height:320}}>
 <ResponsiveContainer>
 <LineChart data={r.espectro} margin={{top:10,right:20,left:0,bottom:10}}>
 <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
 <XAxis dataKey="T" tick={{fontSize:10}} label={{value:"Período T (s)", position:"insideBottom", offset:-5, fontSize:11}}/>
 <YAxis tick={{fontSize:10}} label={{value:"C", angle:-90, position:"insideLeft", fontSize:11}}/>
 <Tooltip/>
 <ReferenceLine x={r.T} stroke={C.red} strokeDasharray="4 3" label={{value:`T=${r.T.toFixed(2)}s`, fontSize:10, fill:C.red}}/>
 <ReferenceLine x={r.Tp} stroke={C.orange} strokeDasharray="3 3" label={{value:`Tp`, fontSize:10, fill:C.orange}}/>
 <Line dataKey="C" stroke={C.primary} strokeWidth={2.5} dot={false} name="C(T)"/>
 </LineChart>
 </ResponsiveContainer>
 </div>
 </Card>
 </div>

 <div style={{gridColumn:"1/-1"}}>
 <Card title="📊 Distribución de fuerzas por piso (E.030 §28.6)" accent={C.accent}>
 <table style={{width:"100%", fontSize:11.5, borderCollapse:"collapse"}}>
 <thead>
 <tr style={{background:C.primary, color:"#fff"}}>
 <th style={{padding:"6px 8px"}}>Piso</th>
 <th style={{padding:"6px 8px", textAlign:"right"}}>hi (m)</th>
 <th style={{padding:"6px 8px", textAlign:"right"}}>Pi (tf)</th>
 <th style={{padding:"6px 8px", textAlign:"right"}}>Pi·hi^k</th>
 <th style={{padding:"6px 8px", textAlign:"right"}}>Fi (tf)</th>
 <th style={{padding:"6px 8px", textAlign:"right"}}>Vi (tf)</th>
 </tr>
 </thead>
 <tbody>
 {r.distribucion.slice().reverse().map((d, i) => {
 const vc = r.cortantes_piso.find(v => v.piso === d.piso);
 return (
 <tr key={d.piso} style={{background: i%2 ? C.bgInput : "#fff"}}>
 <td style={{padding:"5px 8px", fontWeight:700, color:C.primary, textAlign:"center"}}>{d.piso}</td>
 <td style={{padding:"5px 8px", textAlign:"right"}}>{d.hi.toFixed(2)}</td>
 <td style={{padding:"5px 8px", textAlign:"right"}}>{d.Pi.toFixed(1)}</td>
 <td style={{padding:"5px 8px", textAlign:"right"}}>{d.Phk.toFixed(0)}</td>
 <td style={{padding:"5px 8px", textAlign:"right", color:C.red, fontWeight:600}}>{d.Fi.toFixed(2)}</td>
 <td style={{padding:"5px 8px", textAlign:"right", color:C.green, fontWeight:600}}>{vc?vc.Vi.toFixed(2):""}</td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </Card>
 </div>

 <div style={{gridColumn:"1/-1"}}>
 <Card title="🔍 Verificación de Irregularidades Estructurales" subtitle="E.030-2018 §3.5" accent={C.orange}>
 <table style={{width:"100%", fontSize:11.5, borderCollapse:"collapse"}}>
 <thead>
 <tr style={{background:C.primary, color:"#fff"}}>
 <th style={{padding:"6px 8px", textAlign:"left"}}>Irregularidad</th>
 <th style={{padding:"6px 8px", textAlign:"left"}}>Tipo</th>
 <th style={{padding:"6px 8px", textAlign:"center"}}>Estado</th>
 </tr>
 </thead>
 <tbody>
 {r.irregularidades && r.irregularidades.map((irr, i) => (
 <tr key={i} style={{background: i%2 ? C.bgInput : "#fff"}}>
 <td style={{padding:"6px 8px"}}>{irr.nombre}</td>
 <td style={{padding:"6px 8px"}}>{irr.tipo}</td>
 <td style={{padding:"6px 8px", textAlign:"center"}}>
 <Badge ok={!irr.presente} text={irr.presente?"Presente":"No detectada"}/>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </Card>
 </div>
 </div>
 );
}

// ── TAB 4: LOSAS ───────────────────────────────────────────
function TabLosas({r, params, set, reset}) {
 return (
 <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
 <Card title="A. Losa Aligerada" subtitle="ACI 318-19 §9.3.1.1" accent={C.primary} icon="▤">
 <Slider label="h · Peralte" min={0.15} max={0.40} step={0.01}
 value={params.h_al_user || r.h_al_calc} onChange={v=>set("h_al_user",v)} unit="m"
 fmt={v=>v.toFixed(2)} hint={`Calculado: ${r.h_al_calc.toFixed(2)} m`}
 onReset={()=>reset("h_al_user")}/>
 <Row label="h mínimo = Lx/25" value={r.h_al_min.toFixed(3)} unit="m"/>
 <Row label="PP losa aligerada" value={r.PP_al.toFixed(3)} unit="tf/m²"/>
 <Row label="Vu (por vigueta)" value={r.Vu_al.toFixed(3)} unit="tf"/>
 <Row label="φVc resistencia" value={r.phiVc_al.toFixed(3)} unit="tf"/>
 <Row label="Verif: Vu ≤ φVc" value={`${r.Vu_al.toFixed(2)} ≤ ${r.phiVc_al.toFixed(2)}`} ok={r.losa_ok}/>
 <Row label="As req" value={r.As_al.toFixed(2)} unit="cm²/m"/>
 <Row label="Δ inmediata" value={r.delta_al.toFixed(2)} unit="cm"/>
 <Row label="L/360" value={r.delta_lim_al.toFixed(2)} unit="cm" ok={r.defl_al_ok}/>
 <div style={{marginTop:10, padding:10, background:r.losa_ok?C.greenBg:C.redBg, border:`1px solid ${r.losa_ok?C.green:C.red}`, borderRadius:6, fontSize:11}}>
 <strong>Acero adoptado:</strong> {r.var_al.n}{r.var_al.nom}/vigueta
 (As={r.var_al.As_tot.toFixed(2)} cm²)
 </div>
 </Card>

 <Card title="Sección · Losa Aligerada" accent={C.primary}>
 <SvgLosa h={r.h_al} var_losa={r.var_al}/>
 </Card>

 <Card title="B. Losa Maciza Bidireccional" subtitle="CIRSOC Método 3" accent={C.primary}>
 <Slider label="h · Peralte" min={0.10} max={0.30} step={0.01}
 value={params.h_mac_user || r.h_mac_calc} onChange={v=>set("h_mac_user",v)} unit="m"
 fmt={v=>v.toFixed(2)} hint={`Calculado: ${r.h_mac_calc.toFixed(2)} m`}
 onReset={()=>reset("h_mac_user")}/>
 <Row label="m = Ly/Lx" value={r.m_mac.toFixed(3)}/>
 <Row label="Ca" value={r.Ca.toFixed(4)} hi/>
 <Row label="Cb" value={r.Cb.toFixed(4)} hi/>
 <Row label="Mu,x" value={r.Mu_mac_x.toFixed(3)} unit="tf·m/m"/>
 <Row label="Mu,y" value={r.Mu_mac_y.toFixed(3)} unit="tf·m/m"/>
 <Row label="As mínimo" value={r.As_mac_min.toFixed(2)} unit="cm²/m"/>
 <div style={{marginTop:10, padding:10, background:C.bgInput, borderRadius:6, fontSize:11}}>
 <div><strong>Dir. X:</strong> {r.var_mx.n}{r.var_mx.nom} (As={r.var_mx.As_tot.toFixed(2)} cm²/m)</div>
 <div><strong>Dir. Y:</strong> {r.var_my.n}{r.var_my.nom} (As={r.var_my.As_tot.toFixed(2)} cm²/m)</div>
 </div>
 </Card>

 <Card title="📈 Peralte vs Lx" accent={C.accent}>
 <div style={{height:200}}>
 <ResponsiveContainer>
 <LineChart data={Array.from({length:13},(_,i)=>{
 const Lx=3+i*0.5;
 return {Lx:+Lx.toFixed(1), "h/25":+(Lx/25).toFixed(3), "h/33":+(Lx/33).toFixed(3)};
 })} margin={{top:8,right:14,left:-8,bottom:6}}>
 <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
 <XAxis dataKey="Lx" tick={{fontSize:10}}/>
 <YAxis tick={{fontSize:10}}/>
 <Tooltip/>
 <Legend wrapperStyle={{fontSize:10}}/>
 <ReferenceLine x={r.Lx_max} stroke={C.red} strokeDasharray="4 3"/>
 <Line dataKey="h/25" stroke={C.primary} strokeWidth={2.5} dot={false} name="Aligerada Lx/25"/>
 <Line dataKey="h/33" stroke={C.orange} strokeWidth={2.5} dot={false} name="Maciza Lx/33"/>
 </LineChart>
 </ResponsiveContainer>
 </div>
 </Card>
 </div>
 );
}

// ── TAB 5: VIGAS ───────────────────────────────────────────
function TabVigas({r, params, set, reset}) {
 return (
 <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
 <Card title="A. Viga Principal (Lx_max)" subtitle="NTE E.060 §21.4" accent={C.primary}>
 <Slider label="h · Peralte" min={0.30} max={0.90} step={0.05}
 value={params.h_vp_user || r.h_vp_calc} onChange={v=>set("h_vp_user",v)} unit="m"
 fmt={v=>v.toFixed(2)} hint={`Calculado: ${r.h_vp_calc.toFixed(2)} m (Lx/12)`}
 onReset={()=>reset("h_vp_user")}/>
 <Slider label="b · Base" min={0.20} max={0.50} step={0.05}
 value={params.b_vp_user || r.b_vp_calc} onChange={v=>set("b_vp_user",v)} unit="m"
 fmt={v=>v.toFixed(2)} hint={`Calculado: ${r.b_vp_calc.toFixed(2)} m`}
 onReset={()=>reset("b_vp_user")}/>
 <Row label="d efectivo" value={r.d_vp.toFixed(3)} unit="m" norma="h - 0.06"/>
 <Row label="Mu (-) ext = wL²/9" value={r.Mu_vp_neg_ext.toFixed(2)} unit="tf·m"/>
 <Row label="Mu (+) ext = wL²/14" value={r.Mu_vp_pos_ext.toFixed(2)} unit="tf·m"/>
 <Row label="Mu (-) int = wL²/11" value={r.Mu_vp_neg_int.toFixed(2)} unit="tf·m"/>
 <Row label="Mu (+) int = wL²/16" value={r.Mu_vp_pos_int.toFixed(2)} unit="tf·m"/>
 <Row label="Vu = 1.15·wL/2" value={r.Vu_vp.toFixed(2)} unit="tf"/>
 <Row label="φVc" value={r.phiVc_vp.toFixed(2)} unit="tf"/>
 <Row label="Verif. cortante" value={`${r.Vu_vp.toFixed(1)} ≤ ${r.phiVc_vp.toFixed(1)}`} ok={r.cort_vp_ok}/>
 <Row label="As (-) req" value={r.As_vp.toFixed(2)} unit="cm²"/>
 <Row label="Verif. flexión" value={`${r.As_vp_req.toFixed(1)} ≤ ${r.var_vp.As_tot.toFixed(1)}`} ok={r.flex_vp_ok}/>
 <div style={{marginTop:10, padding:10, background:r.flex_vp_ok&&r.cort_vp_ok?C.greenBg:C.redBg, borderRadius:6, fontSize:11, border:`1px solid ${r.flex_vp_ok&&r.cort_vp_ok?C.green:C.red}`}}>
 <strong>Acero (-):</strong> {r.var_vp.n}{r.var_vp.nom} (As={r.var_vp.As_tot.toFixed(2)} cm²)<br/>
 <strong>Acero (+):</strong> {r.var_vp_pos.n}{r.var_vp_pos.nom}<br/>
 Estribos: ∅3/8" @ {(r.s_vp_sism*100).toFixed(1)} cm (conf.) / @ {(r.s_vp_corr*100).toFixed(1)} cm (corr.)
 </div>
 </Card>

 <Card title="Sección · Viga Principal" accent={C.primary}>
 <SvgViga b={r.b_vp} h={r.h_vp} var_inf={r.var_vp}
 s_conf={r.s_vp_sism}
 label={`VP ${(r.b_vp*100).toFixed(0)}×${(r.h_vp*100).toFixed(0)}`}
 ok={r.flex_vp_ok && r.cort_vp_ok}/>
 </Card>

 <Card title="B. Viga Secundaria (Ly_max)" accent={C.primary}>
 <Slider label="h · Peralte" min={0.30} max={0.90} step={0.05}
 value={params.h_vs_user || r.h_vs_calc} onChange={v=>set("h_vs_user",v)} unit="m"
 fmt={v=>v.toFixed(2)} hint={`Calculado: ${r.h_vs_calc.toFixed(2)} m`}
 onReset={()=>reset("h_vs_user")}/>
 <Slider label="b · Base" min={0.20} max={0.50} step={0.05}
 value={params.b_vs_user || r.b_vs_calc} onChange={v=>set("b_vs_user",v)} unit="m"
 fmt={v=>v.toFixed(2)} hint={`Calculado: ${r.b_vs_calc.toFixed(2)} m`}
 onReset={()=>reset("b_vs_user")}/>
 <Row label="Mu" value={r.Mu_vs.toFixed(2)} unit="tf·m"/>
 <Row label="As req" value={r.As_vs.toFixed(2)} unit="cm²"/>
 <div style={{marginTop:10, padding:10, background:C.bgInput, borderRadius:6, fontSize:11}}>
 <strong>{r.var_vs.n}{r.var_vs.nom}</strong> · As={r.var_vs.As_tot.toFixed(2)} cm²
 </div>
 </Card>

 <Card title="Sección · Viga Secundaria" accent={C.primary}>
 <SvgViga b={r.b_vs} h={r.h_vs} var_inf={r.var_vs}
 s_conf={r.s_vp_sism}
 label={`VS ${(r.b_vs*100).toFixed(0)}×${(r.h_vs*100).toFixed(0)}`}/>
 </Card>
 </div>
 );
}

// ── TAB 6: COLUMNAS ────────────────────────────────────────
function TabColumnas({r, params, set, reset}) {
 return (
 <div>
 <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:10, marginBottom:14}}>
 {[
 {col:r.col_C, label:"Central"},
 {col:r.col_PX, label:"Perimetral X"},
 {col:r.col_PY, label:"Perimetral Y"},
 {col:r.col_E, label:"Esquinera"},
 ].map(({col, label})=>(
 <Card key={label} title={label} accent={C.primary}>
 <SvgColumna
 b={r.b_unif} varilla={r.var_unif}
 s_conf={r.s_conf} Lo={r.Lo_col}
 rho={r.rho_esq} label={label}
 ok={col.ok} Pu={col.Pu}/>
 </Card>
 ))}
 </div>

 <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
 <Card title="✓ Sección Unificada" subtitle="Criterio constructivo" accent={C.green}>
 <Slider label="b · Lado" min={25} max={80} step={5}
 value={params.b_col_user || r.b_unif_calc} onChange={v=>set("b_col_user",v)} unit="cm"
 fmt={v=>v.toFixed(0)} hint={`Calculado: ${r.b_unif_calc} cm`}
 onReset={()=>reset("b_col_user")}/>
 <Row label="b adoptado" value={r.b_unif} unit="cm" hi/>
 <Row label="As (ρ=1.5%)" value={r.As_unif.toFixed(2)} unit="cm²"/>
 <Row label="Varilla por cara" value={`${r.var_unif.n}${r.var_unif.nom}`}/>
 <Row label="ρ real (esquinera)" value={`${(r.rho_esq*100).toFixed(2)}%`} ok={r.rho_esq>=0.01}/>
 <Row label="s confinado" value={r.s_conf.toFixed(0)} unit="mm"/>
 <Row label="Lo zona confinada" value={r.Lo_col.toFixed(0)} unit="mm"/>
 <Row label="Esbeltez λ=lu/b" value={r.esb.toFixed(2)} ok={r.esb_ok} norma="≤ 12"/>
 <Row label="k·lu/r" value={r.esb_klu_r.toFixed(1)} norma="≤ 100"/>
 </Card>

 <Card title="📊 Carga axial Pu por tipo (envolvente)" accent={C.primary}>
 <div style={{height:320}}>
 <ResponsiveContainer>
 <BarChart data={[
 {tipo:"Central", U1:r.col_C.Pu_U1, U2:r.col_C.Pu_U2, env:r.col_C.Pu},
 {tipo:"Perim. X", U1:r.col_PX.Pu_U1, U2:r.col_PX.Pu_U2, env:r.col_PX.Pu},
 {tipo:"Perim. Y", U1:r.col_PY.Pu_U1, U2:r.col_PY.Pu_U2, env:r.col_PY.Pu},
 {tipo:"Esquinera", U1:r.col_E.Pu_U1, U2:r.col_E.Pu_U2, env:r.col_E.Pu},
 ]} margin={{top:10,right:14,left:-8,bottom:6}}>
 <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
 <XAxis dataKey="tipo" tick={{fontSize:10}}/>
 <YAxis tick={{fontSize:10}} label={{value:"Pu (tf)", angle:-90, position:"insideLeft", fontSize:11}}/>
 <Tooltip/>
 <Legend wrapperStyle={{fontSize:10}}/>
 <Bar dataKey="U1" fill={C.primary} name="U1 (grav)"/>
 <Bar dataKey="U2" fill={C.orange} name="U2 (sismo)"/>
 </BarChart>
 </ResponsiveContainer>
 </div>
 </Card>

 <div style={{gridColumn:"1/-1"}}>
 <Card title="Detalle por tipo de columna con combinaciones de carga" accent={C.primary}>
 <table style={{width:"100%", borderCollapse:"collapse", fontSize:11}}>
 <thead>
 <tr style={{background:C.primary, color:"#fff"}}>
 <th style={{padding:"7px 9px", textAlign:"left"}}>Tipo</th>
 <th style={{padding:"7px 9px", textAlign:"right"}}>At (m²)</th>
 <th style={{padding:"7px 9px", textAlign:"right"}}>Pu_U1 (tf)</th>
 <th style={{padding:"7px 9px", textAlign:"right"}}>Pu_U2 +sismo</th>
 <th style={{padding:"7px 9px", textAlign:"right"}}>Pu_U3 (mín)</th>
 <th style={{padding:"7px 9px", textAlign:"right"}}>Pu env. (tf)</th>
 <th style={{padding:"7px 9px", textAlign:"right"}}>φPn (tf)</th>
 <th style={{padding:"7px 9px", textAlign:"center"}}>Verif.</th>
 </tr>
 </thead>
 <tbody>
 {[r.col_C, r.col_PX, r.col_PY, r.col_E].map((c,i)=>(
 <tr key={i} style={{background: i%2 ? C.bgInput : "#fff"}}>
 <td style={{padding:"7px 9px", fontWeight:600}}>{c.tipo}</td>
 <td style={{padding:"7px 9px", textAlign:"right"}}>{c.At ? c.At.toFixed(2) : " · "}</td>
 <td style={{padding:"7px 9px", textAlign:"right"}}>{c.Pu_U1.toFixed(1)}</td>
 <td style={{padding:"7px 9px", textAlign:"right"}}>{c.Pu_U2.toFixed(1)}</td>
 <td style={{padding:"7px 9px", textAlign:"right", color:C.textMute}}>{c.Pu_U3_min.toFixed(1)}</td>
 <td style={{padding:"7px 9px", textAlign:"right", fontWeight:700, color:C.primary}}>{c.Pu.toFixed(1)}</td>
 <td style={{padding:"7px 9px", textAlign:"right"}}>{c.phi_Pn.toFixed(1)}</td>
 <td style={{padding:"7px 9px", textAlign:"center"}}><Badge ok={c.ok}/></td>
 </tr>
 ))}
 </tbody>
 </table>
 </Card>
 </div>
 </div>
 </div>
 );
}

// ── TAB 7: PLACAS ──────────────────────────────────────────
function TabPlacas({r, params, set}) {
 return (
 <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
 <Card title="Muro de Corte" subtitle="NTE E.060 §21.9" accent={C.yellow}>
 <Slider label="tw · Espesor placa" min={0.15} max={0.40} step={0.01}
 value={params.tw_placa} onChange={v=>set("tw_placa",v)} unit="m" fmt={v=>v.toFixed(2)}/>
 <Slider label="lw · Longitud placa" min={2.0} max={10.0} step={0.05}
 value={params.Lw_placa} onChange={v=>set("Lw_placa",v)} unit="m" fmt={v=>v.toFixed(2)}/>
 <Slider label="N° placas dir. X crítica" min={1} max={8} step={1}
 value={params.nPlacas_x} onChange={v=>set("nPlacas_x",v)} unit=""/>
 <Row label="tw mín = hpiso/16" value={r.tw_min.toFixed(3)} unit="m"/>
 <Row label="V basal total" value={r.V_basal.toFixed(2)} unit="tf"/>
 <Row label={`V por placa (${r.nPlacas_dir} placas)`} value={r.V_placa.toFixed(2)} unit="tf" hi/>
 <Row label="φVn por placa" value={r.phiVn.toFixed(2)} unit="tf"/>
 <Row label="Verif V_placa ≤ φVn" value={`${r.V_placa.toFixed(1)} ≤ ${r.phiVn.toFixed(1)}`} ok={r.placa_ok}/>
 <Row label="Av mín (ρ=0.0025)" value={r.Av_placa.toFixed(2)} unit="cm²/m"/>
 </Card>

 <Card title="Vista · Muro de Corte" accent={C.yellow}>
 <SvgPlaca tw={r.tw} Lw={params.Lw_placa} Av={r.Av_placa} ok={r.placa_ok}/>
 </Card>

 <div style={{gridColumn:"1/-1"}}>
 <Card title="📐 Verificación de Derivas de Entrepiso" subtitle="E.030-2018 §5.2" accent={r.deriva_ok?C.green:C.red}>
 <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
 <div>
 <Row label="Drift máximo calculado" value={(r.drift_max*1000).toFixed(2)} unit="‰" hi/>
 <Row label="Límite normativo" value={(r.drift_lim*1000).toFixed(1)} unit="‰" norma="C.A."/>
 <Row label="Verificación" value={r.deriva_ok?"CUMPLE":"NO CUMPLE"} ok={r.deriva_ok}/>
 <Row label="Rigidez lateral K" value={r.K_lat.toFixed(1)} unit="tf/cm"/>
 <Row label="Inercia placas I" value={r.I_placa.toFixed(4)} unit="m⁴"/>
 {!r.deriva_ok && (
 <div style={{marginTop:10, padding:10, background:C.redBg, border:`1px solid ${C.red}`, borderRadius:6, fontSize:11, lineHeight:1.5}}>
 <strong>⚠ Deriva excede límite.</strong> Acciones:
 <ul style={{marginTop:6, paddingLeft:18}}>
 <li>Aumentar tw o lw</li>
 <li>Aumentar N° placas</li>
 <li>Análisis dinámico modal en ETABS</li>
 </ul>
 </div>
 )}
 </div>
 <div style={{height:320}}>
 <ResponsiveContainer>
 <BarChart data={r.derivas.map(d=>({piso:d.piso, drift:+(d.drift*1000).toFixed(2)}))} layout="vertical" margin={{top:15, right:30, left:25, bottom:25}}>
 <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
 <XAxis type="number" tick={{fontSize:10}}/>
 <YAxis dataKey="piso" type="category" tick={{fontSize:10}}/>
 <Tooltip/>
 <ReferenceLine x={r.drift_lim*1000} stroke={C.red} strokeWidth={2}/>
 <Bar dataKey="drift" fill={C.primary} radius={[0,4,4,0]} name="Drift ‰"/>
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>
 </Card>
 </div>
 </div>
 );
}

// ── TAB 8: ESCALERAS ───────────────────────────────────────
function TabEscaleras({r, params, set, reset}) {
 return (
 <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
 <Card title="Escalera · Geometría Blondel" subtitle="RNE" accent={C.primary}>
 <Slider label="N° de contrapasos" min={6} max={24} step={1}
 value={params.n_cp_user || r.n_cp_calc} onChange={v=>set("n_cp_user",v)} unit=""
 hint={`Calculado: ${r.n_cp_calc} contrapasos`}
 onReset={()=>reset("n_cp_user")}/>
 <Slider label="Paso p" min={0.25} max={0.30} step={0.005}
 value={params.paso_user || r.paso_calc} onChange={v=>set("paso_user",v)} unit="m"
 fmt={v=>v.toFixed(3)} hint={`Calculado: ${r.paso_calc.toFixed(3)} m`}
 onReset={()=>reset("paso_user")}/>
 <Row label="Contrapaso c" value={r.cp.toFixed(3)} unit="m"/>
 <Row label="Blondel 2c+p" value={(r.blond*100).toFixed(1)} unit="cm" ok={r.blon_ok}/>
 <Row label="LH horizontal" value={r.LH.toFixed(3)} unit="m"/>
 <Row label="Ángulo α" value={r.alpha.toFixed(1)} unit="°"/>
 <Row label="t · Espesor losa" value={r.t_esc.toFixed(3)} unit="m" hi/>
 <Row label="Mu = Wu·LH²/8" value={r.Mu_esc.toFixed(3)} unit="tf·m/m"/>
 <Row label="As req" value={r.As_esc.toFixed(2)} unit="cm²/m"/>
 </Card>

 <Card title="Vista · Escalera" accent={C.primary}>
 <SvgEscalera LH={r.LH} hpiso={params.hpiso} n_cp={r.n_cp}
 alpha={r.alpha} t_esc={r.t_esc} var_esc={r.var_esc} ok={r.blon_ok}/>
 </Card>
 </div>
 );
}

// ── TAB 9: ZAPATAS ─────────────────────────────────────────
function TabZapatas({r, params, set, reset}) {
 const zapatas = [
 {z:r.zap_C, key:"C", label:"Central", L_key:"L_zap_C_user", hz_key:"hz_zap_C_user"},
 {z:r.zap_PX, key:"PX", label:"Perimetral X", L_key:"L_zap_PX_user", hz_key:"hz_zap_PX_user"},
 {z:r.zap_PY, key:"PY", label:"Perimetral Y", L_key:"L_zap_PY_user", hz_key:"hz_zap_PY_user"},
 {z:r.zap_E, key:"E", label:"Esquinera", L_key:"L_zap_E_user", hz_key:"hz_zap_E_user"},
 ];

 return (
 <div>
 <div style={{padding:12, background:C.bgInput, borderRadius:8, marginBottom:14, border:`1px solid ${C.border}`, fontSize:11.5, color:C.textSec, lineHeight:1.5}}>
 ℹ Se predimensiona una zapata por cada tipo de columna. Verifica punzonamiento, cortante uni-direccional y presión de servicio.
 </div>

 {zapatas.map(({z, key, label, L_key, hz_key})=>(
 <Card key={key} title={`Zapata ${label}`} subtitle={`Pu = ${z.Pu.toFixed(2)} tf`} accent={z.ok_total ? C.green : C.red}>
 <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14}}>
 <div>
 <Slider label="L · Lado de zapata" min={0.80} max={4.50} step={0.05}
 value={params[L_key] || z.L_calc}
 onChange={v=>set(L_key,v)} unit="m" fmt={v=>v.toFixed(2)}
 hint={`Calculado: ${z.L_calc.toFixed(2)} m`}
 onReset={()=>reset(L_key)}/>
 <Slider label="hz · Peralte" min={0.30} max={1.50} step={0.05}
 value={params[hz_key] || z.hz_calc}
 onChange={v=>set(hz_key,v)} unit="m" fmt={v=>v.toFixed(2)}
 hint={`Calculado: ${z.hz_calc.toFixed(2)} m`}
 onReset={()=>reset(hz_key)}/>
 </div>
 <div>
 <Row label="P serv" value={z.P_serv.toFixed(2)} unit="tf"/>
 <Row label="qu" value={z.qu.toFixed(2)} unit="tf/m²"/>
 <Row label="Mu" value={z.Mu.toFixed(2)} unit="tf·m"/>
 <Row label="As req" value={z.As_req.toFixed(2)} unit="cm²"/>
 <Row label="Acero" value={`${z.nvar}${z.var_z.nom}@${z.sep.toFixed(1)}cm`}/>
 <Row label="Punz." value={`${z.Vu_punz.toFixed(1)} ≤ ${z.phiVc_punz.toFixed(1)}`} ok={z.punz_ok}/>
 <Row label="Uni." value={`${z.Vu_uni.toFixed(1)} ≤ ${z.phiVc_uni.toFixed(1)}`} ok={z.uni_ok}/>
 <Row label="Presión" value={`${z.q_serv.toFixed(2)} ≤ ${params.qadm}`} ok={z.presion_ok}/>
 </div>
 <div>
 <SvgZapata L={z.L} hz={z.hz} bc={z.bc} d={z.d}
 nvar={z.nvar} sep={z.sep} var_z={z.var_z} qu={z.qu}
 punz_ok={z.punz_ok} label={label} Pu={z.Pu}/>
 </div>
 </div>
 </Card>
 ))}
 </div>
 );
}

// ── TAB 10: RESUMEN ────────────────────────────────────────
function TabResumen({r, params, verifs, todoOK, onContinue, setTab}) {
 const pendientes = verifs.filter(v=>!v.ok);
 return (
 <div>
 <div style={{background: todoOK ? C.greenBg : C.yellowBg, border:`2px solid ${todoOK ? C.green : C.yellow}`, borderRadius:10, padding:18, marginBottom:14}}>
 <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", gap:14, flexWrap:"wrap"}}>
 <div>
 <div style={{fontSize:18, fontWeight:800, color: todoOK?C.green:C.yellow, marginBottom:4}}>
 {todoOK ? "✓ PREDIMENSIONAMIENTO APROBADO" : `⚠ ${pendientes.length} VERIFICACIÓN(ES) PENDIENTE(S)`}
 </div>
 <div style={{fontSize:12, color:C.textSec}}>
 {todoOK ? "Todos los elementos cumplen. Puede continuar a la Fase 2."
 : "Click en cada verificación para ir directo al ajuste."}
 </div>
 </div>
 {todoOK && (
 <button onClick={onContinue} style={{background:C.green, color:"#fff", border:"none", padding:"10px 20px", borderRadius:6, fontWeight:700, fontSize:12, cursor:"pointer", boxShadow:"0 2px 6px rgba(0,0,0,0.15)"}}>
 CONTINUAR A FASE 2 →
 </button>
 )}
 </div>
 </div>

 {!todoOK && (
 <Card title={`🔴 Verificaciones pendientes (${pendientes.length})`} accent={C.red}>
 <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
 {pendientes.map((v,i)=>(
 <button key={i} onClick={()=>setTab(v.tab)} style={{background:C.redBg, color:C.red, border:`1px solid ${C.red}`, borderRadius:6, padding:"6px 12px", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"Inter,Arial"}}>
 ✗ {v.label} → {v.tab}
 </button>
 ))}
 </div>
 </Card>
 )}

 <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
 <Card title="Verificaciones Detalladas" accent={C.primary}>
 <table style={{width:"100%", fontSize:11.5, borderCollapse:"collapse"}}>
 <thead>
 <tr style={{background:C.primary, color:"#fff"}}>
 <th style={{padding:"7px 9px", textAlign:"left"}}>Verificación</th>
 <th style={{padding:"7px 9px", textAlign:"center"}}>Estado</th>
 </tr>
 </thead>
 <tbody>
 {verifs.map((v,i)=>(
 <tr key={i} style={{background: i%2 ? C.bgInput : "#fff"}}>
 <td style={{padding:"7px 9px"}}>{v.label}</td>
 <td style={{padding:"7px 9px", textAlign:"center"}}><Badge ok={v.ok}/></td>
 </tr>
 ))}
 </tbody>
 </table>
 </Card>

 <Card title="Cuadro Resumen Estructural" accent={C.primary}>
 <table style={{width:"100%", fontSize:10.5, borderCollapse:"collapse"}}>
 <thead>
 <tr style={{background:C.primary, color:"#fff"}}>
 <th style={{padding:"6px 8px", textAlign:"left"}}>Elemento</th>
 <th style={{padding:"6px 8px", textAlign:"left"}}>Sección</th>
 <th style={{padding:"6px 8px", textAlign:"left"}}>Acero</th>
 </tr>
 </thead>
 <tbody>
 {[
 ["Losa aligerada", `h=${r.h_al.toFixed(2)}m`, `${r.var_al.n}${r.var_al.nom}/vig`],
 ["Losa maciza", `h=${r.h_mac.toFixed(2)}m`, `X:${r.var_mx.n}${r.var_mx.nom}`],
 ["Viga principal", `${(r.b_vp*100).toFixed(0)}×${(r.h_vp*100).toFixed(0)}cm`, `${r.var_vp.n}${r.var_vp.nom}`],
 ["Viga secund.", `${(r.b_vs*100).toFixed(0)}×${(r.h_vs*100).toFixed(0)}cm`, `${r.var_vs.n}${r.var_vs.nom}`],
 ["Columna unif.", `${r.b_unif}×${r.b_unif}cm`, `${r.var_unif.n*4}${r.var_unif.nom}`],
 ["Placa", `tw=${r.tw.toFixed(2)}m lw=${params.Lw_placa}m`, '∅3/8"@20cm'],
 ["Escalera", `t=${r.t_esc.toFixed(3)}m`, `${r.var_esc.n}${r.var_esc.nom}`],
 ["Zap. Central", `${r.zap_C.L.toFixed(2)}×${r.zap_C.L.toFixed(2)} hz=${r.zap_C.hz.toFixed(2)}m`, `${r.zap_C.nvar}${r.zap_C.var_z.nom}`],
 ].map(([e,s,a],i)=>(
 <tr key={i} style={{background: i%2 ? C.bgInput : "#fff"}}>
 <td style={{padding:"5px 8px", fontWeight:600}}>{e}</td>
 <td style={{padding:"5px 8px"}}>{s}</td>
 <td style={{padding:"5px 8px"}}>{a}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </Card>
 </div>
 </div>
 );
}

// ════════════════════════════════════════════════════════════
// FASE 2 · DISEÑO DETALLADO
// ════════════════════════════════════════════════════════════
function Fase2({r, params, setFase}) {
 const [secTab, setSecTab] = useState("analisis");

 const SECTABS = [
 {id:"analisis", label:"Análisis Modal", icon:"01"},
 {id:"derivas", label:"Derivas y Cortantes", icon:"02"},
 {id:"diagramas", label:"Diagramas Mu y Vu", icon:"03"},
 {id:"columnas", label:"Columnas (P-M)", icon:"04"},
 {id:"vigas", label:"Vigas (despiece)", icon:"05"},
 {id:"losas", label:"Losas (refuerzo)", icon:"06"},
 {id:"placas", label:"Placas (núcleos)", icon:"07"},
 {id:"cimentacion", label:"Cimentación", icon:"08"},
 {id:"cargas", label:"Cuadro de cargas", icon:"09"},
 {id:"planos", label:"Cuadro de Planos", icon:"10"},
 ];

 return (
 <div style={{padding:"14px 18px", maxHeight:"calc(100vh - 116px)", overflowY:"auto"}}>
 <div style={{background:"#fff", borderRadius:8, padding:"10px 14px", border:`1px solid ${C.border}`, marginBottom:14, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
 <div>
 <div style={{fontSize:14, fontWeight:800, color:C.primary}}>🎯 FASE 2 · DISEÑO ESTRUCTURAL DETALLADO</div>
 <div style={{fontSize:11, color:C.textSec, marginTop:2}}>
 Análisis modal · Diagramas P-M biaxial · Refuerzo de armado · Cuadros de despiece tipo expediente técnico
 </div>
 </div>
 <button onClick={()=>setFase(1)} style={{background:C.bgInput, color:C.primary, border:`1px solid ${C.border}`, padding:"7px 14px", borderRadius:6, fontWeight:700, fontSize:11}}>← Volver a Fase 1</button>
 </div>

 <div style={{display:"flex", gap:2, marginBottom:14, borderBottom:`1px solid ${C.border}`, flexWrap:"wrap"}}>
 {SECTABS.map(t=>(
 <button key={t.id} onClick={()=>setSecTab(t.id)} style={{
 padding:"8px 14px", borderRadius:"6px 6px 0 0", border:"none",
 borderBottom: secTab===t.id ? `2px solid ${C.primary}` : `2px solid transparent`,
 marginBottom:-1, cursor:"pointer", fontSize:11.5,
 fontWeight: secTab===t.id ? 700 : 500,
 background: secTab===t.id ? "#fff" : "transparent",
 color: secTab===t.id ? C.primary : C.textSec, fontFamily:"Inter,Arial",
 }}>
 {t.icon} {t.label}
 </button>
 ))}
 </div>

 {secTab === "analisis" && <F2Analisis r={r}/>}
 {secTab === "derivas" && <F2Derivas r={r}/>}
 {secTab === "diagramas" && <F2Diagramas r={r} params={params}/>}
 {secTab === "columnas" && <F2Columnas r={r}/>}
 {secTab === "vigas" && <F2Vigas r={r}/>}
 {secTab === "losas" && <F2Losas r={r}/>}
 {secTab === "placas" && <F2Placas r={r}/>}
 {secTab === "cimentacion" && <F2Cimentacion r={r} params={params}/>}
 {secTab === "cargas" && <F2Cargas r={r} params={params}/>}
 {secTab === "planos" && <F2Planos r={r}/>}
 </div>
 );
}

// ── F2.1 ANÁLISIS MODAL ────────────────────────────────────
function F2Analisis({r}) {
 return (
 <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
 <Card title="📐 Parámetros del Análisis Modal" subtitle="E.030-2018 §29" accent={C.primary}>
 <Row label="Período fundamental T₁" value={r.T.toFixed(3)} unit="s" hi norma="Art. 28.4"/>
 <Row label="Coef. amplificación C" value={r.C_sis.toFixed(3)} norma="Art. 14"/>
 <Row label="ZUCS/R efectivo" value={r.ZUCS_R_efectivo.toFixed(4)}/>
 <Row label="Peso sísmico Ws" value={r.Ws.toFixed(1)} unit="tf" hi/>
 <Row label="(CM + CV·factor) por piso" value={`${r.factor_CV*100}% CV`}/>
 <Row label="Cortante basal V" value={r.V_basal.toFixed(2)} unit="tf"/>
 <Row label="Momento de volteo M_OTM" value={r.M_volteo.toFixed(1)} unit="tf·m"/>
 <Row label="k (exponente Fi)" value={r.k_dist.toFixed(3)}/>
 </Card>

 <Card title="🎵 Modos de Vibración (aproximados)" subtitle="Análisis modal real en ETABS/SAP2000" accent={C.accent}>
 <table style={{width:"100%", fontSize:11.5, borderCollapse:"collapse"}}>
 <thead>
 <tr style={{background:C.primary, color:"#fff"}}>
 <th style={{padding:"6px 9px"}}>Modo</th>
 <th style={{padding:"6px 9px", textAlign:"right"}}>T (s)</th>
 <th style={{padding:"6px 9px", textAlign:"right"}}>f (Hz)</th>
 <th style={{padding:"6px 9px", textAlign:"right"}}>Masa Part.</th>
 <th style={{padding:"6px 9px", textAlign:"right"}}>Σ Masa</th>
 </tr>
 </thead>
 <tbody>
 {r.modos.map((m,i)=>{
 const sumM = r.modos.slice(0,i+1).reduce((a,x)=>a+x.masaPart, 0);
 return (
 <tr key={m.modo} style={{background: m.modo%2 ? C.bgInput : "#fff"}}>
 <td style={{padding:"6px 9px", fontWeight:700, color:C.primary, textAlign:"center"}}>{m.modo}</td>
 <td style={{padding:"6px 9px", textAlign:"right"}}>{m.T.toFixed(3)}</td>
 <td style={{padding:"6px 9px", textAlign:"right"}}>{m.f.toFixed(2)}</td>
 <td style={{padding:"6px 9px", textAlign:"right"}}>{(m.masaPart*100).toFixed(1)}%</td>
 <td style={{padding:"6px 9px", textAlign:"right", color:sumM>=0.9?C.green:C.textSec, fontWeight:600}}>{(sumM*100).toFixed(1)}%</td>
 </tr>
 );
 })}
 </tbody>
 </table>
 <div style={{marginTop:10, padding:10, background:C.yellowBg, borderRadius:6, fontSize:11, lineHeight:1.4}}>
 <strong>⚠ Aproximación:</strong> En análisis dinámico real con ETABS los períodos varían ±25%. La suma de masas participativas debe ser ≥ 90% (E.030 §29.1.2).
 </div>
 </Card>

 <div style={{gridColumn:"1/-1"}}>
 <Card title="📈 Espectro de pseudo-aceleraciones Sa(T)" subtitle="E.030-2018" accent={C.primary}>
 <div style={{height:340}}>
 <ResponsiveContainer>
 <LineChart data={r.espectro} margin={{top:10,right:20,left:10,bottom:10}}>
 <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
 <XAxis dataKey="T" tick={{fontSize:10}} label={{value:"Período T (s)", position:"insideBottom", offset:-5, fontSize:11}}/>
 <YAxis tick={{fontSize:10}} label={{value:"Sa (m/s²)", angle:-90, position:"insideLeft", fontSize:11}}/>
 <Tooltip/>
 <ReferenceLine x={r.T} stroke={C.red} strokeDasharray="4 3" label={{value:`T₁=${r.T.toFixed(2)}s`, fontSize:10, fill:C.red}}/>
 <ReferenceLine x={r.Tp} stroke={C.orange} strokeDasharray="3 3" label={{value:`Tp`, fontSize:10, fill:C.orange}}/>
 <ReferenceLine x={r.Tl} stroke={C.purple} strokeDasharray="3 3" label={{value:`TL`, fontSize:10, fill:C.purple}}/>
 <Line dataKey="Sa" stroke={C.primary} strokeWidth={2.5} dot={false} name="Sa(T)"/>
 </LineChart>
 </ResponsiveContainer>
 </div>
 </Card>
 </div>

 <div style={{gridColumn:"1/-1"}}>
 <Card title="📊 Distribución vertical de fuerzas sísmicas" subtitle="E.030-2018 §28.6" accent={C.accent}>
 <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
 <table style={{width:"100%", fontSize:11, borderCollapse:"collapse"}}>
 <thead>
 <tr style={{background:C.primary, color:"#fff"}}>
 <th style={{padding:"6px 9px"}}>Piso</th>
 <th style={{padding:"6px 9px"}}>h (m)</th>
 <th style={{padding:"6px 9px"}}>Pi (tf)</th>
 <th style={{padding:"6px 9px"}}>Fi (tf)</th>
 <th style={{padding:"6px 9px"}}>Vi (tf)</th>
 </tr>
 </thead>
 <tbody>
 {r.distribucion.slice().reverse().map((d,i)=>{
 const vc = r.cortantes_piso.find(v=>v.piso===d.piso);
 return (
 <tr key={d.piso} style={{background: i%2 ? C.bgInput : "#fff"}}>
 <td style={{padding:"5px 9px", fontWeight:700, color:C.primary, textAlign:"center"}}>{d.piso}</td>
 <td style={{padding:"5px 9px", textAlign:"right"}}>{d.hi.toFixed(2)}</td>
 <td style={{padding:"5px 9px", textAlign:"right"}}>{d.Pi.toFixed(1)}</td>
 <td style={{padding:"5px 9px", textAlign:"right", color:C.red, fontWeight:600}}>{d.Fi.toFixed(2)}</td>
 <td style={{padding:"5px 9px", textAlign:"right", color:C.green, fontWeight:600}}>{vc?vc.Vi.toFixed(2):""}</td>
 </tr>
 );
 })}
 <tr style={{background:C.primary, color:"#fff", fontWeight:700}}>
 <td colSpan={3} style={{padding:"6px 9px", textAlign:"right"}}>Σ V basal:</td>
 <td style={{padding:"6px 9px", textAlign:"right"}}>{r.V_basal.toFixed(2)}</td>
 <td></td>
 </tr>
 </tbody>
 </table>
 <div style={{height:340}}>
 <ResponsiveContainer>
 <BarChart data={r.distribucion} layout="vertical" margin={{top:15, right:30, left:25, bottom:25}}>
 <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
 <XAxis type="number" tick={{fontSize:10}}/>
 <YAxis dataKey="piso" type="category" tick={{fontSize:10}}/>
 <Tooltip/>
 <Legend wrapperStyle={{fontSize:10}}/>
 <Bar dataKey="Fi" fill={C.primary} radius={[0,4,4,0]} name="Fi (tf)"/>
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>
 </Card>
 </div>
 </div>
 );
}

// ── F2.2 DERIVAS Y CORTANTES POR PISO ──────────────────────
function F2Derivas({r}) {
 return (
 <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
 <Card title="📐 Verificación de Derivas" subtitle="E.030 §5.2 · Δ/h ≤ 0.007" accent={r.deriva_ok?C.green:C.red}>
 <Row label="Drift máximo" value={(r.drift_max*1000).toFixed(2)} unit="‰" hi/>
 <Row label="Límite normativo" value={(r.drift_lim*1000).toFixed(1)} unit="‰"/>
 <Row label="Verificación" value={r.deriva_ok?"CUMPLE":"NO CUMPLE"} ok={r.deriva_ok}/>
 <Row label="Rigidez lateral K" value={r.K_lat.toFixed(2)} unit="tf/cm"/>
 <Row label="Junta sísmica calc." value={(r.s_junta*100).toFixed(1)} unit="cm" norma="E.030 §5.3"/>
 {!r.deriva_ok && (
 <div style={{marginTop:10, padding:10, background:C.redBg, borderRadius:6, fontSize:11, lineHeight:1.5, border:`1px solid ${C.red}`}}>
 <strong>⚠ Acciones:</strong>
 <ul style={{marginTop:6, paddingLeft:18}}>
 <li>Aumentar tw o lw</li>
 <li>Aumentar N° placas</li>
 <li>Análisis dinámico en ETABS</li>
 </ul>
 </div>
 )}
 </Card>

 <Card title="📊 Derivas por piso" accent={C.primary}>
 <div style={{height:300}}>
 <ResponsiveContainer>
 <BarChart data={r.derivas.map(d=>({piso:d.piso, drift:+(d.drift*1000).toFixed(2)}))} layout="vertical" margin={{top:15, right:30, left:25, bottom:25}}>
 <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
 <XAxis type="number" tick={{fontSize:10}} label={{value:"Drift (‰)", position:"insideBottom", offset:-2, fontSize:11}}/>
 <YAxis dataKey="piso" type="category" tick={{fontSize:10}}/>
 <Tooltip/>
 <ReferenceLine x={r.drift_lim*1000} stroke={C.red} strokeWidth={2} label={{value:`Lim ${(r.drift_lim*1000).toFixed(1)}‰`, fontSize:10, fill:C.red, position:"top"}}/>
 <Bar dataKey="drift" fill={C.primary} radius={[0,4,4,0]}/>
 </BarChart>
 </ResponsiveContainer>
 </div>
 </Card>

 <div style={{gridColumn:"1/-1"}}>
 <Card title="Tabla detallada de derivas por piso" accent={C.primary}>
 <table style={{width:"100%", fontSize:11.5, borderCollapse:"collapse"}}>
 <thead>
 <tr style={{background:C.primary, color:"#fff"}}>
 <th style={{padding:"6px 9px"}}>Piso</th>
 <th style={{padding:"6px 9px"}}>h_i (m)</th>
 <th style={{padding:"6px 9px"}}>Δ_elast (cm)</th>
 <th style={{padding:"6px 9px"}}>Δ_inel = 0.75R·Δe (cm)</th>
 <th style={{padding:"6px 9px"}}>Drift = Δ/h</th>
 <th style={{padding:"6px 9px"}}>Estado</th>
 </tr>
 </thead>
 <tbody>
 {r.derivas.slice().reverse().map((d,i)=>(
 <tr key={d.piso} style={{background: i%2 ? C.bgInput : "#fff"}}>
 <td style={{padding:"5px 9px", textAlign:"center", fontWeight:700, color:C.primary}}>{d.piso}</td>
 <td style={{padding:"5px 9px", textAlign:"right"}}>{d.hi.toFixed(2)}</td>
 <td style={{padding:"5px 9px", textAlign:"right"}}>{d.Δ_elast.toFixed(3)}</td>
 <td style={{padding:"5px 9px", textAlign:"right"}}>{d.Δ_inel.toFixed(2)}</td>
 <td style={{padding:"5px 9px", textAlign:"right", fontWeight:700, color: d.drift<=r.drift_lim ? C.green : C.red}}>{(d.drift*1000).toFixed(2)}‰</td>
 <td style={{padding:"5px 9px", textAlign:"center"}}><Badge ok={d.drift<=r.drift_lim}/></td>
 </tr>
 ))}
 </tbody>
 </table>
 </Card>
 </div>

 <div style={{gridColumn:"1/-1"}}>
 <Card title="📊 Cortante por piso" accent={C.accent}>
 <div style={{height:320}}>
 <ResponsiveContainer>
 <LineChart data={r.cortantes_piso.slice().reverse()} margin={{top:10, right:20, left:10, bottom:5}}>
 <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
 <XAxis dataKey="piso" tick={{fontSize:10}} label={{value:"Piso", position:"insideBottom", offset:-2}}/>
 <YAxis tick={{fontSize:10}} label={{value:"Vi (tf)", angle:-90, position:"insideLeft", fontSize:11}}/>
 <Tooltip/>
 <Line dataKey="Vi" stroke={C.red} strokeWidth={2.5} dot={{r:4, fill:C.red}} name="Cortante (tf)"/>
 </LineChart>
 </ResponsiveContainer>
 </div>
 </Card>
 </div>
 </div>
 );
}

// ── F2.3 DIAGRAMAS Mu/Vu ───────────────────────────────────
function F2Diagramas({r, params}) {
 // Generar diagrama de momentos para viga principal (envolvente)
 const Mu_max_neg = r.Mu_vp_neg_ext;
 const Mu_max_pos = r.Mu_vp_pos_ext;
 const Lv = r.Lx_max;
 // Diagrama parabólico aproximado (más puntos para curva suave)
 const diagMu = [];
 for (let i = 0; i <= 30; i++) {
 const x = (i/30) * Lv;
 // Aproximación cúbica para empotrado/empotrado
 const M = Mu_max_neg - (Mu_max_neg+Mu_max_pos)*(4*x*(Lv-x)/(Lv*Lv));
 diagMu.push({x: +x.toFixed(2), M: +M.toFixed(2)});
 }
 // Cortante variable lineal
 const diagVu = [];
 const Vmax = r.Vu_vp;
 for (let i = 0; i <= 30; i++) {
 const x = (i/30) * Lv;
 const V = Vmax * (1 - 2*x/Lv);
 diagVu.push({x: +x.toFixed(2), V: +V.toFixed(2)});
 }

 return (
 <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
 <Card title="Diagrama de Momentos Mu · Viga Principal" subtitle="Envolvente · viga empotrada" accent={C.primary}>
 <div style={{height:360}}>
 <ResponsiveContainer>
 <LineChart data={diagMu} margin={{top:20, right:30, left:30, bottom:40}}>
 <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
 <XAxis dataKey="x" tick={{fontSize:11}}
   label={{value:"Posición x (m)", position:"insideBottom", offset:-8, fontSize:12, fontWeight:600}}
   domain={[0, Lv]} type="number"/>
 <YAxis tick={{fontSize:11}}
   label={{value:"Mu (tf·m)", angle:-90, position:"insideLeft", fontSize:12, fontWeight:600, offset:10}}/>
 <Tooltip formatter={v=>v.toFixed(2)+" tf·m"} labelFormatter={x=>`x = ${x} m`}/>
 <ReferenceLine y={0} stroke="#000" strokeWidth={1}/>
 <Line dataKey="M" stroke={C.primary} strokeWidth={2.5} dot={false} name="Mu" isAnimationActive={false}/>
 </LineChart>
 </ResponsiveContainer>
 </div>
 <div style={{marginTop:8, padding:10, background:C.bgInput, borderRadius:6, fontSize:11.5, lineHeight:1.6}}>
   <div><strong>Mu(-) ext:</strong> {Mu_max_neg.toFixed(2)} tf·m <span style={{color:C.textMute}}>(apoyo)</span></div>
   <div><strong>Mu(+) ext:</strong> {Mu_max_pos.toFixed(2)} tf·m <span style={{color:C.textMute}}>(tramo)</span></div>
   <div><strong>Luz Lv:</strong> {Lv.toFixed(2)} m</div>
 </div>
 </Card>

 <Card title="Diagrama de Cortantes Vu · Viga Principal" subtitle="Distribución lineal" accent={C.accent}>
 <div style={{height:360}}>
 <ResponsiveContainer>
 <LineChart data={diagVu} margin={{top:20, right:30, left:30, bottom:40}}>
 <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
 <XAxis dataKey="x" tick={{fontSize:11}}
   label={{value:"Posición x (m)", position:"insideBottom", offset:-8, fontSize:12, fontWeight:600}}
   domain={[0, Lv]} type="number"/>
 <YAxis tick={{fontSize:11}}
   label={{value:"Vu (tf)", angle:-90, position:"insideLeft", fontSize:12, fontWeight:600, offset:10}}/>
 <Tooltip formatter={v=>v.toFixed(2)+" tf"} labelFormatter={x=>`x = ${x} m`}/>
 <ReferenceLine y={0} stroke="#000" strokeWidth={1}/>
 <ReferenceLine y={r.phiVc_vp} stroke={C.green} strokeDasharray="6 3" strokeWidth={1.5}
   label={{value:`φVc = ${r.phiVc_vp.toFixed(1)}`, fontSize:11, fill:C.green, position:"top"}}/>
 <ReferenceLine y={-r.phiVc_vp} stroke={C.green} strokeDasharray="6 3" strokeWidth={1.5}/>
 <Line dataKey="V" stroke={C.red} strokeWidth={2.5} dot={false} name="Vu" isAnimationActive={false}/>
 </LineChart>
 </ResponsiveContainer>
 </div>
 <div style={{marginTop:8, padding:10, background:C.bgInput, borderRadius:6, fontSize:11.5, lineHeight:1.6}}>
   <div><strong>Vu máx:</strong> {Vmax.toFixed(2)} tf</div>
   <div><strong>φVc:</strong> {r.phiVc_vp.toFixed(2)} tf</div>
   <div><strong>Verificación:</strong> <span style={{color: r.cort_vp_ok?C.green:C.red, fontWeight:700}}>{r.cort_vp_ok ? "CUMPLE" : "REVISAR"}</span></div>
 </div>
 </Card>

 <div style={{gridColumn:"1/-1"}}>
 <Card title="Resumen de momentos y cortantes (Fase 2)" accent={C.primary}>
 <table style={{width:"100%", fontSize:11.5, borderCollapse:"collapse"}}>
 <thead>
 <tr style={{background:C.primary, color:"#fff"}}>
 <th style={{padding:"6px 9px", textAlign:"left"}}>Elemento / Sección</th>
 <th style={{padding:"6px 9px", textAlign:"right"}}>Mu (-) tf·m</th>
 <th style={{padding:"6px 9px", textAlign:"right"}}>Mu (+) tf·m</th>
 <th style={{padding:"6px 9px", textAlign:"right"}}>Vu tf</th>
 <th style={{padding:"6px 9px", textAlign:"right"}}>As (-) cm²</th>
 <th style={{padding:"6px 9px", textAlign:"right"}}>As (+) cm²</th>
 </tr>
 </thead>
 <tbody>
 <tr>
 <td style={{padding:"7px 9px", fontWeight:700, color:C.primary}}>Viga Principal · Apoyo ext.</td>
 <td style={{padding:"7px 9px", textAlign:"right", fontWeight:700}}>{r.Mu_vp_neg_ext.toFixed(2)}</td>
 <td style={{padding:"7px 9px", textAlign:"right"}}>{r.Mu_vp_pos_ext.toFixed(2)}</td>
 <td style={{padding:"7px 9px", textAlign:"right", color:C.red, fontWeight:700}}>{r.Vu_vp.toFixed(2)}</td>
 <td style={{padding:"7px 9px", textAlign:"right"}}>{r.As_vp.toFixed(2)}</td>
 <td style={{padding:"7px 9px", textAlign:"right"}}>{r.As_vp_pos.toFixed(2)}</td>
 </tr>
 <tr style={{background:C.bgInput}}>
 <td style={{padding:"7px 9px", fontWeight:700, color:C.primary}}>Viga Principal · Apoyo int.</td>
 <td style={{padding:"7px 9px", textAlign:"right"}}>{r.Mu_vp_neg_int.toFixed(2)}</td>
 <td style={{padding:"7px 9px", textAlign:"right"}}>{r.Mu_vp_pos_int.toFixed(2)}</td>
 <td style={{padding:"7px 9px", textAlign:"right"}}>{r.Vu_vp.toFixed(2)}</td>
 <td style={{padding:"7px 9px", textAlign:"right"}}>{(r.Mu_vp_neg_int*1e5/(0.9*4200*0.9*r.d_vp*100)).toFixed(2)}</td>
 <td style={{padding:"7px 9px", textAlign:"right"}}>{(r.Mu_vp_pos_int*1e5/(0.9*4200*0.9*r.d_vp*100)).toFixed(2)}</td>
 </tr>
 <tr>
 <td style={{padding:"7px 9px", fontWeight:700, color:C.primary}}>Viga Secundaria</td>
 <td style={{padding:"7px 9px", textAlign:"right", fontWeight:700}}>{r.Mu_vs.toFixed(2)}</td>
 <td style={{padding:"7px 9px", textAlign:"right"}}>{(r.Mu_vs*0.64).toFixed(2)}</td>
 <td style={{padding:"7px 9px", textAlign:"right", color:C.red, fontWeight:700}}>{r.Vu_vs.toFixed(2)}</td>
 <td style={{padding:"7px 9px", textAlign:"right"}}>{r.As_vs.toFixed(2)}</td>
 <td style={{padding:"7px 9px", textAlign:"right"}}>{(r.As_vs*0.64).toFixed(2)}</td>
 </tr>
 </tbody>
 </table>
 </Card>
 </div>
 </div>
 );
}

// ── F2.4 COLUMNAS · P-M BIAXIAL ────────────────────────────
function F2Columnas({r}) {
 // Datos del diagrama P-M para gráfica
 const data = [];
 r.diagPM.forEach(pt => data.push({M: +pt.M.toFixed(2), P: +pt.P.toFixed(1), etiqueta: pt.etiqueta}));
 r.diagPM.slice().reverse().forEach(pt => data.push({M: -pt.M, P: pt.P}));

 return (
 <div>
 <div style={{display:"grid", gridTemplateColumns:"1.2fr 1fr", gap:14}}>
 <Card title="⚖ Diagrama de Interacción P-M" subtitle="Columna unificada · eje fuerte" accent={C.primary}>
 <div style={{height:380}}>
 <ResponsiveContainer>
 <LineChart data={data} margin={{top:20, right:30, left:30, bottom:20}}>
 <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
 <XAxis type="number" dataKey="M" tick={{fontSize:10}} label={{value:"Mn (tf·m)", position:"insideBottom", offset:-5, fontSize:11}}/>
 <YAxis tick={{fontSize:10}} label={{value:"Pn (tf)", angle:-90, position:"insideLeft", fontSize:11}}/>
 <Tooltip/>
 <ReferenceLine y={0} stroke={C.gray}/>
 <ReferenceLine x={0} stroke={C.gray}/>
 <Line dataKey="P" stroke={C.primary} strokeWidth={2.5} dot={{r:4, fill:C.primary}} name="φPn-φMn"/>
 </LineChart>
 </ResponsiveContainer>
 </div>
 </Card>

 <Card title="📍 Puntos de carga real (Pu, Mu)" accent={C.accent}>
 <table style={{width:"100%", fontSize:11.5, borderCollapse:"collapse"}}>
 <thead>
 <tr style={{background:C.primary, color:"#fff"}}>
 <th style={{padding:"6px 9px", textAlign:"left"}}>Tipo</th>
 <th style={{padding:"6px 9px", textAlign:"right"}}>Pu (tf)</th>
 <th style={{padding:"6px 9px", textAlign:"right"}}>Mu (tf·m)</th>
 <th style={{padding:"6px 9px", textAlign:"center"}}>OK?</th>
 </tr>
 </thead>
 <tbody>
 {r.puntosCarga.map((pc,i)=>{
 // Verificación Bresler simplificada: punto interior al diagrama
 const interior = pc.P <= r.diagPM[0].P*0.95;
 return (
 <tr key={i} style={{background: i%2 ? C.bgInput : "#fff"}}>
 <td style={{padding:"7px 9px", fontWeight:700, color:pc.color}}>{pc.tipo}</td>
 <td style={{padding:"7px 9px", textAlign:"right"}}>{pc.P.toFixed(1)}</td>
 <td style={{padding:"7px 9px", textAlign:"right"}}>{pc.M.toFixed(2)}</td>
 <td style={{padding:"7px 9px", textAlign:"center"}}><Badge ok={interior}/></td>
 </tr>
 );
 })}
 </tbody>
 </table>
 <div style={{marginTop:10, padding:10, background:C.purpleBg, borderRadius:6, fontSize:11, lineHeight:1.4}}>
 <strong>📐 Bresler (biaxial):</strong> Para flexo-compresión biaxial verificar:
 <div style={{textAlign:"center", fontFamily:"monospace", margin:"4px 0", fontWeight:700}}>1/Pn ≈ 1/Pnx + 1/Pny - 1/Po</div>
 </div>
 </Card>
 </div>

 <Card title="🔧 Detalle de Armado de Columnas" subtitle="NTE E.060 §21.4" accent={C.primary}>
 <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:12}}>
 <DetallesBox titulo="Refuerzo Longitudinal" items={[
 ["Sección", `${r.b_unif}×${r.b_unif} cm`],
 ["Acero principal", r.detalleColumna.longitudinal],
 ["As total", `${r.detalleColumna.As_total_long.toFixed(2)} cm²`],
 ["Cuantía ρ", `${(r.rho_esq*100).toFixed(2)} %`],
 ["L anclaje", `${r.detalleColumna.longitud_anclaje.toFixed(0)} cm`],
 ["L empalme (50%)", `${r.detalleColumna.longitud_empalme.toFixed(0)} cm`],
 ]}/>
 <DetallesBox titulo="Estribos · Zona Confinada" items={[
 ["Diámetro estribo", '∅3/8" (9.5 mm)'],
 ["Separación s_o", `${r.s_conf.toFixed(0)} mm`],
 ["Longitud Lo", `${r.Lo_col.toFixed(0)} mm`],
 ["Posición", "Ambos extremos"],
 ["Ganchos sísmicos", "135° (obligatorio)"],
 ["Norma", "E.060 §21.4.4"],
 ]}/>
 <DetallesBox titulo="Estribos · Zona Central" items={[
 ["Diámetro", '∅3/8" (9.5 mm)'],
 ["Separación", `${Math.min(r.b_unif*10*0.7, 200).toFixed(0)} mm`],
 ["Tipo", "Cerrados ganchos 135°"],
 ["Recubrimiento libre", "4.0 cm"],
 ["Verif. esbeltez λ", `${r.esb.toFixed(2)} ≤ 12`],
 ["Verif. k·lu/r", `${r.esb_klu_r.toFixed(1)} ≤ 100`],
 ]}/>
 </div>
 </Card>
 </div>
 );
}

// ── F2.5 VIGAS - DESPIECE ─────────────────────────────────
function F2Vigas({r}) {
 const dE = r.detalleEstribos;
 return (
 <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
 <Card title="━ Refuerzo de Flexión · Coef. ACI 318-19 §6.5.2" accent={C.primary}>
 <Row label="Sección" value={`${(r.b_vp*100).toFixed(0)}×${(r.h_vp*100).toFixed(0)} cm`}/>
 <Row label="Mu(-) ext = wL²/9" value={r.Mu_vp_neg_ext.toFixed(2)} unit="tf·m" hi/>
 <Row label="Mu(+) ext = wL²/14" value={r.Mu_vp_pos_ext.toFixed(2)} unit="tf·m"/>
 <Row label="Mu(-) int = wL²/11" value={r.Mu_vp_neg_int.toFixed(2)} unit="tf·m"/>
 <Row label="Mu(+) int = wL²/16" value={r.Mu_vp_pos_int.toFixed(2)} unit="tf·m"/>
 <div style={{marginTop:10, padding:10, background:C.bgInput, borderRadius:6, fontSize:11, lineHeight:1.7}}>
 <div><strong>Acero superior (-):</strong> {r.var_vp.n}{r.var_vp.nom} corrido + bastones</div>
 <div><strong>Acero inferior (+):</strong> {r.var_vp_pos.n}{r.var_vp_pos.nom} corrido</div>
 <div><strong>L anclaje:</strong> {dE.longitud_anclaje.toFixed(0)} cm · <strong>L empalme:</strong> {dE.longitud_empalme.toFixed(0)} cm</div>
 </div>
 </Card>

 <Card title="━ Refuerzo Transversal · Estribos" subtitle="NTE E.060 §21.4.4" accent={C.orange}>
 <Row label="Vu actuante" value={r.Vu_vp.toFixed(2)} unit="tf"/>
 <Row label="φVc resistencia" value={r.phiVc_vp.toFixed(2)} unit="tf"/>
 <Row label="Longitud confinada Lconf" value={dE.Lconf.toFixed(2)} unit="m" norma="2h"/>
 <Row label="Separación zona conf." value={(dE.s_conf_zona*100).toFixed(1)} unit="cm"/>
 <Row label="Separación zona corr." value={(dE.s_corr_zona*100).toFixed(1)} unit="cm"/>
 <Row label="N° estribos conf. (c/extr.)" value={dE.n_estribos_conf}/>
 <Row label="N° estribos corriente" value={dE.n_estribos_corr}/>
 </Card>

 <div style={{gridColumn:"1/-1"}}>
 <Card title="📐 Despiece Esquemático de Viga Principal" accent={C.primary}>
 <div style={{padding:14, background:"#FAFCFE", borderRadius:6, border:`1px solid ${C.border}`}}>
 <svg viewBox="0 0 800 200" style={{width:"100%", height:200}}>
 {/* Viga */}
 <rect x="40" y="60" width="720" height="60" fill={C.lblue} stroke={C.primary} strokeWidth={1.5}/>
 {/* Zonas confinadas */}
 <rect x="40" y="60" width="90" height="60" fill={C.red} fillOpacity={0.15} stroke={C.red} strokeWidth={1} strokeDasharray="4,2"/>
 <rect x="670" y="60" width="90" height="60" fill={C.red} fillOpacity={0.15} stroke={C.red} strokeWidth={1} strokeDasharray="4,2"/>
 {/* Estribos zona conf izq */}
 {Array.from({length:Math.min(dE.n_estribos_conf, 8)},(_,i)=>{
 const px = 48 + (i+1)*(80/(Math.min(dE.n_estribos_conf,8)+1));
 return <line key={`l${i}`} x1={px} y1={60} x2={px} y2={120} stroke={C.orange} strokeWidth={1.8}/>;
 })}
 {/* Estribos zona corriente */}
 {Array.from({length:Math.min(dE.n_estribos_corr, 12)},(_,i)=>{
 const px = 135 + (i+1)*(530/(Math.min(dE.n_estribos_corr,12)+1));
 return <line key={`c${i}`} x1={px} y1={60} x2={px} y2={120} stroke={C.gray} strokeWidth={1.2} opacity={0.7}/>;
 })}
 {/* Estribos zona conf der */}
 {Array.from({length:Math.min(dE.n_estribos_conf, 8)},(_,i)=>{
 const px = 678 + (i+1)*(80/(Math.min(dE.n_estribos_conf,8)+1));
 return <line key={`r${i}`} x1={px} y1={60} x2={px} y2={120} stroke={C.orange} strokeWidth={1.8}/>;
 })}
 {/* Acero longitudinal */}
 <line x1="40" y1="70" x2="760" y2="70" stroke={C.primary} strokeWidth={2.5} strokeLinecap="round"/>
 <line x1="40" y1="110" x2="760" y2="110" stroke={C.primary} strokeWidth={2.5} strokeLinecap="round"/>
 {/* Bastones negativos */}
 <line x1="40" y1="65" x2="220" y2="65" stroke={C.red} strokeWidth={2} strokeLinecap="round"/>
 <line x1="580" y1="65" x2="760" y2="65" stroke={C.red} strokeWidth={2} strokeLinecap="round"/>
 {/* Cotas */}
 <text x="85" y="50" textAnchor="middle" fontSize={11} fill={C.red} fontWeight={700}>Lconf={dE.Lconf.toFixed(2)}m</text>
 <text x="85" y="142" textAnchor="middle" fontSize={10} fill={C.orange}>{r.detalleEstribos.s_conf_zona*100|0}cm</text>
 <text x="400" y="142" textAnchor="middle" fontSize={10} fill={C.gray}>s={(dE.s_corr_zona*100).toFixed(0)}cm</text>
 <text x="715" y="50" textAnchor="middle" fontSize={11} fill={C.red} fontWeight={700}>Lconf={dE.Lconf.toFixed(2)}m</text>
 <text x="400" y="80" textAnchor="middle" fontSize={10} fill={C.primary} fontWeight={700}>{r.var_vp.n}{r.var_vp.nom} (corrido)</text>
 <text x="400" y="100" textAnchor="middle" fontSize={10} fill={C.primary} fontWeight={700}>{r.var_vp_pos.n}{r.var_vp_pos.nom} (+)</text>
 <text x="130" y="58" textAnchor="middle" fontSize={9} fill={C.red}>bastones (-)</text>
 <text x="670" y="58" textAnchor="middle" fontSize={9} fill={C.red}>bastones (-)</text>
 <line x1="40" y1="160" x2="760" y2="160" stroke={C.gray} strokeWidth={0.8}/>
 <text x="400" y="180" textAnchor="middle" fontSize={11} fill={C.gray} fontWeight={700}>L = {r.Lx_max.toFixed(2)} m</text>
 </svg>
 </div>
 </Card>
 </div>
 </div>
 );
}

// ── F2.6 LOSAS · REFUERZO ─────────────────────────────────
function F2Losas({r}) {
 const dL = r.detalleLosa;
 return (
 <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
 <Card title="▤ Losa Aligerada · Refuerzo detallado" accent={C.primary}>
 <Row label="Peralte adoptado" value={r.h_al.toFixed(2)} unit="m"/>
 <Row label="Acero principal/vigueta" value={dL.aligerada.acero_principal}/>
 <Row label="As principal" value={dL.aligerada.As_principal.toFixed(2)} unit="cm²"/>
 <Row label="Acero temperatura" value={dL.aligerada.acero_temperatura}/>
 <Row label="As temperatura" value={dL.aligerada.As_temp.toFixed(2)} unit="cm²/m"/>
 <Row label="Bastones en apoyo" value={dL.aligerada.bastones_apoyo}/>
 <Row label="Δ inmediata" value={r.delta_al.toFixed(2)} unit="cm"/>
 <Row label="Lím L/360" value={r.delta_lim_al.toFixed(2)} unit="cm" ok={r.defl_al_ok}/>
 </Card>

 <Card title="▥ Losa Maciza · Refuerzo bidireccional" accent={C.primary}>
 <Row label="Peralte adoptado" value={r.h_mac.toFixed(2)} unit="m"/>
 <Row label="Refuerzo X inferior" value={dL.maciza.acero_x_inferior}/>
 <Row label="Refuerzo Y inferior" value={dL.maciza.acero_y_inferior}/>
 <Row label="Bastones (-) X" value={dL.maciza.bastones_negativos_x}/>
 <Row label="Bastones (-) Y" value={dL.maciza.bastones_negativos_y}/>
 <Row label="Temperatura" value={dL.maciza.acero_temp}/>
 <Row label="As mín ACI §24.4.3" value={r.As_mac_min.toFixed(2)} unit="cm²/m"/>
 </Card>
 </div>
 );
}

// ── F2.7 PLACAS · NÚCLEOS ─────────────────────────────────
function F2Placas({r}) {
 const dP = r.detallePlaca;
 return (
 <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
 <Card title="▥ Refuerzo del Alma" subtitle="E.060 §21.9.6" accent={C.primary}>
 <Row label="Refuerzo horizontal" value={dP.refuerzo_alma_h}/>
 <Row label="Refuerzo vertical" value={dP.refuerzo_alma_v}/>
 <Row label="As del alma" value={dP.As_alma.toFixed(2)} unit="cm²/m"/>
 <Row label="Espesor tw" value={r.tw.toFixed(2)} unit="m"/>
 <Row label="ρ horizontal" value="0.25 %"/>
 <Row label="ρ vertical" value="0.25 %"/>
 </Card>

 <Card title="🔒 Núcleos Confinados (bordes)" subtitle="E.060 §21.9.7" accent={C.orange}>
 <Row label="Longitud núcleo" value={dP.nucleo_confinado_lado.toFixed(2)} unit="m"/>
 <Row label="Refuerzo longitudinal" value={dP.refuerzo_nucleo_long}/>
 <Row label="As núcleo" value={dP.As_nucleo.toFixed(2)} unit="cm²"/>
 <Row label="Estribos núcleo" value={dP.estribos_nucleo}/>
 <Row label="Mu volteo (placa)" value={r.Mu_placa.toFixed(2)} unit="tf·m"/>
 <Row label="V por placa" value={r.V_placa.toFixed(2)} unit="tf"/>
 </Card>
 </div>
 );
}

// ── F2.8 CIMENTACIÓN ──────────────────────────────────────
function F2Cimentacion({r, params}) {
 return (
 <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
 <Card title="⊥ Diseño detallado · Zapatas Aisladas" subtitle="ACI 318-19 §13 / NTE E.050" accent={C.primary}>
 <table style={{width:"100%", fontSize:11.5, borderCollapse:"collapse"}}>
 <thead>
 <tr style={{background:C.primary, color:"#fff"}}>
 <th style={{padding:"6px 8px", textAlign:"left"}}>Tipo</th>
 <th style={{padding:"6px 8px", textAlign:"right"}}>L</th>
 <th style={{padding:"6px 8px", textAlign:"right"}}>hz</th>
 <th style={{padding:"6px 8px", textAlign:"left"}}>Refuerzo</th>
 <th style={{padding:"6px 8px", textAlign:"center"}}>Estado</th>
 </tr>
 </thead>
 <tbody>
 {[r.zap_C, r.zap_PX, r.zap_PY, r.zap_E].map((z,i)=>(
 <tr key={i} style={{background: i%2 ? C.bgInput : "#fff"}}>
 <td style={{padding:"7px 8px", fontWeight:600}}>{z.label}</td>
 <td style={{padding:"7px 8px", textAlign:"right"}}>{z.L.toFixed(2)}</td>
 <td style={{padding:"7px 8px", textAlign:"right"}}>{z.hz.toFixed(2)}</td>
 <td style={{padding:"7px 8px"}}>{z.nvar}{z.var_z.nom}@{z.sep.toFixed(1)}cm</td>
 <td style={{padding:"7px 8px", textAlign:"center"}}><Badge ok={z.ok_total}/></td>
 </tr>
 ))}
 </tbody>
 </table>
 </Card>

 <Card title="🌍 Recomendaciones de Cimentación" subtitle="NTE E.050-2018" accent={C.orange}>
 <div style={{fontSize:11.5, lineHeight:1.6, color:C.text}}>
 <p style={{marginBottom:8}}><strong>Vigas de cimentación:</strong> conectar zapatas adyacentes (sismo alto Z3/Z4). Sección típica 30×60 cm.</p>
 <p style={{marginBottom:8}}><strong>Cuantía mínima:</strong> As ≥ 0.0018·Ag (ACI §24.4.3.2).</p>
 <p style={{marginBottom:8}}><strong>Recubrimiento:</strong> 7.5 cm inferior (E.060 §7.7).</p>
 <p style={{marginBottom:8}}><strong>Anclaje:</strong> Ldh ≥ 16·db + ø180°.</p>
 <p style={{marginBottom:8}}><strong>Capacidad:</strong> q_adm = {params.qadm} tf/m² (verificar estudio geotécnico).</p>
 <p style={{marginBottom:0}}><strong>Asentamientos:</strong> verificar Δ_inmed + Δ_diferido en SAFE con módulo de balasto k ≈ 4.5·qadm/2.54 (tf/m³).</p>
 </div>
 </Card>

 <div style={{gridColumn:"1/-1"}}>
 <Card title="Verificación detallada por zapata" accent={C.primary}>
 <table style={{width:"100%", fontSize:11, borderCollapse:"collapse"}}>
 <thead>
 <tr style={{background:C.primary, color:"#fff"}}>
 <th style={{padding:"6px 8px"}}>Tipo</th>
 <th style={{padding:"6px 8px", textAlign:"right"}}>Pu (tf)</th>
 <th style={{padding:"6px 8px", textAlign:"right"}}>q_serv</th>
 <th style={{padding:"6px 8px", textAlign:"right"}}>q_adm</th>
 <th style={{padding:"6px 8px", textAlign:"right"}}>Vu_punz/φVc</th>
 <th style={{padding:"6px 8px", textAlign:"right"}}>Vu_uni/φVc</th>
 <th style={{padding:"6px 8px", textAlign:"right"}}>Mu</th>
 <th style={{padding:"6px 8px", textAlign:"right"}}>As prov</th>
 </tr>
 </thead>
 <tbody>
 {[r.zap_C, r.zap_PX, r.zap_PY, r.zap_E].map((z,i)=>(
 <tr key={i} style={{background: i%2 ? C.bgInput : "#fff"}}>
 <td style={{padding:"6px 8px", fontWeight:600}}>{z.label}</td>
 <td style={{padding:"6px 8px", textAlign:"right"}}>{z.Pu.toFixed(1)}</td>
 <td style={{padding:"6px 8px", textAlign:"right"}}>{z.q_serv.toFixed(2)}</td>
 <td style={{padding:"6px 8px", textAlign:"right"}}>{params.qadm}</td>
 <td style={{padding:"6px 8px", textAlign:"right", color:z.punz_ok?C.green:C.red, fontWeight:600}}>{z.Vu_punz.toFixed(1)}/{z.phiVc_punz.toFixed(1)}</td>
 <td style={{padding:"6px 8px", textAlign:"right", color:z.uni_ok?C.green:C.red, fontWeight:600}}>{z.Vu_uni.toFixed(1)}/{z.phiVc_uni.toFixed(1)}</td>
 <td style={{padding:"6px 8px", textAlign:"right"}}>{z.Mu.toFixed(2)}</td>
 <td style={{padding:"6px 8px", textAlign:"right"}}>{z.As.toFixed(2)}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </Card>
 </div>
 </div>
 );
}

// ── F2.9 CUADRO DE CARGAS ─────────────────────────────────
function F2Cargas({r, params}) {
 return (
 <div>
 <Card title="📋 Cuadro de Cargas por Elemento" subtitle="Combinaciones E.060 §9.2" accent={C.primary}>
 <table style={{width:"100%", fontSize:11.5, borderCollapse:"collapse"}}>
 <thead>
 <tr style={{background:C.primary, color:"#fff"}}>
 <th style={{padding:"7px 9px", textAlign:"left"}}>Elemento</th>
 <th style={{padding:"7px 9px", textAlign:"right"}}>CM (tf/m²)</th>
 <th style={{padding:"7px 9px", textAlign:"right"}}>CV (tf/m²)</th>
 <th style={{padding:"7px 9px", textAlign:"right"}}>U1=1.4CM+1.7CV</th>
 <th style={{padding:"7px 9px", textAlign:"right"}}>U2=1.25(CM+CV)+CS</th>
 <th style={{padding:"7px 9px", textAlign:"right"}}>U3=0.9CM+CS</th>
 </tr>
 </thead>
 <tbody>
 {[
 ["Losa aligerada", params.qcm+r.PP_al, params.qcv],
 ["Losa maciza", params.qcm+2.4*r.h_mac, params.qcv],
 ["Viga (gravit.)", r.CM_estimada, params.qcv],
 ["Escaleras", params.qcm+0.5, params.qcvCorr],
 ].map(([label, cm, cv],i)=>{
 const U1 = 1.4*cm + 1.7*cv;
 const U2 = 1.25*(cm+cv);
 const U3 = 0.9*cm;
 return (
 <tr key={i} style={{background: i%2 ? C.bgInput : "#fff"}}>
 <td style={{padding:"7px 9px", fontWeight:600}}>{label}</td>
 <td style={{padding:"7px 9px", textAlign:"right"}}>{cm.toFixed(3)}</td>
 <td style={{padding:"7px 9px", textAlign:"right"}}>{cv.toFixed(2)}</td>
 <td style={{padding:"7px 9px", textAlign:"right", color:C.primary, fontWeight:700}}>{U1.toFixed(3)}</td>
 <td style={{padding:"7px 9px", textAlign:"right"}}>{U2.toFixed(3)} + CS</td>
 <td style={{padding:"7px 9px", textAlign:"right", color:C.textMute}}>{U3.toFixed(3)} + CS</td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </Card>

 <Card title="📋 Cargas por Columna y Piso" subtitle="Pu por tipo de columna" accent={C.primary}>
 <table style={{width:"100%", fontSize:11.5, borderCollapse:"collapse"}}>
 <thead>
 <tr style={{background:C.primary, color:"#fff"}}>
 <th style={{padding:"7px 9px", textAlign:"left"}}>Tipo</th>
 <th style={{padding:"7px 9px", textAlign:"right"}}>At (m²)</th>
 <th style={{padding:"7px 9px", textAlign:"right"}}>Pu_acumulado (tf)</th>
 <th style={{padding:"7px 9px", textAlign:"right"}}>P_servicio (tf)</th>
 <th style={{padding:"7px 9px", textAlign:"right"}}>Aporte sísmico Pe</th>
 <th style={{padding:"7px 9px", textAlign:"right"}}>Pu envolvente</th>
 </tr>
 </thead>
 <tbody>
 {[r.col_C, r.col_PX, r.col_PY, r.col_E].map((c,i)=>(
 <tr key={i} style={{background: i%2 ? C.bgInput : "#fff"}}>
 <td style={{padding:"7px 9px", fontWeight:600}}>{c.tipo}</td>
 <td style={{padding:"7px 9px", textAlign:"right"}}>{c.At ? c.At.toFixed(2) : " · "}</td>
 <td style={{padding:"7px 9px", textAlign:"right"}}>{c.Pu_U1.toFixed(1)}</td>
 <td style={{padding:"7px 9px", textAlign:"right"}}>{(c.Pu_U1/1.55).toFixed(1)}</td>
 <td style={{padding:"7px 9px", textAlign:"right", color:C.orange}}>±{c.Pe_estim.toFixed(1)}</td>
 <td style={{padding:"7px 9px", textAlign:"right", color:C.primary, fontWeight:700}}>{c.Pu.toFixed(1)}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </Card>
 </div>
 );
}

// ── F2.10 CUADRO DE PLANOS ────────────────────────────────
function F2Planos({r}) {
 return (
 <div style={{display:"grid", gridTemplateColumns:"1fr", gap:14}}>
 <Card title="📋 Cuadro de Columnas · Despiece" accent={C.primary}>
 <table style={{width:"100%", fontSize:11.5, borderCollapse:"collapse"}}>
 <thead>
 <tr style={{background:C.primary, color:"#fff"}}>
 <th style={{padding:"6px 9px"}}>ID</th>
 <th style={{padding:"6px 9px"}}>Sección</th>
 <th style={{padding:"6px 9px"}}>Longitudinal</th>
 <th style={{padding:"6px 9px"}}>Estribos Lo</th>
 <th style={{padding:"6px 9px"}}>Estribos central</th>
 <th style={{padding:"6px 9px"}}>L empalme</th>
 </tr>
 </thead>
 <tbody>
 {["C-1 (Esquinera)", "C-2 (Perimetral X)", "C-3 (Perimetral Y)", "C-4 (Central)"].map((id,i)=>(
 <tr key={i} style={{background: i%2 ? C.bgInput : "#fff"}}>
 <td style={{padding:"7px 9px", fontWeight:700, color:C.primary}}>{id}</td>
 <td style={{padding:"7px 9px", textAlign:"center"}}>{r.b_unif}×{r.b_unif} cm</td>
 <td style={{padding:"7px 9px", textAlign:"center"}}>{r.var_unif.n*4}{r.var_unif.nom}</td>
 <td style={{padding:"7px 9px", textAlign:"center"}}>∅3/8" @ {r.s_conf.toFixed(0)} mm</td>
 <td style={{padding:"7px 9px", textAlign:"center"}}>∅3/8" @ {Math.min(r.b_unif*10*0.7, 200).toFixed(0)} mm</td>
 <td style={{padding:"7px 9px", textAlign:"center"}}>{r.detalleColumna.longitud_empalme.toFixed(0)} cm</td>
 </tr>
 ))}
 </tbody>
 </table>
 </Card>

 <Card title="📋 Cuadro de Vigas · Despiece" accent={C.primary}>
 <table style={{width:"100%", fontSize:11.5, borderCollapse:"collapse"}}>
 <thead>
 <tr style={{background:C.primary, color:"#fff"}}>
 <th style={{padding:"6px 9px"}}>ID</th>
 <th style={{padding:"6px 9px"}}>Sección</th>
 <th style={{padding:"6px 9px"}}>Acero (-)</th>
 <th style={{padding:"6px 9px"}}>Acero (+)</th>
 <th style={{padding:"6px 9px"}}>Estribos conf.</th>
 <th style={{padding:"6px 9px"}}>Lconf</th>
 </tr>
 </thead>
 <tbody>
 <tr>
 <td style={{padding:"7px 9px", fontWeight:700, color:C.primary}}>V-101 (Lx)</td>
 <td style={{padding:"7px 9px", textAlign:"center"}}>{(r.b_vp*100).toFixed(0)}×{(r.h_vp*100).toFixed(0)} cm</td>
 <td style={{padding:"7px 9px", textAlign:"center"}}>{r.var_vp.n}{r.var_vp.nom}</td>
 <td style={{padding:"7px 9px", textAlign:"center"}}>{r.var_vp_pos.n}{r.var_vp_pos.nom}</td>
 <td style={{padding:"7px 9px", textAlign:"center"}}>∅3/8" @ {(r.s_vp_sism*100).toFixed(0)} cm</td>
 <td style={{padding:"7px 9px", textAlign:"center"}}>{r.detalleEstribos.Lconf.toFixed(2)} m</td>
 </tr>
 <tr style={{background:C.bgInput}}>
 <td style={{padding:"7px 9px", fontWeight:700, color:C.primary}}>V-102 (Ly)</td>
 <td style={{padding:"7px 9px", textAlign:"center"}}>{(r.b_vs*100).toFixed(0)}×{(r.h_vs*100).toFixed(0)} cm</td>
 <td style={{padding:"7px 9px", textAlign:"center"}}>{r.var_vs.n}{r.var_vs.nom}</td>
 <td style={{padding:"7px 9px", textAlign:"center"}}>{r.var_vs.n}{r.var_vs.nom}</td>
 <td style={{padding:"7px 9px", textAlign:"center"}}>∅3/8" @ {(r.s_vp_sism*100).toFixed(0)} cm</td>
 <td style={{padding:"7px 9px", textAlign:"center"}}>{(2*r.h_vs).toFixed(2)} m</td>
 </tr>
 </tbody>
 </table>
 </Card>

 <Card title="📋 Cuadro de Zapatas · Despiece" accent={C.primary}>
 <table style={{width:"100%", fontSize:11.5, borderCollapse:"collapse"}}>
 <thead>
 <tr style={{background:C.primary, color:"#fff"}}>
 <th style={{padding:"6px 9px"}}>ID</th>
 <th style={{padding:"6px 9px"}}>Dimensiones</th>
 <th style={{padding:"6px 9px"}}>Peralte hz</th>
 <th style={{padding:"6px 9px"}}>Refuerzo (c/dir)</th>
 <th style={{padding:"6px 9px"}}>Recub.</th>
 </tr>
 </thead>
 <tbody>
 {[r.zap_C, r.zap_PX, r.zap_PY, r.zap_E].map((z,i)=>(
 <tr key={i} style={{background: i%2 ? C.bgInput : "#fff"}}>
 <td style={{padding:"7px 9px", fontWeight:700, color:C.primary}}>Z-{i+1} ({z.label})</td>
 <td style={{padding:"7px 9px", textAlign:"center"}}>{z.L.toFixed(2)} × {z.L.toFixed(2)} m</td>
 <td style={{padding:"7px 9px", textAlign:"center"}}>{(z.hz*100).toFixed(0)} cm</td>
 <td style={{padding:"7px 9px", textAlign:"center"}}>{z.nvar}{z.var_z.nom} @ {z.sep.toFixed(1)} cm</td>
 <td style={{padding:"7px 9px", textAlign:"center"}}>7.5 cm</td>
 </tr>
 ))}
 </tbody>
 </table>
 </Card>

 <div style={{padding:14, background:C.greenBg, border:`2px solid ${C.green}`, borderRadius:8, fontSize:12, lineHeight:1.6}}>
 <div style={{fontSize:14, fontWeight:800, color:C.green, marginBottom:6}}>
 ✓ DISEÑO ESTRUCTURAL COMPLETO · LISTO PARA EXPEDIENTE TÉCNICO
 </div>
 <div style={{color:C.text}}>
 Los cuadros de despiece anteriores y la memoria exportable constituyen el insumo principal del expediente técnico estructural.
 Exporte PDF/Word desde la cabecera para obtener la memoria completa con análisis sísmico, diagramas P-M,
 cuadros de despiece, plano de planta y referencias normativas E.030-2018/E.060-2009/ACI 318-19.
 </div>
 </div>
 </div>
 );
}

// ── COMPONENTE AUXILIAR ────────────────────────────────────
function DetallesBox({titulo, items}) {
 return (
 <div style={{padding:12, background:C.bgInput, borderRadius:8, borderLeft:`3px solid ${C.primary}`}}>
 <div style={{fontSize:12, fontWeight:700, color:C.primary, marginBottom:8}}>{titulo}</div>
 {items.map(([k,v])=>(
 <div key={k} style={{display:"flex", justifyContent:"space-between", fontSize:11, padding:"3px 0", borderBottom:`1px dotted ${C.border}`}}>
 <span style={{color:C.textSec}}>{k}:</span>
 <span style={{fontWeight:600, color:C.text}}>{v}</span>
 </div>
 ))}
 </div>
 );
}

// ════════════════════════════════════════════════════════════
// TAB METRADO DE CARGAS · E.020
// ════════════════════════════════════════════════════════════
function TabMetrado({params, r, set}) {
 const cmAcabados = params.cargasMuertas.filter(c=>c.activa).reduce((a,c)=>a+c.peso, 0);
 const cmTotal = cmAcabados + r.PP_al*1000;
 return (
 <div>
 <Card title="📚 Metrado de Cargas según NTE E.020-2006"
 subtitle="Cargas Vivas y Muertas por elemento estructural · Reglamento Nacional de Edificaciones"
 accent={C.primary}>
 <div style={{padding:10, background:C.bgInput, borderRadius:6, fontSize:11, lineHeight:1.6, color:C.text}}>
 <strong>Fundamento normativo:</strong> Las cargas de servicio se obtienen de la NTE E.020-2006 "Cargas".
 La carga viva mínima repartida depende del uso de la edificación (Tabla 1). La carga muerta incluye
 el peso propio de la estructura más los acabados, tabiquería y servicios fijos.
 <br/><br/>
 <strong>Referencia bibliográfica APA:</strong>
 <ul style={{marginTop:4, paddingLeft:20}}>
 <li>SENCICO. (2006). <em>Norma Técnica E.020 · Cargas</em>. Reglamento Nacional de Edificaciones.</li>
 <li>ASCE. (2022). <em>ASCE/SEI 7-22 · Minimum Design Loads for Buildings and Other Structures</em>.</li>
 </ul>
 </div>
 </Card>

 <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
 {/* Cargas Vivas */}
 <Card title="🟦 Carga Viva (CV) · E.020 Tab. 1" accent={C.accent}>
 <Select label="Uso de la edificación" value={params.usoEdificio}
 options={CARGAS_VIVAS_E020.map(u=>({value:u.id, label:`${u.desc} · ${u.cv} kgf/m²`}))}
 onChange={v=>set("usoEdificio",v)}/>
 <Row label="CV uso principal" value={(params.qcv*1000).toFixed(0)} unit="kgf/m²" hi norma="E.020 Tab.1"/>
 <Row label="CV corredores/escaleras" value={(params.qcvCorr*1000).toFixed(0)} unit="kgf/m²"/>
 <Row label="CV por planta" value={r.metrado.CV_por_planta_tf.toFixed(2)} unit="tf"/>
 <Row label={`CV total (× ${params.N} pisos)`} value={r.metrado.Peso_total_CV.toFixed(2)} unit="tf" hi/>
 <div style={{marginTop:10, padding:10, background:C.purpleBg, borderRadius:6, fontSize:11, lineHeight:1.5}}>
 <strong>📖 Sustento:</strong> NTE E.020-2006, Tabla 1 "Cargas vivas mínimas repartidas". El valor depende del uso de la edificación. Para combinaciones sísmicas se usa el 25 % o 50 % de CV (Cat. C o B según E.030-2018 Art. 26).
 </div>
 </Card>

 {/* Cargas Muertas */}
 <Card title="🟧 Carga Muerta (CM) · E.020 Tab. 1" accent={C.orange}>
 <div style={{fontSize:11, color:C.textSec, marginBottom:8}}>Activar/desactivar elementos según el proyecto:</div>
 {CARGAS_MUERTAS_TIPICAS.map(item=>{
 const itemActivo = params.cargasMuertas.find(c=>c.id===item.id);
 const activa = itemActivo?.activa ?? false;
 const toggle = ()=>{
 const nueva = params.cargasMuertas.find(c=>c.id===item.id)
 ? params.cargasMuertas.map(c=>c.id===item.id ? {...c, activa: !c.activa} : c)
 : [...params.cargasMuertas, {id:item.id, peso:item.peso, activa:true}];
 set("cargasMuertas", nueva);
 };
 return (
 <div key={item.id} onClick={toggle} style={{
 display:"flex", justifyContent:"space-between", alignItems:"center",
 padding:"5px 8px", borderRadius:4, cursor:"pointer",
 background: activa ? C.greenBg : "transparent", marginBottom:3,
 border:`1px solid ${activa ? C.green : C.border}`,
 }}>
 <span style={{fontSize:11, fontWeight:activa?700:500, color: activa ? C.green : C.textSec}}>
 {activa ? "✓" : "○"} {item.desc}
 </span>
 <span style={{fontSize:11, fontWeight:700, color: activa ? C.green : C.textMute}}>
 {item.peso} kgf/m²
 </span>
 </div>
 );
 })}
 <div style={{marginTop:10, padding:10, background:C.bgInput, borderRadius:6, fontSize:11.5, lineHeight:1.6}}>
 <Row label="Σ Acabados activos" value={cmAcabados.toFixed(0)} unit="kgf/m²"/>
 <Row label="+ Peso propio losa" value={(r.PP_al*1000).toFixed(0)} unit="kgf/m²"/>
 <Row label="= CM total" value={cmTotal.toFixed(0)} unit="kgf/m²" hi/>
 <Row label="CM por planta" value={r.metrado.CM_por_planta_tf.toFixed(2)} unit="tf"/>
 <Row label={`CM total (× ${params.N} pisos)`} value={r.metrado.Peso_total_CM.toFixed(2)} unit="tf" hi/>
 </div>
 </Card>
 </div>

 {/* Alturas variables por piso */}
 <Card title="📏 Alturas de Entrepiso por Nivel" subtitle="Permite alturas diferentes por piso" accent={C.primary}>
 <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
 <div>
 <div style={{fontSize:11.5, color:C.textSec, marginBottom:8}}>
 <strong>Altura por piso (m):</strong> usualmente el primer piso es más alto (3.5 m), pisos típicos 3.0 m, azotea 3.0 m.
 </div>
 {params.alturas.map((h, i)=>(
 <div key={i} style={{display:"flex", alignItems:"center", gap:8, marginBottom:6}}>
 <span style={{fontSize:11.5, color:C.textSec, minWidth:60, fontWeight:600}}>Piso {i+1}:</span>
 <input type="number" step={0.05} min={2.4} max={5.0} value={h}
 onChange={e=>{
 const v = parseFloat(e.target.value);
 if (!isNaN(v)) {
 const na = [...params.alturas];
 na[i] = v;
 set("alturas", na);
 }
 }}
 style={{flex:1, padding:"4px 8px", borderRadius:4, border:`1px solid ${C.border}`, fontSize:11.5, fontWeight:700, color:C.primary, textAlign:"right", background:"#fff"}}/>
 <span style={{fontSize:11, color:C.textMute, width:14}}>m</span>
 </div>
 ))}
 <div style={{
 marginTop:8, padding:"6px 10px", background:C.primary, color:"#fff", borderRadius:6,
 display:"flex", justifyContent:"space-between", fontSize:11.5, fontWeight:700,
 }}>
 <span>Altura total H =</span>
 <span>{r.H_total.toFixed(2)} m</span>
 </div>
 <div style={{
 marginTop:4, padding:"6px 10px", background:C.bgInput, borderRadius:6,
 display:"flex", justifyContent:"space-between", fontSize:11, color:C.textSec,
 }}>
 <span>Promedio:</span>
 <span>{r.hpiso_promedio.toFixed(2)} m</span>
 </div>
 </div>
 <div>
 <table style={{width:"100%", fontSize:11, borderCollapse:"collapse"}}>
 <thead>
 <tr style={{background:C.primary, color:"#fff"}}>
 <th style={{padding:"6px 9px"}}>Piso</th>
 <th style={{padding:"6px 9px", textAlign:"right"}}>h entre (m)</th>
 <th style={{padding:"6px 9px", textAlign:"right"}}>h acum. (m)</th>
 <th style={{padding:"6px 9px", textAlign:"right"}}>Pi (tf)</th>
 </tr>
 </thead>
 <tbody>
 {r.distribucion.slice().reverse().map((d, i)=>(
 <tr key={d.piso} style={{background: i%2 ? C.bgInput : "#fff"}}>
 <td style={{padding:"5px 9px", textAlign:"center", fontWeight:700, color:C.primary}}>{d.piso}</td>
 <td style={{padding:"5px 9px", textAlign:"right"}}>{(d.hentre||3).toFixed(2)}</td>
 <td style={{padding:"5px 9px", textAlign:"right"}}>{d.hi.toFixed(2)}</td>
 <td style={{padding:"5px 9px", textAlign:"right"}}>{d.Pi.toFixed(1)}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </Card>

 {/* Áreas tributarias por columna */}
 <Card title="🎯 Áreas Tributarias por Columna" subtitle="Calculadas según ubicación real de cada eje" accent={C.primary}>
 <div style={{padding:10, background:C.bgInput, borderRadius:6, fontSize:11, marginBottom:10, lineHeight:1.5}}>
 <strong>Sustento técnico:</strong> El área tributaria de una columna se obtiene como la suma de los semivanos
 a sus cuatro lados. Para columnas centrales: At = (Lx1+Lx2)/2 × (Ly1+Ly2)/2. Para esquineras y perimetrales,
 el área se reduce proporcionalmente.<br/>
 <strong>Referencia:</strong> ACI 318-19 §22 / Nilson, A. (2010). <em>Design of Concrete Structures</em>, 14th ed., McGraw-Hill.
 </div>
 <div style={{maxHeight:400, overflowY:"auto"}}>
 <table style={{width:"100%", fontSize:11, borderCollapse:"collapse"}}>
 <thead style={{position:"sticky", top:0}}>
 <tr style={{background:C.primary, color:"#fff"}}>
 <th style={{padding:"7px 9px", textAlign:"left"}}>ID</th>
 <th style={{padding:"7px 9px", textAlign:"left"}}>Tipo</th>
 <th style={{padding:"7px 9px", textAlign:"right"}}>X (m)</th>
 <th style={{padding:"7px 9px", textAlign:"right"}}>Y (m)</th>
 <th style={{padding:"7px 9px", textAlign:"right"}}>At (m²)</th>
 <th style={{padding:"7px 9px", textAlign:"right"}}>Pu acum. (tf)</th>
 </tr>
 </thead>
 <tbody>
 {r.columnasEnPlanta.map((c, i)=>{
 const tipos = {C:"Central", PX:"Perim. X", PY:"Perim. Y", E:"Esquinera"};
 const colores = {C:C.primary, PX:C.orange, PY:C.orange, E:C.red};
 return (
 <tr key={i} style={{background: i%2 ? C.bgInput : "#fff"}}>
 <td style={{padding:"6px 9px", fontWeight:700, color:colores[c.tipo]}}>{c.id}</td>
 <td style={{padding:"6px 9px"}}>{tipos[c.tipo]}</td>
 <td style={{padding:"6px 9px", textAlign:"right"}}>{c.x.toFixed(2)}</td>
 <td style={{padding:"6px 9px", textAlign:"right"}}>{c.y.toFixed(2)}</td>
 <td style={{padding:"6px 9px", textAlign:"right", fontWeight:600}}>{c.at_real.toFixed(2)}</td>
 <td style={{padding:"6px 9px", textAlign:"right", color:C.primary, fontWeight:700}}>{c.Pu_real.toFixed(1)}</td>
 </tr>
 );
 })}
 <tr style={{background:C.primary, color:"#fff", fontWeight:700}}>
 <td colSpan={4} style={{padding:"7px 9px", textAlign:"right"}}>Σ At (verificación) =</td>
 <td style={{padding:"7px 9px", textAlign:"right"}}>{r.At_total_check.toFixed(2)} m²</td>
 <td style={{padding:"7px 9px", textAlign:"right"}}>{r.area_planta.toFixed(2)} m² ✓</td>
 </tr>
 </tbody>
 </table>
 </div>
 </Card>

 {/* Combinaciones de carga */}
 <Card title="📋 Combinaciones de Carga · E.060-2009 §9.2" accent={C.primary}>
 <table style={{width:"100%", fontSize:11.5, borderCollapse:"collapse"}}>
 <thead>
 <tr style={{background:C.primary, color:"#fff"}}>
 <th style={{padding:"7px 9px"}}>Combinación</th>
 <th style={{padding:"7px 9px"}}>Expresión</th>
 <th style={{padding:"7px 9px", textAlign:"right"}}>Resultado (tf/m²)</th>
 </tr>
 </thead>
 <tbody>
 <tr>
 <td style={{padding:"7px 9px", fontWeight:700, color:C.primary}}>U1 (gravitacional)</td>
 <td style={{padding:"7px 9px", fontFamily:"monospace"}}>1.4·CM + 1.7·CV</td>
 <td style={{padding:"7px 9px", textAlign:"right", fontWeight:700}}>{r.Wu_U1.toFixed(3)}</td>
 </tr>
 <tr style={{background:C.bgInput}}>
 <td style={{padding:"7px 9px", fontWeight:700, color:C.orange}}>U2 (sismo)</td>
 <td style={{padding:"7px 9px", fontFamily:"monospace"}}>1.25·(CM + CV) ± CS</td>
 <td style={{padding:"7px 9px", textAlign:"right", fontWeight:700}}>{r.Wu_U2_grav.toFixed(3)} + CS</td>
 </tr>
 <tr>
 <td style={{padding:"7px 9px", fontWeight:700, color:C.red}}>U3 (sismo c/CM mín.)</td>
 <td style={{padding:"7px 9px", fontFamily:"monospace"}}>0.9·CM ± CS</td>
 <td style={{padding:"7px 9px", textAlign:"right", fontWeight:700}}>{(0.9*r.CM_estimada).toFixed(3)} + CS</td>
 </tr>
 </tbody>
 </table>
 <div style={{marginTop:10, padding:10, background:C.bgInput, borderRadius:6, fontSize:11, lineHeight:1.5}}>
 <strong>📖 NTE E.060-2009 §9.2:</strong> Las combinaciones cubren los siguientes escenarios:
 <br/>• U1 controla en cimentación interior (gravedad pura).
 <br/>• U2 controla en columnas perimetrales y esquineras (sismo + gravedad).
 <br/>• U3 verifica posible tracción (sismo con CM mínima).
 </div>
 </Card>
 </div>
 );
}
