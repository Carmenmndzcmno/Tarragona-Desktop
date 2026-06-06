// Datos personales: Carmen Méndez Camino UO299841
"use strict";

/**
 * Clase que gestiona un juego de 10 preguntas tipo test sobre Tarragona.
 * Implementado usando jQuery encapsulado en el paradigma de POO.
 */
class Juego {
    #preguntas;
    #puntuacion;
    #mainElement;
    #formElement;

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
                pregunta: "¿Qué es el Arrosejat?",
                opciones: ["Un plato de chipirones", "Un plato de arroz", "Un tipo de pizza", "Pan con tomate", "Cebollas"],
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
                pregunta: "¿Qué tantos días se preveen en Meteorología?",
                opciones: ["1", "5", "7", "Ninguno", "14"],
                correcta: 3
            },
            {
                pregunta: "¿A qué ciudad se refiere toda la información del sitio web?",
                opciones: ["Barcelona", "Tarragona", "Lérida", "Gerona", "Madrid"],
                correcta: 1
            }
        ];
        this.#puntuacion = 0;
        this.#mainElement = $("main");
        this.#formElement = null;
    }

    inicializar() {
        this.#mainElement.empty();
        
        const section = $("<section>");
        const h2 = $("<h2>").text("Test de Experiencia: Conoce Tarragona");
        section.append(h2);

        this.#formElement = $("<form>");
        
        this.#preguntas.forEach((p, index) => {
            const article = $("<article>");
            const h3 = $("<h3>").text((index + 1) + ". " + p.pregunta);
            article.append(h3);

            p.opciones.forEach((opcion, i) => {
                const label = $("<label>");
                const input = $("<input>")
                    .attr("type", "radio")
                    .attr("name", "pregunta" + index)
                    .attr("value", i)
                    .prop("required", true);

                label.append(input).append(" " + opcion);
                article.append(label).append("<br>");
            });

            this.#formElement.append(article);
        });

        const submitBtn = $("<button>")
            .attr("type", "submit")
            .text("Finalizar Juego");
        this.#formElement.append(submitBtn);

        this.#formElement.on("submit", (e) => {
            e.preventDefault();
            this.#finalizarJuego();
        });

        section.append(this.#formElement);
        this.#mainElement.append(section);
    }

    #finalizarJuego() {
        this.#puntuacion = 0;
        const formArray = this.#formElement.serializeArray();
        const respuestas = {};
        formArray.forEach(item => {
            respuestas[item.name] = item.value;
        });

        this.#preguntas.forEach((p, index) => {
            const respuesta = respuestas["pregunta" + index];
            if (parseInt(respuesta) === p.correcta) {
                this.#puntuacion++;
            }
        });

        this.#mostrarResultado();
    }

    #mostrarResultado() {
        this.#formElement.find("h2").remove();

        const h2Resultado = $("<h2>").text("¡Felicidades has sacado " + this.#puntuacion + " / 10 !");
        this.#formElement.append(h2Resultado);
        
        this.#formElement.find('button[type="submit"]').prop("disabled", true);

        const resetBtn = $("<button>")
            .attr("type", "button")
            .text("Volver a jugar")
            .on("click", () => this.inicializar());
        this.#formElement.append(resetBtn);
    }
}

$(document).ready(() => {
    const juego = new Juego();
    juego.inicializar();
});
