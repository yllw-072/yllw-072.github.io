//recursos basicos necessarios pro site funcionar
const staticCacheName = 'site-static-v2';
//recursos que sao armazenados na medida que o usuario ira utilizar o sistema
const dynamicCacheName = 'site-dynamic-v1';
//aqui ficam os endereços de requisicao para recursos que você quer fazer cache
const assets = [
    '/',
    '/index.html',
    '/js/app.js',
    '/js/ui.js',
    '/js/materialize.min.js',
    '/css/materialize.min.css',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://fonts.gstatic.com/s/materialicons/v47/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',
    '/pages/fallback.html'
];

// essa linha limita o tamanho do cache
const limitCacheSize = (name, size) => {
    //usa a api de cache
    caches.open(name).then(cache => {
        cache.keys().then(keys => {
            if (keys.length > size) {
                cache.delete(keys[0]).then(limitCacheSize(name, size));
            }
        });
    });
};

// evento de instalação do service worker
self.addEventListener('install', evt => {
    //console.log('service worker instalado');
    evt.waitUntil(
        caches.open(staticCacheName).then((cache) => {
            console.log('Fazendo caching de recursos');
            cache.addAll(assets);
        })
    );
});

// evento de ativação
self.addEventListener('activate', evt => {
    console.log('service worker ativado');
    //como o evento de instalação pode ter sido tao rápido que não deu tempo fazer cache -> usamos o waitUntil, que aguarda até a promise tenha sido concretizada para instalar o sw
    evt.waitUntil(
        caches.keys().then(keys => {
            //keys pega os nomes dos caches antigos e deleta os caches antigos
            return Promise.all(keys
                .filter(key => key !== staticCacheName && key !== dynamicCacheName)
                .map(key => caches.delete(key))
            );
        })
    );
});

// evento de fetch
self.addEventListener('fetch', evt => {
	// console.log("YEEEEEEEEEEEEEY");
    //console.log('fetch event', evt);
    //respondWith previne que o browser tente responder à requisição e permite-nos prover uma resposta personalizada à requisição (por exemplo, fornecer um recurso que colocamos em cache)
    evt.respondWith(
        caches.match(evt.request).then(cacheRes => {
            return cacheRes || fetch(evt.request).then(fetchRes => {
            	//aproveita que o servidor respondeu e armazena a resposta em um cache dinâmico
                return caches.open(dynamicCacheName).then(cache => {
                    cache.put(evt.request.url, fetchRes.clone());
                    //checar tamanho dos itens de cache
                    limitCacheSize(dynamicCacheName, 15);
                    return fetchRes;
                })
            });
        }).catch(() => {
        	//se pagina nao foi encontrada em cache
        	//e nao ha rede para obter essa pg
        	//devolva a pagina de fallback
            if (evt.request.url.indexOf('.html') > -1) {
                return caches.match('/pages/fallback.html');
            }
        })
    );
});
//1
self.addEventListener('install', evt => {
    // console.log('Service worker foi instalado.');
    evt.waitUntil(
        caches.open(staticCacheName).then((cache) => {
            console.log('Fazendo caching de recursos');
            cache.addAll(assets);
        })
    );

});

self.addEventListener('activate', evt => {
    console.log('Service worker foi ativado.');
    evt.waitUntil(
        caches.keys().then(keys => {
            //console.log(keys);
            return Promise.all(keys
                .filter(key => key !== staticCacheName && key !== dynamicCacheName)
                .map(key => caches.delete(key))
            );
        })
    );
});

//2
self.addEventListener('fetch', evt => {
    // console.log('Service worker capturou um evento do tipo fetch.');
    evt.respondWith(
        caches.match(evt.request).then(cacheRes => {
            return cacheRes || fetch(evt.request).then(fetchRes => {
                return caches.open(dynamicCacheName).then(cache => {
                    cache.put(evt.request.url, fetchRes.clone());
                    return fetchRes;
                })
            });
        })
    );

});
