//Datos personales: Carmen Méndez Camino UO299841
"use strict";
class Ciudad {
    nombre;
    pais;
    gentilicio;
    cantidadPoblacion;
    coordenadasLongitud;
    coordenadasLatitud;
    #meteo;
    #json;

    constructor (nombre, pais, gentilicio){
        this.nombre=nombre;
        this.pais =pais;
        this.gentilicio=gentilicio;
    }

   obtenerPoblacionYCoordenadas(cantidadPoblacion, coordenadasLongitud, coordenadasLatitud){
        this.cantidadPoblacion=cantidadPoblacion;
        this.setCoordenadasPuntoCentral(coordenadasLongitud, coordenadasLatitud)
   }

   toStringNombre(){
    return ""+this.nombre;
   }

   toStringPais(){
    return ""+this.pais;
   }

   listaNoOrdenada(){
    return "<ul>\n<li>Gentilicio: "+this.gentilicio+"</li>\n<li>Cantidad de Población: "+this.cantidadPoblacion+"</li>\n</ul>";
   }

   setCantidadPoblacion(cantidadPoblacion){
    this.cantidadPoblacion=cantidadPoblacion;
   }

   setCoordenadasPuntoCentral(coordenadasLongitud, coordenadasLatitud){
    this.coordenadasLongitud=coordenadasLongitud;
    this.coordenadasLatitud=coordenadasLatitud;
   }

   escribirCoordenadas(){
    const parrafo1 = document.createElement("p");
    parrafo1.textContent = "Longitud:"+this.coordenadasLongitud;
    document.body.appendChild(parrafo1);

    const parrafo2 = document.createElement("p");
    parrafo2.textContent = "Latitud: " + this.coordenadasLatitud;
    document.body.appendChild(parrafo2);
   }

   getMeteorologiaCarrera(fechaCarrera, callback) {
        $.ajax({
            dataType: "json",
            url: "https://archive-api.open-meteo.com/v1/archive",
            method: "GET",
            data: {
                latitude: this.coordenadasLatitud,
                longitude: this.coordenadasLongitud,
                start_date: fechaCarrera,
                end_date: fechaCarrera,
                timezone: "Europe/Madrid",
                hourly: [
                    "temperature_2m",
                    "apparent_temperature",
                    "precipitation",
                    "relative_humidity_2m",
                    "wind_speed_10m",
                    "wind_direction_10m"
                ].join(","),
                daily: [
                    "sunrise",
                    "sunset" 
                ].join(",")
            },
            success: (datos) => {
                this.#meteo = datos;

                //console.log("Datos horarios:", datos.hourly);
                //console.log("Datos diarios:", datos.daily);
                if (callback) callback(datos);
            },
            error: (jqXHR, status, error) => {
                console.error("Error al obtener los datos meteorológicos:", status, error);
            }
        });
    }

    procesarJSONCarrera() {
        if (!this.#meteo || !this.#meteo.hourly || !this.#meteo.daily) {
            console.warn("No hay datos meteorológicos para procesar.");
            this.#json = { meteorologia: [] };
            return;
        }

        let resultado = {
            meteorologia: [],
            diario: {}
        };

        const hourly = this.#meteo.hourly;
        const daily = this.#meteo.daily;
        const numRegistros = hourly.time ? hourly.time.length : 0;

        for (let i = 0; i < numRegistros; i++) {
            resultado.meteorologia.push({
                hora: hourly.time[i] || "",
                temperatura: hourly.temperature_2m ? hourly.temperature_2m[i] : null,
                sensacion: hourly.apparent_temperature ? hourly.apparent_temperature[i] : null,
                lluvia: hourly.precipitation ? hourly.precipitation[i] : null,
                humedad: hourly.relative_humidity_2m ? hourly.relative_humidity_2m[i] : null,
                viento_velocidad: hourly.wind_speed_10m ? hourly.wind_speed_10m[i] : null,
                viento_direccion: hourly.wind_direction_10m ? hourly.wind_direction_10m[i] : null
            });
        }
        resultado.diario = {
            fecha: daily.time ? daily.time[0] : "",
            amanecer: daily.sunrise ? daily.sunrise[0] : "",
            anochecer: daily.sunset ? daily.sunset[0] : ""
        };
        this.#json = resultado;
        return resultado;
    }

    procesarJSONEntrenos() {
        if (!this.#meteo) {
            console.error("No hay datos meteorológicos cargados.");
            return;
        }
        hourly: [
            "temperature_2m",
            "apparent_temperature",
            "precipitation",
            "wind_speed_10m",
            "relative_humidity_2m"
        ].join(",")


        const meteo = this.#meteo;
        const horas = meteo.hourly.time;
        const temperaturas = meteo.hourly.temperature_2m;
        const sensacion = meteo.hourly.apparent_temperature || [];
        const lluvia = meteo.hourly.precipitation;
        const humedad = meteo.hourly.relative_humidity_2m;
        const vientoVel = meteo.hourly.wind_speed_10m;
        const vientoDir = meteo.hourly.wind_direction_10m || [];

        let acumulados = {};
        let conteo = {};

        for (let i = 0; i < horas.length; i++) {
            let fecha = horas[i].split("T")[0];

            if (!acumulados[fecha]) {
                acumulados[fecha] = {
                    temperatura: 0,
                    sensacion: 0,
                    lluvia: 0,
                    humedad: 0,
                    vientoVel: 0,
                    vientoDir: 0
                };
                conteo[fecha] = 0;
            }

            acumulados[fecha].temperatura += temperaturas[i];
            acumulados[fecha].sensacion += sensacion[i];
            acumulados[fecha].lluvia += lluvia[i];
            acumulados[fecha].humedad += humedad[i];
            acumulados[fecha].vientoVel += vientoVel[i];
            acumulados[fecha].vientoDir += vientoDir[i];
            conteo[fecha]++;
        }

        let medias = {};
        for (let fecha in acumulados) {
            medias[fecha] = {
                temperatura: (acumulados[fecha].temperatura / conteo[fecha]).toFixed(2),
                sensacion: (acumulados[fecha].sensacion / conteo[fecha]).toFixed(2),
                lluvia: (acumulados[fecha].lluvia / conteo[fecha]).toFixed(2),
                humedad: (acumulados[fecha].humedad / conteo[fecha]).toFixed(2),
                vientoVel: (acumulados[fecha].vientoVel / conteo[fecha]).toFixed(2),
                vientoDir: (acumulados[fecha].vientoDir / conteo[fecha]).toFixed(2)
            };
        }

        //console.log("Medias meteorológicas por día de entrenamientos:", medias);
        return medias;
    }


    getMeteorologiaEntrenos(fechaCarrera, callback) {
        // Calcular fechas de entrenamientos
        let fecha = new Date(fechaCarrera);
        let fin = new Date(fecha);
        fin.setDate(fecha.getDate() - 1);

        let inicio = new Date(fecha);
        inicio.setDate(fecha.getDate() - 3);

        const formato = (f) => f.toISOString().split("T")[0];

        $.ajax({
            dataType: "json",
            url: "https://archive-api.open-meteo.com/v1/archive",
            method: "GET",
            data: {
                latitude: this.coordenadasLatitud,
                longitude: this.coordenadasLongitud,
                start_date: formato(inicio),
                end_date: formato(fin),
                timezone: "Europe/Madrid",
                hourly: [
                    "temperature_2m",
                    "precipitation",
                    "wind_speed_10m",
                    "relative_humidity_2m"
                ].join(",")
            },
            success: (datos) => {
                this.#meteo = datos;

                let resultado = this.procesarJSONEntrenos();
                if (callback) callback(resultado);
            },
            error: (jqXHR, status, error) => {
                console.error("Error al obtener meteorología de entrenamientos:", status, error);
            }
        });
    }


}

