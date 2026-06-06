# xml2altimetria.py
# -*- coding: utf-8 -*-
"""
Genera archivos SVG de altimetría para cada ruta en rutas.xml

@version 2.0
"""

import xml.etree.ElementTree as ET
import os

class Svg:
    def __init__(self, width=800, height=500):
        self.width = width
        self.height = height
        self.margin = 80
        self.raiz = ET.Element(
            "svg",
            xmlns="http://www.w3.org/2000/svg",
            version="1.1",
            width=str(width),
            height=str(height),
            viewBox=f"0 0 {width} {height}"
        )
        # Fondo blanco
        ET.SubElement(self.raiz, "rect", width="100%", height="100%", fill="white")

    def add_polyline(self, points, stroke="blue", stroke_width="2", fill="#eef"):
        ET.SubElement(
            self.raiz,
            "polyline",
            points=points,
            stroke=stroke,
            **{"stroke-width": stroke_width},
            fill=fill
        )

    def add_text(self, x, y, text, font_size="12", text_anchor="start", transform=None):
        attrs = {"font-size": font_size, "text-anchor": text_anchor, "font-family": "Arial"}
        if transform:
            attrs["transform"] = transform
        t = ET.SubElement(self.raiz, "text", x=str(x), y=str(y), **attrs)
        t.text = text

    def add_circle(self, cx, cy, r=3, fill="red"):
        ET.SubElement(self.raiz, "circle", cx=str(cx), cy=str(cy), r=str(r), fill=fill)

    def add_line(self, x1, y1, x2, y2, stroke="black", stroke_width="1"):
        ET.SubElement(self.raiz, "line", x1=str(x1), y1=str(y1), x2=str(x2), y2=str(y2), stroke=stroke, **{"stroke-width": stroke_width})

    def escribir(self, nombre):
        arbol = ET.ElementTree(self.raiz)
        try:
            ET.indent(arbol, space="  ")
        except:
            pass
        arbol.write(nombre, encoding="utf-8", xml_declaration=True)

def genera_altimetrias(archivo_xml):
    try:
        tree = ET.parse(archivo_xml)
        root = tree.getroot()
    except Exception as e:
        print(f"Error al abrir {archivo_xml}: {e}")
        return

    for ruta in root.findall('ruta'):
        nombre_ruta = ruta.find('nombreRuta').text.strip()
        altimetria_file = ruta.find('altimetria').text.strip()
        
        if not altimetria_file:
            continue

        puntos_datos = []
        nombres_hitos = []
        distancia_acumulada = 0.0
        
        hitos = ruta.find('hitos')
        if hitos is not None:
            for hito in hitos.findall('hito'):
                nombre_hito = hito.find('nombreHito').text.strip()
                dist_str = hito.find('distanciaHitoAnterior').text.strip()
                dist_val = float(dist_str.split()[0])
                distancia_acumulada += dist_val
                alt_hito = float(hito.find('coordenadasHito/altitud').text)
                puntos_datos.append((distancia_acumulada, alt_hito))
                nombres_hitos.append(nombre_hito)

        width, height = 800, 500
        margin = 80
        svg = Svg(width, height)
        
        min_dist = 0
        max_dist = puntos_datos[-1][0] if puntos_datos[-1][0] > 0 else 1
        min_alt = min(p[1] for p in puntos_datos) - 20
        max_alt = max(p[1] for p in puntos_datos) + 20
        
        def get_x(d):
            return margin + (d / max_dist) * (width - 2 * margin)
        
        def get_y(a):
            return (height - margin - 50) - ((a - min_alt) / (max_alt - min_alt)) * (height - 2 * margin - 50)

        # Ejes
        svg.add_line(margin, height - margin - 50, width - margin, height - margin - 50)
        svg.add_line(margin, margin, margin, height - margin - 50)
        svg.add_text(width/2, height - 10, "Distancia (km)", text_anchor="middle")
        svg.add_text(15, height/2, "Altitud (m)", text_anchor="middle", transform=f"rotate(-90, 15, {height/2})")

        # Escala X
        for i in range(6):
            d = i * max_dist / 5
            x = get_x(d)
            svg.add_line(x, height - margin - 50, x, height - margin - 45)
            svg.add_text(x, height - margin - 35, f"{d:.1f}", text_anchor="middle", font_size="10")

        # Escala Y
        for i in range(6):
            a = min_alt + i * (max_alt - min_alt) / 5
            y = get_y(a)
            svg.add_line(margin - 5, y, margin, y)
            svg.add_text(margin - 10, y + 4, f"{int(a)}", text_anchor="end", font_size="10")

        # Polilínea de fondo
        puntos_svg = [(get_x(d), get_y(a)) for d, a in puntos_datos]
        base_y = height - margin - 50
        puntos_str = " ".join([f"{x:.2f},{y:.2f}" for x, y in puntos_svg])
        puntos_str += f" {puntos_svg[-1][0]:.2f},{base_y:.2f} {puntos_svg[0][0]:.2f},{base_y:.2f} {puntos_svg[0][0]:.2f},{puntos_svg[0][1]:.2f}"
        svg.add_polyline(puntos_str)

        # Hitos
        for i, (d, a) in enumerate(puntos_datos):
            x = get_x(d)
            y = get_y(a)
            nombre = nombres_hitos[i]
            
            # Punto rojo en la gráfica
            svg.add_circle(x, y, r=4, fill="red")
            
            # Etiqueta del hito (rotada para que quepa)
            svg.add_text(x + 3, y - 10, nombre, font_size="9", text_anchor="start", transform=f"rotate(-45, {x}, {y})")

        svg.add_text(width/2, 30, f"Altimetría: {nombre_ruta}", text_anchor="middle", font_size="16")

        ruta_svg = os.path.join(os.path.dirname(os.path.abspath(archivo_xml)), altimetria_file)
        with open(ruta_svg, 'wb') as f:
            arbol = ET.ElementTree(svg.raiz)
            try: ET.indent(arbol)
            except: pass
            arbol.write(f, encoding="utf-8", xml_declaration=True)
        print(f"Generado: {ruta_svg}")

if __name__ == "__main__":
    path = r"c:\Users\Usuario\Desktop\SEW\ProyectoExtraordinaria\Repositorio\Tarragona-Desktop\xml\rutas.xml"
    genera_altimetrias(path)
