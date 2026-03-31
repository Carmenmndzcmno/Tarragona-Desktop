import xml.etree.ElementTree as ET
import sys

class Kml(object):
    """
    Genera archivo KML con puntos y líneas
    @version 1.1
    """
    def __init__(self):
        """
        Crea el elemento raíz y el espacio de nombres
        """
        self.raiz = ET.Element('kml', xmlns="http://www.opengis.net/kml/2.2")
        self.doc = ET.SubElement(self.raiz,'Document')

    def addPlacemark(self,nombre,descripcion,long,lat,alt, modoAltitud):
        """
        Añade un elemento <Placemark> con puntos <Point>
        """
        pm = ET.SubElement(self.doc,'Placemark')
        ET.SubElement(pm,'name').text = nombre
        ET.SubElement(pm,'description').text = descripcion
        punto = ET.SubElement(pm,'Point')
        ET.SubElement(punto,'coordinates').text = '{},{},{}'.format(long,lat,alt)
        ET.SubElement(punto,'altitudeMode').text = modoAltitud

    def addLineString(self,nombre,extrude,tesela, listaCoordenadas, modoAltitud='clampToGround', color=None, ancho=None):
        """
        Añade un elemento <Placemark> con líneas <LineString>
        listaCoordenadas: string con "lon,lat,alt\nlon,lat,alt\n..."
        """
        pm = ET.SubElement(self.doc,'Placemark')
        if nombre is not None:
            ET.SubElement(pm,'name').text = str(nombre)
        ls = ET.SubElement(pm, 'LineString')
        ET.SubElement(ls,'extrude').text = str(extrude)
        ET.SubElement(ls,'tessellation').text = str(tesela)
        ET.SubElement(ls,'coordinates').text = listaCoordenadas
        ET.SubElement(ls,'altitudeMode').text = modoAltitud

        if color is not None or ancho is not None:
            estilo = ET.SubElement(pm, 'Style')
            linea = ET.SubElement(estilo, 'LineStyle')
            if color is not None:
                ET.SubElement(linea, 'color').text = str(color)
            if ancho is not None:
                ET.SubElement(linea, 'width').text = str(ancho)

    def escribir(self,nombreArchivoKML):
        """
        Escribe el archivo KML con declaración y codificación
        """
        arbol = ET.ElementTree(self.raiz)
        # Introduce indentación y saltos de línea si está disponible (Py3.9+)
        try:
            ET.indent(arbol, space="  ")
        except Exception:
            pass
        arbol.write(nombreArchivoKML, encoding='utf-8', xml_declaration=True)

    def ver(self):
        """
        Muestra el archivo KML. Se utiliza para depurar
        """
        print("\nElemento raiz = ", self.raiz.tag)

        if self.raiz.text != None:
            print("Contenido = "    , self.raiz.text.strip('\n'))
        else:
            print("Contenido = "    , self.raiz.text)

        print("Atributos = "    , self.raiz.attrib)

        # Recorrido de los elementos del árbol
        for hijo in self.raiz.findall('.//'):
            print("\nElemento = " , hijo.tag)
            if hijo.text != None:
                print("Contenido = ", hijo.text.strip('\n'))
            else:
                print("Contenido = ", hijo.text)
            print("Atributos = ", hijo.attrib)

# Sección que transforma circuitoEsquema.xml en sintaxis KML.
def toKML(archivoXML):
   
    tree = ET.parse(archivoXML)
    
    root = tree.getroot()
    namespace = {'ns': 'http://www.uniovi.es'}

    
    origen = root.find('ns:puntoOrigen', namespace)
    puntos_coords = []
    kml_coordenadas = ""
    
    if origen is not None:
        lon_o = origen.get('longitud')
        lat_o = origen.get('latitud')
        alt_o = origen.get('altitud')
        nombre_origen = origen.text.strip() if origen.text else 'puntoOrigen'
        puntos_coords.append((float(lon_o), float(lat_o), float(alt_o), nombre_origen, 'Punto origen'))
        
    puntosAnonimos = root.findall('ns:puntoAnonimo', namespace)
    for pA in puntosAnonimos:
        coords_elem = pA.find('ns:coordenadasGeograficas', namespace)
        sector = pA.find('ns:sector', namespace)
        nombre = None
        if sector is not None and sector.text:
            nombre = f"Sector {sector.text.strip()}"
        else:
            nombre = "puntoAnonimo"
        if coords_elem is not None:
            lon = coords_elem.get('longitud')
            lat = coords_elem.get('latitud')
            alt = coords_elem.get('altitud')
            puntos_coords.append((float(lon), float(lat), float(alt), nombre, 'Punto anónimo'))
            
    for (lon, lat, alt, nombre, desc) in puntos_coords:
        kml_coordenadas += "{},{},{}\n".format(lon, lat, alt)

    if puntos_coords:
        lon_o, lat_o, alt_o, _, _ = puntos_coords[0]
        kml_coordenadas += "{},{},{}\n".format(lon_o, lat_o, alt_o)


    kml = Kml()
    
    for (lon, lat, alt, nombre, desc) in puntos_coords:
        kml.addPlacemark(nombre=nombre,
                         descripcion=desc,
                         long=lon,
                         lat=lat,
                         alt=alt,
                         modoAltitud='absolute')

    kml.addLineString(
        nombre = root.get('nombre', 'Circuito'),
        extrude = '0',
        tesela = '1',
        listaCoordenadas = kml_coordenadas.strip(),
        modoAltitud = 'absolute',
        color = 'ffff0000',  # azul en formato aabbggrr
        ancho = '4'
    )

    salida = 'circuito.kml'
    kml.escribir(salida)
    print('Archivo generado ->', salida)

if __name__ == '__main__':
    # Igual que tu versión original: pedir nombre de fichero XML
    fichero = input("Introduzca nombre fichero XML: ").strip()
    if not fichero:
        print("No has introducido nombre de fichero. Abortando.")
        sys.exit(1)
    toKML(fichero)
