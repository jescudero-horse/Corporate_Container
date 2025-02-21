//Inicializamos el lienzo utilizando fabric.js
const canvas = new fabric.Canvas('planoCanvas');

//Creamos una instancia de la imagen
const img = new Image();

//Establecemos la imagen
img.src = '/assets/plano_prueba.png';

//Añadimos la funcionalidad para cuando la imagen haya sido cargada
img.onload = function () {
    //Creamos una instancia de la imagen y su configuración
    const imgInstance = new fabric.Image(img, {
        left: 0,
        top: 0,
        scaleX: 1,
        scaleY: 1
    });

    //Establecemos el ancho y alto del lienzo según la imagen
    canvas.setWidth(img.width);
    canvas.setHeight(img.height);

    //Añadimo la imagen en el fondo del lienzo
    canvas.setBackgroundImage(imgInstance, canvas.renderAll.bind(canvas));

    //Desactivamos el modo de dibujo inicialmente
    canvas.isDrawingMode = false;

    /**Declaramos las variable que vamos a utilizar para realizar los calculos */
    let previousEndPoint = null; //Almacenamos el último punto de la línea
    let totalDistancePixels = 0; //Acumulamos la distancia total en pixeles
    let points = []; //Almacenamos los puntos dibujados
    let curveCount = 0; //Almacenamos las curvas contadas

    //Añadimos la funcionalidad para cuando se hace clic sobre el linzo
    canvas.on('mouse:down', function (options) {
        /**Obtenemos la posición de los clicks */
        const pointer = canvas.getPointer(options.e);
        const currentPoint = new fabric.Point(pointer.x, pointer.y);

        //En caso de que sea el primer clic almacenamos el primer punto
        if (!previousEndPoint) {
            //Guardamos el primer punto
            previousEndPoint = currentPoint; 

            //Agregamos el primer punto en el array
            points.push(currentPoint); 
            return;
        }

        //Dibujamos la línea desde el primer punto hasta el segundo
        const line = new fabric.Line([previousEndPoint.x, previousEndPoint.y, currentPoint.x, currentPoint.y], {
            stroke: 'red', //Color de la línea
            strokeWidth: 3, //Grosor de la línea
            selectable: false, //La línea no es seleccionable
            evented: false //La línea no responde a eventos
        });

        //Agregamos la línea al canvas
        canvas.add(line); 

        //Calculamos la distancia entre el último punto y el actual
        const distance = Math.sqrt(Math.pow(currentPoint.x - previousEndPoint.x, 2) + Math.pow(currentPoint.y - previousEndPoint.y, 2));

        //Acumulamos la distancia total
        totalDistancePixels += distance;

        //Verificamos si hay más de dos puntos para calcular el ángulo
        if (points.length > 1) {
            //Último punto de la línea actual
            const lastPoint = points[points.length - 1]; 

            //Penúltimo punto
            const secondLastPoint = points[points.length - 2]; 

            //Llamamos a la función para calcular el ángulo para determinar si hay una curva
            const angle = calculateAngle(secondLastPoint, lastPoint, currentPoint);

            //15 grados para considerar una curva
            if (angle > 15) {
                //Incrementamos el contador de curvas
                curveCount++; 
            }
        }

        /**Actualizamos el punto final para la próxima línea */
         //Establecemos el nuevo punto final
        previousEndPoint = currentPoint;

         //Añadimos el nuevo punto al array
        points.push(currentPoint);

        console.log('Distancia total (en píxeles):', totalDistancePixels);
        console.log('Número de curvas:', curveCount);
    });

    /**Escalamos en píxeles por metro para convertir la distancia */
    //Ancho del liezo
    const pixelsPerMeterWidth = canvas.width / 70; 

    //Alto del lienzo
    const pixelsPerMeterHeight = canvas.height / 140; 

    //Promedio (calculo de pixeles por metro en horizontal y vertical)
    const pixelsPerMeter = (pixelsPerMeterWidth + pixelsPerMeterHeight) / 2; 

    //Añadimos la funcionalidad para cuando se suelto el botón del mouse
    canvas.on('mouse:up', function () {
        //Convierte la distancia total a metros
        const totalDistanceMeters = totalDistancePixels / pixelsPerMeter;
        console.log('Distancia total (en metros):', totalDistanceMeters);
    });
};

/**
 * Función para calcular el angulo usando tres puntos
 * @param {*} p1 Argumento que contiene el primer punto A
 * @param {*} p2 Argumento que contiene el tercer punto B
 * @param {*} p3 Argumento que contiene el tercer punto C
 * @returns Devuelve el ángulo
 */
function calculateAngle(p1, p2, p3) {
    //Ángulo del primer segmento
    const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x);

    //Ángulo del segundo segmento
    const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);

    //Convertimos a grados
    const angle = Math.abs(angle1 - angle2) * (180 / Math.PI);

    return angle > 180 ? 360 - angle : angle;
}

//En caso de que ocurra algún error
img.onerror = function () {
    console.error('Error al cargar la imagen');
};