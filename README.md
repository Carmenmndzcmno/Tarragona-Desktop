# Software y Estándares para la Web EII
Entrega deL trabajo de la asignatura de _Software y Estándares para la Web_ del curso 2025/26 en la EII.
<img width="400" height="200" alt="image_gallery" src="https://github.com/user-attachments/assets/06d21ac3-21b6-4a9a-92f8-f3488eff9c13" />


## Tarragona-Desktop [7/10]
Se ha realizado un sitio Web sobre los recursos turísticos de una provincia de España. Este caso Tarragona.

Todos los documentos (estáticos y generados) que componen el proyecto cumplen el
estándar HTML5, con una correcta estructuración de los contenidos y el marcado semántico
correcto.

Las hojas de estilo son aplicadas a todos los documentos que componen el sitio web.
La definición de selectores es correcta y óptima, teniendo prohibido el uso de ID y class como
selectores en las hojas de estilo salvo en las excepciones especificadas en la asignatura.
Todos los selectores de las hojas de estilo son precedidos por su especificidad como un
comentario.
Se añadieron comentarios en las reglas de las hojas de estilo, justificando las advertencias del
validador de CSS del W3C, en concreto, la herencia de colores (indicando de donde se hereda) y
las redefiniciones de las propiedades, véase apartado “Advertencias CSS”
Se garantiza la adaptabilidad del sitio web.

Se ha diseñado un archivo XML.
• Contiene validadores DTD y Schema. El Schema debe valida tipos de datos y es
generado a partir del DTD.
• Se utiliza el lenguaje Python exclusivamente, para generar los archivos KML (planimetría)
y SVG (altimetría) a partir de un archivo XML.
• El KML de cada ruta se es visualizado en el HTML como un mapa
• El SVG de cada ruta se es visualizado en el HTML como un elemento gráfico
• Se traduce a HTML usando ECMAScript y jQuery, para crear el archivo “rutas.html”
que es enlazado desde la opción del menú de navegación “Rutas”.
• No se nos tuvo permitido la utilización de transformaciones XSLT por problemas de seguridad.
• No se nos tuvo permitido la utilización de lenguajes diferentes a los especificados

Respecto a la Computación en el Cliente:

Se usó obligatoriamente el paradigma de orientación a objetos en ECMAScript. No
se admitió el paradigma procedimental ni otros paradigmas soportados por ECMAScript.
• No se pudo utilizar bibliotecas externas (a excepción de jQuery)
• Se usó jQuery obligatoriamente encapsulado dentro clases, objetos y métodos para
mantener el paradigma de orientación a objetos.

Esta versión pública del proyecto entregado no contiene ninguna api key.

