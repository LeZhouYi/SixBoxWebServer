const hiddenClass = 'hidden';  // 隐藏元素Class
const modalClass = 'modalOpen';  //阻止模窗外页面的滚动Class

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

export function hideInstance(element){
    /*隐藏元素*/
    element.classList.add(hiddenClass);
}

export function displayInstance(element){
    /*隐藏元素*/
    element.classList.remove(hiddenClass);
}

export function hideModal(elementId){
    /*隐藏模态弹窗*/
    let element = document.getElementById(elementId);
    element.classList.add(hiddenClass);
    document.body.classList.remove(modalClass);
}

export function displayModal(elementId){
    /*显示模态弹窗*/
    let element = document.getElementById(elementId);
    element.classList.remove(hiddenClass);
    document.body.classList.add(modalClass);
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

export function displayPopMessage(messageText, color='black', time, popElementId, contentId){
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

export function displayFailMessage(messageText, time=1000, popElementId='messagePopup', contentId='messageContent'){
    /*显示报错信息*/
    displayPopMessage(messageText,'red',time, popElementId, contentId)
}

export function displaySuccessMessage(messageText, time=1000, popElementId='messagePopup', contentId='messageContent'){
    /*显示报错信息*/
    displayPopMessage(messageText,'green',time, popElementId, contentId)
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
    if (rect.top+popRect.height > window.innerHeight){
        popUpElement.style.top = (window.innerHeight - popRect.height - 15) + 'px';
    }else{
        popUpElement.style.top = rect.top + 'px';
    }
    popUpElement.style.left = rect.left + 'px';
}