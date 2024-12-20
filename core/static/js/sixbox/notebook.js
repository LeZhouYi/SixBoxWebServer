import * as DataUtils from './util/data_utils.js';
import * as ModalUtils from './util/modal_utils.js';
import * as FetchUtils from './util/fetch_utils.js';
import * as PageUtils from './util/page_utils.js';
import * as FuncUtils from './util/func_utils.js';

const nowRoute = "/notebook";
const rootParentId = "1";  //  根目录ID
const nbTypeEnum = {
    "NOTEBOOK": 1,
    "FOLDER": 2
};  // 笔记类型枚举
var nowControlId = null;  // 当前操作的笔记的ID

function addLastPageItem(parentId, parent) {
    /*获取当前目录的上级目录，并构造上一页入口 */
    if (parentId !== rootParentId) {
        let getParentUrl = nowRoute + "/" + parentId;
        FetchUtils.fetchData(getParentUrl).then(data => {
            let backIcon = document.createElement('img');  // 操作图标
            backIcon.src = "static/images/icons/corner_up_left.png";  //设置来源
            backIcon.alt = "返回";
            backIcon.classList.add('bmIcon', 'clickable');

            let nameSpan = document.createElement('a');
            nameSpan.textContent = "返回上级目录";  // 笔记名称
            nameSpan.href = "/notebook.html?parentId=" + data.parentId;  //笔记超链接

            let lineItem = document.createElement('dd');
            lineItem.classList.add('bmItem', 'clickable');
            lineItem.appendChild(backIcon);
            lineItem.appendChild(nameSpan);

            parent.insertBefore(lineItem, parent.firstChild);
        });
    }
}

function bindControlBtnClick(element, nbId) {
    /*绑定笔记更多控制按钮的点击事件*/
    element.addEventListener('click', function (event) {
        nowControlId = nbId;
        ModalUtils.displayElement('nbControlPopup');
        document.getElementById('editNbBtn').focus();

        /*调整元素位置*/
        let element = document.getElementById('nbControlContent');
        ModalUtils.adjustPopup('nbControlContent', event.target.getBoundingClientRect());
    });
}

function displayNoteBook(){
    /*显示笔记详情弹窗*/
    if (nowControlId == null) {
        ModalUtils.displayFailMessage('笔记不存在');
        return;
    }
    let nbDetailUrl = nowRoute + '/' + nowControlId;
    FetchUtils.fetchWithConfig(nbDetailUrl).then(data => {
        if (data.status != undefined) {
            ModalUtils.displayFailMessage(data.message);
        } else {
            document.getElementById('displayNbName').value = data.name;  //笔记名称
            if (data.content !== null) {
                let mceEditor = tinymce.get('displayNbTinyMce');
                mceEditor.setContent(data.content);
            }
            ModalUtils.displayModal('readNbPopup');  //显示编辑弹窗
            tinymce.get('displayNbTinyMce').focus();
        }
    });
}

function addNbListItem(data, parent) {
    /*根据data添加一行笔记*/
    let nameSpan = document.createElement('a');
    nameSpan.textContent = data.name;  // 笔记名称
    let preIcon = document.createElement('img');  //前置图标
    preIcon.classList.add('bmIcon');
    if (data.type == nbTypeEnum.NOTEBOOK) {
        /*类型是笔记*/
        nameSpan.addEventListener('click', function(){
            nowControlId = data.id;
            displayNoteBook();
        });
        PageUtils.setElementFocusClick(nameSpan);
        preIcon.src = "static/images/icons/file_text.png";  //设置来源
        preIcon.alt = "笔记";
    } else if (data.type == nbTypeEnum.FOLDER) {
        /*类型是文件夹*/
        nameSpan.href = data.url;  //笔记超链接
        preIcon.src = "static/images/icons/folder.png";  //设置来源
        preIcon.alt = "目录";
    }

    let controlIcon = document.createElement('img');  // 操作图标
    controlIcon.src = "static/images/icons/more_vertical.png";
    controlIcon.alt = "操作";
    controlIcon.classList.add('bmIcon', 'clickable');
    PageUtils.setElementFocusClick(controlIcon);
    bindControlBtnClick(controlIcon, data.id);  // 绑定点击事件

    let lineItem = document.createElement('dd');
    lineItem.classList.add('bmItem', 'clickable');
    lineItem.appendChild(preIcon);
    lineItem.appendChild(nameSpan);
    lineItem.appendChild(controlIcon);

    parent.appendChild(lineItem);
}

function updateNbList() {
    /* 请求/notebook接口并刷新当前页面的笔记列表内容 */
    let currentUrl = window.location.href;
    let parentId = FetchUtils.getUrlParams(currentUrl, 'parentId'); // 获取参数parentId
    let getListUrl = nowRoute + "?parentId=" + parentId;  //构造url
    let searchInput = document.getElementById('searchNbInput');
    if (searchInput.value !== ""){
        getListUrl = nowRoute + "?search="+searchInput.value;
    }

    let dataList = document.getElementById('nbList')
    dataList.innerHTML = '';  // 清空表格内容

    addLastPageItem(parentId, dataList); //添加上一页
    FetchUtils.fetchData(getListUrl).then(data => {
        data.forEach(element => {
            addNbListItem(element, dataList);
        });
    });
}

function clearAddNbInput() {
    /*清空新增笔记的输入*/
    document.getElementById('addNbName').value = '';
    let mceEditor = tinymce.get('addNbTinyMce');
    mceEditor.setContent('');
}

function createNbFolderOption(selectId) {
    /*创建笔记文件夹选项*/
    let currentUrl = window.location.href;
    let parentId = FetchUtils.getUrlParams(currentUrl, 'parentId'); // 获取参数parentId
    let getBmFolderUrl = nowRoute + "?type=2";

    //请求并获取当前目录下的所有目录，并用于构造选项
    FetchUtils.fetchData(getBmFolderUrl).then(data => {
        let addNbFolderSelect = document.getElementById(selectId);
        addNbFolderSelect.innerHTML = ''; // 清空目录下拉列表
        addNbFolderSelect.appendChild(PageUtils.createOption(parentId, '当前目录'));
        data.forEach(dataItem => {
            if (dataItem.id !== nowControlId) {
                let option = PageUtils.createOption(dataItem.id, dataItem.name);
                addNbFolderSelect.appendChild(option);
            }
        })
    });
}

document.addEventListener('DOMContentLoaded', (event) => {
    /*页面首次加载，刷新当前笔记列表*/
    updateNbList();
});

var toolbar = `bold italic underline strikethrough forecolor backcolor | alignleft aligncenter alignright alignjustify alignnone
    | fontsizeselect outdent indent subscript superscript | bullist numlist link unlink
    | print preview code`

var menubarSet = 'edit insert format tools'

tinymce.init({
    selector: '#displayNbTinyMce',
    branding: true,
    elementpath: false,
    menubar: false,
    placeholder: '请输入笔记内容',
    statusbar: false,
    promotion: false,
    license_key: 'gpl',
    plugins: '',
    toolbar: false,
    readonly: true,
    height: '100%'
});

tinymce.init({
    selector: '#addNbTinyMce',
    branding: true,
    elementpath: false,
    menubar: menubarSet,
    placeholder: '请输入笔记内容',
    statusbar: false,
    promotion: false,
    license_key: 'gpl',
    plugins: 'lists wordcount advlist code charmap insertdatetime preview',
    toolbar: toolbar,
    height: '600px'
});

tinymce.init({
    selector: '#editNbTinyMce',
    branding: true,
    elementpath: false,
    menubar: menubarSet,
    placeholder: '请输入笔记内容',
    statusbar: false,
    promotion: false,
    license_key: 'gpl',
    plugins: 'lists wordcount advlist code charmap insertdatetime preview',
    toolbar: toolbar,
    height: '600px'
});

document.getElementById('addCancelBtn').addEventListener('click', function () {
    /*点击新增笔记的取消按钮*/
    ModalUtils.hideModal('addNbPopup');
    clearAddNbInput();
});

document.getElementById('addNbButton').addEventListener('click', function () {
    /*点击新增笔记按钮*/
    ModalUtils.displayModal('addNbPopup');
    document.getElementById('addNbName').focus();
    createNbFolderOption('addNbFolderSelect');
});

document.getElementById('addNbTypeSelect').addEventListener('change', function () {
    /*根据值不同，控制url控件是否显示*/
    let selectValue = this.value;
    if (selectValue == nbTypeEnum.NOTEBOOK) {
        ModalUtils.displayElement('addNbMceContainer');
    }
    else if (selectValue == nbTypeEnum.FOLDER) {
        ModalUtils.hideElement('addNbMceContainer');
    }
});

document.getElementById('addConfirmBtn').addEventListener('click', function () {
    /*点击确认新增笔记*/
    let nbName = document.getElementById('addNbName');
    let nbFolderSelect = document.getElementById('addNbFolderSelect');
    let nbSelectType = document.getElementById('addNbTypeSelect');
    let nbMceEditor = tinymce.get('addNbTinyMce');

    FetchUtils.fetchWithConfig(nowRoute, {
        method: "POST",
        "headers": {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            parentId: nbFolderSelect.value,
            name: nbName.value,
            type: nbSelectType.value,
            content: nbMceEditor.getContent()
        })
    })
        .then(data => {
            if (data.status == "Fail") {
                ModalUtils.displayFailMessage(data.message);  //显示错误信息弹窗
            }
            else {
                ModalUtils.displaySuccessMessage(data.message);  //显示新增成功信息弹窗
                updateNbList();  //更新当前笔记列表
                clearAddNbInput();  //清空输入
                ModalUtils.hideModal('addNbPopup');
            }
        });
});

document.getElementById('deleteNbBtn').addEventListener('click', function () {
    /*点击删除笔记按钮*/
    ModalUtils.hideElement('nbControlPopup');
    ModalUtils.displayModal('cfmDelPopup');
    document.getElementById('confirmDelBtn').focus();
});

document.getElementById('cancelDelBtn').addEventListener('click', function () {
    /*点击取消删除笔记*/
    ModalUtils.hideModal('cfmDelPopup');
});

document.getElementById('confirmDelBtn').addEventListener('click', function () {
    /*点击确认删除笔记*/
    if (nowControlId == null) {
        return;
    }
    let delBmUrl = nowRoute + "/" + nowControlId;
    FetchUtils.fetchWithConfig(delBmUrl, {
        method: "DELETE"
    })
        .then(data => {
            if (data.status == 'Fail') {
                ModalUtils.displayFailMessage(data.message);  //显示错误信息弹窗
            } else {
                ModalUtils.displaySuccessMessage(data.message);  //显示新增成功信息弹窗
                ModalUtils.hideModal('cfmDelPopup');
                updateNbList();  //更新当前笔记列表
            }
        });
});

document.getElementById('editCancelBtn').addEventListener('click', function () {
    /*点击取消编辑*/
    ModalUtils.hideModal('editNbPopup');
});

document.getElementById('editNbBtn').addEventListener('click', function () {
    /*点击编辑笔记*/
    ModalUtils.hideElement('nbControlPopup');
    if (nowControlId == null) {
        ModalUtils.displayFailMessage('笔记不存在');
        return;
    }
    createNbFolderOption('editNbFolderSelect');

    let nbDetailUrl = nowRoute + '/' + nowControlId;
    FetchUtils.fetchWithConfig(nbDetailUrl).then(data => {
        if (data.status != undefined) {
            ModalUtils.displayFailMessage(data.message);
        } else {
            document.getElementById('editNbName').value = data.name;  //笔记名称

            let selectValue = data.type;
            PageUtils.setSelectedByValue('editNbTypeSelect', selectValue); // 设置笔记类型
            document.getElementById('editNbTypeSelect').disabled = true;
            if (selectValue == nbTypeEnum.NOTEBOOK) {
                ModalUtils.displayElement('editNbMceContainer');
            }
            else if (selectValue == nbTypeEnum.FOLDER) {
                ModalUtils.hideElement('editNbMceContainer');
            }

            if (data.content !== null) {
                let mceEditor = tinymce.get('editNbTinyMce');
                mceEditor.setContent(data.content);
            }
            ModalUtils.displayModal('editNbPopup');  //显示编辑弹窗
            document.getElementById('editNbName').focus();
        }
    });
});

document.getElementById('editConfirmBtn').addEventListener('click', function () {
    /*点击确认编辑笔记*/
    if (nowControlId == null) {
        ModalUtils.displayFailMessage('笔记不存在');
        return;
    }
    let editNbUrl = nowRoute + '/' + nowControlId;
    let nbName = document.getElementById('editNbName');  //书签名称
    let nbFolderSelect = document.getElementById('editNbFolderSelect');  //所属目录
    let nbType = document.getElementById('editNbTypeSelect');  //书签类型
    let mceEditor = tinymce.get('editNbTinyMce');
    FetchUtils.fetchWithConfig(editNbUrl, {
        method: "PUT",
        "headers": {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            parentId: nbFolderSelect.value,
            name: nbName.value,
            type: nbType.value,
            content: mceEditor.getContent()
        })
    })
        .then(data => {
            if (data.status == 'Fail') {
                ModalUtils.displayFailMessage(data.message);  //显示错误信息弹窗
            } else {
                ModalUtils.displaySuccessMessage(data.message);  //显示新增成功信息弹窗
                ModalUtils.hideModal('editNbPopup');
                updateNbList();  //更新当前书签列表
            }
        });
});

document.getElementById('searchNbButton').addEventListener('click', function(){
    /*点击搜索按钮事件*/
    updateNbList();
});

document.getElementById('searchNbInput').addEventListener('keydown', function(){
    /*搜索栏按回车*/
    if (event.keyCode == 13 || event.key == 'Enter'){
        document.getElementById('searchNbButton').click();
    }
});

document.getElementById('downloadPDFBtn').addEventListener('click', function(){
    /*下载PDF*/
    if (nowControlId == null){
        ModalUtils.displayFailMessage("请先选择笔记");
    }
    ModalUtils.hideModal('nbControlPopup');
    let downDataUrl = nowRoute + "/" + nowControlId + "/pdf";
    ModalUtils.displaySuccessMessage('正在下载');
    FetchUtils.fetchFile(downDataUrl).then(()=>{
        ModalUtils.displaySuccessMessage('正在成功');
    })
    .catch(error=>{
        ModalUtils.displayFailMessage('下载失败');
    })
});

document.addEventListener('keydown', function(event){
    /*监听Esc并退出弹窗*/
    ModalUtils.escCloseModal(event, 'addNbPopup', 'nbControlPopup', 'cfmDelPopup', 'editNbPopup', 'readNbPopup');
});

window.onload = function(){
    PageUtils.resizeFullScreen('bodyContainer');
    PageUtils.setFocusClick('searchNbButton', 'addNbButton', 'addConfirmBtn', 'addCancelBtn');
    PageUtils.setFocusClick('editNbBtn', 'deleteNbBtn', 'editConfirmBtn', 'editCancelBtn');
    PageUtils.setFocusClick('confirmDelBtn', 'cancelDelBtn');
};

document.addEventListener('click', function(event){
    /*监听文档点击事件，检查点击是否在弹窗外部*/
    ModalUtils.checkClickModalPopup(event, 'readNbPopup', 'readNbContent');
    ModalUtils.checkClickModalPopup(event, 'addNbPopup', 'addNbContent');
    ModalUtils.checkClickModalPopup(event, 'nbControlPopup', 'nbControlContent');
    ModalUtils.checkClickModalPopup(event, 'cfmDelPopup', 'cfmDelContent');
    ModalUtils.checkClickModalPopup(event, 'editNbPopup', 'editNbContent');
});

window.addEventListener('resize', FuncUtils.throttle(function(){
    PageUtils.resizeFullScreen('bodyContainer');
}), 200);