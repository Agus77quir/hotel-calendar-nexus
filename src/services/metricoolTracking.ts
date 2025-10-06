/**
 * Metricool Tracking Service
 * 
 * Para usar este servicio:
 * 1. Obtén tu ID de seguimiento de Metricool
 * 2. Reemplaza 'YOUR_METRICOOL_ID' con tu ID real
 * 3. Importa e inicializa en tu aplicación: initMetricool()
 */

interface MetricoolConfig {
  trackingId: string;
  enableDebug?: boolean;
}

declare global {
  interface Window {
    metricool?: any;
    metricoolQueue?: any[];
  }
}

class MetricoolTracker {
  private config: MetricoolConfig;
  private initialized: boolean = false;

  constructor(config: MetricoolConfig) {
    this.config = config;
  }

  /**
   * Inicializa el script de seguimiento de Metricool
   */
  init(): void {
    if (this.initialized) {
      console.warn('Metricool ya está inicializado');
      return;
    }

    if (!this.config.trackingId || this.config.trackingId === 'YOUR_METRICOOL_ID') {
      console.warn('Por favor configura tu ID de seguimiento de Metricool');
      return;
    }

    // Inicializar cola de comandos
    window.metricoolQueue = window.metricoolQueue || [];
    
    // Crear función helper
    window.metricool = function() {
      window.metricoolQueue?.push(arguments);
    };

    // Cargar script de Metricool
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://tracker.metricool.com/resources/be.js`;
    
    script.onload = () => {
      if (this.config.enableDebug) {
        console.log('Metricool tracking script loaded');
      }
      this.initialized = true;
      
      // Enviar comando de inicialización
      window.metricool?.('init', this.config.trackingId);
      
      // Track página inicial
      this.trackPageView();
    };

    script.onerror = () => {
      console.error('Error al cargar el script de Metricool');
    };

    // Insertar script en el DOM
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode?.insertBefore(script, firstScript);
  }

  /**
   * Rastrea una vista de página
   */
  trackPageView(pagePath?: string): void {
    const path = pagePath || window.location.pathname;
    
    if (!this.initialized) {
      console.warn('Metricool no está inicializado');
      return;
    }

    window.metricool?.('track', 'PageView', {
      page: path,
      title: document.title,
      url: window.location.href
    });

    if (this.config.enableDebug) {
      console.log('Metricool PageView tracked:', path);
    }
  }

  /**
   * Rastrea un evento personalizado
   */
  trackEvent(eventName: string, eventData?: Record<string, any>): void {
    if (!this.initialized) {
      console.warn('Metricool no está inicializado');
      return;
    }

    window.metricool?.('track', eventName, eventData);

    if (this.config.enableDebug) {
      console.log('Metricool Event tracked:', eventName, eventData);
    }
  }

  /**
   * Rastrea una conversión
   */
  trackConversion(conversionName: string, value?: number): void {
    this.trackEvent('Conversion', {
      name: conversionName,
      value: value
    });
  }

  /**
   * Identifica un usuario (opcional)
   */
  identifyUser(userId: string, userData?: Record<string, any>): void {
    if (!this.initialized) {
      console.warn('Metricool no está inicializado');
      return;
    }

    window.metricool?.('identify', userId, userData);

    if (this.config.enableDebug) {
      console.log('Metricool User identified:', userId);
    }
  }
}

// Configuración global - REEMPLAZA 'YOUR_METRICOOL_ID' con tu ID real
const metricoolConfig: MetricoolConfig = {
  trackingId: 'YOUR_METRICOOL_ID', // 👈 Coloca aquí tu ID de Metricool
  enableDebug: import.meta.env.DEV // Debug solo en desarrollo
};

// Instancia global
const tracker = new MetricoolTracker(metricoolConfig);

/**
 * Inicializa Metricool (llamar al inicio de la app)
 */
export const initMetricool = (): void => {
  tracker.init();
};

/**
 * Rastrea vista de página
 */
export const trackPageView = (pagePath?: string): void => {
  tracker.trackPageView(pagePath);
};

/**
 * Rastrea evento personalizado
 */
export const trackEvent = (eventName: string, eventData?: Record<string, any>): void => {
  tracker.trackEvent(eventName, eventData);
};

/**
 * Rastrea conversión
 */
export const trackConversion = (conversionName: string, value?: number): void => {
  tracker.trackConversion(conversionName, value);
};

/**
 * Identifica usuario
 */
export const identifyUser = (userId: string, userData?: Record<string, any>): void => {
  tracker.identifyUser(userId, userData);
};

// Exportar tracker para usos avanzados
export default tracker;
