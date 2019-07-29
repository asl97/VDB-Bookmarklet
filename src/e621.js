(function(){
'use strict';
let proxy = 'https://cors-anywhere.herokuapp.com/';
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
                JSZipUtils.getBinaryContent(url, function (err, data) {
                    if(err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
            });
        };

        let id = window.location.href.split('/').pop();
        let links = [];

        async function get_page(page){
            let r = await fetch(`https://e621.net/pool/show.json?id=${id}&page=${page}`);
            let json = await r.json();
            return json
        }

        function process_page(json){
            for (post of json.posts){
                let filename = post['file_url'].split('/').pop();
                links.push([filename, proxy+post['file_url']])
                if (post['has_notes']){
                    links.push([filename+".xml", `https://e621.net/note/index.xml?post_id=${post["id"]}`])
                }
            }
        }

        async function urlWithNameToPromise(filename, url){
            return [filename, await urlToPromise(url)]
        }

        // limit concurrent async
        async function process_urls(urls, limit=4) {
            let executing = [];
            let promises = [];

            // limit the amount of concurrent requests
            for (let [filename, url] of urls) {
                if (executing.length >= limit){
                    await Promise.race(executing);
                }
                let promise = urlWithNameToPromise(filename, url);
                executing.push(promise);
                promises.push(promise);
                promise.then(()=>{executing.splice(executing.indexOf(promise), 1)})
            };

            return Promise.all(promises)
        }

        async function download_images(archive_name){
            var zip = new JSZip();

            let datas = await process_urls(links);
            for (let [filename, data] of datas){
                zip.file(filename, data, {binary:true});
            }

            // When everything has been downloaded, we can trigger the dl
            zip.generateAsync({type:"blob"}, function updateCallback(metadata) {
                var msg = "progression : " + metadata.percent.toFixed(2) + " %";
                console.log(msg);
            }).then(function callback(blob) {
                // see FileSaver.js
                saveAs(blob, archive_name);
                console.log("done !");
            }, function (e) {
                alert(e);
            });
        }

        async function start(){
            let json;
            let first_page = await get_page(1);
            process_page(first_page);
            let total_count = first_page.post_count;
            let count = first_page.posts.length;

            let page_num = 2;
            json = first_page;

            while (json.posts.length && count < total_count){
                json = await get_page(page_num);
                process_page(json)
                count += json.posts.length;
                page_num+=1
            }

            download_images(`${first_page.name}-${id}.zip`)
        }

        start()
    },
    // Require running in non-isolated scope due to CORS
    local_scope
)
})()
