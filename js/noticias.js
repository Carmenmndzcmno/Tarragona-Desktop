// Datos personales: Carmen Méndez Camino UO299841
"use strict";

/**
 * Clase que gestiona la obtención y visualización de noticias utilizando una API externa.
 * Cumple con las restricciones de no usar div ni selectores id/class.
 */
class Noticias {
    #busqueda;
    #url;
    #api = "X3dEmmtXsjL7P9YZmrKiBchq3oNFaXLOwrJmsvfy";
    #sectionNoticias; // Referencia privada a la sección de noticias

    /**
     * Constructor de la clase Noticias.
     */
    constructor() {
        this.#busqueda = "Tarragona";
        this.#url = "https://api.thenewsapi.com/v1/news/all";
        this.#sectionNoticias = null;
    }

    /**
     * Busca noticias a través de la API externa.
     */
    async buscarNoticias() {
        const url = `${this.#url}?api_token=${this.#api}&search=${this.#busqueda}&language=es`;

        try {
            const respuesta = await fetch(url);
            if (!respuesta.ok) throw new Error(`Error en la respuesta de la API: ${respuesta.status}`);

            const datos = await respuesta.json();
            this.#procesarInformacion(datos);

        } catch (error) {
            console.error("Error al obtener noticias:", error.message);

            // Mostrar mensaje de error en la sección correspondiente
            if (this.#sectionNoticias) {
                const errorMsg = $("<p>").text("Error al cargar noticias. Verifique la consola o la clave API.");
                this.#sectionNoticias.append(errorMsg);
            }
        }
    }

    /**
     * Procesa la información recibida de la API.
     * @param {Object} datos - Datos de la API.
     */
    #procesarInformacion(datos) {
        let noticias = [];
        if (!datos.data || datos.data.length === 0) {
            this.#mostrarNoticias(noticias);
            return;
        }

        for (let i = 0; i < datos.data.length; i++) {
            const title = datos.data[i].title || "Sin título";
            const entradilla = datos.data[i].description || "Sin descripción disponible.";
            const url = datos.data[i].url || "#";
            const source = datos.data[i].source?.name || "Desconocida";

            noticias.push({ title, entradilla, url, source });
        }

        this.#mostrarNoticias(noticias);
    }

    /**
     * Renderiza las noticias en el DOM.
     * @param {Array} noticias - Lista de noticias procesadas.
     */
    #mostrarNoticias(noticias) {
        const main = $("main");
        if (!main.length) {
            console.error("No se encontró el elemento <main>");
            return;
        }

        // Si la sección no existe, se crea y se añade al final de main
        if (!this.#sectionNoticias) {
            this.#sectionNoticias = $("<section>");
            main.append(this.#sectionNoticias);
        }
        
        this.#sectionNoticias.empty();
        const h2 = $("<h2>").text("Noticias de Tarragona");
        this.#sectionNoticias.append(h2);

        if (!noticias.length) {
            this.#sectionNoticias.append("<p>No se encontraron noticias recientes.</p>");
            return;
        }

        noticias.forEach(noticia => {
            // Se utilizan etiquetas semánticas article, h3 y p para cumplir con W3C y estilos CSS
            const article = $("<article>");
            const h3 = $("<h3>").text(noticia.title);
            const pEntradilla = $("<p>").text(noticia.entradilla);
            const pSource = $("<p>").text("Fuente: " + noticia.source);
            const link = $("<a>")
                .attr("href", noticia.url)
                .text("Leer más");

            article.append(h3);
            article.append(pEntradilla);
            article.append(pSource);
            article.append(link);
            
            this.#sectionNoticias.append(article);
        });
    }
}

// Inicialización de la clase Noticias cuando el DOM esté listo
$(document).ready(() => {
    const noticias = new Noticias();
    noticias.buscarNoticias();
});
