// Datos personales: Carmen Méndez Camino UO299841
"use strict";

/**
 * Clase que gestiona la carga y visualización de rutas turísticas.
 * Utiliza jQuery para el procesamiento de XML y Leaflet para la cartografía.
 * Cumple con las restricciones de no usar ID's.
 */
class Rutas {
    constructor() {
        this.xmlPath = "xml/rutas.xml";
    }

    /**
     * Carga el archivo XML y comienza el procesamiento.
     */
    init() {
        $.ajax({
            type: "GET",
            url: this.xmlPath,
            dataType: "xml",
            success: (xml) => {
                this.procesarRutas(xml);
            },
            error: () => {
                const main = $("main");
                main.append("<p>Error al cargar el archivo de rutas.</p>");
            }
        });
    }

    /**
     * Itera sobre cada ruta en el XML y genera su representación en el DOM.
     */
    procesarRutas(xml) {
        const main = $("main");
        const self = this;

        $(xml).find("ruta").each(function() {
            const rutaNode = $(this);
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

            const article = $("<article>");
            article.append($("<h3>").text(nombre));
            
            // Datos generales
            const sectionInfo = $("<section>");
            sectionInfo.append($("<h4>").text("Información General"));
            const ulInfo = $("<ul>");
            ulInfo.append($("<li>").html("<strong>Tipo:</strong> " + tipo));
            ulInfo.append($("<li>").html("<strong>Transporte:</strong> " + transporte));
            ulInfo.append($("<li>").html("<strong>Duración:</strong> " + duracion));
            ulInfo.append($("<li>").html("<strong>Agencia:</strong> " + agencia));
            ulInfo.append($("<li>").html("<strong>Inicio:</strong> " + inicio + " (" + latIni + ", " + lonIni + ", " + altIni + "m)"));
            sectionInfo.append(ulInfo);
            sectionInfo.append($("<p>").html("<strong>Descripción:</strong> " + descripcion));
            sectionInfo.append($("<p>").html("<strong>Adecuado para:</strong> " + personas));
            sectionInfo.append($("<p>").html("<strong>Recomendación:</strong> " + recomendacion));
            article.append(sectionInfo);

            // Hitos
            const sectionHitos = $("<section>");
            sectionHitos.append($("<h4>").text("Hitos de la Ruta"));
            const olHitos = $("<ol>");
            rutaNode.find("hito").each(function() {
                const hito = $(this);
                const nombreHito = hito.find("nombreHito").text();
                const dist = hito.find("distanciaHitoAnterior").text();
                const latH = hito.find("coordenadasHito latitud").text();
                const lonH = hito.find("coordenadasHito longitud").text();
                olHitos.append($("<li>").text(nombreHito + " - Distancia desde anterior: " + dist + " (Coords: " + latH + ", " + lonH + ")"));
            });
            sectionHitos.append(olHitos);
            article.append(sectionHitos);

            // Mapa (Planimetría KML)
            const sectionMapa = $("<section>");
            sectionMapa.append($("<h4>").text("Planimetría (Mapa)"));
            const mapContainer = $("<div>");
            // Estilo inline para el mapa ya que no podemos usar ID's ni clases específicas fácilmente sin tocar CSS
            mapContainer.css({
                "height": "400px",
                "width": "100%",
                "margin-bottom": "20px",
                "border": "1px solid #ccc"
            });
            sectionMapa.append(mapContainer);
            article.append(sectionMapa);

            // Altimetría (SVG)
            const sectionAlt = $("<section>");
            sectionAlt.append($("<h4>").text("Altimetría (Perfil de elevación)"));
            const svgContainer = $("<div>");
            sectionAlt.append(svgContainer);
            article.append(sectionAlt);

            main.append(article);

            // Inicializar Mapa y SVG después de añadir al DOM
            self.initMapa(mapContainer[0], "xml/" + kmlFile);
            self.initSVG(svgContainer[0], "xml/" + svgFile, rutaNode);
        });
    }

    /**
     * Inicializa un mapa de Leaflet en el contenedor y carga el KML.
     */
    initMapa(container, kmlPath) {
        // Creamos el mapa centrado inicialmente
        const map = L.map(container).setView([41.1167, 1.25], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Cargamos el KML usando Leaflet Omnivore
        const runLayer = omnivore.kml(kmlPath)
            .on('ready', function() {
                map.fitBounds(runLayer.getBounds());
            })
            .addTo(map);
    }

    /**
     * Carga el SVG y añade los nombres de los hitos.
     */
    initSVG(container, svgPath, rutaNode) {
        $.ajax({
            type: "GET",
            url: svgPath,
            dataType: "text",
            success: (svgData) => {
                const $container = $(container);
                $container.html(svgData);
                
                // Buscamos el elemento SVG cargado
                const svg = $container.find("svg");
                svg.css("width", "100%");
                svg.css("height", "auto");

                // Añadimos información de hitos al pie del SVG si fuera necesario
                // Aunque el SVG ya debería tener sus etiquetas según xml2altimetria.py
            },
            error: () => {
                $(container).html("<p>Error al cargar la altimetría.</p>");
            }
        });
    }
}

/**
 * Inicialización segura: espera a que las librerías cargadas al final del body estén listas.
 */
const initRutas = () => {
    if (typeof $ !== 'undefined' && typeof L !== 'undefined' && typeof omnivore !== 'undefined') {
        const app = new Rutas();
        app.init();
    } else {
        // Reintenta en 50ms si las librerías aún no están disponibles
        setTimeout(initRutas, 50);
    }
};

initRutas();
