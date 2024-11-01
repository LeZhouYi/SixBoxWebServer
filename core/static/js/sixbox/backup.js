import * as ModalUtils from './util/modal_utils.js';
import * as FetchUtils from './util/fetch_utils.js';
import * as PageUtils from './util/page_utils.js';
import * as FuncUtils from './util/func_utils.js';

const nowRoute = "/backup"
const rootParentId = "1";  //  根目录ID
const bkTypeEnum = {
    "FILE": 1,
    "FOLDER": 2
};  // 书签类型枚举


function updateBkList(){
    /* 请求/backup/files接口并刷新当前页面的书签列表内容 */
    let currentUrl = window.location.href;
    let parentId = FetchUtils.getUrlParams(currentUrl, 'parentId'); // 获取参数parentId
    let searchInput = document.getElementById('searchBackupInput');

    let getListUrl = nowRoute+"/files?parentId="+parentId;  //构造url
    if (searchInput.value!==''){
        getListUrl = nowRoute+"/files?search="+searchInput.value;
    }

    let dataList = document.getElementById('bkList')
    dataList.innerHTML = '';  // 清空表格内容

    addLastPageItem(parentId, dataList); //添加上一页
    FetchUtils.fetchData(getListUrl).then(data=>{
        data.forEach(element=>{
            addBkListItem(element, dataList);
        });
    });
}

function addBkListItem(data,parent){
    /*根据data添加一行书签*/
    let nameSpan = document.createElement('a');
    nameSpan.textContent = data.name;  // 书签名称
    nameSpan.href = data.url;  //书签超链接

    let preIcon = document.createElement('img');  //前置图标
    preIcon.classList.add('bmIcon');
    if (data.type==bkTypeEnum.FILE){
        /*类型是书签*/
        preIcon.src = "static/images/icons/web_url.png";  //设置来源
        preIcon.alt = "链接";
    }else if (data.type==bkTypeEnum.FOLDER){
        /*类型是文件夹*/
        preIcon.src = "static/images/icons/folder.png";  //设置来源
        preIcon.alt = "目录";
    }

    let controlIcon = document.createElement('img');  // 操作图标
    controlIcon.src = "static/images/icons/more_vertical.png";
    controlIcon.alt = "操作";
    controlIcon.classList.add('bmIcon', 'clickable');
    PageUtils.setElementFocusClick(controlIcon);
//    bindControlBtnClick(controlIcon, data.id);  // 绑定点击事件

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
        let getParentUrl = nowRoute+"/files?id="+parentId;
        FetchUtils.fetchData(getParentUrl).then(data=>{
            if(data.length > 0){
                let backIcon = document.createElement('img');  // 操作图标
                backIcon.src = "static/images/icons/corner_up_left.png";  //设置来源
                backIcon.alt = "返回";
                backIcon.classList.add('bmIcon', 'clickable');

                let nameSpan = document.createElement('a');
                nameSpan.textContent = "返回上级目录";  // 书签名称
                nameSpan.href = "/backup.html?parentId="+data[0].parentId;  //书签超链接

                let lineItem = document.createElement('dd');
                lineItem.classList.add('bmItem', 'clickable');
                lineItem.appendChild(backIcon);
                lineItem.appendChild(nameSpan);

                parent.insertBefore(lineItem, parent.firstChild);
            }
        });
    }
}

document.getElementById('downloadDataBtn').addEventListener('click', function(){
    let downDataUrl = nowRoute + "/db";
    ModalUtils.displaySuccessMessage('正在下载');
    ModalUtils.hideModal('backupCtrlPopup');
    FetchUtils.fetchFile(downDataUrl).then(()=>{
        ModalUtils.displaySuccessMessage('下载成功');
    })
    .catch(error=>{
        ModalUtils.displayFailMessage('下载失败');
    })
});

document.getElementById('uploadFileField').addEventListener('change', function(){
    var file = event.target.files[0];
    if (file){
        let uploadUrl = '/backup';
        let formData = new FormData();
        formData.append('file', file);
        formData.append('name', file.name)
        FetchUtils.fetchWithConfig(uploadUrl, {
            method: "POST",
            body: formData
        })
        .then(data=>{
            if (data.status == "Fail"){
                ModalUtils.displayFailMessage(data.message);  //显示错误信息弹窗
            }
            else{
                ModalUtils.displaySuccessMessage(data.message);  //显示新增成功信息弹窗
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', (event) => {
    /*页面首次加载，刷新当前书签列表*/
    updateBkList();
});

document.getElementById('backupMoreCtrlBtn').addEventListener('click', function(){
    /*点击更多操作按钮*/
    ModalUtils.displayModal('backupCtrlPopup');
    ModalUtils.adjustPopup('backupCtrlContent', event.target.getBoundingClientRect());
});

document.getElementById('addFileButton').addEventListener('click', function(){
    /*点击更多操作按钮*/
    ModalUtils.displayModal('addFilePopup');
});

document.getElementById('addFileCclBtn').addEventListener('click', function(){
    /*点击更多操作按钮*/
    ModalUtils.hideModal('addFilePopup');
});

document.getElementById('addFileCfmBtn').addEventListener('click', function(){
    /*确认上传文件*/
    let fileName = document.getElementById('addMscName');
    let fileNameText = document.getElementById('addFileText');
    let filePath = document.getElementById('addMscFile');
    if (fileName.value === ''){
        ModalUtils.displayFailMessage('请选择文件');
        return;
    }
    let formData = new FormData();
    formData.append('file', mscFilePath.files[0]);
    formData.append('name', mscName.value);

    FetchUtils.fetchWithConfig(nowMusicRoute, {
        method: 'POST',
        body: formData
    })
    .then(data=>{
        if (data.status == 'Fail'){
            ModalUtils.displayFailMessage(data.message);  //显示错误信息弹窗
        }
        else{
            ModalUtils.displaySuccessMessage(data.message);  //显示新增成功信息弹窗
            ModalUtils.hideModal('addMscPopup');
            clearMscAddPop();
            updateMscList();
        }
    });
});

document.addEventListener('click', function(event){
    /*监听文档点击事件，检查点击是否在弹窗外部*/
    ModalUtils.checkClickModalPopup(event, 'backupCtrlPopup', 'backupCtrlContent');
    ModalUtils.checkClickModalPopup(event, 'addFilePopup', 'addFileContent');
});

window.onload = function(){
    PageUtils.resizeFullScreen('bodyContainer');
    PageUtils.setFocusClick('appDownData', 'appUploadData');
};

window.addEventListener('resize', FuncUtils.throttle(function(){
    PageUtils.resizeFullScreen('bodyContainer');
}), 200);
