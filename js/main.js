'use strict';

//!VER TEMA DE ID . 22/05
//! Agregar notificaciones 29/05 17.00HS
//! AGREGAR BANDERAS A LOCALSTORAGE PARA QUE SE CARGUEN


window.addEventListener('DOMContentLoaded' , (event) => {
    if('serviceWorker' in navigator){
    
        navigator.serviceWorker.register('sw.js')

            .then(registration => {
                console.log("Regsitramos el service worker",registration);
            })
            .catch(rejeted => {
                console.error("NO SE REGISTRÓ el service worker",rejeted);
            })

    };
    if(localStorage.getItem('paisesLocal')){
        paisesLocal = JSON.parse(localStorage.getItem('paisesLocal'));

    }
    ConnectionStatus();
});


/**
 * Accedemos a etiquetas del html mediante DOM
 */
let home                    = document.querySelector('[data-home="contenido"]');
let inicio                  = document.querySelector('[data-home="inicio"]');
let btnIniciar              = document.querySelector('[data-home="btnInicio"]');
let h2Nivel                 = document.querySelector('h2');
let correctasDOM            = document.querySelector('#tengo');
let incorrectasDOM          = document.querySelector('#falta');
let segundosDOM             = document.querySelector('#segundos');
let reiniciar               = document.querySelector('[data-home="reiniciar"]');
let nav                     = document.querySelector('nav');
    
/**
 * Creamos etiquetas mediante DOM que luego utilizaremos en el html
 */
let btnModal                = document.createElement('button');
let divGeneral              = document.createElement('div');
let pictureImg              = document.createElement('picture');
let img                     = document.createElement('img');
let divOpciones             = document.createElement('div');
let modal                   = document.createElement('div');
let modalContenido          = document.createElement('div');
let h3Modal                 = document.createElement('h3');
let divResultado            = document.createElement('div');
let pResultado              = document.createElement('p');
let ulResultado             = document.createElement('ul');
let liResultadoCorrecto     = document.createElement('li');
let liResultadoIncorrecto   = document.createElement('li');
let pModal                  = document.createElement('p');
let instruccion             = document.createElement('p');
let h3Nivel                 = document.createElement('h3');
let estadoUsuario           = document.createElement('p');

/**
 * Seteamos los atributos de las etiquetas DOM
 */
btnModal.                   setAttribute('data-home', 'btnIntentar');
divGeneral.                 setAttribute('data-card', 'card-vertical');
pictureImg.                 setAttribute('data-card', 'div-img');
img.                        setAttribute('data-card', 'img')
divOpciones.                setAttribute('data-opciones', 'general');
modal.                      setAttribute('data-home', 'inicio');
modalContenido.             setAttribute('data-home', 'inicio-contenido');
h3Modal.                    setAttribute('data-home', 'titulo');
divResultado.               setAttribute('data-modal', 'div-resultado');
ulResultado.                setAttribute('data-home', 'resultados-provisorios');
instruccion.                setAttribute('data-home', 'instruccion');
estadoUsuario.              setAttribute('class', 'estado-conexion');



/**
 * Creamos las variables
 */
let correctas               = 0;
let incorrectas             = 0;
let segundos                = 20;
    segundosDOM.innerText   = ` ${segundos}`;
let nivel1                  = false; 
let nivel2                  = false;
let nivel3                  = false;
let idPais                  = 0;
let idMax                   = 0;
let paisesLocal             = [];
let restoDePaises           = []; 
let opciones                = [];


//Instalacion de PWA
let btnInstalar = document.querySelector('[data-home="btnInstalar"]');
let eventInstall;

//Escuchamos el evento beforeinstallprompt
window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    eventInstall = event;
    if(btnInstalar != undefined){
        btnInstalar.style.display = 'inline-block';
        btnInstalar.addEventListener('click', InstallApp);

    }

});
//Creamos la funcion para instalar la app
let InstallApp = () => {
    if(eventInstall != undefined){
        eventInstall.prompt();
        eventInstall.userChoice
                    .then(respuesta => {
                        if(respuesta.outcome === 'accepted'){
                            console.log('El usuario aceptó instalar');
                        } else {
                            console.log('El usuario no aceptó instalar');
                        }   
                    })
    }
}

//Utilizamos la API share para compartir nuestra app
//console.log(navigator);
let btnCompartir = document.querySelector('.btnCompartir');
if(navigator.share) {
    btnCompartir.addEventListener('click', () => {

        const shareData = {
            title   : "Sabes La Bandera?",
            text    : "Juego de banderas de todo el mundo",
            url     : "http://localhost:8888/PWA/parcial-1-preentrega/index.html",
        }
        navigator.share(shareData)
                .then (respuesta => {
                    console.log(respuesta);
                })
                .catch (error => {
                    console.log(error);
                })
    });
} else {
    btnCompartir.remove();
}


//Notificaciones push (se puede crear boton que llame a la funcion)
if(window.Notification) {
    if(Notification.permission !== 'denied'){

        setTimeout(function (){
            Notification.requestPermission()
                        .then(permission => {
                            if(permission == 'granted'){
                                console.log('El usuario aceptó, realizamos la suscripción al servidor.')

                            } else {
                                console.log('El usuario no aceptó recibir notificación.')

                            }
                        })

        }, 5000)
        
    }
}

//Offline - Online
nav.before(estadoUsuario);
let ConnectionStatus = () => {
    console.log('Estado de la conexión: ', navigator.onLine);
    if(!navigator.onLine){
     //!Si estado de conexion en false podemos habilitar o deshabilitar cosas
     //!Agregar css para que el usuario sepa si esta conectado o no 05/06 57 min
        estadoUsuario.innerText = "Estas jugando offline";
        estadoUsuario.style.backgroundColor = "red";
        
        
    } else {
        estadoUsuario.innerText = "Estas jugando online";
        estadoUsuario.style.backgroundColor = "green";


    }
}
window.addEventListener("onLine", ConnectionStatus);
window.addEventListener("offLine", ConnectionStatus);


/**
 * Accedemos a la API externa
 */
fetch('https://restcountries.com/v3.1/all')

    .then(response => response.json())

    .then( paisesApi => {
        //console.log('PAISES API',paisesApi);
        //console.log(paisesLocalStorage);
        /**
         * Recorremos la API externa
         */

        for (const p of paisesApi) {

            /**
             * Le creamos un id automático a cada país
             */
            if (idPais == idMax){
                idPais++;
                idMax = idPais;
            }

            /**
             * Pusheamos los datos que necesitamos de cada país a un nuevo array de objetos
             */
            paisesLocal.push({
                id          : idPais,
                nombre      : p["translations"]["spa"]["common"], 
                bandera     : p["flags"]["svg"], 
                poblacion   : p["population"] //La poblacion la agregamos por si en un futuro la necesitamos
            })
            localStorage.setItem('paisesLocal', JSON.stringify(paisesLocal));
            paisesLocal = JSON.parse(localStorage.getItem('paisesLocal'));

            //Guardamos las imagenes en una variable para que queden cargadas al service worker 
            let imgCarga = document.createElement('img');
            imgCarga.src = p["flags"]["svg"];

            
        }
        //console.log(paisesLocal);

        /**
         * llamarPaisRandom selecciona un país aleatorio del nuevo array de paises pusheado anteriormente
         */
        const llamarPaisRandom = function(){
            
            let paisRandom = paisesLocal[Math.round(Math.random() * paisesLocal.length)];
            /**
             * Con el metodo filter quitamos del array el pais seleccionado para que no se repita 
             */
            if (paisesLocal){
                restoDePaises = paisesLocal.filter(pais => pais.id != paisRandom.id);

            }
            /**
             * Actualizamos el array de paises
             */
            paisesLocal = restoDePaises;
            localStorage.setItem('paisesLocal', JSON.stringify(paisesLocal));
            paisesLocal = JSON.parse(localStorage.getItem('paisesLocal'));


            return paisRandom

        }
        /**
         * Agregamos un evento click al botón de iniciar.
         */
        btnIniciar.addEventListener('click', (e) =>{
            if(e){
                inicio.remove();
                crearTrivia();
                nivel1 = true;

                h2Nivel.innerText = 'Nivel 1';

                /**
                 * Creamos la funcion cronómetro que restara 1 segundo al tiempo fijado en la app.
                 */
                const cronometro = function(){
                    segundos--;
                    segundosDOM.innerText = segundos;

                    if(segundos > 5){
                        segundosDOM.parentElement.style.color = 'white';

                    } else if (segundos <= 5 && segundos > 0){
                        segundosDOM.parentElement.style.color = 'red';
                        
                    }  else if (segundos <= 0) {
                        clearInterval(tiempo);
                        segundos                                = 20;
                        segundosDOM.innerText                   = segundos;
                        segundosDOM.parentElement.style.color   = 'white';
                        
                        pResultado.innerText                    = 'Este es tu resultado:';
                        liResultadoCorrecto.innerText           = `Aciertos: ${correctas}`;
                        liResultadoIncorrecto.innerText         = `Errores: ${incorrectas}`;

                        home.                   appendChild(modal);
                        modal.                  appendChild(modalContenido);
                        modalContenido.         appendChild(h3Modal);
                        modalContenido.         appendChild(divResultado);
                        divResultado.           appendChild(pResultado);
                        divResultado.           appendChild(ulResultado);
                        ulResultado.            appendChild(liResultadoCorrecto);
                        ulResultado.            appendChild(liResultadoIncorrecto);
                        modalContenido.         appendChild(btnModal);


                        /**
                         * Verificamos si el usuario puede acceder al siguiente nivel y modificamos el DOM correspondiente
                         */
                        if(nivel1 === true && correctas >= 5){
                            h3Modal.innerText       = '¡Felicitaciones, pasaste al segundo nivel!';
                            btnModal.innerText      = 'Iniciar segundo nivel';
                            instruccion.innerText   = 'En el segundo nivel, los aciertos SUMAN 3 segundos, los errores RESTAN 3 segundos';
                            nivel1                  = false;
                            nivel2                  = true;
                            h2Nivel.innerText       = 'Nivel 2';
                            divResultado.           before(instruccion);

                        /**
                         * Verificamos si el usuario puede acceder al siguiente nivel y modificamos el DOM correspondiente
                         */
                        } else if (nivel2 === true && correctas >= 5){
                            h3Modal.innerText       = '¡Felicitaciones, pasaste al tercer nivel!';
                            btnModal.innerText      = 'Iniciar tercer nivel';
                            instruccion.innerText   = 'En el tercer nivel, los aciertos NO suman segundos, los errores RESTAN 3 segundos';
                            nivel2                  = false;
                            nivel3                  = true;
                            h2Nivel.innerText       = 'Nivel 3';
                            divResultado.           before(instruccion);


                        /**
                         * Verificamos si el usuario ganó el juego y modificamos el DOM correspondiente
                         */
                        } else if (nivel3 === true && correctas >= 5){
                            h3Modal.innerText   = '¡Felicitaciones, ganaste el juego!';
                            nivel3              = false;
                            btnModal.innerText  = 'Volver a inicio';
                            instruccion.        remove();
                            btnModal.           addEventListener('click', volverInicio);

                        /**
                         * Verificamos si el usuario perdió el juego y modificamos el DOM correspondiente
                         */
                        } else {
                            h3Modal.innerText   = '¡Ups, se terminó el tiempo!';
                            nivel1              = false;
                            nivel2              = false;
                            nivel3              = false;
                            btnModal.innerText  = 'Volver a inicio';
                            instruccion.        remove();
                            btnModal.           addEventListener('click', volverInicio);

                        }
                    }
                }
                /**
                 * Indicamos que la funcion cronómetro se tiene que repetir cada 1 segundo
                 */
                let tiempo = setInterval(cronometro,1000);

                /**
                 * Agregamos un evento click al boton que aparecerá cuando se termine el tiempo. En cualquiera de los casos se deberán reiniciar las opciones y las imagenes.
                 */
                btnModal.addEventListener('click', (e) =>{
                    if(e){
                        opciones                = [];
                        divOpciones.innerHTML   = '';
                        correctas               = 0;
                        correctasDOM            = correctas;
                        incorrectas             = 0;
                        incorrectasDOM          = incorrectas;
                        segundos                = 20;
                        tiempo                  = setInterval(cronometro,1000);
                        modal.                  remove();
                        crearTrivia();
            
                    }
                });

                /**
                 * Agregamos un evento click al boton "reiniciar" del nav
                     */
                reiniciar.addEventListener('click', volverInicio);
            
            }
        })

        /**
         * crearTrivia es una funion que mediante el llamado a otras funciones y la creacion de etiquetas DOM, permite desarrollar la trivia correctamente.
         */
        const crearTrivia = function (){

            /**
             * Ejecutamos en 4 oportunidades la funcion de llamarPaisRandom para obtener la opcion correcta y las otras 3 opciones incorrectas.
             */
            let opcionCorrecta  = llamarPaisRandom();
            console.log("Opcion correcta",opcionCorrecta)
            let opcionRandom1   = llamarPaisRandom();
            let opcionRandom2   = llamarPaisRandom();
            let opcionRandom3   = llamarPaisRandom();


            /**
             * Pusheamos estas opciones a un nuevo array  que luego mediante sort lo desordenamos aleatoriamente.
             */
            opciones.push(opcionCorrecta, opcionRandom1, opcionRandom2, opcionRandom3);
            opciones.sort(() => Math.random() - 0.5);
            //console.log(opciones);

            /**
             * Agregamos las etiquetas generadas con DOM al html
             */
            home.appendChild(divGeneral);
            divGeneral.appendChild(pictureImg);

            /**
             * Seteamos los atributos correspondientes de la imagen
             */
            img.src = opcionCorrecta.bandera;
            img.alt = opcionCorrecta.nombre;
            img.setAttribute('data-id', opcionCorrecta.id);
            img.setAttribute('data-nombre', opcionCorrecta.nombre);
            img.setAttribute('data-poblacion', opcionCorrecta.poblacion);
            pictureImg.appendChild(img);

            home.appendChild(divOpciones);

            /**
             * Recorremos las opciones, creamos una botón con cada opciony le seteamos los atributos corresponientes
             */
            for (const o of opciones) {
                //console.log(o);
                let opcion = document.createElement('button');
                    opcion.setAttribute('type', 'button');
                    opcion.setAttribute('data-opciones', 'opcion');
                    opcion.setAttribute('data-id', o.id);
                    opcion.setAttribute('data-nombre', o.nombre);
                    opcion.innerText = o.nombre;
                    divOpciones.appendChild(opcion);

                /**
                 * Creamos un evento click para cada boton de opcion
                 */
                opcion.addEventListener('click', (e) =>{

                    /**
                     * Mediante DOM accedemos a todas la opciones del html
                     */
                    let opcionesDOM = document.querySelectorAll('[data-opciones="opcion"]');

                    if(e){

                        /**
                         * Validamos que el id de la opcion en la que hagamos click sea el mismo que el id de la imagen.
                         */
                        if(opcion.dataset.id === img.dataset.id){
                            opcion.style.backgroundColor = 'rgb(3, 152, 0)';
                            correctas++;
                            correctasDOM.innerText = correctas;

                            if(nivel1 == true || nivel2 == true){
                                segundos += 3;
                                segundosDOM.innerText = segundos;
                                //console.log('+3')
                            }
        
                        } else {
                            opcion.style.backgroundColor = 'rgb(228, 29, 3)';
                            incorrectas++;
                            incorrectasDOM.innerText = incorrectas;

                            if(nivel2 == true || nivel3 == true){
                                segundos = segundos > 3 ? segundos -= 3 : segundos = 0;
                                segundosDOM.innerText = segundos;
                                //console.log('-3')
                            }


                            /**
                             * Si no clickeamos la opcion correcta, ésta tendrá un background-color amarillo.
                             */
                            for (const o of opcionesDOM) {
                                if (o.dataset.id === img.dataset.id){
                                    o.style.backgroundColor = 'rgb(255, 196, 0)';  

                                }    
                            }
                        }

                        /**
                         * Activamos el atributo disabled para que el usuario no pueda hacer click en otra opcion
                         */
                        for (const o of opcionesDOM) {
                            o.disabled = true;
                        }
                        
                        /**
                         * nuevaTrivia reinicia la trivia y accede otra vez a una nueva bandera y nuevas opciones
                         */
                        let nuevaTrivia = function() {
                            
                            opciones = [];
                            divOpciones.innerHTML = '';
                            crearTrivia();
                            /**
                             * Con el clearTimout finalizamos el temporizador "refrescar"
                             */
                            clearTimeout(refrescar);
                            
                        }
                        
                        /**
                         * Creamos un temporizador para que luego de que el usuario clickee una opcion quede fija por 1 segundo para que pueda observar cual era la opcion correcta.
                         */
                        let refrescar = setTimeout(nuevaTrivia, 1000);

                    }
                })
            }
        }


        /**
        * Creamos la funcion volver a inicio que recarga la página.
        */
        const volverInicio = function(){
            window.location.reload();
        }
        

    }); 