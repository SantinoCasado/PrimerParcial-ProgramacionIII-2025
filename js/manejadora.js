//========================================
// SISTEMA DE GESTIÓN DE PINTURAS - UTN
// Programación III - Primer Parcial
// Autor: Casado Santino
//========================================


// 1. CONFIGURACIÓN Y CONSTANTES
const BASE_URL = "https://utnfra-api-pinturas.onrender.com/pinturas";

// 2. VARIABLES GLOBALES
let pinturasCache = [];
let pinturaEnEdicion = null;
let pinturasFiltradas = [];


// 3. CONSTANTES DE ELEMENTOS DOM
// Elementos de navegación
const NAV_INICIO = 'nav-inicio';
const NAV_ALTA = 'nav-alta';
const NAV_LISTADO = 'nav-listado';
const NAV_ESTADISTICAS = 'nav-estadisticas';
const BTN_MODO_OSCURO = 'btn-modo-oscuro';

// Elementos del dashboard
const BTN_IR_ALTA = 'btn-ir-alta';
const BTN_IR_LISTADO = 'btn-ir-listado';
const BTN_IR_ESTADISTICAS = 'btn-ir-estadisticas';

// Elementos de estadísticas
const BTN_CALCULAR_PROMEDIO = 'btn-calcular-promedio';
const BTN_ESTADISTICAS_COMPLETAS = 'btn-estadisticas-completas';
const BTN_EXPORTAR_CSV = 'btn-exportar-csv';

// 4. ELEMENTOS DEL DOM
let panelDerecho, inputId, inputMarca, inputPrecio, inputColor, inputCantidad;
let btnAgregar, btnModificar, btnLimpiar, btnFiltros;

// 5. INICIALIZACIÓN
document.addEventListener("DOMContentLoaded", () => {
    inicializarElementosDOM();
    configurarEventos();
    inicializarAplicacion();
});

function inicializarElementosDOM() {
    panelDerecho = document.getElementById("divListado");
    inputId = document.getElementById("inputID");
    inputMarca = document.getElementById("inputMarca");
    inputPrecio = document.getElementById("inputPrecio");
    inputColor = document.getElementById("inputColor");
    inputCantidad = document.getElementById("inputCantidad");
    btnAgregar = document.getElementById("btnAgregar");
    btnModificar = document.getElementById("btnModificar");
    btnLimpiar = document.getElementById("btnLimpiar");
    btnFiltros = document.getElementById("btnFiltros");
}

function configurarEventos() {
    // Eventos de formulario
    btnAgregar.addEventListener("click", (e) => {
        e.preventDefault();
        agregarPintura();
    });

    btnModificar.addEventListener("click", (e) => {
        e.preventDefault();
        modificarPintura();
    });

    btnLimpiar.addEventListener("click", (e) => {
        e.preventDefault();
        limpiarFormulario();
    });

    btnFiltros.addEventListener("click", (e) => {
        e.preventDefault();
        filtrarPorMarca();
    });

    // Eventos de navegación
    document.getElementById(NAV_INICIO).addEventListener("click", (e) => {
        e.preventDefault();
        mostrarTab('inicio');
    });

    document.getElementById(NAV_ALTA).addEventListener("click", (e) => {
        e.preventDefault();
        mostrarTab('alta');
    });

    document.getElementById(NAV_LISTADO).addEventListener("click", (e) => {
        e.preventDefault();
        mostrarTab('listado');
    });

    document.getElementById(NAV_ESTADISTICAS).addEventListener("click", (e) => {
        e.preventDefault();
        mostrarTab('estadisticas');
    });

    document.getElementById(BTN_MODO_OSCURO).addEventListener("click", (e) => {
        e.preventDefault();
        alternarModoOscuro();
    });

    // Eventos del dashboard
    document.getElementById(BTN_IR_ALTA).addEventListener("click", (e) => {
        e.preventDefault();
        mostrarTab('alta');
    });

    document.getElementById(BTN_IR_LISTADO).addEventListener("click", (e) => {
        e.preventDefault();
        mostrarTab('listado');
    });

    document.getElementById(BTN_IR_ESTADISTICAS).addEventListener("click", (e) => {
        e.preventDefault();
        mostrarTab('estadisticas');
    });

    // Eventos de estadísticas
    document.getElementById(BTN_CALCULAR_PROMEDIO).addEventListener("click", (e) => {
        e.preventDefault();
        calcularPromedio();
    });

    document.getElementById(BTN_ESTADISTICAS_COMPLETAS).addEventListener("click", (e) => {
        e.preventDefault();
        mostrarEstadisticasCompletas();
    });

    document.getElementById(BTN_EXPORTAR_CSV).addEventListener("click", (e) => {
        e.preventDefault();
        exportarCSV();
    });
}

function inicializarAplicacion() {
    cargarPinturas();
    mostrarTab('inicio');
    actualizarEstadisticas();
    inicializarModoOscuro();
}

//==========================================
// 6. FUNCIONES ASÍNCRONAS - API
//==========================================

async function cargarPinturas() {
    try {
        mostrarSpinner(true);

        const res = await fetch(BASE_URL);
        
        if (!res.ok) throw new Error(`Error en la respuesta de la API. Status: ${res.status}`);

        const data = await res.json();
        
        pinturasCache = Array.isArray(data) ? data : [];
        
        mostrarPinturas(pinturasCache);
        actualizarEstadisticas();
    } catch (error) {
        console.error("Error al cargar las pinturas:", error);
        mostrarMensajeError(panelDerecho, `Error al cargar las pinturas: ${error.message}`);
    } finally {
        mostrarSpinner(false);
    }
}

    async function consultarPintura(id) {
        try {
            const res = await fetch(`${BASE_URL}/${id}`);
            
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

            const respuesta = await res.json();
            
            // La API devuelve {exito: true, pintura: {...}}
            if (!respuesta.exito || !respuesta.pintura) {
                throw new Error("Respuesta inválida de la API");
            }
            
            const pintura = respuesta.pintura;
            
            if (!pintura || !pintura.id) throw new Error("Pintura no encontrada");

            // Completar el formulario con los datos recibidos
            inputId.value = pintura.id ?? "";
            inputMarca.value = pintura.marca ?? "";
            inputPrecio.value = pintura.precio ?? "";
            inputColor.value = pintura.color ?? "#ff0000";
            inputCantidad.value = pintura.cantidad ?? "";
            
            // Configurar modo edición
            pinturaEnEdicion = pintura;

            // Cambiar automáticamente al tab de Alta para modificar
            mostrarTab('alta');
            
            mostrarAlerta(`Pintura ID ${pintura.id} cargada para modificación`, "info");

        } catch (err) {
            console.error("Error al consultar pintura:", err);
            // En caso de error, mostrar mensaje y luego restaurar la tabla
            mostrarMensajeError(panelDerecho, `Error al consultar la pintura: ${err.message}`);
            setTimeout(() => {
                mostrarPinturas(pinturasCache);
            }, 2000);
        }
    }

    // Función para agregar pintura
    async function agregarPintura() {
        // Validar formulario antes de proceder
        if (!manejarEnvioFormulario()) {
            return;
        }

        // Para nuevas pinturas, NO enviamos el ID (se autogenera en el servidor)
        const payload = {
            marca: inputMarca.value.trim(),
            precio: parseFloat(inputPrecio.value),
            color: inputColor.value,
            cantidad: parseInt(inputCantidad.value, 10)
        };
        
        try {
            const res = await fetch(BASE_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

            mostrarAlerta("Pintura agregada correctamente", "success");
            await cargarPinturas(); // Recargar la lista de pinturas
            limpiarFormulario(); // Limpiar formulario
            actualizarEstadisticas(); // Actualizar estadísticas
            
        } catch (err) {
            console.error("Error al agregar pintura:", err);
            mostrarAlerta("Error al agregar la pintura", "danger");
        }
    }

    // Función para modificar pintura
    async function modificarPintura() {
        if (!pinturaEnEdicion) {
            mostrarAlerta("No hay ninguna pintura seleccionada para modificar", "warning");
            return;
        }

        // Validar formulario antes de proceder
        if (!manejarEnvioFormulario()) {
            return;
        }
        
        const payload = {
            marca: inputMarca.value.trim(),
            precio: parseFloat(inputPrecio.value),
            color: inputColor.value,
            cantidad: parseInt(inputCantidad.value, 10)
        };

        try {
            const res = await fetch(`${BASE_URL}/${pinturaEnEdicion.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

            mostrarAlerta("Pintura modificada correctamente", "success");
            await cargarPinturas(); // Actualizar tabla
            limpiarFormulario(); // Limpiar formulario
            actualizarEstadisticas(); // Actualizar estadísticas
            
        } catch (err) {
            console.error("Error al modificar pintura:", err);
            mostrarAlerta("Error al modificar la pintura", "danger");
        }
    }

    // Función para eliminar pintura
    async function eliminarPintura(id) {
        try {
            const res = await fetch(`${BASE_URL}/${id}`, {
                method: "DELETE"
            });

            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

            alert("Pintura eliminada correctamente");
            await cargarPinturas(); // Recargar la tabla
            actualizarEstadisticas(); // Actualizar estadísticas
            
            // Si la pintura eliminada estaba seleccionada, limpiar el formulario
            if (pinturaEnEdicion && pinturaEnEdicion.id === id) {
                limpiarFormulario();
            }
            
        } catch (err) {
            console.error("Error al eliminar pintura:", err);
            alert("Error al eliminar la pintura");
        }
    }

    // ------------------------ Funciones de UI  -----------------------//
    // Función para mostrar las pinturas en el panel derecho (responsive y accesible)
    function mostrarPinturas(pinturas) {
        // Limpiar el panel derecho antes de agregar la tabla
        panelDerecho.innerHTML = "";

        // Crear contenedor con tarjeta para la tabla
        const cardContainer = document.createElement("div");
        cardContainer.className = "card border-0 shadow";
        
        const cardHeader = document.createElement("div");
        cardHeader.className = "card-header bg-success text-white";
        cardHeader.innerHTML = `
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
                <h5 class="mb-2 mb-md-0">
                    <i class="bi bi-list-ul me-2"></i>
                    Lista de Pinturas <span class="badge bg-light text-dark ms-2">${pinturas.length}</span>
                </h5>
                <div class="d-flex flex-wrap gap-2">
                    <button type="button" id="btn-ordenar-precio" class="btn btn-outline-light btn-sm">
                        <i class="bi bi-sort-numeric-down me-1"></i>
                        <span class="d-none d-sm-inline">Ordenar por precio</span>
                        <span class="d-sm-none">Ordenar</span>
                    </button>
                    <button type="button" id="btn-mostrar-todas" class="btn btn-outline-light btn-sm">
                        <i class="bi bi-arrow-clockwise me-1"></i>
                        <span class="d-none d-sm-inline">Orden predeterminado</span>
                        <span class="d-sm-none">Reset</span>
                    </button>
                </div>
            </div>
        `;
        cardContainer.appendChild(cardHeader);
        
        const cardBody = document.createElement("div");
        cardBody.className = "card-body p-0";
        
        // Crear contenedor responsive para la tabla
        const tableContainer = document.createElement("div");
        tableContainer.className = "table-responsive";
        
        // Crear la tabla y agregar clases de Bootstrap 
        const tabla = document.createElement("table");
        tabla.className = "table table-hover table-striped mb-0";
        tabla.setAttribute("role", "table");
        tabla.setAttribute("aria-label", "Lista de pinturas disponibles");

        // Crear el encabezado de la tabla con mejor estilo
        const thead = document.createElement("thead");
        thead.className = "table-dark sticky-top";
        thead.style.backgroundColor = "#198754";
        thead.innerHTML = `
            <tr style="color: white;">
                <th scope="col" class="text-center" style="min-width: 80px;">
                    <i class="bi bi-hash"></i> 
                    <span class="d-none d-sm-inline">ID</span>
                </th>
                <th scope="col" style="min-width: 120px;">
                    <i class="bi bi-tags"></i> MARCA
                </th>
                <th scope="col" class="text-center" style="min-width: 100px;">
                    <i class="bi bi-currency-dollar"></i> 
                    <span class="d-none d-md-inline">PRECIO</span>
                    <span class="d-md-none">$</span>
                </th>
                <th scope="col" class="text-center" style="min-width: 80px;">
                    <i class="bi bi-palette"></i> 
                    <span class="d-none d-lg-inline">COLOR</span>
                </th>
                <th scope="col" class="text-center" style="min-width: 80px;">
                    <i class="bi bi-box-seam"></i> 
                    <span class="d-none d-md-inline">CANT.</span>
                    <span class="d-md-none">Q</span>
                </th>
                <th scope="col" class="text-center" style="min-width: 120px;">
                    <i class="bi bi-gear"></i> 
                    <span class="d-none d-lg-inline">ACCIONES</span>
                </th>
            </tr>
        `;
        tabla.appendChild(thead);

        // Crear el cuerpo de la tabla
        const tbody = document.createElement("tbody");
        pinturas.forEach(pintura => {
            const tr = document.createElement("tr");
            
            // Crear y agregar las celdas a la fila de la tabla
            const tdID = document.createElement("td");
            //cada ID es un enlace estilizado
            tdID.className = "text-center";
            const enlaceID = document.createElement("a");
            enlaceID.href = "#";
            enlaceID.className = "btn btn-outline-primary btn-sm fw-bold";
            enlaceID.innerHTML = `<i class="bi bi-pencil-square me-1"></i>${pintura.id ?? ""}`; // Icono de editar
            enlaceID.title = "Editar pintura";
            
            // Evento click para editar pintura - redirige al formulario
            enlaceID.addEventListener("click", (e) => {
                e.preventDefault();
                consultarPintura(pintura.id);
            });
            
            tdID.appendChild(enlaceID);
            tr.appendChild(tdID);

            const tdNombre = document.createElement("td");
            tdNombre.className = "fw-semibold";
            tdNombre.innerHTML = `<i class="bi bi-tag text-muted me-2"></i>${pintura.marca ?? ""}`;
            tr.appendChild(tdNombre);

            const tdPrecio = document.createElement("td");
            tdPrecio.innerHTML = `<i class="bi bi-cash text-muted me-2"></i>$${pintura.precio ?? ""}`;
            tr.appendChild(tdPrecio);

            const tdColor = document.createElement("td");
            tdColor.innerHTML = `
                <div class="d-flex align-items-center">
                    <span class="color-square me-2" style="background-color: ${pintura.color}; width: 20px; height: 20px; border: 1px solid #ccc; border-radius: 3px; display: inline-block;"></span>
                    <span class="small text-muted">${pintura.color ?? ""}</span>
                </div>
            `;
            tr.appendChild(tdColor);

            const tdCantidad = document.createElement("td");
            tdCantidad.className = "text-center";
            tdCantidad.innerHTML = `<i class="bi bi-box-seam text-muted me-2"></i>${pintura.cantidad ?? ""}`;
            tr.appendChild(tdCantidad);

            // Columna de acciones con botones
            const tdAcciones = document.createElement("td");
            tdAcciones.className = "text-center";
            
            // Botón seleccionar
            const btnSeleccionar = document.createElement("button");
            btnSeleccionar.className = "btn btn-warning btn-sm me-2";
            btnSeleccionar.innerHTML = '<i class="bi bi-hand-index"></i>';
            btnSeleccionar.title = "Seleccionar pintura";
            btnSeleccionar.addEventListener("click", () => {
                consultarPintura(pintura.id);
            });
            
            // Botón eliminar
            const btnEliminar = document.createElement("button");
            btnEliminar.className = "btn btn-danger btn-sm";
            btnEliminar.innerHTML = '<i class="bi bi-trash3"></i>';
            btnEliminar.title = "Eliminar pintura";
            btnEliminar.addEventListener("click", () => {
                if (confirm(`¿Está seguro de eliminar la pintura "${pintura.marca}"?`)) {
                    eliminarPintura(pintura.id);
                }
            });
            
            tdAcciones.appendChild(btnSeleccionar);
            tdAcciones.appendChild(btnEliminar);
            tr.appendChild(tdAcciones);

            tbody.appendChild(tr); // Agregar la fila al cuerpo de la tabla
        });
        tabla.appendChild(tbody);
        
        // Ensamblar la estructura responsive
        tableContainer.appendChild(tabla);
        cardBody.appendChild(tableContainer);
        cardContainer.appendChild(cardBody);
        
        // Agregar footer con información
        const cardFooter = document.createElement("div");
        cardFooter.className = "card-footer bg-info text-dark small";
        cardFooter.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <span><i class="bi bi-info-circle me-1"></i>Total de pinturas: ${pinturas.length}</span>
                <span><i class="bi bi-clock me-1"></i>Actualizado: ${new Date().toLocaleString()}</span>
            </div>
        `;
        cardContainer.appendChild(cardFooter);

        // Agregar la tarjeta completa al panel derecho
        panelDerecho.appendChild(cardContainer);
        
        // Configurar eventos de botones dinámicos
        configurarEventosDinamicos();
    }

function configurarEventosDinamicos() {
    // Eventos de botones dinámicos en la tabla
    const btnOrdenarPrecio = document.getElementById('btn-ordenar-precio');
    const btnMostrarTodas = document.getElementById('btn-mostrar-todas');
    
    if (btnOrdenarPrecio) {
        btnOrdenarPrecio.addEventListener('click', (e) => {
            e.preventDefault();
            ordenarPorPrecio();
        });
    }
    
    if (btnMostrarTodas) {
        btnMostrarTodas.addEventListener('click', (e) => {
            e.preventDefault();
            mostrarTodasLasPinturas();
        });
    }
}

//==========================================
// 7. FUNCIONES DE FORMULARIO
//==========================================

    // Función para limpiar el formulario
    function limpiarFormulario() {
        // Para nuevas pinturas, mostrar que el ID se asignará automáticamente
        inputId.value = '(Se asignará automáticamente)';
        inputMarca.value = '';
        inputPrecio.value = '';
        inputColor.value = '#ff0000';
        inputCantidad.value = '';
        
        // El ID siempre es readonly (solo informativo)
        inputId.readOnly = true;
        
        // Limpiar todas las clases de validación y mensajes de error
        const form = document.getElementById('frmFormulario');
        const todosLosCampos = form.querySelectorAll('input');
        todosLosCampos.forEach(campo => {
            campo.classList.remove('is-valid', 'is-invalid');
        });
        
        const todosLosErrores = form.querySelectorAll('.invalid-feedback');
        todosLosErrores.forEach(error => error.textContent = '');
        
        pinturaEnEdicion = null;
    }

    // Función para validar el formulario y mostrar errores
    function manejarEnvioFormulario() {
        const form = document.getElementById('frmFormulario');
        let hayErrores = false;
        
        // Limpiar errores previos
        const todosLosErrores = form.querySelectorAll('.invalid-feedback');
        todosLosErrores.forEach(error => error.textContent = '');
        
        // Validar todos los campos obligatorios manualmente
        const camposValidar = [
            { elemento: inputMarca, id: 'inputMarca', nombre: 'La marca' },
            { elemento: inputPrecio, id: 'inputPrecio', nombre: 'El precio' },
            { elemento: inputCantidad, id: 'inputCantidad', nombre: 'La cantidad' }
        ];
        
        camposValidar.forEach(campo => {
            const errorDiv = document.getElementById(`error-${campo.id}`);
            
            // Verificar si está vacío
            if (!campo.elemento.value || campo.elemento.value.trim() === '') {
                if (errorDiv) {
                    errorDiv.textContent = ` ${campo.nombre} es obligatorio y no ha sido completado.`;
                }
                campo.elemento.classList.add('is-invalid');
                hayErrores = true;
            }
            // Validar reglas específicas si tiene valor
            else {
                // Validar precio (rango)
                if (campo.id === 'inputPrecio') {
                    const precio = parseFloat(campo.elemento.value);
                    if (isNaN(precio) || precio < 50 || precio > 500) {
                        if (errorDiv) {
                            errorDiv.textContent = " El precio debe estar entre 50 y 500 USD.";
                        }
                        campo.elemento.classList.add('is-invalid');
                        hayErrores = true;
                    }
                }
                // Validar cantidad (rango)
                else if (campo.id === 'inputCantidad') {
                    const cantidad = parseInt(campo.elemento.value);
                    if (isNaN(cantidad) || cantidad < 1 || cantidad > 400) {
                        if (errorDiv) {
                            errorDiv.textContent = " La cantidad debe estar entre 1 y 400.";
                        }
                        campo.elemento.classList.add('is-invalid');
                        hayErrores = true;
                    }
                }
                
                // Si llegó aquí sin errores, marcar como válido
                if (!campo.elemento.classList.contains('is-invalid')) {
                    campo.elemento.classList.add('is-valid');
                }
            }
        });
        
        // Si hay errores, retornar false
        if (hayErrores) {
            return false;
        }
        
        // Si no hay errores, retornar true
        return true;
    }

    //------------------------ Funciones de filtros y cálculos ------------------------//
    // Función para filtrar pinturas por marca
    function filtrarPorMarca() {
        const marcaFiltro = inputMarca.value.trim().toLowerCase();
        
        if (!marcaFiltro) {
            mostrarAlerta("Ingrese una marca para filtrar", "warning");
            return;
        }
        
        // Filtrar pinturas que contengan la marca buscada
        pinturasFiltradas = pinturasCache.filter(pintura => {
            const marcaPintura = pintura.marca ? pintura.marca.toLowerCase() : '';
            return pintura.marca && marcaPintura.includes(marcaFiltro);
        });
        
        if (pinturasFiltradas.length === 0) {
            mostrarAlerta(`No se encontraron pinturas con la marca "${inputMarca.value.trim()}"`, "info");
            // Mostrar mensaje en la tabla
            panelDerecho.innerHTML = `
                <div class="alert alert-info text-center" role="alert">
                    <i class="bi bi-info-circle me-2"></i>
                    No se encontraron pinturas con la marca "${inputMarca.value.trim()}"
                    <br><br>
                    <button id="btn-mostrar-todas-filtro" class="btn btn-primary btn-sm">
                        <i class="bi bi-arrow-clockwise me-1"></i>Mostrar todas
                    </button>
                </div>
            `;
            
            // Configurar evento del botón
            const btnMostrarTodasFiltro = document.getElementById('btn-mostrar-todas-filtro');
            if (btnMostrarTodasFiltro) {
                btnMostrarTodasFiltro.addEventListener('click', (e) => {
                    e.preventDefault();
                    mostrarTodasLasPinturas();
                });
            }
        } else {
            mostrarAlerta(`Se encontraron ${pinturasFiltradas.length} pintura(s) con la marca "${inputMarca.value.trim()}"`, "success");
            mostrarPinturas(pinturasFiltradas);
        }
    }
    
    // Función para mostrar todas las pinturas (quitar filtro)
    function mostrarTodasLasPinturas() {
        pinturasFiltradas = [];
        
        // Cambiar a la pestaña de listado PRIMERO
        mostrarTab('listado');
        
        // Ordenar por ID por defecto para mejor organización
        const pinturasOrdenadas = [...pinturasCache].sort((a, b) => {
            const idA = parseInt(a.id) || 0;
            const idB = parseInt(b.id) || 0;
            return idA - idB;
        });
        
        // Esperar un momento para que se complete el cambio de tab
        setTimeout(() => {
            mostrarPinturas(pinturasOrdenadas);
            mostrarAlerta("Pinturas restauradas al orden predeterminado (por ID)", "info");
        }, 100);
    }
    
    // Función para ordenar pinturas por precio (de menor a mayor)
    function ordenarPorPrecio() {
        let pinturasParaOrdenar;
        let tipoOrden = "todas las pinturas";
        
        // Determinar qué pinturas ordenar (filtradas o todas)
        if (pinturasFiltradas.length > 0) {
            pinturasParaOrdenar = [...pinturasFiltradas];
            tipoOrden = "pinturas filtradas";
        } else {
            pinturasParaOrdenar = [...pinturasCache];
        }
        
        if (pinturasParaOrdenar.length === 0) {
            mostrarAlerta("No hay pinturas para ordenar", "warning");
            return;
        }
        
        // Cambiar a la pestaña de listado PRIMERO
        mostrarTab('listado');
        
        // Ordenar por precio (de menor a mayor)
        pinturasParaOrdenar.sort((a, b) => {
            const precioA = parseFloat(a.precio) || 0;
            const precioB = parseFloat(b.precio) || 0;
            return precioA - precioB;
        });
        
        // Actualizar las pinturas filtradas si había filtro activo
        if (pinturasFiltradas.length > 0) {
            pinturasFiltradas = pinturasParaOrdenar;
        }
        
        // Esperar un momento para que se complete el cambio de tab
        setTimeout(() => {
            mostrarPinturas(pinturasParaOrdenar);
            mostrarAlerta(`${tipoOrden} ordenadas por precio (menor a mayor)`, "success");
        }, 100);
    }
    
    //------------------------ Funciones de interfaz y navegación ------------------------//
    // Función para mostrar tabs
    function mostrarTab(tabName) {
        // Ocultar todos los tabs
        const tabs = document.querySelectorAll('.tab-content-custom');
        tabs.forEach(tab => tab.style.display = 'none');
        
        // Mostrar el tab seleccionado
        const tabActivo = document.getElementById(`tab-${tabName}`);
        if (tabActivo) {
            tabActivo.style.display = 'block';
        }
        
        // Actualizar navegación
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        navLinks.forEach(link => link.classList.remove('active'));
        
        // Marcar como activo el enlace correspondiente usando data-tab
        const enlaceActivo = document.querySelector(`[data-tab="${tabName}"]`);
        if (enlaceActivo) {
            enlaceActivo.classList.add('active');
        }
        
        // Si se muestra el listado, cargar datos
        if (tabName === 'listado') {
            mostrarPinturas(pinturasCache);
        }
        
        // Si se muestra estadísticas, actualizar
        if (tabName === 'estadisticas') {
            actualizarEstadisticas();
        }
    }
    
    // Función para actualizar estadísticas en tiempo real
    function actualizarEstadisticas() {
        if (pinturasCache.length === 0) {
            document.getElementById('total-pinturas').textContent = '0';
            document.getElementById('precio-promedio').textContent = '$0.00';
            document.getElementById('precio-maximo').textContent = '$0.00';
            document.getElementById('precio-minimo').textContent = '$0.00';
            return;
        }
        
        const precios = pinturasCache.map(p => parseFloat(p.precio) || 0);
        const total = pinturasCache.length;
        const promedio = precios.reduce((sum, precio) => sum + precio, 0) / total;
        const maximo = Math.max(...precios);
        const minimo = Math.min(...precios);
        
        document.getElementById('total-pinturas').textContent = total;
        document.getElementById('precio-promedio').textContent = `$${promedio.toFixed(2)}`;
        document.getElementById('precio-maximo').textContent = `$${maximo.toFixed(2)}`;
        document.getElementById('precio-minimo').textContent = `$${minimo.toFixed(2)}`;
    }

    //------------------------ Funciones estadísticas avanzadas ------------------------//
    
    // Función para mostrar estadísticas completas en modal
    function mostrarEstadisticasCompletas() {
        if (pinturasCache.length === 0) {
            mostrarAlerta("No hay pinturas para mostrar estadísticas", "warning");
            return;
        }

        // Calcular estadísticas básicas
        const precios = pinturasCache.map(p => parseFloat(p.precio) || 0);
        const total = pinturasCache.length;
        const promedio = precios.reduce((sum, precio) => sum + precio, 0) / total;
        const maximo = Math.max(...precios);
        const minimo = Math.min(...precios);

        // Encontrar marca más común
        const marcas = pinturasCache.map(p => p.marca);
        const conteoMarcas = marcas.reduce((acc, marca) => {
            acc[marca] = (acc[marca] || 0) + 1;
            return acc;
        }, {});
        const marcaMasComun = Object.keys(conteoMarcas).reduce((a, b) => 
            conteoMarcas[a] > conteoMarcas[b] ? a : b
        );

        // Encontrar pintura más cara
        const pinturaMasCara = pinturasCache.reduce((prev, current) => 
            (parseFloat(prev.precio) > parseFloat(current.precio)) ? prev : current
        );

        // Promedio por marca
        const promediosPorMarca = Object.keys(conteoMarcas).reduce((acc, marca) => {
            const pinturasDeEstaMarca = pinturasCache.filter(p => p.marca === marca);
            const preciosMarca = pinturasDeEstaMarca.map(p => parseFloat(p.precio) || 0);
            const promedioMarca = preciosMarca.reduce((sum, precio) => sum + precio, 0) / preciosMarca.length;
            acc[marca] = promedioMarca;
            return acc;
        }, {});

        // Crear contenido del modal
        const modalContent = `
            <div class="modal fade" id="estadisticasModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header" style="background-color: var(--color-dark); color: white;">
                            <h5 class="modal-title">
                                <i class="bi bi-graph-up me-2"></i>Estadísticas Completas
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6 mb-4">
                                    <h6><i class="bi bi-info-circle me-2"></i>Estadísticas Generales</h6>
                                    <ul class="list-group">
                                        <li class="list-group-item d-flex justify-content-between">
                                            <span>Total de pinturas:</span>
                                            <strong>${total}</strong>
                                        </li>
                                        <li class="list-group-item d-flex justify-content-between">
                                            <span>Precio promedio:</span>
                                            <strong>$${promedio.toFixed(2)}</strong>
                                        </li>
                                        <li class="list-group-item d-flex justify-content-between">
                                            <span>Precio máximo:</span>
                                            <strong>$${maximo.toFixed(2)}</strong>
                                        </li>
                                        <li class="list-group-item d-flex justify-content-between">
                                            <span>Precio mínimo:</span>
                                            <strong>$${minimo.toFixed(2)}</strong>
                                        </li>
                                    </ul>
                                </div>
                                <div class="col-md-6 mb-4">
                                    <h6><i class="bi bi-star me-2"></i>Destacados</h6>
                                    <ul class="list-group">
                                        <li class="list-group-item">
                                            <span>Marca más común:</span><br>
                                            <strong>${marcaMasComun}</strong> (${conteoMarcas[marcaMasComun]} pinturas)
                                        </li>
                                        <li class="list-group-item">
                                            <span>Pintura más cara:</span><br>
                                            <strong>${pinturaMasCara.marca}</strong> - $${pinturaMasCara.precio}
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-12">
                                    <h6><i class="bi bi-bar-chart me-2"></i>Promedio por Marca</h6>
                                    <div class="list-group">
                                        ${Object.entries(promediosPorMarca).map(([marca, promedio]) => `
                                            <div class="list-group-item">
                                                <div class="d-flex justify-content-between align-items-center">
                                                    <span><strong>${marca}</strong></span>
                                                    <span>$${promedio.toFixed(2)}</span>
                                                </div>
                                                <div class="progress mt-2" style="height: 10px;">
                                                    <div class="progress-bar" style="width: ${(promedio / Math.max(...Object.values(promediosPorMarca))) * 100}%; background-color: var(--color-accent);"></div>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                            <button type="button" id="btn-exportar-csv-modal" class="btn btn-primary">
                                <i class="bi bi-download me-1"></i>Exportar CSV
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Agregar modal al DOM si no existe
        let modalExistente = document.getElementById('estadisticasModal');
        if (modalExistente) {
            modalExistente.remove();
        }
        
        document.body.insertAdjacentHTML('beforeend', modalContent);
        
        // Configurar evento del botón exportar en el modal
        const btnExportarModal = document.getElementById('btn-exportar-csv-modal');
        if (btnExportarModal) {
            btnExportarModal.addEventListener('click', (e) => {
                e.preventDefault();
                exportarCSV();
            });
        }
        
        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('estadisticasModal'));
        modal.show();
    }

    // Función para exportar datos a CSV
    function exportarCSV() {
        if (pinturasCache.length === 0) {
            mostrarAlerta("No hay pinturas para exportar", "warning");
            return;
        }

        // Crear encabezados CSV
        const headers = ['ID', 'Marca', 'Precio', 'Color', 'Cantidad'];
        
        // Crear filas CSV
        const rows = pinturasCache.map(pintura => [
            pintura.id,
            pintura.marca,
            pintura.precio,
            pintura.color,
            pintura.cantidad
        ]);

        // Combinar encabezados y filas
        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        // Crear y descargar archivo
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `pinturas_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        mostrarAlerta("CSV exportado exitosamente", "success");
    }

    // Función para alternar modo oscuro/claro
    function alternarModoOscuro() {
        const body = document.body;
        const isDarkMode = body.classList.toggle('dark-mode');
        
        // Guardar preferencia en localStorage
        localStorage.setItem('darkMode', isDarkMode);
        
        // Actualizar texto del botón
        const btn = document.getElementById(BTN_MODO_OSCURO);
        if (btn) {
            btn.innerHTML = isDarkMode 
                ? '<i class="bi bi-sun me-1"></i>Modo Claro'
                : '<i class="bi bi-moon me-1"></i>Modo Oscuro';
        }
    }

    // Función para inicializar modo oscuro desde localStorage
    function inicializarModoOscuro() {
        const darkMode = localStorage.getItem('darkMode') === 'true';
        if (darkMode) {
            document.body.classList.add('dark-mode');
            const btn = document.getElementById(BTN_MODO_OSCURO);
            if (btn) {
                btn.innerHTML = '<i class="bi bi-sun me-1"></i>Modo Claro';
            }
        }
    }
    
    // Función para calcular el promedio de precios
    function calcularPromedio() {
        if (pinturasCache.length === 0) {
            mostrarAlerta("No hay pinturas para calcular el promedio", "warning");
            return;
        }
        
        // Calcular la suma de todos los precios
        const sumaPrecios = pinturasCache.reduce((suma, pintura) => {
            const precio = parseFloat(pintura.precio) || 0;
            return suma + precio;
        }, 0);
        
        // Calcular el promedio
        const promedio = sumaPrecios / pinturasCache.length;
        
        // Actualizar las estadísticas en tiempo real
        actualizarEstadisticas();
        
        // Mostrar el resultado con alert y cambiar a estadísticas
        alert(`Precio promedio de las pinturas: $${promedio.toFixed(2)} USD\n\nTotal de pinturas: ${pinturasCache.length}\nSuma total: $${sumaPrecios.toFixed(2)} USD`);
        
        // Cambiar a la pestaña de estadísticas para mostrar los datos actualizados
        mostrarTab('estadisticas');
        
        console.log("Cálculo de promedio:", {
            totalPinturas: pinturasCache.length,
            sumaPrecios: sumaPrecios,
            promedio: promedio
        });
}

//==========================================
// 12. FUNCIONES AUXILIARES
//==========================================

function mostrarSpinner(mostrar = true) {
    if (mostrar) {
        panelDerecho.innerHTML = `
            <div class="d-flex justify-content-center align-items-center" style="height: 200px;">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando pinturas...</span>
                </div>
            </div>
        `;
    }
}

function mostrarMensajeError(elemento, mensaje) {
    elemento.innerHTML = `
        <div class="alert alert-danger d-flex align-items-center" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            <div>${mensaje}</div>
        </div>`;
}

function mostrarAlerta(mensaje, tipo = 'info') {
    const alertaDiv = document.createElement('div');
    alertaDiv.className = `alert alert-${tipo} alert-dismissible fade show position-fixed`;
    alertaDiv.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
    
    alertaDiv.innerHTML = `
        <strong>${tipo === 'success' ? '¡Éxito!' : tipo === 'danger' ? '¡Error!' : '¡Atención!'}</strong> ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertaDiv);
    
    setTimeout(() => {
        if (alertaDiv.parentNode) {
            alertaDiv.remove();
        }
    }, 4000);
}

