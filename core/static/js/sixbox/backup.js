import * as BaseUtils from './base_utils.js';

const nowRoute = "/backup"

document.getElementById('appDownData').addEventListener('click', function(){
    let downDataUrl = nowRoute
    if (BaseUtils.fetchFile(downDataUrl)){
        BaseUtils.displayMessage('正在下载', 1000, 'green');
    }
    else{
        BaseUtils.displayMessage('下载失败');
    }
});

document.getElementById('uploadFileField').addEventListener('change', function(){
    var file = event.target.files[0];
    if (file){
        let uploadUrl = '/backup';
        let formData = new FormData();
        formData.append('file', file);
        formData.append('name', file.name)
        BaseUtils.fetchWithConfig(uploadUrl, {
            method: "POST",
            body: formData
        })
        .then(data=>{
            if (data.status == "Fail"){
                BaseUtils.displayMessage(data.message);  //显示错误信息弹窗
            }
            else{
                BaseUtils.displayMessage(data.message, 1000, 'green');  //显示新增成功信息弹窗
            }
        });
    }
});

window.onload = function(){
    BaseUtils.resizeFullScreen('bodyContainer');
    BaseUtils.setFocusClick('appDownData', 'appUploadData');
};

window.addEventListener('resize', BaseUtils.throttle(function(){
    BaseUtils.resizeFullScreen('bodyContainer');
}), 200);
