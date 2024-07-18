const hiddenClass = 'hidden';  // 隐藏元素Class

export function getUrlParams(url, paramName){
    /*提取url中的参数名对应的参数值*/
    let urlObj = new URL(url);
    let params = new URLSearchParams(urlObj.search);
    return params.get(paramName);
}

export function displayModal(elementId){
    /*显示模态弹窗*/
    let element = document.getElementById(elementId);
    element.classList.remove(hiddenClass);
    document.body.classList.add('modalOpen');
}

export function hideModal(elementId){
    /*隐藏模态弹窗*/
    let element = document.getElementById(elementId);
    element.classList.add(hiddenClass);
    document.body.classList.remove('modalOpen');
}

export function displayElement(elementId){
    /*显示元素*/
    let element = document.getElementById(elementId);
    element.classList.remove(hiddenClass);
}

export function hideElement(elementId){
    /*隐藏元素*/
    let element = document.getElementById(elementId);
    element.classList.add(hiddenClass);
}

export function checkClickModalPopup(event, containerId, contentId){
    /*检查弹窗的点击事件，若点击在弹窗及其内容外的地方，则关闭弹窗*/
    let container = document.getElementById(containerId);
    let content = document.getElementById(contentId);
    // 检查点击是否在弹窗或其子元素上
    if(!content.contains(event.target) && container.contains(event.target)){
        hideModal(containerId);  // 不是，则隐藏弹窗
    }
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
        return true;
    })
    .catch(error => {
        console.log(error);
    });
    return false;
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

export function displayMessage(messageText, time=1000, color='red'){
    /*显示弹窗消息*/
    let messageBox = document.getElementById('messagePopup');
    let messageContent = document.getElementById('messageContent');
    messageContent.innerHTML = '';

    let message = document.createElement('a');
    message.textContent = messageText;
    message.style.color = color;

    messageContent.appendChild(message);

    messageBox.classList.remove(hiddenClass);  // 显示弹窗
    setTimeout(function() {
        messageBox.classList.add(hiddenClass);
    }, time);
}

export function createOption(value, textContent){
    /*创建目录下拉列表的选项*/
    let option = document.createElement('option');
    option.value = value;
    option.textContent = textContent;
    return option;
}

export function setSelectedByValue(selectId, selectValue){
    /*设置下拉选择框的值, 通过value*/
    let selectElement = document.getElementById(selectId);
    for (var i = 0; i< selectElement.options.length; i++){
        if (selectElement.options[i].value == selectValue){
            selectElement.options[i].selected = true;
            break;
        }
    }
}

export function setSelectedByText(selectId, selectText){
    /*设置下拉选择框的值，通过text*/
    let selectElement = document.getElementById(selectId);
    for (var i = 0; i< selectElement.options.length; i++){
        if (selectElement.options[i].text == selectText){
            selectElement.options[i].selected = true;
            break;
        }
    }
}

export function intToMinuteTime(seconds){
    /*秒数转成xx:xx形式的时间*/
    seconds = Math.floor(seconds);
    let minutes = Math.floor(seconds/60);
    let remainingSeconds = seconds % 60;
    let formattedMinutes = minutes.toString().padStart(2, '0');
    let formattedSeconds = remainingSeconds.toString().padStart(2, '0');
    return formattedMinutes + ":" + formattedSeconds;
}

export function resizeFullScreen(elementId){
    /*计算并调整页页使用适应全屏*/
    let bodyContainer = document.getElementById(elementId);
    bodyContainer.style.minHeight = String(document.documentElement.clientHeight)+"px";
}

export function throttle(func, limit){
    /*节流*/
    let inThrottle = false;  //标志位
    return function() {
        const context = this;
        const args = arguments;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => {inThrottle = false}, limit);
        }
    };
}

export function clearElementByStart(parentId, start=1){
    /*从start开始清除该元素的子元素*/
    let parentElement = document.getElementById(parentId);
    if (parentElement && parentElement.children.length > start && start > 0){
        for (var i = parentElement.children.length - 1; i > start - 1; i--){
            parentElement.removeChild(parentElement.children[i]);
        }
    }
}

export function genUniqueRandList(length){
    /*生成基于该长度的，随机不重复的数列*/
    if (length<1){
        return []
    }
    let array = Array.from({length}, (_, index)=>index);
    for (var i = 0; i<length;i++){
        let randIndex = Math.floor(Math.random() * length);
        let tempValue = array[i];
        array[i] = array[randIndex];
        array[randIndex] = tempValue;
    }
    return array;
}

export function setElementFocusClick(element){
    /*设置元素为可聚集且Enter键可触发Click事件*/
    element.tabIndex = 0;
    element.addEventListener('keydown', function(){
        if (event.key === 'Enter'){
            element.click();
        }
    });
}

export function setFocusClick(...elements){
    /*设置元素为可聚集且Enter键可触发Click事件*/
    for(let i = 0; i < elements.length; i++) {
        setElementFocusClick(document.getElementById(elements[i]));
    }
}

export function resetFocus(){
    /*重置焦点*/
    var firstFocusableElement = document.querySelector('input, button, a[href], textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusableElement) {
        firstFocusableElement.focus();
    }
}

export function escCloseModal(event, ...modals){
    /*接受到Esc时关闭显示的弹窗*/
    if (event.key === 'Escape' || event.key === 'Esc' || event.keyCode === 27) {
        for(let i = 0; i < modals.length; i++) {
            let popElement = document.getElementById(modals[i]);
            if(!popElement.classList.contains(hiddenClass)){
                hideModal(modals[i]);
            }
        }
    }
}

export function closeAllModal(event, ...modals){
    /*关闭显示的弹窗*/
    for(let i = 0; i < modals.length; i++) {
        let popElement = document.getElementById(modals[i]);
        if(!popElement.classList.contains(hiddenClass)){
            hideModal(modals[i]);
        }
    }
}

export function adjustPopup(elementId, rect){
    /*调整弹窗的显示位置*/
    let popUpElement = document.getElementById(elementId);
    let popRect = popUpElement.getBoundingClientRect();
    console.log(rect.top+popRect.height);
    console.log(window.innerHeight);
    if (rect.top+popRect.height > window.innerHeight){
        popUpElement.style.top = (window.innerHeight - popRect.height - 15) + 'px';
        console.log(popUpElement.style.top);
    }else{
        popUpElement.style.top = rect.top + 'px';
    }
    popUpElement.style.left = rect.left + 'px';
}