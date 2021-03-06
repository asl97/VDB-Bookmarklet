(function(){
'use strict';
let proxy = 'https://cors-anywhere.herokuapp.com/';
let host_regex = 'https?://readms.net/r/';
let _scope = function(scope){
    this.dependencies = []
    this.scope = scope

    this.load = function(url){
        let script = document.createElement('script');
        script.src = url;
        let p = new Promise((resolve,reject)=>{
            script.onload = resolve;
            script.onerror = function(){reject(url)};
        });
        scope.appendChild(script);
        this.dependencies.push(p);
    }

    this.run = async function(func){
        await Promise.all(this.dependencies).catch(function(error) {
            let emsg = `Dependency '${error}' failed to load`;
            alert(emsg);
            throw emsg;
            
        });
        let script = document.createElement('script');
        script.text = `(function(){let proxy='${proxy}'; (${func.toString()})()})()`;
        scope.appendChild(script);
    }
}

let local_scope = async function(){
    let scope = new _scope(document.body);
    return scope
}

let iframe_scope = async function(){
    let iframe = document.createElement("iframe");
    iframe.style.display = "none";
    let loaded = new Promise((resolve,reject)=>{iframe.onload = resolve});
    document.body.appendChild(iframe);

    await loaded;

    let scope = new _scope(iframe.contentDocument.body);
    return scope;
}

let bookmarklet = async function(dependencies, func, scope=iframe_scope){
    if (!location.href.match(host_regex)){
        if (!confirm(`Current url doesn't match host regex:\n${host_regex}\n\nContinue?`))
            return
    }

    let iframe = await scope();
    for (let dependency of dependencies){
        iframe.load(dependency);
    }

    iframe.run(func);
    return iframe;
}

// local scoped
bookmarklet([
    "https://stuk.github.io/jszip/dist/jszip.js",
    "https://stuk.github.io/jszip-utils/dist/jszip-utils.js",
    "https://stuk.github.io/jszip/vendor/FileSaver.js",
    ], function(){
        function urlToPromise(url) {
            return new Promise(function(resolve, reject) {
                JSZipUtils.getBinaryContent(proxy+url, function (err, data) {
                    if(err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
            });
        };

        async function _process_urls(queue, limit) {
            let executing = [];
            let promises = [];

            // limit the amount of concurrent requests
            for (let [resolve, name, url] of queue) {
                if (executing.length >= limit){
                    await Promise.race(executing);
                }
                let promise = urlToPromise(url);
                executing.push(promise);
                promises.push(promise);
                promise.then((data)=>{
                    executing.splice(executing.indexOf(promise), 1);
                    resolve([name, data]);
                });
            };

        }

        function process_urls(links, limit=4){
            let promises = [];
            let queue = [];

            for (let [name, link] of links){
                promise = new Promise(function(resolve, reject) {
                    queue.push([resolve, name, link]);
                });

                promises.push(promise);
            }

            _process_urls(queue, limit);
            return promises;
        }

        async function download_images(archive_name, links){
            var zip = new JSZip();

            let promises = process_urls(links);
            for (let promise of promises){
                let [filename, data] = await promise;
                zip.file(filename, data, {binary:true});
            }

            // When everything has been downloaded, we can trigger the dl
            zip.generateAsync({type:"blob"}, function updateCallback(metadata) {
                //var msg = "progression : " + metadata.percent.toFixed(2) + " %";
                //console.log(msg);
            }).then(function callback(blob) {
                // see FileSaver.js
                saveAs(blob, archive_name);
                console.log("done !");
            }, function (e) {
                alert(e);
            });
        }

        let maxpage = 0;
        let parser = new DOMParser();
        async function fetch_page(page, prefix){
            link = `https://readms.net/r/${prefix}${manga_name}/${chapter}/${mangastream_chapter_id}/${page}`;
            let r = await fetch(link);
            let text = await r.text();
            let doc = parser.parseFromString(text, "text/html");
            let image_link = doc.getElementById('manga-page').src;
            let image_name = page.toString().padStart(Math.floor(Math.log10(maxpage))+1, 0)+"_"+image_link.split('/').pop();
            return [image_name, image_link];
        }

        async function start(){
            let href_parts;
            for (let li of document.getElementsByClassName('btn-reader-page')[0].getElementsByTagName('li')){
                href_parts = li.firstChild.href.split('/');
                pageid = parseInt(href_parts.pop());
                if (pageid > maxpage){
                    maxpage = pageid;
                }
            }

            mangastream_chapter_id = href_parts.pop();
            chapter = href_parts.pop();
            manga_name = href_parts.pop();

            extras = [];
            let extra;
            while ((extra = href_parts.pop()) !== 'r'){
                extras.push(extra+'/');
            }

            pages = [];
            for (let page = 1; page<=maxpage; page++){
                pages.push(fetch_page(page, extras.join('')));
            }

            download_name = `[MangaStream]${manga_name}_c${chapter.padStart(3,0)}.zip`;

            download_images(download_name, await Promise.all(pages));
        }

        start()
    },
    // Require running in non-isolated scope due to CORS
    local_scope
)
})()
