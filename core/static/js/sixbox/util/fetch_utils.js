export function getUrlParams(url, paramName){
    /*提取url中的参数名对应的参数值*/
    let urlObj = new URL(url);
    let params = new URLSearchParams(urlObj.search);
    return params.get(paramName);
}

export function fetchData(url){
    /*默认GET接口请求方法，忽视Error*/
    return fetch(url).then(response => {
        if (!response.ok){
            throw new Error("Network Error")
        }
        return response.json();
    })
    .catch(error => {
        console.log(error);
    });
}

export function fetchBlob(url){
    /*默认GET接口请求文件，并解析为Blob*/
    return fetch(url).then(response => {
        if (!response.ok){
            throw new Error("Network Error")
        }
        return response.blob();
    })
    .catch(error => {
        console.log(error);
    });
}

export function fetchFile(url){
    /*默认GET接口请求文件并下载的方法，忽视Error*/
    let fileName = null;
    return fetch(url).then(response => {
        if (!response.ok){
            throw new Error("Network Error")
        }
        if (response.headers.has('Content-Disposition')) {
            const contentDisposition = response.headers.get('Content-Disposition');
            const fileNameRegex = /filename(?:="{0,1}[\d\w-]+''|=)(([^"\s]|[ ])+)"{0,1}/;
            const matches = contentDisposition.match(fileNameRegex);
            if (matches && matches.length > 1) {
                fileName =decodeURIComponent(matches[1]); // 提取文件名
            }
        }
        return response.blob();
    })
    .then(blob=>{
        // 创建Blob URL
        const url = URL.createObjectURL(blob);
        // 创建临时对象
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        // 释放ULR对象
        URL.revokeObjectURL(url);
    })
}

export function fetchWithConfig(url, urlConfig){
    return fetch(url, urlConfig).then(response => {
        if (!response.ok){
            if (response.status == 400){
                return response.json();
            }
        }else{
            return response.json();
        }
        throw new Error("Network Error")
    })
    .catch(error => {
        console.log(error);
    });
}