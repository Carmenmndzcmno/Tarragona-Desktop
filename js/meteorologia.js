// Datos personales: Carmen Méndez Camino UO299841
"use strict";

/**
 * Clase que gestiona la informacion meteorolóogica
 */
class Meteorologia {
    #latitud;
    #longitud;
    #urlTiempoReal;
    #urlPrevision;
    #mainElement;

    /**
     * Constructor de la clase Meteorologia.
     */
    constructor(lat = 41.1167, lon = 1.25) {
        this.#latitud = lat;
        this.#longitud = lon;
        this.#urlTiempoReal = "https://api.open-meteo.com/v1/forecast";
        this.#urlPrevision = "https://api.open-meteo.com/v1/forecast";
        this.#mainElement = $("main");
    }

    /**
     * Obtiene y muestra la informacion meteorologica en tiempo real
     */
    obtenerTiempoReal() {
        $.ajax({
            dataType: "json",
            url: this.#urlTiempoReal,
            method: "GET",
            data: {
                latitude: this.#latitud,
                longitude: this.#longitud,
                current_weather: true,
                timezone: "Europe/Madrid"
            },
            success: (datos) => {
                this.#renderTiempoReal(datos.current_weather);
            },
            error: (jqXHR, status, error) => {
                console.error("Error al obtener tiempo real:", status, error);
            }
        });
    }

    /**
     * Obtiene y muestra la prevision meteorologica para los proximos 7 dias
     */
    obtenerPrevision() {
        $.ajax({
            dataType: "json",
            url: this.#urlPrevision,
            method: "GET",
            data: {
                latitude: this.#latitud,
                longitude: this.#longitud,
                daily: "temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode",
                timezone: "Europe/Madrid"
            },
            success: (datos) => {
                this.#renderPrevision(datos.daily);
            },
            error: (jqXHR, status, error) => {
                console.error("Error al obtener previsión:", status, error);
            }
        });
    }

    /**
     * Renderiza el tiempo real
     */
    #renderTiempoReal(current) {
        const section = $("<section>");
        const h2 = $("<h2>").text("Tiempo en tiempo real en Tarragona");
        
        const pTemp = $("<p>").text("Temperatura: " + current.temperature + " °C");
        const pViento = $("<p>").text("Velocidad del viento: " + current.windspeed + " km/h");
        const pFecha = $("<p>").text("Última actualización: " + new Date(current.time).toLocaleString());
        
        section.append(h2).append(pTemp).append(pViento).append(pFecha);
        
        this.#mainElement.prepend(section);
    }

    /**
     * Renderiza la prevision de 7 dias
     */
    #renderPrevision(daily) {
        const section = $("<section>");
        const h2 = $("<h2>").text("Previsión para los próximos 7 días");
        section.append(h2);

        for (let i = 0; i < daily.time.length; i++) {
            const itemSection = $("<section>");
            const h3 = $("<h3>").text(new Date(daily.time[i]).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }));
            
            const pMax = $("<p>").text("Temperatura Máxima: " + daily.temperature_2m_max[i] + " °C");
            const pMin = $("<p>").text("Temperatura Mínima: " + daily.temperature_2m_min[i] + " °C");
            const pPrecip = $("<p>").text("Precipitación: " + daily.precipitation_sum[i] + " mm");
            
            itemSection.append(h3).append(pMax).append(pMin).append(pPrecip);
            section.append(itemSection);
        }
        
        this.#mainElement.append(section);
    }
}

// Inicializacion
$(document).ready(() => {
    const meteo = new Meteorologia();
    meteo.obtenerTiempoReal();
    meteo.obtenerPrevision();
});
