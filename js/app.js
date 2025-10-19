//========================================
// MANEJADORA PRINCIPAL - SISTEMA DE GESTIÓN DE PINTURAS
// Coordinador principal de la aplicación
// Autor: Casado Santino
//========================================

// VARIABLES GLOBALES
let pinturasCache = [];
let pinturaEnEdicion = null;
let pinturasFiltradas = [];

// ELEMENTOS DEL DOM
let panelDerecho, inputId, inputMarca, inputPrecio, inputColor, inputCantidad;
let btnAgregar, btnModificar, btnLimpiar, btnFiltros;

// INICIALIZACIÓN PRINCIPAL
document.addEventListener("DOMContentLoaded", () => {
    inicializarAplicacion();
});

/**
 * Inicializar toda la aplicación
 */
async function inicializarAplicacion() {
    try {
        console.log('🚀 Inicializando Sistema de Gestión de Pinturas...');
        
        // 1. Inicializar elementos DOM
        inicializarElementosDOM();
        
        // 2. Inicializar componentes UI
        TabManager.inicializar();
        ModoOscuroManager.inicializar();
        
        // 3. Configurar eventos
        configurarEventos();
        
        // 4. Verificar conexión API
        const conexionOK = await PinturasAPI.verificarConexion();
        if (!conexionOK) {
            Notificaciones.advertencia('No se pudo conectar con la API. Algunas funciones pueden no estar disponibles.');
        }
        
        // 5. Cargar datos iniciales
        await cargarPinturas();
        
        console.log('✅ Aplicación inicializada correctamente');
        
    } catch (error) {
        console.error('❌ Error al inicializar la aplicación:', error);
        Notificaciones.error('Error al inicializar la aplicación');
    }
}

/**
 * Inicializar referencias a elementos DOM
 */
function inicializarElementosDOM() {
    // Panel principal
    panelDerecho = document.getElementById("divListado");
    
    // Inputs del formulario
    inputId = document.getElementById("inputID");
    inputMarca = document.getElementById("inputMarca");
    inputPrecio = document.getElementById("inputPrecio");
    inputColor = document.getElementById("inputColor");
    inputCantidad = document.getElementById("inputCantidad");
    
    // Botones del formulario
    btnAgregar = document.getElementById("btnAgregar");
    btnModificar = document.getElementById("btnModificar");
    btnLimpiar = document.getElementById("btnLimpiar");
    btnFiltros = document.getElementById("btnFiltros");
}

/**
 * Configurar todos los eventos de la aplicación
 */
function configurarEventos() {
    // Eventos del formulario
    btnAgregar?.addEventListener('click', manejarAgregar);
    btnModificar?.addEventListener('click', manejarModificar);
    btnLimpiar?.addEventListener('click', manejarLimpiar);
    btnFiltros?.addEventListener('click', manejarFiltros);
    
    // Eventos de estadísticas
    document.getElementById('btn-calcular-promedio')?.addEventListener('click', calcularPromedio);
    document.getElementById('btn-estadisticas-completas')?.addEventListener('click', mostrarEstadisticasCompletas);
    document.getElementById('btn-exportar-csv')?.addEventListener('click', exportarCSV);
    
    // Eventos de cambio de tab
    document.addEventListener('tabChanged', (e) => {
        manejarCambioTab(e.detail.tabActual);
    });
}

//==========================================
// FUNCIONES PRINCIPALES DE PINTURAS
//==========================================

/**
 * Cargar pinturas desde la API
 */
async function cargarPinturas() {
    try {
        LoadingManager.mostrar('divListado', 'Cargando pinturas...');
        
        const pinturas = await PinturasAPI.obtenerPinturas();
        pinturasCache = Array.isArray(pinturas) ? pinturas : [];
        
        mostrarPinturas(pinturasCache);
        actualizarEstadisticas();
        
    } catch (error) {
        console.error('Error al cargar pinturas:', error);
        mostrarMensajeError(panelDerecho, APIUtils.manejarError(error));
        Notificaciones.error(APIUtils.manejarError(error));
    }
}

/**
 * Manejar agregar nueva pintura
 */
async function manejarAgregar() {
    try {
        const datos = FormularioManager.obtenerDatos();
        const validacion = Validaciones.validarFormulario(datos);
        
        if (!validacion.valido) {
            FormularioManager.mostrarErrores(validacion.errores);
            Notificaciones.error('Por favor corrige los errores en el formulario');
            return;
        }
        
        LoadingManager.mostrarEnBoton('btnAgregar', 'Agregando...');
        
        const pinturaFormateada = APIUtils.formatearPintura(datos);
        await PinturasAPI.crearPintura(pinturaFormateada);
        
        await cargarPinturas();
        FormularioManager.limpiarFormulario();
        
        Notificaciones.exitoConBotonVer('Pintura agregada correctamente');
        
    } catch (error) {
        console.error('Error al agregar pintura:', error);
        Notificaciones.error(APIUtils.manejarError(error));
    } finally {
        LoadingManager.restaurarBoton('btnAgregar', 'Agregar', '<i class="bi bi-plus-circle me-1"></i>');
    }
}

/**
 * Manejar modificar pintura existente
 */
async function manejarModificar() {
    if (!pinturaEnEdicion) {
        Notificaciones.advertencia('Primero selecciona una pintura para modificar');
        return;
    }
    
    try {
        const datos = FormularioManager.obtenerDatos();
        const validacion = Validaciones.validarFormulario(datos);
        
        if (!validacion.valido) {
            FormularioManager.mostrarErrores(validacion.errores);
            Notificaciones.error('Por favor corrige los errores en el formulario');
            return;
        }
        
        LoadingManager.mostrarEnBoton('btnModificar', 'Modificando...');
        
        const pinturaFormateada = APIUtils.formatearPintura(datos);
        await PinturasAPI.actualizarPintura(pinturaEnEdicion.id, pinturaFormateada);
        
        await cargarPinturas();
        FormularioManager.limpiarFormulario();
        pinturaEnEdicion = null;
        
        Notificaciones.exitoConBotonVer('Pintura modificada correctamente');
        
    } catch (error) {
        console.error('Error al modificar pintura:', error);
        Notificaciones.error(APIUtils.manejarError(error));
    } finally {
        LoadingManager.restaurarBoton('btnModificar', 'Modificar', '<i class="bi bi-pencil-square me-1"></i>');
    }
}

/**
 * Manejar limpiar formulario
 */
function manejarLimpiar() {
    FormularioManager.limpiarFormulario();
    pinturaEnEdicion = null;
    Notificaciones.info('Formulario limpiado');
}

/**
 * Manejar filtros (placeholder)
 */
function manejarFiltros() {
    Notificaciones.info('Función de filtros en desarrollo');
}

/**
 * Consultar pintura específica para edición
 */
async function consultarPintura(id) {
    try {
        LoadingManager.mostrar('divListado', 'Consultando pintura...');
        
        const pintura = await PinturasAPI.obtenerPinturaPorId(id);
        
        if (!pintura) {
            throw new Error('No se recibieron datos de la pintura');
        }
        
        FormularioManager.llenarFormulario(pintura);
        pinturaEnEdicion = pintura;
        
        TabManager.mostrarTab('alta');
        
        Notificaciones.info(`Pintura "${pintura.marca || 'sin nombre'}" cargada para modificación`);
        
    } catch (error) {
        console.error('Error al consultar pintura:', error);
        Notificaciones.error(APIUtils.manejarError(error));
        setTimeout(() => {
            mostrarPinturas(pinturasCache);
        }, 2000);
    }
}

//==========================================
// FUNCIONES DE INTERFAZ
//==========================================

/**
 * Manejar cambio de tab
 */
function manejarCambioTab(tab) {
    switch(tab) {
        case 'listado':
            if (pinturasCache.length === 0) {
                cargarPinturas();
            } else {
                mostrarPinturas(pinturasCache);
            }
            break;
        case 'estadisticas':
            actualizarEstadisticas();
            break;
        case 'alta':
            // Si hay una pintura en edición, no limpiar
            if (!pinturaEnEdicion) {
                FormularioManager.limpiarFormulario();
            }
            break;
    }
}

//==========================================
// FUNCIONES DE VISUALIZACIÓN
//==========================================

/**
 * Mostrar listado de pinturas en tabla
 */
function mostrarPinturas(pinturas) {
    if (!panelDerecho) return;
    
    if (!pinturas || pinturas.length === 0) {
        panelDerecho.innerHTML = `
            <div class="alert alert-info text-center">
                <i class="bi bi-info-circle me-2"></i>
                No hay pinturas disponibles
            </div>
        `;
        return;
    }
    
    const tabla = `
        <div class="table-responsive">
            <table class="table table-hover table-striped">
                <thead class="table-primary">
                    <tr>
                        <th>ID</th>
                        <th>Marca</th>
                        <th>Precio</th>
                        <th>Color</th>
                        <th>Cantidad</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${pinturas.map(pintura => crearFilaPintura(pintura)).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    panelDerecho.innerHTML = tabla;
}

/**
 * Crear fila de tabla para una pintura
 */
function crearFilaPintura(pintura) {
    const colorTexto = Utils.calcularContraste(pintura.color);
    
    return `
        <tr>
            <td><span class="badge bg-secondary">${pintura.id}</span></td>
            <td><strong>${Utils.capitalizar(pintura.marca)}</strong></td>
            <td><span class="badge bg-success">${Utils.formatearPrecio(pintura.precio)}</span></td>
            <td>
                <div class="d-flex align-items-center">
                    <div 
                        class="color-preview me-2" 
                        style="
                            width: 20px; 
                            height: 20px; 
                            background-color: ${pintura.color}; 
                            border: 1px solid #ccc; 
                            border-radius: 3px;
                        "
                    ></div>
                    <code>${Utils.formatearColor(pintura.color)}</code>
                </div>
            </td>
            <td><span class="badge bg-info">${pintura.cantidad}</span></td>
            <td>
                <button 
                    class="btn btn-sm btn-outline-warning me-1" 
                    onclick="consultarPintura('${pintura.id}')"
                    title="Modificar pintura"
                >
                    <i class="bi bi-pencil"></i>
                </button>
                <button 
                    class="btn btn-sm btn-outline-danger" 
                    onclick="confirmarEliminar('${pintura.id}', '${pintura.marca}')"
                    title="Eliminar pintura"
                >
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `;
}

/**
 * Mostrar mensaje de error
 */
function mostrarMensajeError(contenedor, mensaje) {
    if (!contenedor) return;
    
    contenedor.innerHTML = `
        <div class="alert alert-danger text-center">
            <i class="bi bi-exclamation-triangle me-2"></i>
            ${mensaje}
        </div>
    `;
}

//==========================================
// FUNCIONES DE ESTADÍSTICAS
//==========================================

/**
 * Calcular y mostrar precio promedio
 */
function calcularPromedio() {
    if (pinturasCache.length === 0) {
        Notificaciones.advertencia('No hay pinturas para calcular el promedio');
        return;
    }
    
    const promedio = Estadisticas.calcularPromedio(pinturasCache);
    Notificaciones.info(`Precio promedio: ${Utils.formatearPrecio(promedio)}`);
}

/**
 * Mostrar estadísticas completas
 */
function mostrarEstadisticasCompletas() {
    if (pinturasCache.length === 0) {
        Notificaciones.advertencia('No hay pinturas para mostrar estadísticas');
        return;
    }
    
    const stats = Estadisticas.obtenerEstadisticasCompletas(pinturasCache);
    
    // Crear modal con estadísticas
    const modalHtml = `
        <div class="modal fade" id="modalEstadisticas" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="bi bi-graph-up me-2"></i>
                            Estadísticas Completas
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row text-center mb-4">
                            <div class="col-md-3">
                                <div class="card border-primary">
                                    <div class="card-body">
                                        <h3 class="text-primary">${stats.total}</h3>
                                        <small>Total Pinturas</small>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="card border-success">
                                    <div class="card-body">
                                        <h3 class="text-success">${Utils.formatearPrecio(stats.promedio)}</h3>
                                        <small>Precio Promedio</small>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="card border-warning">
                                    <div class="card-body">
                                        <h3 class="text-warning">${Utils.formatearPrecio(stats.maximo)}</h3>
                                        <small>Precio Máximo</small>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="card border-info">
                                    <div class="card-body">
                                        <h3 class="text-info">${Utils.formatearPrecio(stats.minimo)}</h3>
                                        <small>Precio Mínimo</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <h6>Distribución por Marca:</h6>
                        <ul class="list-group">
                            ${Object.entries(stats.porMarca).map(([marca, cantidad]) => 
                                `<li class="list-group-item d-flex justify-content-between">
                                    <span>${Utils.capitalizar(marca)}</span>
                                    <span class="badge bg-primary">${cantidad}</span>
                                </li>`
                            ).join('')}
                        </ul>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remover modal anterior si existe
    const modalAnterior = document.getElementById('modalEstadisticas');
    if (modalAnterior) {
        modalAnterior.remove();
    }
    
    // Agregar modal al DOM
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('modalEstadisticas'));
    modal.show();
}

/**
 * Actualizar estadísticas en el dashboard
 */
function actualizarEstadisticas() {
    const stats = Estadisticas.obtenerEstadisticasCompletas(pinturasCache);
    
    // Actualizar elementos del dashboard
    const totalElement = document.getElementById('total-pinturas');
    const promedioElement = document.getElementById('precio-promedio');
    const maximoElement = document.getElementById('precio-maximo');
    const minimoElement = document.getElementById('precio-minimo');
    
    if (totalElement) totalElement.textContent = stats.total;
    if (promedioElement) promedioElement.textContent = Utils.formatearPrecio(stats.promedio);
    if (maximoElement) maximoElement.textContent = Utils.formatearPrecio(stats.maximo);
    if (minimoElement) minimoElement.textContent = Utils.formatearPrecio(stats.minimo);
}

/**
 * Exportar datos a CSV
 */
function exportarCSV() {
    if (pinturasCache.length === 0) {
        Notificaciones.advertencia('No hay pinturas para exportar');
        return;
    }
    
    // Crear contenido CSV
    const headers = ['ID', 'Marca', 'Precio', 'Color', 'Cantidad'];
    const csvContent = [
        headers.join(','),
        ...pinturasCache.map(pintura => [
            pintura.id,
            `"${pintura.marca}"`,
            pintura.precio,
            pintura.color,
            pintura.cantidad
        ].join(','))
    ].join('\n');
    
    // Crear y descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `pinturas_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    Notificaciones.exito('Archivo CSV descargado correctamente');
}

//==========================================
// FUNCIONES DE CONFIRMACIÓN
//==========================================

/**
 * Confirmar eliminación de pintura
 */
function confirmarEliminar(id, marca) {
    const confirmar = confirm(`¿Estás seguro de que deseas eliminar la pintura "${marca}" (ID: ${id})?`);
    
    if (confirmar) {
        eliminarPintura(id);
    }
}

/**
 * Eliminar pintura
 */
async function eliminarPintura(id) {
    try {
        await PinturasAPI.eliminarPintura(id);
        await cargarPinturas();
        Notificaciones.exito('Pintura eliminada correctamente');
        
    } catch (error) {
        console.error('Error al eliminar pintura:', error);
        Notificaciones.error(APIUtils.manejarError(error));
    }
}

// Función del carrusel eliminada completamente