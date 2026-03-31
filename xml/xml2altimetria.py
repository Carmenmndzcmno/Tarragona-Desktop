# xml2altimetria.py
# -*- coding: utf-8 -*-
"""
Genera un archivo SVG de altimetría a partir de circuitoEsquema.xml
Versión con SVG más grande

@author: Gabriel García Martínez
@version 1.1
"""

import xml.etree.ElementTree as ET


class Svg:
    def __init__(self):
        # Aumentamos el tamaño del SVG
        self.raiz = ET.Element(
            "svg",
            xmlns="http://www.w3.org/2000/svg",
            version="1.1",
            width="2000",  # antes 1200
            height="500"   # antes 300
        )

    def addPolyline(self, points, stroke, strokeWidth, fill):
        ET.SubElement(
            self.raiz,
            "polyline",
            points=points,
            stroke=stroke,
            **{"stroke-width": strokeWidth},
            fill=fill
        )

    def escribir(self, nombre):
        arbol = ET.ElementTree(self.raiz)
        ET.indent(arbol)
        arbol.write(nombre, encoding="utf-8", xml_declaration=True)


def generaSVG(archivoXML):

    try:
        tree = ET.parse(archivoXML)
    except Exception:
        print("❌ Error al abrir el archivo XML")
        return

    root = tree.getroot()
    ns = {"ns": "http://www.uniovi.es"}

    puntos = root.findall(".//ns:puntoAnonimo", ns)

    if not puntos:
        print("❌ No se encontraron puntos en el XML")
        return

    distancia_total = 0.0
    # Aumentamos la escala para que se vea más grande
    escala_x = 0.1   # antes 0.05
    escala_y = 12    # antes 7
    altitud_max = 20

    puntos_svg = []

    for punto in puntos:
        distancia = float(
            punto.find("ns:distancia", ns).text.strip()
        )
        distancia_total += distancia

        coordenadas = punto.find("ns:coordenadasGeograficas", ns)
        altitud = float(coordenadas.get("altitud"))

        x = distancia_total * escala_x
        y = (altitud_max - altitud) * escala_y

        puntos_svg.append((x, y))

    puntos_string = ""
    for x, y in puntos_svg:
        puntos_string += f"{x},{y} "

    base_y = max(y for _, y in puntos_svg) + 20  # un poco más de margen
    x_ini = puntos_svg[0][0]
    x_fin = puntos_svg[-1][0]

    puntos_string += f"{x_fin},{base_y} {x_ini},{base_y} {x_ini},{puntos_svg[0][1]}"

    svg = Svg()
    svg.addPolyline(
        points=puntos_string.strip(),
        stroke="red",
        strokeWidth="4",
        fill="#FFFFFF"
    )

    svg.escribir("altimetria.svg")
    print("✔ Archivo altimetria.svg generado correctamente (más grande)")


def main():
    generaSVG("circuitoEsquema.xml")


if __name__ == "__main__":
    main()
