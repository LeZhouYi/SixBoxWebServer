import * as ModalUtils from './util/modal_utils.js';
import * as FetchUtils from './util/fetch_utils.js';
import * as PageUtils from './util/page_utils.js';
import * as FuncUtils from './util/func_utils.js';

const nowRoute = "/backup"

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
