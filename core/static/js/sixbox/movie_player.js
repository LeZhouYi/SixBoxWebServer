import * as PageUtils from './util/page_utils.js';
import * as FetchUtils from './util/fetch_utils.js';
import * as ModalUtils from './util/modal_utils.js';
import * as FuncUtils from './util/func_utils.js';

const nowRoute = '/movie';
var nowMovieBlob = null;

function playMovie(){
    var player = videojs('videoContainer');
    var source = document.createElement('source');

    let videoUrl = nowRoute + '/1231313123';
    FetchUtils.fetchBlob(videoUrl).then(blob=>{
        if (!blob){
            ModalUtils.displayFailMessage("网络问题，加载音乐失败");
            return;
        }
        if (nowMovieBlob){
            URL.revokeObjectURL(nowMovieBlob);
            nowMovieBlob = null;
        }
        nowMovieBlob = URL.createObjectURL(blob);
        player.src({
            type: 'video/mp4',
            src: nowMovieBlob
        })
        player.load();
        player.on('dispose', function(){
            if (nowMovieBlob){
                URL.revokeObjectURL(nowMovieBlob);
                nowMovieBlob = null;
            }
        });
    })
}

window.onload = function(){
    PageUtils.resizeFullScreen('bodyContainer');
    playMovie();
};

window.addEventListener('resize', FuncUtils.throttle(function(){
    console.log("test");
    PageUtils.resizeFullScreen('bodyContainer');
}), 200);