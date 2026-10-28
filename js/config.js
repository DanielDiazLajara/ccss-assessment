// ─────────────────────────────────────────────
// Branding Configuration
// Edita este fichero para adaptar la herramienta a tu organización.
// ─────────────────────────────────────────────

const BRANDING = {

  // Nombre de la empresa mostrado en cabecera, barra lateral y PDF.
  companyName: 'CCSS v9.0',

  // URL del logotipo (PNG, SVG, WebP…). Deja null para usar el icono por defecto.
  // Ejemplo: logoUrl: 'assets/logo.png'
  logoUrl: null,

  // Colores corporativos. Solo cambia los que necesites (valores hex).
  colors: {
    primary: '#2f6fde',  // Botones, gráfico Nivel I, enlaces
    success: '#1a9b6c',  // Controles "Implantado" y gráfico Nivel II
    warning: '#d48a0b',  // Controles "Parcial"
    danger:  '#d64545',  // Controles "No implantado"
  },

};

// ── Utilidad hex → rgba (disponible globalmente para report.js) ─────────────
function hexToRgba(hex, alpha) {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  return m
    ? `rgba(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)},${alpha})`
    : `rgba(0,0,0,${alpha})`;
}

// ── Aplica colores a las variables CSS antes del primer render ──────────────
(function () {
  const root = document.documentElement;
  const { primary, success, warning, danger } = BRANDING.colors;

  if (primary) {
    root.style.setProperty('--primary', primary);
    root.style.setProperty('--primary-glow', hexToRgba(primary, 0.18));
  }
  if (success) root.style.setProperty('--success', success);
  if (warning) root.style.setProperty('--warning', warning);
  if (danger)  root.style.setProperty('--danger',  danger);
}());
