import xml.etree.ElementTree as ET
import os

# Simulación de generación de SVGs para las rutas de Tarragona
xml_path = r"c:\Users\Usuario\Desktop\SEW\ProyectoExtraordinaria\Repositorio\Tarragona-Desktop\xml\rutas.xml"
output_dir = r"c:\Users\Usuario\Desktop\SEW\ProyectoExtraordinaria\Repositorio\Tarragona-Desktop\xml"

def create_mock_svg(filename, title):
    content = f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.opengis.net/kml/2.2" version="1.1" width="800" height="400" viewBox="0 0 800 400">
  <rect width="100%" height="100%" fill="white" />
  <text x="400" y="30" font-size="16" text-anchor="middle" font-family="Arial">Altimetría: {title}</text>
  <line x1="60" y1="340" x2="740" y2="340" stroke="black" stroke-width="1" />
  <line x1="60" y1="60" x2="60" y2="340" stroke="black" stroke-width="1" />
  <polyline points="60,300 150,250 300,280 450,200 600,220 740,150 740,340 60,340 60,300" stroke="blue" stroke-width="2" fill="#eef" />
  <text x="400" y="390" font-size="12" text-anchor="middle" font-family="Arial">Distancia (km)</text>
  <text x="15" y="200" font-size="12" text-anchor="middle" font-family="Arial">Altitud (m)</text>
</svg>"""
    with open(os.path.join(output_dir, filename), 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Generado: {filename}")

create_mock_svg("elsAvencsDeLaFebro.svg", "Els Avencs de La Febro")
create_mock_svg("elsGorgsDeLaFebro.svg", "Els Gorgs de La Febró")
create_mock_svg("laFontDeLaLludriga.svg", "La Font de la Llúdriga")
