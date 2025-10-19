//========================================
// UI MANAGER - SISTEMA DE GESTIÓN DE PINTURAS
// Manejo de la interfaz de usuario y componentes
// Autor: Casado Santino
//========================================

// CLASE PARA MANEJO DE TABS Y NAVEGACIÓN
class TabManager {
    
    static tabs = ['inicio', 'alta', 'listado', 'estadisticas'];
    static tabActual = 'inicio';

    /**
     * Inicializar sistema de tabs
     */
    static inicializar() {
        this.configurarEventosNavegacion();
        this.mostrarTab('inicio');
    }

    /**
     * Configurar eventos de navegación
     */
    static configurarEventosNavegacion() {
        // Eventos de navegación principal
        document.getElementById('nav-inicio')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.mostrarTab('inicio');
        });

        document.getElementById('nav-alta')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.mostrarTab('alta');
        });

        document.getElementById('nav-listado')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.mostrarTab('listado');
        });

        document.getElementById('nav-estadisticas')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.mostrarTab('estadisticas');
        });

        // Eventos de botones del dashboard
        document.getElementById('btn-ir-alta')?.addEventListener('click', () => {
            this.mostrarTab('alta');
        });

        document.getElementById('btn-ir-listado')?.addEventListener('click', () => {
            this.mostrarTab('listado');
        });

        document.getElementById('btn-ir-estadisticas')?.addEventListener('click', () => {
            this.mostrarTab('estadisticas');
        });
    }

    /**
     * Mostrar tab específico
     */
    static mostrarTab(nombreTab) {
        // Validar tab
        if (!this.tabs.includes(nombreTab)) {
            console.warn(`Tab '${nombreTab}' no existe`);
            return;
        }

        // Ocultar todos los tabs
        this.tabs.forEach(tab => {
            const elemento = document.getElementById(`tab-${tab}`);
            if (elemento) {
                elemento.style.display = 'none';
            }
        });

        // Mostrar tab seleccionado
        const tabSeleccionado = document.getElementById(`tab-${nombreTab}`);
        if (tabSeleccionado) {
            tabSeleccionado.style.display = 'block';
        }

        // Actualizar navegación
        this.actualizarNavegacion(nombreTab);
        
        // Manejar header de bienvenida
        this.manejarHeaderBienvenida(nombreTab);
        
        this.tabActual = nombreTab;
        
        // Trigger evento personalizado
        document.dispatchEvent(new CustomEvent('tabChanged', { 
            detail: { tabActual: nombreTab } 
        }));
    }

    /**
     * Actualizar estado de navegación
     */
    static actualizarNavegacion(tabActivo) {
        // Remover clase active de todos los links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Agregar clase active al link correspondiente
        const linkActivo = document.getElementById(`nav-${tabActivo}`);
        if (linkActivo) {
            linkActivo.classList.add('active');
        }
    }

    /**
     * Manejar visibilidad del header de bienvenida
     */
    static manejarHeaderBienvenida(tab) {
        const header = document.getElementById('header-bienvenida');
        if (header) {
            header.style.display = tab === 'inicio' ? 'block' : 'none';
        }
    }

    /**
     * Obtener tab actual
     */
    static obtenerTabActual() {
        return this.tabActual;
    }
}

// CLASE PARA MANEJO DEL MODO OSCURO
class ModoOscuroManager {
    
    static claveStorage = 'modo-oscuro-pinturas';

    /**
     * Inicializar modo oscuro
     */
    static inicializar() {
        this.cargarPreferencia();
        this.configurarBoton();
    }

    /**
     * Configurar botón de modo oscuro
     */
    static configurarBoton() {
        const btnModoOscuro = document.getElementById('btn-modo-oscuro');
        if (!btnModoOscuro) return;

        btnModoOscuro.addEventListener('click', () => {
            this.alternar();
        });
    }

    /**
     * Alternar entre modo claro y oscuro
     */
    static alternar() {
        const estaOscuro = document.body.classList.contains('dark-mode');
        
        if (estaOscuro) {
            this.activarModoClaro();
        } else {
            this.activarModoOscuro();
        }
    }

    /**
     * Activar modo oscuro
     */
    static activarModoOscuro() {
        document.body.classList.add('dark-mode');
        this.actualizarBoton(true);
        this.guardarPreferencia(true);
    }

    /**
     * Activar modo claro
     */
    static activarModoClaro() {
        document.body.classList.remove('dark-mode');
        this.actualizarBoton(false);
        this.guardarPreferencia(false);
    }

    /**
     * Actualizar apariencia del botón
     */
    static actualizarBoton(esModoOscuro) {
        const btnModoOscuro = document.getElementById('btn-modo-oscuro');
        if (!btnModoOscuro) return;

        const icono = btnModoOscuro.querySelector('i');
        const texto = btnModoOscuro.querySelector('span') || btnModoOscuro;

        if (esModoOscuro) {
            icono.className = 'bi bi-sun me-1';
            if (texto.textContent) {
                texto.textContent = texto.textContent.replace('Modo Oscuro', 'Modo Claro');
            }
        } else {
            icono.className = 'bi bi-moon me-1';
            if (texto.textContent) {
                texto.textContent = texto.textContent.replace('Modo Claro', 'Modo Oscuro');
            }
        }
    }

    /**
     * Guardar preferencia en localStorage
     */
    static guardarPreferencia(esModoOscuro) {
        localStorage.setItem(this.claveStorage, esModoOscuro.toString());
    }

    /**
     * Cargar preferencia del localStorage
     */
    static cargarPreferencia() {
        const preferencia = localStorage.getItem(this.claveStorage);
        
        if (preferencia === 'true') {
            this.activarModoOscuro();
        } else {
            this.activarModoClaro();
        }
    }
}

// CLASE PARA MANEJO DE FORMULARIOS
class FormularioManager {
    
    /**
     * Limpiar formulario
     */
    static limpiarFormulario() {
        const form = document.getElementById('frmFormulario');
        if (!form) return;

        // Limpiar campos
        document.getElementById('inputID').value = '';
        document.getElementById('inputMarca').value = '';
        document.getElementById('inputPrecio').value = '';
        document.getElementById('inputColor').value = '#ff0000';
        document.getElementById('inputCantidad').value = '';

        // Limpiar errores
        this.limpiarErrores();
        
        // Remover clases de validación
        form.classList.remove('was-validated');
    }

    /**
     * Obtener datos del formulario
     */
    static obtenerDatos() {
        return {
            id: document.getElementById('inputID')?.value || '',
            marca: document.getElementById('inputMarca')?.value || '',
            precio: document.getElementById('inputPrecio')?.value || '',
            color: document.getElementById('inputColor')?.value || '#ff0000',
            cantidad: document.getElementById('inputCantidad')?.value || ''
        };
    }

    /**
     * Llenar formulario con datos
     */
    static llenarFormulario(pintura) {
        if (!pintura) {
            console.error('❌ No se recibieron datos para llenar el formulario');
            return;
        }
        
        // Llenar campos con validación
        const inputID = document.getElementById('inputID');
        const inputMarca = document.getElementById('inputMarca');
        const inputPrecio = document.getElementById('inputPrecio');
        const inputColor = document.getElementById('inputColor');
        const inputCantidad = document.getElementById('inputCantidad');
        
        if (inputID) inputID.value = pintura.id || '';
        if (inputMarca) inputMarca.value = pintura.marca || '';
        if (inputPrecio) inputPrecio.value = pintura.precio || '';
        if (inputColor) inputColor.value = pintura.color || '#ff0000';
        if (inputCantidad) inputCantidad.value = pintura.cantidad || '';
        
        this.limpiarErrores();
    }

    /**
     * Mostrar errores en el formulario
     */
    static mostrarErrores(errores) {
        this.limpiarErrores();
        
        Object.keys(errores).forEach(campo => {
            const elemento = document.getElementById(`error-input${this.capitalizar(campo)}`);
            const input = document.getElementById(`input${this.capitalizar(campo)}`);
            
            if (elemento) {
                elemento.textContent = errores[campo];
                elemento.style.display = 'block';
            }
            
            if (input) {
                input.classList.add('is-invalid');
            }
        });
    }

    /**
     * Limpiar errores del formulario
     */
    static limpiarErrores() {
        document.querySelectorAll('.invalid-feedback').forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
        
        document.querySelectorAll('.form-control').forEach(input => {
            input.classList.remove('is-invalid', 'is-valid');
        });
    }

    /**
     * Capitalizar primera letra
     */
    static capitalizar(texto) {
        return texto.charAt(0).toUpperCase() + texto.slice(1);
    }

    /**
     * Deshabilitar/habilitar formulario
     */
    static establecerEstado(deshabilitado) {
        const inputs = document.querySelectorAll('#frmFormulario input');
        const botones = document.querySelectorAll('#frmFormulario button');
        
        inputs.forEach(input => {
            if (input.id !== 'inputID') { // ID siempre readonly
                input.disabled = deshabilitado;
            }
        });
        
        botones.forEach(boton => {
            boton.disabled = deshabilitado;
        });
    }
}

// CLASE PARA MANEJO DE LOADING
class LoadingManager {
    
    /**
     * Mostrar loading en elemento específico
     */
    static mostrar(elemento, mensaje = 'Cargando...') {
        if (typeof elemento === 'string') {
            elemento = document.getElementById(elemento);
        }
        
        if (!elemento) return;

        const loadingHtml = `
            <div class="d-flex justify-content-center align-items-center p-4">
                <div class="spinner-border text-primary me-3" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <span>${mensaje}</span>
            </div>
        `;
        
        elemento.innerHTML = loadingHtml;
    }

    /**
     * Ocultar loading
     */
    static ocultar(elemento) {
        if (typeof elemento === 'string') {
            elemento = document.getElementById(elemento);
        }
        
        if (!elemento) return;

        elemento.innerHTML = '';
    }

    /**
     * Mostrar loading en botón
     */
    static mostrarEnBoton(boton, mensaje = 'Procesando...') {
        if (typeof boton === 'string') {
            boton = document.getElementById(boton);
        }
        
        if (!boton) return;

        boton.disabled = true;
        boton.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status"></span>
            ${mensaje}
        `;
    }

    /**
     * Restaurar botón
     */
    static restaurarBoton(boton, textoOriginal, iconoOriginal = '') {
        if (typeof boton === 'string') {
            boton = document.getElementById(boton);
        }
        
        if (!boton) return;

        boton.disabled = false;
        boton.innerHTML = `${iconoOriginal}${textoOriginal}`;
    }
}

// EXPORTAR PARA USO GLOBAL
window.TabManager = TabManager;
window.ModoOscuroManager = ModoOscuroManager;
window.FormularioManager = FormularioManager;
window.LoadingManager = LoadingManager;