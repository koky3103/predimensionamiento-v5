/**
 * svgToPng.js · Convierte SVG (string) a PNG (Uint8Array)
 * Para embebder figuras vectoriales en archivos .docx
 */

export async function svgStringToPng(svgString, width = 800, height = 600) {
  return new Promise((resolve, reject) => {
    try {
      // Asegurar dimensiones absolutas en el SVG
      let svg = svgString;
      if (!/width\s*=/.test(svg.slice(0, 200))) {
        svg = svg.replace("<svg ", `<svg width="${width}" height="${height}" `);
      }
      // Calidad de exportación (2x para retina)
      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext("2d");
      ctx.scale(scale, scale);
      // Fondo blanco
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      // Convertir SVG a data URL
      const blob = new Blob([svg], {type: "image/svg+xml;charset=utf-8"});
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        canvas.toBlob(async (pngBlob) => {
          if (!pngBlob) { reject(new Error("Canvas toBlob failed")); return; }
          const arrayBuffer = await pngBlob.arrayBuffer();
          resolve({
            data: new Uint8Array(arrayBuffer),
            width: width,
            height: height,
          });
        }, "image/png");
      };
      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(err);
      };
      img.src = url;
    } catch (err) {
      reject(err);
    }
  });
}

// Convertir múltiples SVGs en paralelo, con fallback si falla alguno
export async function convertSvgs(svgs) {
  const out = {};
  await Promise.all(Object.entries(svgs).map(async ([k, v]) => {
    if (!v) return;
    try {
      const {svg, w, h} = v;
      out[k] = await svgStringToPng(svg, w, h);
    } catch (err) {
      console.warn(`Fallo conversión SVG → PNG (${k}):`, err);
      out[k] = null;
    }
  }));
  return out;
}
