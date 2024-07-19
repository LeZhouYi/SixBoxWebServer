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

export function resizeFullScreen(elementId){
    /*计算并调整页页使用适应全屏*/
    let bodyContainer = document.getElementById(elementId);
    bodyContainer.style.minHeight = String(document.documentElement.clientHeight)+"px";
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