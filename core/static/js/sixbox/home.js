import * as BaseUtils from './base_utils.js';

document.getElementById('appBookmark').addEventListener('click', function(){
    /*点击书签*/
    window.location.href = this.children[1].getAttribute('href');
});

document.getElementById('appBackup').addEventListener('click', function(){
    /*点击备份*/
    window.location.href = this.children[1].getAttribute('href');
});

document.getElementById('appNotebook').addEventListener('click', function(){
    /*点击笔记*/
    window.location.href = this.children[1].getAttribute('href');
});

document.getElementById('appMusicPlayer').addEventListener('click', function(){
    /*点击音乐盒*/
    window.location.href = this.children[1].getAttribute('href');
});

window.onload = function(){
    BaseUtils.resizeFullScreen();
};

window.addEventListener('resize', BaseUtils.throttle(function(){
    BaseUtils.resizeFullScreen();
}), 200);