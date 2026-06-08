// Datos personales: Carmen Mendez Camino UO299841
"use strict";

/**
 * Clase que gestiona un carrusel de imagenes
 */
class Carrusel {
    #imagenes;
    #indiceActual;
    #imgElement;

    /**
     * Constructor del carrusel. Inicializa las imagenes y el indice actual
     */
    constructor() {
        // Minimo de 5 fotos
        this.#imagenes = [
            { src: "multimedia/Carrusel01.jpg", alt: "Mapa de situación de la provincia de Tarragona" },
            { src: "multimedia/Carrusel02.jpg", alt: "Anfiteatro romano de Tarragona" },
            { src: "multimedia/Carrusel03.jpg", alt: "Catedral de Tarragona" },
            { src: "multimedia/Carrusel04.jpg", alt: "Puente del Diablo (Acueducto de les Ferreres)" },
            { src: "multimedia/Carrusel05.jpg", alt: "Balcón del Mediterráneo" }
        ];
        this.#indiceActual = 0;
        this.#imgElement = null;
    }

    /**
     * Renderiza el carrusel
     */
    render() {
        const sectionCarrusel = $("<section>");
        const h2 = $("<h2>").text("Principales recursos turísticos de Tarragona");
        
        // Se anade un article con encabezado para cumplir con la validacion W3C
        const article = $("<article>");
        const h3 = $("<h3>").text("Imagen del recurso turístico").hide();
        
        this.#imgElement = $("<img>")
            .attr("src", this.#imagenes[this.#indiceActual].src)
            .attr("alt", this.#imagenes[this.#indiceActual].alt);

        article.append(h3).append(this.#imgElement);
        sectionCarrusel.append(h2).append(article);

        $("main").append(sectionCarrusel);

        // Inicia el cambio automático de imágenes cada 3 segundos (3000ms)
        setInterval(this.siguiente.bind(this), 3000);
    }

    /**
     * Muestra la siguiente imagen del carrusel.
     */
    siguiente() {
        this.#indiceActual = (this.#indiceActual + 1) % this.#imagenes.length;
        this.#actualizarImagen();
    }

    /**
     * Actualiza la imagen mostrada en el DOM usando la referencia almacenada
     */
    #actualizarImagen() {
        if (this.#imgElement) {
            const imagen = this.#imagenes[this.#indiceActual];
            this.#imgElement
                .attr("src", imagen.src)
                .attr("alt", imagen.alt);
        }
    }
}

// Inicializacion del carrusel
$(document).ready(() => {
    const carrusel = new Carrusel();
    carrusel.render();
});
