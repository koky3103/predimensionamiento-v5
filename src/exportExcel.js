/**
 * exportExcel.js · Memoria de cálculo en Excel
 * v12 · Formato profesional con estilos (xlsx-js-style)
 *   · Headers de marca corporativa azul
 *   · Tablas con bordes, colores alternados, alineación
 *   · KPIs destacados, panel congelado, anchos óptimos
 *   · Fórmulas Excel computables (SUM, COUNTIF)
 *   · 7 hojas profesionales
 */
import * as XLSX from "xlsx-js-style";

const HEX = {
  primary: "1E3A5F", primaryLight: "5B7FA8", accent: "B85C00",
  green: "27AE60", red: "C0392B", yellow: "F39C12",
  bgHeader: "1E3A5F", bgSubHeader: "5B7FA8",
  bgAlt1: "F4F6F8", bgAlt2: "FFFFFF", bgKpi: "FFF8E7",
  border: "BDC3C7", text: "2C3E50", textLight: "5D6D7E",
};

const BORDER_THIN = {
  top:    { style: "thin", color: { rgb: HEX.border } },
  bottom: { style: "thin", color: { rgb: HEX.border } },
  left:   { style: "thin", color: { rgb: HEX.border } },
  right:  { style: "thin", color: { rgb: HEX.border } },
};

const styleTitle = {
  font: { name: "Calibri", sz: 18, bold: true, color: { rgb: "FFFFFF" } },
  fill: { fgColor: { rgb: HEX.primary } },
  alignment: { horizontal: "center", vertical: "center" },
  border: BORDER_THIN,
};
const styleSubtitle = {
  font: { name: "Calibri", sz: 12, italic: true, color: { rgb: "FFFFFF" } },
  fill: { fgColor: { rgb: HEX.primaryLight } },
  alignment: { horizontal: "center", vertical: "center" },
  border: BORDER_THIN,
};
const styleSection = {
  font: { name: "Calibri", sz: 13, bold: true, color: { rgb: "FFFFFF" } },
  fill: { fgColor: { rgb: HEX.primary } },
  alignment: { horizontal: "left", vertical: "center", indent: 1 },
  border: BORDER_THIN,
};
const styleHeader = {
  font: { name: "Calibri", sz: 11, bold: true, color: { rgb: "FFFFFF" } },
  fill: { fgColor: { rgb: HEX.bgHeader } },
  alignment: { horizontal: "center", vertical: "center", wrapText: true },
  border: BORDER_THIN,
};
const styleCell = (alt = false) => ({
  font: { name: "Calibri", sz: 10, color: { rgb: HEX.text } },
  fill: { fgColor: { rgb: alt ? HEX.bgAlt1 : HEX.bgAlt2 } },
  alignment: { vertical: "center", wrapText: true },
  border: BORDER_THIN,
});
const styleCellNum = (alt = false) => ({
  ...styleCell(alt),
  alignment: { horizontal: "right", vertical: "center" },
  numFmt: "#,##0.00",
});
const styleCellCenter = (alt = false) => ({
  ...styleCell(alt),
  alignment: { horizontal: "center", vertical: "center" },
});
const styleCellBold = (alt = false) => ({
  ...styleCell(alt),
  font: { name: "Calibri", sz: 10, bold: true, color: { rgb: HEX.primary } },
});
const styleOk = {
  font: { name: "Calibri", sz: 10, bold: true, color: { rgb: "FFFFFF" } },
  fill: { fgColor: { rgb: HEX.green } },
  alignment: { horizontal: "center", vertical: "center" },
  border: BORDER_THIN,
};
const styleFail = {
  font: { name: "Calibri", sz: 10, bold: true, color: { rgb: "FFFFFF" } },
  fill: { fgColor: { rgb: HEX.red } },
  alignment: { horizontal: "center", vertical: "center" },
  border: BORDER_THIN,
};
const styleKpi = {
  font: { name: "Calibri", sz: 13, bold: true, color: { rgb: HEX.primary } },
  fill: { fgColor: { rgb: HEX.bgKpi } },
  alignment: { horizontal: "center", vertical: "center", wrapText: true },
  border: {
    top:    { style: "medium", color: { rgb: HEX.accent } },
    bottom: { style: "medium", color: { rgb: HEX.accent } },
    left:   { style: "medium", color: { rgb: HEX.accent } },
    right:  { style: "medium", color: { rgb: HEX.accent } },
  },
};
const styleNorma = {
  font: { name: "Calibri", sz: 9, italic: true, color: { rgb: HEX.textLight } },
  alignment: { horizontal: "left", vertical: "center" },
  border: BORDER_THIN,
};

function setCell(ws, ref, value, style) {
  ws[ref] = { v: value, s: style };
  if (typeof value === "number") ws[ref].t = "n";
  else if (typeof value === "boolean") ws[ref].t = "b";
  else ws[ref].t = "s";
}
function setFormula(ws, ref, formula, style) {
  ws[ref] = { f: formula, s: style, t: "n" };
}
function mergeRange(ws, range) {
  if (!ws["!merges"]) ws["!merges"] = [];
  ws["!merges"].push(XLSX.utils.decode_range(range));
}
function setRange(ws, range) { ws["!ref"] = range; }
function setCols(ws, widths) { ws["!cols"] = widths.map(w => ({ wch: w })); }
function rowMerge(ws, row, ncols, style) {
  for (let c = 0; c < ncols; c++) {
    setCell(ws, `${XLSX.utils.encode_col(c)}${row}`, "", style);
  }
  mergeRange(ws, `A${row}:${XLSX.utils.encode_col(ncols-1)}${row}`);
}

export function exportarExcel(p, r) {
  const wb = XLSX.utils.book_new();
  const fecha = new Date().toLocaleDateString("es-PE", {day:"2-digit", month:"long", year:"numeric"});
  const proyecto = p.proyecto || "Proyecto";

  // HOJA 1 · DATOS
  {
    const ws = {};
    let row = 1;
    setCell(ws, `A${row}`, "MEMORIA DE CÁLCULO ESTRUCTURAL · PREDIMENSIONAMIENTO", styleTitle);
    rowMerge(ws, row, 3, styleTitle); row++;
    setCell(ws, `A${row}`, `${proyecto} · ${p.ubicacion || ""}`, styleSubtitle);
    rowMerge(ws, row, 3, styleSubtitle); row += 2;

    setCell(ws, `A${row}`, "1. INFORMACIÓN GENERAL", styleSection);
    rowMerge(ws, row, 3, styleSection); row++;
    [
      ["Proyecto", proyecto, ""],
      ["Descripción", p.descripcion || "", ""],
      ["Ubicación", p.ubicacion || "", ""],
      ["Fecha de emisión", fecha, ""],
    ].forEach(([a, b, c], i) => {
      const alt = i % 2 === 0;
      setCell(ws, `A${row}`, a, styleCellBold(alt));
      setCell(ws, `B${row}`, b, styleCell(alt));
      setCell(ws, `C${row}`, c, styleCell(alt));
      row++;
    });
    row++;

    setCell(ws, `A${row}`, "2. GEOMETRÍA", styleSection);
    rowMerge(ws, row, 3, styleSection); row++;
    ["Parámetro", "Valor", "Unidad"].forEach((h, i) =>
      setCell(ws, `${XLSX.utils.encode_col(i)}${row}`, h, styleHeader));
    row++;
    [
      ["Lx total", r.Lx_total, "m"],
      ["Ly total", r.Ly_total, "m"],
      ["N° de pisos", p.N, "pisos"],
      ["Altura total H", r.H_total, "m"],
      ["Altura promedio entrepiso", r.hpiso_promedio, "m"],
      ["N° de ejes en X", r.nEjesX, ""],
      ["N° de ejes en Y", r.nEjesY, ""],
      ["N° de columnas", r.nColTotal, ""],
      ["Área en planta", r.area_planta, "m²"],
    ].forEach(([a, b, c], i) => {
      const alt = i % 2 === 0;
      setCell(ws, `A${row}`, a, styleCellBold(alt));
      setCell(ws, `B${row}`, b, typeof b === "number" ? styleCellNum(alt) : styleCell(alt));
      setCell(ws, `C${row}`, c, styleCellCenter(alt));
      row++;
    });
    row++;

    setCell(ws, `A${row}`, "3. MATERIALES", styleSection);
    rowMerge(ws, row, 3, styleSection); row++;
    ["Concepto", "Valor", "Unidad"].forEach((h, i) =>
      setCell(ws, `${XLSX.utils.encode_col(i)}${row}`, h, styleHeader));
    row++;
    [
      ["f'c (concreto)", p.fc, "kgf/cm²"],
      ["fy (acero Grado 60)", p.fy, "kgf/cm²"],
      ["Módulo Ec = 15100·√f'c", r.Ec, "kgf/cm²"],
      ["Peso específico γc", 2.4, "tf/m³"],
    ].forEach(([a, b, c], i) => {
      const alt = i % 2 === 0;
      setCell(ws, `A${row}`, a, styleCellBold(alt));
      setCell(ws, `B${row}`, b, styleCellNum(alt));
      setCell(ws, `C${row}`, c, styleCellCenter(alt));
      row++;
    });
    row++;

    setCell(ws, `A${row}`, "4. PARÁMETROS SÍSMICOS · NTE E.030-2018", styleSection);
    rowMerge(ws, row, 3, styleSection); row++;
    ["Parámetro", "Valor", "Referencia"].forEach((h, i) =>
      setCell(ws, `${XLSX.utils.encode_col(i)}${row}`, h, styleHeader));
    row++;
    [
      ["Z (factor de zona)", r.Z, `Zona ${r.zona.id}`],
      ["U (factor de uso)", r.U, `Cat. ${r.categoria.id}`],
      ["S (factor de suelo)", r.S, `Tipo ${r.suelo.id}`],
      ["R (reducción)", r.R, r.sistema.desc],
      ["Tp", r.Tp, "s"],
      ["TL", r.Tl, "s"],
      ["T fundamental", r.T, "s"],
      ["C amplificación", r.C_sis, ""],
      ["ZUCS/R efectivo", r.ZUCS_R_efectivo, ""],
    ].forEach(([a, b, c], i) => {
      const alt = i % 2 === 0;
      setCell(ws, `A${row}`, a, styleCellBold(alt));
      setCell(ws, `B${row}`, b, styleCellNum(alt));
      setCell(ws, `C${row}`, c, styleNorma);
      row++;
    });

    setRange(ws, `A1:C${row}`);
    setCols(ws, [42, 22, 22]);
    ws["!freeze"] = { xSplit: 0, ySplit: 3 };
    XLSX.utils.book_append_sheet(wb, ws, "Datos");
  }

  // HOJA 2 · METRADO
  {
    const ws = {};
    let row = 1;
    setCell(ws, `A${row}`, "METRADO DE CARGAS · NTE E.020-2006", styleTitle);
    rowMerge(ws, row, 4, styleTitle); row++;
    setCell(ws, `A${row}`, `Uso: ${r.metrado.uso.desc}`, styleSubtitle);
    rowMerge(ws, row, 4, styleSubtitle); row += 2;

    setCell(ws, `A${row}`, "1. CARGA VIVA (CV) · Tabla 1 de E.020", styleSection);
    rowMerge(ws, row, 4, styleSection); row++;
    ["Concepto", "Valor", "Unidad", "Referencia"].forEach((h, i) =>
      setCell(ws, `${XLSX.utils.encode_col(i)}${row}`, h, styleHeader));
    row++;
    [
      ["Uso de la edificación", r.metrado.uso.desc, "", "E.020 Tab. 1"],
      ["CV uso principal", r.metrado.cv_principal * 1000, "kgf/m²", "E.020"],
      ["CV uso principal", r.metrado.cv_principal, "tf/m²", ""],
      ["CV corredores/escaleras", r.metrado.cv_corredor * 1000, "kgf/m²", "E.020"],
    ].forEach((row0, i) => {
      const alt = i % 2 === 0;
      setCell(ws, `A${row}`, row0[0], styleCellBold(alt));
      setCell(ws, `B${row}`, row0[1], typeof row0[1]==="number" ? styleCellNum(alt) : styleCell(alt));
      setCell(ws, `C${row}`, row0[2], styleCellCenter(alt));
      setCell(ws, `D${row}`, row0[3], styleNorma);
      row++;
    });
    row++;

    setCell(ws, `A${row}`, "2. CARGA MUERTA (CM)", styleSection);
    rowMerge(ws, row, 4, styleSection); row++;
    ["Elemento", "Peso (kgf/m²)", "Activa", "Aporte (tf/m²)"].forEach((h, i) =>
      setCell(ws, `${XLSX.utils.encode_col(i)}${row}`, h, styleHeader));
    row++;
    const cmItems = p.cargasMuertas || [];
    const filaInicioCM = row;
    cmItems.forEach((item, i) => {
      const alt = i % 2 === 0;
      setCell(ws, `A${row}`, item.id, styleCell(alt));
      setCell(ws, `B${row}`, item.peso, styleCellNum(alt));
      setCell(ws, `C${row}`, item.activa ? "Sí" : "No",
        item.activa ? styleOk : styleCellCenter(alt));
      setCell(ws, `D${row}`, item.activa ? item.peso/1000 : 0, styleCellNum(alt));
      row++;
    });
    const filaFinCM = row - 1;
    setCell(ws, `A${row}`, "SUMA acabados", styleCellBold(false));
    setCell(ws, `B${row}`, "", styleCell(false));
    setCell(ws, `C${row}`, "", styleCell(false));
    setFormula(ws, `D${row}`, `SUM(D${filaInicioCM}:D${filaFinCM})`, {
      ...styleCellNum(false),
      font: { name:"Calibri", sz:11, bold:true, color:{ rgb: HEX.primary }},
      fill: { fgColor: { rgb: HEX.bgKpi }},
    });
    row += 2;

    setCell(ws, `A${row}`, "3. RESUMEN POR PLANTA", styleSection);
    rowMerge(ws, row, 4, styleSection); row++;
    [
      ["CM acabados (activos)", r.metrado.cm_acabados, "tf/m²"],
      ["+ Peso propio losa", r.metrado.cm_losa, "tf/m²"],
      ["= CM total", r.metrado.cm_total, "tf/m²"],
      ["Área en planta", r.area_planta, "m²"],
      ["CM por planta", r.metrado.CM_por_planta_tf, "tf"],
      ["CV por planta", r.metrado.CV_por_planta_tf, "tf"],
      ["Σ CM total edificio", r.metrado.Peso_total_CM, "tf"],
      ["Σ CV total edificio", r.metrado.Peso_total_CV, "tf"],
    ].forEach((r0, i) => {
      const alt = i % 2 === 0;
      const destacar = r0[0].startsWith("=") || r0[0].startsWith("Σ");
      setCell(ws, `A${row}`, r0[0], destacar ? styleCellBold(alt) : styleCell(alt));
      setCell(ws, `B${row}`, r0[1], destacar ?
        {...styleCellNum(alt), font:{name:"Calibri", sz:11, bold:true, color:{rgb:HEX.primary}}} : styleCellNum(alt));
      setCell(ws, `C${row}`, r0[2], styleCellCenter(alt));
      setCell(ws, `D${row}`, "", styleCell(alt));
      row++;
    });
    row++;

    setCell(ws, `A${row}`, "4. COMBINACIONES · E.060 §9.2", styleSection);
    rowMerge(ws, row, 4, styleSection); row++;
    ["Combinación", "Expresión", "Resultado", "Unidad"].forEach((h, i) =>
      setCell(ws, `${XLSX.utils.encode_col(i)}${row}`, h, styleHeader));
    row++;
    [
      ["U1 gravitacional", "1.4·CM + 1.7·CV", r.Wu_U1, "tf/m²"],
      ["U2 sismo (suma)", "1.25·(CM+CV) + CS", `${r.Wu_U2_grav.toFixed(3)} + CS`, "tf/m²"],
      ["U3 sismo (mín)", "0.9·CM + CS", `${(0.9*r.CM_estimada).toFixed(3)} + CS`, "tf/m²"],
    ].forEach((r0, i) => {
      const alt = i % 2 === 0;
      setCell(ws, `A${row}`, r0[0], styleCellBold(alt));
      setCell(ws, `B${row}`, r0[1], {...styleCellCenter(alt), font:{name:"Consolas", sz:10, color:{rgb:HEX.text}}});
      const v2 = r0[2];
      if (typeof v2 === "number") {
        setCell(ws, `C${row}`, v2, {...styleCellNum(alt), font:{name:"Calibri", sz:11, bold:true, color:{rgb:HEX.primary}}});
      } else {
        setCell(ws, `C${row}`, v2, {...styleCellCenter(alt), font:{name:"Calibri", sz:10, bold:true, color:{rgb:HEX.primary}}});
      }
      setCell(ws, `D${row}`, r0[3], styleCellCenter(alt));
      row++;
    });

    setRange(ws, `A1:D${row}`);
    setCols(ws, [38, 22, 18, 22]);
    ws["!freeze"] = { xSplit: 0, ySplit: 3 };
    XLSX.utils.book_append_sheet(wb, ws, "Metrado E020");
  }

  // HOJA 3 · SISMICO
  {
    const ws = {};
    let row = 1;
    setCell(ws, `A${row}`, "ANÁLISIS SÍSMICO ESTÁTICO · NTE E.030-2018", styleTitle);
    rowMerge(ws, row, 7, styleTitle); row++;
    setCell(ws, `A${row}`, "Distribución vertical de fuerzas · Art. 28.6", styleSubtitle);
    rowMerge(ws, row, 7, styleSubtitle); row += 2;

    setCell(ws, `A${row}`, "KPIs PRINCIPALES", styleSection);
    rowMerge(ws, row, 7, styleSection); row++;
    const kpis = [
      `T = ${r.T.toFixed(3)} s`, `C = ${r.C_sis.toFixed(2)}`,
      `ZUCS/R = ${r.ZUCS_R_efectivo.toFixed(4)}`,
      `Ws = ${r.Ws.toFixed(0)} tf`, `V = ${r.V_basal.toFixed(1)} tf`,
      `M volteo = ${r.M_volteo.toFixed(0)}`, `k = ${r.k_dist.toFixed(2)}`,
    ];
    kpis.forEach((k, i) => setCell(ws, `${XLSX.utils.encode_col(i)}${row}`, k, styleKpi));
    if (!ws["!rows"]) ws["!rows"] = [];
    ws["!rows"][row-1] = { hpt: 32 };
    row += 2;

    setCell(ws, `A${row}`, "DISTRIBUCIÓN VERTICAL", styleSection);
    rowMerge(ws, row, 7, styleSection); row++;
    ["Piso", "hi (m)", "h entrep. (m)", "Pi (tf)", "Pi·hi^k", "Fi (tf)", "Vi (tf)"].forEach((h, i) =>
      setCell(ws, `${XLSX.utils.encode_col(i)}${row}`, h, styleHeader));
    row++;
    const filaInicioDist = row;
    r.distribucion.slice().reverse().forEach((d, i) => {
      const alt = i % 2 === 0;
      const vc = r.cortantes_piso.find(v => v.piso === d.piso);
      setCell(ws, `A${row}`, d.piso, styleCellBold(alt));
      setCell(ws, `B${row}`, d.hi, styleCellNum(alt));
      setCell(ws, `C${row}`, d.hentre || p.hpiso, styleCellNum(alt));
      setCell(ws, `D${row}`, d.Pi, styleCellNum(alt));
      setCell(ws, `E${row}`, d.Phk, styleCellNum(alt));
      setCell(ws, `F${row}`, d.Fi, {...styleCellNum(alt), font:{name:"Calibri", sz:10, bold:true, color:{rgb:HEX.accent}}});
      setCell(ws, `G${row}`, vc ? vc.Vi : 0, {...styleCellNum(alt), font:{name:"Calibri", sz:10, bold:true, color:{rgb:HEX.green}}});
      row++;
    });
    const filaFinDist = row - 1;
    setCell(ws, `A${row}`, "TOTAL", styleCellBold(false));
    setCell(ws, `B${row}`, "", styleCell(false));
    setCell(ws, `C${row}`, "", styleCell(false));
    setFormula(ws, `D${row}`, `SUM(D${filaInicioDist}:D${filaFinDist})`,
      {...styleCellNum(false), font:{name:"Calibri", sz:11, bold:true, color:{rgb:HEX.primary}}, fill:{fgColor:{rgb:HEX.bgKpi}}});
    setFormula(ws, `E${row}`, `SUM(E${filaInicioDist}:E${filaFinDist})`,
      {...styleCellNum(false), font:{name:"Calibri", sz:11, bold:true, color:{rgb:HEX.primary}}, fill:{fgColor:{rgb:HEX.bgKpi}}});
    setFormula(ws, `F${row}`, `SUM(F${filaInicioDist}:F${filaFinDist})`,
      {...styleCellNum(false), font:{name:"Calibri", sz:11, bold:true, color:{rgb:HEX.accent}}, fill:{fgColor:{rgb:HEX.bgKpi}}});

    setRange(ws, `A1:G${row+1}`);
    setCols(ws, [12, 14, 16, 14, 16, 14, 14]);
    ws["!freeze"] = { xSplit: 0, ySplit: 3 };
    XLSX.utils.book_append_sheet(wb, ws, "Sismico");
  }

  // HOJA 4 · ÁREAS TRIBUTARIAS
  {
    const ws = {};
    let row = 1;
    setCell(ws, `A${row}`, "ÁREAS TRIBUTARIAS POR COLUMNA", styleTitle);
    rowMerge(ws, row, 8, styleTitle); row++;
    setCell(ws, `A${row}`, "Cálculo según ejes adyacentes · ACI 318-19 §22", styleSubtitle);
    rowMerge(ws, row, 8, styleSubtitle); row += 2;

    ["ID", "Tipo", "Eje X", "Eje Y", "X (m)", "Y (m)", "At (m²)", "Pu acum. (tf)"].forEach((h, i) =>
      setCell(ws, `${XLSX.utils.encode_col(i)}${row}`, h, styleHeader));
    row++;
    const tipos = { C:"Central", PX:"Perim. X", PY:"Perim. Y", E:"Esquinera" };
    const tipoColor = { C: HEX.primary, PX: HEX.accent, PY: HEX.accent, E: HEX.red };
    const filaInicioAT = row;
    r.columnasEnPlanta.forEach((c, i) => {
      const alt = i % 2 === 0;
      setCell(ws, `A${row}`, c.id,
        { ...styleCellBold(alt), font:{name:"Calibri", sz:10, bold:true, color:{rgb:tipoColor[c.tipo]}}});
      setCell(ws, `B${row}`, tipos[c.tipo], styleCell(alt));
      setCell(ws, `C${row}`, c.ejeX, styleCellCenter(alt));
      setCell(ws, `D${row}`, c.ejeY, styleCellCenter(alt));
      setCell(ws, `E${row}`, c.x, styleCellNum(alt));
      setCell(ws, `F${row}`, c.y, styleCellNum(alt));
      setCell(ws, `G${row}`, c.at_real, styleCellNum(alt));
      setCell(ws, `H${row}`, c.Pu_real,
        {...styleCellNum(alt), font:{name:"Calibri", sz:10, bold:true, color:{rgb:HEX.primary}}});
      row++;
    });
    const filaFinAT = row - 1;
    setCell(ws, `A${row}`, "TOTAL", styleCellBold(false));
    for (let c = 1; c < 6; c++) setCell(ws, `${XLSX.utils.encode_col(c)}${row}`, "", styleCellBold(false));
    setFormula(ws, `G${row}`, `SUM(G${filaInicioAT}:G${filaFinAT})`,
      {...styleCellNum(false), font:{name:"Calibri", sz:11, bold:true, color:{rgb:HEX.green}}, fill:{fgColor:{rgb:HEX.bgKpi}}});
    setFormula(ws, `H${row}`, `SUM(H${filaInicioAT}:H${filaFinAT})`,
      {...styleCellNum(false), font:{name:"Calibri", sz:11, bold:true, color:{rgb:HEX.primary}}, fill:{fgColor:{rgb:HEX.bgKpi}}});

    setRange(ws, `A1:H${row+1}`);
    setCols(ws, [14, 14, 10, 10, 12, 12, 14, 18]);
    ws["!freeze"] = { xSplit: 0, ySplit: 4 };
    XLSX.utils.book_append_sheet(wb, ws, "Areas tributarias");
  }

  // HOJA 5 · PREDIMENSIONAMIENTO
  {
    const ws = {};
    let row = 1;
    setCell(ws, `A${row}`, "RESULTADOS DEL PREDIMENSIONAMIENTO", styleTitle);
    rowMerge(ws, row, 5, styleTitle); row++;
    setCell(ws, `A${row}`, "Dimensiones y refuerzo preliminar", styleSubtitle);
    rowMerge(ws, row, 5, styleSubtitle); row += 2;

    const bloques = [
      {titulo: "LOSAS", rows: [
        ["Losa aligerada", "Peralte h", r.h_al, "m", "Lx/25 · ACI"],
        ["Losa aligerada", "Peso propio", r.PP_al, "tf/m²", "E.020 Tab.4"],
        ["Losa aligerada", "Wu", r.Wu_al, "tf/m²", "1.4D+1.7L"],
        ["Losa aligerada", "Vu por vigueta", r.Vu_al, "tf", "ACI §22.5"],
        ["Losa aligerada", "φVc por vigueta", r.phiVc_al, "tf", "ACI §22.5"],
        ["Losa aligerada", "Acero adoptado", `${r.var_al.n}${r.var_al.nom}`, "", ""],
        ["Losa maciza", "Peralte h", r.h_mac, "m", "Lx/33"],
      ]},
      {titulo: "VIGAS", rows: [
        ["Viga principal", "Sección b·h", `${(r.b_vp*100).toFixed(0)}·${(r.h_vp*100).toFixed(0)}`, "cm", "h ≈ L/12"],
        ["Viga principal", "Mu (-) ext = wL²/9", r.Mu_vp_neg_ext, "tf·m", "ACI §6.5.2"],
        ["Viga principal", "Mu (+) ext = wL²/14", r.Mu_vp_pos_ext, "tf·m", "ACI §6.5.2"],
        ["Viga principal", "Vu = 1.15·wL/2", r.Vu_vp, "tf", "ACI §6.5.4"],
        ["Viga principal", "φVc", r.phiVc_vp, "tf", "ACI §22.5"],
        ["Viga principal", "Acero (-) adoptado", `${r.var_vp.n}${r.var_vp.nom}`, "", ""],
        ["Viga principal", "Acero (+) adoptado", `${r.var_vp_pos.n}${r.var_vp_pos.nom}`, "", ""],
        ["Viga secundaria", "Sección b·h", `${(r.b_vs*100).toFixed(0)}·${(r.h_vs*100).toFixed(0)}`, "cm", ""],
        ["Viga secundaria", "Mu", r.Mu_vs, "tf·m", ""],
      ]},
      {titulo: "COLUMNAS", rows: [
        ["Sección unificada", "b · b", `${r.b_unif}·${r.b_unif}`, "cm", ""],
        ["Sección unificada", "Cuantía ρ", r.rho_esq*100, "%", "≥ 1.0%"],
        ["Sección unificada", "Acero longitudinal", `${r.var_unif.n*4}${r.var_unif.nom}`, "", ""],
        ["Sección unificada", "Esbeltez λ", r.esb, "", "≤ 12"],
        ["Col. Central", "Pu envolvente", r.col_C.Pu, "tf", ""],
        ["Col. Central", "φPn", r.col_C.phi_Pn, "tf", ""],
        ["Col. Perim. X", "Pu envolvente", r.col_PX.Pu, "tf", ""],
        ["Col. Perim. Y", "Pu envolvente", r.col_PY.Pu, "tf", ""],
        ["Col. Esquinera", "Pu envolvente", r.col_E.Pu, "tf", ""],
      ]},
      {titulo: "PLACAS Y MUROS DE CORTE", rows: [
        ["Muro de corte", "tw espesor", r.tw, "m", "≥ hpiso/16"],
        ["Muro de corte", "lw longitud", p.Lw_placa, "m", ""],
        ["Muro de corte", "V por placa", r.V_placa, "tf", "20% del V_basal"],
        ["Muro de corte", "φVn", r.phiVn, "tf", ""],
      ]},
    ];

    bloques.forEach(b => {
      setCell(ws, `A${row}`, b.titulo, styleSection);
      rowMerge(ws, row, 5, styleSection); row++;
      ["Elemento", "Parámetro", "Valor", "Unidad", "Referencia"].forEach((h, i) =>
        setCell(ws, `${XLSX.utils.encode_col(i)}${row}`, h, styleHeader));
      row++;
      b.rows.forEach((r0, i) => {
        const alt = i % 2 === 0;
        setCell(ws, `A${row}`, r0[0], styleCellBold(alt));
        setCell(ws, `B${row}`, r0[1], styleCell(alt));
        setCell(ws, `C${row}`, r0[2], typeof r0[2]==="number" ? styleCellNum(alt) : styleCellCenter(alt));
        setCell(ws, `D${row}`, r0[3], styleCellCenter(alt));
        setCell(ws, `E${row}`, r0[4], styleNorma);
        row++;
      });
      row++;
    });

    setCell(ws, `A${row}`, "ZAPATAS", styleSection);
    rowMerge(ws, row, 5, styleSection); row++;
    ["Tipo", "L (m)", "hz (m)", "Pu (tf)", "Refuerzo"].forEach((h, i) =>
      setCell(ws, `${XLSX.utils.encode_col(i)}${row}`, h, styleHeader));
    row++;
    [r.zap_C, r.zap_PX, r.zap_PY, r.zap_E].forEach((z, i) => {
      const alt = i % 2 === 0;
      setCell(ws, `A${row}`, z.label, styleCellBold(alt));
      setCell(ws, `B${row}`, z.L, styleCellNum(alt));
      setCell(ws, `C${row}`, z.hz, styleCellNum(alt));
      setCell(ws, `D${row}`, z.Pu, styleCellNum(alt));
      setCell(ws, `E${row}`, `${z.nvar}${z.var_z.nom} @ ${z.sep.toFixed(1)} cm`, styleCell(alt));
      row++;
    });

    setRange(ws, `A1:E${row+1}`);
    setCols(ws, [24, 30, 18, 14, 24]);
    ws["!freeze"] = { xSplit: 0, ySplit: 3 };
    XLSX.utils.book_append_sheet(wb, ws, "Predimensionamiento");
  }

  // HOJA 6 · VERIFICACIONES
  {
    const verifs = [
      { label: "Losa aligerada · cortante", ok: r.losa_ok,
        valor: `Vu=${r.Vu_al.toFixed(2)} / φVc=${r.phiVc_al.toFixed(2)}`, norma: "ACI 318-19 §22.5" },
      { label: "Losa aligerada · deflexión", ok: r.defl_al_ok,
        valor: `Δ=${r.delta_al.toFixed(2)} / Δlim=${r.delta_lim_al.toFixed(2)} cm`, norma: "ACI 318-19 §24.2" },
      { label: "Viga · cortante", ok: r.cort_vp_ok,
        valor: `Vu=${r.Vu_vp.toFixed(2)} / φVc=${r.phiVc_vp.toFixed(2)}`, norma: "E.060 §11" },
      { label: "Viga · flexión", ok: r.flex_vp_ok,
        valor: `As=${r.As_vp_req.toFixed(2)} / prov=${r.var_vp.As_tot.toFixed(2)}`, norma: "E.060 §10" },
      { label: "Columna · cuantía", ok: r.rho_esq >= 0.01,
        valor: `${(r.rho_esq*100).toFixed(2)}%`, norma: "E.060 §10.9" },
      { label: "Columna · esbeltez", ok: r.esb_ok,
        valor: `λ=${r.esb.toFixed(2)}`, norma: "E.060 §10.10" },
      { label: "Col. Central", ok: r.col_C.ok,
        valor: `Pu=${r.col_C.Pu.toFixed(1)} / φPn=${r.col_C.phi_Pn.toFixed(1)}`, norma: "" },
      { label: "Col. Esquinera", ok: r.col_E.ok,
        valor: `Pu=${r.col_E.Pu.toFixed(1)} / φPn=${r.col_E.phi_Pn.toFixed(1)}`, norma: "" },
      { label: "Placa · cortante", ok: r.placa_ok,
        valor: `V=${r.V_placa.toFixed(1)} / φVn=${r.phiVn.toFixed(1)}`, norma: "E.060 §21.9" },
      { label: "Deriva máxima", ok: r.deriva_ok,
        valor: `drift=${(r.drift_max*1000).toFixed(2)}‰`, norma: "E.030 §5.2" },
      { label: "Escalera · Blondel", ok: r.blon_ok,
        valor: `${(r.blond*100).toFixed(1)} cm`, norma: "RNE" },
      { label: "Zap. Central · punz", ok: r.zap_C.punz_ok,
        valor: `Vu=${r.zap_C.Vu_punz.toFixed(1)} / φVc=${r.zap_C.phiVc_punz.toFixed(1)}`, norma: "ACI §13.2.6" },
      { label: "Zap. Central · uni", ok: r.zap_C.uni_ok,
        valor: `Vu=${r.zap_C.Vu_uni.toFixed(1)} / φVc=${r.zap_C.phiVc_uni.toFixed(1)}`, norma: "ACI §13.2.7" },
      { label: "Zap. Esquinera · punz", ok: r.zap_E.punz_ok,
        valor: `Vu=${r.zap_E.Vu_punz.toFixed(1)} / φVc=${r.zap_E.phiVc_punz.toFixed(1)}`, norma: "" },
      { label: "Zap. Esquinera · uni", ok: r.zap_E.uni_ok,
        valor: `Vu=${r.zap_E.Vu_uni.toFixed(1)} / φVc=${r.zap_E.phiVc_uni.toFixed(1)}`, norma: "" },
    ];

    const ws = {};
    let row = 1;
    setCell(ws, `A${row}`, "VERIFICACIONES NORMATIVAS", styleTitle);
    rowMerge(ws, row, 5, styleTitle); row++;
    setCell(ws, `A${row}`, "NTE E.020, E.030-2018, E.060-2009 y ACI 318-19", styleSubtitle);
    rowMerge(ws, row, 5, styleSubtitle); row += 2;

    ["#", "Verificación", "Valor", "Estado", "Norma"].forEach((h, i) =>
      setCell(ws, `${XLSX.utils.encode_col(i)}${row}`, h, styleHeader));
    row++;
    const filaInicioV = row;
    verifs.forEach((v, i) => {
      const alt = i % 2 === 0;
      setCell(ws, `A${row}`, i+1, styleCellCenter(alt));
      setCell(ws, `B${row}`, v.label, styleCell(alt));
      setCell(ws, `C${row}`, v.valor, styleCell(alt));
      setCell(ws, `D${row}`, v.ok ? "CUMPLE" : "REVISAR", v.ok ? styleOk : styleFail);
      setCell(ws, `E${row}`, v.norma, styleNorma);
      row++;
    });
    const filaFinV = row - 1;

    row++;
    setCell(ws, `A${row}`, "RESUMEN", styleSection);
    rowMerge(ws, row, 5, styleSection); row++;
    setCell(ws, `A${row}`, "Total", styleCellBold(false));
    setCell(ws, `B${row}`, verifs.length, styleCellNum(false));
    row++;
    setCell(ws, `A${row}`, "Cumplen", styleCellBold(true));
    setFormula(ws, `B${row}`, `COUNTIF(D${filaInicioV}:D${filaFinV},"CUMPLE")`,
      {...styleCellNum(true), font:{name:"Calibri", sz:11, bold:true, color:{rgb:HEX.green}}});
    row++;
    setCell(ws, `A${row}`, "A revisar", styleCellBold(false));
    setFormula(ws, `B${row}`, `COUNTIF(D${filaInicioV}:D${filaFinV},"REVISAR")`,
      {...styleCellNum(false), font:{name:"Calibri", sz:11, bold:true, color:{rgb:HEX.red}}});
    row++;
    setCell(ws, `A${row}`, "% Cumplimiento", styleCellBold(true));
    setFormula(ws, `B${row}`, `COUNTIF(D${filaInicioV}:D${filaFinV},"CUMPLE")/${verifs.length}*100`,
      {...styleCellNum(true), font:{name:"Calibri", sz:12, bold:true, color:{rgb:HEX.primary}}, fill:{fgColor:{rgb:HEX.bgKpi}}, numFmt:"0.0\"%\""});

    setRange(ws, `A1:E${row+1}`);
    setCols(ws, [6, 40, 36, 14, 22]);
    ws["!freeze"] = { xSplit: 0, ySplit: 4 };
    XLSX.utils.book_append_sheet(wb, ws, "Verificaciones");
  }

  // HOJA 7 · DESPIECE
  {
    const ws = {};
    let row = 1;
    setCell(ws, `A${row}`, "CUADROS DE DESPIECE PARA PLANOS", styleTitle);
    rowMerge(ws, row, 6, styleTitle); row++;
    setCell(ws, `A${row}`, "Información para planos estructurales", styleSubtitle);
    rowMerge(ws, row, 6, styleSubtitle); row += 2;

    setCell(ws, `A${row}`, "COLUMNAS · DESPIECE", styleSection);
    rowMerge(ws, row, 6, styleSection); row++;
    ["ID", "Sección (cm)", "Acero long.", "Estribos Lo", "Estribos central", "L empalme"].forEach((h, i) =>
      setCell(ws, `${XLSX.utils.encode_col(i)}${row}`, h, styleHeader));
    row++;
    ["C-1 (Esquinera)", "C-2 (Perim. X)", "C-3 (Perim. Y)", "C-4 (Central)"].forEach((id, i) => {
      const alt = i % 2 === 0;
      setCell(ws, `A${row}`, id, styleCellBold(alt));
      setCell(ws, `B${row}`, `${r.b_unif} · ${r.b_unif}`, styleCellCenter(alt));
      setCell(ws, `C${row}`, `${r.var_unif.n*4}${r.var_unif.nom}`, styleCellCenter(alt));
      setCell(ws, `D${row}`, `∅3/8" @ ${r.s_conf.toFixed(0)} mm`, styleCellCenter(alt));
      setCell(ws, `E${row}`, `∅3/8" @ ${Math.min(r.b_unif*10*0.7, 200).toFixed(0)} mm`, styleCellCenter(alt));
      setCell(ws, `F${row}`, `${r.detalleColumna.longitud_empalme.toFixed(0)} cm`, styleCellCenter(alt));
      row++;
    });
    row++;

    setCell(ws, `A${row}`, "VIGAS · DESPIECE", styleSection);
    rowMerge(ws, row, 6, styleSection); row++;
    ["ID", "Sección (cm)", "Acero (-)", "Acero (+)", "Estribos conf.", "L conf"].forEach((h, i) =>
      setCell(ws, `${XLSX.utils.encode_col(i)}${row}`, h, styleHeader));
    row++;
    [
      ["V-101 (Lx)", `${(r.b_vp*100).toFixed(0)} · ${(r.h_vp*100).toFixed(0)}`,
       `${r.var_vp.n}${r.var_vp.nom}`, `${r.var_vp_pos.n}${r.var_vp_pos.nom}`,
       `∅3/8" @ ${(r.s_vp_sism*100).toFixed(0)} cm`, `${r.detalleEstribos.Lconf.toFixed(2)} m`],
      ["V-102 (Ly)", `${(r.b_vs*100).toFixed(0)} · ${(r.h_vs*100).toFixed(0)}`,
       `${r.var_vs.n}${r.var_vs.nom}`, `${r.var_vs.n}${r.var_vs.nom}`,
       `∅3/8" @ ${(r.s_vp_sism*100).toFixed(0)} cm`, `${(2*r.h_vs).toFixed(2)} m`],
    ].forEach((r0, i) => {
      const alt = i % 2 === 0;
      setCell(ws, `A${row}`, r0[0], styleCellBold(alt));
      r0.slice(1).forEach((v, ci) => setCell(ws, `${XLSX.utils.encode_col(ci+1)}${row}`, v, styleCellCenter(alt)));
      row++;
    });
    row++;

    setCell(ws, `A${row}`, "ZAPATAS · DESPIECE", styleSection);
    rowMerge(ws, row, 6, styleSection); row++;
    ["ID", "L (m)", "B (m)", "hz (cm)", "Refuerzo (c/dir.)", "Recubrimiento"].forEach((h, i) =>
      setCell(ws, `${XLSX.utils.encode_col(i)}${row}`, h, styleHeader));
    row++;
    [r.zap_C, r.zap_PX, r.zap_PY, r.zap_E].forEach((z, i) => {
      const alt = i % 2 === 0;
      setCell(ws, `A${row}`, `Z-${i+1} (${z.label})`, styleCellBold(alt));
      setCell(ws, `B${row}`, z.L, styleCellNum(alt));
      setCell(ws, `C${row}`, z.L, styleCellNum(alt));
      setCell(ws, `D${row}`, (z.hz*100).toFixed(0), styleCellCenter(alt));
      setCell(ws, `E${row}`, `${z.nvar}${z.var_z.nom} @ ${z.sep.toFixed(1)} cm`, styleCellCenter(alt));
      setCell(ws, `F${row}`, "7.5 cm", styleCellCenter(alt));
      row++;
    });

    setRange(ws, `A1:F${row+1}`);
    setCols(ws, [24, 22, 22, 22, 24, 18]);
    ws["!freeze"] = { xSplit: 0, ySplit: 3 };
    XLSX.utils.book_append_sheet(wb, ws, "Despiece");
  }

  const safeName = proyecto.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_-]/g, "");
  XLSX.writeFile(wb, `Memoria_Estructural_${safeName}.xlsx`);
}
