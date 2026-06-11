/**
 * exportPDF.js · Memoria APA 7ma edición · Blanco y negro
 * Diseño formal académico sin colores
 */
import {
  svgPlantaInline, svgVigaInline, svgColumnaInline,
  svgEspectroInline, svgDistribucionInline,
  svgDiagramaPMInline, svgDerivasInline,
} from "./svgInline.js";

export function exportarPDF(p, r, incluirFase2 = false) {
 const fv = (v,d=3) => typeof v==="number" ? v.toFixed(d) : v;
 const fecha = new Date().toLocaleDateString("es-PE",{year:"numeric",month:"long",day:"numeric"});
 const ok = v => v ? "<span class='ok'>Cumple</span>" : "<span class='nocumple'>No cumple</span>";
 const blonOk = r.blond>=0.60 && r.blond<=0.64;
 let neq = 0; const eq = (f) => { neq++; return `<div class="eq"><span class="ef">${f}</span><span class="en">(${neq})</span></div>`; };
 const nota = (t) => `<p class="nota"><i>Nota.</i> ${t}</p>`;
 const tt = (n,t) => `<p class="tn">Tabla ${n}</p><p class="tt"><i>${t}</i></p>`;
 const ft = (n,t) => `<p class="tn">Figura ${n}</p><p class="tt"><i>${t}</i></p>`;

 // ── SECCIÓN FASE 2 · Diseño detallado (opcional) ─────────
 const seccionFase2 = incluirFase2 ? `
<section class="pb">
<div class="hdr"><span>${p.proyecto}</span><span>${fecha}</span></div>
<h1 class="sec">11. Diseño Estructural Detallado (Fase 2)</h1>

<h2 class="sub">11.1 Análisis modal aproximado</h2>
<p class="indent">A partir del período fundamental T = ${r.T.toFixed(3)} s estimado por la fórmula empírica
T = H/Ct, se identifican los modos de vibración aproximados de la estructura. El análisis dinámico
definitivo deberá realizarse mediante el método modal espectral en software estructural (ETABS, SAP2000).</p>
${tt(13, "Modos de vibración aproximados")}
<table>
<tr><th>Modo</th><th>T (s)</th><th>f (Hz)</th><th>Masa participativa</th></tr>
${r.modos.map(m=>`<tr><td>${m.modo}</td><td>${m.T.toFixed(3)}</td><td>${m.f.toFixed(2)}</td><td>${(m.masaPart*100).toFixed(1)}%</td></tr>`).join("")}
</table>
${nota("E.030-2018 §29 establece que la suma de masas participativas debe ser ≥ 90 %. La estimación es válida solo como referencia para el modelado en software.")}

<div class="fig">${svgEspectroInline(r)}</div>
${ft(4, "Espectro de pseudo-aceleraciones Sa(T) · NTE E.030-2018")}

<div class="fig">${svgDistribucionInline(r)}</div>
${ft(5, "Distribución vertical de fuerzas sísmicas Fi por piso")}

<h2 class="sub">11.2 Verificación de derivas</h2>
${eq(`Δ_{inel} = 0.75 · R · Δ_{elast} (E.030 §5.1)`)}
${eq(`Drift = Δ_{inel} / h_{piso} ≤ 0.007 (concreto armado, E.030 §5.2)`)}
${tt(14, "Drift por piso · Verificación de derivas")}
<table>
<tr><th>Piso</th><th>hi (m)</th><th>Δ_elast (cm)</th><th>Δ_inel (cm)</th><th>Drift (‰)</th><th>Estado</th></tr>
${r.derivas.slice().reverse().map(d=>`<tr><td>${d.piso}</td><td>${d.hi.toFixed(2)}</td><td>${d.Δ_elast.toFixed(3)}</td><td>${d.Δ_inel.toFixed(2)}</td><td>${(d.drift*1000).toFixed(2)}</td><td>${ok(d.drift<=r.drift_lim)}</td></tr>`).join("")}
</table>
<div class="fig">${svgDerivasInline(r)}</div>
${ft(6, "Drift por piso vs. límite normativo 0.007")}


<h2 class="sub">11.3 Diagrama de interacción P-M (columna unificada)</h2>
<p class="indent">Para la columna unificada de ${r.b_unif}×${r.b_unif} cm con refuerzo
<b>${r.var_unif.n*4}${r.var_unif.nom}</b> (ρ = ${(r.rho_esq*100).toFixed(2)}%), se obtiene el diagrama
de interacción nominal con seis puntos característicos:</p>
${tt(15, "Puntos del diagrama P-M nominal")}
<table>
<tr><th>Punto</th><th>Etiqueta</th><th>P (tf)</th><th>M (tf·m)</th></tr>
${r.diagPM.map((pt,i)=>`<tr><td>${i+1}</td><td>${pt.etiqueta}</td><td>${pt.P.toFixed(1)}</td><td>${pt.M.toFixed(2)}</td></tr>`).join("")}
</table>
${nota("Diagrama nominal con factores de reducción φ. El diseño definitivo verificará interacción biaxial mediante Bresler (NTE E.060 §10.13).")}

<div class="fig">${svgDiagramaPMInline(r)}</div>
${ft(7, "Diagrama de interacción P-M de la columna unificada")}

<h2 class="sub">11.4 Cuadro de despiece · Columnas</h2>
<div class="fig">${svgColumnaInline(r.b_unif, r.var_unif, `Sección típica ${r.b_unif}×${r.b_unif} cm`)}</div>
${ft(8, "Sección transversal de columna típica con armado longitudinal")}
${tt(16, "Cuadro de columnas · armado constructivo")}
<table>
<tr><th>ID</th><th>Sección</th><th>Long.</th><th>Estribos Lo</th><th>Estribos central</th><th>L empalme</th></tr>
<tr><td>C-1 (Esquinera)</td><td>${r.b_unif}×${r.b_unif} cm</td><td>${r.var_unif.n*4}${r.var_unif.nom}</td><td>∅3/8" @ ${r.s_conf.toFixed(0)} mm</td><td>∅3/8" @ ${Math.min(r.b_unif*10*0.7, 200).toFixed(0)} mm</td><td>${r.detalleColumna.longitud_empalme.toFixed(0)} cm</td></tr>
<tr><td>C-2 (Perim. X)</td><td>${r.b_unif}×${r.b_unif} cm</td><td>${r.var_unif.n*4}${r.var_unif.nom}</td><td>∅3/8" @ ${r.s_conf.toFixed(0)} mm</td><td>∅3/8" @ ${Math.min(r.b_unif*10*0.7, 200).toFixed(0)} mm</td><td>${r.detalleColumna.longitud_empalme.toFixed(0)} cm</td></tr>
<tr><td>C-3 (Perim. Y)</td><td>${r.b_unif}×${r.b_unif} cm</td><td>${r.var_unif.n*4}${r.var_unif.nom}</td><td>∅3/8" @ ${r.s_conf.toFixed(0)} mm</td><td>∅3/8" @ ${Math.min(r.b_unif*10*0.7, 200).toFixed(0)} mm</td><td>${r.detalleColumna.longitud_empalme.toFixed(0)} cm</td></tr>
<tr><td>C-4 (Central)</td><td>${r.b_unif}×${r.b_unif} cm</td><td>${r.var_unif.n*4}${r.var_unif.nom}</td><td>∅3/8" @ ${r.s_conf.toFixed(0)} mm</td><td>∅3/8" @ ${Math.min(r.b_unif*10*0.7, 200).toFixed(0)} mm</td><td>${r.detalleColumna.longitud_empalme.toFixed(0)} cm</td></tr>
</table>

<h2 class="sub">11.5 Cuadro de despiece · Vigas</h2>
${tt(17, "Cuadro de vigas · armado constructivo")}
<table>
<tr><th>ID</th><th>Sección</th><th>Acero (-)</th><th>Acero (+)</th><th>Estribos conf.</th><th>L_conf</th></tr>
<tr><td>V-101 (Lx)</td><td>${(r.b_vp*100).toFixed(0)}×${(r.h_vp*100).toFixed(0)} cm</td><td>${r.var_vp.n}${r.var_vp.nom}</td><td>${r.var_vp_pos.n}${r.var_vp_pos.nom}</td><td>∅3/8" @ ${(r.s_vp_sism*100).toFixed(0)} cm</td><td>${r.detalleEstribos.Lconf.toFixed(2)} m</td></tr>
<tr><td>V-102 (Ly)</td><td>${(r.b_vs*100).toFixed(0)}×${(r.h_vs*100).toFixed(0)} cm</td><td>${r.var_vs.n}${r.var_vs.nom}</td><td>${r.var_vs.n}${r.var_vs.nom}</td><td>∅3/8" @ ${(r.s_vp_sism*100).toFixed(0)} cm</td><td>${(2*r.h_vs).toFixed(2)} m</td></tr>
</table>

<h2 class="sub">11.6 Cuadro de despiece · Zapatas</h2>
${tt(18, "Cuadro de zapatas aisladas")}
<table>
<tr><th>ID</th><th>Dimensiones</th><th>Peralte hz</th><th>Refuerzo (c/dir.)</th><th>Recub.</th></tr>
${[r.zap_C, r.zap_PX, r.zap_PY, r.zap_E].map((z,i)=>`<tr><td>Z-${i+1} (${z.label})</td><td>${z.L.toFixed(2)} × ${z.L.toFixed(2)} m</td><td>${(z.hz*100).toFixed(0)} cm</td><td>${z.nvar}${z.var_z.nom} @ ${z.sep.toFixed(1)} cm</td><td>7.5 cm</td></tr>`).join("")}
</table>

<h2 class="sub">11.7 Recomendaciones de diseño</h2>
<ol style="margin-left:1.5cm; line-height:1.8; margin-top:6pt">
<li><b>Análisis dinámico:</b> El predimensionamiento debe verificarse con análisis modal espectral en software estructural (ETABS / SAP2000) conforme a NTE E.030-2018 §29.</li>
<li><b>Verificación P-M biaxial:</b> Las columnas perimetrales y esquineras requieren verificación con flexo-compresión biaxial mediante el método de Bresler (NTE E.060 §10.13).</li>
<li><b>Empalmes:</b> Ubicar empalmes de columnas en el tercio central de la altura, evitando zonas confinadas.</li>
<li><b>Vigas peraltadas:</b> Cuando h/L > 1/4, considerar como viga peraltada (ACI 318-19 §9.9).</li>
<li><b>Detalles sísmicos:</b> Cumplir requisitos especiales de NTE E.060 §21 para pórticos especiales y muros estructurales.</li>
<li><b>Cimentación:</b> Verificar asentamientos diferenciales y considerar vigas de conexión entre zapatas para zonas sísmicas altas.</li>
<li><b>Recubrimientos:</b> Cumplir lo dispuesto en NTE E.060 §7.7 (7.5 cm cimentaciones, 4 cm columnas/vigas, 2 cm losas).</li>
</ol>
</section>
` : "";

 const html = `<!DOCTYPE html><html lang="es"><head>
<meta charset="UTF-8"><title>Memoria · ${p.proyecto}</title>
<style>
@page { size: A4; margin: 2.5cm 2cm 2.5cm 2cm; }
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family: 'Times New Roman', serif; font-size: 11pt; color: #000; line-height: 1.5; }
.cover { text-align:center; padding: 3cm 1cm; page-break-after: always; }
.cover h1 { font-size: 18pt; font-weight: bold; margin-bottom: 14pt; letter-spacing: 0.5pt; }
.cover h2 { font-size: 14pt; margin-bottom: 10pt; }
.cover h3 { font-size: 12pt; font-weight: normal; margin: 8pt 0; }
.cover .meta { font-size: 11pt; margin-top: 12pt; }
.cover .normas { margin-top: 30pt; font-size: 10pt; border-top: 1pt solid #000; border-bottom: 1pt solid #000; padding: 8pt 0; }
section { padding: 6pt 0; page-break-inside: avoid; }
h1.sec { font-size: 14pt; font-weight: bold; text-align: center; margin: 20pt 0 12pt; text-transform: uppercase; letter-spacing: 0.5pt; }
h2.sub { font-size: 12pt; font-weight: bold; margin: 14pt 0 8pt; }
h3.subsub { font-size: 11pt; font-weight: bold; font-style: italic; margin: 10pt 0 6pt; }
p { margin: 6pt 0; text-align: justify; text-indent: 0; }
p.indent { text-indent: 1.27cm; }
.nref { font-size: 10pt; color: #333; font-style: italic; margin: 4pt 0 8pt 1cm; padding: 4pt; border-left: 2pt solid #000; padding-left: 8pt; }
table { width: 100%; border-collapse: collapse; margin: 8pt 0; font-size: 10pt; }
th { background: #000; color: #fff; padding: 6pt 8pt; text-align: left; font-size: 10pt; font-weight: bold; }
td { padding: 5pt 8pt; border-bottom: 0.5pt solid #888; vertical-align: middle; }
tr:nth-child(even) td { background: #F0F0F0; }
.hl td { font-weight: bold; background: #DDDDDD !important; }
.ok { font-weight: bold; color: #000; padding: 1pt 6pt; border: 1pt solid #000; border-radius: 2pt; }
.nocumple { font-weight: bold; color: #000; padding: 1pt 6pt; border: 1.5pt solid #000; background: #000; color: #fff; border-radius: 2pt; }
.eq { display: flex; align-items: baseline; gap: 12pt; margin: 6pt 0 6pt 1.27cm; font-size: 11pt; }
.ef { font-family: 'Courier New', monospace; color: #000; flex: 1; font-size: 10.5pt; }
.en { color: #000; font-weight: bold; min-width: 30pt; text-align: right; }
.box { border: 1pt solid #000; padding: 8pt 12pt; margin: 8pt 0; font-size: 10.5pt; }
.box-hl { border: 2pt solid #000; padding: 10pt 14pt; margin: 10pt 0; font-size: 11pt; background: #F5F5F5; }
.tn { font-size: 11pt; font-weight: bold; margin-top: 10pt; margin-bottom: 0; }
.tt { font-size: 11pt; margin-top: 1pt; margin-bottom: 4pt; }
.nota { font-size: 9.5pt; margin-top: 4pt; margin-bottom: 8pt; font-style: italic; }
.nota i { font-weight: bold; }
.fig { text-align: center; margin: 10pt 0; padding: 6pt; page-break-inside: avoid; }
.fig svg { display: block; margin: 0 auto; }
.pb { page-break-before: always; }
.ref { font-size: 11pt; margin-bottom: 8pt; padding-left: 1.27cm; text-indent: -1.27cm; line-height: 1.5; }
footer { text-align: center; font-size: 9pt; padding: 10pt 0; border-top: 0.5pt solid #000; margin-top: 18pt; }
.toc { margin: 14pt 0; }
.toc-item { display: flex; justify-content: space-between; padding: 4pt 0; font-size: 11pt; border-bottom: 0.5pt dotted #888; }
.toc-item.l2 { padding-left: 1cm; font-size: 10.5pt; color: #333; }
.hdr { display: flex; justify-content: space-between; border-bottom: 1pt solid #000; padding-bottom: 4pt; margin-bottom: 10pt; font-size: 9pt; }
.fig { text-align: center; margin: 12pt 0 4pt 0; padding: 8pt; border: 0.5pt solid #ddd; background: #fff; }
.fig svg { display: inline-block; max-width: 100%; height: auto; }
@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style></head><body>

<!-- PORTADA -->
<div class="cover">
 <h1>MEMORIA DE CÁLCULO</h1>
 <h1>PREDIMENSIONAMIENTO ESTRUCTURAL</h1>
 <h2 style="margin-top:24pt">${p.proyecto}</h2>
 <h3>${p.descripcion || ""}</h3>
 <h3>Sistema Estructural: ${r.sistema.desc}</h3>
 <h3>${p.N} Niveles · Concreto Armado</h3>

 <p class="meta" style="margin-top:30pt">
 <b>Ubicación:</b> ${p.ubicacion}<br/>
 <b>Zona Sísmica:</b> ${r.zona.id} (Z = ${r.Z}) · <b>Suelo:</b> ${r.suelo.id} · ${r.suelo.desc}<br/>
 <b>Categoría de Uso:</b> ${r.categoria.desc}
 </p>

 <p class="meta" style="margin-top:20pt">
 f'c = ${p.fc} kg/cm² &nbsp;|&nbsp; fy = ${p.fy} kg/cm² &nbsp;|&nbsp; γc = 2.40 tf/m³
 </p>

 <div class="normas">
 <b>Normas aplicables</b><br/>
 NTE E.020-2006 · Cargas<br/>
 NTE E.030-2018 · Diseño Sismorresistente<br/>
 NTE E.050-2018 · Suelos y Cimentaciones<br/>
 NTE E.060-2009 · Concreto Armado<br/>
 ACI 318-19 · Building Code Requirements for Structural Concrete<br/>
 CIRSOC 201 · Reglamento Argentino de Estructuras de Hormigón
 </div>

 <p class="meta" style="margin-top:40pt"><i>${fecha}</i></p>
</div>

<!-- ÍNDICE -->
<section>
<h1 class="sec">Índice</h1>
<div class="toc">
<div class="toc-item"><span>1. Datos generales del proyecto</span><span>3</span></div>
<div class="toc-item l2"><span>1.1 Descripción</span><span>3</span></div>
<div class="toc-item l2"><span>1.2 Parámetros y materiales</span><span>3</span></div>
<div class="toc-item l2"><span>1.3 Cargas de diseño</span><span>4</span></div>
<div class="toc-item"><span>2. Análisis sísmico estático</span><span>5</span></div>
<div class="toc-item"><span>3. Predimensionamiento de losas</span><span>6</span></div>
<div class="toc-item"><span>4. Predimensionamiento de vigas</span><span>8</span></div>
<div class="toc-item"><span>5. Predimensionamiento de columnas</span><span>9</span></div>
<div class="toc-item"><span>6. Placas y muros de corte</span><span>11</span></div>
<div class="toc-item"><span>7. Escaleras</span><span>12</span></div>
<div class="toc-item"><span>8. Cimentación · zapatas aisladas</span><span>13</span></div>
<div class="toc-item"><span>9. Resumen ejecutivo</span><span>15</span></div>
<div class="toc-item"><span>10. Conclusiones y siguiente fase</span><span>16</span></div>
<div class="toc-item"><span>Referencias bibliográficas</span><span>17</span></div>
</div>
</section>

<!-- 1. DATOS GENERALES -->
<section class="pb">
<div class="hdr"><span>${p.proyecto}</span><span>${fecha}</span></div>
<h1 class="sec">1. Datos Generales del Proyecto</h1>

<h2 class="sub">1.1 Descripción</h2>
<p class="indent">El presente documento constituye la Memoria de Cálculo del Predimensionamiento Estructural del proyecto <b>${p.proyecto}</b>, ubicado en ${p.ubicacion}. La estructura corresponde a un edificio de ${p.N} niveles de concreto armado con sistema estructural ${r.sistema.desc.toLowerCase()}, clasificado en Zona Sísmica ${r.zona.id} (Z = ${r.Z}) sobre suelo tipo ${r.suelo.id} (${r.suelo.desc.toLowerCase()}).</p>
<p class="indent">El objetivo del predimensionamiento es determinar las dimensiones preliminares y cuantías de acero de cada elemento estructural, las cuales servirán como punto de partida para el modelamiento y análisis estructural definitivo mediante software especializado (ETABS, SAP2000 o equivalente).</p>

<h2 class="sub">1.2 Parámetros y materiales</h2>
${tt(1,"Parámetros geométricos y propiedades de los materiales")}
<table>
<tr><th>Parámetro</th><th>Símbolo</th><th>Valor</th><th>Unidad</th></tr>
<tr><td>Longitud total (dirección X)</td><td>L<sub>x</sub></td><td>${r.Lx_total.toFixed(2)}</td><td>m</td></tr>
<tr><td>Longitud total (dirección Y)</td><td>L<sub>y</sub></td><td>${r.Ly_total.toFixed(2)}</td><td>m</td></tr>
<tr><td>Número de ejes</td><td>n<sub>X</sub> · n<sub>Y</sub></td><td>${r.nEjesX} · ${r.nEjesY}</td><td> </td></tr>
<tr><td>Número de columnas</td><td>n<sub>col</sub></td><td>${r.nColTotal}</td><td> </td></tr>
<tr><td>Altura promedio de entrepiso</td><td>h<sub>piso</sub></td><td>${r.hpiso_promedio.toFixed(2)}</td><td>m</td></tr>
<tr><td>Número de niveles</td><td>N</td><td>${p.N}</td><td> </td></tr>
<tr class="hl"><td>Altura total</td><td>H</td><td>${r.H_total.toFixed(2)}</td><td>m</td></tr>
<tr><td>Resistencia del concreto</td><td>f'c</td><td>${p.fc}</td><td>kg/cm²</td></tr>
<tr><td>Módulo de elasticidad</td><td>E<sub>c</sub> = 15100√f'c</td><td>${r.Ec.toFixed(0)}</td><td>kg/cm²</td></tr>
<tr><td>Fluencia del acero</td><td>f<sub>y</sub></td><td>${p.fy}</td><td>kg/cm²</td></tr>
</table>
${nota("Adaptado de NTE E.060-2009 §5.2 y ACI 318-19 §19.2.2.")}

<div class="fig">${svgPlantaInline(r, p)}</div>
${ft(1, `Plano de planta estructural con ejes y columnas (escala variable)`)}

<h2 class="sub">1.3 Cargas de diseño</h2>
<p class="indent">Las cargas de diseño se establecen de acuerdo con la NTE E.020-2006. La combinación de carga última se aplica según NTE E.060-2009 §9.2:</p>
${eq("Wu = 1.4·CM + 1.7·CV")}
${eq(`Wu = 1.4 × ${p.qcm.toFixed(3)} + 1.7 × ${p.qcv.toFixed(3)} = ${r.Wu_hab.toFixed(3)} tf/m²`)}
${tt(2,"Cargas de diseño por unidad de superficie")}
<table>
<tr><th>Tipo de carga</th><th>Símbolo</th><th>Valor (tf/m²)</th><th>Referencia</th></tr>
<tr><td>Carga muerta</td><td>CM</td><td>${p.qcm.toFixed(3)}</td><td>NTE E.020 Tab. 1</td></tr>
<tr><td>Carga viva habitaciones</td><td>CV<sub>h</sub></td><td>${p.qcv.toFixed(3)}</td><td>NTE E.020 Tab. 1</td></tr>
<tr><td>Carga viva corredores</td><td>CV<sub>c</sub></td><td>${p.qcvCorr.toFixed(3)}</td><td>NTE E.020 Tab. 1</td></tr>
<tr class="hl"><td>Carga última</td><td>Wu</td><td>${r.Wu_hab.toFixed(3)}</td><td>NTE E.060 §9.2</td></tr>
</table>
</section>

<!-- 2. ANÁLISIS SÍSMICO -->
<section class="pb">
<div class="hdr"><span>${p.proyecto}</span><span>${fecha}</span></div>
<h1 class="sec">2. Análisis Sísmico Estático</h1>
<div class="nref">Norma Técnica de Edificación E.030-2018. Diseño Sismorresistente. Sistema Nacional de Edificaciones.</div>

<p class="indent">El edificio se clasifica como Categoría de Uso ${r.categoria.id} (${r.categoria.desc.split(" · ")[1].trim()}) sobre suelo tipo ${r.suelo.id} (${r.suelo.desc}). El análisis sísmico estático se efectúa conforme a la NTE E.030-2018 Art. 28.</p>

${eq(`T = H / Ct = ${(p.hpiso*p.N).toFixed(2)} / ${r.Ct} = ${r.T.toFixed(3)} s`)}
${eq(`Para T ${r.T<r.Tp?"<":r.T<r.Tl?"<":">"} Tp = ${r.Tp.toFixed(2)} s → C = ${r.C_sis.toFixed(3)}`)}
${eq(`ZUCS / R = (${r.Z} × ${r.U} × ${r.C_sis.toFixed(3)} × ${r.S.toFixed(2)}) / ${r.R} = ${r.ZUCS_R.toFixed(4)}`)}
${eq(`Verif: C/R = ${(r.C_sis/r.R).toFixed(3)} ≥ 0.11 ${r.C_R_min_ok?"Cumple":"Aplicar mínimo"}`)}
${eq(`V_basal = (ZUCS/R) × Ws = ${r.ZUCS_R_efectivo.toFixed(4)} × ${r.Ws.toFixed(1)} = ${r.V_basal.toFixed(2)} tf`)}

${tt(3,"Parámetros sísmicos de diseño (NTE E.030-2018)")}
<table>
<tr><th>Factor</th><th>Símbolo</th><th>Valor</th><th>Artículo</th></tr>
<tr><td>Factor de zona ${r.zona.ejemplos}</td><td>Z</td><td>${r.Z}</td><td>Art. 10</td></tr>
<tr><td>Factor de uso (Cat. ${r.categoria.id})</td><td>U</td><td>${r.U}</td><td>Art. 15</td></tr>
<tr><td>Factor de suelo (${r.suelo.id})</td><td>S</td><td>${r.S.toFixed(2)}</td><td>Art. 14</td></tr>
<tr><td>Período de plataforma</td><td>Tp</td><td>${r.Tp.toFixed(2)} s</td><td>Art. 14</td></tr>
<tr><td>Período límite</td><td>TL</td><td>${r.Tl.toFixed(2)} s</td><td>Art. 14</td></tr>
<tr><td>Coeficiente de reducción</td><td>R</td><td>${r.R}</td><td>Tab. 7</td></tr>
<tr><td>Período fundamental</td><td>T</td><td>${r.T.toFixed(3)} s</td><td>Art. 28.4</td></tr>
<tr><td>Coef. amplificación sísmica</td><td>C</td><td>${r.C_sis.toFixed(3)}</td><td>Art. 14</td></tr>
<tr class="hl"><td>ZUCS/R</td><td> · </td><td>${r.ZUCS_R.toFixed(4)}</td><td>Art. 25.3</td></tr>
<tr class="hl"><td>Cortante basal</td><td>V</td><td>${r.V_basal.toFixed(2)} tf</td><td>Art. 28</td></tr>
</table>
${nota("Análisis estático preliminar. El análisis definitivo se efectuará mediante análisis dinámico modal espectral conforme a NTE E.030-2018 §29.")}
</section>

<!-- 3. LOSAS -->
<section class="pb">
<div class="hdr"><span>${p.proyecto}</span><span>${fecha}</span></div>
<h1 class="sec">3. Predimensionamiento de Losas</h1>

<h2 class="sub">3.1 Losa aligerada unidireccional</h2>
<div class="nref">ACI Committee 318. (2019). ACI 318-19 §9.3.1.1.</div>
<p class="indent">El peralte mínimo se determina como h<sub>mín</sub> = L/25 para losas en una dirección con un extremo continuo:</p>
${eq(`h_{mín} = Lx / 25 = ${p.Lx} / 25 = ${r.h_al_min.toFixed(3)} m → h adoptado = ${r.h_al.toFixed(2)} m`)}
${eq(`PP = ${r.PP_al.toFixed(3)} tf/m² (NTE E.020-2006 Tabla 4)`)}
${eq(`Vu (por vigueta, ancho trib. 0.40 m) = Wu × 0.40 × Lx / 2 = ${r.Vu_al.toFixed(3)} tf`)}
${eq(`φVc (por vigueta, bw=0.10 m) = φ · 0.53 · √f'c · bw · d = ${r.phiVc_al.toFixed(3)} tf`)}

${tt(4,"Verificación por cortante · losa aligerada")}
<table>
<tr><th>Verificación</th><th>Actuante</th><th>Resistencia</th><th>Unidad</th><th>Estado</th></tr>
<tr><td>Vu ≤ φVc (por vigueta)</td><td>${r.Vu_al.toFixed(3)}</td><td>${r.phiVc_al.toFixed(3)}</td><td>tf</td><td>${ok(r.losa_ok)}</td></tr>
</table>

${eq(`Mu = Wu × Lx² / 8 = ${r.Mu_al.toFixed(3)} tf·m/m`)}
${eq(`As_{req} = ${r.As_al.toFixed(2)} cm² → Adoptar ${r.var_al.n}${r.var_al.nom}/vigueta (As=${r.var_al.As_tot.toFixed(2)} cm²)`)}

<h2 class="sub">3.2 Losa maciza bidireccional</h2>
<div class="nref">CIRSOC. (2005). Reglamento CIRSOC 201, Método 3. Coeficientes Ca y Cb interpolados según m = Ly/Lx.</div>
${eq(`m = Ly / Lx = ${r.m_mac.toFixed(3)}`)}
${eq(`Ca = ${r.Ca.toFixed(4)}, Cb = ${r.Cb.toFixed(4)} (interpolados)`)}
${eq(`h adoptado = ${r.h_mac.toFixed(2)} m`)}
${eq(`Mu_x = Ca·Wu·Lx² = ${r.Mu_mac_x.toFixed(3)} tf·m/m`)}
${eq(`Mu_y = Cb·Wu·Ly² = ${r.Mu_mac_y.toFixed(3)} tf·m/m`)}

${tt(5,"Resumen losa maciza bidireccional")}
<table>
<tr><th>Dirección</th><th>As req (cm²/m)</th><th>Varilla</th><th>As prov (cm²/m)</th></tr>
<tr><td>X (paralelo a Lx)</td><td>${r.As_mac_x.toFixed(2)}</td><td>${r.var_mx.n}${r.var_mx.nom}</td><td>${r.var_mx.As_tot.toFixed(2)}</td></tr>
<tr><td>Y (paralelo a Ly)</td><td>${r.As_mac_y.toFixed(2)}</td><td>${r.var_my.n}${r.var_my.nom}</td><td>${r.var_my.As_tot.toFixed(2)}</td></tr>
</table>
${nota("CIRSOC (2005), Método 3 · coeficientes interpolados linealmente entre valores tabulados.")}
</section>

<!-- 4. VIGAS -->
<section class="pb">
<div class="hdr"><span>${p.proyecto}</span><span>${fecha}</span></div>
<h1 class="sec">4. Predimensionamiento de Vigas</h1>
<div class="nref">NTE E.060-2009 §21.4.3 · Vigas de pórticos especiales sismorresistentes.</div>

<h2 class="sub">4.1 Viga principal · dirección Lx</h2>
${eq(`h = Lx/12 = ${(p.Lx/12).toFixed(3)} m → h adoptado = ${r.h_vp.toFixed(2)} m`)}
${eq(`b = máx(h/2, 0.25) = ${r.b_vp.toFixed(2)} m`)}
${eq(`Mu = wv·Lx²/10 = ${r.Mu_vp.toFixed(3)} tf·m`)}
${eq(`Vu = wv·Lx/2 = ${r.Vu_vp.toFixed(3)} tf`)}
${eq(`As_{req} = ${r.As_vp.toFixed(2)} cm² → ${r.var_vp.n}${r.var_vp.nom}`)}
${eq(`s_{conf} = mín(d/4, 6db, 150mm) = ${(r.s_vp_sism*1000).toFixed(0)} mm`)}

${tt(6,"Resumen del predimensionamiento de vigas")}
<table>
<tr><th>Viga</th><th>h (m)</th><th>b (m)</th><th>Mu (tf·m)</th><th>As req (cm²)</th><th>Acero adoptado</th></tr>
<tr><td>Principal VP (Lx)</td><td>${r.h_vp.toFixed(2)}</td><td>${r.b_vp.toFixed(2)}</td><td>${r.Mu_vp.toFixed(3)}</td><td>${r.As_vp.toFixed(2)}</td><td>${r.var_vp.n}${r.var_vp.nom}</td></tr>
<tr><td>Secundaria VS (Ly)</td><td>${r.h_vs.toFixed(2)}</td><td>${r.b_vs.toFixed(2)}</td><td>${r.Mu_vs.toFixed(3)}</td><td>${r.As_vs.toFixed(2)}</td><td>${r.var_vs.n}${r.var_vs.nom}</td></tr>
</table>
${nota("La separación s_conf se calcula con el diámetro real de la varilla longitudinal adoptada.")}
</section>

<!-- 5. COLUMNAS -->
<section class="pb">
<div class="hdr"><span>${p.proyecto}</span><span>${fecha}</span></div>
<h1 class="sec">5. Predimensionamiento de Columnas</h1>
<div class="nref">ACI 318-19 §22.4.2.1. NTE E.060-2009 §21.4. ρ = 1.5%, φ = 0.65.</div>

<p class="indent">Se identifican cuatro tipos de columna según su posición en planta: central, perimetral en dirección X, perimetral en dirección Y y esquinera. Cada tipo se predimensiona en función de su área tributaria y la carga axial última acumulada por los N niveles.</p>

${eq("Pu = Wu · At · N · 1.05")}
${eq(`Ag = Pu / [φ · (0.85·f'c·(1−ρ) + fy·ρ)] = Pu / ${(0.65*(0.85*p.fc*0.985+p.fy*0.015)).toFixed(2)}`)}

${tt(7,"Predimensionamiento de columnas por tipo")}
<table>
<tr><th>Tipo</th><th>A<sub>t</sub> (m²)</th><th>P<sub>u</sub> (tf)</th><th>A<sub>g</sub> req (cm²)</th><th>b req (cm)</th><th>Verif.</th></tr>
<tr><td>Central</td><td>${(p.Lx*p.Ly).toFixed(2)}</td><td>${r.col_C.Pu.toFixed(2)}</td><td>${r.col_C.Ag_req.toFixed(0)}</td><td>${r.col_C.b_calc}</td><td>${ok(r.col_C.ok)}</td></tr>
<tr><td>Perimetral X</td><td>${(p.Lx*p.Ly/2).toFixed(2)}</td><td>${r.col_PX.Pu.toFixed(2)}</td><td>${r.col_PX.Ag_req.toFixed(0)}</td><td>${r.col_PX.b_calc}</td><td>${ok(r.col_PX.ok)}</td></tr>
<tr><td>Perimetral Y</td><td>${(p.Lx/2*p.Ly).toFixed(2)}</td><td>${r.col_PY.Pu.toFixed(2)}</td><td>${r.col_PY.Ag_req.toFixed(0)}</td><td>${r.col_PY.b_calc}</td><td>${ok(r.col_PY.ok)}</td></tr>
<tr><td>Esquinera</td><td>${(p.Lx/2*p.Ly/2).toFixed(2)}</td><td>${r.col_E.Pu.toFixed(2)}</td><td>${r.col_E.Ag_req.toFixed(0)}</td><td>${r.col_E.b_calc}</td><td>${ok(r.col_E.ok)}</td></tr>
</table>

<h2 class="sub">5.1 Sección unificada · criterio constructivo</h2>
<div class="box-hl">
Se adopta sección única de <b>${r.b_unif} × ${r.b_unif} cm</b> para todas las columnas del edificio. Esto facilita el proceso constructivo, garantiza uniformidad en el encofrado y mejora la supervisión en obra. La cuantía real en la columna esquinera (la menos cargada) verifica el mínimo normativo de ρ<sub>mín</sub> = 1.0%.
</div>

${eq(`As = ρ × Ag = 0.015 × ${r.b_unif}² = ${r.As_unif.toFixed(2)} cm² → ${r.var_unif.n*4}${r.var_unif.nom}`)}
${eq(`ρ esquinera = ${r.As_unif.toFixed(2)} / ${r.col_E.b_calc}² = ${(r.rho_esq*100).toFixed(2)}% ≥ 1.0%`)}
${eq(`s_{conf} = mín(b/4, 6db, 100mm) = ${r.s_conf.toFixed(0)} mm`)}
${eq(`Lo = máx(b, lu/6, 450mm) = ${r.Lo_col.toFixed(0)} mm`)}
${eq(`λ = lu/b = ${r.esb.toFixed(2)} ≤ 12`)}

${tt(8,"Verificaciones de la sección unificada de columnas")}
<table>
<tr><th>Verificación</th><th>Calculado</th><th>Límite</th><th>Estado</th></tr>
<tr><td>Cuantía mínima</td><td>1.50%</td><td>1.0% ≤ ρ ≤ 6.0%</td><td>${ok(true)}</td></tr>
<tr><td>Cuantía esquinera</td><td>${(r.rho_esq*100).toFixed(2)}%</td><td>ρ ≥ 1.0%</td><td>${ok(r.rho_esq>=0.01)}</td></tr>
<tr><td>Esbeltez λ = lu/b</td><td>${r.esb.toFixed(2)}</td><td>λ ≤ 12</td><td>${ok(r.esb_ok)}</td></tr>
<tr><td>Long. zona confinada Lo</td><td>${r.Lo_col.toFixed(0)} mm</td><td>≥ máx(b, lu/6, 450)</td><td>${ok(true)}</td></tr>
</table>
</section>

<!-- 6. PLACAS -->
<section class="pb">
<div class="hdr"><span>${p.proyecto}</span><span>${fecha}</span></div>
<h1 class="sec">6. Placas y Muros de Corte</h1>
<div class="nref">NTE E.060-2009 §21.9.4. NTE E.030-2018 Art. 28.</div>

${eq(`tw_{mín} = hpiso/16 = ${(p.hpiso/16).toFixed(3)} m → tw = ${r.tw.toFixed(2)} m`)}
${eq(`V_basal = (ZUCS/R) × Ws = ${r.V_basal.toFixed(2)} tf`)}
${eq(`V por placa = (V_basal × 0.80) / ${r.nPlacas_dir} placas = ${r.V_placa.toFixed(2)} tf`)}
${eq(`φVn = φ · 0.53 · √f'c · tw · lw = ${r.phiVn.toFixed(2)} tf`)}
${eq(`Av_{mín} = ρh · tw · s = ${r.Av_placa.toFixed(2)} cm²/m`)}

${tt(9,"Verificación de cortante sísmico · muro de corte")}
<table>
<tr><th>Verificación</th><th>Actuante</th><th>Resistencia</th><th>Unidad</th><th>Estado</th></tr>
<tr><td>V por placa ≤ φVn</td><td>${r.V_placa.toFixed(2)}</td><td>${r.phiVn.toFixed(2)}</td><td>tf</td><td>${ok(r.placa_ok)}</td></tr>
<tr><td>tw ≥ tw_mín</td><td>${r.tw.toFixed(3)}</td><td>${r.tw_min.toFixed(3)}</td><td>m</td><td>${ok(r.tw>=r.tw_min)}</td></tr>
</table>
${nota("Refuerzo mínimo en alma: ∅3/8\" @ 0.20 m en dos capas, ambas direcciones. Bordes confinados según NTE E.060 §21.9.6.")}
</section>

<!-- 7. ESCALERAS -->
<section class="pb">
<div class="hdr"><span>${p.proyecto}</span><span>${fecha}</span></div>
<h1 class="sec">7. Escaleras</h1>
<div class="nref">Reglamento Nacional de Edificaciones. Regla de Blondel: 60 cm ≤ 2c + p ≤ 64 cm.</div>

${eq(`n = round(hpiso/0.175) = ${r.n_cp}`)}
${eq(`c = ${r.cp.toFixed(3)} m, p = ${r.paso.toFixed(3)} m`)}
${eq(`2c + p = ${(r.blond*100).toFixed(1)} cm`)}
${eq(`LH = ${r.LH.toFixed(3)} m, α = ${r.alpha.toFixed(1)}°, t = ${r.t_esc.toFixed(3)} m`)}

${tt(10,"Verificación de geometría · Regla de Blondel")}
<table>
<tr><th>Verificación</th><th>Calculado</th><th>Rango</th><th>Estado</th></tr>
<tr><td>Contrapaso c</td><td>${(r.cp*100).toFixed(1)} cm</td><td>15 · 18 cm</td><td>${ok(r.cp>=0.14&&r.cp<=0.185)}</td></tr>
<tr><td>Paso p</td><td>${(r.paso*100).toFixed(1)} cm</td><td>25 · 30 cm</td><td>${ok(r.paso>=0.24&&r.paso<=0.31)}</td></tr>
<tr><td>Blondel 2c+p</td><td>${(r.blond*100).toFixed(1)} cm</td><td>60 · 64 cm</td><td>${ok(blonOk)}</td></tr>
</table>
</section>

<!-- 8. ZAPATAS -->
<section class="pb">
<div class="hdr"><span>${p.proyecto}</span><span>${fecha}</span></div>
<h1 class="sec">8. Cimentación · Zapatas Aisladas</h1>
<div class="nref">ACI 318-19 §13.2.7.1 y §22.6.5.2. NTE E.050-2018 §3.4.</div>

<p class="indent">Se predimensiona una zapata aislada por cada tipo de columna del edificio: central, perimetral X, perimetral Y y esquinera. La capacidad portante admisible del suelo es q<sub>adm</sub> = ${p.qadm} tf/m², con profundidad de cimentación Df = ${p.Df} m y peso unitario del suelo γ<sub>s</sub> = ${p.gs} tf/m³.</p>

${tt(11,"Resumen del predimensionamiento de zapatas aisladas")}
<table>
<tr><th>Tipo</th><th>P<sub>u</sub> (tf)</th><th>L (m)</th><th>hz (m)</th><th>qu (tf/m²)</th><th>Acero</th><th>Punz.</th></tr>
${[r.zap_C, r.zap_PX, r.zap_PY, r.zap_E].map(z=>`
<tr><td>${z.label}</td><td>${z.Pu.toFixed(2)}</td><td>${z.L.toFixed(2)}</td><td>${z.hz.toFixed(2)}</td><td>${z.qu.toFixed(2)}</td><td>${z.nvar}${z.var_z.nom}@${z.sep.toFixed(1)}cm</td><td>${ok(z.punz_ok)}</td></tr>
`).join("")}
</table>
${nota("Recubrimiento libre de 7.5 cm sobre la cara inferior de la zapata (NTE E.060-2009 §7.7).")}

<h2 class="sub">8.1 Detalle de la zapata central</h2>
${eq(`P_serv = Pu / 1.55 = ${r.zap_C.Pu.toFixed(2)} / 1.55 = ${r.zap_C.P_serv.toFixed(2)} tf`)}
${eq(`q_neta = q_adm − γs·Df − γc·hz = ${r.zap_C.qneta.toFixed(2)} tf/m²`)}
${eq(`Az_req = P_serv / q_neta = ${r.zap_C.Az_req.toFixed(2)} m² → L = ${r.zap_C.L.toFixed(2)} m`)}
${eq(`bo = 4(bc + d) = ${(4*(r.zap_C.bc + r.zap_C.d)).toFixed(3)} m`)}
${eq(`Vu_punz = qu·(L² − (bc+d)²) = ${r.zap_C.Vu_punz.toFixed(2)} tf`)}
${eq(`φVc = 0.75·0.27·√f'c·bo·d = ${r.zap_C.phiVc_punz.toFixed(2)} tf`)}
</section>

<!-- 9. RESUMEN -->
<section class="pb">
<div class="hdr"><span>${p.proyecto}</span><span>${fecha}</span></div>
<h1 class="sec">9. Resumen Ejecutivo</h1>

${tt(12,"Cuadro consolidado del predimensionamiento estructural")}
<table>
<tr><th>Elemento</th><th>Sección adoptada</th><th>Acero principal</th><th>Estado</th></tr>
<tr><td>Losa aligerada</td><td>h = ${r.h_al.toFixed(2)} m</td><td>${r.var_al.n}${r.var_al.nom}/vigueta</td><td>${ok(r.losa_ok)}</td></tr>
<tr><td>Losa maciza</td><td>h = ${r.h_mac.toFixed(2)} m</td><td>X:${r.var_mx.n}${r.var_mx.nom} / Y:${r.var_my.n}${r.var_my.nom}</td><td> · </td></tr>
<tr><td>Viga principal</td><td>${r.h_vp.toFixed(2)} × ${r.b_vp.toFixed(2)} m</td><td>${r.var_vp.n}${r.var_vp.nom}</td><td>${ok(r.flex_vp_ok && r.cort_vp_ok)}</td></tr>
<tr><td>Viga secundaria</td><td>${r.h_vs.toFixed(2)} × ${r.b_vs.toFixed(2)} m</td><td>${r.var_vs.n}${r.var_vs.nom}</td><td> · </td></tr>
<tr><td>Columna unificada</td><td>${r.b_unif} × ${r.b_unif} cm</td><td>${r.var_unif.n*4}${r.var_unif.nom}</td><td>${ok(r.esb_ok)}</td></tr>
<tr><td>Placa / Muro</td><td>tw=${r.tw.toFixed(2)}m / lw=${p.Lw_placa}m</td><td>∅3/8" @ 0.20 m (2 capas)</td><td>${ok(r.placa_ok)}</td></tr>
<tr><td>Escalera</td><td>t = ${r.t_esc.toFixed(3)} m</td><td>${r.var_esc.n}${r.var_esc.nom}</td><td>${ok(blonOk)}</td></tr>
<tr><td>Zapata central</td><td>${r.zap_C.L.toFixed(2)} × ${r.zap_C.L.toFixed(2)} m, hz=${r.zap_C.hz.toFixed(2)}m</td><td>${r.zap_C.nvar}${r.zap_C.var_z.nom}</td><td>${ok(r.zap_C.punz_ok)}</td></tr>
<tr><td>Zapata esquinera</td><td>${r.zap_E.L.toFixed(2)} × ${r.zap_E.L.toFixed(2)} m, hz=${r.zap_E.hz.toFixed(2)}m</td><td>${r.zap_E.nvar}${r.zap_E.var_z.nom}</td><td>${ok(r.zap_E.punz_ok)}</td></tr>
</table>
</section>

<!-- 10. CONCLUSIONES -->
<section class="pb">
<div class="hdr"><span>${p.proyecto}</span><span>${fecha}</span></div>
<h1 class="sec">10. Conclusiones y Siguiente Fase</h1>

<h2 class="sub">10.1 Conclusión técnica</h2>
<p class="indent">${r.todo_ok
 ? "Todos los elementos estructurales verificados cumplen con los requisitos mínimos de resistencia y geometría establecidos por las normas NTE E.060-2009 y ACI 318-19. Las secciones y cuantías de acero obtenidas constituyen un punto de partida adecuado para el modelamiento estructural definitivo (Fase 2)."
 : "Se han identificado elementos que requieren ajuste antes de proceder al modelamiento estructural definitivo. Las recomendaciones específicas para cada elemento se detallan en sus respectivas secciones."}</p>

<h2 class="sub">10.2 Hoja de ruta · Fase 2: Diseño detallado</h2>
<p>Una vez aprobado el predimensionamiento, la Fase 2 contempla las siguientes actividades:</p>
<ol style="margin-left:1.5cm; line-height:1.8; margin-top:6pt">
<li><b>Modelamiento estructural en ETABS / SAP2000</b>: construcción del modelo 3D con las secciones predimensionadas, asignación de cargas permanentes, vivas y sísmicas.</li>
<li><b>Análisis dinámico modal espectral</b> conforme a NTE E.030-2018 §29: determinación de períodos modales, factores de participación de masa, fuerzas cortantes basales por dirección.</li>
<li><b>Verificación de derivas de entrepiso</b>: cumplimiento del límite Δ/h ≤ 0.007 para sistemas de concreto armado (NTE E.030-2018 §5.2).</li>
<li><b>Diseño por flexo-compresión de columnas</b>: construcción del diagrama de interacción P-M y verificación con las solicitaciones reales del análisis.</li>
<li><b>Diseño detallado de elementos</b>: vigas (flexión, cortante, torsión), losas (flexión bidireccional), placas (flexo-compresión, cortante).</li>
<li><b>Diseño de cimentación en SAFE</b>: análisis de interacción suelo-estructura, verificación de asentamientos diferenciales conforme a NTE E.050-2018.</li>
<li><b>Elaboración de planos estructurales</b>: detalles constructivos, cuadro de columnas, despiece de acero, especificaciones técnicas.</li>
</ol>

<h2 class="sub">10.3 Limitaciones del predimensionamiento</h2>
<p class="indent">El predimensionamiento constituye una etapa estimativa que utiliza expresiones empíricas y simplificadas. Los valores calculados (T, C, V<sub>basal</sub>, M, V) son aproximaciones válidas únicamente para establecer las dimensiones iniciales. Los valores definitivos serán determinados por el análisis estructural completo. <b>No es válido construir basándose únicamente en el predimensionamiento.</b></p>
</section>

${seccionFase2}

<!-- REFERENCIAS -->
<section class="pb">
<h1 class="sec">Referencias</h1>
<p class="ref">ACI Committee 318. (2019). <i>Building code requirements for structural concrete (ACI 318-19) and commentary on building code requirements for structural concrete (ACI 318R-19)</i>. American Concrete Institute.</p>
<p class="ref">CIRSOC. (2005). <i>Reglamento CIRSOC 201: Reglamento argentino de estructuras de hormigón</i>. Centro de Investigación de los Reglamentos Nacionales de Seguridad para las Obras Civiles.</p>
<p class="ref">SENCICO. (2006). <i>Norma técnica de edificación E.020-2006: Cargas</i>. Sistema Nacional de Normalización, Capacitación e Investigación para la Industria de la Construcción.</p>
<p class="ref">SENCICO. (2018). <i>Norma técnica de edificación E.030-2018: Diseño sismorresistente</i>. Sistema Nacional de Normalización, Capacitación e Investigación para la Industria de la Construcción.</p>
<p class="ref">SENCICO. (2018). <i>Norma técnica de edificación E.050-2018: Suelos y cimentaciones</i>. Sistema Nacional de Normalización, Capacitación e Investigación para la Industria de la Construcción.</p>
<p class="ref">SENCICO. (2009). <i>Norma técnica de edificación E.060-2009: Concreto armado</i>. Sistema Nacional de Normalización, Capacitación e Investigación para la Industria de la Construcción.</p>
</section>

<footer>${p.proyecto} · Memoria de Cálculo Estructural · ${fecha}</footer>
</body></html>`;

 const w = window.open("", "_blank");
 w.document.write(html);
 w.document.close();
 setTimeout(() => w.print(), 900);
}
