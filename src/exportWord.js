/**
 * exportWord.js · Memoria APA 7ma edición - Word
 * Formato B&N profesional sin colores
 * v9 · con figuras embebidas (SVG → PNG)
 */
import {
 Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
 HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
 convertInchesToTwip, Header, Footer, PageNumber, TabStopType,
 ImageRun,
} from "docx";
import { saveAs } from "file-saver";
import {
  svgPlantaInline, svgEspectroInline, svgDistribucionInline,
  svgDiagramaPMInline, svgDerivasInline, svgColumnaInline,
  svgCimentacionInline, svgDetallesTipicosInline,
} from "./svgInline.js";
import { svgStringToPng } from "./svgToPng.js";

const BLACK = "000000", DGRAY = "333333", GRAY = "666666", LGRAY = "DDDDDD";
const fv = (v,d=3) => typeof v==="number" ? v.toFixed(d) : String(v);

const run = (text, opts={}) => new TextRun({
 text, font: "Times New Roman",
 size: opts.size || 22,
 bold: opts.bold || false,
 italics: opts.italic || false,
 color: opts.color || BLACK,
 ...opts,
});

const mono = (text, opts={}) => new TextRun({
 text, font: "Courier New",
 size: opts.size || 20,
 color: opts.color || BLACK,
 ...opts,
});

const para = (children, opts={}) => new Paragraph({
 children: Array.isArray(children) ? children : [run(children, opts)],
 alignment: opts.align || AlignmentType.JUSTIFIED,
 spacing: { after: 160, line: 280 },
 indent: opts.indent ? { firstLine: 720 } : {},
});

const centrado = (children) => new Paragraph({
 children: Array.isArray(children) ? children : [run(children)],
 alignment: AlignmentType.CENTER,
 spacing: { after: 120, line: 280 },
});

const h1 = (text) => new Paragraph({
 children: [run(text, { bold: true, size: 28 })],
 heading: HeadingLevel.HEADING_1,
 alignment: AlignmentType.CENTER,
 spacing: { before: 400, after: 200 },
});

const h2 = (text) => new Paragraph({
 children: [run(text, { bold: true, size: 24 })],
 heading: HeadingLevel.HEADING_2,
 spacing: { before: 280, after: 120 },
});

const h3 = (text) => new Paragraph({
 children: [run(text, { bold: true, italic: true, size: 22 })],
 heading: HeadingLevel.HEADING_3,
 spacing: { before: 200, after: 80 },
});

const eqN = (() => { let n = 0; return () => ++n; })();
const eq = (formula) => new Paragraph({
 children: [
 mono(` ${formula}`),
 new TextRun({ text: `\t(${eqN()})`, font: "Times New Roman", size: 22 }),
 ],
 tabStops: [{ type: TabStopType.RIGHT, position: 8700 }],
 spacing: { before: 80, after: 80 },
 indent: { left: 720 },
});

const hr = () => new Paragraph({
 border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BLACK } },
 spacing: { before: 100, after: 100 },
 children: [],
});

const nota = (text) => new Paragraph({
 children: [
 run("Nota. ", { italic: true, bold: true, size: 20 }),
 run(text, { italic: true, size: 20 }),
 ],
 spacing: { before: 60, after: 160 },
});

const tituloTabla = (num, titulo) => [
 new Paragraph({
 children: [run(`Tabla ${num}`, { bold: true, size: 22 })],
 spacing: { before: 240, after: 0 },
 }),
 new Paragraph({
 children: [run(titulo, { italic: true, size: 22 })],
 spacing: { before: 0, after: 80 },
 }),
];

const thCell = (text, w) => new TableCell({
 children: [new Paragraph({
 children: [run(text, { bold: true, size: 20, color: "FFFFFF" })],
 alignment: AlignmentType.CENTER,
 spacing: { before: 60, after: 60 },
 })],
 shading: { type: ShadingType.SOLID, color: BLACK, fill: BLACK },
 width: w ? { size: w, type: WidthType.PERCENTAGE } : {},
});

const mkTable = (headers, rows, widths) => new Table({
 width: { size: 100, type: WidthType.PERCENTAGE },
 rows: [
 new TableRow({
 tableHeader: true,
 children: headers.map((h, i) => thCell(h, widths ? widths[i] : null)),
 }),
 ...rows.map((row, ri) => new TableRow({
 children: row.map((cell) => {
 const isNum = typeof cell === "number";
 return new TableCell({
 children: [new Paragraph({
 children: [run(isNum ? fv(cell, 3) : String(cell), { size: 20 })],
 alignment: isNum ? AlignmentType.RIGHT : AlignmentType.LEFT,
 spacing: { before: 50, after: 50 },
 })],
 shading: ri % 2 === 1 ? { type: ShadingType.SOLID, color: "F0F0F0", fill: "F0F0F0" } : {},
 });
 }),
 })),
 ],
});

// Tabla verificación (B&N - sin color de fondo en estado, solo borde)
const mkVerifTable = (rows) => new Table({
 width: { size: 100, type: WidthType.PERCENTAGE },
 rows: [
 new TableRow({
 tableHeader: true,
 children: [
 thCell("Verificación", 40),
 thCell("Actuante", 15),
 thCell("Resistencia/Límite", 20),
 thCell("Unidad", 10),
 thCell("Estado", 15),
 ],
 }),
 ...rows.map((row, ri) => new TableRow({
 children: [
 new TableCell({ children: [new Paragraph({
 children: [run(row.label, { size: 20 })],
 alignment: AlignmentType.LEFT,
 spacing: { before: 50, after: 50 },
 })] }),
 new TableCell({ children: [new Paragraph({
 children: [run(String(row.actuante), { size: 20, bold: true })],
 alignment: AlignmentType.RIGHT,
 spacing: { before: 50, after: 50 },
 })] }),
 new TableCell({ children: [new Paragraph({
 children: [run(String(row.limite), { size: 20 })],
 alignment: AlignmentType.RIGHT,
 spacing: { before: 50, after: 50 },
 })] }),
 new TableCell({ children: [new Paragraph({
 children: [run(row.unidad, { size: 20 })],
 alignment: AlignmentType.CENTER,
 spacing: { before: 50, after: 50 },
 })] }),
 new TableCell({
 children: [new Paragraph({
 children: [run(row.ok ? "Cumple" : "No cumple", {
 size: 20, bold: true,
 })],
 alignment: AlignmentType.CENTER,
 spacing: { before: 50, after: 50 },
 border: row.ok
 ? { top:{style:BorderStyle.SINGLE,size:4,color:BLACK}, bottom:{style:BorderStyle.SINGLE,size:4,color:BLACK} }
 : { top:{style:BorderStyle.SINGLE,size:8,color:BLACK}, bottom:{style:BorderStyle.SINGLE,size:8,color:BLACK} },
 })],
 shading: row.ok ? {} : { type: ShadingType.SOLID, color: "D0D0D0", fill: "D0D0D0" },
 }),
 ],
 })),
 ],
});

export async function exportarWord(p, r, incluirFase2 = false) {
 const fecha = new Date().toLocaleDateString("es-PE", { year:"numeric", month:"long", day:"numeric" });
 const blonOk = r.blond >= 0.60 && r.blond <= 0.64;

 // ──── Convertir figuras SVG a PNG (paralelo, con fallback) ────
 async function tryPng(svgFn, w, h) {
   try { return await svgStringToPng(svgFn(), w, h); }
   catch (e) { console.warn("SVG to PNG falló:", e); return null; }
 }
 const [
   pngPlanta, pngEspectro, pngDistrib, pngDerivas,
   pngPM, pngCol, pngCimentacion, pngDetalles,
 ] = await Promise.all([
   tryPng(() => svgPlantaInline(r, p),         720, 480),
   tryPng(() => svgEspectroInline(r),          600, 320),
   tryPng(() => svgDistribucionInline(r),      600, 340),
   tryPng(() => svgDerivasInline(r),           560, 320),
   tryPng(() => svgDiagramaPMInline(r),        500, 380),
   tryPng(() => svgColumnaInline(r.b_unif, r.var_unif, `Columna ${r.b_unif}×${r.b_unif} cm`), 320, 320),
   tryPng(() => svgCimentacionInline(r, p),    720, 520),
   tryPng(() => svgDetallesTipicosInline(r),   720, 540),
 ]);

 // Helper · construir párrafo con imagen + caption
 function figPar(png, w_pt, caption, num) {
   if (!png) return [para([run("[Figura no disponible]")], {indent:true})];
   const ratio = png.height / png.width;
   const w = w_pt;
   const h = w * ratio;
   return [
     new Paragraph({
       alignment: AlignmentType.CENTER,
       spacing: { before: 200, after: 80 },
       children: [
         new ImageRun({
           data: png.data,
           transformation: { width: w, height: h },
         }),
       ],
     }),
     new Paragraph({
       alignment: AlignmentType.CENTER,
       spacing: { after: 240 },
       children: [
         run(`Figura ${num}. `, { bold: true, italic: true, size: 20 }),
         run(caption, { italic: true, size: 20 }),
       ],
     }),
   ];
 }

 // PORTADA
 const portada = [
 new Paragraph({ children: [], spacing: { before: 2200 } }),
 centrado([run("MEMORIA DE CÁLCULO ESTRUCTURAL", { bold: true, size: 32 })]),
 centrado([run("PREDIMENSIONAMIENTO DE ELEMENTOS ESTRUCTURALES", { bold: true, size: 28 })]),
 new Paragraph({ children: [], spacing: { before: 320 } }),
 centrado([run(p.proyecto, { bold: true, size: 28 })]),
 centrado([run(p.descripcion || `Edificio de ${p.N} niveles de concreto armado`, { size: 22 })]),
 new Paragraph({ children: [], spacing: { before: 480 } }),
 centrado([run(`Ubicación: ${p.ubicacion}`, { size: 22 })]),
 centrado([run(`Sistema Estructural: ${r.sistema.desc}`, { size: 22 })]),
 centrado([run(`Zona Sísmica ${r.zona.id} (Z=${r.Z}) · Suelo ${r.suelo.id} · Categoría ${r.categoria.id}`, { size: 22 })]),
 new Paragraph({ children: [], spacing: { before: 320 } }),
 centrado([run(`f'c = ${p.fc} kg/cm² | fy = ${p.fy} kg/cm² | γc = 2.40 tf/m³`, { size: 22 })]),
 new Paragraph({ children: [], spacing: { before: 720 } }),
 hr(),
 centrado([run("Normas aplicables", { bold: true, size: 22 })]),
 centrado([run("NTE E.020-2006 | NTE E.030-2018 | NTE E.050-2018 | NTE E.060-2009", { size: 20 })]),
 centrado([run("ACI 318-19 | CIRSOC 201", { size: 20 })]),
 hr(),
 new Paragraph({ children: [], spacing: { before: 480 } }),
 centrado([run(fecha, { size: 22, italic: true })]),
 ];

 // SECCIÓN 1 · DATOS GENERALES
 const sec1 = [
 h1("1. Datos Generales del Proyecto"),
 h2("1.1 Descripción"),
 para([run(`El presente documento constituye la Memoria de Cálculo del Predimensionamiento Estructural del proyecto `,{}),
 run(p.proyecto, {bold:true}),
 run(`, ubicado en ${p.ubicacion}. La estructura corresponde a un edificio de ${p.N} niveles de concreto armado con sistema estructural ${r.sistema.desc.toLowerCase()}, clasificado en Zona Sísmica ${r.zona.id} (Z = ${r.Z}) sobre suelo tipo ${r.suelo.id} (${r.suelo.desc.toLowerCase()}). El objetivo del predimensionamiento es determinar las dimensiones preliminares y cuantías de acero de cada elemento estructural, las cuales servirán como punto de partida para el modelamiento y análisis estructural definitivo en software especializado.`, {})], {indent:true}),

 h2("1.2 Parámetros geométricos y materiales"),
 ...tituloTabla(1, "Parámetros geométricos y propiedades de materiales"),
 mkTable(
 ["Parámetro","Símbolo","Valor","Unidad"],
 [["Luz mayor (X)","Lx",p.Lx,"m"],
 ["Luz menor (Y)","Ly",p.Ly,"m"],
 ["Altura de entrepiso","hpiso",p.hpiso,"m"],
 ["Número de niveles","N",p.N," · "],
 ["Altura total","H = N·hpiso",fv(p.hpiso*p.N,2),"m"],
 ["Resistencia del concreto","f'c",p.fc,"kg/cm²"],
 ["Módulo de elasticidad","Ec = 15100√f'c",(15100*Math.sqrt(p.fc)).toFixed(0),"kg/cm²"],
 ["Fluencia del acero","fy",p.fy,"kg/cm²"]],
 [38,20,22,15]
 ),
 nota("Elaboración propia con base en NTE E.060-2009 §5.2 y ACI 318-19 §19.2.2."),

 h2("1.3 Cargas de diseño"),
 para([run("Las cargas de diseño se establecen conforme a la NTE E.020-2006. La combinación de carga última se aplica según NTE E.060-2009 §9.2:")], {indent:true}),
 eq("Wu = 1.4 CM + 1.7 CV"),
 eq(`Wu = 1.4(${p.qcm.toFixed(3)}) + 1.7(${p.qcv.toFixed(3)}) = ${r.Wu_hab.toFixed(3)} tf/m²`),
 ...tituloTabla(2, "Cargas de diseño por unidad de superficie"),
 mkTable(
 ["Tipo de carga","Símbolo","Valor (tf/m²)","Referencia"],
 [["Carga muerta","CM",fv(p.qcm,3),"NTE E.020 Tab. 1"],
 ["Carga viva habitaciones","CVh",fv(p.qcv,3),"NTE E.020 Tab. 1"],
 ["Carga viva corredores","CVc",fv(p.qcvCorr,3),"NTE E.020 Tab. 1"],
 ["Carga última","Wu",fv(r.Wu_hab,3),"NTE E.060 §9.2"]],
 [38,14,18,25]
 ),
 ...figPar(pngPlanta, 480, "Plano de planta estructural con ejes y ubicación de columnas.", 1),
 ];

 // SECCIÓN 2 · SÍSMICO
 const sec2 = [
 h1("2. Análisis Sísmico Estático"),
 para([run("El análisis sísmico estático se efectúa conforme a la NTE E.030-2018. El edificio se clasifica como Categoría ", {}),
 run(r.categoria.id, {bold:true}),
 run(` sobre suelo tipo ${r.suelo.id}, ubicado en Zona Sísmica ${r.zona.id} (${r.zona.ejemplos}).`)], {indent:true}),
 eq(`T = H / Ct = ${(p.hpiso*p.N).toFixed(2)} / ${r.Ct} = ${r.T.toFixed(3)} s`),
 eq(`C = ${r.C_sis.toFixed(3)} (según condición: T ${r.T<r.Tp?"<":r.T<r.Tl?"<":">="} Tp)`),
 eq(`ZUCS/R = (${r.Z}·${r.U}·${r.C_sis.toFixed(3)}·${r.S.toFixed(2)})/${r.R} = ${r.ZUCS_R.toFixed(4)}`),
 eq(`Verificación: C/R = ${(r.C_sis/r.R).toFixed(3)} ≥ 0.11 → ${r.C_R_min_ok ? "Cumple" : "Aplicar mínimo"}`),
 eq(`V_basal = (ZUCS/R) · Ws = ${r.ZUCS_R_efectivo.toFixed(4)} × ${r.Ws.toFixed(1)} = ${r.V_basal.toFixed(2)} tf`),
 ...tituloTabla(3, "Parámetros sísmicos de diseño (NTE E.030-2018)"),
 mkTable(
 ["Factor","Símbolo","Valor","Artículo"],
 [[`Zona ${r.zona.id} · ${r.zona.ejemplos}`,"Z",r.Z,"Art. 10"],
 [`Uso Cat. ${r.categoria.id}`,"U",r.U,"Art. 15"],
 [`Suelo ${r.suelo.id} · ${r.suelo.desc}`,"S",r.S.toFixed(2),"Art. 14"],
 ["Período de plataforma","Tp",r.Tp.toFixed(2)+" s","Art. 14"],
 ["Período límite","TL",r.Tl.toFixed(2)+" s","Art. 14"],
 [`Sistema ${r.sistema.desc}`,"R",r.R,"Tab. 7"],
 ["Período fundamental","T",r.T.toFixed(3)+" s","Art. 28.4"],
 ["Coef. amplificación","C",r.C_sis.toFixed(3),"Art. 14"],
 ["ZUCS/R"," · ",r.ZUCS_R.toFixed(4),"Art. 25.3"],
 ["Cortante basal","V",r.V_basal.toFixed(2)+" tf","Art. 28"]],
 [38,14,18,20]
 ),
 nota("Análisis estático preliminar. El análisis definitivo se efectuará mediante análisis dinámico modal espectral conforme a NTE E.030-2018 §29."),
 ];

 // SECCIÓN 3 · LOSAS
 const sec3 = [
 h1("3. Predimensionamiento de Losas"),
 h2("3.1 Losa aligerada unidireccional"),
 para([run("El peralte mínimo se determina conforme al ACI 318-19 §9.3.1.1 como h"),
 run("min", {size:16}), run(` = L/25 para losas en una dirección con un extremo continuo. La luz de diseño es Lx = ${p.Lx} m.`)], {indent:true}),
 eq(`h_min = Lx/25 = ${p.Lx}/25 = ${r.h_al_min.toFixed(3)} m → h adoptado = ${r.h_al.toFixed(2)} m`),
 eq(`PP = ${r.PP_al.toFixed(3)} tf/m² (NTE E.020-2006 Tab. 4)`),
 eq(`Vu = Wu·Lx/2 = ${r.Vu_al.toFixed(3)} tf/m`),
 eq(`φVc = φ·0.53·√f'c·bw·d = ${r.phiVc_al.toFixed(3)} tf/m`),
 ...tituloTabla(4, "Verificación por cortante · losa aligerada"),
 mkVerifTable([
 {label:"Vu ≤ φVc", actuante:fv(r.Vu_al,3), limite:fv(r.phiVc_al,3), unidad:"tf/m", ok:r.losa_ok},
 ]),
 eq(`Mu = Wu·Lx²/8 = ${r.Mu_al.toFixed(3)} tf·m/m`),
 eq(`As_req = ${r.As_al.toFixed(2)} cm²/m → Adoptar ${r.var_al.n}${r.var_al.nom}/vigueta`),

 h2("3.2 Losa maciza bidireccional"),
 para([run("Se aplica el Método 3 de CIRSOC con coeficientes Ca y Cb interpolados según m = Ly/Lx:")], {indent:true}),
 eq(`m = Ly/Lx = ${r.m_mac.toFixed(3)}`),
 eq(`Ca = ${r.Ca.toFixed(4)}, Cb = ${r.Cb.toFixed(4)} (interpolados CIRSOC Tab. 12.4)`),
 eq(`h adoptado = ${r.h_mac.toFixed(2)} m`),
 eq(`Mu_x = Ca·Wu·Lx² = ${r.Mu_mac_x.toFixed(3)} tf·m/m`),
 eq(`Mu_y = Cb·Wu·Ly² = ${r.Mu_mac_y.toFixed(3)} tf·m/m`),
 ...tituloTabla(5, "Resumen losa maciza bidireccional"),
 mkTable(
 ["Dirección","As req (cm²/m)","Varilla","As prov (cm²/m)"],
 [["X (paralelo a Lx)",fv(r.As_mac_x,2),`${r.var_mx.n}${r.var_mx.nom}`,fv(r.var_mx.As_tot,2)],
 ["Y (paralelo a Ly)",fv(r.As_mac_y,2),`${r.var_my.n}${r.var_my.nom}`,fv(r.var_my.As_tot,2)]],
 [25,25,25,25]
 ),
 nota("CIRSOC (2005), Método 3. ACI 318-19 §8.3.1.1, §24.4.3."),
 ];

 // SECCIÓN 4 · VIGAS
 const sec4 = [
 h1("4. Predimensionamiento de Vigas"),
 para([run("Las vigas se dimensionan como elementos de pórticos especiales sismorresistentes conforme a NTE E.060-2009 §21.4.3, con factores de reducción φflex = 0.90 y φcort = 0.85.")], {indent:true}),
 h2("4.1 Viga principal (dirección Lx)"),
 eq(`h = Lx/12 = ${(p.Lx/12).toFixed(3)} m → h adoptado = ${r.h_vp.toFixed(2)} m`),
 eq(`b = máx(h/2, 0.25) = ${r.b_vp.toFixed(2)} m`),
 eq(`Mu = wv·Lx²/10 = ${r.Mu_vp.toFixed(3)} tf·m`),
 eq(`Vu = wv·Lx/2 = ${r.Vu_vp.toFixed(3)} tf`),
 eq(`As_req = ${r.As_vp.toFixed(2)} cm² → ${r.var_vp.n}${r.var_vp.nom}`),
 eq(`s_conf = mín(d/4, 6db, 150mm) = ${(r.s_vp_sism*1000).toFixed(0)} mm`),
 ...tituloTabla(6, "Resumen del predimensionamiento de vigas"),
 mkTable(
 ["Viga","h (m)","b (m)","Mu (tf·m)","As (cm²)","Acero"],
 [["Principal VP (Lx)",fv(r.h_vp,2),fv(r.b_vp,2),fv(r.Mu_vp,3),fv(r.As_vp,2),`${r.var_vp.n}${r.var_vp.nom}`],
 ["Secundaria VS (Ly)",fv(r.h_vs,2),fv(r.b_vs,2),fv(r.Mu_vs,3),fv(r.As_vs,2),`${r.var_vs.n}${r.var_vs.nom}`]],
 [25,12,12,17,17,17]
 ),
 ];

 // SECCIÓN 5 · COLUMNAS
 const sec5 = [
 h1("5. Predimensionamiento de Columnas"),
 para([run("Se identifican cuatro tipos de columna según su posición en planta. Cada tipo se predimensiona en función de su área tributaria y la carga axial última acumulada por los N niveles. Se adopta ρ = 1.5% y φ = 0.65.")], {indent:true}),
 eq("Pu = Wu · At · N · 1.05"),
 eq(`Ag = Pu / [φ·(0.85·f'c·(1-ρ) + fy·ρ)] = Pu / ${(0.65*(0.85*p.fc*0.985+p.fy*0.015)).toFixed(2)}`),
 ...tituloTabla(7, "Predimensionamiento de columnas por tipo"),
 mkTable(
 ["Tipo","At (m²)","Pu (tf)","Ag req (cm²)","b (cm)","Verif."],
 [["Central",fv(p.Lx*p.Ly,2),fv(r.col_C.Pu,2),fv(r.col_C.Ag_req,0),r.col_C.b_calc,r.col_C.ok?"Cumple":"Revisar"],
 ["Perimetral X",fv(p.Lx*p.Ly/2,2),fv(r.col_PX.Pu,2),fv(r.col_PX.Ag_req,0),r.col_PX.b_calc,r.col_PX.ok?"Cumple":"Revisar"],
 ["Perimetral Y",fv(p.Lx/2*p.Ly,2),fv(r.col_PY.Pu,2),fv(r.col_PY.Ag_req,0),r.col_PY.b_calc,r.col_PY.ok?"Cumple":"Revisar"],
 ["Esquinera",fv(p.Lx/2*p.Ly/2,2),fv(r.col_E.Pu,2),fv(r.col_E.Ag_req,0),r.col_E.b_calc,r.col_E.ok?"Cumple":"Revisar"]],
 [18,16,16,16,12,12]
 ),
 h2(`5.1 Sección unificada: ${r.b_unif} × ${r.b_unif} cm`),
 para([run(`Por criterio constructivo se adopta una sección unificada para todas las columnas del edificio. Esto facilita el encofrado, garantiza la uniformidad en obra y simplifica la supervisión. La cuantía real en la columna esquinera (la menos cargada) es ρ = ${(r.rho_esq*100).toFixed(2)}%, que cumple el mínimo normativo de 1.0%.`)], {indent:true}),
 eq(`As = ρ·Ag = 0.015 × ${r.b_unif}² = ${r.As_unif.toFixed(2)} cm² → ${r.var_unif.n*4}${r.var_unif.nom}`),
 eq(`s_conf = mín(b/4, 6db, 100mm) = ${r.s_conf.toFixed(0)} mm`),
 eq(`Lo = máx(b, lu/6, 450mm) = ${r.Lo_col.toFixed(0)} mm`),
 eq(`λ = lu/b = ${r.esb.toFixed(2)} ≤ 12`),
 ...tituloTabla(8, "Verificaciones de la sección unificada"),
 mkVerifTable([
 {label:"Cuantía mínima", actuante:"1.50%", limite:"1.0-6.0%", unidad:"%", ok:true},
 {label:"Cuantía esquinera", actuante:(r.rho_esq*100).toFixed(2)+"%", limite:"≥ 1.0%", unidad:"%", ok:r.rho_esq>=0.01},
 {label:"Esbeltez λ", actuante:r.esb.toFixed(2), limite:"≤ 12", unidad:"adim.", ok:r.esb_ok},
 {label:"Long. confinada Lo", actuante:r.Lo_col.toFixed(0), limite:"≥ máx(b,lu/6,450)", unidad:"mm", ok:true},
 ]),
 ];

 // SECCIÓN 6 · PLACAS
 const sec6 = [
 h1("6. Placas y Muros de Corte"),
 eq(`tw_min = hpiso/16 = ${(p.hpiso/16).toFixed(3)} m → tw = ${r.tw.toFixed(2)} m`),
 eq(`V_basal = ${r.V_basal.toFixed(2)} tf`),
 eq(`φVn = φ·0.53·√f'c·tw·lw = ${r.phiVn.toFixed(2)} tf`),
 eq(`Av_min = ρh·tw·s = ${r.Av_placa.toFixed(2)} cm²/m`),
 ...tituloTabla(9, "Verificación de cortante sísmico · muro de corte"),
 mkVerifTable([
 {label:"V ≤ φVn", actuante:fv(r.V_basal,2), limite:fv(r.phiVn,2), unidad:"tf", ok:r.placa_ok},
 {label:"tw ≥ tw_min", actuante:fv(r.tw,3), limite:fv(r.tw_min,3), unidad:"m", ok:r.tw>=r.tw_min},
 ]),
 nota("Refuerzo mínimo: ∅3/8\" @ 0.20 m en dos capas, ambas direcciones. Bordes confinados según NTE E.060 §21.9.6."),
 ];

 // SECCIÓN 7 · ESCALERAS
 const sec7 = [
 h1("7. Escaleras"),
 para([run("La geometría se verifica mediante la Regla de Blondel del Reglamento Nacional de Edificaciones: 60 cm ≤ 2c + p ≤ 64 cm.")], {indent:true}),
 eq(`n = round(hpiso/0.175) = ${r.n_cp}`),
 eq(`c = ${r.cp.toFixed(3)} m, p = ${r.paso.toFixed(3)} m`),
 eq(`Blondel = 2c + p = ${(r.blond*100).toFixed(1)} cm`),
 eq(`LH = p·n = ${r.LH.toFixed(3)} m, α = ${r.alpha.toFixed(1)}°, t = ${r.t_esc.toFixed(3)} m`),
 ...tituloTabla(10, "Verificación geométrica · Regla de Blondel"),
 mkVerifTable([
 {label:"Contrapaso c", actuante:(r.cp*100).toFixed(1), limite:"15-18", unidad:"cm", ok:r.cp>=0.14&&r.cp<=0.185},
 {label:"Paso p", actuante:(r.paso*100).toFixed(1), limite:"25-30", unidad:"cm", ok:r.paso>=0.24&&r.paso<=0.31},
 {label:"Blondel 2c+p", actuante:(r.blond*100).toFixed(1), limite:"60-64", unidad:"cm", ok:blonOk},
 ]),
 ];

 // SECCIÓN 8 · ZAPATAS
 const sec8 = [
 h1("8. Cimentación · Zapatas Aisladas"),
 para([run(`Se predimensiona una zapata aislada por cada tipo de columna del edificio. La capacidad portante admisible del suelo es q_adm = ${p.qadm} tf/m², con profundidad de cimentación Df = ${p.Df} m y peso unitario del suelo γs = ${p.gs} tf/m³.`)], {indent:true}),
 ...tituloTabla(11, "Resumen del predimensionamiento de zapatas aisladas"),
 mkTable(
 ["Tipo","Pu (tf)","L (m)","hz (m)","qu (tf/m²)","Mu (tf·m)","Acero","Punz."],
 [r.zap_C, r.zap_PX, r.zap_PY, r.zap_E].map(z=>[
 z.label, fv(z.Pu,2), fv(z.L,2), fv(z.hz,2),
 fv(z.qu,2), fv(z.Mu,2),
 `${z.nvar}${z.var_z.nom}@${fv(z.sep,1)}cm`,
 z.punz_ok ? "Cumple" : "Revisar"
 ]),
 [16,12,11,11,14,12,16,8]
 ),
 nota("Recubrimiento libre de 7.5 cm sobre la cara inferior (NTE E.060-2009 §7.7)."),
 h2("8.1 Detalle · Zapata central"),
 eq(`P_serv = Pu/1.55 = ${r.zap_C.P_serv.toFixed(2)} tf`),
 eq(`q_neta = q_adm - γs·Df - γc·hz = ${r.zap_C.qneta.toFixed(2)} tf/m²`),
 eq(`Az_req = P_serv/q_neta = ${r.zap_C.Az_req.toFixed(2)} m² → L = ${r.zap_C.L.toFixed(2)} m`),
 eq(`bo = 4·(bc+d) = ${(4*(r.zap_C.bc + r.zap_C.d)).toFixed(3)} m`),
 eq(`Vu_punz = qu·(L² - (bc+d)²) = ${r.zap_C.Vu_punz.toFixed(2)} tf`),
 eq(`φVc = 0.75·0.27·√f'c·bo·d = ${r.zap_C.phiVc_punz.toFixed(2)} tf`),
 ];

 // SECCIÓN 9 · RESUMEN
 const sec9 = [
 h1("9. Resumen Ejecutivo"),
 ...tituloTabla(12, "Cuadro consolidado del predimensionamiento estructural"),
 mkTable(
 ["Elemento","Sección","Acero","Estado"],
 [["Losa aligerada",`h=${fv(r.h_al,2)} m`,`${r.var_al.n}${r.var_al.nom}/vigueta`,r.losa_ok?"Cumple":"Revisar"],
 ["Losa maciza",`h=${fv(r.h_mac,2)} m`,`X:${r.var_mx.n}${r.var_mx.nom}`," · "],
 ["Viga principal",`${fv(r.h_vp,2)}×${fv(r.b_vp,2)} m`,`${r.var_vp.n}${r.var_vp.nom}`,r.flex_vp_ok&&r.cort_vp_ok?"Cumple":"Revisar"],
 ["Viga secundaria",`${fv(r.h_vs,2)}×${fv(r.b_vs,2)} m`,`${r.var_vs.n}${r.var_vs.nom}`," · "],
 ["Columna unif.",`${r.b_unif}×${r.b_unif} cm`,`${r.var_unif.n*4}${r.var_unif.nom}`,r.esb_ok?"Cumple":"Revisar"],
 ["Placa/Muro",`tw=${fv(r.tw,2)} lw=${p.Lw_placa} m`,'∅3/8"@0.20m',r.placa_ok?"Cumple":"Revisar"],
 ["Escalera",`t=${fv(r.t_esc,3)} m`,`${r.var_esc.n}${r.var_esc.nom}`,blonOk?"Cumple":"Revisar"],
 ["Zap. central",`${fv(r.zap_C.L,2)}×${fv(r.zap_C.L,2)} m`,`${r.zap_C.nvar}${r.zap_C.var_z.nom}`,r.zap_C.punz_ok?"Cumple":"Revisar"],
 ["Zap. esquinera",`${fv(r.zap_E.L,2)}×${fv(r.zap_E.L,2)} m`,`${r.zap_E.nvar}${r.zap_E.var_z.nom}`,r.zap_E.punz_ok?"Cumple":"Revisar"]],
 [22,28,28,22]
 ),
 ];

 // SECCIÓN 10 · CONCLUSIONES
 const sec10 = [
 h1("10. Conclusiones y Siguiente Fase"),
 h2("10.1 Conclusión técnica"),
 para([run(r.todo_ok
 ? "Todos los elementos estructurales verificados cumplen con los requisitos mínimos de resistencia y geometría establecidos por las normas NTE E.060-2009 y ACI 318-19. Las secciones y cuantías de acero obtenidas constituyen un punto de partida adecuado para el modelamiento estructural definitivo en la Fase 2."
 : "Se han identificado elementos que requieren ajuste antes de proceder al modelamiento estructural definitivo. Las recomendaciones específicas se detallan en cada sección.")], {indent:true}),
 h2("10.2 Hoja de ruta · Fase 2: Diseño Detallado"),
 ...[
 "Modelamiento estructural en ETABS/SAP2000: construcción del modelo 3D con las secciones predimensionadas, asignación de cargas permanentes, vivas y sísmicas.",
 "Análisis dinámico modal espectral conforme a NTE E.030-2018 §29: determinación de períodos modales, factores de participación de masa, fuerzas cortantes basales por dirección.",
 "Verificación de derivas de entrepiso: cumplimiento del límite Δ/h ≤ 0.007 para sistemas de concreto armado (NTE E.030-2018 §5.2).",
 "Diseño por flexo-compresión de columnas: construcción del diagrama de interacción P-M y verificación con las solicitaciones reales del análisis.",
 "Diseño detallado de elementos: vigas (flexión, cortante, torsión), losas (flexión bidireccional), placas (flexo-compresión, cortante).",
 "Diseño de cimentación en SAFE: análisis de interacción suelo-estructura, verificación de asentamientos diferenciales conforme a NTE E.050-2018.",
 "Elaboración de planos estructurales: detalles constructivos, cuadro de columnas, despiece de acero, especificaciones técnicas.",
 ].map((t,i)=>new Paragraph({
 children: [run(`${i+1}. `, {bold:true}), run(t)],
 spacing: {after:120}, indent: {left:480},
 })),
 h2("10.3 Limitaciones del predimensionamiento"),
 para([run("El predimensionamiento constituye una etapa estimativa que utiliza expresiones empíricas y simplificadas. Los valores calculados son aproximaciones válidas únicamente para establecer las dimensiones iniciales. Los valores definitivos serán determinados por el análisis estructural completo. ", {}),
 run("No es válido construir basándose únicamente en el predimensionamiento.", {bold:true})], {indent:true}),
 ];

 // SECCIÓN 11 · Diseño detallado (FASE 2, opcional)
 const sec11 = incluirFase2 ? [
 h1("11. Diseño Estructural Detallado (Fase 2)"),
 h2("11.1 Análisis modal aproximado"),
 para([run(`A partir del período fundamental T = ${r.T.toFixed(3)} s estimado por la fórmula empírica T = H/Ct (NTE E.030-2018 §28.4), se identifican los modos de vibración aproximados de la estructura. El análisis dinámico modal espectral definitivo debe efectuarse en software estructural (ETABS, SAP2000) conforme a NTE E.030-2018 §29.`)], {indent:true}),
 ...tituloTabla(13, "Modos de vibración aproximados"),
 mkTable(
 ["Modo","T (s)","f (Hz)","Masa participativa"],
 r.modos.map(m=>[m.modo, m.T.toFixed(3), m.f.toFixed(2), `${(m.masaPart*100).toFixed(1)}%`]),
 [20,25,25,30]
 ),
 nota("La suma de masas participativas debe ser ≥ 90 % (NTE E.030-2018 §29.1.2). Estos valores son aproximaciones para predimensionamiento."),

 h2("11.2 Verificación de derivas de entrepiso"),
 eq(`Δ_inel = 0.75 · R · Δ_elast (E.030 §5.1)`),
 eq(`drift = Δ_inel / h_piso ≤ 0.007 (concreto armado, E.030 §5.2)`),
 ...tituloTabla(14, "Drift por piso · Verificación de derivas"),
 mkTable(
 ["Piso","hi (m)","Δ_elast (cm)","Δ_inel (cm)","Drift (‰)","Estado"],
 r.derivas.slice().reverse().map(d=>[
 d.piso, d.hi.toFixed(2), d.Δ_elast.toFixed(3),
 d.Δ_inel.toFixed(2), (d.drift*1000).toFixed(2),
 d.drift<=r.drift_lim ? "Cumple" : "No cumple"
 ]),
 [10,18,22,22,18,10]
 ),

 h2("11.3 Diagrama de Interacción P-M"),
 para([run(`Para la columna unificada de ${r.b_unif}×${r.b_unif} cm con refuerzo `,{}),
 run(`${r.var_unif.n*4}${r.var_unif.nom}`,{bold:true}),
 run(` (ρ = ${(r.rho_esq*100).toFixed(2)}%), el diagrama de interacción nominal P-M tiene seis puntos característicos:`)],
 {indent:true}),
 ...tituloTabla(15, "Puntos del diagrama de interacción nominal P-M"),
 mkTable(
 ["Punto","Descripción","P (tf)","M (tf·m)"],
 r.diagPM.map((pt,i)=>[i+1, pt.etiqueta, pt.P.toFixed(1), pt.M.toFixed(2)]),
 [10,45,22,23]
 ),
 nota("Diagrama con factores de reducción φ aplicados. Para columnas perimetrales/esquineras debe verificarse flexo-compresión biaxial mediante el método de Bresler (NTE E.060 §10.13)."),

 h2("11.4 Cuadro de despiece · Columnas"),
 ...tituloTabla(16, "Cuadro de columnas para planos estructurales"),
 mkTable(
 ["ID","Sección","Longitudinal","Estribos Lo","Estribos central"],
 ["C-1 (Esquinera)","C-2 (Perim. X)","C-3 (Perim. Y)","C-4 (Central)"].map(id=>[
 id, `${r.b_unif}×${r.b_unif} cm`,
 `${r.var_unif.n*4}${r.var_unif.nom}`,
 `∅3/8" @ ${r.s_conf.toFixed(0)} mm`,
 `∅3/8" @ ${Math.min(r.b_unif*10*0.7, 200).toFixed(0)} mm`
 ]),
 [22,18,20,20,20]
 ),

 h2("11.5 Cuadro de despiece · Vigas"),
 ...tituloTabla(17, "Cuadro de vigas para planos estructurales"),
 mkTable(
 ["ID","Sección","Acero (-)","Acero (+)","Estribos conf.","L_conf"],
 [
 ["V-101 (Lx)", `${(r.b_vp*100).toFixed(0)}×${(r.h_vp*100).toFixed(0)} cm`,
 `${r.var_vp.n}${r.var_vp.nom}`, `${r.var_vp_pos.n}${r.var_vp_pos.nom}`,
 `∅3/8" @ ${(r.s_vp_sism*100).toFixed(0)} cm`, `${r.detalleEstribos.Lconf.toFixed(2)} m`],
 ["V-102 (Ly)", `${(r.b_vs*100).toFixed(0)}×${(r.h_vs*100).toFixed(0)} cm`,
 `${r.var_vs.n}${r.var_vs.nom}`, `${r.var_vs.n}${r.var_vs.nom}`,
 `∅3/8" @ ${(r.s_vp_sism*100).toFixed(0)} cm`, `${(2*r.h_vs).toFixed(2)} m`],
 ],
 [16,18,17,17,18,14]
 ),

 h2("11.6 Cuadro de despiece · Zapatas aisladas"),
 ...tituloTabla(18, "Cuadro de zapatas"),
 mkTable(
 ["ID","Dimensiones","Peralte hz","Refuerzo (c/dir.)","Recubrimiento"],
 [r.zap_C, r.zap_PX, r.zap_PY, r.zap_E].map((z,i)=>[
 `Z-${i+1} (${z.label})`,
 `${z.L.toFixed(2)} × ${z.L.toFixed(2)} m`,
 `${(z.hz*100).toFixed(0)} cm`,
 `${z.nvar}${z.var_z.nom} @ ${z.sep.toFixed(1)} cm`,
 "7.5 cm"
 ]),
 [22,22,18,22,16]
 ),

 h2("11.7 Recomendaciones técnicas para el diseño definitivo"),
 ...[
 "Modelar la estructura en software de análisis estructural (ETABS o SAP2000) con las secciones predimensionadas como punto de partida.",
 "Efectuar análisis dinámico modal espectral conforme a NTE E.030-2018 §29, garantizando que la suma de masas participativas sea ≥ 90 % por dirección.",
 "Verificar derivas máximas de entrepiso conforme al límite 0.007 para concreto armado (NTE E.030-2018 §5.2).",
 "Para columnas perimetrales y esquineras, verificar flexo-compresión biaxial mediante el método de Bresler (NTE E.060 §10.13).",
 "Ubicar empalmes de columnas en el tercio central de la altura, fuera de las zonas confinadas Lo.",
 "Cumplir requisitos especiales de NTE E.060 §21 para sistemas sismorresistentes especiales (estribos a 135°, separaciones máximas en zonas de confinamiento).",
 "Diseñar la cimentación en SAFE verificando asentamientos diferenciales y considerando vigas de conexión entre zapatas en zonas sísmicas altas (Z3, Z4).",
 "Mantener los recubrimientos mínimos según NTE E.060 §7.7: 7.5 cm en cimentaciones, 4 cm en columnas y vigas, 2 cm en losas.",
 "El presente predimensionamiento NO sustituye el análisis y diseño estructural definitivo. Los planos finales deben ser firmados por un ingeniero civil colegiado.",
 ].map((t,i)=>new Paragraph({
 children: [run(`${i+1}. `, {bold:true}), run(t)],
 spacing: {after:120}, indent: {left:480},
 })),
 ] : [];

 // REFERENCIAS APA
 const refs = [
 h1("Referencias"),
 ...[
 ["ACI Committee 318. (2019). ", "Building code requirements for structural concrete (ACI 318-19) and commentary on building code requirements for structural concrete (ACI 318R-19)", ". American Concrete Institute."],
 ["CIRSOC. (2005). ", "Reglamento CIRSOC 201: Reglamento argentino de estructuras de hormigón", ". Centro de Investigación de los Reglamentos Nacionales de Seguridad para las Obras Civiles."],
 ["SENCICO. (2006). ", "Norma técnica de edificación E.020-2006: Cargas", ". Sistema Nacional de Normalización, Capacitación e Investigación para la Industria de la Construcción."],
 ["SENCICO. (2018). ", "Norma técnica de edificación E.030-2018: Diseño sismorresistente", ". Sistema Nacional de Normalización, Capacitación e Investigación para la Industria de la Construcción."],
 ["SENCICO. (2018). ", "Norma técnica de edificación E.050-2018: Suelos y cimentaciones", ". Sistema Nacional de Normalización, Capacitación e Investigación para la Industria de la Construcción."],
 ["SENCICO. (2009). ", "Norma técnica de edificación E.060-2009: Concreto armado", ". Sistema Nacional de Normalización, Capacitación e Investigación para la Industria de la Construcción."],
 ].map(([a,b,c]) => new Paragraph({
 children: [run(a, {size:22}), run(b, {italic:true, size:22}), run(c, {size:22})],
 spacing: {after: 160}, indent: {left:720, hanging:720},
 })),
 ];

 // Documento final
 const doc = new Document({
 creator: "Predimensionamiento Estructural v5",
 title: `Memoria · ${p.proyecto}`,
 styles: {
 default: {
 document: {
 run: { font: "Times New Roman", size: 22, color: BLACK },
 paragraph: { spacing: { line: 280 }, alignment: AlignmentType.JUSTIFIED },
 },
 },
 },
 sections: [{
 properties: { page: { margin: {
 top: convertInchesToTwip(1.0), bottom: convertInchesToTwip(1.0),
 left: convertInchesToTwip(1.18), right: convertInchesToTwip(1.18),
 } } },
 headers: { default: new Header({ children: [new Paragraph({
 children: [
 run(p.proyecto.toUpperCase(), {size:18}),
 new TextRun({text:"\t", font:"Times New Roman"}),
 run("MEMORIA DE CÁLCULO ESTRUCTURAL", {size:18}),
 ],
 tabStops: [{type: TabStopType.RIGHT, position: 8700}],
 border: {bottom: {style: BorderStyle.SINGLE, size: 4, color: BLACK}},
 spacing: {after: 80},
 })] }) },
 footers: { default: new Footer({ children: [new Paragraph({
 children: [
 run(`NTE E.020 · E.030-2018 · E.050 · E.060 · ACI 318-19`, {size:18}),
 new TextRun({text:"\t", font:"Times New Roman"}),
 run("Página ", {size:18}),
 new TextRun({children:[PageNumber.CURRENT], font:"Times New Roman", size:18}),
 run(" de ", {size:18}),
 new TextRun({children:[PageNumber.TOTAL_PAGES], font:"Times New Roman", size:18}),
 ],
 tabStops: [{type: TabStopType.RIGHT, position: 8700}],
 border: {top: {style: BorderStyle.SINGLE, size: 4, color: BLACK}},
 spacing: {before: 80},
 })] }) },
 children: [
 ...portada,
 new Paragraph({children:[], pageBreakBefore:true}), ...sec1,
 new Paragraph({children:[], pageBreakBefore:true}), ...sec2,
 new Paragraph({children:[], pageBreakBefore:true}), ...sec3,
 new Paragraph({children:[], pageBreakBefore:true}), ...sec4,
 new Paragraph({children:[], pageBreakBefore:true}), ...sec5,
 new Paragraph({children:[], pageBreakBefore:true}), ...sec6,
 new Paragraph({children:[], pageBreakBefore:true}), ...sec7,
 new Paragraph({children:[], pageBreakBefore:true}), ...sec8,
 new Paragraph({children:[], pageBreakBefore:true}), ...sec9,
 new Paragraph({children:[], pageBreakBefore:true}), ...sec10,
 ...(incluirFase2 ? [new Paragraph({children:[], pageBreakBefore:true}), ...sec11] : []),
 new Paragraph({children:[], pageBreakBefore:true}), ...refs,
 ],
 }],
 });

 const blob = await Packer.toBlob(doc);
 saveAs(blob, `Memoria_${p.proyecto.replace(/\s+/g,"_")}_${new Date().getFullYear()}.docx`);
}
