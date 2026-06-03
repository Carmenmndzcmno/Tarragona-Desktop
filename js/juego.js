// Datos personales: Carmen Méndez Camino UO299841
"use strict";

/**
 * Clase que gestiona un juego de 10 preguntas tipo test sobre Tarragona.
 * Desarrollado en ECMAScript puro, sin jQuery.
 * Cumple con las restricciones de no usar div ni selectores id/class.
 */
class Juego {
    #preguntas;
    #puntuacion;
    #mainElement;
    #formElement;

    /**
     * Constructor del juego. Inicializa las preguntas y el estado.
     */
    constructor() {
        this.#preguntas = [
            {
                pregunta: "¿Cuál de estos platos típicos aparece en la lista de la sección Gastronomía?",
                opciones: ["Paella Valenciana", "Calçots", "Fabada Asturiana", "Gazpacho", "Cocido Madrileño"],
                correcta: 1
            },
            {
                pregunta: "Según la descripción en Gastronomía, ¿con qué salsa se comen los Calçots?",
                opciones: ["Alioli", "Brava", "Romesco", "Mayonesa", "Mostaza"],
                correcta: 2
            },
            {
                pregunta: "¿Cuál de estos restaurantes es mencionado en la sección de Gastronomía?",
                opciones: ["Casa Pepe", "El Llagut", "Vips", "Burger King", "McDonald's"],
                correcta: 1
            },
            {
                pregunta: "Según la tabla de restaurantes, ¿qué tipo de cocina ofrece 'La Cuineta'?",
                opciones: ["Cocina italiana", "Cocina tradicional catalana", "Cocina japonesa", "Cocina mexicana", "Cocina rápida"],
                correcta: 1
            },
            {
                pregunta: "¿Cuál es el rango de precio para el restaurante 'El Llagut' según la tabla?",
                opciones: ["10€-20€", "30€-50€", "50€-100€", "Gratis", "5€-10€"],
                correcta: 1
            },
            {
                pregunta: "¿Quién figura como autor del sitio web en los metadatos de las páginas?",
                opciones: ["Juan Pérez", "Carmen Méndez Camino", "Ana García", "Luis López", "Pedro Martínez"],
                correcta: 1
            },
            {
                pregunta: "¿Qué sección del menú permite consultar el tiempo en Tarragona?",
                opciones: ["Inicio", "Gastronomía", "Rutas", "Meteorología", "Ayuda"],
                correcta: 3
            },
            {
                pregunta: "¿Cuál es el título que aparece en la pestaña del navegador para la página principal?",
                opciones: ["Tarragona-Inicio", "Tarragona-Desktop", "Tarragona-Web", "Ciudad de Tarragona", "Turismo Tarragona"],
                correcta: 1
            },
            {
                pregunta: "¿Cómo se llama el archivo de JavaScript que gestiona el carrusel de imágenes en la página de inicio?",
                opciones: ["index.js", "carrusel.js", "imagenes.js", "slider.js", "main.js"],
                correcta: 1
            },
            {
                pregunta: "¿A qué ciudad se refiere toda la información del sitio web?",
                opciones: ["Barcelona", "Tarragona", "Lérida", "Gerona", "Madrid"],
                correcta: 1
            }
        ];
        this.#puntuacion = 0;
        this.#mainElement = document.querySelector("main");
        this.#formElement = null;
    }

    /**
     * Inicia el juego renderizando el formulario de preguntas.
     */
    inicializar() {
        this.#mainElement.innerHTML = "";
        
        const section = document.createElement("section");
        const h2 = document.createElement("h2");
        h2.textContent = "Test de Experiencia: Conoce Tarragona";
        section.appendChild(h2);

        this.#formElement = document.createElement("form");
        
        this.#preguntas.forEach((p, index) => {
            const article = document.createElement("article");
            const h3 = document.createElement("h3");
            h3.textContent = (index + 1) + ". " + p.pregunta;
            article.appendChild(h3);

            p.opciones.forEach((opcion, i) => {
                const label = document.createElement("label");
                const input = document.createElement("input");
                input.type = "radio";
                input.name = "pregunta" + index;
                input.value = i;
                input.required = true; // Obligatorio responder todas

                label.appendChild(input);
                label.appendChild(document.createTextNode(" " + opcion));
                article.appendChild(label);
                article.appendChild(document.createElement("br"));
            });

            this.#formElement.appendChild(article);
        });

        const submitBtn = document.createElement("button");
        submitBtn.type = "submit";
        submitBtn.textContent = "Finalizar Juego";
        this.#formElement.appendChild(submitBtn);

        this.#formElement.onsubmit = (e) => {
            e.preventDefault();
            this.#finalizarJuego();
        };

        section.appendChild(this.#formElement);
        this.#mainElement.appendChild(section);
    }

    /**
     * Calcula la puntuación y muestra el resultado debajo del botón.
     */
    #finalizarJuego() {
        this.#puntuacion = 0;
        const data = new FormData(this.#formElement);

        this.#preguntas.forEach((p, index) => {
            const respuesta = data.get("pregunta" + index);
            if (parseInt(respuesta) === p.correcta) {
                this.#puntuacion++;
            }
        });

        this.#mostrarResultado();
    }

    /**
     * Renderiza el resultado final como un h2 debajo del botón.
     */
    #mostrarResultado() {
        // Si ya hay un resultado previo, lo eliminamos
        const resultadoPrevio = this.#formElement.querySelector("h2");
        if (resultadoPrevio) {
            resultadoPrevio.remove();
        }

        const h2Resultado = document.createElement("h2");
        h2Resultado.textContent = "¡Felicidades has sacado " + this.#puntuacion + " / 10 !";
        
        this.#formElement.appendChild(h2Resultado);
        
        // Deshabilitar el botón de envío para evitar re-envíos sin reiniciar
        const submitBtn = this.#formElement.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
        }

        // Añadir un botón para reiniciar
        const resetBtn = document.createElement("button");
        resetBtn.type = "button";
        resetBtn.textContent = "Volver a jugar";
        resetBtn.onclick = () => this.inicializar();
        this.#formElement.appendChild(resetBtn);
    }
}

// Inicialización del juego cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
    const juego = new Juego();
    juego.inicializar();
});
