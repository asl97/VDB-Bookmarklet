(function(){
'use strict';
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
        script.text = `(${func.toString()})()`;
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

        for (id in globalInitData.preload.illust){
            fetch(`https://www.pixiv.net/ajax/illust/${id}/pages`).then((r)=>{
                r.json().then((json)=>{

                    var zip = new JSZip();
                    // Find every page
                    for (img of json.body){
                        name = img.urls.original.split('/').pop();
                        zip.file(name, urlToPromise(img.urls.original), {binary:true});
                    }

                    // When everything has been downloaded, we can trigger the dl
                    zip.generateAsync({type:"blob"}, function updateCallback(metadata) {
                        var msg = "progression : " + metadata.percent.toFixed(2) + " %";
                        console.log(msg);
                    }).then(function callback(blob) {
                        filename = globalInitData.preload.illust[id].illustTitle+".zip";
                        // see FileSaver.js
                        saveAs(blob, filename);
                        console.log("done !");
                    }, function (e) {
                        alert(e);
                    });
                })
            })
        }
    },
    local_scope
)

})()
