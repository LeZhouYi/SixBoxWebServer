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

window.onload = function(){
    BaseUtils.resizeFullScreen();
};

window.addEventListener('resize', BaseUtils.throttle(function(){
    BaseUtils.resizeFullScreen();
}), 200);

document.getElementById('uploadFileField').addEventListener('change', function(){

});