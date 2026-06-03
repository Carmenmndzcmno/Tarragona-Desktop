// Datos personales: Carmen Méndez Camino UO299841
"use strict";

/**
 * Clase que gestiona la carga y visualización de rutas turísticas.
 * Utiliza jQuery para el procesamiento de XML y Leaflet para la cartografía.
 * Cumple con las restricciones de no usar ID's.
 */
(function() {
    // Evitar que el script falle si se carga varias veces (Uncaught SyntaxError: Identifier 'Rutas' has already been declared)
    if (window.rutasCargadas) return;
    window.rutasCargadas = true;

    class Rutas {
        constructor() {
            this.xmlPath = "xml/rutas.xml";
        }

        /**
         * Carga el archivo XML y comienza el procesamiento.
         */
        init() {
            jQuery.ajax({
                type: "GET",
                url: this.xmlPath,
                dataType: "xml",
                success: (xml) => {
                    this.procesarRutas(xml);
                },
                error: () => {
                    const main = jQuery("main");
                    main.append("<p>Error al cargar el archivo de rutas.</p>");
                }
            });
        }

        /**
         * Itera sobre cada ruta en el XML y genera su representación en el DOM.
         */
        procesarRutas(xml) {
            const main = jQuery("main");
            const self = this;

            jQuery(xml).find("ruta").each(function() {
                const rutaNode = jQuery(this);
                const nombre = rutaNode.find("nombreRuta").text();
                const tipo = rutaNode.find("tipoRuta").text();
                const transporte = rutaNode.find("medioTransporte").text();
                const duracion = rutaNode.find("tiempoDuracion").text();
                const agencia = rutaNode.find("agenciaGestora").text();
                const descripcion = rutaNode.find("descripcion").text();
                const personas = rutaNode.find("personasAdecuadas").text();
                const inicio = rutaNode.find("lugarInicio").text();
                const recomendacion = rutaNode.find("recomendacion").text();
                const kmlFile = rutaNode.find("planimetria").text();
                const svgFile = rutaNode.find("altimetria").text();

                // Coordenadas de inicio
                const latIni = rutaNode.find("coordenadasGeograficas latitud").text();
                const lonIni = rutaNode.find("coordenadasGeograficas longitud").text();
                const altIni = rutaNode.find("coordenadasGeograficas altitud").text();

                const article = jQuery("<article>");
                article.append(jQuery("<h3>").text(nombre));
                
                // Datos generales
                const sectionInfo = jQuery("<section>");
                sectionInfo.append(jQuery("<h4>").text("Información General"));
                const ulInfo = jQuery("<ul>");
                ulInfo.append(jQuery("<li>").html("<strong>Tipo:</strong> " + tipo));
                ulInfo.append(jQuery("<li>").html("<strong>Transporte:</strong> " + transporte));
                ulInfo.append(jQuery("<li>").html("<strong>Duración:</strong> " + duracion));
                ulInfo.append(jQuery("<li>").html("<strong>Agencia:</strong> " + agencia));
                ulInfo.append(jQuery("<li>").html("<strong>Inicio:</strong> " + inicio + " (" + latIni + ", " + lonIni + ", " + altIni + "m)"));
                sectionInfo.append(ulInfo);
                sectionInfo.append(jQuery("<p>").html("<strong>Descripción:</strong> " + descripcion));
                sectionInfo.append(jQuery("<p>").html("<strong>Adecuado para:</strong> " + personas));
                sectionInfo.append(jQuery("<p>").html("<strong>Recomendación:</strong> " + recomendacion));
                article.append(sectionInfo);

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
                    olHitos.append(jQuery("<li>").text(nombreHito + " - Distancia desde anterior: " + dist + " (Coords: " + latH + ", " + lonH + ")"));
                });
                sectionHitos.append(olHitos);
                article.append(sectionHitos);

                // Mapa (Planimetría KML)
                const sectionMapa = jQuery("<section>");
                sectionMapa.append(jQuery("<h4>").text("Planimetría (Mapa)"));
                const mapContainer = jQuery("<div>");
                mapContainer.css({
                    "height": "400px",
                    "width": "100%",
                    "margin-bottom": "20px",
                    "border": "1px solid #ccc"
                });
                sectionMapa.append(mapContainer);
                article.append(sectionMapa);

                // Altimetría (SVG)
                const sectionAlt = jQuery("<section>");
                sectionAlt.append(jQuery("<h4>").text("Altimetría (Perfil de elevación)"));
                const svgContainer = jQuery("<div>");
                sectionAlt.append(svgContainer);
                article.append(sectionAlt);

                main.append(article);

                // Inicializar Mapa y SVG después de añadir al DOM
                self.initMapa(mapContainer[0], "xml/" + kmlFile);
                self.initSVG(svgContainer[0], "xml/" + svgFile);
            });
        }

        /**
         * Inicializa un mapa de Leaflet en el contenedor y carga el KML.
         */
        initMapa(container, kmlPath) {
            const map = L.map(container).setView([41.1167, 1.25], 13);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            omnivore.kml(kmlPath)
                .on('ready', function() {
                    map.fitBounds(this.getBounds());
                })
                .addTo(map);
        }

        /**
         * Carga el SVG y lo inserta en el contenedor.
         */
        initSVG(container, svgPath) {
            jQuery.ajax({
                type: "GET",
                url: svgPath,
                dataType: "text",
                success: (svgData) => {
                    const $container = jQuery(container);
                    $container.html(svgData);
                    const svg = $container.find("svg");
                    svg.css({"width": "100%", "height": "auto"});
                },
                error: () => {
                    jQuery(container).html("<p>Error al cargar la altimetría.</p>");
                }
            });
        }
    }

    /**
     * Inicialización segura: espera a que las librerías cargadas al final del body estén listas.
     */
    const intentarInicializar = () => {
        if (window.jQuery && window.L && window.omnivore) {
            const app = new Rutas();
            app.init();
        } else {
            // Reintenta cada 100ms
            setTimeout(intentarInicializar, 100);
        }
    };

    // Lanzamos la primera comprobación
    intentarInicializar();
})();
