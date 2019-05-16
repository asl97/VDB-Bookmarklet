(function(){
'use strict';
let _iframe_scope = function(){
    this.dependencies = []

    this.iframe = document.createElement("iframe");
    this.iframe.style.display = "none";
    this.loaded = new Promise((resolve,reject)=>{this.iframe.onload = resolve});
    document.body.appendChild(this.iframe);

    this.load = function(url){
        let script = document.createElement('script');
        script.src = url;
        let p = new Promise((resolve,reject)=>{
            script.onload = resolve;
            script.onerror = function(){reject(url)};
        });
        this.iframe.contentDocument.body.appendChild(script);
        this.dependencies.push(p);
    }

    this.run = async function(func){
        await Promise.all(this.dependencies).catch(function(error) {
            let emsg = `Dependency '${error}' failed to load`;
            alert(emsg);
            throw emsg;
            
        });
        let script = document.createElement('script');
        script.innerText = `(${func.toString()})()`;
        this.iframe.contentDocument.body.appendChild(script);
    }
}

let iframe_scope = async function(){
    let iframe = new _iframe_scope();
    await iframe.loaded;
    return iframe;
}

let bookmarklet = async function(dependencies, func){
    let iframe = await iframe_scope();
    for (let dependency of dependencies){
        iframe.load(dependency);
    }

    iframe.run(func);
    return iframe;
}

bookmarklet([
    "test1.js",
    "test2.js",
    "test3.js",
    ], function(){
        console.log(`${test1}${test2}${test3}`)
    }
)
})()
