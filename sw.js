var cacheName = 'cache-parcial-pwa';
var assets = [
                'index.html',
                'styles/style.css',
                'styles/bootstrap.min.css',
                'js/main.js?v=2',
                'js/bootstrap.min.js',
                'https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;500;700&family=Work+Sans:wght@400;500;700&display=swap',
                'icons/favicon.png',
                'manifest.webmanifest'

                    
            ]

self.addEventListener('install' , (e) => {
    self.skipWaiting();
    //console.log('service worker instalado' , e);

    e.waitUntil(
        caches.open(cacheName)
        .then(function(cache){
            cache.addAll(assets)
        })
    );
})

self.addEventListener('activate' , (e) => {
    //console.log('service worker activo' , e);
})

self.addEventListener('fetch', (e) => {
    console.log('Request', e);
        e.respondWith(
        caches.match(e.request)
            .then(response => {
                if(response){
                    return response;
                }
                
                let requestToCache = e.request.clone();

                return fetch(requestToCache)
                    .then(res => {

                        if(!res) {
                            console.log("Responder error amigable: ", res);
                            return res;
                        }

                        let responseToCache = res.clone();

                        caches.open(cacheName)
                            .then(cache => {
                                cache.put(requestToCache, responseToCache);
                            })

                        return res;

                    })
                    .catch(error => {
                        console.log('Responder error amigable 2');
                        return new Response ("La app esta offline" , error);
                    })
            })
        )
})

//Recibimos las notificaciones de push
self.addEventListener('push', event =>{
    console.log(event.data.text());
    let data = JSON.parse(event.data.text());
    console.log(data);

    //? Modificar estos datos dependiendo de lo que quiera que diga mi notificacion
    let title = data[0].title;
    let body = data[0].body;
    // let title = "¡Felicitaciones!";
    // let body = "Lograste avanzar al siguiente nivel";

    let options = {
        body: body,
        icon: 'icons/icon192.png',
        vibrate: [500,200,500,700, 200],
        tag: 1,
        actions: [
           {action:1, icon: "icons/icon192.png", title: "Acceder"},
           {action:2, icon: "icons/icon192.png", title: "No acceder"}
        ],
    } 
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
})

self.addEventListener('notificationclick', event=> {
    if(event.action == 1){
        console.log('El usuario quiere acceder');
    } else {
        console.log('El usuario no quiere acceder');
    }
    event.notification.close();
})