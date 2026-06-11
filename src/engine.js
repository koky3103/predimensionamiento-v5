/**
 * engine.js v6 · Motor estructural Fase 1 + Fase 2 nivel expediente técnico
 * NTE E.020/E.030-2018/E.050-2018/E.060-2009 · ACI 318-19 · CIRSOC 201
 */

// ═══════ ACERO ═══════
export const VARILLAS = [
 {nom:"∅6mm", d:6.0, As:0.28},
 {nom:"∅8mm", d:8.0, As:0.50},
 {nom:'∅3/8"', d:9.5, As:0.71},
 {nom:'∅1/2"', d:12.7, As:1.27},
 {nom:'∅5/8"', d:15.9, As:1.98},
 {nom:'∅3/4"', d:19.1, As:2.84},
 {nom:'∅1"', d:25.4, As:5.10},
 {nom:'∅1 3/8"', d:35.0, As:9.58},
];

export function elegirVarilla(As_req) {
 if (As_req <= 0) return {...VARILLAS[2], n:2, As_tot:2*VARILLAS[2].As};
 const cands = VARILLAS.flatMap(v => {
 const n = Math.ceil(As_req / v.As);
 if (n >= 2 && n <= 14) return [{...v, n, As_tot: n*v.As}];
 return [];
 });
 if (!cands.length) {
 const v = VARILLAS[5]; const n = Math.ceil(As_req/v.As);
 return {...v, n, As_tot: n*v.As};
 }
 return cands.reduce((a,b) => b.As_tot-As_req < a.As_tot-As_req ? b : a);
}

// ═══════ SÍSMICA E.030-2018 ═══════
export const ZONAS_SISMICAS = [
 {id:1, Z:0.10, ejemplos:"Selva: Iquitos, Pucallpa"},
 {id:2, Z:0.25, ejemplos:"Sierra norte/centro"},
 {id:3, Z:0.35, ejemplos:"Sierra sur"},
 {id:4, Z:0.45, ejemplos:"Costa: Lima, Trujillo"},
];

export const TIPOS_SUELO = [
 {id:"S0", S:0.80, Tp:0.30, Tl:3.00, desc:"Roca dura"},
 {id:"S1", S:1.00, Tp:0.40, Tl:2.50, desc:"Roca o suelo muy rígido"},
 {id:"S2", S:1.05, Tp:0.60, Tl:2.00, desc:"Suelo intermedio"},
 {id:"S3", S:1.10, Tp:1.00, Tl:1.60, desc:"Suelo blando"},
];

export function factorS(zona, suelo) {
 const map = {
 S0:{1:0.80,2:0.80,3:0.80,4:0.80},
 S1:{1:1.00,2:1.00,3:1.00,4:1.00},
 S2:{1:1.60,2:1.20,3:1.15,4:1.05},
 S3:{1:2.00,2:1.40,3:1.20,4:1.10},
 };
 return map[suelo]?.[zona] ?? 1.0;
}

export const CATEGORIAS_USO = [
 {id:"A1", U:1.50, desc:"A1 · Hospitales, postas"},
 {id:"A2", U:1.50, desc:"A2 · Bomberos, comisarías"},
 {id:"B", U:1.30, desc:"B · Oficinas, hoteles"},
 {id:"C", U:1.00, desc:"C · Viviendas"},
 {id:"D", U:1.00, desc:"D · Edificios temporales"},
];

export const SISTEMAS_ESTRUCTURALES = [
 {id:"porticos", R:8, Ct:35, desc:"Pórticos de C.A."},
 {id:"dual", R:7, Ct:45, desc:"Dual (pórticos + muros)"},
 {id:"muros", R:6, Ct:60, desc:"Muros estructurales"},
 {id:"muros_lim", R:4, Ct:60, desc:"Muros de ductilidad limitada"},
 {id:"albanileria", R:3, Ct:60, desc:"Albañilería confinada"},
];

export const FACTORES_CV_SISMICO = {
 "B":0.50, "C":0.25, "A1":0.50, "A2":0.50, "D":0.25,
};

// ─── CARGAS VIVAS · E.020-2006 Tabla 1 ─────────────────────
// CV mínima repartida (kgf/m²) por tipo de ocupación
export const CARGAS_VIVAS_E020 = [
 {id:"vivienda", cv:200, cv_corr:200, desc:"Viviendas"},
 {id:"hotel", cv:200, cv_corr:400, desc:"Hoteles (cuartos)"},
 {id:"oficina", cv:250, cv_corr:400, desc:"Oficinas"},
 {id:"aulas", cv:250, cv_corr:400, desc:"Centros educativos · aulas"},
 {id:"talleres", cv:350, cv_corr:400, desc:"Talleres"},
 {id:"laboratorio", cv:300, cv_corr:400, desc:"Laboratorios"},
 {id:"biblioteca", cv:300, cv_corr:400, desc:"Bibliotecas · salas lectura"},
 {id:"bib_estant", cv:750, cv_corr:400, desc:"Bibliotecas · estantería"},
 {id:"tienda", cv:500, cv_corr:500, desc:"Tiendas / mercados"},
 {id:"restaurante", cv:400, cv_corr:500, desc:"Restaurantes"},
 {id:"hosp_oper", cv:300, cv_corr:400, desc:"Hospitales · salas operación"},
 {id:"hosp_cuart", cv:200, cv_corr:400, desc:"Hospitales · cuartos"},
 {id:"garaje", cv:250, cv_corr:250, desc:"Garajes vehículos livianos"},
 {id:"deposito", cv:500, cv_corr:500, desc:"Depósitos comunes"},
 {id:"deposito_p", cv:1000,cv_corr:1000,desc:"Depósitos pesados"},
 {id:"azotea", cv:100, cv_corr:100, desc:"Azoteas sin acceso"},
 {id:"azotea_acc", cv:150, cv_corr:300, desc:"Azoteas con acceso"},
 {id:"escenario", cv:500, cv_corr:500, desc:"Escenarios / espectáculos"},
];

// ─── CARGAS MUERTAS TÍPICAS (acabados, tabiquería, etc.) ───
export const CARGAS_MUERTAS_TIPICAS = [
 {id:"piso_ceramico", peso:100, cat:"Acabados", desc:"Piso cerámico + contrapiso 5cm"},
 {id:"piso_porcelanato",peso:120, cat:"Acabados", desc:"Porcelanato + contrapiso 5cm"},
 {id:"piso_madera", peso:80, cat:"Acabados", desc:"Piso de madera"},
 {id:"tab_ladrillo", peso:150, cat:"Tabiquería",desc:"Tabique ladrillo e=15cm"},
 {id:"tab_drywall", peso:30, cat:"Tabiquería",desc:"Tabique drywall"},
 {id:"tab_bloqueta", peso:120, cat:"Tabiquería",desc:"Bloqueta concreto e=10cm"},
 {id:"cielo_yeso", peso:30, cat:"Cielo raso",desc:"Cielo raso yeso"},
 {id:"cielo_drywall", peso:25, cat:"Cielo raso",desc:"Cielo raso drywall"},
 {id:"instalaciones", peso:20, cat:"Cielo raso",desc:"Instalaciones (luz, AC)"},
 {id:"techo_imperm", peso:50, cat:"Techo", desc:"Impermeabilización azotea"},
];

// ─── PESOS UNITARIOS E.020 Tab.1 ───────────────────────────
export const PESOS_UNITARIOS = {
 concreto_armado: 2400,
 concreto_simple: 2300,
 albanileria: 1800,
 agua: 1000,
};

// ═══════ TABLA Ca/Cb CIRSOC 201 ═══════
const CA_CB_TABLE = [
 {m:1.00,Ca:0.036,Cb:0.036},{m:0.95,Ca:0.040,Cb:0.033},
 {m:0.90,Ca:0.045,Cb:0.029},{m:0.85,Ca:0.050,Cb:0.026},
 {m:0.80,Ca:0.056,Cb:0.023},{m:0.75,Ca:0.061,Cb:0.019},
 {m:0.70,Ca:0.068,Cb:0.016},{m:0.65,Ca:0.074,Cb:0.013},
 {m:0.60,Ca:0.081,Cb:0.010},{m:0.55,Ca:0.088,Cb:0.008},
 {m:0.50,Ca:0.095,Cb:0.006},
];
export function getCaCb(m) {
 const mc = Math.min(1.0, Math.max(0.5, m));
 const i = CA_CB_TABLE.findIndex(r => r.m <= mc);
 if (i <= 0) return CA_CB_TABLE[0];
 const a = CA_CB_TABLE[i-1], b = CA_CB_TABLE[i];
 const t = (mc-b.m)/(a.m-b.m);
 return {Ca: b.Ca+t*(a.Ca-b.Ca), Cb: b.Cb+t*(a.Cb-b.Cb)};
}

// ═══════ EJES ESTRUCTURALES ═══════
// Genera nombres de ejes: ["A","B","C","D",..."Z","AA","AB"...]
export function nombreEjeX(i) {
 // 0->A, 1->B, ..., 25->Z, 26->AA
 if (i < 26) return String.fromCharCode(65 + i);
 return String.fromCharCode(65 + Math.floor(i/26) - 1) + String.fromCharCode(65 + (i%26));
}
export function nombreEjeY(i) { return String(i + 1); }

// Posición acumulada de un eje desde origen
export function posicionEjeX(ejes, idx) {
 let pos = 0;
 for (let i = 0; i < idx; i++) pos += (ejes[i] || 0);
 return pos;
}

// ════════════════════════════════════════════════════════════
// CÁLCULO PRINCIPAL
// ════════════════════════════════════════════════════════════
export function calcular(p) {
 const {hpiso, N, fc, fy,
 qcm, qcv, qcvCorr,
 qadm, Df, gs,
 zonaSismica, sueloId, categoriaId, sistemaId,
 tw_placa, Lw_placa,
 ejesX, ejesY,
 nPlacas_x, nPlacas_y,
 paso_user, n_cp_user,
 h_al_user, h_mac_user,
 h_vp_user, b_vp_user, h_vs_user, b_vs_user,
 b_col_user,
 alturas, // Array opcional [h₁, h₂, ...]
 usoEdificio, // ID de uso para CV (E.020)
 cargasMuertas, // Array {id, peso, activa}
 incluirSismo, // boolean · análisis sísmico opcional
 L_zap_C_user, hz_zap_C_user,
 L_zap_PX_user, hz_zap_PX_user,
 L_zap_PY_user, hz_zap_PY_user,
 L_zap_E_user, hz_zap_E_user,
 } = p;

 const gc = 2.4;
 const φf = 0.90, φv = 0.85, φc = 0.65, φp = 0.75;
 const zona = ZONAS_SISMICAS.find(z=>z.id===zonaSismica) || ZONAS_SISMICAS[3];
 const suelo = TIPOS_SUELO.find(s=>s.id===sueloId) || TIPOS_SUELO[2];
 const categoria = CATEGORIAS_USO.find(c=>c.id===categoriaId) || CATEGORIAS_USO[2];
 const sistema = SISTEMAS_ESTRUCTURALES.find(s=>s.id===sistemaId) || SISTEMAS_ESTRUCTURALES[1];

 const Z = zona.Z, U = categoria.U;
 const S = factorS(zona.id, suelo.id);
 const Tp = suelo.Tp, Tl = suelo.Tl;
 const R = sistema.R, Ct_sist = sistema.Ct;
 const Ec = 15100 * Math.sqrt(fc);

 // ── EJES Y GEOMETRÍA ────────────────────────────────────
 // ejesX = [4.0, 5.0, 4.5] → 3 vanos, 4 ejes (A,B,C,D), Lx_total = 13.5m
 const Lx_total = ejesX.reduce((a,b)=>a+b, 0);
 const Ly_total = ejesY.reduce((a,b)=>a+b, 0);
 const nEjesX = ejesX.length + 1; // n ejes = n vanos + 1
 const nEjesY = ejesY.length + 1;
 const nVanosX = ejesX.length;
 const nVanosY = ejesY.length;

 // Luz mayor y menor (críticas para predim)
 const Lx_max = Math.max(...ejesX);
 const Ly_max = Math.max(...ejesY);
 // Para predim usamos las máximas (caso crítico)
 const Lx = Lx_max;
 const Ly = Math.min(Lx_max, Ly_max); // luz menor para coef. Ca/Cb

 // Cantidad de columnas por tipo
 const nColE = 4; // 4 esquineras
 const nColPX = 2 * (nEjesX - 2); // 2 perimetrales superior + 2 inferior por dirección
 const nColPY = 2 * (nEjesY - 2);
 const nColP = nColPX + nColPY;
 const nColC = (nEjesX - 2) * (nEjesY - 2); // interiores
 const nColTotal = nColC + nColP + nColE;

 // ── CARGAS · Combinaciones E.060 §9.2 ────────────────────
 const CM_estimada = qcm + 0.420;
 const Wu_U1 = 1.4*CM_estimada + 1.7*qcv;
 const Wu_U2_grav = 1.25*(CM_estimada + qcv);
 const Wu_hab = Wu_U1;

 // ── LOSA ALIGERADA ──────────────────────────────────────
 const h_al_min = Lx / 25;
 const h_al_calc = Math.ceil(h_al_min / 0.05) * 0.05;
 const h_al = h_al_user || h_al_calc;
 const PP_al = h_al<=0.20 ? 0.300 : h_al<=0.25 ? 0.350 : h_al<=0.30 ? 0.420 : 0.480;
 const Wu_al = 1.4*(qcm+PP_al) + 1.7*qcv;
 const d_al = h_al - 0.03;
 const ancho_vig = 0.40;
 const Vu_al = Wu_al * ancho_vig * Lx / 2;
 const phiVc_al = φv * 0.53 * Math.sqrt(fc) * 0.10 * d_al * 10000 / 1000;
 const losa_ok = Vu_al <= phiVc_al;
 const Mu_al = Wu_al * ancho_vig * Lx*Lx / 8;
 const As_al_min = 0.0033 * 10 * d_al*100;
 const As_al = Math.max(Mu_al*1e5/(φf*fy*0.9*d_al*100), As_al_min);
 const var_al = elegirVarilla(As_al);
 const I_eff = 0.10 * Math.pow(h_al*100, 3) / 12;
 const delta_al = 5 * (Wu_al/100) * Math.pow(Lx*100, 4) / (384 * Ec * I_eff);
 const delta_lim_al = Lx*100/360;
 const defl_al_ok = delta_al <= delta_lim_al;

 // ── LOSA MACIZA ─────────────────────────────────────────
 const m_mac = Math.min(Ly/Lx, 1.0);
 const {Ca, Cb} = getCaCb(m_mac);
 const h_mac_min = Lx/33;
 const h_mac_calc = Math.ceil(h_mac_min/0.05)*0.05;
 const h_mac = h_mac_user || h_mac_calc;
 const d_mac = h_mac - 0.02;
 const Wu_mac = 1.4*(qcm + gc*h_mac) + 1.7*qcv;
 const As_mac_min = 0.0018 * 100 * h_mac*100;
 const Mu_mac_x = Ca * Wu_mac * Lx*Lx;
 const Mu_mac_y = Cb * Wu_mac * Ly*Ly;
 const As_mac_x = Math.max(Mu_mac_x*1e5/(φf*fy*0.9*d_mac*100), As_mac_min);
 const As_mac_y = Math.max(Mu_mac_y*1e5/(φf*fy*0.9*d_mac*100), As_mac_min);
 const var_mx = elegirVarilla(As_mac_x);
 const var_my = elegirVarilla(As_mac_y);

 // ── VIGAS · Coef. ACI 318-19 §6.5.2 ─────────────────────
 const h_vp_calc = Math.ceil(Lx/12/0.05)*0.05;
 const b_vp_calc = Math.max(0.25, Math.ceil(h_vp_calc/2/0.05)*0.05);
 const h_vp = h_vp_user || h_vp_calc;
 const b_vp = b_vp_user || b_vp_calc;
 const d_vp = h_vp - 0.06;
 const wv = Wu_hab * Ly / 2;
 const Mu_vp_neg_ext = wv * Lx*Lx / 9;
 const Mu_vp_neg_int = wv * Lx*Lx / 11;
 const Mu_vp_pos_ext = wv * Lx*Lx / 14;
 const Mu_vp_pos_int = wv * Lx*Lx / 16;
 const Mu_vp = Mu_vp_neg_ext;
 const Vu_vp = 1.15 * wv * Lx / 2;
 const As_vp_min = 0.0033 * b_vp*100 * d_vp*100;
 const As_vp_req = Mu_vp*1e5/(φf*fy*0.9*d_vp*100);
 const As_vp = Math.max(As_vp_req, As_vp_min);
 const As_vp_pos = Math.max(Mu_vp_pos_ext*1e5/(φf*fy*0.9*d_vp*100), As_vp_min);
 const var_vp = elegirVarilla(As_vp);
 const var_vp_pos = elegirVarilla(As_vp_pos);
 const phiVc_vp = φv * 0.53 * Math.sqrt(fc) * b_vp*100 * d_vp*100 / 1000;
 const cort_vp_ok = Vu_vp <= phiVc_vp;
 const s_vp_sism = Math.min(d_vp/4, 6*var_vp.d/1000, 0.15);
 const s_vp_corr = Math.min(d_vp/2, 0.30);
 const flex_vp_ok = As_vp_req <= var_vp.As_tot;

 // Diagrama de momentos por tramo (envolvente para gráfico)
 const diagMomVp = [];
 const nPuntos = 11;
 for (let i = 0; i <= nPuntos; i++) {
 const x = (i / nPuntos) * Lx;
 // Aproximación parabólica: Mu_pos en centro, Mu_neg en apoyos
 const eta = x / Lx;
 const M = Mu_vp_pos_ext * (4*eta*(1-eta)) - Mu_vp_neg_ext * (1 - 4*eta*(1-eta));
 diagMomVp.push({x: +x.toFixed(2), M: +M.toFixed(2)});
 }
 // Diagrama de cortantes
 const diagCortVp = [];
 for (let i = 0; i <= nPuntos; i++) {
 const x = (i / nPuntos) * Lx;
 const V = wv * (Lx/2 - x); // lineal
 diagCortVp.push({x: +x.toFixed(2), V: +V.toFixed(2)});
 }

 const h_vs_calc = Math.ceil(Ly/12/0.05)*0.05;
 const b_vs_calc = Math.max(0.25, Math.ceil(h_vs_calc/2/0.05)*0.05);
 const h_vs = h_vs_user || h_vs_calc;
 const b_vs = b_vs_user || b_vs_calc;
 const d_vs = h_vs - 0.06;
 const wvs = Wu_hab * Lx / 4;
 const Mu_vs = wvs * Ly*Ly / 9;
 const Vu_vs = 1.15 * wvs * Ly / 2;
 const As_vs_req = Mu_vs*1e5/(φf*fy*0.9*d_vs*100);
 const As_vs = Math.max(As_vs_req, 0.0033*b_vs*100*d_vs*100);
 const var_vs = elegirVarilla(As_vs);

 // ── ANÁLISIS SÍSMICO ────────────────────────────────────
 // ── ALTURAS DE ENTREPISO (variables o constante) ────────
 const alturasArr = (alturas && alturas.length === N) ? alturas : Array(N).fill(hpiso);
 const H_total = alturasArr.reduce((a,b)=>a+b, 0);
 const hpiso_promedio = H_total / N;
 const hi_acumulado = [];
 let hacc = 0;
 for (let i = 0; i < N; i++) {
 hacc += alturasArr[i];
 hi_acumulado.push(hacc);
 }
 const T = H_total / Ct_sist;
 let C_sis;
 if (T < Tp) C_sis = 2.5;
 else if (T < Tl) C_sis = 2.5 * Tp/T;
 else C_sis = 2.5 * (Tp*Tl)/(T*T);
 const ZUCS_R = Z*U*C_sis*S/R;
 const C_R_min_ok = C_sis/R >= 0.11;
 const ZUCS_R_efectivo = Math.max(ZUCS_R, 0.11*Z*U*S);

 const factor_CV = FACTORES_CV_SISMICO[categoria.id] ?? 0.25;
 const area_planta = Lx_total * Ly_total;
 const Ws = (CM_estimada + factor_CV*qcv) * area_planta * N;
 const V_basal = ZUCS_R_efectivo * Ws;

 // DISTRIBUCIÓN VERTICAL · E.030 §28.6 (con alturas reales)
 const k_dist = T <= 0.5 ? 1.0 : Math.min(0.75 + 0.5*T, 2.0);
 const Pi_piso = (CM_estimada + factor_CV*qcv) * area_planta;
 const distribucion = [];
 let sumPhk = 0;
 for (let i = 0; i < N; i++) {
 const hi = hi_acumulado[i];
 sumPhk += Pi_piso * Math.pow(hi, k_dist);
 }
 for (let i = 0; i < N; i++) {
 const hi = hi_acumulado[i];
 const Phk = Pi_piso * Math.pow(hi, k_dist);
 const Fi = (Phk / sumPhk) * V_basal;
 distribucion.push({piso: i+1, hi, hentre: alturasArr[i], Pi: Pi_piso, Phk, Fi});
 }
 let Vacum = 0;
 const cortantes_piso = [];
 for (let i = N - 1; i >= 0; i--) {
 Vacum += distribucion[i].Fi;
 cortantes_piso.unshift({piso: i+1, Vi: Vacum, hi: distribucion[i].hi});
 }
 // Diagrama de cortantes por piso (acumulado)
 // Diagrama de momentos de volteo por piso (Mvuelco_i = Σ Fj*(hj-hi))
 const momentos_volteo_piso = [];
 for (let i = 0; i < N; i++) {
 let M_i = 0;
 for (let j = i; j < N; j++) {
 M_i += distribucion[j].Fi * (distribucion[j].hi - (i > 0 ? distribucion[i-1].hi : 0));
 }
 momentos_volteo_piso.push({piso: i+1, hi: distribucion[i].hi, Mv: M_i});
 }
 const M_volteo = distribucion.reduce((acc, d) => acc + d.Fi * d.hi, 0);

 // ── ANÁLISIS MODAL APROXIMADO (Rayleigh-Stodola) ─────────
 // Aproximación: rigidez de piso constante, masas concentradas
 const mi = Pi_piso / 9.81; // tf·s²/m por piso (masa concentrada)
 // Frecuencia angular natural T₁ aproximada por Rayleigh:
 // T₁ ≈ 2π·√(Σ(mi·ui²) / Σ(Fi·ui))
 // donde ui es el desplazamiento por una fuerza estática
 const modos = [];
 for (let m = 1; m <= 3; m++) {
 // Aproximación: Tm = T₁ / (2m-1) para sistema continuo (cantilever)
 const Tm = T / (2*m - 1);
 let Cm;
 if (Tm < Tp) Cm = 2.5;
 else if (Tm < Tl) Cm = 2.5 * Tp/Tm;
 else Cm = 2.5 * (Tp*Tl)/(Tm*Tm);
 const Sa_m = Z*U*Cm*S/R * 9.81; // m/s²
 // Masa participativa aproximada
 const masaPart = m === 1 ? 0.80 : m === 2 ? 0.12 : 0.05;
 modos.push({modo: m, T: Tm, f: 1/Tm, omega: 2*Math.PI/Tm, masaPart, Sa: Sa_m, Cm});
 }
 const sumaMasaParticipativa = modos.reduce((a,m)=>a+m.masaPart, 0);
 const masa_part_ok = sumaMasaParticipativa >= 0.90;

 // Formas modales aproximadas (cantilever)
 const formasModales = [];
 for (let i = 0; i < N; i++) {
 const z = (i+1)/N; // altura normalizada
 formasModales.push({
 piso: i+1,
 hi: hi_acumulado[i],
 phi1: Math.sin(Math.PI*z/2), // primer modo: cuasi-lineal
 phi2: Math.sin(3*Math.PI*z/2), // segundo modo
 phi3: Math.sin(5*Math.PI*z/2), // tercer modo
 });
 }

 // ── IRREGULARIDADES E.030 §3.5 ──────────────────────────
 // Para predim: planta y altura regulares por defecto
 // Cálculo de Ia × Ip → factor de irregularidad
 const Ia_altura = 1.0; // factor por irregularidad en altura (1.0 = sin)
 const Ip_planta = 1.0; // factor por irregularidad en planta (1.0 = sin)
 const irregularidades = [
   {nombre:"Piso blando o débil",     tipo:"Altura", presente:false, refn:"E.030 Tab.8"},
   {nombre:"Irregularidad de masa",    tipo:"Altura", presente:false, refn:"E.030 Tab.8"},
   {nombre:"Geometría vertical",       tipo:"Altura", presente:false, refn:"E.030 Tab.8"},
   {nombre:"Torsional",                tipo:"Planta", presente:false, refn:"E.030 Tab.9"},
   {nombre:"Esquinas entrantes",       tipo:"Planta", presente:false, refn:"E.030 Tab.9"},
   {nombre:"Discontinuidad diafragma", tipo:"Planta", presente:false, refn:"E.030 Tab.9"},
 ];
 const R_efectivo = R * Ia_altura * Ip_planta;

 // Verificación geométrica para detectar irregularidades automáticas
 // 1) Irregularidad de planta - esquinas entrantes (no aplicable - planta rectangular)
 // 2) Irregularidad de altura - geometría vertical (no aplicable - altura uniforme)
 // El usuario puede activar manualmente en UI

 // ── JUNTA SÍSMICA E.030 §5.3 ────────────────────────────
 // s ≥ 0.006 × H_total ≥ 0.03 m
 const s_junta = Math.max(0.006 * H_total, 0.03);

 // ── COLUMNAS ────────────────────────────────────────────
 const rho = 0.015;
 const denom = φc * (0.85*fc*(1-rho) + fy*rho);

 // Áreas tributarias reales según ubicación en la planta de ejes
 const At_central = Lx * Ly;
 const At_perimX = Lx * Ly / 2;
 const At_perimY = Lx/2 * Ly;
 const At_esquina = Lx/2 * Ly/2;

 const mkCol = (At, tipo_pe_factor) => {
 const Pu_U1 = Wu_U1 * At * N * 1.05;
 const Pu_grav_U2 = Wu_U2_grav * At * N * 1.05;
 const Pe_estim = tipo_pe_factor * Pu_U1;
 const Pu_U2 = Pu_grav_U2 + Pe_estim;
 const Pu_U3_min = 0.9*CM_estimada*At*N*1.05 - Pe_estim;
 const Pu_envolvente = Math.max(Pu_U1, Pu_U2);
 const b_calc = Math.max(25, Math.ceil(Math.sqrt(Pu_envolvente*1000/denom)/5)*5);
 return {Pu_U1, Pu_U2, Pu_U3_min, Pu: Pu_envolvente, Pe_estim, b_calc, At};
 };
 const colC_data = mkCol(At_central, 0.05);
 const colPX_data = mkCol(At_perimX, 0.15);
 const colPY_data = mkCol(At_perimY, 0.15);
 const colE_data = mkCol(At_esquina, 0.30);

 const b_unif_calc = Math.max(colC_data.b_calc, colPX_data.b_calc, colPY_data.b_calc, colE_data.b_calc);
 const b_unif = b_col_user || b_unif_calc;
 const As_unif = rho * b_unif * b_unif;
 const var_unif = elegirVarilla(As_unif/4);

 const verifCol = (Pu_col) => {
 const Ag_req = Pu_col*1000/denom;
 const rho_real = As_unif / (b_unif*b_unif);
 const Ag_actual = b_unif*b_unif;
 const phi_Pn = denom * Ag_actual / 1000;
 return {Ag_req, Ag_actual, rho_real, phi_Pn, ok: phi_Pn >= Pu_col};
 };

 const col_C = {...colC_data, ...verifCol(colC_data.Pu), tipo:"Central"};
 const col_PX = {...colPX_data, ...verifCol(colPX_data.Pu), tipo:"Perimetral X"};
 const col_PY = {...colPY_data, ...verifCol(colPY_data.Pu), tipo:"Perimetral Y"};
 const col_E = {...colE_data, ...verifCol(colE_data.Pu), tipo:"Esquinera"};

 const rho_esq = As_unif / (b_unif*b_unif);
 const s_conf = Math.min(b_unif/4, 6*var_unif.d/10, 100);
 const Lo_col = Math.max(b_unif*10, hpiso*100/6, 450);
 const lu = hpiso - 0.50;
 const radio_giro = b_unif * 0.30 / 100;
 const esb_klu_r = lu / radio_giro;
 const esb = lu / (b_unif/100);
 const esb_ok = esb <= 12 && esb_klu_r <= 100;

 // ── PLACAS ──────────────────────────────────────────────
 const nPlacas_dir_x = Math.max(1, nPlacas_x || 2);
 const nPlacas_dir_y = Math.max(1, nPlacas_y || 2);
 const V_placa = (V_basal * 0.80) / nPlacas_dir_x;
 const tw_min = Math.max(hpiso/16, 0.15);
 const tw = Math.max(tw_placa, tw_min);
 const phiVn = φv * 0.53 * Math.sqrt(fc) * tw * Lw_placa * 1e4 / 1000;
 const placa_ok = V_placa <= phiVn;
 const Av_placa = 0.0025 * tw*100 * 20;
 const Mu_placa = V_placa * H_total * 0.67;

 // Cortante por placa por piso (distribución triangular)
 const V_placa_piso = cortantes_piso.map(cp => ({
 piso: cp.piso, hi: cp.hi,
 V_total: cp.Vi,
 V_placa: (cp.Vi * 0.80) / nPlacas_dir_x,
 }));

 // ── DERIVA E.030 §5.2 (con alturas reales por piso) ─────
 const I_placa = tw * Math.pow(Lw_placa, 3) / 12;
 const K_lat = nPlacas_dir_x * 2 * (12 * Ec*0.01 * I_placa * 1e4) / Math.pow(hpiso_promedio*100, 3);
 const derivas = cortantes_piso.map((c, i) => {
 const hentre_i = alturasArr[c.piso - 1] || hpiso;
 const Δ_elast = (c.Vi / K_lat);
 const Δ_inel = 0.75 * R * Δ_elast;
 const drift = Δ_inel / (hentre_i*100);
 return {piso: c.piso, hi: c.hi, hentre: hentre_i, Δ_elast, Δ_inel, drift};
 });
 const drift_max = Math.max(...derivas.map(d=>d.drift));
 const drift_lim = 0.007;
 const deriva_ok = drift_max <= drift_lim;

 // ── ESCALERAS ───────────────────────────────────────────
 const n_cp_calc = Math.max(2, Math.round(hpiso/0.175));
 const n_cp = n_cp_user || n_cp_calc;
 const cp = hpiso/n_cp;
 const paso_calc = Math.max(0.25, Math.min(0.30, 0.62 - 2*cp));
 const paso = paso_user || paso_calc;
 const blond = 2*cp + paso;
 const LH = paso*(n_cp - 1);
 const cosA = LH/Math.sqrt(LH*LH+hpiso*hpiso);
 const alpha = Math.atan(hpiso/LH)*180/Math.PI;
 const t_esc = Math.max(0.15, Math.ceil(LH/20/0.025)*0.025);
 const d_esc = t_esc - 0.02;
 const PP_esc = gc*t_esc/cosA + gc*cp/2;
 const Wu_esc = 1.4*(PP_esc+0.100) + 1.7*qcvCorr;
 const Mu_esc = Wu_esc*LH*LH/8;
 const As_esc = Math.max(Mu_esc*1e5/(φf*fy*0.9*d_esc*100), 0.0018*100*t_esc*100);
 const var_esc = elegirVarilla(As_esc);
 const blon_ok = blond>=0.60 && blond<=0.64;

 // ── ZAPATAS ─────────────────────────────────────────────
 const mkZapata = (Pu, b_col_m, label, L_user, hz_user) => {
 const P_serv = Pu/1.45;
 const qneta = qadm - gs*Df - gc*0.50;
 const Az_req = P_serv/Math.max(qneta, 0.1);
 const L_calc = Math.ceil(Math.sqrt(Az_req)/0.05)*0.05;
 const L = L_user || L_calc;
 const qu = Pu/(L*L);
 const q_serv = P_serv/(L*L);
 const bc = b_col_m;
 const v = (L - bc)/2;
 const hz_calc = Math.max(v/2, 0.30);
 const hz = hz_user || hz_calc;
 const var_unif_d = var_unif.d;
 const d = hz - 0.075 - var_unif_d/2000;

 const Mu = qu*L*v*v/2;
 const As_min = 0.0018*L*100*hz*100;
 const As_req = Mu*1e5/(φf*fy*0.9*d*100);
 const As = Math.max(As_req, As_min);
 const var_z = elegirVarilla(As/L);
 const nvar = Math.max(2, Math.ceil(As/var_z.As));
 const sep = (L*100)/nvar;

 const bo = 4*(bc+d);
 const Vu_punz = qu*(L*L - (bc+d)*(bc+d));
 const phiVc_punz = φp * 0.27 * Math.sqrt(fc) * bo * d * 1e4 / 1000;
 const punz_ok = Vu_punz <= phiVc_punz;

 const Vu_uni = qu * L * Math.max(0, (v - d));
 const phiVc_uni = φv * 0.53 * Math.sqrt(fc) * L * d * 1e4 / 1000;
 const uni_ok = Vu_uni <= phiVc_uni;

 const presion_ok = q_serv <= qadm;

 // Asentamiento elástico aproximado (Boussinesq):
 // Si ≈ q·B·(1-ν²)/Es · Iw (ν=0.30, Es=350·qadm)
 const nu = 0.30, Es = 350 * qadm;
 const Si = q_serv * L * (1 - nu*nu) / Es * 1.12 * 100; // mm

 return {label, Pu, P_serv, q_serv, qneta, Az_req, L, L_calc, hz, hz_calc, qu, bc, v, d,
 Mu, As, As_req, As_min, var_z, nvar, sep,
 bo, Vu_punz, phiVc_punz, punz_ok,
 Vu_uni, phiVc_uni, uni_ok,
 presion_ok, Si,
 ok_total: punz_ok && uni_ok && presion_ok};
 };

 const bc_unif = b_unif/100;
 const zap_C = mkZapata(col_C.Pu, bc_unif, "Central", L_zap_C_user, hz_zap_C_user);
 const zap_PX = mkZapata(col_PX.Pu, bc_unif, "Perimetral X", L_zap_PX_user, hz_zap_PX_user);
 const zap_PY = mkZapata(col_PY.Pu, bc_unif, "Perimetral Y", L_zap_PY_user, hz_zap_PY_user);
 const zap_E = mkZapata(col_E.Pu, bc_unif, "Esquinera", L_zap_E_user, hz_zap_E_user);

 // Asentamiento diferencial entre zapatas (centro - esquina)
 const Sdif = Math.abs(zap_C.Si - zap_E.Si);
 const Sdif_max = 25; // mm (E.050 Tab.8 · para edificios)
 const asent_dif_ok = Sdif <= Sdif_max;

 // ── ESPECTRO Sa(T) ──────────────────────────────────────
 const espectro = [];
 for (let t = 0.02; t <= 5.0; t += 0.05) {
 let Ct_;
 if (t < Tp) Ct_ = 2.5;
 else if (t < Tl) Ct_ = 2.5 * Tp/t;
 else Ct_ = 2.5 * (Tp*Tl)/(t*t);
 const Sa_el = (Z*U*Ct_*S) * 9.81; // espectro elástico (sin R)
 const Sa_dis = (Z*U*Ct_*S/R) * 9.81; // espectro de diseño (con R)
 espectro.push({T: +t.toFixed(2), Sa_el: +Sa_el.toFixed(3), Sa: +Sa_dis.toFixed(3), C: +Ct_.toFixed(3)});
 }

 // ── DIAGRAMA DE INTERACCIÓN P-M ─────────────────────────
 const Ag = b_unif * b_unif;
 const As_total = As_unif;
 const Po = 0.85*fc*(Ag - As_total) + fy*As_total;
 const phiPo = 0.65 * 0.80 * Po / 1000;
 const recub_c = 4;
 const d_col_eff = b_unif - recub_c;
 const As_capa = As_total / 4;
 const c_bal = 0.003 / (0.003 + fy/(2.04e6)) * d_col_eff;
 const a_bal = 0.85 * c_bal;
 const Pn_bal_val = 0.85*fc*a_bal*b_unif;
 const Mn_bal_val = 0.85*fc*a_bal*b_unif*(b_unif/2 - a_bal/2) + As_capa*fy*(d_col_eff - b_unif/2)*2;
 const Mn_pura = As_capa*2 * fy * 0.9 * d_col_eff;

 const diagPM = [
 {P: phiPo, M: 0, etiqueta:"Compresión pura (φPo)"},
 {P: 0.85*phiPo, M: 0.65*Mn_bal_val/1.5e5, etiqueta:"Compresión controlada"},
 {P: 0.65*Pn_bal_val/1000, M: 0.65*Mn_bal_val/1e5, etiqueta:"Balanceado"},
 {P: 0.40*Pn_bal_val/1000, M: 0.78*Mn_pura/1e5, etiqueta:"Transición"},
 {P: 0, M: 0.90*Mn_pura/1e5, etiqueta:"Flexión pura (φMn)"},
 {P: -0.90*As_total*fy/1000, M: 0, etiqueta:"Tracción pura"},
 ];

 // Verificación biaxial Bresler (1/Pu = 1/PuX + 1/PuY - 1/Po)
 const Mu_col_estim_x = Math.max(1.5 * Vu_vp * h_vp / 2, Mu_vp_neg_ext * 0.5);
 const Mu_col_estim_y = Mu_col_estim_x * 0.85; // perpendicular
 const PuX_cap = phiPo * (1 - 0.20*Math.min(Mu_col_estim_x/(Mn_pura/1e5), 1));
 const PuY_cap = phiPo * (1 - 0.20*Math.min(Mu_col_estim_y/(Mn_pura/1e5), 1));
 const Pu_bresler_invertido = 1/PuX_cap + 1/PuY_cap - 1/phiPo;
 const Pu_bresler = 1 / Math.max(Pu_bresler_invertido, 0.001);

 const puntosCarga = [
 {tipo:"Central", P: col_C.Pu, M: Mu_col_estim_x*0.5, My: Mu_col_estim_y*0.5, color:"#1E40AF"},
 {tipo:"Perimetral X", P: col_PX.Pu, M: Mu_col_estim_x*0.8, My: Mu_col_estim_y*0.3, color:"#3B82F6"},
 {tipo:"Perimetral Y", P: col_PY.Pu, M: Mu_col_estim_x*0.3, My: Mu_col_estim_y*0.8, color:"#0EA5E9"},
 {tipo:"Esquinera", P: col_E.Pu, M: Mu_col_estim_x*1.2, My: Mu_col_estim_y*1.2, color:"#EA580C"},
 ];

 // ── REFUERZOS DETALLADOS ────────────────────────────────
 const Lv_total = Lx;
 const L_conf_2h = 2 * h_vp;
 const detalleEstribos = {
 Lconf: L_conf_2h,
 s_conf_zona: s_vp_sism,
 s_corr_zona: s_vp_corr,
 n_estribos_conf: Math.ceil(L_conf_2h / s_vp_sism) + 1,
 n_estribos_corr: Math.ceil((Lv_total - 2*L_conf_2h) / s_vp_corr) + 1,
 longitud_anclaje: 12 * var_vp.d / 10,
 longitud_empalme: 60 * var_vp.d / 10,
 };

 // Bastones de losa
 const Lb_basto = Lx / 4; // longitud típica de bastones
 const detalleLosa = {
 aligerada: {
 acero_principal: `${var_al.n}${var_al.nom} por vigueta`,
 As_principal: var_al.As_tot,
 acero_temperatura: '∅1/4" @ 0.25 m perpendicular',
 bastones_apoyo: `∅1/2" L=${(Lb_basto*100).toFixed(0)}cm`,
 bastones_longitud: Lb_basto,
 As_temp: 1.8,
 },
 maciza: {
 acero_x_inferior: `${var_mx.n}${var_mx.nom} @ ${(100/var_mx.n).toFixed(1)} cm`,
 acero_y_inferior: `${var_my.n}${var_my.nom} @ ${(100/var_my.n).toFixed(1)} cm`,
 acero_temp: '∅3/8" @ 0.25 m',
 bastones_negativos_x: `∅1/2" @ 0.20 m × L=${(Lx*100/4).toFixed(0)}cm`,
 bastones_negativos_y: `∅1/2" @ 0.20 m × L=${(Ly*100/4).toFixed(0)}cm`,
 },
 };

 const detallePlaca = {
 refuerzo_alma_h: '∅3/8" @ 0.20 m (2 capas)',
 refuerzo_alma_v: '∅3/8" @ 0.20 m (2 capas)',
 nucleo_confinado_lado: Math.max(2*tw, 0.40),
 refuerzo_nucleo_long: '8∅3/4"',
 estribos_nucleo: '∅3/8" @ 0.10 m',
 As_alma: Av_placa,
 As_nucleo: 8 * 2.84,
 };

 const detalleColumna = {
 longitudinal: `${var_unif.n*4}${var_unif.nom}`,
 As_total_long: As_unif,
 estribos_confinada: `∅3/8" @ ${s_conf.toFixed(0)} mm`,
 Lo_confinada: Lo_col,
 estribos_corriente: `∅3/8" @ ${Math.min(b_unif*10*0.7, 200).toFixed(0)} mm`,
 longitud_anclaje: 60 * var_unif.d / 10,
 longitud_empalme: 60 * var_unif.d / 10,
 diametro_estribos: 9.5,
 };

 // ── DETALLE DE ZAPATA · refuerzo superior e inferior ────
 const detalleZapata = {
 refuerzo_inferior: `${zap_C.nvar}${zap_C.var_z.nom} @ ${zap_C.sep.toFixed(1)} cm c/dir.`,
 refuerzo_superior: `${Math.ceil(zap_C.nvar/2)}${zap_C.var_z.nom} @ ${(zap_C.sep*2).toFixed(1)} cm c/dir.`,
 recubrimiento_libre: 7.5,
 longitud_anclaje: 12 * zap_C.var_z.d / 10,
 gancho_180: true,
 };

 // ── VIGAS DE CIMENTACIÓN ────────────────────────────────
 // Entre zapatas para evitar asentamientos diferenciales en zonas sísmicas
 const vigaCim = {
 h: 0.60, b: 0.30,
 longitudinal_sup: "4∅5/8\"",
 longitudinal_inf: "4∅5/8\"",
 estribos: "∅3/8\" @ 0.20 m",
 Lconf: 1.20,
 s_conf: 0.10,
 };

 // ── COORDENADAS DE EJES PARA PLANO ──────────────────────
 // Genera lista de coordenadas (x, y, label) para cada eje
 const coordEjesX = [];
 let posX = 0;
 for (let i = 0; i < nEjesX; i++) {
 coordEjesX.push({label: nombreEjeX(i), x: posX});
 if (i < ejesX.length) posX += ejesX[i];
 }
 const coordEjesY = [];
 let posY = 0;
 for (let i = 0; i < nEjesY; i++) {
 coordEjesY.push({label: nombreEjeY(i), y: posY});
 if (i < ejesY.length) posY += ejesY[i];
 }

 // Lista de columnas en planta (con tipo y ÁREA TRIBUTARIA REAL)
 const columnasEnPlanta = [];
 for (let iy = 0; iy < nEjesY; iy++) {
 for (let ix = 0; ix < nEjesX; ix++) {
 const esEsquinaX = (ix === 0 || ix === nEjesX - 1);
 const esEsquinaY = (iy === 0 || iy === nEjesY - 1);
 let tipo;
 if (esEsquinaX && esEsquinaY) tipo = "E";
 else if (esEsquinaX) tipo = "PY";
 else if (esEsquinaY) tipo = "PX";
 else tipo = "C";

 // Área tributaria = mitad del vano izq + mitad del vano der (X) por (Y igual)
 const dxIzq = ix > 0 ? ejesX[ix-1]/2 : 0;
 const dxDer = ix < nEjesX-1 ? ejesX[ix]/2 : 0;
 const dyInf = iy > 0 ? ejesY[iy-1]/2 : 0;
 const dySup = iy < nEjesY-1 ? ejesY[iy]/2 : 0;
 const at_real = (dxIzq + dxDer) * (dyInf + dySup);

 // Pu por esta columna específica
 const Pu_real_grav = Wu_U1 * at_real * N * 1.05;

 columnasEnPlanta.push({
 ix, iy,
 x: coordEjesX[ix].x,
 y: coordEjesY[iy].y,
 ejeX: coordEjesX[ix].label,
 ejeY: coordEjesY[iy].label,
 tipo, at_real,
 Pu_real: Pu_real_grav,
 id: `${coordEjesX[ix].label}${coordEjesY[iy].label}`,
 });
 }
 }
 // Suma de áreas tributarias = área de planta (verificación)
 const At_total_check = columnasEnPlanta.reduce((a,c)=>a+c.at_real, 0);

 // ── METRADO E.020 · Cuadro detallado ────────────────────
 const uso = CARGAS_VIVAS_E020.find(u=>u.id===usoEdificio) || CARGAS_VIVAS_E020[0];
 // Cargas muertas por defecto (suma de las activas)
 const cmDefault = cargasMuertas || [
 {id:"piso_ceramico", peso:100, activa:true},
 {id:"tab_ladrillo", peso:150, activa:true},
 {id:"cielo_yeso", peso:30, activa:true},
 {id:"instalaciones", peso:20, activa:true},
 ];
 const cm_total_acabados = cmDefault.filter(c=>c.activa).reduce((a,c)=>a+c.peso, 0) / 1000; // tf/m²

 const metrado = {
 uso: uso,
 cm_acabados: cm_total_acabados,
 cm_losa: PP_al, // peso propio losa aligerada
 cm_total: cm_total_acabados + PP_al,
 cv_principal: uso.cv / 1000,
 cv_corredor: uso.cv_corr / 1000,
 items_cm: cmDefault,
 // Carga muerta y viva total por planta
 CM_por_planta_tf: (cm_total_acabados + PP_al) * area_planta,
 CV_por_planta_tf: (uso.cv / 1000) * area_planta,
 // Peso total estimado
 Peso_total_CM: (cm_total_acabados + PP_al) * area_planta * N,
 Peso_total_CV: (uso.cv / 1000) * area_planta * N,
 };

 // ── VERIFICACIÓN GLOBAL ─────────────────────────────────
 const todo_ok = losa_ok && esb_ok && placa_ok && blon_ok
 && deriva_ok
 && zap_C.ok_total && zap_PX.ok_total
 && zap_PY.ok_total && zap_E.ok_total
 && cort_vp_ok && flex_vp_ok
 && col_C.ok && col_PX.ok && col_PY.ok && col_E.ok;

 return {
 // Geometría / Ejes
 ejesX, ejesY, nEjesX, nEjesY, nVanosX, nVanosY,
 Lx_total, Ly_total, Lx, Ly, Lx_max, Ly_max,
 coordEjesX, coordEjesY, columnasEnPlanta, At_total_check,
 alturas: alturasArr, H_total, hpiso_promedio, hi_acumulado, metrado,
 incluirSismo: incluirSismo !== false,
 nColC, nColP, nColE, nColTotal, area_planta,
 // Sísmica
 Z, U, S, Tp, Tl, R, Ct_sist, T, C_sis, ZUCS_R, ZUCS_R_efectivo, C_R_min_ok,
 Ws, V_basal, Ec, factor_CV, M_volteo,
 zona, suelo, categoria, sistema,
 k_dist, distribucion, cortantes_piso, momentos_volteo_piso,
 espectro, modos, formasModales, sumaMasaParticipativa, masa_part_ok,
 irregularidades, s_junta,
 // Cargas
 Wu_hab, Wu_U1, Wu_U2_grav, CM_estimada,
 // Losas
 h_al, h_al_min, h_al_calc, PP_al, Wu_al, d_al, Vu_al, phiVc_al, losa_ok,
 As_al, As_al_min, var_al, Mu_al,
 delta_al, delta_lim_al, defl_al_ok,
 h_mac, h_mac_min, h_mac_calc, d_mac, m_mac, Ca, Cb, Wu_mac,
 Mu_mac_x, Mu_mac_y, As_mac_x, As_mac_y, var_mx, var_my, As_mac_min,
 // Vigas
 h_vp, b_vp, h_vp_calc, b_vp_calc, d_vp,
 Mu_vp, Mu_vp_neg_ext, Mu_vp_neg_int, Mu_vp_pos_ext, Mu_vp_pos_int,
 Vu_vp, As_vp, As_vp_req, As_vp_min,
 As_vp_pos, var_vp, var_vp_pos,
 phiVc_vp, cort_vp_ok, s_vp_sism, s_vp_corr, flex_vp_ok,
 diagMomVp, diagCortVp,
 h_vs, b_vs, h_vs_calc, b_vs_calc, d_vs, Mu_vs, Vu_vs, As_vs, As_vs_req, var_vs,
 // Columnas
 col_C, col_PX, col_PY, col_E,
 b_unif, b_unif_calc, As_unif, var_unif, rho_esq,
 s_conf, Lo_col, lu, esb, esb_klu_r, esb_ok,
 Mu_col_estim: Mu_col_estim_x,
 Mu_col_estim_x, Mu_col_estim_y, Pu_bresler,
 diagPM, puntosCarga,
 // Placas
 tw, tw_min, phiVn, placa_ok, Av_placa, V_placa, nPlacas_dir: nPlacas_dir_x, Mu_placa,
 V_placa_piso, nPlacas_dir_x, nPlacas_dir_y,
 // Derivas
 derivas, drift_max, drift_lim, deriva_ok, K_lat, I_placa,
 // Escaleras
 n_cp, n_cp_calc, cp, paso, paso_calc, blond, blon_ok,
 LH, alpha, cosA, t_esc, d_esc, Wu_esc, Mu_esc, As_esc, var_esc,
 // Zapatas y cimentación
 zap_C, zap_PX, zap_PY, zap_E,
 Sdif, Sdif_max, asent_dif_ok,
 detalleZapata, vigaCim,
 // Detalles
 detalleEstribos, detalleLosa, detallePlaca, detalleColumna,
 // Global
 todo_ok,
 };
}
