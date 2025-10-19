//========================================
// API MANAGER - SISTEMA DE GESTIÓN DE PINTURAS
// Manejo de comunicaciones con la API REST
// Autor: Casado Santino
//========================================

// CONFIGURACIÓN DE LA API
const API_CONFIG = {
    BASE_URL: "https://utnfra-api-pinturas.onrender.com/pinturas",
    TIMEOUT: 10000, // 10 segundos
    HEADERS: {
        'Content-Type': 'application/json'
    }
};

// CLASE PARA MANEJO DE LA API
class PinturasAPI {
    
    /**
     * Realizar petición HTTP con manejo de errores
     */
    static async request(url, options = {}) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
            
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...API_CONFIG.HEADERS,
                    ...options.headers
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
            }
            
            return response;
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Timeout: La petición tardó demasiado tiempo');
            }
            throw error;
        }
    }

    /**
     * Obtener todas las pinturas
     */
    static async obtenerPinturas() {
        try {
            const response = await this.request(API_CONFIG.BASE_URL);
            const data = await response.json();
            
            // Si la respuesta tiene estructura {exito: true, pinturas: [...]}
            const pinturas = data.pinturas || data;
            
            return pinturas;
            
        } catch (error) {
            throw new Error(`Error al cargar pinturas: ${error.message}`);
        }
    }

    /**
     * Obtener una pintura por ID
     */
    static async obtenerPinturaPorId(id) {
        try {
            const response = await this.request(`${API_CONFIG.BASE_URL}/${id}`);
            const data = await response.json();
            
            // Extraer la pintura del objeto respuesta
            const pintura = data.pintura || data;
            
            return pintura;
            
        } catch (error) {
            throw new Error(`Error al consultar pintura: ${error.message}`);
        }
    }

    /**
     * Crear una nueva pintura
     */
    static async crearPintura(pintura) {
        try {
            const response = await this.request(API_CONFIG.BASE_URL, {
                method: 'POST',
                body: JSON.stringify(pintura)
            });
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            throw new Error(`Error al crear pintura: ${error.message}`);
        }
    }

    /**
     * Actualizar una pintura existente
     */
    static async actualizarPintura(id, pintura) {
        try {
            const response = await this.request(`${API_CONFIG.BASE_URL}/${id}`, {
                method: 'PUT',
                body: JSON.stringify(pintura)
            });
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            throw new Error(`Error al actualizar pintura: ${error.message}`);
        }
    }

    /**
     * Eliminar una pintura
     */
    static async eliminarPintura(id) {
        try {
            const response = await this.request(`${API_CONFIG.BASE_URL}/${id}`, {
                method: 'DELETE'
            });
            
            return true;
            
        } catch (error) {
            throw new Error(`Error al eliminar pintura: ${error.message}`);
        }
    }

    /**
     * Verificar conexión con la API
     */
    static async verificarConexion() {
        try {
            const response = await this.request(API_CONFIG.BASE_URL);
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}

// FUNCIONES DE UTILIDAD PARA LA API
class APIUtils {
    
    /**
     * Validar estructura de pintura antes de enviar
     */
    static validarPintura(pintura) {
        const errores = [];
        
        if (!pintura.marca || pintura.marca.trim().length < 2) {
            errores.push('La marca debe tener al menos 2 caracteres');
        }
        
        if (!pintura.precio || pintura.precio < 50 || pintura.precio > 500) {
            errores.push('El precio debe estar entre $50 y $500');
        }
        
        if (!pintura.color || !pintura.color.match(/^#[0-9A-Fa-f]{6}$/)) {
            errores.push('El color debe ser un valor hexadecimal válido');
        }
        
        if (!pintura.cantidad || pintura.cantidad < 1 || pintura.cantidad > 400) {
            errores.push('La cantidad debe estar entre 1 y 400');
        }
        
        return {
            valida: errores.length === 0,
            errores
        };
    }

    /**
     * Formatear pintura para envío a la API
     */
    static formatearPintura(pintura) {
        return {
            marca: pintura.marca.trim(),
            precio: Number(pintura.precio),
            color: pintura.color.toUpperCase(),
            cantidad: Number(pintura.cantidad)
        };
    }

    /**
     * Manejar errores de la API con mensajes amigables
     */
    static manejarError(error) {
        if (error.message.includes('Timeout')) {
            return 'La conexión está tardando demasiado. Verifica tu internet.';
        }
        
        if (error.message.includes('HTTP Error: 404')) {
            return 'Pintura no encontrada.';
        }
        
        if (error.message.includes('HTTP Error: 500')) {
            return 'Error del servidor. Inténtalo más tarde.';
        }
        
        if (error.message.includes('Failed to fetch')) {
            return 'No se pudo conectar con el servidor. Verifica tu conexión.';
        }
        
        return error.message || 'Error desconocido';
    }
}

// EXPORTAR PARA USO GLOBAL
window.PinturasAPI = PinturasAPI;
window.APIUtils = APIUtils;