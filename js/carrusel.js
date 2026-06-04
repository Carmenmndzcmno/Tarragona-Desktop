// Datos personales: Carmen Méndez Camino UO299841
"use strict";

/**
 * Clase que gestiona un carrusel de imágenes locales utilizando jQuery.
 * Sigue el paradigma de orientación a objetos en ECMAScript.
 * Cumple con las restricciones de no usar div ni selectores id/class.
 */
class Carrusel {
    #imagenes;
    #indiceActual;
    #imgElement; // Referencia privada al elemento img del DOM

    /**
     * Constructor del carrusel. Inicializa las imágenes y el índice actual.
     */
    constructor() {
        // Mínimo de 5 fotos, incluyendo un mapa de situación
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
     * Renderiza el carrusel en el elemento main del index.html.
     * Encapsula el uso de jQuery y utiliza etiquetas semánticas.
     */
    render() {
        const sectionCarrusel = $("<section>");
        const h2 = $("<h2>").text("Principales recursos turísticos de Tarragona");
        
        // Se añade un article con encabezado para cumplir con la validación W3C y mantener los estilos de layout.css
        const article = $("<article>");
        const h3 = $("<h3>").text("Imagen del recurso turístico").hide();
        
        // Se guarda la referencia al elemento img para actualizarlo sin selectores globales
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
     * Actualiza la imagen mostrada en el DOM usando la referencia almacenada.
     * Encapsula el uso de jQuery.
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

// Inicialización del carrusel cuando el DOM esté listo
$(document).ready(() => {
    const carrusel = new Carrusel();
    carrusel.render();
});
