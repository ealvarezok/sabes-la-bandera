var cacheName = 'cache-parcial-pwa';
var assets = [
                'index.html',
                'styles/style.css',
                'styles/bootstrap.min.css',
                'styles/bootstrap.min.css.map',
                'js/bootstrap.min.js',
                'js/bootstrap.min.js.map',
                'js/main.js',
                'https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;500;700&family=Work+Sans:wght@400;500;700&display=swap',
                'icons/favicon.png',
                    
            ]


//Instalamos SW
self.addEventListener('install', (e) => {

    self.skipWaiting();
    console.log('Service worker instalado', e);



    e.waitUntil(
        caches.open(cacheName)
            .then(cache => {
                cache.addAll(assets)
            })
    )

})

//Activamos SW
self.addEventListener('activate', (e) => {

    console.log('Service worker activado', e);

});

//Capturamos las peticiones de la interfaz
self.addEventListener('fetch', (e) => {
    console.log('Request', e);

    e.respondWith(
        caches.match(e.request)
            .then(response => {
                if(response){
                    return response;
                }
                return fetch(e.request);
            })
    )
})