// CLASE PARA VALIDACIONES
class Validaciones {
    
    /**
     * Validar marca de pintura
     */
    static validarMarca(marca) {
        if (!marca || typeof marca !== 'string') {
            return { valida: false, mensaje: 'La marca es requerida' };
        }
        
        const marcaLimpia = marca.trim();
        
        if (marcaLimpia.length < 2) {
            return { valida: false, mensaje: 'La marca debe tener al menos 2 caracteres' };
        }
        
        if (marcaLimpia.length > 50) {
            return { valida: false, mensaje: 'La marca no puede exceder 50 caracteres' };
        }
        
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-\.]+$/.test(marcaLimpia)) {
            return { valida: false, mensaje: 'La marca contiene caracteres no permitidos' };
        }
        
        return { valida: true, mensaje: 'Marca válida' };
    }

    /**
     * Validar precio de pintura
     */
    static validarPrecio(precio) {
        const precioNum = Number(precio);
        
        if (isNaN(precioNum)) {
            return { valida: false, mensaje: 'El precio debe ser un número válido' };
        }
        
        if (precioNum < 50) {
            return { valida: false, mensaje: 'El precio mínimo es $50' };
        }
        
        if (precioNum > 500) {
            return { valida: false, mensaje: 'El precio máximo es $500' };
        }
        
        return { valida: true, mensaje: 'Precio válido' };
    }

    /**
     * Validar color hexadecimal
     */
    static validarColor(color) {
        if (!color || typeof color !== 'string') {
            return { valida: false, mensaje: 'El color es requerido' };
        }
        
        const colorRegex = /^#[0-9A-Fa-f]{6}$/;
        
        if (!colorRegex.test(color)) {
            return { valida: false, mensaje: 'El color debe ser un código hexadecimal válido (#RRGGBB)' };
        }
        
        return { valida: true, mensaje: 'Color válido' };
    }

    /**
     * Validar cantidad
     */
    static validarCantidad(cantidad) {
        const cantidadNum = Number(cantidad);
        
        if (isNaN(cantidadNum)) {
            return { valida: false, mensaje: 'La cantidad debe ser un número válido' };
        }
        
        if (!Number.isInteger(cantidadNum)) {
            return { valida: false, mensaje: 'La cantidad debe ser un número entero' };
        }
        
        if (cantidadNum < 1) {
            return { valida: false, mensaje: 'La cantidad mínima es 1' };
        }
        
        if (cantidadNum > 400) {
            return { valida: false, mensaje: 'La cantidad máxima es 400' };
        }
        
        return { valida: true, mensaje: 'Cantidad válida' };
    }

    /**
     * Validar formulario completo
     */
    static validarFormulario(datos) {
        const errores = {};
        
        const validacionMarca = this.validarMarca(datos.marca);
        if (!validacionMarca.valida) {
            errores.marca = validacionMarca.mensaje;
        }
        
        const validacionPrecio = this.validarPrecio(datos.precio);
        if (!validacionPrecio.valida) {
            errores.precio = validacionPrecio.mensaje;
        }
        
        const validacionColor = this.validarColor(datos.color);
        if (!validacionColor.valida) {
            errores.color = validacionColor.mensaje;
        }
        
        const validacionCantidad = this.validarCantidad(datos.cantidad);
        if (!validacionCantidad.valida) {
            errores.cantidad = validacionCantidad.mensaje;
        }
        
        return {
            valido: Object.keys(errores).length === 0,
            errores
        };
    }
}

// CLASE PARA UTILIDADES GENERALES
class Utils {
    
    /**
     * Formatear precio como moneda
     */
    static formatearPrecio(precio) {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(precio);
    }

    /**
     * Formatear color para mostrar
     */
    static formatearColor(color) {
        return color.toUpperCase();
    }

    /**
     * Capitalizar primera letra
     */
    static capitalizar(texto) {
        if (!texto) return '';
        return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
    }

    /**
     * Limpiar texto (trim y normalizar)
     */
    static limpiarTexto(texto) {
        if (!texto) return '';
        return texto.trim().replace(/\s+/g, ' ');
    }

    /**
     * Generar ID único temporal
     */
    static generarIdTemporal() {
        return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Debounce para evitar múltiples llamadas
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Verificar si un objeto está vacío
     */
    static esObjetoVacio(obj) {
        return Object.keys(obj).length === 0;
    }

    /**
     * Clonar objeto profundo
     */
    static clonarObjeto(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * Formatear fecha para mostrar
     */
    static formatearFecha(fecha) {
        return new Intl.DateTimeFormat('es-AR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(fecha));
    }

    /**
     * Convertir color hex a RGB
     */
    static hexAColorRGB(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b };
    }

    /**
     * Calcular contraste para determinar color de texto
     */
    static calcularContraste(colorHex) {
        const { r, g, b } = this.hexAColorRGB(colorHex);
        const luminancia = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminancia > 0.5 ? '#000000' : '#FFFFFF';
    }
}

// CLASE PARA MANEJO DE ESTADÍSTICAS
class Estadisticas {
    
    /**
     * Calcular precio promedio
     */
    static calcularPromedio(pinturas) {
        if (!pinturas || pinturas.length === 0) return 0;
        const suma = pinturas.reduce((acc, pintura) => acc + pintura.precio, 0);
        return suma / pinturas.length;
    }

    /**
     * Encontrar precio máximo
     */
    static precioMaximo(pinturas) {
        if (!pinturas || pinturas.length === 0) return 0;
        return Math.max(...pinturas.map(p => p.precio));
    }

    /**
     * Encontrar precio mínimo
     */
    static precioMinimo(pinturas) {
        if (!pinturas || pinturas.length === 0) return 0;
        return Math.min(...pinturas.map(p => p.precio));
    }

    /**
     * Contar pinturas por marca
     */
    static contarPorMarca(pinturas) {
        if (!pinturas || pinturas.length === 0) return {};
        
        return pinturas.reduce((acc, pintura) => {
            acc[pintura.marca] = (acc[pintura.marca] || 0) + 1;
            return acc;
        }, {});
    }

    /**
     * Obtener estadísticas completas
     */
    static obtenerEstadisticasCompletas(pinturas) {
        return {
            total: pinturas.length,
            promedio: this.calcularPromedio(pinturas),
            maximo: this.precioMaximo(pinturas),
            minimo: this.precioMinimo(pinturas),
            porMarca: this.contarPorMarca(pinturas),
            cantidadTotal: pinturas.reduce((acc, p) => acc + p.cantidad, 0)
        };
    }
}

// CLASE PARA MANEJO DE NOTIFICACIONES
class Notificaciones {
    
    /**
     * Mostrar notificación de éxito
     */
    static exito(mensaje, duracion = 3000) {
        this.mostrar(mensaje, 'success', duracion);
    }

    /**
     * Mostrar notificación de éxito con botón Ver
     */
    static exitoConBotonVer(mensaje, duracion = 5000) {
        this.mostrarConBotonVer(mensaje, 'success', duracion);
    }

    /**
     * Mostrar notificación de error
     */
    static error(mensaje, duracion = 5000) {
        this.mostrar(mensaje, 'danger', duracion);
    }

    /**
     * Mostrar notificación de advertencia
     */
    static advertencia(mensaje, duracion = 4000) {
        this.mostrar(mensaje, 'warning', duracion);
    }

    /**
     * Mostrar notificación de información
     */
    static info(mensaje, duracion = 3000) {
        this.mostrar(mensaje, 'info', duracion);
    }

    /**
     * Crear y mostrar notificación con botón Ver
     */
    static mostrarConBotonVer(mensaje, tipo, duracion) {
        // Crear contenedor si no existe
        let contenedor = document.getElementById('notificaciones');
        if (!contenedor) {
            contenedor = document.createElement('div');
            contenedor.id = 'notificaciones';
            contenedor.className = 'position-fixed top-0 end-0 p-3';
            contenedor.style.zIndex = '9999';
            document.body.appendChild(contenedor);
        }

        // Crear notificación con botón Ver
        const toast = document.createElement('div');
        toast.className = `toast text-bg-${tipo} border-0`;
        toast.setAttribute('role', 'alert');
        toast.style.minWidth = '300px';
        toast.innerHTML = `
            <div class="toast-header text-bg-${tipo}">
                <i class="bi bi-check-circle-fill me-2"></i>
                <strong class="me-auto">¡Éxito!</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                <div class="mb-2">${mensaje}</div>
                <div class="d-grid">
                    <button type="button" class="btn btn-light btn-sm" onclick="TabManager.mostrarTab('listado'); bootstrap.Toast.getInstance(this.closest('.toast')).hide();">
                        <i class="bi bi-eye me-1"></i>Ver en Tabla
                    </button>
                </div>
            </div>
        `;

        contenedor.appendChild(toast);

        // Mostrar toast
        const bsToast = new bootstrap.Toast(toast, { delay: duracion });
        bsToast.show();

        // Limpiar después de cerrar
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }

    /**
     * Crear y mostrar notificación
     */
    static mostrar(mensaje, tipo, duracion) {
        // Crear contenedor si no existe
        let contenedor = document.getElementById('notificaciones');
        if (!contenedor) {
            contenedor = document.createElement('div');
            contenedor.id = 'notificaciones';
            contenedor.className = 'position-fixed top-0 end-0 p-3';
            contenedor.style.zIndex = '9999';
            document.body.appendChild(contenedor);
        }

        // Crear notificación
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-bg-${tipo} border-0`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${mensaje}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

        contenedor.appendChild(toast);

        // Mostrar toast
        const bsToast = new bootstrap.Toast(toast, { delay: duracion });
        bsToast.show();

        // Limpiar después de cerrar
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }
}

// EXPORTAR PARA USO GLOBAL
window.Validaciones = Validaciones;
window.Utils = Utils;
window.Estadisticas = Estadisticas;
window.Notificaciones = Notificaciones;