/**
 * svgInline.js · Generadores de SVG como strings (sin React)
 * Usados para embeber figuras en exportables PDF (HTML) y Word.
 */

// Helper · colores B&N (memoria seria sin colores chillones)
const BN = {
  line: "#222", fill: "#fff", txt: "#222",
  hatch: "#888", accent: "#444", gridline: "#bbb",
};

// ═══════════════════════════════════════════════════════════════
// FIGURA · Planta de ejes
// ═══════════════════════════════════════════════════════════════
export function svgPlantaInline(r, params) {
  const Lx = r.Lx_total, Ly = r.Ly_total;
  const M = 50; // margen
  const W = 700, H = 480;
  const sx = (W - 2*M) / Lx;
  const sy = (H - 2*M) / Ly;
  const s = Math.min(sx, sy);
  const dx = (W - Lx*s) / 2;
  const dy = (H - Ly*s) / 2;

  const x = (xm) => dx + xm*s;
  const y = (ym) => H - dy - ym*s; // invertir Y

  // ejes X (verticales) y Y (horizontales)
  let ejes = "";
  r.coordEjesX.forEach(e => {
    ejes += `<line x1="${x(e.x)}" y1="${y(0)+8}" x2="${x(e.x)}" y2="${y(Ly)-30}" stroke="${BN.line}" stroke-width="0.6" stroke-dasharray="5,3"/>`;
    ejes += `<circle cx="${x(e.x)}" cy="${y(Ly)-30}" r="11" fill="${BN.fill}" stroke="${BN.line}" stroke-width="1.2"/>`;
    ejes += `<text x="${x(e.x)}" y="${y(Ly)-26}" text-anchor="middle" font-size="11" font-weight="700" fill="${BN.txt}">${e.label}</text>`;
  });
  r.coordEjesY.forEach(e => {
    ejes += `<line x1="${x(0)-30}" y1="${y(e.y)}" x2="${x(Lx)+8}" y2="${y(e.y)}" stroke="${BN.line}" stroke-width="0.6" stroke-dasharray="5,3"/>`;
    ejes += `<circle cx="${x(0)-30}" cy="${y(e.y)}" r="11" fill="${BN.fill}" stroke="${BN.line}" stroke-width="1.2"/>`;
    ejes += `<text x="${x(0)-30}" y="${y(e.y)+4}" text-anchor="middle" font-size="11" font-weight="700" fill="${BN.txt}">${e.label}</text>`;
  });

  // columnas (cuadradas, distintas según tipo)
  let cols = "";
  const bc = (params.b_col_user || r.b_unif) / 100;
  const sz = bc * s;
  r.columnasEnPlanta.forEach(c => {
    // Estilo según tipo (sin colores fuertes)
    const patt = c.tipo === "C" ? `fill="${BN.fill}" stroke="${BN.line}" stroke-width="1.4"`
              : c.tipo === "E" ? `fill="${BN.line}" stroke="${BN.line}" stroke-width="1.4"`
              : `fill="#444" stroke="${BN.line}" stroke-width="1.4"`;
    cols += `<rect x="${x(c.x)-sz/2}" y="${y(c.y)-sz/2}" width="${sz}" height="${sz}" ${patt}/>`;
    cols += `<text x="${x(c.x)}" y="${y(c.y)-sz/2-3}" text-anchor="middle" font-size="8" fill="${BN.txt}">${c.id}</text>`;
  });

  // cotas entre ejes (separaciones)
  let cotas = "";
  for (let i = 0; i < params.ejesX.length; i++) {
    const xMid = (r.coordEjesX[i].x + r.coordEjesX[i+1].x) / 2;
    cotas += `<text x="${x(xMid)}" y="${y(0)+22}" text-anchor="middle" font-size="9" fill="${BN.txt}">${params.ejesX[i].toFixed(2)} m</text>`;
  }
  for (let i = 0; i < params.ejesY.length; i++) {
    const yMid = (r.coordEjesY[i].y + r.coordEjesY[i+1].y) / 2;
    cotas += `<text x="${x(Lx)+24}" y="${y(yMid)+4}" text-anchor="middle" font-size="9" fill="${BN.txt}">${params.ejesY[i].toFixed(2)} m</text>`;
  }

  // contorno
  const contorno = `<rect x="${x(0)}" y="${y(Ly)}" width="${Lx*s}" height="${Ly*s}" fill="none" stroke="${BN.line}" stroke-width="1"/>`;

  // dimensiones generales
  const dims = `
    <text x="${W/2}" y="${y(0)+44}" text-anchor="middle" font-size="11" font-weight="700" fill="${BN.txt}">L_x = ${Lx.toFixed(2)} m</text>
    <text x="${x(Lx)+50}" y="${H/2}" text-anchor="middle" font-size="11" font-weight="700" fill="${BN.txt}" transform="rotate(90 ${x(Lx)+50} ${H/2})">L_y = ${Ly.toFixed(2)} m</text>
  `;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" style="max-width:100%;height:auto;background:#fff;">
    ${contorno}${ejes}${cotas}${cols}${dims}
    <g transform="translate(${M},${H-20})">
      <text font-size="10" fill="${BN.txt}">Leyenda: ▢ Central · ▣ Perimetral · ■ Esquinera</text>
    </g>
  </svg>`;
}

// ═══════════════════════════════════════════════════════════════
// FIGURA · Sección de viga con armado
// ═══════════════════════════════════════════════════════════════
export function svgVigaInline(b, h, var_inf, var_sup, label) {
  const W = 360, H = 280;
  const cx = W/2, cy = H/2;
  const escala = 360;
  const bw = b*escala, hh = h*escala;
  const x0 = cx - bw/2, y0 = cy - hh/2;

  // estribo
  const recE = 4; // recubrimiento estribo
  const dbE = 3;  // diámetro estribo escalado

  let armado = "";
  // acero superior (negativos)
  const ny = var_sup?.n || var_inf?.n || 3;
  const dbI = (var_inf?.d || 12.7) / 6;
  for (let i = 0; i < ny; i++) {
    const xi = x0 + 12 + (bw - 24) * (i / (ny-1 || 1));
    armado += `<circle cx="${xi}" cy="${y0+12}" r="${dbI}" fill="${BN.line}"/>`;
  }
  // acero inferior
  for (let i = 0; i < ny; i++) {
    const xi = x0 + 12 + (bw - 24) * (i / (ny-1 || 1));
    armado += `<circle cx="${xi}" cy="${y0+hh-12}" r="${dbI}" fill="${BN.line}"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" style="max-width:100%;height:auto;background:#fff;">
    <rect x="${x0}" y="${y0}" width="${bw}" height="${hh}" fill="${BN.fill}" stroke="${BN.line}" stroke-width="1.5"/>
    <rect x="${x0+recE}" y="${y0+recE}" width="${bw-2*recE}" height="${hh-2*recE}" fill="none" stroke="${BN.line}" stroke-width="0.7"/>
    ${armado}
    <text x="${cx}" y="${y0-12}" text-anchor="middle" font-size="11" font-weight="700" fill="${BN.txt}">${label || "Viga"}</text>
    <text x="${cx}" y="${y0+hh+24}" text-anchor="middle" font-size="10" fill="${BN.txt}">b = ${(b*100).toFixed(0)} cm</text>
    <text x="${x0-22}" y="${cy+4}" text-anchor="middle" font-size="10" fill="${BN.txt}" transform="rotate(-90 ${x0-22} ${cy+4})">h = ${(h*100).toFixed(0)} cm</text>
    <text x="${cx}" y="${y0+hh/2-hh/4}" text-anchor="middle" font-size="9" fill="${BN.txt}">${var_sup?.n||0}${var_sup?.nom||""} (-)</text>
    <text x="${cx}" y="${y0+hh/2+hh/4+8}" text-anchor="middle" font-size="9" fill="${BN.txt}">${var_inf?.n||0}${var_inf?.nom||""} (+)</text>
  </svg>`;
}

// ═══════════════════════════════════════════════════════════════
// FIGURA · Sección de columna con armado
// ═══════════════════════════════════════════════════════════════
export function svgColumnaInline(b_cm, varilla, label) {
  const W = 280, H = 280;
  const cx = W/2, cy = H/2;
  const escala = 320 / Math.max(b_cm, 30);
  const sz = b_cm*escala;
  const x0 = cx - sz/2, y0 = cy - sz/2;

  // 4 barras por cara + esquinas (8 barras típico)
  const n_total = (varilla.n || 2) * 4;
  let armado = "";
  const dbVar = (varilla.d || 19) / 7;
  const margen = 14;
  // distribuir barras a lo largo del perímetro
  const barsPerSide = Math.ceil(n_total / 4);
  for (let i = 0; i < barsPerSide; i++) {
    const t = i / (barsPerSide - 1 || 1);
    // top
    armado += `<circle cx="${x0+margen + (sz-2*margen)*t}" cy="${y0+margen}" r="${dbVar}" fill="${BN.line}"/>`;
    // bottom
    armado += `<circle cx="${x0+margen + (sz-2*margen)*t}" cy="${y0+sz-margen}" r="${dbVar}" fill="${BN.line}"/>`;
    // left
    armado += `<circle cx="${x0+margen}" cy="${y0+margen + (sz-2*margen)*t}" r="${dbVar}" fill="${BN.line}"/>`;
    // right
    armado += `<circle cx="${x0+sz-margen}" cy="${y0+margen + (sz-2*margen)*t}" r="${dbVar}" fill="${BN.line}"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" style="max-width:100%;height:auto;background:#fff;">
    <rect x="${x0}" y="${y0}" width="${sz}" height="${sz}" fill="${BN.fill}" stroke="${BN.line}" stroke-width="1.5"/>
    <rect x="${x0+8}" y="${y0+8}" width="${sz-16}" height="${sz-16}" fill="none" stroke="${BN.line}" stroke-width="0.7"/>
    ${armado}
    <text x="${cx}" y="${y0-12}" text-anchor="middle" font-size="11" font-weight="700" fill="${BN.txt}">${label || "Columna"}</text>
    <text x="${cx}" y="${y0+sz+22}" text-anchor="middle" font-size="10" fill="${BN.txt}">${b_cm}·${b_cm} cm</text>
    <text x="${cx}" y="${y0+sz+38}" text-anchor="middle" font-size="9" fill="${BN.txt}">Refuerzo: ${n_total}${varilla.nom}</text>
  </svg>`;
}

// ═══════════════════════════════════════════════════════════════
// FIGURA · Espectro Sa(T)
// ═══════════════════════════════════════════════════════════════
export function svgEspectroInline(r) {
  const W = 580, H = 280;
  const M = {l: 50, r: 18, t: 22, b: 38};
  const innerW = W - M.l - M.r, innerH = H - M.t - M.b;
  const Tmax = 4.0;
  const Smax = Math.max(...r.espectro.map(p => p.Sa)) * 1.15;

  const xS = (T) => M.l + (T/Tmax)*innerW;
  const yS = (Sa) => M.t + innerH - (Sa/Smax)*innerH;

  // ejes
  let ejes = `
    <line x1="${M.l}" y1="${M.t+innerH}" x2="${M.l+innerW}" y2="${M.t+innerH}" stroke="${BN.line}" stroke-width="0.8"/>
    <line x1="${M.l}" y1="${M.t}" x2="${M.l}" y2="${M.t+innerH}" stroke="${BN.line}" stroke-width="0.8"/>
  `;
  // grid
  for (let i = 0; i <= 4; i++) {
    const x = M.l + (i/4)*innerW;
    ejes += `<line x1="${x}" y1="${M.t}" x2="${x}" y2="${M.t+innerH}" stroke="${BN.gridline}" stroke-width="0.3"/>`;
    ejes += `<text x="${x}" y="${M.t+innerH+15}" text-anchor="middle" font-size="9" fill="${BN.txt}">${i.toFixed(1)}</text>`;
  }
  for (let i = 0; i <= 4; i++) {
    const y = M.t + innerH - (i/4)*innerH;
    ejes += `<line x1="${M.l}" y1="${y}" x2="${M.l+innerW}" y2="${y}" stroke="${BN.gridline}" stroke-width="0.3"/>`;
    ejes += `<text x="${M.l-6}" y="${y+3}" text-anchor="end" font-size="9" fill="${BN.txt}">${(i*Smax/4).toFixed(2)}</text>`;
  }

  // curva Sa(T)
  const puntos = r.espectro.filter(p => p.T <= Tmax)
    .map(p => `${xS(p.T)},${yS(p.Sa)}`).join(" ");
  const curva = `<polyline points="${puntos}" fill="none" stroke="${BN.line}" stroke-width="1.6"/>`;

  // marcas T fundamental, Tp, TL
  const marcaT = `<line x1="${xS(r.T)}" y1="${M.t}" x2="${xS(r.T)}" y2="${M.t+innerH}" stroke="${BN.line}" stroke-dasharray="4,3" stroke-width="0.7"/>
                  <text x="${xS(r.T)+4}" y="${M.t+12}" font-size="9" fill="${BN.txt}">T₁=${r.T.toFixed(2)}s</text>`;

  // labels
  const labels = `
    <text x="${M.l+innerW/2}" y="${H-6}" text-anchor="middle" font-size="11" fill="${BN.txt}">Período T (s)</text>
    <text x="14" y="${M.t+innerH/2}" text-anchor="middle" font-size="11" fill="${BN.txt}" transform="rotate(-90 14 ${M.t+innerH/2})">Sa (m/s²)</text>
  `;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" style="max-width:100%;height:auto;background:#fff;">
    ${ejes}${curva}${marcaT}${labels}
  </svg>`;
}

// ═══════════════════════════════════════════════════════════════
// FIGURA · Distribución vertical Fi y cortantes Vi
// ═══════════════════════════════════════════════════════════════
export function svgDistribucionInline(r) {
  const W = 580, H = 320;
  const M = {l: 60, r: 18, t: 22, b: 42};
  const innerW = W - M.l - M.r, innerH = H - M.t - M.b;
  const Fmax = Math.max(...r.distribucion.map(d => d.Fi)) * 1.15;
  const N = r.distribucion.length;

  const yPiso = (i) => M.t + innerH * (1 - (i+1)/N) + innerH/(2*N);

  let barras = "";
  r.distribucion.forEach((d, i) => {
    const yp = yPiso(i);
    const barH = innerH / N * 0.6;
    const barW = (d.Fi / Fmax) * innerW;
    barras += `<rect x="${M.l}" y="${yp-barH/2}" width="${barW}" height="${barH}" fill="${BN.fill}" stroke="${BN.line}" stroke-width="0.8"/>`;
    barras += `<text x="${M.l+barW+4}" y="${yp+3}" font-size="9" fill="${BN.txt}">${d.Fi.toFixed(2)} tf</text>`;
    barras += `<text x="${M.l-8}" y="${yp+3}" text-anchor="end" font-size="9" fill="${BN.txt}">Piso ${d.piso}</text>`;
  });

  // eje x
  let escX = `<line x1="${M.l}" y1="${M.t+innerH}" x2="${M.l+innerW}" y2="${M.t+innerH}" stroke="${BN.line}" stroke-width="0.8"/>`;
  for (let i = 0; i <= 4; i++) {
    const x = M.l + (i/4)*innerW;
    escX += `<line x1="${x}" y1="${M.t+innerH}" x2="${x}" y2="${M.t+innerH+4}" stroke="${BN.line}" stroke-width="0.6"/>`;
    escX += `<text x="${x}" y="${M.t+innerH+16}" text-anchor="middle" font-size="9" fill="${BN.txt}">${(i*Fmax/4).toFixed(2)}</text>`;
  }
  escX += `<text x="${M.l+innerW/2}" y="${H-8}" text-anchor="middle" font-size="11" fill="${BN.txt}">Fi (tf)</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" style="max-width:100%;height:auto;background:#fff;">
    ${escX}${barras}
  </svg>`;
}

// ═══════════════════════════════════════════════════════════════
// FIGURA · Diagrama P-M
// ═══════════════════════════════════════════════════════════════
export function svgDiagramaPMInline(r) {
  const W = 480, H = 360;
  const M = {l: 55, r: 18, t: 22, b: 40};
  const innerW = W - M.l - M.r, innerH = H - M.t - M.b;
  const Mmax = Math.max(...r.diagPM.map(p => p.M)) * 1.4;
  const Pmax = r.diagPM[0].P * 1.1;
  const Pmin = r.diagPM[r.diagPM.length-1].P * 1.1;

  const xS = (M_) => M.l + (M_ + Mmax) / (2*Mmax) * innerW;
  const yS = (P_) => M.t + innerH - (P_ - Pmin) / (Pmax - Pmin) * innerH;

  // ejes
  let ejes = `<line x1="${M.l}" y1="${yS(0)}" x2="${M.l+innerW}" y2="${yS(0)}" stroke="${BN.line}" stroke-width="0.8"/>
              <line x1="${xS(0)}" y1="${M.t}" x2="${xS(0)}" y2="${M.t+innerH}" stroke="${BN.line}" stroke-width="0.8"/>`;

  // curva PM (mitad derecha + espejo)
  const pts = r.diagPM.map(p => `${xS(p.M)},${yS(p.P)}`).join(" ");
  const ptsMirror = r.diagPM.slice().reverse().map(p => `${xS(-p.M)},${yS(p.P)}`).join(" ");
  const curva = `<polyline points="${pts} ${ptsMirror}" fill="none" stroke="${BN.line}" stroke-width="1.6"/>`;

  // puntos críticos
  let marcas = "";
  r.diagPM.forEach(p => {
    marcas += `<circle cx="${xS(p.M)}" cy="${yS(p.P)}" r="3" fill="${BN.line}"/>`;
  });
  // puntos de carga (Pu, Mu)
  r.puntosCarga.forEach(pc => {
    marcas += `<circle cx="${xS(pc.M)}" cy="${yS(pc.P)}" r="4" fill="${BN.fill}" stroke="${BN.line}" stroke-width="1.4"/>`;
    marcas += `<text x="${xS(pc.M)+6}" y="${yS(pc.P)+3}" font-size="9" fill="${BN.txt}">${pc.tipo}</text>`;
  });

  // labels ejes
  const labels = `
    <text x="${M.l+innerW/2}" y="${H-8}" text-anchor="middle" font-size="11" fill="${BN.txt}">M (tf·m)</text>
    <text x="14" y="${M.t+innerH/2}" text-anchor="middle" font-size="11" fill="${BN.txt}" transform="rotate(-90 14 ${M.t+innerH/2})">P (tf)</text>
  `;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" style="max-width:100%;height:auto;background:#fff;">
    ${ejes}${curva}${marcas}${labels}
  </svg>`;
}

// ═══════════════════════════════════════════════════════════════
// FIGURA · Derivas por piso
// ═══════════════════════════════════════════════════════════════
export function svgDerivasInline(r) {
  const W = 560, H = 280;
  const M = {l: 70, r: 50, t: 22, b: 42};
  const innerW = W - M.l - M.r, innerH = H - M.t - M.b;
  const driftMax = Math.max(r.drift_lim, ...r.derivas.map(d => d.drift)) * 1.2;
  const N = r.derivas.length;

  const yPiso = (i) => M.t + innerH * (1 - (i+1)/N) + innerH/(2*N);
  const xD = (d) => M.l + (d / driftMax) * innerW;

  let barras = "";
  r.derivas.forEach((d, i) => {
    const yp = yPiso(i);
    const barH = innerH / N * 0.55;
    const barW = (d.drift / driftMax) * innerW;
    const cumple = d.drift <= r.drift_lim;
    barras += `<rect x="${M.l}" y="${yp-barH/2}" width="${barW}" height="${barH}" fill="${cumple ? BN.fill : BN.line}" stroke="${BN.line}" stroke-width="0.8"/>`;
    barras += `<text x="${M.l+barW+4}" y="${yp+3}" font-size="9" fill="${BN.txt}">${(d.drift*1000).toFixed(2)}‰</text>`;
    barras += `<text x="${M.l-8}" y="${yp+3}" text-anchor="end" font-size="9" fill="${BN.txt}">Piso ${d.piso}</text>`;
  });

  // límite
  const xLim = xD(r.drift_lim);
  const lim = `<line x1="${xLim}" y1="${M.t}" x2="${xLim}" y2="${M.t+innerH}" stroke="${BN.line}" stroke-width="1.2" stroke-dasharray="4,3"/>
               <text x="${xLim+4}" y="${M.t+12}" font-size="9" font-weight="700" fill="${BN.txt}">Límite 7‰</text>`;

  // eje x
  let escX = `<line x1="${M.l}" y1="${M.t+innerH}" x2="${M.l+innerW}" y2="${M.t+innerH}" stroke="${BN.line}" stroke-width="0.8"/>`;
  for (let i = 0; i <= 4; i++) {
    const x = M.l + (i/4)*innerW;
    escX += `<text x="${x}" y="${M.t+innerH+16}" text-anchor="middle" font-size="9" fill="${BN.txt}">${(i*driftMax*1000/4).toFixed(1)}</text>`;
  }
  escX += `<text x="${M.l+innerW/2}" y="${H-8}" text-anchor="middle" font-size="11" fill="${BN.txt}">Drift (‰)</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" style="max-width:100%;height:auto;background:#fff;">
    ${escX}${barras}${lim}
  </svg>`;
}

// ═══════════════════════════════════════════════════════════════
// FIGURA · Plano de cimentación
// ═══════════════════════════════════════════════════════════════
export function svgCimentacionInline(r, params) {
  const Lx = r.Lx_total, Ly = r.Ly_total;
  const W = 720, H = 500;
  const M = 60;
  const sx = (W - 2*M) / Lx, sy = (H - 2*M) / Ly;
  const s = Math.min(sx, sy);
  const dx = (W - Lx*s) / 2;
  const dy = (H - Ly*s) / 2;
  const x = (xm) => dx + xm*s;
  const y = (ym) => H - dy - ym*s;

  // Líneas de ejes
  let ejes = "";
  r.coordEjesX.forEach(e => {
    ejes += `<line x1="${x(e.x)}" y1="${y(0)+8}" x2="${x(e.x)}" y2="${y(Ly)-32}" stroke="${BN.line}" stroke-width="0.5" stroke-dasharray="4,3"/>`;
    ejes += `<circle cx="${x(e.x)}" cy="${y(Ly)-32}" r="12" fill="${BN.fill}" stroke="${BN.line}" stroke-width="1.2"/>`;
    ejes += `<text x="${x(e.x)}" y="${y(Ly)-28}" text-anchor="middle" font-size="11" font-weight="700" fill="${BN.txt}">${e.label}</text>`;
  });
  r.coordEjesY.forEach(e => {
    ejes += `<line x1="${x(0)-32}" y1="${y(e.y)}" x2="${x(Lx)+8}" y2="${y(e.y)}" stroke="${BN.line}" stroke-width="0.5" stroke-dasharray="4,3"/>`;
    ejes += `<circle cx="${x(0)-32}" cy="${y(e.y)}" r="12" fill="${BN.fill}" stroke="${BN.line}" stroke-width="1.2"/>`;
    ejes += `<text x="${x(0)-32}" y="${y(e.y)+4}" text-anchor="middle" font-size="11" font-weight="700" fill="${BN.txt}">${e.label}</text>`;
  });

  // Zapatas dibujadas según tipo, con columna interna
  let zapatas = "";
  const bc_m = (params.b_col_user || r.b_unif) / 100;
  let idxZap = 1;
  r.columnasEnPlanta.forEach(c => {
    const zap = c.tipo === "C" ? r.zap_C :
                c.tipo === "PX" ? r.zap_PX :
                c.tipo === "PY" ? r.zap_PY : r.zap_E;
    const L = zap.L;
    const Lp = L * s;
    const bcp = bc_m * s;
    // Zapata (rectángulo exterior)
    zapatas += `<rect x="${x(c.x)-Lp/2}" y="${y(c.y)-Lp/2}" width="${Lp}" height="${Lp}" fill="${BN.fill}" stroke="${BN.line}" stroke-width="1.4"/>`;
    // Hatching diagonal sutil
    zapatas += `<line x1="${x(c.x)-Lp/2}" y1="${y(c.y)-Lp/2}" x2="${x(c.x)+Lp/2}" y2="${y(c.y)+Lp/2}" stroke="${BN.hatch}" stroke-width="0.3" opacity="0.4"/>`;
    zapatas += `<line x1="${x(c.x)+Lp/2}" y1="${y(c.y)-Lp/2}" x2="${x(c.x)-Lp/2}" y2="${y(c.y)+Lp/2}" stroke="${BN.hatch}" stroke-width="0.3" opacity="0.4"/>`;
    // Columna interna (cuadrado pequeño centrado)
    zapatas += `<rect x="${x(c.x)-bcp/2}" y="${y(c.y)-bcp/2}" width="${bcp}" height="${bcp}" fill="${BN.line}" stroke="${BN.line}" stroke-width="1"/>`;
    // Etiqueta (Z-i)
    const tipoId = c.tipo === "C" ? 4 : c.tipo === "PX" ? 2 : c.tipo === "PY" ? 3 : 1;
    zapatas += `<text x="${x(c.x)+Lp/2+3}" y="${y(c.y)-Lp/2+10}" font-size="9" font-weight="700" fill="${BN.txt}">Z-${tipoId}</text>`;
    zapatas += `<text x="${x(c.x)+Lp/2+3}" y="${y(c.y)-Lp/2+22}" font-size="8" fill="${BN.txt}">${L.toFixed(2)}m</text>`;
  });

  // Contorno
  const contorno = `<rect x="${x(0)}" y="${y(Ly)}" width="${Lx*s}" height="${Ly*s}" fill="none" stroke="${BN.line}" stroke-width="0.8" stroke-dasharray="5,5"/>`;

  // Cotas
  let cotas = "";
  for (let i = 0; i < params.ejesX.length; i++) {
    const xMid = (r.coordEjesX[i].x + r.coordEjesX[i+1].x) / 2;
    cotas += `<text x="${x(xMid)}" y="${y(0)+22}" text-anchor="middle" font-size="9" fill="${BN.txt}">${params.ejesX[i].toFixed(2)} m</text>`;
  }
  for (let i = 0; i < params.ejesY.length; i++) {
    const yMid = (r.coordEjesY[i].y + r.coordEjesY[i+1].y) / 2;
    cotas += `<text x="${x(Lx)+24}" y="${y(yMid)+4}" text-anchor="middle" font-size="9" fill="${BN.txt}">${params.ejesY[i].toFixed(2)} m</text>`;
  }

  // Leyenda
  const leyenda = `
    <g transform="translate(${M-10}, ${H-46})">
      <rect x="0" y="0" width="${W-2*(M-10)}" height="34" fill="${BN.fill}" stroke="${BN.line}" stroke-width="0.6"/>
      <text x="12" y="14" font-size="10" font-weight="700" fill="${BN.txt}">PLANO DE CIMENTACIÓN</text>
      <text x="12" y="28" font-size="9" fill="${BN.txt}">Recubrimiento inferior 7.5 cm · Concreto f'c = ${params.fc} kgf/cm² · Acero fy = ${params.fy} kgf/cm² · NTE E.050-2018 / E.060-2009</text>
      <text x="${W/2}" y="14" text-anchor="middle" font-size="10" font-weight="700" fill="${BN.txt}">Z-1: Esquinera</text>
      <text x="${W/2-60}" y="28" font-size="9" fill="${BN.txt}">Z-2/Z-3: Perimetrales</text>
      <text x="${W/2+60}" y="28" font-size="9" fill="${BN.txt}">Z-4: Central</text>
    </g>
  `;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" style="max-width:100%;height:auto;background:#fff;">
    ${contorno}${ejes}${cotas}${zapatas}${leyenda}
  </svg>`;
}

// ═══════════════════════════════════════════════════════════════
// FIGURA · Detalles típicos (estribos, ganchos, anclajes)
// ═══════════════════════════════════════════════════════════════
export function svgDetallesTipicosInline(r) {
  const W = 720, H = 520;

  // Cuatro paneles 2×2: estribos 135°, gancho sísmico, empalme, anclaje
  const panelW = W/2 - 30, panelH = H/2 - 30;

  // PANEL 1 · Estribo cerrado a 135° (vista 3D simplificada)
  const p1 = `
    <g transform="translate(20, 20)">
      <rect x="0" y="0" width="${panelW}" height="${panelH}" fill="${BN.fill}" stroke="${BN.line}" stroke-width="0.8"/>
      <text x="${panelW/2}" y="20" text-anchor="middle" font-size="12" font-weight="700" fill="${BN.txt}">Estribo cerrado · ganchos 135°</text>
      <g transform="translate(${panelW/2-70}, 50)">
        <!-- estribo -->
        <rect x="0" y="0" width="140" height="100" fill="none" stroke="${BN.line}" stroke-width="2.2"/>
        <!-- ganchos a 135° -->
        <line x1="0" y1="0" x2="-14" y2="-14" stroke="${BN.line}" stroke-width="2.2"/>
        <line x1="-14" y1="-14" x2="-3" y2="-26" stroke="${BN.line}" stroke-width="2.2"/>
        <line x1="140" y1="100" x2="154" y2="114" stroke="${BN.line}" stroke-width="2.2"/>
        <line x1="154" y1="114" x2="143" y2="126" stroke="${BN.line}" stroke-width="2.2"/>
        <!-- cotas longitud gancho 6db -->
        <text x="-30" y="-28" font-size="9" fill="${BN.txt}">6·db</text>
        <text x="160" y="124" font-size="9" fill="${BN.txt}">6·db</text>
        <!-- ángulo -->
        <path d="M 0 0 A 18 18 0 0 1 -13 -13" fill="none" stroke="${BN.accent}" stroke-width="1"/>
        <text x="-22" y="-2" font-size="9" font-weight="700" fill="${BN.accent}">135°</text>
        <!-- diámetro -->
        <text x="70" y="55" text-anchor="middle" font-size="10" font-weight="700" fill="${BN.txt}">∅3/8"</text>
      </g>
      <text x="${panelW/2}" y="${panelH-10}" text-anchor="middle" font-size="9" fill="${BN.txt}">NTE E.060 §21.4.4.5 · longitud mínima del gancho: 6·db</text>
    </g>
  `;

  // PANEL 2 · Anclaje de barra con gancho
  const p2 = `
    <g transform="translate(${W/2+10}, 20)">
      <rect x="0" y="0" width="${panelW}" height="${panelH}" fill="${BN.fill}" stroke="${BN.line}" stroke-width="0.8"/>
      <text x="${panelW/2}" y="20" text-anchor="middle" font-size="12" font-weight="700" fill="${BN.txt}">Anclaje con gancho estándar a 90°</text>
      <g transform="translate(40, 60)">
        <!-- barra horizontal -->
        <line x1="0" y1="0" x2="240" y2="0" stroke="${BN.line}" stroke-width="2.6"/>
        <!-- curva gancho -->
        <path d="M 240 0 Q 260 0 260 20 L 260 80" fill="none" stroke="${BN.line}" stroke-width="2.6"/>
        <!-- cotas -->
        <line x1="0" y1="20" x2="240" y2="20" stroke="${BN.line}" stroke-width="0.5"/>
        <text x="120" y="35" text-anchor="middle" font-size="10" fill="${BN.txt}">Ldh ≥ 16·db</text>
        <line x1="265" y1="20" x2="265" y2="80" stroke="${BN.line}" stroke-width="0.5"/>
        <text x="278" y="55" font-size="10" fill="${BN.txt}">12·db</text>
        <!-- ángulo -->
        <path d="M 240 12 A 12 12 0 0 1 252 24" fill="none" stroke="${BN.accent}" stroke-width="1"/>
        <text x="252" y="20" font-size="9" font-weight="700" fill="${BN.accent}">90°</text>
      </g>
      <text x="${panelW/2}" y="${panelH-10}" text-anchor="middle" font-size="9" fill="${BN.txt}">ACI 318-19 §25.4.3 · longitud anclaje en zonas sísmicas</text>
    </g>
  `;

  // PANEL 3 · Empalme por traslape
  const p3 = `
    <g transform="translate(20, ${H/2+10})">
      <rect x="0" y="0" width="${panelW}" height="${panelH}" fill="${BN.fill}" stroke="${BN.line}" stroke-width="0.8"/>
      <text x="${panelW/2}" y="20" text-anchor="middle" font-size="12" font-weight="700" fill="${BN.txt}">Empalme por traslape · zona central</text>
      <g transform="translate(30, 70)">
        <!-- barra 1 -->
        <line x1="0" y1="-3" x2="180" y2="-3" stroke="${BN.line}" stroke-width="2.6"/>
        <!-- barra 2 (traslapada) -->
        <line x1="120" y1="3" x2="300" y2="3" stroke="${BN.line}" stroke-width="2.6"/>
        <!-- cota traslape -->
        <line x1="120" y1="-15" x2="180" y2="-15" stroke="${BN.line}" stroke-width="0.5"/>
        <line x1="120" y1="-18" x2="120" y2="-12" stroke="${BN.line}" stroke-width="0.5"/>
        <line x1="180" y1="-18" x2="180" y2="-12" stroke="${BN.line}" stroke-width="0.5"/>
        <text x="150" y="-22" text-anchor="middle" font-size="10" font-weight="700" fill="${BN.accent}">Lemp ≥ 60·db</text>
        <!-- estribos -->
        <line x1="40" y1="-15" x2="40" y2="15" stroke="${BN.hatch}" stroke-width="1.2"/>
        <line x1="80" y1="-15" x2="80" y2="15" stroke="${BN.hatch}" stroke-width="1.2"/>
        <line x1="220" y1="-15" x2="220" y2="15" stroke="${BN.hatch}" stroke-width="1.2"/>
        <line x1="260" y1="-15" x2="260" y2="15" stroke="${BN.hatch}" stroke-width="1.2"/>
      </g>
      <text x="${panelW/2}" y="${panelH-10}" text-anchor="middle" font-size="9" fill="${BN.txt}">NTE E.060 §12.16 · ubicar fuera de zonas confinadas Lo</text>
    </g>
  `;

  // PANEL 4 · Recubrimientos
  const p4 = `
    <g transform="translate(${W/2+10}, ${H/2+10})">
      <rect x="0" y="0" width="${panelW}" height="${panelH}" fill="${BN.fill}" stroke="${BN.line}" stroke-width="0.8"/>
      <text x="${panelW/2}" y="20" text-anchor="middle" font-size="12" font-weight="700" fill="${BN.txt}">Recubrimientos mínimos · NTE E.060 §7.7</text>
      <g transform="translate(40, 50)">
        <!-- losa -->
        <rect x="0" y="0" width="120" height="30" fill="${BN.fill}" stroke="${BN.line}" stroke-width="1.2"/>
        <text x="60" y="20" text-anchor="middle" font-size="9" font-weight="700">Losa</text>
        <text x="125" y="20" font-size="9" fill="${BN.txt}">2.0 cm</text>
        <!-- viga -->
        <rect x="0" y="50" width="120" height="50" fill="${BN.fill}" stroke="${BN.line}" stroke-width="1.2"/>
        <text x="60" y="80" text-anchor="middle" font-size="9" font-weight="700">Viga</text>
        <text x="125" y="80" font-size="9" fill="${BN.txt}">4.0 cm</text>
        <!-- columna -->
        <rect x="180" y="0" width="50" height="100" fill="${BN.fill}" stroke="${BN.line}" stroke-width="1.2"/>
        <text x="205" y="55" text-anchor="middle" font-size="9" font-weight="700">Col.</text>
        <text x="240" y="55" font-size="9" fill="${BN.txt}">4.0 cm</text>
        <!-- zapata -->
        <rect x="180" y="120" width="100" height="40" fill="${BN.fill}" stroke="${BN.line}" stroke-width="1.2"/>
        <text x="230" y="145" text-anchor="middle" font-size="9" font-weight="700">Zapata</text>
        <text x="285" y="145" font-size="9" fill="${BN.txt}">7.5 cm</text>
      </g>
      <text x="${panelW/2}" y="${panelH-10}" text-anchor="middle" font-size="9" fill="${BN.txt}">Recubrimiento al estribo más externo</text>
    </g>
  `;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" style="max-width:100%;height:auto;background:#fff;">
    ${p1}${p2}${p3}${p4}
  </svg>`;
}
