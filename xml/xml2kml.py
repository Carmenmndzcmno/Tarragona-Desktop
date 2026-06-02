import xml.etree.ElementTree as ET
import os

class Kml:
    """
    Clase para generar archivos KML (Keyhole Markup Language)
    """
    def __init__(self):
        self.raiz = ET.Element("kml", xmlns="http://www.opengis.net/kml/2.2")
        self.doc = ET.SubElement(self.raiz, "Document")

    def add_route(self, nombre, coordenadas):
        """
        Añade una ruta (LineString) al documento KML
        """
        placemark = ET.SubElement(self.doc, "Placemark")
        ET.SubElement(placemark, "name").text = nombre
        
        line_string = ET.SubElement(placemark, "LineString")
        ET.SubElement(line_string, "extrude").text = "0"
        ET.SubElement(line_string, "tessellate").text = "1"
        ET.SubElement(line_string, "altitudeMode").text = "clampToGround"
        
        # Formato de coordenadas pegado al terreno: longitud,latitud
        coords_text = "\n"
        for lon, lat, alt in coordenadas:
            coords_text += f"          {lon},{lat}\n"
        
        ET.SubElement(line_string, "coordinates").text = coords_text

    def escribir(self, nombre_archivo):
        """
        Escribe el contenido KML a un archivo
        """
        arbol = ET.ElementTree(self.raiz)
        # Intentamos usar indent si está disponible (Python 3.9+)
        try:
            ET.indent(arbol, space="  ")
        except AttributeError:
            pass
        arbol.write(nombre_archivo, encoding="utf-8", xml_declaration=True)

def generaKML(archivo_xml):
    """
    Lee el archivo XML de rutas y genera un archivo KML por cada ruta
    """
    try:
        tree = ET.parse(archivo_xml)
        root = tree.getroot()
        directorio_salida = os.path.dirname(os.path.abspath(archivo_xml))
        
        # El archivo rutas.xml contiene múltiples elementos <ruta>
        for ruta in root.findall('ruta'):
            nombre_ruta_elem = ruta.find('nombreRuta')
            if nombre_ruta_elem is None:
                continue
            
            nombre_ruta = nombre_ruta_elem.text.strip()
            planimetria_elem = ruta.find('planimetria')
            coordenadas = []
            
            # 1. Coordenadas de inicio de la ruta (coordenadasGeograficas)
            inicio = ruta.find('coordenadasGeograficas')
            if inicio is not None:
                lon = inicio.find('longitud').text.strip()
                lat = inicio.find('latitud').text.strip()
                alt = inicio.find('altitud').text.strip()
                coordenadas.append((lon, lat, alt))
            
            # 2. Coordenadas de cada hito (hitos/hito/coordenadasHito)
            hitos_elem = ruta.find('hitos')
            if hitos_elem is not None:
                for hito in hitos_elem.findall('hito'):
                    coords_hito = hito.find('coordenadasHito')
                    if coords_hito is not None:
                        lon = coords_hito.find('longitud').text.strip()
                        lat = coords_hito.find('latitud').text.strip()
                        alt = coords_hito.find('altitud').text.strip()
                        coordenadas.append((lon, lat, alt))
            
            if coordenadas:
                kml = Kml()
                kml.add_route(nombre_ruta, coordenadas)
                # El nombre del archivo generado será el indicado en <planimetria>
                if planimetria_elem is not None and planimetria_elem.text:
                    nombre_kml = planimetria_elem.text.strip()
                else:
                    nombre_kml = f"ruta{nombre_ruta}.kml"
                ruta_kml = os.path.join(directorio_salida, os.path.basename(nombre_kml))
                kml.escribir(ruta_kml)
                print(f"Archivo generado: {ruta_kml}")
            else:
                print(f"Advertencia: No se encontraron coordenadas para la ruta '{nombre_ruta}'")

    except Exception as e:
        print(f"Error al procesar el XML: {e}")

if __name__ == "__main__":
    # Localización del archivo XML
    xml_file = 'xml/rutas.xml'
    if not os.path.exists(xml_file):
        xml_file = 'rutas.xml' # Por si acaso está en el mismo directorio
    
    if os.path.exists(xml_file):
        generaKML(xml_file)
    else:
        print(f"Error: No se pudo encontrar el archivo {xml_file}")
