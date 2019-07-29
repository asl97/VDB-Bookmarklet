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

// testcases here

// test1.js, test2.js, test3.js are external resources
// which defines test1 test2 and test3
// both should print `Hello World!`

// iframe scoped
bookmarklet([
    "test1.js",
    "test2.js",
    "test3.js",
    ], function(){
        console.log(`${test1}${test2}${test3}`)
    }
)

// local scoped
bookmarklet([
    "test1.js",
    "test2.js",
    "test3.js",
    ], function(){
        console.log(`${test1}${test2}${test3}`)
    },
    local_scope
)
})()
