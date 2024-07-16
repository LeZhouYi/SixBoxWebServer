import * as BaseUtils from './base_utils.js';

const nowRoute = "/bookmark";
const rootParentId = "1";  //  根目录ID
const bmTypeEnum = {
    "BOOKMARK": 1,
    "FOLDER": 2
};  // 书签类型枚举

var nowControlId = null; //当前操作的书签ID

function bindControlBtnClick(element, bmId){
    /*绑定书签更多控制按钮的点击事件*/
    element.addEventListener('click', function(event){
        nowControlId = bmId;
        BaseUtils.displayElement('bmControlPopup');

        /*调整元素位置*/
        let element = document.getElementById('bmControlContent');
        let rect = event.target.getBoundingClientRect();
        element.style.left = rect.left + 'px';
        element.style.top = rect.top + 'px';

        document.getElementById('editBmBtn').focus();
    });
}

function addBmListItem(data,parent){
    /*根据data添加一行书签*/
    let nameSpan = document.createElement('a');
    nameSpan.textContent = data.name;  // 书签名称
    nameSpan.href = data.url;  //书签超链接

    let preIcon = document.createElement('img');  //前置图标
    preIcon.classList.add('bmIcon');
    if (data.type==bmTypeEnum.BOOKMARK){
        /*类型是书签*/
        preIcon.src = "static/images/icons/web_url.png";  //设置来源
        preIcon.alt = "链接";
    }else if (data.type==bmTypeEnum.FOLDER){
        /*类型是文件夹*/
        preIcon.src = "static/images/icons/folder.png";  //设置来源
        preIcon.alt = "目录";
    }

    let controlIcon = document.createElement('img');  // 操作图标
    controlIcon.src = "static/images/icons/more_vertical.png";
    controlIcon.alt = "操作";
    controlIcon.classList.add('bmIcon', 'clickable');
    BaseUtils.setElementFocusClick(controlIcon);
    bindControlBtnClick(controlIcon, data.id);  // 绑定点击事件

    let lineItem = document.createElement('dd');
    lineItem.classList.add('bmItem', 'clickable');
    lineItem.appendChild(preIcon);
    lineItem.appendChild(nameSpan);
    lineItem.appendChild(controlIcon);

    parent.appendChild(lineItem);
}

function addLastPageItem(parentId, parent){
    /*获取当前目录的上级目录，并构造上一页入口 */
    if(parentId !== rootParentId){
        let getParentUrl = nowRoute+"/"+parentId;
        BaseUtils.fetchData(getParentUrl).then(data=>{
            let backIcon = document.createElement('img');  // 操作图标
            backIcon.src = "static/images/icons/corner_up_left.png";  //设置来源
            backIcon.alt = "返回";
            backIcon.classList.add('bmIcon', 'clickable');

            let nameSpan = document.createElement('a');
            nameSpan.textContent = "返回上级目录";  // 书签名称
            nameSpan.href = "/bookmark.html?parentId="+data.parentId;  //书签超链接

            let lineItem = document.createElement('dd');
            lineItem.classList.add('bmItem', 'clickable');
            lineItem.appendChild(backIcon);
            lineItem.appendChild(nameSpan);

            parent.insertBefore(lineItem, parent.firstChild);
        });
    }
}

function updateBmList(){
    /* 请求/bookmarks接口并刷新当前页面的书签列表内容 */
    let currentUrl = window.location.href;
    let parentId = BaseUtils.getUrlParams(currentUrl, 'parentId'); // 获取参数parentId
    let getListUrl = nowRoute+"?parentId="+parentId;  //构造url

    let dataList = document.getElementById('bmList')
    dataList.innerHTML = '';  // 清空表格内容

    addLastPageItem(parentId, dataList); //添加上一页
    BaseUtils.fetchData(getListUrl).then(data=>{
        data.forEach(element=>{
            addBmListItem(element, dataList);
        });
    });
}

function clearAddPopupInput(){
    /*清空新增书签弹窗的输入并关闭弹窗*/
    document.getElementById('addBmName').value='';
    document.getElementById('addBmUrl').value='';
    BaseUtils.hideModal('addBmPopup');
}

function controlSelectTypeOption(selectValue, changeElement){
    /*根据值不同，控制url控件是否显示*/
    if (selectValue == bmTypeEnum.BOOKMARK){
        changeElement.classList.remove(BaseUtils.hiddenClass);
    }
    else if (selectValue == bmTypeEnum.FOLDER){
        changeElement.classList.add(BaseUtils.hiddenClass);
    }
}

function createBmFolderOption(selectId){
    /*为selectId 对应selectElement构造当前的目录选项*/
    let currentUrl = window.location.href;
    let parentId = BaseUtils.getUrlParams(currentUrl, 'parentId'); // 获取参数parentId
    let getBmFolderUrl = nowRoute+"?type=2&parentId="+parentId;

    //请求并获取当前书签下的所有目录，并用于构造选项
    BaseUtils.fetchData(getBmFolderUrl).then(data=>{
        let addBmFolderSelect = document.getElementById(selectId);
        addBmFolderSelect.innerHTML = ''; // 清空目录下拉列表
        addBmFolderSelect.appendChild(BaseUtils.createOption(parentId, '当前目录'));
        data.forEach(dataItem=>{
            if(dataItem.id!==nowControlId){
                let option = BaseUtils.createOption(dataItem.id, dataItem.name);
                addBmFolderSelect.appendChild(option);
            }
        })
    });
}

document.getElementById('addBmButton').addEventListener('click', function(){
    BaseUtils.displayModal('addBmPopup'); //显示弹窗
    document.getElementById('addBmName').focus();
    createBmFolderOption('addBmFolderSelect'); //构造选项
});

document.addEventListener('DOMContentLoaded', (event) => {
    /*页面首次加载，刷新当前书签列表*/
    updateBmList();
});

document.getElementById('addBmTypeSelect').addEventListener('change', function(){
    /*根据选择的书签类型。若是书签，显示url输入框；若是文件夹，则隐藏url输入框*/
    var selectValue = this.value;
    var changeElement = document.getElementById('addBmUrl').parentElement.parentElement;
    if (selectValue == bmTypeEnum.BOOKMARK){
        BaseUtils.displayElement(changeElement);
    }
    else if (selectValue == bmTypeEnum.FOLDER){
        BaseUtils.hideElement(changeElement);
    }
});

document.getElementById('addBmCclBtn').addEventListener('click', function(){
    /*点击取消，隐藏新增书签弹窗*/
    clearAddPopupInput();
});

document.getElementById('addBmCfmBtn').addEventListener('click', function(){
    /*点击确认新增书签按钮*/
    let bmName = document.getElementById('addBmName');  //书签名称
    let bmUrl = document.getElementById('addBmUrl');  //所指链接
    let bmFolderSelect = document.getElementById('addBmFolderSelect');  //所属目录
    let bmType = document.getElementById('addBmTypeSelect')  //书签类型

    BaseUtils.fetchWithConfig(nowRoute, {
        method: "POST",
        "headers":{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            parentId: bmFolderSelect.value,
            name: bmName.value,
            url: bmUrl.value,
            type: bmType.value
        })
    })
    .then(data=>{
        if (data.status == "Fail"){
            BaseUtils.displayMessage(data.message);  //显示错误信息弹窗
        }
        else{
            BaseUtils.displayMessage(data.message, 1000, 'green');  //显示新增成功信息弹窗
            updateBmList();  //更新当前书签列表
            clearAddPopupInput();  //清空输入并关闭弹窗
        }
    });
});

document.getElementById('deleteBmBtn').addEventListener('click', function(){
    /*点击删除书签按钮*/
    BaseUtils.hideElement('bmControlPopup');
    BaseUtils.displayModal('cfmDelPopup');
    document.getElementById('confirmDelBtn').focus();
});

document.getElementById('cancelDelBtn').addEventListener('click', function(){
    /*点击取消删除书签*/
    BaseUtils.hideModal('cfmDelPopup');
});

document.getElementById('confirmDelBtn').addEventListener('click', function(){
    /*点击确认删除书签*/
    if (nowControlId == null){
        return;
    }
    let delBmUrl = nowRoute+"/"+nowControlId;
    BaseUtils.fetchWithConfig(delBmUrl, {
        method: "DELETE"
    })
    .then(data=>{
        if(data.status == 'Fail'){
            BaseUtils.displayMessage(data.message);  //显示错误信息弹窗
        }else{
            BaseUtils.displayMessage(data.message, 1000, 'green');  //显示新增成功信息弹窗
            BaseUtils.hideModal('cfmDelPopup');
            updateBmList();  //更新当前书签列表
        }
    });
});

document.getElementById('editCancelBtn').addEventListener('click', function(){
    /*点击编辑书签的取消按钮*/
    BaseUtils.hideModal('editBmPopup');
});

document.getElementById('editBmBtn').addEventListener('click', function(){
    /*点击编辑书签按钮*/
    BaseUtils.hideElement('bmControlPopup');
    if (nowControlId == null){
        BaseUtils.displayMessage('书签不存在');
        return;
    }
    createBmFolderOption('editBmFolderSelect'); // 构造选项

    let bmDetailUrl = nowRoute+'/'+nowControlId;
    BaseUtils.fetchWithConfig(bmDetailUrl).then(data=>{
        if(data.status != undefined){
            BaseUtils.displayMessage(data.message);
        }else{
            document.getElementById('editBmName').value=data.name;  //书签名称
            document.getElementById('editBmUrl').value=data.url;  //所指链接

            BaseUtils.setSelectedByValue('editBmTypeSelect', data.type); // 设置书签类型
            var changeElement = document.getElementById('editBmUrl').parentElement.parentElement;
            controlSelectTypeOption(data.type, changeElement);
            document.getElementById('editBmTypeSelect').disabled = true;

            BaseUtils.setSelectedByValue('editBmFolderSelect', data.parentId); // 设置当前文件夹
            document.getElementById('editBmFolderSelect').disabled = true;
            BaseUtils.displayModal('editBmPopup');  //显示编辑弹窗
            document.getElementById('editBmName').focus();
        }
    });
});

document.getElementById('editConfirmBtn').addEventListener('click', function(){
    /*点击编辑书签弹窗的确认编辑按钮*/
    if (nowControlId == null){
        BaseUtils.displayMessage('书签不存在');
        return;
    }
    let editBmUrl = nowRoute+'/'+nowControlId;
    let bmName = document.getElementById('editBmName');  //书签名称
    let bmUrl = document.getElementById('editBmUrl');  //所指链接
    let bmFolderSelect = document.getElementById('editBmFolderSelect');  //所属目录
    let bmType = document.getElementById('editBmTypeSelect');  //书签类型
    BaseUtils.fetchWithConfig(editBmUrl,{
        method: "PUT",
        "headers":{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            parentId: bmFolderSelect.value,
            name: bmName.value,
            url: bmUrl.value,
            type: bmType.value
        })
    })
    .then(data=>{
        if(data.status == 'Fail'){
            BaseUtils.displayMessage(data.message);  //显示错误信息弹窗
        }else{
            BaseUtils.displayMessage(data.message, 1000, 'green');  //显示新增成功信息弹窗
            BaseUtils.hideModal('editBmPopup');
            updateBmList();  //更新当前书签列表
        }
    });
});

document.getElementById('searchBmButton').addEventListener('click', function(){
    /*点击搜索按钮事件*/
    let searchInput = document.getElementById('searchBmInput').value;
    if (searchInput == null || searchInput == ''){
        updateBmList();
    }else{
        let searchUrl = nowRoute+"?search="+searchInput;
        let dataList = document.getElementById('bmList')
        dataList.innerHTML = '';  // 清空表格内容

        BaseUtils.fetchData(searchUrl).then(data=>{
            data.forEach(element=>{
                addBmListItem(element, dataList);
            });
        });
    }
});

document.getElementById('searchBmInput').addEventListener('keydown', function(){
    /*搜索栏按回车*/
    if (event.keyCode == 13 || event.key == 'Enter'){
        document.getElementById('searchBmButton').click();
    }
});

window.onload = function(){
    BaseUtils.resizeFullScreen('bodyContainer');
    BaseUtils.setFocusClick('searchBmButton', 'addBmButton', 'addBmCfmBtn', 'addBmCclBtn');
    BaseUtils.setFocusClick('editBmBtn', 'deleteBmBtn', 'editConfirmBtn', 'editCancelBtn');
    BaseUtils.setFocusClick('confirmDelBtn', 'cancelDelBtn');
};

window.addEventListener('resize', BaseUtils.throttle(function(){
    BaseUtils.resizeFullScreen('bodyContainer');
}), 200);

document.addEventListener('keydown', function(event){
    /*监听Esc并退出弹窗*/
    BaseUtils.escCloseModal(event, 'addBmPopup', 'bmControlPopup', 'cfmDelPopup', 'editBmPopup');
});

document.addEventListener('click', function(event){
    /*监听文档点击事件，检查点击是否在弹窗外部*/
    BaseUtils.checkClickModalPopup(event, 'addBmPopup', 'addBmContent');
    BaseUtils.checkClickModalPopup(event, 'editBmPopup', 'editBmContent');
    BaseUtils.checkClickModalPopup(event, 'cfmDelPopup', 'cfmDelContent');
    BaseUtils.checkClickModalPopup(event, 'bmControlPopup', 'bmControlContent');
});
