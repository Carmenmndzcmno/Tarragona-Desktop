// Datos personales: Carmen Méndez Camino UO299841
"use strict";

/**
 * Clase que gestiona la carga y visualización de rutas turísticas.
 * Utiliza jQuery para el procesamiento de XML y la API de Google Maps para la cartografía.
 * Respeta todas las restricciones: OOP, solo jQuery/Gmaps, sin divs extras, medidas relativas.
 */
class Rutas {
    constructor() {
        this.xmlPath = "xml/rutas.xml";
    }

    /**
     * Carga el archivo XML y comienza el procesamiento.
     */
    init() {
        const self = this;
        jQuery.ajax({
            type: "GET",
            url: this.xmlPath,
            dataType: "xml",
            success: function(xml) {
                // Buscamos todos los elementos <ruta> de forma robusta
                const $rutas = jQuery(xml).find("ruta");
                
                if ($rutas.length > 0) {
                    self.procesarRutas($rutas);
                } else {
                    jQuery("main").append(jQuery("<p>").text("No se han encontrado rutas en el XML."));
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error("Error al cargar XML:", textStatus, errorThrown);
                jQuery("main").append(jQuery("<p>").text("Error al cargar el archivo de rutas (XML)."));
            }
        });
    }

    /**
     * Procesa la colección de nodos de ruta y genera su contenido HTML.
     */
    procesarRutas($rutas) {
        const main = jQuery("main");
        const self = this;

        $rutas.each(function() {
            const rutaNode = jQuery(this);
            const nombre = rutaNode.find("nombreRuta").text();
            
            const sectionRuta = jQuery("<section>");
            sectionRuta.append(jQuery("<h3>").text(nombre));
            
            // Información General
            const sectionInfo = jQuery("<section>");
            sectionInfo.append(jQuery("<h4>").text("Información General"));
            const ulInfo = jQuery("<ul>");
            ulInfo.append(jQuery("<li>").html("Tipo: " + rutaNode.find("tipoRuta").text()));
            ulInfo.append(jQuery("<li>").html("Transporte: " + rutaNode.find("medioTransporte").text()));
            ulInfo.append(jQuery("<li>").html("Duración:" + rutaNode.find("tiempoDuracion").text()));
            ulInfo.append(jQuery("<li>").html("Agencia: " + rutaNode.find("agenciaGestora").text()));
            
            const latIni = rutaNode.find("coordenadasGeograficas latitud").text();
            const lonIni = rutaNode.find("coordenadasGeograficas longitud").text();
            const altIni = rutaNode.find("coordenadasGeograficas altitud").text();
            ulInfo.append(jQuery("<li>").html("Inicio:" + rutaNode.find("lugarInicio").text() + " (" + latIni + ", " + lonIni + ", " + altIni + "m)"));
            
            sectionInfo.append(ulInfo);
            sectionInfo.append(jQuery("<p>").html("Descripción: " + rutaNode.find("descripcion").text()));
            sectionInfo.append(jQuery("<p>").html("Adecuado para: " + rutaNode.find("personasAdecuadas").text()));
            sectionInfo.append(jQuery("<p>").html("Recomendación: " + rutaNode.find("recomendacion").text()));

            // Referencias Bibliográficas
            const sectionRefs = jQuery("<section>");
            sectionRefs.append(jQuery("<h4>").text("Referencias Bibliográficas"));
            const ulRefs = jQuery("<ul>");
            rutaNode.find("referenciasBibliograficas referencia").each(function() {
                const ref = jQuery(this).text();
                ulRefs.append(jQuery("<li>").append(jQuery("<a>").attr("href", ref).text(ref)));
            });
            sectionRefs.append(ulRefs);
            sectionInfo.append(sectionRefs);
            sectionRuta.append(sectionInfo);

            // Hitos
            const sectionHitos = jQuery("<section>");
            sectionHitos.append(jQuery("<h4>").text("Hitos de la Ruta"));
            const olHitos = jQuery("<ol>");
            rutaNode.find("hito").each(function() {
                const hito = jQuery(this);
                const nombreHito = hito.find("nombreHito").text();
                const dist = hito.find("distanciaHitoAnterior").text();
                const latH = hito.find("coordenadasHito latitud").text();
                const lonH = hito.find("coordenadasHito longitud").text();
                olHitos.append(jQuery("<li>").text(nombreHito + " - Distancia: " + dist + " (Coords: " + latH + ", " + lonH + ")"));
            });
            sectionHitos.append(olHitos);
            sectionRuta.append(sectionHitos);

            // Galería de fotos
            const sectionGaleria = jQuery("<section>");
            sectionGaleria.append(jQuery("<h4>").text("Galería de fotos"));
            rutaNode.find("hito galeriaFotografia fotografia").each(function() {
                const fotoPath = jQuery(this).text();
                sectionGaleria.append(jQuery("<img>").attr("src", fotoPath).attr("alt", "Imagen de hito"));
            });
            sectionRuta.append(sectionGaleria);

            // Mapa
            const sectionMapa = jQuery("<section>");
            sectionMapa.append(jQuery("<h4>").text("Planimetría (Mapa)"));
            const mapContainer = jQuery("<div>"); // Bloque anónimo para el mapa (EXCEPCIÓN PERMITIDA)
            sectionMapa.append(mapContainer);
            sectionRuta.append(sectionMapa);

            // Altimetría
            const sectionAlt = jQuery("<section>");
            sectionAlt.append(jQuery("<h4>").text("Altimetría (Perfil)"));
            sectionRuta.append(sectionAlt);

            main.append(sectionRuta);

            // Inicialización diferida de componentes gráficos
            self.initMapa(mapContainer[0], parseFloat(latIni), parseFloat(lonIni), "xml/" + rutaNode.find("planimetria").text());
            self.initSVG(sectionAlt[0], "xml/" + rutaNode.find("altimetria").text());
        });
    }

    /**
     * Inicializa Google Maps y parsea el KML.
     * Utiliza la nueva API de carga de librerías de Google (async/await).
     */
    async initMapa(container, lat, lon, kmlPath) {
        try {
            // Importación de librerías necesarias mediante el cargador dinámico
            const { Map, Polyline, LatLngBounds } = await google.maps.importLibrary("maps");

            const mapOptions = {
                center: { lat: lat, lng: lon },
                zoom: 14,
                mapTypeId: 'terrain'
            };
            const map = new Map(container, mapOptions);

            // Parsing manual del KML mediante AJAX/jQuery
            jQuery.ajax({
                type: "GET",
                url: kmlPath,
                dataType: "xml",
                success: function(xml) {
                    const coordinatesStr = jQuery(xml).find("coordinates").text().trim();
                    const points = [];
                    const lines = coordinatesStr.split(/[\s\n\r]+/);
                    const bounds = new google.maps.LatLngBounds();

                    lines.forEach(function(line) {
                        if (line.trim().length > 0) {
                            const coords = line.split(",");
                            if (coords.length >= 2) {
                                const point = { lat: parseFloat(coords[1]), lng: parseFloat(coords[0]) };
                                points.push(point);
                                bounds.extend(point);
                            }
                        }
                    });

                    if (points.length > 0) {
                        new Polyline({
                            path: points,
                            geodesic: true,
                            strokeColor: "#FF0000",
                            strokeOpacity: 1.0,
                            strokeWeight: 2,
                            map: map
                        });
                        map.fitBounds(bounds);
                    }
                }
            });
        } catch (error) {
            console.error("Error al inicializar el mapa:", error);
            // Si hay un error de facturación o de carga, informamos al usuario sin romper el resto de la página
            jQuery(container).append(jQuery("<p>").text("El mapa dinámico no está disponible (requiere facturación en Google Cloud)."));
        }
    }

    /**
     * Carga el SVG e inserta su contenido directamente.
     */
    initSVG(container, svgPath) {
        jQuery.ajax({
            type: "GET",
            url: svgPath,
            dataType: "text",
            success: (svgData) => {
                jQuery(container).append(svgData);
            },
            error: (e) => {
                console.error("Error al cargar SVG:", e);
            }
        });
    }
}

// Inicialización de la clase Rutas cuando el DOM esté listo
jQuery(document).ready(() => {
    const app = new Rutas();
    app.init();
});
