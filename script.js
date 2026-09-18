/* =========================================================
   CONFIGURACIÓN GENERAL
========================================================= */

const CONFIG = {
  PLANTILLA_PRINCIPAL: 'plantilla.png',
  PLANTILLA_FALLBACK: 'CULTO DE.png',
  STORAGE_DATOS: 'liturgiaDataV2',
  STORAGE_DISENO: 'liturgiaDesignV2',
  STORAGE_TEMA: 'liturgiaTheme',
  DIA_PERMITIDO: 6,
  MOVIMIENTO: 5
};

/* =========================================================
   REFERENCIAS
========================================================= */

const canvas = document.getElementById('canvasLiturgia');
const ctx = canvas.getContext('2d');
const form = document.getElementById('liturgiaForm');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const btnExportar = document.getElementById('btnExportar');
const btnWhatsapp = document.getElementById('btnWhatsapp');
const btnMobileShare = document.getElementById('btnMobileShare');
const previewEmpty = document.getElementById('previewEmpty');
const previewStatus = document.getElementById('previewStatus');
const inputFecha = document.getElementById('fecha');
const fechaHint = document.getElementById('fechaHint');
const camposRequeridos = Array.from(
  document.querySelectorAll('#liturgiaForm input[required]')
);
const designerPanel = document.getElementById('designerPanel');
const designerBtn = document.getElementById('btnDesigner');
const designerPreviewBtn = document.getElementById('btnDesignerPreview');

/* =========================================================
   VERIFICACIÓN DE MODO ADMINISTRADOR (?admin=true)
========================================================= */

const urlParams = new URLSearchParams(window.location.search);
const isAdmin = urlParams.get('admin') === 'true';

/* =========================================================
   PLANTILLA
========================================================= */

const plantilla = new Image();
let plantillaCargada = false;
let intentoFallback = false;

plantilla.onload = () => {
  plantillaCargada = true;
  canvas.width = plantilla.naturalWidth;
  canvas.height = plantilla.naturalHeight;
  actualizarVistaPrevia();
};

plantilla.onerror = () => {
  if (!intentoFallback) {
    intentoFallback = true;
    plantilla.src = CONFIG.PLANTILLA_FALLBACK;
  } else {
    plantillaCargada = false;
    mostrarToast('⚠️ No se encontró la plantilla.');
    dibujarErrorPlantilla();
  }
};

plantilla.src = CONFIG.PLANTILLA_PRINCIPAL;

/* =========================================================
   DISEÑO ORIGINAL
========================================================= */

const DISENO_DEFAULT = {
  fecha: {
    x: 696,
    y: 488,
    fontSize: 22,
    weight: 'bold',
    color: '#1e3a8a',
    align: 'center'
  },
  predicador: {
    x: 260,
    y: 1532,
    x2: 554,
    y2: 1336,
    fontSize: 22,
    weight: 'bold',
    color: '#0f172a',
    align: 'left'
  },
  lectura: {
    x: 293,
    y: 761,
    fontSize: 20,
    weight: 'normal',
    italic: true,
    color: '#1e40af',
    align: 'left'
  },
  himnoInicial: {
    x: 280,
    y: 816,
    fontSize: 22,
    weight: 'bold',
    color: '#0f172a',
    align: 'left'
  },
  himnoFinal: {
    x: 280,
    y: 1380,
    fontSize: 22,
    weight: 'bold',
    color: '#0f172a',
    align: 'left'
  },
  acompanante1: {
    x: 300,
    y: 1560,
    x2: 554,
    y2: 758,
    x3: 554,
    y3: 812,
    x4: 554,
    y4: 1300,
    x5: 554,
    y5: 1426,
    x6: 554,
    y6: 1100,
    fontSize: 20,
    weight: 'bold',
    color: '#0f172a',
    align: 'left'
  },
  acompanante2: {
    x: 300,
    y: 1587,
    x2: 554,
    y2: 883,
    x3: 554,
    y3: 991,
    x4: 554,
    y4: 1224,
    x5: 554,
    y5: 1378,
    fontSize: 20,
    weight: 'bold',
    color: '#0f172a',
    align: 'left'
  },
  familiaOracion: {
    x: 554,
    y: 930,
    fontSize: 20,
    weight: 'normal',
    color: '#15803d',
    align: 'left'
  },
  adoracionInfantil: {
    x: 554,
    y: 1019,
    fontSize: 20,
    weight: 'normal',
    color: '#15803d',
    align: 'left'
  },
  mensajeMusical: {
    x: 554,
    y: 1258,
    fontSize: 20,
    weight: 'normal',
    color: '#15803d',
    align: 'left'
  }
};

let diseno = cargarDiseno();

/* =========================================================
   UTILIDADES
========================================================= */

function clonarObjeto(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function cargarDiseno() {
  try {
    const guardado = localStorage.getItem(CONFIG.STORAGE_DISENO);
    if (guardado) {
      const datos = JSON.parse(guardado);
      return fusionarDiseno(clonarObjeto(DISENO_DEFAULT), datos);
    }
  } catch (error) {
    console.warn('No se pudo cargar el diseño', error);
  }
  return clonarObjeto(DISENO_DEFAULT);
}

function fusionarDiseno(base, cambios) {
  Object.keys(cambios || {}).forEach(id => {
    if (base[id] && cambios[id]) {
      Object.assign(base[id], cambios[id]);
    }
  });
  return base;
}

function guardarDiseno() {
  localStorage.setItem(CONFIG.STORAGE_DISENO, JSON.stringify(diseno));
  mostrarToast('💾 Diseño guardado');
}

/* =========================================================
   UTILIDADES Y MANEJO DE FECHA (OPTIMIZADO PARA IOS / IPHONE)
========================================================= */

function formatearFechaISO(fecha) {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function obtenerProximoSabado() {
  const hoy = new Date();
  const diaSemana = hoy.getDay();
  const diasHastaSabado = (6 - diaSemana + 7) % 7;

  const proximoSabado = new Date(hoy);
  proximoSabado.setDate(hoy.getDate() + diasHastaSabado);
  return proximoSabado;
}

function inicializarCampoFecha() {
  if (!inputFecha.value) {
    const proximoSabado = obtenerProximoSabado();
    inputFecha.value = formatearFechaISO(proximoSabado);
  }
  validarFechaSabado(false);
}

function validarFechaSabado(mostrarAlerta = true) {
  if (!inputFecha.value) return true;

  const partes = inputFecha.value.split('-');
  const fechaSeleccionada = new Date(partes[0], partes[1] - 1, partes[2]);
  const dia = fechaSeleccionada.getDay();

  if (dia !== CONFIG.DIA_PERMITIDO) {
    if (mostrarAlerta) {
      mostrarToast('⚠️ Solo se permiten días sábados.');
    }

    const proximo = obtenerProximoSabado();
    inputFecha.value = formatearFechaISO(proximo);

    fechaHint.className = 'field-hint error';
    fechaHint.innerText = '⚠️ Ajustado automáticamente al próximo sábado.';
    return false;
  }

  fechaHint.className = 'field-hint';
  fechaHint.innerText = '📅 Fecha válida: sábado.';
  return true;
}

inputFecha.addEventListener('change', () => {
  validarFechaSabado(true);
  actualizarInterfazEstado();
  guardarDatos();
  actualizarVistaPrevia();
});

/* =========================================================
   FORMATO DE FECHA PARA EL CANVAS
========================================================= */

function obtenerFechaFormateada() {
  const valor = inputFecha.value;
  if (!valor) return '';

  const partes = valor.split('-');
  const fecha = new Date(partes[0], partes[1] - 1, partes[2]);

  return fecha.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long'
  });
}

/* =========================================================
   DATOS
========================================================= */

function obtenerDatos() {
  const datos = {};
  camposRequeridos.forEach(input => {
    datos[input.id] = input.value.trim();
  });
  return datos;
}

function guardarDatos() {
  try {
    localStorage.setItem(
      CONFIG.STORAGE_DATOS,
      JSON.stringify(obtenerDatos())
    );
  } catch (error) {
    console.warn('No se pudieron guardar los datos.', error);
  }
}

function cargarDatos() {
  try {
    const guardado = localStorage.getItem(CONFIG.STORAGE_DATOS);
    if (!guardado) return;

    const datos = JSON.parse(guardado);
    Object.keys(datos).forEach(id => {
      const input = document.getElementById(id);
      if (input) {
        input.value = datos[id];
      }
    });
  } catch (error) {
    console.warn('Error al recuperar datos.', error);
  }
}

/* =========================================================
   INTERFAZ
========================================================= */

function actualizarInterfazEstado() {
  let completos = 0;

  camposRequeridos.forEach(input => {
    const wrapper = input.parentElement;
    const badge = wrapper.querySelector('.input-badge');
    const lleno = input.value.trim() !== '';

    if (lleno) {
      completos++;

      if (document.activeElement !== input) {
        input.classList.remove('st-incomplete', 'st-focus');
        input.classList.add('st-complete');
      }

      if (badge) {
        badge.className = 'input-badge badge-check';
        badge.innerText = '✓';
      }
    } else {
      if (document.activeElement !== input) {
        input.classList.remove('st-complete', 'st-focus');
        input.classList.add('st-incomplete');
      }

      if (badge) {
        badge.className = 'input-badge badge-required';
        badge.innerText = 'Requerido';
      }
    }
  });

  const porcentaje = Math.round(
    (completos / camposRequeridos.length) * 100
  );

  progressBar.style.width = porcentaje + '%';
  progressText.innerText = porcentaje + '%';

  const todo = completos === camposRequeridos.length;

  progressBar.style.backgroundColor = todo
    ? 'var(--success)'
    : 'var(--secondary)';

  btnExportar.disabled = !todo;
  btnWhatsapp.disabled = !todo;
  btnMobileShare.disabled = !todo;

  previewEmpty.style.display = completos === 0 ? 'flex' : 'none';

  previewStatus.innerText = todo ? '✓ Lista' : `${porcentaje}% completado`;
}

/* =========================================================
   INPUTS
========================================================= */

form.addEventListener('focusin', event => {
  if (event.target.matches('input[required]')) {
    event.target.classList.remove('st-incomplete', 'st-complete');
    event.target.classList.add('st-focus');
  }
});

form.addEventListener('focusout', event => {
  if (event.target.matches('input[required]')) {
    actualizarInterfazEstado();
  }
});

let renderTimeout;

form.addEventListener('input', event => {
  if (event.target === inputFecha) return;

  actualizarInterfazEstado();
  guardarDatos();

  clearTimeout(renderTimeout);
  renderTimeout = setTimeout(actualizarVistaPrevia, 50);
});

/* =========================================================
   RENDERIZADO CANVAS
========================================================= */

function actualizarVistaPrevia() {
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (!plantillaCargada) {
    dibujarErrorPlantilla();
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(plantilla, 0, 0, canvas.width, canvas.height);

  dibujarTodosLosTextos();
}

function dibujarErrorPlantilla() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#64748b';
  ctx.textAlign = 'center';
  ctx.font = 'bold 24px Arial';
  ctx.fillText(
    '⚠️ Plantilla no disponible',
    canvas.width / 2,
    canvas.height / 2
  );

  ctx.textAlign = 'left';
}

/* =========================================================
   TEXTO INTELIGENTE
========================================================= */

function calcularFuenteQueCabe(texto, maxWidth, fuenteBase) {
  let tamaño = fuenteBase;
  ctx.font = `bold ${tamaño}px Arial`;

  while (ctx.measureText(texto).width > maxWidth && tamaño > 11) {
    tamaño--;
    ctx.font = `bold ${tamaño}px Arial`;
  }

  return tamaño;
}

function dibujarTextoInteligente(texto, configuracion, opciones = {}) {
  if (!texto) return;

  const x = configuracion.x ?? 0;
  const y = configuracion.y ?? 0;
  const maxWidth = opciones.maxWidth || canvas.width * 0.75;
  const weight = configuracion.weight || 'normal';
  const italic = configuracion.italic ? 'italic ' : '';

  let fontSize = configuracion.fontSize || 20;
  fontSize = calcularFuenteQueCabe(texto, maxWidth, fontSize);

  ctx.font = `${italic}${weight} ${fontSize}px Arial`;
  ctx.fillStyle = configuracion.color || '#000';
  ctx.textAlign = configuracion.align || 'left';

  ctx.fillText(texto, x, y);
  ctx.textAlign = 'left';
}

function dibujarTodosLosTextos() {
  const fecha = obtenerFechaFormateada();

  if (fecha) {
    dibujarTextoInteligente(fecha, diseno.fecha, {
      maxWidth: canvas.width * 0.35
    });
  }

  dibujarTextoInteligente(
    obtenerValor('predicador'),
    diseno.predicador,
    { maxWidth: canvas.width * 0.65 }
  );

  if (obtenerValor('predicador')) {
    dibujarTextoInteligente(
      obtenerValor('predicador'),
      {
        ...diseno.predicador,
        x: diseno.predicador.x2,
        y: diseno.predicador.y2,
        fontSize: 20,
        weight: 'normal',
        color: '#15803d'
      },
      { maxWidth: canvas.width * 0.55 }
    );
  }

  dibujarTextoInteligente(obtenerValor('lectura'), diseno.lectura, {
    maxWidth: canvas.width * 0.65
  });

  dibujarTextoInteligente(
    obtenerValor('himnoInicial'),
    diseno.himnoInicial,
    { maxWidth: canvas.width * 0.25 }
  );

  dibujarTextoInteligente(
    obtenerValor('himnoFinal'),
    diseno.himnoFinal,
    { maxWidth: canvas.width * 0.25 }
  );

  dibujarAcompanante('acompanante1', diseno.acompanante1);
  dibujarAcompanante('acompanante2', diseno.acompanante2);

  dibujarTextoInteligente(
    obtenerValor('familiaOracion'),
    diseno.familiaOracion,
    { maxWidth: canvas.width * 0.42 }
  );

  dibujarTextoInteligente(
    obtenerValor('adoracionInfantil'),
    diseno.adoracionInfantil,
    { maxWidth: canvas.width * 0.42 }
  );

  dibujarTextoInteligente(
    obtenerValor('mensajeMusical'),
    diseno.mensajeMusical,
    { maxWidth: canvas.width * 0.42 }
  );
}

function dibujarAcompanante(id, config) {
  const texto = obtenerValor(id);
  if (!texto) return;

  const puntos = [
    { x: config.x, y: config.y },
    { x: config.x2, y: config.y2 },
    { x: config.x3, y: config.y3 },
    { x: config.x4, y: config.y4 },
    { x: config.x5, y: config.y5 },
    { x: config.x6, y: config.y6 }
  ];

  puntos.forEach((punto, index) => {
    if (punto.x === undefined || punto.y === undefined) return;

    dibujarTextoInteligente(
      texto,
      {
        ...config,
        x: punto.x,
        y: punto.y,
        fontSize: index === 0 ? 22 : 20
      },
      { maxWidth: canvas.width * 0.55 }
    );
  });
}

function obtenerValor(id) {
  const input = document.getElementById(id);
  return input ? input.value.trim() : '';
}

/* =========================================================
   EXPORTACIÓN JPG
========================================================= */

function obtenerNombreArchivo() {
  const fecha = inputFecha.value || 'culto';
  return `Liturgia_${fecha}.jpg`;
}

function exportarJPG() {
  if (!validarAntesDeExportar()) return;

  actualizarVistaPrevia();

  canvas.toBlob(
    blob => {
      if (!blob) {
        mostrarToast('❌ No se pudo generar la imagen.');
        return;
      }

      const url = URL.createObjectURL(blob);
      const enlace = document.createElement('a');

      enlace.href = url;
      enlace.download = obtenerNombreArchivo();

      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();

      setTimeout(() => URL.revokeObjectURL(url), 1000);

      mostrarToast('🖼️ Imagen generada correctamente');
    },
    'image/jpeg',
    0.98
  );
}

/* =========================================================
   COMPARTIR
========================================================= */

async function enviarWhatsApp() {
  if (!validarAntesDeExportar()) return;

  actualizarVistaPrevia();
  const mensaje = generarMensaje();

  canvas.toBlob(
    async blob => {
      if (!blob) {
        mostrarToast('❌ No se pudo generar la imagen.');
        return;
      }

      const archivo = new File([blob], obtenerNombreArchivo(), {
        type: 'image/jpeg'
      });

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [archivo] })
      ) {
        try {
          await navigator.share({
            files: [archivo],
            title: 'Liturgia del Culto',
            text: mensaje
          });
        } catch (error) {
          if (error.name !== 'AbortError') {
            mostrarToast('⚠️ No se pudo abrir el menú de compartir.');
          }
        }
        return;
      }

      descargarBlob(blob, obtenerNombreArchivo());
      abrirWhatsApp(mensaje);
    },
    'image/jpeg',
    0.98
  );
}

function descargarBlob(blob, nombre) {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');

  enlace.href = url;
  enlace.download = nombre;
  enlace.click();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function abrirWhatsApp(mensaje) {
  const url = 'https://wa.me/?text=' + encodeURIComponent(mensaje);
  window.open(url, '_blank');
}

/* =========================================================
   MENSAJE WHATSAPP
========================================================= */

function generarMensaje() {
  let mensaje = '📜 *LITURGIA DEL CULTO*\n\n';
  const fecha = obtenerFechaFormateada();

  if (fecha) {
    mensaje += `📅 *Fecha:* ${fecha}\n`;
  }

  const predicador = obtenerValor('predicador');
  if (predicador) {
    mensaje += `🎙️ *Predicador:* ${predicador}\n`;
  }

  const lectura = obtenerValor('lectura');
  if (lectura) {
    mensaje += `📖 *Lectura:* ${lectura}\n`;
  }

  const himnoInicial = obtenerValor('himnoInicial');
  if (himnoInicial) {
    mensaje += `🎵 *Himno inicial:* ${himnoInicial}\n`;
  }

  const himnoFinal = obtenerValor('himnoFinal');
  if (himnoFinal) {
    mensaje += `🎵 *Himno final:* ${himnoFinal}\n`;
  }

  mensaje += '\n📝 _Se adjunta la imagen con la programación completa._';

  return mensaje;
}

/* =========================================================
   COPIAR TEXTO
========================================================= */

async function copiarTexto() {
  const mensaje = generarMensaje();

  try {
    await navigator.clipboard.writeText(mensaje);
    mostrarToast('📜 Texto copiado');
  } catch (error) {
    mostrarToast('⚠️ No se pudo copiar automáticamente.');
  }
}

/* =========================================================
   VALIDACIÓN EXPORTACIÓN
========================================================= */

function validarAntesDeExportar() {
  const todo = camposRequeridos.every(
    input => input.value.trim() !== ''
  );

  if (!todo) {
    mostrarToast('⚠️ Completa todos los campos.');
    return false;
  }

  if (!validarFechaSabado(true)) {
    return false;
  }

  return true;
}

/* =========================================================
   DISEÑADOR (SOLO ADMIN)
========================================================= */

function abrirDiseñador() {
  if (!isAdmin) return;

  if (designerPanel) {
    designerPanel.classList.toggle('active');

    if (designerPanel.classList.contains('active')) {
      cargarControlesDiseño();
    }
  }
}

function cargarControlesDiseño() {
  const fieldSelect = document.getElementById('designerField');
  if (!fieldSelect) return;

  const id = fieldSelect.value;
  const config = diseno[id];

  if (!config) return;

  document.getElementById('designX').value = config.x ?? 0;
  document.getElementById('designY').value = config.y ?? 0;
  document.getElementById('designFontSize').value = config.fontSize ?? 20;
  document.getElementById('designAlign').value = config.align || 'left';
}

function aplicarControlesDiseño() {
  const fieldSelect = document.getElementById('designerField');
  if (!fieldSelect) return;

  const id = fieldSelect.value;
  const config = diseno[id];

  if (!config) return;

  config.x = Number(document.getElementById('designX').value) || 0;
  config.y = Number(document.getElementById('designY').value) || 0;
  config.fontSize = Number(document.getElementById('designFontSize').value) || 20;
  config.align = document.getElementById('designAlign').value;

  actualizarVistaPrevia();
}

if (isAdmin) {
  const designerField = document.getElementById('designerField');
  if (designerField) {
    designerField.addEventListener('change', cargarControlesDiseño);
  }

  ['designX', 'designY', 'designFontSize', 'designAlign'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', aplicarControlesDiseño);
    }
  });

  const btnMoveUp = document.getElementById('btnMoveUp');
  const btnMoveDown = document.getElementById('btnMoveDown');
  const btnMoveLeft = document.getElementById('btnMoveLeft');
  const btnMoveRight = document.getElementById('btnMoveRight');
  const btnSaveDesign = document.getElementById('btnSaveDesign');
  const btnResetDesign = document.getElementById('btnResetDesign');

  if (btnMoveUp) btnMoveUp.onclick = () => moverElemento(0, -CONFIG.MOVIMIENTO);
  if (btnMoveDown) btnMoveDown.onclick = () => moverElemento(0, CONFIG.MOVIMIENTO);
  if (btnMoveLeft) btnMoveLeft.onclick = () => moverElemento(-CONFIG.MOVIMIENTO, 0);
  if (btnMoveRight) btnMoveRight.onclick = () => moverElemento(CONFIG.MOVIMIENTO, 0);
  if (btnSaveDesign) btnSaveDesign.onclick = guardarDiseno;

  if (btnResetDesign) {
    btnResetDesign.onclick = () => {
      if (!confirm('¿Restablecer todas las posiciones originales?')) {
        return;
      }

      diseno = clonarObjeto(DISENO_DEFAULT);
      cargarControlesDiseño();
      actualizarVistaPrevia();
      guardarDiseno();
    };
  }
}

function moverElemento(dx, dy) {
  const fieldSelect = document.getElementById('designerField');
  if (!fieldSelect) return;

  const id = fieldSelect.value;
  const config = diseno[id];

  if (!config) return;

  config.x = (config.x || 0) + dx;
  config.y = (config.y || 0) + dy;

  cargarControlesDiseño();
  actualizarVistaPrevia();
}

/* =========================================================
   LIMPIAR FORMULARIO
========================================================= */

function abrirConfirmacionLimpiar() {
  document.getElementById('confirmModal').classList.add('active');
}

function cerrarConfirmacionLimpiar() {
  document.getElementById('confirmModal').classList.remove('active');
}

function limpiarFormulario() {
  form.reset();
  localStorage.removeItem(CONFIG.STORAGE_DATOS);

  inicializarCampoFecha();
  actualizarInterfazEstado();
  actualizarVistaPrevia();
  cerrarConfirmacionLimpiar();

  mostrarToast('🗑️ Formulario limpio');
}

document.getElementById('btnLimpiar').onclick = abrirConfirmacionLimpiar;
document.getElementById('btnMobileClear').onclick = abrirConfirmacionLimpiar;
document.getElementById('btnCancelClear').onclick = cerrarConfirmacionLimpiar;
document.getElementById('btnConfirmClear').onclick = limpiarFormulario;

/* =========================================================
   TEMA
========================================================= */

function cargarTema() {
  const tema = localStorage.getItem(CONFIG.STORAGE_TEMA);

  if (tema === 'dark') {
    document.body.classList.add('dark');
    document.getElementById('btnTheme').innerText = '✨';
  }
}

document.getElementById('btnTheme').onclick = () => {
  document.body.classList.toggle('dark');
  const oscuro = document.body.classList.contains('dark');

  localStorage.setItem(CONFIG.STORAGE_TEMA, oscuro ? 'dark' : 'light');
  document.getElementById('btnTheme').innerText = oscuro ? '✨' : '🌙';
};

/* =========================================================
   TOAST
========================================================= */

let toastTimeout;

function mostrarToast(mensaje) {
  const container = document.getElementById('toastContainer');
  container.innerHTML = '';

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = mensaje;

  container.appendChild(toast);

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.remove();
  }, 2500);
}

/* =========================================================
   EVENTOS BOTONES PRINCIPALES Y ACTIVACIÓN MODO ADMIN
========================================================= */

btnExportar.onclick = exportarJPG;
btnWhatsapp.onclick = enviarWhatsApp;
btnMobileShare.onclick = enviarWhatsApp;

document.getElementById('btnCopiar').onclick = copiarTexto;

// Mostrar botones del diseñador solo en modo Administrador (?admin=true)
document.addEventListener('DOMContentLoaded', () => {
  if (isAdmin) {
    if (designerBtn) {
      designerBtn.style.display = 'inline-flex';
      designerBtn.onclick = abrirDiseñador;
    }
    if (designerPreviewBtn) {
      designerPreviewBtn.style.display = 'inline-flex';
      designerPreviewBtn.onclick = abrirDiseñador;
    }
  } else {
    if (designerBtn) designerBtn.style.display = 'none';
    if (designerPreviewBtn) designerPreviewBtn.style.display = 'none';
  }
});

/* =========================================================
   ATAJOS DE TECLADO
========================================================= */

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    cerrarConfirmacionLimpiar();
  }
});

/* =========================================================
   INICIALIZACIÓN
========================================================= */

cargarTema();
cargarDatos();
inicializarCampoFecha();
actualizarInterfazEstado();
actualizarVistaPrevia();
