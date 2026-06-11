/**
 * exportPPTX.js · Presentación profesional para sustentación
 * Genera un archivo .pptx con láminas estructuradas tipo informe ejecutivo.
 */
import PptxGenJS from "pptxgenjs";

// Paleta profesional sobria
const COL = {
  bg: "FFFFFF",
  primary: "1E3A5F",
  accent: "B85C00",
  text: "2C3E50",
  textLight: "5D6D7E",
  border: "D5DBDB",
  green: "27AE60",
  red: "C0392B",
  fill: "F4F6F8",
};

const FONT_TITLE = "Calibri";
const FONT_BODY = "Calibri";

export function exportarPPTX(p, r, incluirFase2 = false) {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE"; // 13.33 × 7.5 in (16:9)
  pptx.title = `Memoria Estructural · ${p.proyecto}`;
  pptx.author = "Predimensionamiento Estructural v8";

  // ───────── PORTADA ─────────
  const s1 = pptx.addSlide();
  s1.background = { color: COL.primary };
  s1.addText("MEMORIA DE CÁLCULO", {
    x: 0.5, y: 1.5, w: 12.3, h: 0.7,
    fontSize: 32, bold: true, color: "FFFFFF", fontFace: FONT_TITLE, align: "center",
  });
  s1.addText("PREDIMENSIONAMIENTO ESTRUCTURAL", {
    x: 0.5, y: 2.3, w: 12.3, h: 0.5,
    fontSize: 18, color: "FFFFFF", fontFace: FONT_TITLE, align: "center",
  });
  // Línea separadora
  s1.addShape("rect", { x: 5, y: 3.1, w: 3.3, h: 0.04, fill: { color: COL.accent } });
  s1.addText(p.proyecto || "Proyecto", {
    x: 0.5, y: 3.4, w: 12.3, h: 0.6,
    fontSize: 28, bold: true, color: "FFFFFF", fontFace: FONT_TITLE, align: "center",
  });
  s1.addText(p.ubicacion || "", {
    x: 0.5, y: 4.1, w: 12.3, h: 0.4,
    fontSize: 14, italic: true, color: "FFFFFF", fontFace: FONT_BODY, align: "center",
  });
  // Datos generales en footer
  const fecha = new Date().toLocaleDateString("es-PE", {day:"2-digit", month:"long", year:"numeric"});
  s1.addText([
    {text: `Edificación de ${p.N} niveles · ${r.Lx_total.toFixed(1)} × ${r.Ly_total.toFixed(1)} m\n`, options: {bold: true, fontSize: 14}},
    {text: `Sistema estructural: ${r.sistema.desc}\n`, options: {fontSize: 12}},
    {text: `Zona sísmica ${r.zona.id} · Suelo tipo ${r.suelo.id} · Categoría ${r.categoria.id}\n\n`, options: {fontSize: 12}},
    {text: fecha, options: {fontSize: 11, italic: true}},
  ], {
    x: 0.5, y: 5.5, w: 12.3, h: 1.6,
    color: "FFFFFF", align: "center", fontFace: FONT_BODY,
  });

  // ───────── 2 · ÍNDICE ─────────
  const s2 = pptx.addSlide();
  s2.background = { color: COL.bg };
  addHeader(s2, "Contenido", p);
  const indice = [
    "1. Descripción del proyecto",
    "2. Geometría y materiales",
    "3. Cargas de diseño (E.020)",
    "4. Análisis sísmico (E.030)",
    "5. Predimensionamiento de losas",
    "6. Predimensionamiento de vigas",
    "7. Predimensionamiento de columnas",
    "8. Predimensionamiento de placas",
    "9. Predimensionamiento de zapatas",
    "10. Verificación normativa global",
    ...(incluirFase2 ? [
      "11. Análisis modal aproximado",
      "12. Diagrama de interacción P-M",
      "13. Cuadros de despiece",
      "14. Recomendaciones técnicas",
    ] : []),
  ];
  s2.addText(indice.map(t => ({text: t, options: {bullet: {type: "number"}}})), {
    x: 1.2, y: 1.4, w: 11, h: 5.5,
    fontSize: 16, color: COL.text, fontFace: FONT_BODY, lineSpacing: 28,
  });

  // ───────── 3 · DESCRIPCIÓN ─────────
  const s3 = pptx.addSlide();
  s3.background = { color: COL.bg };
  addHeader(s3, "Descripción del Proyecto", p);
  s3.addText([
    {text: "Proyecto: ", options: {bold: true}},
    {text: `${p.proyecto}\n`, options: {}},
    {text: "Ubicación: ", options: {bold: true}},
    {text: `${p.ubicacion}\n`, options: {}},
    {text: "Sistema estructural: ", options: {bold: true}},
    {text: `${r.sistema.desc}\n`, options: {}},
    {text: "Categoría de uso (E.030): ", options: {bold: true}},
    {text: `${r.categoria.desc}\n`, options: {}},
    {text: "Zona sísmica: ", options: {bold: true}},
    {text: `${r.zona.id} (Z = ${r.Z}) · ${r.zona.ejemplos}\n`, options: {}},
    {text: "Tipo de suelo: ", options: {bold: true}},
    {text: `${r.suelo.id} (${r.suelo.desc})`, options: {}},
  ], {
    x: 0.7, y: 1.4, w: 12, h: 4.5,
    fontSize: 16, color: COL.text, fontFace: FONT_BODY, lineSpacing: 30,
  });
  addFooter(s3, p);

  // ───────── 4 · GEOMETRÍA ─────────
  const s4 = pptx.addSlide();
  s4.background = { color: COL.bg };
  addHeader(s4, "Geometría y Materiales", p);
  // Tabla parámetros geométricos
  const tablaGeo = [
    [{text: "Parámetro", options: {bold: true, fill: COL.primary, color: "FFFFFF"}},
     {text: "Valor", options: {bold: true, fill: COL.primary, color: "FFFFFF"}},
     {text: "Unidad", options: {bold: true, fill: COL.primary, color: "FFFFFF"}}],
    [{text: "Lx total"}, {text: r.Lx_total.toFixed(2)}, {text: "m"}],
    [{text: "Ly total"}, {text: r.Ly_total.toFixed(2)}, {text: "m"}],
    [{text: "Nº pisos"}, {text: String(p.N)}, {text: ""}],
    [{text: "Altura total H"}, {text: r.H_total.toFixed(2)}, {text: "m"}],
    [{text: "Nº ejes (X · Y)"}, {text: `${r.nEjesX} · ${r.nEjesY}`}, {text: ""}],
    [{text: "Nº columnas"}, {text: String(r.nColTotal)}, {text: ""}],
    [{text: "Área en planta"}, {text: r.area_planta.toFixed(2)}, {text: "m²"}],
    [{text: "f'c (concreto)"}, {text: String(p.fc)}, {text: "kgf/cm²"}],
    [{text: "fy (acero)"}, {text: String(p.fy)}, {text: "kgf/cm²"}],
  ];
  s4.addTable(tablaGeo, {
    x: 0.7, y: 1.4, w: 6, colW: [3, 1.7, 1.3],
    fontSize: 12, color: COL.text, fontFace: FONT_BODY,
    border: { type: "solid", pt: 0.5, color: COL.border },
  });
  // Espacio para nota a la derecha
  s4.addText([
    {text: "Materiales conforme a NTE E.060-2009\n", options: {bold: true}},
    {text: `\n• Concreto f'c = ${p.fc} kgf/cm²\n`, options: {}},
    {text: `• Acero fy = ${p.fy} kgf/cm² (Grado 60)\n`, options: {}},
    {text: `• Módulo Ec = 15100·√f'c = ${r.Ec.toFixed(0)} kgf/cm²\n`, options: {}},
    {text: `• γc = 2.40 tf/m³\n`, options: {}},
  ], {
    x: 7, y: 1.4, w: 5.5, h: 4,
    fontSize: 13, color: COL.text, fontFace: FONT_BODY, lineSpacing: 22,
    fill: { color: COL.fill },
    margin: 0.2,
  });
  addFooter(s4, p);

  // ───────── 5 · CARGAS ─────────
  const s5 = pptx.addSlide();
  s5.background = { color: COL.bg };
  addHeader(s5, "Cargas de Diseño · NTE E.020", p);
  const cmTotal = (p.cargasMuertas || []).filter(c=>c.activa).reduce((a,c)=>a+c.peso, 0);
  const tablaCargas = [
    [{text: "Concepto", options: {bold: true, fill: COL.primary, color: "FFFFFF"}},
     {text: "Valor", options: {bold: true, fill: COL.primary, color: "FFFFFF"}},
     {text: "Unidad", options: {bold: true, fill: COL.primary, color: "FFFFFF"}}],
    [{text: "Uso de la edificación"}, {text: r.metrado.uso.desc}, {text: ""}],
    [{text: "CV uso principal"}, {text: (r.metrado.cv_principal*1000).toFixed(0)}, {text: "kgf/m²"}],
    [{text: "CM acabados (activos)"}, {text: cmTotal.toString()}, {text: "kgf/m²"}],
    [{text: "Peso propio losa"}, {text: (r.PP_al*1000).toFixed(0)}, {text: "kgf/m²"}],
    [{text: "CM total"}, {text: (r.metrado.cm_total*1000).toFixed(0)}, {text: "kgf/m²"}],
    [{text: "U1 = 1.4 CM + 1.7 CV", options: {bold: true, fill: COL.fill}},
     {text: r.Wu_U1.toFixed(3), options: {bold: true, fill: COL.fill}},
     {text: "tf/m²", options: {bold: true, fill: COL.fill}}],
    [{text: "U2 = 1.25(CM+CV) + CS"}, {text: r.Wu_U2_grav.toFixed(3) + " + CS"}, {text: "tf/m²"}],
  ];
  s5.addTable(tablaCargas, {
    x: 0.7, y: 1.4, w: 8, colW: [4, 2.5, 1.5],
    fontSize: 13, color: COL.text, fontFace: FONT_BODY,
    border: { type: "solid", pt: 0.5, color: COL.border },
  });
  s5.addText("Referencia: NTE E.020-2006 Tabla 1 · NTE E.060-2009 §9.2", {
    x: 0.7, y: 6.5, w: 12, h: 0.4,
    fontSize: 10, italic: true, color: COL.textLight, align: "left",
  });
  addFooter(s5, p);

  // ───────── 6 · ANÁLISIS SÍSMICO ─────────
  const s6 = pptx.addSlide();
  s6.background = { color: COL.bg };
  addHeader(s6, "Análisis Sísmico · NTE E.030-2018", p);
  // KPIs grandes
  addKPI(s6, 0.7, 1.4, 3, 1.5, "Período T", r.T.toFixed(3) + " s", COL.primary);
  addKPI(s6, 4, 1.4, 3, 1.5, "ZUCS/R", r.ZUCS_R_efectivo.toFixed(4), COL.accent);
  addKPI(s6, 7.3, 1.4, 3, 1.5, "Peso Ws", r.Ws.toFixed(0) + " tf", COL.primary);
  addKPI(s6, 0.7, 3.1, 3, 1.5, "V basal", r.V_basal.toFixed(1) + " tf", COL.accent);
  addKPI(s6, 4, 3.1, 3, 1.5, "Mvolteo", r.M_volteo.toFixed(0) + " tf·m", COL.primary);
  addKPI(s6, 7.3, 3.1, 3, 1.5, "k (Fi)", r.k_dist.toFixed(2), COL.accent);
  // Detalles de fórmulas
  s6.addText([
    {text: "Parámetros sísmicos:\n", options: {bold: true}},
    {text: `Z = ${r.Z}   U = ${r.U}   C = ${r.C_sis.toFixed(3)}   S = ${r.S.toFixed(2)}   R = ${r.R}\n`, options: {}},
    {text: `Tp = ${r.Tp} s   TL = ${r.Tl} s   Ct = ${r.Ct_sist}\n`, options: {}},
    {text: "\nDistribución vertical: ", options: {bold: true}},
    {text: "Fi = (Pi·hi^k) × V / Σ(Pj·hj^k)   (E.030 §28.6)", options: {}},
  ], {
    x: 0.7, y: 4.9, w: 12, h: 1.8,
    fontSize: 13, color: COL.text, fontFace: FONT_BODY,
    fill: { color: COL.fill }, margin: 0.2,
  });
  addFooter(s6, p);

  // ───────── 7 · DISTRIBUCIÓN POR PISO ─────────
  const s7 = pptx.addSlide();
  s7.background = { color: COL.bg };
  addHeader(s7, "Distribución de Fuerzas por Piso", p);
  // Tabla
  const distHdr = [{text: "Piso", options: {bold: true, fill: COL.primary, color: "FFFFFF"}},
                   {text: "hi (m)", options: {bold: true, fill: COL.primary, color: "FFFFFF"}},
                   {text: "Pi (tf)", options: {bold: true, fill: COL.primary, color: "FFFFFF"}},
                   {text: "Fi (tf)", options: {bold: true, fill: COL.primary, color: "FFFFFF"}},
                   {text: "Vi (tf)", options: {bold: true, fill: COL.primary, color: "FFFFFF"}}];
  const distData = r.distribucion.slice().reverse().map(d => {
    const vc = r.cortantes_piso.find(v => v.piso === d.piso);
    return [
      {text: String(d.piso)},
      {text: d.hi.toFixed(2)},
      {text: d.Pi.toFixed(1)},
      {text: d.Fi.toFixed(2)},
      {text: vc ? vc.Vi.toFixed(2) : ""},
    ];
  });
  s7.addTable([distHdr, ...distData], {
    x: 0.7, y: 1.4, w: 6, colW: [0.9, 1.2, 1.3, 1.3, 1.3],
    fontSize: 12, color: COL.text, fontFace: FONT_BODY,
    border: { type: "solid", pt: 0.5, color: COL.border },
  });
  // Gráfico de barras Fi
  const dataFi = [{
    name: "Fi por piso",
    labels: r.distribucion.map(d => `P${d.piso}`),
    values: r.distribucion.map(d => +d.Fi.toFixed(2)),
  }];
  s7.addChart(pptx.ChartType.bar, dataFi, {
    x: 7.2, y: 1.4, w: 5.3, h: 4.5,
    chartColors: [COL.primary],
    showLegend: false,
    showTitle: true,
    title: "Fi (tf) por piso",
    titleFontSize: 14,
    catAxisLabelFontSize: 10,
    valAxisLabelFontSize: 10,
  });
  addFooter(s7, p);

  // ───────── 8 · RESULTADOS LOSAS ─────────
  const s8 = pptx.addSlide();
  s8.background = { color: COL.bg };
  addHeader(s8, "Predimensionamiento · Losas", p);
  const losasTable = [
    [{text: "Tipo de losa", options: {bold: true, fill: COL.primary, color: "FFFFFF"}},
     {text: "Peralte (m)", options: {bold: true, fill: COL.primary, color: "FFFFFF"}},
     {text: "Acero principal", options: {bold: true, fill: COL.primary, color: "FFFFFF"}},
     {text: "Estado", options: {bold: true, fill: COL.primary, color: "FFFFFF"}}],
    [{text: "Aligerada"}, {text: r.h_al.toFixed(2)},
     {text: `${r.var_al.n}${r.var_al.nom}/vigueta`},
     {text: r.losa_ok ? "CUMPLE" : "REVISAR", options: {bold:true, color: r.losa_ok?COL.green:COL.red}}],
    [{text: "Maciza"}, {text: r.h_mac.toFixed(2)},
     {text: `X: ${r.var_mx.n}${r.var_mx.nom} · Y: ${r.var_my.n}${r.var_my.nom}`},
     {text: "—"}],
  ];
  s8.addTable(losasTable, {
    x: 0.7, y: 1.4, w: 12, colW: [3, 2, 4.5, 2.5],
    fontSize: 14, color: COL.text, fontFace: FONT_BODY,
    border: { type: "solid", pt: 0.5, color: COL.border },
  });
  s8.addText([
    {text: "Criterios aplicados:\n", options: {bold: true}},
    {text: "• Losa aligerada: h ≥ Lx/25 (ACI 318-19 §9.3.1.1)\n", options: {}},
    {text: "• Losa maciza: h ≥ Lx/33 (luces cortas)\n", options: {}},
    {text: "• Verificación de cortante por vigueta (bw = 10 cm)\n", options: {}},
    {text: "• Verificación de deflexión L/360 (ACI §24.2)\n", options: {}},
  ], {
    x: 0.7, y: 3.6, w: 12, h: 2.5,
    fontSize: 13, color: COL.text, fontFace: FONT_BODY,
    fill: { color: COL.fill }, margin: 0.2,
  });
  addFooter(s8, p);

  // ───────── 9 · COLUMNAS ─────────
  const s9 = pptx.addSlide();
  s9.background = { color: COL.bg };
  addHeader(s9, "Predimensionamiento · Columnas", p);
  const colsTable = [
    [{text: "Tipo", options: {bold: true, fill: COL.primary, color: "FFFFFF"}},
     {text: "Pu env. (tf)", options: {bold: true, fill: COL.primary, color: "FFFFFF"}},
     {text: "Sección (cm)", options: {bold: true, fill: COL.primary, color: "FFFFFF"}},
     {text: "Acero", options: {bold: true, fill: COL.primary, color: "FFFFFF"}},
     {text: "Estado", options: {bold: true, fill: COL.primary, color: "FFFFFF"}}],
    ...[r.col_C, r.col_PX, r.col_PY, r.col_E].map(c => [
      {text: c.tipo},
      {text: c.Pu.toFixed(1)},
      {text: `${r.b_unif}·${r.b_unif}`},
      {text: `${r.var_unif.n*4}${r.var_unif.nom}`},
      {text: c.ok ? "CUMPLE" : "REVISAR", options: {bold: true, color: c.ok?COL.green:COL.red}},
    ]),
  ];
  s9.addTable(colsTable, {
    x: 0.7, y: 1.4, w: 12, colW: [3, 2.5, 2.5, 2.5, 1.5],
    fontSize: 13, color: COL.text, fontFace: FONT_BODY,
    border: { type: "solid", pt: 0.5, color: COL.border },
  });
  // Gráfica Pu por tipo
  const dataPu = [{
    name: "Pu por tipo",
    labels: ["Central", "Perim. X", "Perim. Y", "Esquinera"],
    values: [r.col_C.Pu, r.col_PX.Pu, r.col_PY.Pu, r.col_E.Pu].map(v => +v.toFixed(1)),
  }];
  s9.addChart(pptx.ChartType.bar, dataPu, {
    x: 0.7, y: 4.2, w: 12, h: 2.6,
    chartColors: [COL.accent],
    showLegend: false,
    showTitle: true,
    title: "Carga axial Pu por tipo de columna (tf)",
    titleFontSize: 14,
    catAxisLabelFontSize: 11,
    valAxisLabelFontSize: 10,
  });
  addFooter(s9, p);

  // ───────── 10 · ZAPATAS ─────────
  const s10 = pptx.addSlide();
  s10.background = { color: COL.bg };
  addHeader(s10, "Predimensionamiento · Zapatas", p);
  const zapTable = [
    [{text: "Tipo", options: {bold: true, fill: COL.primary, color: "FFFFFF"}},
     {text: "L (m)", options: {bold: true, fill: COL.primary, color: "FFFFFF"}},
     {text: "hz (m)", options: {bold: true, fill: COL.primary, color: "FFFFFF"}},
     {text: "q serv (tf/m²)", options: {bold: true, fill: COL.primary, color: "FFFFFF"}},
     {text: "Refuerzo", options: {bold: true, fill: COL.primary, color: "FFFFFF"}},
     {text: "Estado", options: {bold: true, fill: COL.primary, color: "FFFFFF"}}],
    ...[r.zap_C, r.zap_PX, r.zap_PY, r.zap_E].map(z => [
      {text: z.label},
      {text: z.L.toFixed(2)},
      {text: z.hz.toFixed(2)},
      {text: z.q_serv.toFixed(2)},
      {text: `${z.nvar}${z.var_z.nom}@${z.sep.toFixed(1)} cm`},
      {text: z.ok_total ? "CUMPLE" : "REVISAR", options: {bold:true, color: z.ok_total?COL.green:COL.red}},
    ]),
  ];
  s10.addTable(zapTable, {
    x: 0.7, y: 1.4, w: 12, colW: [3, 1.5, 1.5, 2, 2.5, 1.5],
    fontSize: 12, color: COL.text, fontFace: FONT_BODY,
    border: { type: "solid", pt: 0.5, color: COL.border },
  });
  s10.addText("Verificaciones efectuadas: punzonamiento, cortante uni-direccional, presión de servicio (ACI 318-19 §13.2.6 y §13.2.7).", {
    x: 0.7, y: 4, w: 12, h: 0.7,
    fontSize: 12, color: COL.textLight, italic: true,
  });
  addFooter(s10, p);

  // ───────── 11 · VERIFICACIONES GLOBALES ─────────
  const s11 = pptx.addSlide();
  s11.background = { color: COL.bg };
  addHeader(s11, "Verificaciones Normativas Globales", p);
  const verifs = [
    {label:"Losa aligerada · cortante", ok:r.losa_ok},
    {label:"Losa aligerada · deflexión", ok:r.defl_al_ok},
    {label:"Viga · cortante", ok:r.cort_vp_ok},
    {label:"Viga · flexión", ok:r.flex_vp_ok},
    {label:"Columna · cuantía", ok:r.rho_esq>=0.01},
    {label:"Columna · esbeltez", ok:r.esb_ok},
    {label:"Placa · cortante", ok:r.placa_ok},
    {label:"Deriva ≤ 0.007", ok:r.deriva_ok},
    {label:"Zap. C · punzonamiento", ok:r.zap_C.punz_ok},
    {label:"Zap. C · uni-direccional", ok:r.zap_C.uni_ok},
    {label:"Zap. E · punzonamiento", ok:r.zap_E.punz_ok},
    {label:"Escalera · Blondel", ok:r.blon_ok},
  ];
  const cumplen = verifs.filter(v=>v.ok).length;
  // KPI grande de % cumplimiento
  addKPI(s11, 0.7, 1.4, 3.5, 1.8,
    "Cumplimiento", `${Math.round(cumplen/verifs.length*100)} %`,
    cumplen===verifs.length ? COL.green : COL.accent);
  // Tabla resumen a la derecha
  const verifTable = verifs.map(v => [
    {text: v.label},
    {text: v.ok ? "CUMPLE" : "REVISAR", options: {bold: true, color: v.ok?COL.green:COL.red}},
  ]);
  s11.addTable([
    [{text: "Verificación", options: {bold: true, fill: COL.primary, color: "FFFFFF"}},
     {text: "Estado", options: {bold: true, fill: COL.primary, color: "FFFFFF"}}],
    ...verifTable,
  ], {
    x: 4.5, y: 1.4, w: 8, colW: [5.5, 2.5],
    fontSize: 11, color: COL.text, fontFace: FONT_BODY,
    border: { type: "solid", pt: 0.5, color: COL.border },
  });
  addFooter(s11, p);

  // ───────── FASE 2 (opcional) ─────────
  if (incluirFase2) {
    // ── F2.1 Análisis modal ──
    const sf1 = pptx.addSlide();
    sf1.background = { color: COL.bg };
    addHeader(sf1, "Fase 2 · Análisis Modal Aproximado", p);
    const modosTable = [
      [{text: "Modo", options: {bold: true, fill: COL.primary, color: "FFFFFF"}},
       {text: "T (s)", options: {bold: true, fill: COL.primary, color: "FFFFFF"}},
       {text: "f (Hz)", options: {bold: true, fill: COL.primary, color: "FFFFFF"}},
       {text: "Masa part.", options: {bold: true, fill: COL.primary, color: "FFFFFF"}}],
      ...r.modos.map(m => [
        {text: String(m.modo)},
        {text: m.T.toFixed(3)},
        {text: m.f.toFixed(2)},
        {text: (m.masaPart*100).toFixed(1) + " %"},
      ]),
    ];
    sf1.addTable(modosTable, {
      x: 0.7, y: 1.4, w: 6, colW: [1.2, 1.6, 1.6, 1.6],
      fontSize: 14, color: COL.text, fontFace: FONT_BODY,
      border: { type: "solid", pt: 0.5, color: COL.border },
    });
    sf1.addText([
      {text: "Análisis dinámico recomendado:\n", options: {bold: true, fontSize: 14}},
      {text: "• Modelar en ETABS / SAP2000\n", options: {fontSize: 12}},
      {text: "• Método modal espectral (E.030 §29)\n", options: {fontSize: 12}},
      {text: "• Σ masas participativas ≥ 90 %\n", options: {fontSize: 12}},
      {text: "• Verificar irregularidades (Ia, Ip)\n", options: {fontSize: 12}},
    ], {
      x: 7, y: 1.4, w: 5.5, h: 3,
      color: COL.text, fontFace: FONT_BODY,
      fill: { color: COL.fill }, margin: 0.2,
    });
    addFooter(sf1, p);

    // ── F2.2 Diagrama P-M ──
    const sf2 = pptx.addSlide();
    sf2.background = { color: COL.bg };
    addHeader(sf2, "Fase 2 · Diagrama de Interacción P-M", p);
    const pmData = [{
      name: "P-M",
      labels: r.diagPM.map(pt => pt.M.toFixed(2)),
      values: r.diagPM.map(pt => +pt.P.toFixed(1)),
    }];
    sf2.addChart(pptx.ChartType.scatter, pmData, {
      x: 0.7, y: 1.4, w: 8, h: 5,
      chartColors: [COL.primary],
      showTitle: true, title: "Diagrama P-M nominal", titleFontSize: 14,
      catAxisTitle: "M (tf·m)",
      valAxisTitle: "P (tf)",
    });
    sf2.addText([
      {text: "Sección columna:\n", options: {bold: true, fontSize: 14}},
      {text: `${r.b_unif} × ${r.b_unif} cm\n`, options: {fontSize: 13}},
      {text: `Refuerzo: ${r.var_unif.n*4}${r.var_unif.nom}\n`, options: {fontSize: 12}},
      {text: `ρ = ${(r.rho_esq*100).toFixed(2)} %\n\n`, options: {fontSize: 12}},
      {text: "Verificación biaxial:\n", options: {bold: true, fontSize: 13}},
      {text: "Bresler (E.060 §10.13)\n", options: {fontSize: 11, italic: true}},
    ], {
      x: 9, y: 1.4, w: 3.7, h: 5,
      color: COL.text, fontFace: FONT_BODY,
      fill: { color: COL.fill }, margin: 0.2,
    });
    addFooter(sf2, p);

    // ── F2.3 Despiece ──
    const sf3 = pptx.addSlide();
    sf3.background = { color: COL.bg };
    addHeader(sf3, "Fase 2 · Cuadro de Despiece", p);
    const despTable = [
      [{text: "ID", options: {bold: true, fill: COL.primary, color: "FFFFFF"}},
       {text: "Sección", options: {bold: true, fill: COL.primary, color: "FFFFFF"}},
       {text: "Refuerzo principal", options: {bold: true, fill: COL.primary, color: "FFFFFF"}},
       {text: "Estribos", options: {bold: true, fill: COL.primary, color: "FFFFFF"}}],
      [{text: "C-1 (Esquinera)"}, {text: `${r.b_unif}·${r.b_unif} cm`},
       {text: `${r.var_unif.n*4}${r.var_unif.nom}`}, {text: `∅3/8" @ ${r.s_conf.toFixed(0)} mm`}],
      [{text: "C-2/C-3 (Perimetral)"}, {text: `${r.b_unif}·${r.b_unif} cm`},
       {text: `${r.var_unif.n*4}${r.var_unif.nom}`}, {text: `∅3/8" @ ${r.s_conf.toFixed(0)} mm`}],
      [{text: "C-4 (Central)"}, {text: `${r.b_unif}·${r.b_unif} cm`},
       {text: `${r.var_unif.n*4}${r.var_unif.nom}`}, {text: `∅3/8" @ ${r.s_conf.toFixed(0)} mm`}],
      [{text: "V-101 (Lx)"}, {text: `${(r.b_vp*100).toFixed(0)}·${(r.h_vp*100).toFixed(0)} cm`},
       {text: `(-) ${r.var_vp.n}${r.var_vp.nom} (+) ${r.var_vp_pos.n}${r.var_vp_pos.nom}`},
       {text: `∅3/8" @ ${(r.s_vp_sism*100).toFixed(0)} cm`}],
      [{text: "V-102 (Ly)"}, {text: `${(r.b_vs*100).toFixed(0)}·${(r.h_vs*100).toFixed(0)} cm`},
       {text: `${r.var_vs.n}${r.var_vs.nom}`}, {text: `∅3/8" @ ${(r.s_vp_sism*100).toFixed(0)} cm`}],
    ];
    sf3.addTable(despTable, {
      x: 0.7, y: 1.4, w: 12, colW: [3, 2.5, 4, 2.5],
      fontSize: 12, color: COL.text, fontFace: FONT_BODY,
      border: { type: "solid", pt: 0.5, color: COL.border },
    });
    addFooter(sf3, p);

    // ── F2.4 Recomendaciones ──
    const sf4 = pptx.addSlide();
    sf4.background = { color: COL.bg };
    addHeader(sf4, "Fase 2 · Recomendaciones Técnicas", p);
    const recs = [
      "Modelar la estructura en software de análisis (ETABS o SAP2000).",
      "Efectuar análisis modal espectral conforme a NTE E.030-2018 §29.",
      "Verificar derivas máximas ≤ 0.007 (concreto armado).",
      "Verificar columnas perimetrales por flexo-compresión biaxial (Bresler).",
      "Ubicar empalmes en el tercio central, fuera de zonas confinadas Lo.",
      "Cumplir requisitos especiales de NTE E.060 §21 (estribos a 135°).",
      "Diseñar cimentación en SAFE verificando asentamientos diferenciales.",
      "Mantener recubrimientos mínimos según NTE E.060 §7.7.",
      "El predimensionamiento NO sustituye el diseño definitivo firmado por un ing. civil colegiado.",
    ];
    sf4.addText(recs.map(t => ({text: t, options: {bullet: true}})), {
      x: 0.7, y: 1.4, w: 12, h: 5.5,
      fontSize: 14, color: COL.text, fontFace: FONT_BODY, lineSpacing: 26,
    });
    addFooter(sf4, p);
  }

  // ───────── ÚLTIMA · CONCLUSIONES ─────────
  const sFin = pptx.addSlide();
  sFin.background = { color: COL.primary };
  sFin.addText("CONCLUSIONES", {
    x: 0.5, y: 1, w: 12.3, h: 0.8,
    fontSize: 32, bold: true, color: "FFFFFF", fontFace: FONT_TITLE, align: "center",
  });
  sFin.addShape("rect", { x: 5.5, y: 2, w: 2.3, h: 0.04, fill: { color: COL.accent } });
  // Conclusiones específicas según resultados
  const verifsAll = [r.losa_ok, r.cort_vp_ok, r.flex_vp_ok, r.rho_esq>=0.01, r.esb_ok, r.placa_ok, r.deriva_ok, r.zap_C.ok_total, r.zap_E.ok_total];
  const cumplenAll = verifsAll.filter(v=>v).length;
  const conclusiones = [
    `Se ha realizado el predimensionamiento de un edificio de ${p.N} pisos, ${r.Lx_total.toFixed(1)} × ${r.Ly_total.toFixed(1)} m.`,
    `Se cumple el ${Math.round(cumplenAll/verifsAll.length*100)} % de las verificaciones normativas en esta etapa.`,
    `Las dimensiones obtenidas constituyen valores iniciales para el modelamiento estructural definitivo.`,
    `Las normas aplicadas: NTE E.020, E.030-2018, E.050-2018, E.060-2009 y ACI 318-19.`,
  ];
  sFin.addText(conclusiones.map(t => ({text: t, options: {bullet: true}})), {
    x: 1.2, y: 2.5, w: 11, h: 3.5,
    fontSize: 16, color: "FFFFFF", fontFace: FONT_BODY, lineSpacing: 30,
  });
  sFin.addText("Gracias por su atención", {
    x: 0.5, y: 6, w: 12.3, h: 0.7,
    fontSize: 22, italic: true, color: "FFFFFF", fontFace: FONT_TITLE, align: "center",
  });

  // ───────── GUARDAR ─────────
  pptx.writeFile({ fileName: `Presentacion_Estructural_${(p.proyecto||"Proyecto").replace(/\s+/g,"_")}.pptx` });
}

// ──── HELPERS ────
function addHeader(slide, titulo, p) {
  slide.addShape("rect", { x: 0, y: 0, w: 13.33, h: 0.7, fill: { color: COL.primary } });
  slide.addText(titulo, {
    x: 0.5, y: 0.1, w: 9, h: 0.5,
    fontSize: 22, bold: true, color: "FFFFFF", fontFace: FONT_TITLE,
  });
  slide.addText(p.proyecto || "", {
    x: 9.5, y: 0.15, w: 3.5, h: 0.4,
    fontSize: 11, italic: true, color: "FFFFFF", fontFace: FONT_BODY, align: "right",
  });
}

function addFooter(slide, p) {
  slide.addShape("line", { x: 0.5, y: 7.05, w: 12.3, h: 0, line: { color: COL.border, width: 0.5 } });
  slide.addText("Memoria de Cálculo Estructural · v8", {
    x: 0.5, y: 7.1, w: 6, h: 0.3,
    fontSize: 9, color: COL.textLight, fontFace: FONT_BODY,
  });
  slide.addText(new Date().toLocaleDateString("es-PE"), {
    x: 7, y: 7.1, w: 5.8, h: 0.3,
    fontSize: 9, color: COL.textLight, fontFace: FONT_BODY, align: "right",
  });
}

function addKPI(slide, x, y, w, h, label, value, color) {
  slide.addShape("rect", { x, y, w, h, fill: { color }, line: { color, width: 0 } });
  slide.addText(value, {
    x: x+0.1, y: y+0.15, w: w-0.2, h: h*0.55,
    fontSize: 28, bold: true, color: "FFFFFF", fontFace: FONT_TITLE, align: "center", valign: "middle",
  });
  slide.addText(label, {
    x: x+0.1, y: y+h*0.65, w: w-0.2, h: h*0.3,
    fontSize: 12, color: "FFFFFF", fontFace: FONT_BODY, align: "center",
  });
}
