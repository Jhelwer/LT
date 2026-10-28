/* =========================================================
   CONFIGURACIÓN GENERAL
========================================================= */

const CONFIG = {
  PLANTILLA_PRINCIPAL: 'plantilla.webp',
  STORAGE_DATOS: 'liturgiaDataV2',
  STORAGE_TEMA: 'liturgiaTheme',
  DIA_PERMITIDO: 6
};

// ==========================================
// CONFIGURACIÓN DE VERSIÓN GLOBAL
// ==========================================
const CONFIG_VERSION = "3.0.0"; // Actualiza esta versión según sea necesario

function aplicarVersionGlobal() {
  const elementosVersion = document.querySelectorAll('#app-version, #app-version-footer');
  elementosVersion.forEach(el => {
    el.textContent = `v${CONFIG_VERSION}`;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  aplicarVersionGlobal();
});

/* =========================================================
   REFERENCIAS DEL DOM
========================================================= */

const canvas = document.getElementById('canvasLiturgia');
const ctx = canvas.getContext('2d');
const form = document.getElementById('liturgiaForm');
const btnExportar = document.getElementById('btnExportar');
const btnWhatsapp = document.getElementById('btnWhatsapp');
const btnMobileShare = document.getElementById('btnMobileShare');
const previewEmpty = document.getElementById('previewEmpty');
const previewStatus = document.getElementById('previewStatus');
const previewLoading = document.getElementById('previewLoading');
const inputFecha = document.getElementById('fecha');
const fechaHint = document.getElementById('fechaHint');
const camposRequeridos = Array.from(
  document.querySelectorAll('#liturgiaForm input[required]')
);

/* =========================================================
   PLANTILLA CON CONTROL DE CARGA
========================================================= */
const plantilla = new Image();
let plantillaCargada = false;

plantilla.onload = () => {
  plantillaCargada = true;
  canvas.width = plantilla.naturalWidth;
  canvas.height = plantilla.naturalHeight;

  // Ocultar pantalla de carga
  if (previewLoading) previewLoading.style.display = 'none';

  actualizarVistaPrevia();
  actualizarInterfazEstado();
};

plantilla.onerror = () => {
  plantillaCargada = false;
  if (previewLoading) previewLoading.style.display = 'none';
  mostrarToast('⚠️ No se pudo cargar "plantilla.webp". Verifica el nombre.');
  dibujarErrorPlantilla();
};

plantilla.src = CONFIG.PLANTILLA_PRINCIPAL;

/* =========================================================
   MAPEO DINÁMICO DE ACOMPAÑANTES Y ROLES (2, 3, 4 Y 5)
========================================================= */

const ROLES_COORDS = {
  bienvenidaLectura: { x: 1108, y: 1446 },
  himnoInicial:      { x: 1108, y: 1564 },
  oracionInicial:    { x: 1108, y: 1696 },
  adoracionInfantil: { x: 1108, y: 1902 },
  diezmosOfrendas:   { x: 1108, y: 2120 },
  mensajeMusical:    { x: 1108, y: 2378 },
  anunciaPredicador: { x: 1108, y: 2530 },
  himnoFinal:        { x: 1108, y: 2686 },
  oracionFinal:      { x: 1108, y: 2785 }
};

const DISTRIBUCION_ROLES = {
  2: {
    1: ['bienvenidaLectura', 'himnoInicial', 'diezmosOfrendas', 'anunciaPredicador', 'oracionFinal'],
    2: ['oracionInicial', 'adoracionInfantil', 'mensajeMusical', 'himnoFinal']
  },
  3: {
    1: ['bienvenidaLectura', 'himnoInicial', 'oracionFinal'],
    2: ['oracionInicial', 'adoracionInfantil', 'anunciaPredicador'],
    3: ['diezmosOfrendas', 'mensajeMusical', 'himnoFinal']
  },
  4: {
    1: ['bienvenidaLectura', 'himnoInicial'],
    2: ['oracionInicial', 'adoracionInfantil', 'himnoFinal'],
    3: ['diezmosOfrendas', 'mensajeMusical'],
    4: ['anunciaPredicador', 'oracionFinal']
  },
  5: {
    1: ['bienvenidaLectura'],
    2: ['himnoInicial', 'oracionFinal'],
    3: ['oracionInicial', 'himnoFinal'],
    4: ['adoracionInfantil', 'diezmosOfrendas'],
    5: ['mensajeMusical', 'anunciaPredicador']
  }
};

/* =========================================================
   DISEÑO BASE (1728x3642)
========================================================= */

const DISENO_DEFAULT = {
  fecha: {
    x: 1392,
    y: 906,
    fontSize: 44,
    weight: 'bold',
    color: '#1e3a8a',
    align: 'center'
  },
  predicador: {
    x: 520,
    y: 2994,
    x2: 1108,
    y2: 2592,
    fontSize: 44,
    weight: 'bold',
    color: '#0f172a',
    align: 'left'
  },
  lectura: {
    x: 586,
    y: 1452,
    fontSize: 40,
    weight: 'normal',
    italic: true,
    color: '#1e40af',
    align: 'left'
  },
  himnoInicial: {
    x: 560,
    y: 1562,
    fontSize: 44,
    weight: 'bold',
    color: '#0f172a',
    align: 'left'
  },
  himnoFinal: {
    x: 560,
    y: 2690,
    fontSize: 44,
    weight: 'bold',
    color: '#0f172a',
    align: 'left'
  },
  // Coordenadas para la lista inferior de la plataforma (Acompañantes 1 al 5)
  acompanante1: {
    x: 600,
    y: 3050,
    fontSize: 40,
    weight: 'bold',
    color: '#0f172a',
    align: 'left'
  },
  acompanante2: {
    x: 600,
    y: 3107,
    fontSize: 40,
    weight: 'bold',
    color: '#0f172a',
    align: 'left'
  },
  acompanante3: {
    x: 600,
    y: 3164,
    fontSize: 40,
    weight: 'bold',
    color: '#0f172a',
    align: 'left'
  },
  acompanante4: {
    x: 600,
    y: 3221,
    fontSize: 40,
    weight: 'bold',
    color: '#0f172a',
    align: 'left'
  },
  acompanante5: {
    x: 600,
    y: 3278,
    fontSize: 40,
    weight: 'bold',
    color: '#0f172a',
    align: 'left'
  },
  familiaOracion: {
    x: 1108,
    y: 1770,
    fontSize: 40,
    weight: 'normal',
    color: '#15803d',
    align: 'left'
  },
  adoracionInfantil: {
    x: 1108,
    y: 1968,
    fontSize: 40,
    weight: 'normal',
    color: '#15803d',
    align: 'left'
  },
  mensajeMusical: {
    x: 1108,
    y: 2436,
    fontSize: 40,
    weight: 'normal',
    color: '#15803d',
    align: 'left'
  }
};

let diseno = DISENO_DEFAULT;

/* =========================================================
   UTILIDADES Y MANEJO DE FECHA
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

    inputFecha.classList.add('st-error-flash');
    if (fechaHint) {
      fechaHint.className = 'field-hint error';
      fechaHint.innerText = '⚠️ Día no permitido. Debe ser sábado.';
    }

    setTimeout(() => {
      const proximo = obtenerProximoSabado();
      inputFecha.value = formatearFechaISO(proximo);
      
      inputFecha.classList.remove('st-error-flash');
      if (fechaHint) {
        fechaHint.className = 'field-hint';
        fechaHint.innerHTML = `
          <span class="hint-icon">
            <svg viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true">
              <rect x="3" y="5" width="18" height="16" rx="2"/>
              <path d="M16 3v4M8 3v4M3 10h18"/>
              <path d="m9 16 2 2 4-4"/>
            </svg>
            Ajustado automáticamente al próximo sábado.
          </span>
        `;
      }
      
      actualizarInterfazEstado();
      actualizarVistaPrevia();
    }, 1200);

    return false;
  }

  if (fechaHint) {
    fechaHint.className = 'field-hint';
    fechaHint.innerHTML = `
      <span class="hint-icon">
        <svg viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true">
          <rect x="3" y="5" width="18" height="16" rx="2"/>
          <path d="M16 3v4M8 3v4M3 10h18"/>
          <path d="m9 16 2 2 4-4"/>
        </svg>
        Fecha válida: sábado.
      </span>
    `;
  }
  return true;
}

if (inputFecha) {
  inputFecha.addEventListener('change', () => {
    validarFechaSabado(true);
    actualizarInterfazEstado();
    guardarDatos();
    actualizarVistaPrevia();
  });
}

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
   DATOS Y PERSISTENCIA
========================================================= */

function obtenerDatos() {
  const datos = {};
  const inputs = form.querySelectorAll('input');
  inputs.forEach(input => {
    datos[input.id] = input.value.trim();
  });
  return datos;
}

function guardarDatos() {
  try {
    localStorage.setItem(CONFIG.STORAGE_DATOS, JSON.stringify(obtenerDatos()));
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

function obtenerValor(id) {
  const input = document.getElementById(id);
  return input ? input.value.trim() : '';
}

/* =========================================================
   INTERFAZ DE USUARIO
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

  const todo = completos === camposRequeridos.length;

  if (btnExportar) btnExportar.disabled = !todo;
  if (btnWhatsapp) btnWhatsapp.disabled = !todo;
  if (btnMobileShare) btnMobileShare.disabled = !todo;

  if (previewEmpty) previewEmpty.style.display = completos === 0 ? 'flex' : 'none';
  if (previewStatus) previewStatus.innerText = todo ? '✓ Lista' : `${Math.round((completos / camposRequeridos.length) * 100)}% completado`;
}

if (form) {
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
}

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
  ctx.fillText('⚠️ Plantilla no disponible', canvas.width / 2, canvas.height / 2);

  ctx.textAlign = 'left';
}

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

function dibujarAcompanantesDinamicos() {
  const listaAcompanantes = [];
  
  // Recoger los 5 campos posibles de acompañantes
  for (let i = 1; i <= 5; i++) {
    const valor = obtenerValor(`acompanante${i}`);
    if (valor) {
      listaAcompanantes.push(valor);
    }
  }

  const cantidad = listaAcompanantes.length;
  if (cantidad < 2) return;

  const modo = Math.min(Math.max(cantidad, 2), 5);
  const mapaModo = DISTRIBUCION_ROLES[modo];

  listaAcompanantes.forEach((nombre, index) => {
    const numAcompanante = index + 1;
    const rolesAsignados = mapaModo[numAcompanante];

    // 1. Dibujar en los roles del programa central
    if (rolesAsignados) {
      rolesAsignados.forEach(claveRol => {
        const coord = ROLES_COORDS[claveRol];
        if (coord) {
          dibujarTextoInteligente(
            nombre,
            { x: coord.x, y: coord.y, fontSize: 40, weight: 'bold', color: '#0f172a', align: 'left' },
            { maxWidth: canvas.width * 0.42 }
          );
        }
      });
    }

    // 2. Dibujar en la lista inferior de la plataforma (Acompañantes 1 al 5)
    const claveLista = `acompanante${numAcompanante}`;
    if (diseno[claveLista]) {
      dibujarTextoInteligente(nombre, diseno[claveLista], {
        maxWidth: canvas.width * 0.55
      });
    }
  });
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
        fontSize: 40,
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

  // Mapeo dinámico e inteligente de roles y lista inferior (2 a 5 acompañantes)
  dibujarAcompanantesDinamicos();

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

/* =========================================================
   EXPORTACIÓN JPG Y COMPARTIR
========================================================= */

function obtenerNombreArchivo() {
  const fecha = inputFecha.value || 'culto';
  return `Liturgia_${fecha}.jpg`;
}

function exportarJPG() {
  if (!validarAntesDeExportar()) return;

  actualizarVistaPrevia();

  if (canvas.width === 0 || canvas.height === 0) {
    mostrarToast('❌ Error: El lienzo no está listo.');
    return;
  }

  canvas.toBlob(
    blob => {
      if (!blob) {
        mostrarToast('❌ No se pudo generar la imagen de alta resolución.');
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
    0.95
  );
}

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

function generarMensaje() {
  let mensaje = '📜 *LITURGIA DEL CULTO*\n\n';
  const fecha = obtenerFechaFormateada();

  if (fecha) mensaje += `📅 *Fecha:* ${fecha}\n`;

  const predicador = obtenerValor('predicador');
  if (predicador) mensaje += `🎙️ *Predicador:* ${predicador}\n`;

  const lectura = obtenerValor('lectura');
  if (lectura) mensaje += `📖 *Lectura:* ${lectura}\n`;

  const himnoInicial = obtenerValor('himnoInicial');
  if (himnoInicial) mensaje += `🎵 *Himno inicial:* ${himnoInicial}\n`;

  const himnoFinal = obtenerValor('himnoFinal');
  if (himnoFinal) mensaje += `🎵 *Himno final:* ${himnoFinal}\n`;

  mensaje += '\n📝 _Se adjunta la imagen con la programación completa._';
  return mensaje;
}

function validarAntesDeExportar() {
  const todo = camposRequeridos.every(input => input.value.trim() !== '');

  if (!todo) {
    mostrarToast('⚠️ Completa todos los campos requeridos.');
    return false;
  }

  if (!validarFechaSabado(true)) {
    return false;
  }

  return true;
}

/* =========================================================
   LIMPIAR FORMULARIO
========================================================= */

function abrirConfirmacionLimpiar() {
  const modal = document.getElementById('confirmModal');
  if (modal) modal.classList.add('active');
}

function cerrarConfirmacionLimpiar() {
  const modal = document.getElementById('confirmModal');
  if (modal) modal.classList.remove('active');
}

function limpiarFormulario() {
  const campos = form.querySelectorAll('input, select, textarea');
  
  campos.forEach((campo, index) => {
    setTimeout(() => {
      campo.classList.add('st-clear-flash');
      setTimeout(() => {
        campo.classList.remove('st-clear-flash');
      }, 450);
    }, index * 45);
  });

  form.reset();
  localStorage.removeItem(CONFIG.STORAGE_DATOS);

  inicializarCampoFecha();
  actualizarInterfazEstado();
  actualizarVistaPrevia();
  cerrarConfirmacionLimpiar();

  mostrarToast('🗑️ Formulario limpio');
}

const btnLimpiar = document.getElementById('btnLimpiar');
const btnMobileClear = document.getElementById('btnMobileClear');
const btnCancelClear = document.getElementById('btnCancelClear');
const btnConfirmClear = document.getElementById('btnConfirmClear');

if (btnLimpiar) btnLimpiar.onclick = abrirConfirmacionLimpiar;
if (btnMobileClear) btnMobileClear.onclick = abrirConfirmacionLimpiar;
if (btnCancelClear) btnCancelClear.onclick = cerrarConfirmacionLimpiar;
if (btnConfirmClear) btnConfirmClear.onclick = limpiarFormulario;

/* =========================================================
   TEMA
========================================================= */

function inicializarTema() {
  const savedTheme = localStorage.getItem(CONFIG.STORAGE_TEMA);
  
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
  } else if (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark');
  }

  const themeToggleBtn = document.getElementById('theme-toggle');

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      const esOscuro = document.body.classList.contains('dark');
      localStorage.setItem(CONFIG.STORAGE_TEMA, esOscuro ? 'dark' : 'light');
    });
  }
}

/* =========================================================
   TOAST
========================================================= */

let toastTimeout;

function mostrarToast(mensaje) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
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
   EVENTOS DE BOTONES Y TECLADO
========================================================= */

if (btnExportar) btnExportar.onclick = exportarJPG;
if (btnWhatsapp) btnWhatsapp.onclick = enviarWhatsApp;
if (btnMobileShare) btnMobileShare.onclick = enviarWhatsApp;

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    cerrarConfirmacionLimpiar();
  }
});

/* =========================================================
   INICIALIZACIÓN GLOBAL
========================================================= */

inicializarTema();
cargarDatos();
inicializarCampoFecha();
actualizarInterfazEstado();
actualizarVistaPrevia();

/* =========================================================
   CONTROL DE ACOMPAÑANTES EXTRA DESPLEGABLES
========================================================= */
const btnToggleAcompanantes = document.getElementById('btnToggleAcompanantes');
const extraAcompanantes = document.getElementById('extraAcompanantes');

function configurarDesplegableAcompanantes() {
  if (!btnToggleAcompanantes || !extraAcompanantes) return;

  // Si ya tienen datos guardados al cargar la página, abrirlos automáticamente
  const tieneDatosExtra = ['acompanante3', 'acompanante4', 'acompanante5'].some(id => {
    const input = document.getElementById(id);
    return input && input.value.trim() !== '';
  });

  if (tieneDatosExtra) {
    extraAcompanantes.classList.add('show');
    btnToggleAcompanantes.innerHTML = '➖ Ocultar acompañantes extras';
  }

  btnToggleAcompanantes.addEventListener('click', () => {
    const estaAbierto = extraAcompanantes.classList.toggle('show');
    if (estaAbierto) {
      btnToggleAcompanantes.innerHTML = '➖ Ocultar acompañantes extras';
    } else {
      btnToggleAcompanantes.innerHTML = '➕ Agregar más acompañantes (Opcional)';
    }
  });
}

// Ejecutar al iniciar
document.addEventListener('DOMContentLoaded', () => {
  configurarDesplegableAcompanantes();
});


// Añade una clase a los inputs que tienen texto escrito
document.querySelectorAll('input[type="text"], input[type="number"], input[type="date"]').forEach(input => {
    // Verificar al cargar por si ya tienen texto guardado
    if (input.value.trim() !== '') input.classList.add('has-content');

    // Escuchar cuando el usuario escribe
    input.addEventListener('input', () => {
        if (input.value.trim() !== '') {
            input.classList.add('has-content');
        } else {
            input.classList.remove('has-content');
        }
    });
});


// Efecto Ripple para todos los botones
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', function (e) {
        // Evitar duplicados si ya existe una onda
        const existingRipple = this.querySelector('.ripple-effect');
        if (existingRipple) {
            existingRipple.remove();
        }

        const circle = document.createElement('span');
        const diameter = Math.max(this.clientWidth, this.clientHeight);
        const radius = diameter / 2;

        // Calcular posición exacta del toque/clic dentro del botón
        const rect = this.getBoundingClientRect();
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - rect.left - radius}px`;
        circle.style.top = `${e.clientY - rect.top - radius}px`;
        circle.classList.add('ripple-effect');

        this.appendChild(circle);

        // Eliminar el elemento después de que termine la animación
        setTimeout(() => {
            circle.remove();
        }, 600);
    });
});
