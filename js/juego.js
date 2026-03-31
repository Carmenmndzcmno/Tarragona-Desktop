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
                pregunta: "¿Cuál de estos es un plato típico de Tarragona?",
                opciones: ["Paella Valenciana", "Calçots", "Fabada Asturiana", "Gazpacho", "Cocido Madrileño"],
                correcta: 1
            },
            {
                pregunta: "¿Qué monumento romano se encuentra en Tarragona?",
                opciones: ["Coliseo", "Anfiteatro", "Acueducto de Segovia", "Teatro de Mérida", "Murallas de Lugo"],
                correcta: 1
            },
            {
                pregunta: "¿Cómo se llama el acueducto famoso de Tarragona?",
                opciones: ["Puente del Diablo", "Puente Romano", "Puente de Hierro", "Puente de Piedra", "Puente Nuevo"],
                correcta: 0
            },
            {
                pregunta: "¿Qué mar baña las costas de Tarragona?",
                opciones: ["Cantábrico", "Atlántico", "Mediterráneo", "Muerto", "Rojo"],
                correcta: 2
            },
            {
                pregunta: "¿Cuál es un postre o dulce mencionado en la gastronomía?",
                opciones: ["Tarta de Santiago", "Ensaimada", "Coca de Recapte", "Turrón de Jijona", "Sobao Pasiego"],
                correcta: 2
            },
            {
                pregunta: "¿Qué recurso turístico se encuentra en el Balcón del Mediterráneo?",
                opciones: ["Un puerto", "Una estatua", "Vistas al mar", "Un museo", "Un mercado"],
                correcta: 2
            },
            {
                pregunta: "¿Cuál es la capital de la provincia?",
                opciones: ["Reus", "Tortosa", "Tarragona", "Valls", "Salou"],
                correcta: 2
            },
            {
                pregunta: "¿Qué tipo de clima se muestra en la sección de meteorología?",
                opciones: ["Oceánico", "Continental", "Mediterráneo", "Desértico", "Tropical"],
                correcta: 2
            },
            {
                pregunta: "¿Qué monumento es Patrimonio de la Humanidad en Tarragona?",
                opciones: ["Conjunto Arqueológico de Tarraco", "Sagrada Familia", "Alhambra", "Mezquita de Córdoba", "Catedral de Burgos"],
                correcta: 0
            },
            {
                pregunta: "¿En qué sección del sitio web se habla de los platos típicos?",
                opciones: ["Inicio", "Rutas", "Meteorología", "Gastronomía", "Ayuda"],
                correcta: 3
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
        h2Resultado.textContent = "¡Felicidades has sacado! " + this.#puntuacion + " / 10";
        
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
