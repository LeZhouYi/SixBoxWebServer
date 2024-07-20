import * as PageUtils from './util/page_utils.js';

function playMovie(){
    var player = videojs('videoContainer');
    var source = document.createElement('source');
    source.src = '/movie/1231313123';
    source.type = 'video/mp4'; // 根据你的视频类型设置，例如 video/webm, video/ogg 等
    console.log('test3');
    player.ready(function() {
        console.log('test2');
        // 当播放器准备就绪后，添加 source 元素到 video 标签中
        this.el().appendChild(source);
        // 加载并播放视频
        this.load();
        console.log('test4');
        this.play();
    });
}

window.onload = function(){
    PageUtils.resizeFullScreen('bodyContainer');
    playMovie();
};