/**
 * svgFigures.jsx · Componentes SVG profesionales
 */
import React from "react";

const C = {
 primary:"#1E40AF", secondary:"#3B82F6", lblue:"#DBEAFE", bg:"#F8FAFC",
 gray:"#64748B", lgray:"#CBD5E0", dark:"#0F172A",
 red:"#DC2626", green:"#059669", orange:"#EA580C", hatch:"#94A3B8",
};
const fv = (v,d=2) => Number(v).toFixed(d);
const radBar = (d_mm, sc) => Math.min(Math.max((d_mm/10)*sc*0.40, 0.9), 4.0);

const TM = ({x,y,t,fs=8,fill="#1E40AF",anchor="middle",bold=false}) => {
 const w = String(t).length * fs * 0.60 + 4;
 const rx = anchor==="middle" ? x-w/2 : anchor==="end" ? x-w : x;
 return (
 <g>
 <rect x={rx-2} y={y-fs-1} width={w+4} height={fs+3} fill="white" fillOpacity={0.93} rx={2}/>
 <text x={x} y={y} textAnchor={anchor} fontSize={fs} fontWeight={bold?"700":"400"} fill={fill} fontFamily="Arial">{t}</text>
 </g>
 );
};

const Hatch = ({id, col=C.hatch, size=6, sw=0.4}) => (
 <defs>
 <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
 <line x1="0" y1="0" x2="0" y2={size} stroke={col} strokeWidth={sw}/>
 </pattern>
 </defs>
);

// ════════════════════════════════════════════════════════════
// PLANO ARQUITECTÓNICO CON EJES · ESTILO AUTOCAD
// ════════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════
// PLANO ARQUITECTÓNICO CON EJES · v12 sin solapes
// ════════════════════════════════════════════════════════════
export function SvgPlantaEjes({coordEjesX, coordEjesY, columnas, Lx_total, Ly_total,
  Lw_placa, tw, b_unif, escalera_pos, mostrarPlacas=true}) {
  // ViewBox amplio para evitar solapes
  const Wv = 900, Hv = 680;
  const margenIzq = 120;
  const margenDer = 120;
  const margenSup = 110;
  const margenInf = 150;
  const dispW = Wv - margenIzq - margenDer;
  const dispH = Hv - margenSup - margenInf;
  const scX = dispW / Lx_total;
  const scY = dispH / Ly_total;
  const sc = Math.min(scX, scY);
  const planoW = Lx_total * sc;
  const planoH = Ly_total * sc;
  const offsetX = (dispW - planoW) / 2;
  const offsetY = (dispH - planoH) / 2;
  const planoLeft = margenIzq + offsetX;
  const planoRight = planoLeft + planoW;
  const planoTop = margenSup + offsetY;
  const planoBottom = planoTop + planoH;
  const px = (x) => planoLeft + x * sc;
  const py = (y) => planoBottom - y * sc;

  const b_col_m = (b_unif || 35) / 100;
  const b_col_px = Math.max(b_col_m * sc, 8);

  const Lw = Lw_placa || 4;
  const placas = mostrarPlacas ? [
    {x1: Lx_total/2 - Lw/2, y1: 0, x2: Lx_total/2 + Lw/2, y2: 0, tipo:"H"},
    {x1: Lx_total/2 - Lw/2, y1: Ly_total, x2: Lx_total/2 + Lw/2, y2: Ly_total, tipo:"H"},
    {x1: 0, y1: Ly_total/2 - Lw/2, x2: 0, y2: Ly_total/2 + Lw/2, tipo:"V"},
    {x1: Lx_total, y1: Ly_total/2 - Lw/2, x2: Lx_total, y2: Ly_total/2 + Lw/2, tipo:"V"},
  ] : [];

  const yCotaSup = planoTop - 50;
  const yLabelCota = planoTop - 56;
  const yBurbujaSup = planoTop - 24;
  const yBurbujaInf = planoBottom + 24;
  const xCotaDer = planoRight + 50;
  const xLabelCotaDer = planoRight + 56;
  const xBurbujaIzq = planoLeft - 24;
  const xBurbujaDer = planoRight + 24;

  return (
    <svg viewBox={`0 0 ${Wv} ${Hv}`} style={{width:"100%", height:"auto", background:"#FFFEF7", border:`1px solid ${C.lgray}`}}>
      <Hatch id="hatchPlanta" col="#A0AEC0" size={4} sw={0.3}/>

      {/* Marco exterior */}
      <rect x={20} y={20} width={Wv-40} height={Hv-40} fill="none" stroke="#000" strokeWidth={1.4}/>
      <rect x={26} y={26} width={Wv-52} height={Hv-52} fill="none" stroke="#000" strokeWidth={0.6}/>

      {/* Cuadro de título */}
      <rect x={26} y={26} width={Wv-52} height={56} fill="#F5F8FB" stroke="#000" strokeWidth={0.5}/>
      <text x={Wv/2} y={48} textAnchor="middle" fontSize={14} fontWeight={700} fill="#000" fontFamily="Arial">
        PLANTA TÍPICA · DISTRIBUCIÓN DE EJES Y COLUMNAS
      </text>
      <text x={Wv/2} y={66} textAnchor="middle" fontSize={10} fontStyle="italic" fill="#444" fontFamily="Arial">
        Edificación de {Lx_total.toFixed(2)} m × {Ly_total.toFixed(2)} m · {coordEjesX.length} ejes en X · {coordEjesY.length} ejes en Y
      </text>

      {/* Área del plano */}
      <rect x={planoLeft} y={planoTop} width={planoW} height={planoH}
        fill="#FAFCFF" stroke={C.primary} strokeWidth={2}/>

      {/* Líneas de ejes */}
      {coordEjesX.map((e, i) => (
        <line key={`exL${i}`} x1={px(e.x)} y1={planoTop - 14} x2={px(e.x)} y2={planoBottom + 14}
          stroke="#666" strokeWidth={0.5} strokeDasharray="3,2"/>
      ))}
      {coordEjesY.map((e, i) => (
        <line key={`eyL${i}`} x1={planoLeft - 14} y1={py(e.y)} x2={planoRight + 14} y2={py(e.y)}
          stroke="#666" strokeWidth={0.5} strokeDasharray="3,2"/>
      ))}

      {/* Burbujas X */}
      {coordEjesX.map((e, i) => (
        <g key={`exB${i}`}>
          <circle cx={px(e.x)} cy={yBurbujaSup} r={11} fill="white" stroke="#000" strokeWidth={1.4}/>
          <text x={px(e.x)} y={yBurbujaSup + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill="#000" fontFamily="Arial">{e.label}</text>
          <circle cx={px(e.x)} cy={yBurbujaInf} r={11} fill="white" stroke="#000" strokeWidth={1.4}/>
          <text x={px(e.x)} y={yBurbujaInf + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill="#000" fontFamily="Arial">{e.label}</text>
        </g>
      ))}
      {/* Burbujas Y */}
      {coordEjesY.map((e, i) => (
        <g key={`eyB${i}`}>
          <circle cx={xBurbujaIzq} cy={py(e.y)} r={11} fill="white" stroke="#000" strokeWidth={1.4}/>
          <text x={xBurbujaIzq} y={py(e.y) + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill="#000" fontFamily="Arial">{e.label}</text>
          <circle cx={xBurbujaDer} cy={py(e.y)} r={11} fill="white" stroke="#000" strokeWidth={1.4}/>
          <text x={xBurbujaDer} y={py(e.y) + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill="#000" fontFamily="Arial">{e.label}</text>
        </g>
      ))}

      {/* Cotas entre ejes X */}
      {coordEjesX.slice(0, -1).map((e, i) => {
        const next = coordEjesX[i+1];
        const xMid = (e.x + next.x) / 2;
        const sep = next.x - e.x;
        return (
          <g key={`cx${i}`}>
            <line x1={px(e.x)} y1={yCotaSup} x2={px(next.x)} y2={yCotaSup} stroke="#000" strokeWidth={0.5}/>
            <line x1={px(e.x)} y1={yCotaSup - 4} x2={px(e.x)} y2={yCotaSup + 4} stroke="#000" strokeWidth={0.5}/>
            <line x1={px(next.x)} y1={yCotaSup - 4} x2={px(next.x)} y2={yCotaSup + 4} stroke="#000" strokeWidth={0.5}/>
            <text x={px(xMid)} y={yLabelCota} textAnchor="middle" fontSize={10} fontWeight={600} fill="#000" fontFamily="Arial">{sep.toFixed(2)}</text>
          </g>
        );
      })}
      {/* Cotas entre ejes Y */}
      {coordEjesY.slice(0, -1).map((e, i) => {
        const next = coordEjesY[i+1];
        const yMid = (e.y + next.y) / 2;
        const sep = next.y - e.y;
        return (
          <g key={`cy${i}`}>
            <line x1={xCotaDer} y1={py(e.y)} x2={xCotaDer} y2={py(next.y)} stroke="#000" strokeWidth={0.5}/>
            <line x1={xCotaDer - 4} y1={py(e.y)} x2={xCotaDer + 4} y2={py(e.y)} stroke="#000" strokeWidth={0.5}/>
            <line x1={xCotaDer - 4} y1={py(next.y)} x2={xCotaDer + 4} y2={py(next.y)} stroke="#000" strokeWidth={0.5}/>
            <text x={xLabelCotaDer} y={py(yMid) + 4} textAnchor="start" fontSize={10} fontWeight={600} fill="#000" fontFamily="Arial">{sep.toFixed(2)}</text>
          </g>
        );
      })}

      {/* Dimensiones totales */}
      <text x={(planoLeft + planoRight)/2} y={planoTop - 80} textAnchor="middle" fontSize={11} fontWeight={700} fill={C.primary} fontFamily="Arial">
        L total X = {Lx_total.toFixed(2)} m
      </text>
      <text
        x={planoRight + 90}
        y={(planoTop + planoBottom)/2}
        textAnchor="middle"
        fontSize={11}
        fontWeight={700}
        fill={C.primary}
        fontFamily="Arial"
        transform={`rotate(90 ${planoRight + 90} ${(planoTop + planoBottom)/2})`}
      >
        L total Y = {Ly_total.toFixed(2)} m
      </text>

      {/* Placas */}
      {placas.map((pl, i) => {
        if (pl.tipo === "H") {
          const x1p = px(pl.x1), x2p = px(pl.x2), yp = py(pl.y1);
          return <rect key={`pl${i}`} x={x1p} y={yp-4} width={x2p-x1p} height={8} fill={C.orange} stroke="#000" strokeWidth={0.6}/>;
        } else {
          const xp = px(pl.x1), y1p = py(pl.y2), y2p = py(pl.y1);
          return <rect key={`pl${i}`} x={xp-4} y={y1p} width={8} height={y2p-y1p} fill={C.orange} stroke="#000" strokeWidth={0.6}/>;
        }
      })}

      {/* Vigas (líneas punteadas) */}
      {coordEjesX.map((eX, ix) => coordEjesY.slice(0,-1).map((eY, iy) => {
        const next = coordEjesY[iy+1];
        return <line key={`vy${ix}${iy}`} x1={px(eX.x)} y1={py(eY.y)} x2={px(eX.x)} y2={py(next.y)} stroke="#999" strokeWidth={0.5} strokeDasharray="2,2" opacity={0.7}/>;
      }))}
      {coordEjesY.map((eY, iy) => coordEjesX.slice(0,-1).map((eX, ix) => {
        const next = coordEjesX[ix+1];
        return <line key={`vx${ix}${iy}`} x1={px(eX.x)} y1={py(eY.y)} x2={px(next.x)} y2={py(eY.y)} stroke="#999" strokeWidth={0.5} strokeDasharray="2,2" opacity={0.7}/>;
      }))}

      {/* Columnas */}
      {(columnas || []).map((c, i) => {
        const cx = px(c.x);
        const cy = py(c.y);
        const fill =
          c.tipo === "C" ? "#1E40AF" :
          c.tipo === "E" ? "#EA580C" : "#3B82F6";
        return (
          <g key={`col${i}`}>
            <rect
              x={cx - b_col_px/2} y={cy - b_col_px/2}
              width={b_col_px} height={b_col_px}
              fill={fill} fillOpacity={0.8}
              stroke="#000" strokeWidth={0.7}
            />
            <text x={cx} y={cy+3} textAnchor="middle" fontSize={6.5} fontWeight={700} fill="white" fontFamily="Arial">
              {c.id}
            </text>
          </g>
        );
      })}

      {/* Leyenda al pie */}
      <g transform={`translate(${margenIzq}, ${Hv - 70})`}>
        <rect x={0} y={0} width={Wv - margenIzq - margenDer} height={44} fill="white" stroke="#000" strokeWidth={0.6} rx={3}/>
        <text x={14} y={26} fontSize={12} fontWeight={700} fill="#000" fontFamily="Arial">LEYENDA</text>
        <rect x={100} y={15} width={16} height={16} fill="#1E40AF" fillOpacity={0.8} stroke="#000" strokeWidth={0.5}/>
        <text x={122} y={27} fontSize={11} fill="#000" fontFamily="Arial">Central</text>
        <rect x={200} y={15} width={16} height={16} fill="#3B82F6" fillOpacity={0.8} stroke="#000" strokeWidth={0.5}/>
        <text x={222} y={27} fontSize={11} fill="#000" fontFamily="Arial">Perimetral</text>
        <rect x={320} y={15} width={16} height={16} fill="#EA580C" fillOpacity={0.8} stroke="#000" strokeWidth={0.5}/>
        <text x={342} y={27} fontSize={11} fill="#000" fontFamily="Arial">Esquinera</text>
        <rect x={430} y={18} width={26} height={10} fill={C.orange} stroke="#000" strokeWidth={0.5}/>
        <text x={462} y={27} fontSize={11} fill="#000" fontFamily="Arial">Placa</text>
        <line x1={530} y1={23} x2={560} y2={23} stroke="#999" strokeWidth={1.4} strokeDasharray="3,2"/>
        <text x={566} y={27} fontSize={11} fill="#000" fontFamily="Arial">Viga</text>
        <text x={650} y={20} fontSize={10} fill="#000" fontFamily="Arial">Cotas en metros</text>
        <text x={650} y={34} fontSize={10} fontStyle="italic" fill="#555" fontFamily="Arial">Escala según viewport</text>
      </g>
    </svg>
  );
}

export function SvgViga({b, h, var_inf, var_sup, s_conf, label, ok}) {
 const W=210, H=170;
 const sc = Math.min(140/(b*100), 110/(h*100), 3.0);
 const bp = b*100*sc, hp = h*100*sc;
 const x0 = (W-bp)/2, y0 = 22;
 const cov = 4*sc;
 const ni = Math.min(var_inf.n, 6);
 const ns = 2;
 const spI = ni>1 ? (bp-2*cov)/(ni-1) : 0;
 const spS = ns>1 ? (bp-2*cov)/(ns-1) : 0;

 return (
 <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"auto",maxHeight:H}}>
 <Hatch id="vhV"/>
 <TM x={W/2} y={14} t={label} fs={9.5} bold/>
 <rect x={x0} y={y0} width={bp} height={hp} fill={C.lblue} stroke={C.primary} strokeWidth={1.5}/>
 <rect x={x0} y={y0} width={bp} height={hp} fill="url(#vhV)" opacity={0.5}/>
 <rect x={x0+cov*0.5} y={y0+cov*0.5} width={bp-cov} height={hp-cov}
 fill="none" stroke={C.orange} strokeWidth={1.2} rx={2}/>
 {Array.from({length:ni},(_,i)=>(
 <circle key={`i${i}`} cx={ni===1?x0+bp/2:x0+cov+i*spI} cy={y0+hp-cov}
 r={radBar(var_inf.d, sc)} fill={C.primary} stroke="#111" strokeWidth={0.4}/>
 ))}
 {Array.from({length:ns},(_,i)=>(
 <circle key={`s${i}`} cx={x0+cov+i*spS} cy={y0+cov}
 r={radBar(9.5, sc)} fill={C.gray} stroke="#111" strokeWidth={0.4}/>
 ))}
 <line x1={x0+bp/2} y1={y0-3} x2={x0+bp/2} y2={y0+hp+3}
 stroke={C.red} strokeWidth={0.4} strokeDasharray="4,2"/>
 <TM x={x0+bp/2} y={y0+hp+18} t={`b=${fv(b*100,0)}cm`} fs={8} fill={C.gray}/>
 <TM x={x0-8} y={y0+hp/2+3} t={`h=${fv(h*100,0)}cm`} fs={8} fill={C.gray} anchor="end"/>
 <TM x={W/2} y={H-25} t={`${var_inf.n}${var_inf.nom} · As=${var_inf.As_tot.toFixed(2)}cm²`} fs={8} fill={C.primary} bold/>
 <TM x={W/2} y={H-11} t={`s_conf ≈ ${fv(s_conf*100,1)}cm`} fs={7.5} fill={C.orange}/>
 {ok!==undefined && (
 <g>
 <rect x={W-58} y={2} width={54} height={14} fill={ok?C.green:C.red} rx={3}/>
 <text x={W-31} y={12} textAnchor="middle" fontSize={8} fontWeight="700" fill="white" fontFamily="Arial">{ok?"✓ OK":"✗ REV."}</text>
 </g>
 )}
 </svg>
 );
}

// ════════════════════════════════════════════════════════════
// COLUMNA SECCIÓN
// ════════════════════════════════════════════════════════════
export function SvgColumna({b, varilla, s_conf, Lo, rho, label, ok, Pu, At}) {
 const W=180, H=180;
 const sc = Math.min(100/b, 2.2);
 const bp = b*sc;
 const x0 = (W-bp)/2, y0 = 22;
 const cov = 4*sc;
 const nSide = varilla.n;
 const bars = [];
 for (let i=0; i<=nSide; i++) {
 const t = i/nSide;
 bars.push([x0+cov+t*(bp-2*cov), y0+cov]);
 bars.push([x0+cov+t*(bp-2*cov), y0+bp-cov]);
 if (i>0 && i<nSide) {
 bars.push([x0+cov, y0+cov+t*(bp-2*cov)]);
 bars.push([x0+bp-cov, y0+cov+t*(bp-2*cov)]);
 }
 }
 return (
 <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"auto",maxHeight:H}}>
 <Hatch id={`vhC${label.replace(/[^a-z]/gi,"")}`}/>
 <TM x={W/2} y={13} t={label} fs={9.5} bold/>
 <rect x={x0} y={y0} width={bp} height={bp} fill={C.lblue} stroke={C.primary} strokeWidth={1.5}/>
 <rect x={x0} y={y0} width={bp} height={bp} fill={`url(#vhC${label.replace(/[^a-z]/gi,"")})`} opacity={0.5}/>
 <rect x={x0+cov*0.4} y={y0+cov*0.4} width={bp-cov*0.8} height={bp-cov*0.8}
 fill="none" stroke={C.orange} strokeWidth={1.3} rx={2}/>
 {bars.map(([cx,cy],i)=>(
 <circle key={i} cx={cx} cy={cy} r={radBar(varilla.d, sc)} fill={C.primary} stroke="#111" strokeWidth={0.4}/>
 ))}
 <TM x={x0+bp/2} y={y0+bp+14} t={`${b}×${b} cm`} fs={8.5} fill={C.gray} bold/>
 <TM x={x0+bp/2} y={H-32} t={`${varilla.n*4}${varilla.nom}`} fs={8} fill={C.primary} bold/>
 <TM x={x0+bp/2} y={H-19} t={`ρ=${(rho*100).toFixed(2)}%`} fs={7.5} fill={C.gray}/>
 {At !== undefined && <TM x={x0+bp/2} y={H-7} t={`At=${At}m² Pu=${fv(Pu,1)}tf`} fs={7} fill={C.gray}/>}
 {ok!==undefined && (
 <g>
 <rect x={W-58} y={2} width={54} height={14} fill={ok?C.green:C.red} rx={3}/>
 <text x={W-31} y={12} textAnchor="middle" fontSize={8} fontWeight="700" fill="white" fontFamily="Arial">{ok?"✓ OK":"✗ REV."}</text>
 </g>
 )}
 </svg>
 );
}

// ════════════════════════════════════════════════════════════
// LOSA ALIGERADA
// ════════════════════════════════════════════════════════════
export function SvgLosa({h, var_losa, label="Losa Aligerada"}) {
 const W=320, H=130;
 const sc = Math.min(70/(h*100), 3.5);
 const hp = h*100*sc;
 const hmp = hp*0.25;
 const x0 = 30, y0 = 30;
 const totalW = W-60;
 const nVig = 5, sp = totalW/nVig, vw = 9;
 return (
 <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"auto",maxHeight:H}}>
 <Hatch id="vhLa"/>
 <TM x={W/2} y={14} t={`${label} · h=${(h*100).toFixed(0)}cm`} fs={9.5} bold/>
 <rect x={x0} y={y0} width={totalW} height={hmp} fill={C.lblue} stroke={C.primary} strokeWidth={1.2}/>
 <rect x={x0} y={y0} width={totalW} height={hmp} fill="url(#vhLa)" opacity={0.5}/>
 {Array.from({length:nVig-1},(_,i)=>{
 const bx = x0+i*sp+vw+3;
 return <rect key={i} x={bx} y={y0+hmp} width={sp-vw-6} height={hp-hmp}
 fill="#E2E0D5" stroke="#A89878" strokeWidth={0.7}/>;
 })}
 {Array.from({length:nVig},(_,i)=>{
 const vx = x0+i*sp;
 return (
 <g key={i}>
 <rect x={vx} y={y0+hmp} width={vw} height={hp-hmp}
 fill={C.lblue} stroke={C.primary} strokeWidth={0.8}/>
 <circle cx={vx+vw/2} cy={y0+hp-4} r={radBar(var_losa.d, sc)} fill={C.primary}/>
 </g>
 );
 })}
 <TM x={x0-6} y={y0+hp/2+3} t={`${(h*100).toFixed(0)}cm`} fs={7.5} fill={C.gray} anchor="end"/>
 <TM x={W/2} y={H-8} t={`${var_losa.n}${var_losa.nom}/vigueta · As=${var_losa.As_tot.toFixed(2)}cm²`}
 fs={8} fill={C.primary} bold/>
 </svg>
 );
}

// ════════════════════════════════════════════════════════════
// ZAPATA
// ════════════════════════════════════════════════════════════
export function SvgZapata({L, hz, bc, d, nvar, sep, var_z, qu, punz_ok, label="Zapata", Pu}) {
 const W=320, H=200;
 const sc = Math.min(120/(L*100), 50/(hz*100), 2.0);
 const Lp = L*100*sc;
 const hp = Math.min(hz*100*sc, 40);
 const bcp = Math.max(bc*100*sc, 14);
 const x0 = (W-Lp)/2, y0 = 50;
 const by = y0+hp;
 const col_h = 28;
 const dPx = d*100*sc;
 const critOffset = dPx/2;
 const nBars = Math.min(nvar, 8);
 const cov = 4;
 const rb = radBar(var_z.d, sc);

 return (
 <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"auto",maxHeight:H}}>
 <Hatch id="vhZ"/>
 <TM x={W/2} y={13} t={`Zapata ${label} · ${fv(L,2)}×${fv(L,2)} m × hz=${fv(hz,2)} m`} fs={9} bold/>
 <rect x="0" y={by+2} width={W} height={12} fill="#D4B896" opacity={0.5}/>
 {Array.from({length:7},(_,i)=>{
 const px_ = x0+(i+0.5)*Lp/7;
 return <line key={i} x1={px_} y1={by+2} x2={px_} y2={by+15} stroke={C.secondary} strokeWidth={1.1}/>;
 })}
 <rect x={x0} y={y0} width={Lp} height={hp} fill={C.lblue} stroke={C.primary} strokeWidth={1.5}/>
 <rect x={x0} y={y0} width={Lp} height={hp} fill="url(#vhZ)" opacity={0.4}/>
 <line x1={x0+cov} y1={y0+hp-cov} x2={x0+Lp-cov} y2={y0+hp-cov}
 stroke={C.primary} strokeWidth={rb*0.6} strokeLinecap="round" opacity={0.5}/>
 {Array.from({length:nBars},(_,i)=>{
 const cx = x0+cov+i*(Lp-2*cov)/Math.max(nBars-1,1);
 return <circle key={i} cx={cx} cy={y0+hp-cov} r={rb} fill={C.primary}/>;
 })}
 <rect x={W/2-bcp/2-critOffset} y={y0-1} width={bcp+dPx} height={hp*0.8}
 fill="none" stroke={C.red} strokeWidth={0.8} strokeDasharray="4,2"/>
 <rect x={W/2-bcp/2} y={y0-col_h} width={bcp} height={col_h} fill={C.lblue} stroke={C.primary} strokeWidth={1.3}/>
 <TM x={W/2+8} y={y0-col_h-6} t={`Pu=${fv(Pu,1)}tf`} fs={7} fill={C.dark} anchor="start" bold/>
 <TM x={W/2} y={y0-4} t={`L = ${fv(L,2)} m`} fs={7.5} fill={C.gray}/>
 <TM x={x0-4} y={y0+hp/2+3} t={`hz=${fv(hz,2)}`} fs={7} fill={C.gray} anchor="end"/>
 <TM x={W/2} y={by+25} t={`qu = ${fv(qu,2)} tf/m²`} fs={7.5} fill={C.secondary}/>
 <text x={W/2} y={H-8} textAnchor="middle" fontSize={7.5} fontWeight="700" fill={C.primary} fontFamily="Arial">
 {nvar}{var_z.nom} @ {fv(sep,1)}cm c/dir.
 </text>
 <rect x={W-60} y={2} width={56} height={14} fill={punz_ok?C.green:C.red} rx={3}/>
 <text x={W-32} y={12} textAnchor="middle" fontSize={8} fontWeight="700" fill="white" fontFamily="Arial">{punz_ok?"✓ OK":"✗ REVISAR"}</text>
 </svg>
 );
}

// ════════════════════════════════════════════════════════════
// PLACA
// ════════════════════════════════════════════════════════════
export function SvgPlaca({tw, Lw, Av, ok}) {
 const W=310, H=130;
 const Lpx = Math.min(Lw*40, 240);
 const twpx = Math.max(tw*200, 22);
 const x0 = (W-Lpx)/2, y0 = 30;
 const bcp = Math.min(twpx*1.1, 28);
 return (
 <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"auto",maxHeight:H}}>
 <Hatch id="vhP"/>
 <TM x={W/2} y={14} t={`Muro · tw=${fv(tw,2)}m / Lw=${fv(Lw,2)}m`} fs={9.5} bold/>
 <rect x={x0} y={y0} width={Lpx} height={twpx} fill={C.lblue} stroke={C.primary} strokeWidth={1.5}/>
 <rect x={x0} y={y0} width={Lpx} height={twpx} fill="url(#vhP)" opacity={0.4}/>
 {[0.30,0.70].map((t,k)=>(
 <line key={k} x1={x0+4} y1={y0+twpx*t} x2={x0+Lpx-4} y2={y0+twpx*t}
 stroke={C.primary} strokeWidth={1.1} strokeDasharray="5,2" opacity={0.6}/>
 ))}
 <rect x={x0} y={y0} width={bcp} height={twpx} fill={C.orange} fillOpacity={0.15} stroke={C.orange} strokeWidth={1.5}/>
 <rect x={x0+Lpx-bcp} y={y0} width={bcp} height={twpx} fill={C.orange} fillOpacity={0.15} stroke={C.orange} strokeWidth={1.5}/>
 <TM x={W/2} y={y0+twpx+18} t={`Lw = ${fv(Lw,2)} m`} fs={8} fill={C.gray}/>
 <TM x={x0-4} y={y0+twpx/2+3} t={`tw=${fv(tw,2)}`} fs={7} fill={C.gray} anchor="end"/>
 <TM x={W/2} y={H-12} t={`Av = ${fv(Av,2)} cm²/m | bordes confinados`} fs={7.5} fill={C.primary}/>
 <rect x={W-60} y={2} width={56} height={14} fill={ok?C.green:C.red} rx={3}/>
 <text x={W-32} y={12} textAnchor="middle" fontSize={8} fontWeight="700" fill="white" fontFamily="Arial">{ok?"✓ OK":"✗ REV."}</text>
 </svg>
 );
}

// ════════════════════════════════════════════════════════════
// ESCALERA
// ════════════════════════════════════════════════════════════
export function SvgEscalera({LH, hpiso, n_cp, alpha, t_esc, var_esc, ok}) {
 const W=300, H=180;
 const sc = Math.min((W-60)/LH, (H-50)/hpiso)*0.85;
 const ox = 35, oy = H-28;
 const ex = LH*sc, ey = hpiso*sc;
 const tpx = t_esc*sc*2.5;
 const sinA = Math.sin(alpha*Math.PI/180);
 const cosA = Math.cos(alpha*Math.PI/180);
 const dx = -sinA*tpx, dy = -cosA*tpx;
 return (
 <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"auto",maxHeight:H}}>
 <Hatch id="vhE"/>
 <TM x={W/2} y={14} t={`Escalera · ${n_cp} contrapasos · α=${fv(alpha,1)}°`} fs={9.5} bold/>
 <polygon points={`${ox},${oy} ${ox+ex},${oy-ey} ${ox+ex+dx},${oy-ey+dy} ${ox+dx},${oy+dy}`}
 fill={C.lblue} stroke={C.primary} strokeWidth={1.2}/>
 {Array.from({length:n_cp},(_,i)=>{
 const px = ox+i*(ex/n_cp), py = oy-i*(ey/n_cp);
 const pw = ex/n_cp, ph = ey/n_cp;
 return (
 <g key={i}>
 <line x1={px} y1={py} x2={px+pw} y2={py} stroke={C.primary} strokeWidth={1.1}/>
 <line x1={px+pw} y1={py} x2={px+pw} y2={py-ph} stroke={C.primary} strokeWidth={1.1}/>
 </g>
 );
 })}
 <line x1={ox+dx*0.3} y1={oy+dy*0.3} x2={ox+ex+dx*0.3} y2={oy-ey+dy*0.3}
 stroke={C.primary} strokeWidth={radBar(var_esc.d, sc)*0.6} strokeLinecap="round"/>
 <TM x={ox+ex/2} y={oy+18} t={`LH=${fv(LH,2)}m`} fs={8} fill={C.gray}/>
 <TM x={ox+ex+20} y={oy-ey/2} t={`hf=${fv(hpiso,2)}m`} fs={8} fill={C.gray} anchor="start"/>
 <TM x={W/2} y={H-7} t={`${var_esc.n}${var_esc.nom} · t=${fv(t_esc,2)}m`} fs={7.5} fill={C.primary} bold/>
 <rect x={W-60} y={2} width={56} height={14} fill={ok?C.green:C.red} rx={3}/>
 <text x={W-32} y={12} textAnchor="middle" fontSize={8} fontWeight="700" fill="white" fontFamily="Arial">{ok?"✓ OK":"✗ REV."}</text>
 </svg>
 );
}
