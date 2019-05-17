// dummy urlToPromise
async function urlToPromise(url){
    console.log('slow', url)
    let test = new Promise(function(resolve, reject) {
        setTimeout(resolve, Math.ceil(Math.random()*50)*100, "data: "+url);
    });
    return await test;
}

// limit concurrent async
async function process_urls(urls, limit=4) {
    let executing = [];
    let promises = [];

    // limit the amount of concurrent requests
    for (let url of urls) {
        if (executing.length >= limit){
            await Promise.race(executing);
        }
        let promise = urlToPromise(url);
        executing.push(promise);
        promises.push(promise);
        promise.then(()=>{executing.splice(executing.indexOf(promise), 1)})
        promise.then(()=>{console.log('complete', url)})
    };

    return Promise.all(promises);
}

// dummy links, just numbers really
process_urls([...Array(30).keys()]).then((r)=>{console.log(r)})
