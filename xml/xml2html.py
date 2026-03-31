import xml.etree.ElementTree as ET
import sys
import re

RUTA_CSS = "../estilo/estilo.css" 
NOMBRE_SALIDA = "InfoCircuito.html"
NS = {'u': 'http://www.uniovi.es'}
# -------------------------------------------------------

class Html:
    def __init__(self, title):
        self.content = []
        self.head(title)
        self.content.append('<body>')
        self.content.append(f'''<!-- Datos con el contenidos que aparece en el navegador. Es el body!! -->
     <header>
        <h1><a href="index.html" title="Inicio">MotoGP-Desktop</a></h1>  <!-- Debe ser el mismo en todos los documentos HTML del proyecto -->
        <nav> <!-- Menu de navegacion ; Sirve para cuando se pulse el tabulador ir cambiando el elemento -->
            <a href="../piloto.html" title="Información del piloto" >Piloto</a>
            <a href="../ayuda.html" title="Ayuda de MotoGP-Desktop">Ayuda</a>
            <a href="../circuito.html" title="Información sobre circuitos">Circuito</a>
            <a href="../clasificaciones.php" title="Información sobre la clasificación">Clasificaciones</a>
            <a href="../juegos.html" title="Información sobre juegos">Juegos</a>
            <a href="../meteorologia.html" title="Información sobre meteorología">Meteorología</a>
        </nav>
    </header>''')
        self.content.append('<main>')

    def head(self, title):
        self.content.append(f'''<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <title>{title} - MotoGP</title>
    <meta name="author" content="Carmen Méndez Camino"/>
    <meta name="description" content="Información del circuito del proyecto MotoGP-Desktop"/>
    <meta name="keywords" content="MotoGP,circuito, Lusail"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <link rel="stylesheet" type="text/css" href="{RUTA_CSS}" />
    <link rel="stylesheet" type="text/css" href="../estilo/layout.css" />
    <link rel="icon" href="../multimedia/favicon.ico"/>
</head>''')

    def section(self, title):
        self.content.append('<section>')
        self.content.append(f'<h2>{title}</h2>')

    def endSection(self):
        self.content.append('</section>')

    def article(self):
        self.content.append('<article>')

    def endArticle(self):
        self.content.append('</article>')

    def paragraph(self, text):
        self.content.append(f'<p>{text}</p>')

    def list(self, items, ordered=False):
        tag = 'ol' if ordered else 'ul'
        self.content.append(f'<{tag}>')
        for item in items:
            self.content.append(f'<li>{item}</li>')
        self.content.append(f'</{tag}>')

    def link_list(self, links):
        self.content.append('<ul>')
        for text, url in links:
            self.content.append(f'<li><a href="{url}">{text}</a></li>')
        self.content.append('</ul>')

    def image(self, src, alt):
        self.content.append(
            f'<p><img src="{src}" alt="{alt}" /></p>'
        )


    def video(self, src):
        self.content.append(
            f'''<video controls preload="metadata">
    <source src="{src}" type="video/mp4">
</video>'''
        )

    def save(self):
        self.content.append('</main>')
        self.content.append('</body>')
        self.content.append('</html>')

        with open(NOMBRE_SALIDA, 'w', encoding='utf-8') as f:
            f.write("\n".join(self.content))


def get_text(el):
    return el.text.strip() if el is not None and el.text else ''

def parse_xml(xml_file):
    tree = ET.parse(xml_file)
    root = tree.getroot()

    data = {}
    c = root

    # Datos básicos del circuito
    data['nombre'] = c.get('nombre', 'Circuito sin nombre')
    data['longitud'] = f"{get_text(c.find('u:longitud', NS))} {c.find('u:longitud', NS).get('unidades') if c.find('u:longitud', NS) is not None else ''}"
    data['anchura'] = f"{get_text(c.find('u:anchura', NS))} {c.find('u:anchura', NS).get('unidades') if c.find('u:anchura', NS) is not None else ''}"
    data['fecha'] = get_text(c.find('u:fechaCarrera', NS))
    data['hora'] = get_text(c.find('u:hora', NS))
    data['vueltas'] = get_text(c.find('u:numVueltas', NS))
    data['localidad'] = get_text(c.find('u:localidad', NS))
    data['pais'] = get_text(c.find('u:pais', NS))
    data['patrocinador'] = get_text(c.find('u:patrocinador', NS))

    # Referencias
    data['referencias'] = [get_text(r) for r in c.findall('u:referencias/u:referencia', NS)]

    # Fotos
    data['fotos'] = [get_text(f) for f in c.findall('u:galeriaDeFotografias/u:fotografia', NS)]

    # Vídeos
    data['videos'] = [get_text(v) for v in c.findall('u:galeriaDeVideos/u:video', NS)]

    # Resultado
    data['vencedor'] = get_text(c.find('u:vencedor', NS))
    clasificados = c.find('u:clasificados', NS)
    if clasificados is not None:
        data['clasificados'] = [
            get_text(clasificados.find('u:primero', NS)),
            get_text(clasificados.find('u:segundo', NS)),
            get_text(clasificados.find('u:tercero', NS))
        ]
    else:
        data['clasificados'] = []


    return data


# -------------------------------------------------------
# Función principal
# -------------------------------------------------------
def main():
    xml_file = 'circuitoEsquema.xml'
    css_path = RUTA_CSS

    data = parse_xml(xml_file)
    html = Html(data['nombre'])

    # Sección de información general
    html.section("Datos del circuito")
    html.article()
    html.list([
        f"Longitud: {data['longitud']}",
        f"Anchura media: {data['anchura']}",
        f"Fecha: {data['fecha']}",
        f"Hora de inicio: {data['hora']}",
        f"Vueltas: {data['vueltas']}",
        f"Localidad: {data['localidad']}",
        f"País: {data['pais']}",
        f"Patrocinador principal: {data['patrocinador']}"
    ])
    html.endArticle()
    html.endSection()

    # Referencias
    if data['referencias']:
        html.section("Referencias")
        html.link_list([(r, r) for r in data['referencias']])
        html.endSection()


    # Galería de fotos
    if data['fotos']:
        html.section("Galería de fotos")
        for foto in data['fotos']:
            html.image(foto, alt="Foto del circuito")
        html.endSection()

    # Galería de vídeos
    if data['videos']:
        html.section("Galería de vídeos")
        for video in data['videos']:
            html.video(video)
        html.endSection()

    # Clasificados
    if data['clasificados']:
        html.section("Clasificados")
        html.list(data['clasificados'], ordered=True)
        html.endSection()


    html.save()
    print(f"Archivo {NOMBRE_SALIDA} generado correctamente.")


if __name__ == "__main__":
    main()