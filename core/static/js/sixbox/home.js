import * as BaseUtils from './base_utils.js';

function registerClick(...parentIds){
    /*注册点击事件*/
    for(let i = 0; i < parentIds.length; i++) {
        document.getElementById(parentIds[i]).addEventListener('click', function(){
            /*点击书签*/
            window.location.href = this.children[1].getAttribute('href');
        });
    }
}

window.onload = function(){
    BaseUtils.resizeFullScreen('bodyContainer');
    BaseUtils.setFocusClick('appBookmark', 'appNotebook', 'appMusicPlayer', 'appBackup');
    registerClick('appBookmark', 'appBackup', 'appNotebook', 'appMusicPlayer');
};

window.addEventListener('resize', BaseUtils.throttle(function(){
    BaseUtils.resizeFullScreen('bodyContainer');
}), 200);