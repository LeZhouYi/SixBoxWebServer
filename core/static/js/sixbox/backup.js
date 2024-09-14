import * as ModalUtils from './util/modal_utils.js';
import * as FetchUtils from './util/fetch_utils.js';
import * as PageUtils from './util/page_utils.js';
import * as FuncUtils from './util/func_utils.js';

const nowRoute = "/backup"

function updateBmList(){
    /* 请求/bookmarks接口并刷新当前页面的书签列表内容 */
    let searchInput = document.getElementById('searchBmInput');

    let getListUrl = nowRoute+"?parentId="+parentId;  //构造url
    if (searchInput.value!==''){
        getListUrl = nowRoute+"?search="+searchInput.value;
    }

    let dataList = document.getElementById('bmList')
    dataList.innerHTML = '';  // 清空表格内容

    addLastPageItem(parentId, dataList); //添加上一页
    FetchUtils.fetchData(getListUrl).then(data=>{
        data.forEach(element=>{
            addBmListItem(element, dataList);
        });
    });
}

document.getElementById('appDownData').addEventListener('click', function(){
    let downDataUrl = nowRoute
    if (FetchUtils.fetchFile(downDataUrl)){
        ModalUtils.displaySuccessMessage('正在下载');
    }
    else{
        ModalUtils.displayFailMessage('下载失败');
    }
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

window.onload = function(){
    PageUtils.resizeFullScreen('bodyContainer');
    PageUtils.setFocusClick('appDownData', 'appUploadData');
};

window.addEventListener('resize', FuncUtils.throttle(function(){
    PageUtils.resizeFullScreen('bodyContainer');
}), 200);
