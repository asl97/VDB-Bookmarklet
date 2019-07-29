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

        var Promise = window.Promise;
        if (!Promise) {
            Promise = JSZip.external.Promise;
        }
        /**
         * Fetch the content and return the associated promise.
         * @param {String} url the url of the content to fetch.
         * @return {Promise} the promise containing the data.
         */
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
        }

        var chapters, langs, checkboxes, chapter_content, bg_div;
        langs = {};
        chapters = {};
        checkboxes = {};

        var code_to_lang = {
            "gb": "English",
            "br": "Portuguese (Br)"
        };

        function close_dl_menu(){
            document.body.removeChild(bg_div);
        };

        // limit concurrent async
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

        async function download_images(chapter_obj){
            var zip = new JSZip();

            let r = await fetch(`https://mangadex.org/api/?id=${chapter_obj.chapter_id}&type=chapter`);
            let json = await r.json();

            let links = [];
            for (img of json.page_array) {
                if(json.server.startsWith('http') && window.location.hostname != json.server.split("/")[2]){
                    links.push([img,proxy+`${json.server}${json.hash}/${img}`]);
                }else{
                    links.push([img,`${json.server}${json.hash}/${img}`]);
                }
            }

            let promises = process_urls(links);
            for (let promise of promises){
                let [filename, data] = await promise;
                zip.file(filename, data, {binary:true});
            }

            // When everything has been downloaded, we can trigger the dl
            zip.generateAsync({type:"blob"}, function updateCallback(metadata) {
                var msg = "progression : " + metadata.percent.toFixed(2) + " %";
                console.log(msg);
            }).then(function callback(blob) {
                filename = chapter_obj.manga_title + ` - c.${json.chapter.padStart(2,0)}.zip`;
                saveAs(blob, filename);
                console.log("done !");
            }, function (e) {
                alert(e);
            });
        }

        async function process_dl_tasks(dl_list){
            for (let chapter_obj of dl_list){
                await download_images(chapter_obj);
            }
        }

        function process_dl(){
            var dl_list = []
            for (let [chapter_id, checkbox] of Object.entries(checkboxes)){
                if (checkbox.checked){
                    dl_list.push(chapters[chapter_id]);
                }
            }
            dl_list.sort((a,b) => a.chapter - b.chapter);
            process_dl_tasks(dl_list);
        }

        function el_checkbox(chapter_obj){
            var div, title, lang, checkbox, lang_code, name, group_name;

            // eg: Vol. 6 Ch. 36 - Winter, It's Here Again
            name = `Vol. ${chapter_obj.volume} Ch. ${chapter_obj.chapter}`;
            if (chapter_obj.title){
                name += ` - ${chapter_obj.title}`;
            }

            chapter_obj.name = name;

            lang_code = chapter_obj.lang_code;

            langs[lang_code] = true;

            div = document.createElement('div');
            div.dataset.lang_code = lang_code;
            div.style.display = "table-row";

            title = document.createElement('span');
            title.textContent = name;
            div.appendChild(title);
            title.style.display = "table-cell";

            group_name = document.createElement('span');
            group_name.textContent = chapter_obj.group_name;
            div.appendChild(group_name);
            group_name.style.display = "table-cell";

            lang = document.createElement('span');
            lang.textContent = code_to_lang[lang_code] || lang_code;
            lang.style.display = "table-cell";
            div.appendChild(lang);

            checkbox = document.createElement('input');
            checkbox.type = "checkbox";
            checkbox.style.display = "table-cell";

            checkboxes[chapter_obj.chapter_id] = checkbox;

            div.appendChild(checkbox);

            // make clicking on the 'row' the same as clicking on the checkbox
            // makes it less of a pain to click
            title.onclick = function(){checkbox.click()};
            lang.onclick = function(){checkbox.click()};

            return div
        }

        function filter(lang_code){
            for (el of chapter_content.children){
                if (lang_code == "All" || lang_code == el.dataset.lang_code){
                    el.style.display = "table-row";
                } else {
                    el.style.display = "None";
                }
            }
        }

        bg_div = document.createElement('div');
        bg_div.style.position = "fixed";
        bg_div.style["z-index"] = "1";
        bg_div.style.left = "0";
        bg_div.style.top = "0";
        bg_div.style.width = "100%";
        bg_div.style.height = "100%";
        bg_div.style.overflow = "auto";
        bg_div.style["background-color"] = "rgba(0,0,0, 0.4)";
        // css fallback, javascript style
        // https://stackoverflow.com/questions/23001449/can-i-set-multiple-values-of-the-same-css-property-with-javascript
        if (!bg_div.style["background-color"]){
            bg_div.style["background-color"] = "rgb(0,0,0)";
        }
        bg_div.onclick = close_dl_menu;

        chapter_content = document.createElement('div');
        chapter_content.style.display = "table";
        chapter_content.style["white-space"] = "nowrap";
        chapter_content.style.padding = "20px";

        close_button_row = document.createElement('div');
        close_button = document.createElement('span');
        close_button.style.float = "right";
        close_button.innerHTML = "Close &times";
        close_button.onclick = close_dl_menu;
        close_button_row.appendChild(close_button);

        content_wrapper = document.createElement('div');
        content_wrapper.style.display = "table";
        content_wrapper.style["background-color"] = "#ffffff";
        content_wrapper.style.margin = "5% auto";
        content_wrapper.style.padding = "20px";
        content_wrapper.style.border = "1px solid #888";
        content_wrapper.onclick = function (e){
            e.stopPropagation();
        }

        dl_button = document.createElement('button');
        dl_button.textContent = "Download";
        dl_button.style.float = "right";
        dl_button.onclick = process_dl;

        content_wrapper.appendChild(close_button_row);
        content_wrapper.appendChild(chapter_content);
        content_wrapper.appendChild(dl_button);

        bg_div.appendChild(content_wrapper);
        document.body.appendChild(bg_div);
        fetch(`https://mangadex.org/api/?id=${location.href.split('/')[4]}&type=manga`).then((r) => {
            r.json().then((json)=>{
                for (let [chapter_id, chapter_obj] of Object.entries(json.chapter)) {
                    chapter_obj.manga_title = json.manga.title;
                    chapter_obj.chapter_id = chapter_id;
                    chapters[chapter_id] = chapter_obj;
                    el = el_checkbox(chapter_obj);
                    chapter_content.appendChild(el);
                }
                let ls = Object.keys(langs).sort();
                ls.unshift('All');
                for (let lang of ls){
                    let button = document.createElement('button');
                    button.textContent = code_to_lang[lang] || lang;
                    button.onclick = ()=>filter(lang);
                    close_button_row.insertBefore(button, close_button);
                }
            });
        })
    },
    // Require running in non-isolated scope due to CORS
    local_scope
)
})()
