import * as BaseUtils from './base_utils.js';

const playMode = {
    "ORDER": 1,  // 顺序循环播放
    "RANDOM": 2  // 随机循环播放
}
const nowMusicRoute = '/music';  //音乐文件路由
var nowHowler = null;  // howler实例
var nowMusicId = null;
var nowHowlerVolume = 0.5;  //音量
var nowMusicList = null;
var nowRandList = null;
var nowPlayMode = playMode.ORDER;  //播放模式

var nowControlId = null;  //当前操作的音乐文件ID

function onPlayError(error){
    BaseUtils.displayMessage("播放错误");
}

function onLoadMusic(){
    /*音乐加载完成*/
    if (nowHowler !== null){
        let time = BaseUtils.intToMinuteTime(nowHowler.duration());
        document.getElementById('musicEndTime').text = time;
    }
}

function playMusic(){
    /*音乐播放*/
    if (nowHowler !== null){
        nowHowler.play();
        document.getElementById('playPauseBtn').src = 'static/images/icons/pause.png';
    }
}

function pauseMusic(){
    /*暂停音乐播放*/
    if (nowHowler !== null){
        nowHowler.pause();
        document.getElementById('playPauseBtn').src = 'static/images/icons/play.png';
    }
}

function onPlayMusic(){
    /*音乐播放进度监听*/
    var updatedRaf = null;
    const onAnimationFrame = function(){
        if (nowHowler !== null & nowHowler.playing()){
            const width = (nowHowler.seek() / nowHowler.duration()) * 100;
            let progress = document.getElementById('musicProgress');
            progress.value = width;
            let nowTime = BaseUtils.intToMinuteTime(nowHowler.seek());
            document.getElementById('nowPlayTime').text = nowTime;
            updatedRaf = requestAnimationFrame(onAnimationFrame);
        }
        else{
            if (updatedRaf !== null){
                cancelAnimationFrame(updatedRaf);
            }
        }
    };
    updatedRaf = requestAnimationFrame(onAnimationFrame);
}
function onEndMusic(){
    /*音乐播完后事件*/
    let time = BaseUtils.intToMinuteTime(nowHowler.duration());
    document.getElementById('nowPlayTime').value = time;
    document.getElementById('musicProgress').value = 100;
    document.getElementById('playPauseBtn').src = 'static/images/icons/pause.png';
    document.getElementById('skipForwardBtn').click();
}

function clearMscAddPop(){
    /*清空上传音乐弹窗的输入内容*/
    document.getElementById('addMscName').value = '';
    document.getElementById('addMscArtist').value = '';
    document.getElementById('addMscAlbum').value = '';
    document.getElementById('addMscFileText').value = '';
}

function loadPlayMusic(){
    /*加载并播放该音乐*/
    let musicUrl = nowMusicRoute+"/"+nowMusicId+'/file';
    if (nowHowler !== null){
        nowHowler.unload();
    }
    BaseUtils.fetchBlob(musicUrl).then(blob=>{
        var nowMusicBlob = URL.createObjectURL(blob);
        nowHowler = new Howl({
            src: [nowMusicBlob], // 使用 Blob URL 作为音频源
            format: ['mp3'], // 指定音频格式
            volume: nowHowlerVolume,
            onplay: onPlayMusic,
            onload: onLoadMusic,
            onend: onEndMusic,
            onerror: onPlayError,
        });
        playMusic();
        console.log(nowMusicList);
        let musicInfo = nowMusicList[findNowIndex()];
        console.log(musicInfo);
        document.getElementById('nowPlayMusicText').text = '> 正在播放: '+musicInfo.artist + '-' + musicInfo.name;
    });
}

function bindMscClickLoad(musicId){
    /*根据music id 播放音乐*/
    nowMusicId = musicId;
    loadPlayMusic();
}

function bindControlBtnClick(button, controlId){
    /*绑定点击操作按钮事件*/
    button.addEventListener('click', function(event){
        nowControlId = controlId;
        BaseUtils.displayModal('mscControlPopup');
        let element = document.getElementById('mscControlContent');
        element.style.left = event.clientX + 'px';
        element.style.top = event.clientY + 'px';
    });
}

function addMscListItem(data, parent){
    /*根据data添加一行音乐*/
    let nameSpan = document.createElement('a');
    nameSpan.textContent = data.artist + '-' + data.name;  // 书签名称
    nameSpan.addEventListener('click', function(){
        bindMscClickLoad(data.id);
    });

    let preIcon = document.createElement('img');  //前置图标
    preIcon.classList.add('bmIcon');
    preIcon.src = "static/images/icons/music.png";  //设置来源
    preIcon.alt = "音乐";

    let controlIcon = document.createElement('img');  // 操作图标
    controlIcon.src = "static/images/icons/more_vertical.png";
    controlIcon.alt = "操作";
    controlIcon.classList.add('bmIcon', 'clickable');
    bindControlBtnClick(controlIcon, data.id);  // 绑定点击事件

    let lineItem = document.createElement('dd');
    lineItem.classList.add('bmItem', 'clickable');
    lineItem.appendChild(preIcon);
    lineItem.appendChild(nameSpan);
    lineItem.appendChild(controlIcon);

    parent.appendChild(lineItem);
}

function findNowIndex(){
    /*查找当前音乐所在的Index*/
    for(var i = 0; i< nowMusicList.length; i++){
        if (nowMusicList[i].id == nowMusicId){
            return i;
        }
    }
    return -1;
}

function updateMscList(){
    /* 请求/bookmarks接口并刷新当前页面的书签列表内容 */
    BaseUtils.clearElementByStart('mpList', 2);
    let parentElement = document.getElementById('mpList');
    BaseUtils.fetchData(nowMusicRoute).then(data=>{
        nowMusicList = data;
        nowRandList = BaseUtils.genUniqueRandList(nowMusicList.length);
        data.forEach(element=>{
            addMscListItem(element, parentElement);
        });
    });
}

document.getElementById('playPauseBtn').addEventListener('click', function(){
    /*点击播放音乐*/
    if (nowHowler == null){
        if (nowMusicList == null || nowMusicList.length < 1){
            BaseUtils.displayMessage("当前合集没有歌曲可播放");
            return;
        }
        if(nowPlayMode == playMode.ORDER){
            nowMusicId = nowMusicList[0].id;
        }
        else{
            nowMusicId = nowMusicList[nowRandList[0]].id;
        }
        loadPlayMusic();
    }else{
        if (nowHowler.playing()){
            pauseMusic();
        }else{
            playMusic();
        }
    }
});

document.getElementById('addMscFile').addEventListener('change', function(event){
    var file = event.target.files[0];
    if (file){
        var fileExtension = file.name.split('.').pop().toLowerCase();
        if (fileExtension !== 'mp3'){
            BaseUtils.displayMessage('格式错误，请选择MP3文件');
            e.target.value= '';
        }else{
            document.getElementById('addMscFileText').value = file.name;
        }
    }
});

document.getElementById('uploadMscButton').addEventListener('click', function(){
    /*点击上传音乐按钮*/
    BaseUtils.displayModal('addMscPopup');
});

document.addEventListener('click', function(event){
    /*监听文档点击事件，检查点击是否在弹窗外部*/
    BaseUtils.checkClickModalPopup(event, 'addMscPopup', 'addMscContent');
});

document.getElementById('addMscCclBtn').addEventListener('click', function(){
    /*取消上传音乐*/
    BaseUtils.hideModal('addMscPopup');
    clearMscAddPop();
});

document.getElementById('addMscCfmBtn').addEventListener('click', function(){
    /*确认上传音乐*/
    let mscName = document.getElementById('addMscName');
    let mscArtist = document.getElementById('addMscArtist');
    let mscAlbum = document.getElementById('addMscAlbum');
    let mscFileName = document.getElementById('addMscFileText');
    let mscFilePath = document.getElementById('addMscFile');
    if (mscFileName.value === ''){
        BaseUtils.displayMessage("请选择音频文件");
        return;
    }
    let formData = new FormData();
    formData.append('file', mscFilePath.files[0]);
    formData.append('name', mscName.value);
    formData.append('artist', mscArtist.value);
    formData.append('album', mscAlbum.value);

    BaseUtils.fetchWithConfig(nowMusicRoute, {
        method: "POST",
        body: formData
    })
    .then(data=>{
        if (data.status == "Fail"){
            BaseUtils.displayMessage(data.message);  //显示错误信息弹窗
        }
        else{
            BaseUtils.displayMessage(data.message, 1000, 'green');  //显示新增成功信息弹窗
            BaseUtils.hideModal('addMscPopup');
            clearMscAddPop();
            updateMscList();
        }
    });
});

document.addEventListener('DOMContentLoaded', (event) => {
    /*页面首次加载，刷新当前书签列表*/
    updateMscList();
});

document.addEventListener('click', function(event){
    /*监听文档点击事件，检查点击是否在弹窗外部*/
    BaseUtils.checkClickModalPopup(event, 'mscVolumePopup', 'mscVolumeContent');
});

document.addEventListener('click', function(event){
    /*监听文档点击事件，检查点击是否在弹窗外部*/
    BaseUtils.checkClickModalPopup(event, 'mscControlPopup', 'mscControlContent');
});

document.addEventListener('click', function(event){
    /*监听文档点击事件，检查点击是否在弹窗外部*/
    BaseUtils.checkClickModalPopup(event, 'cfmDelPopup', 'cfmDelContent');
});

document.addEventListener('click', function(event){
    /*监听文档点击事件，检查点击是否在弹窗外部*/
    BaseUtils.checkClickModalPopup(event, 'editMscPopup', 'editMscContent');
});

document.getElementById('musicVolumeBtn').addEventListener('click', function(){
    /*点击调整音量弹窗*/
    BaseUtils.displayElement('mscVolumePopup');
    /*调整元素位置*/
    let element = document.getElementById('mscVolumeContent');
    element.style.left = event.clientX + 'px';
    element.style.top = event.clientY + 'px';
    let volumeElement = document.getElementById('volumeProgress');
    volumeElement.value = nowHowlerVolume*100;
});

document.getElementById('volumeProgress').addEventListener('change', function(){
    /*调整音量*/
    let value = this.value;
    nowHowlerVolume = value/100;
    let volumeElement = document.getElementById('musicVolumeBtn');
    if (nowHowlerVolume> 0.66){
        volumeElement.src = 'static/images/icons/volume_2.png';
    }else if (nowHowlerVolume > 0.33){
        volumeElement.src = 'static/images/icons/volume_1.png';
    }else if (nowHowlerVolume > 0){
        volumeElement.src = 'static/images/icons/volume.png';
    }else {
        volumeElement.src = 'static/images/icons/volume_x.png';
    }
    if (nowHowler!==null){
        nowHowler.volume(nowHowlerVolume);
    }
});

document.getElementById('deleteMscBtn').addEventListener('click', function(){
    /*点击删除音乐按钮*/
    BaseUtils.hideModal('mscControlPopup');
    BaseUtils.displayModal('cfmDelPopup');
});

document.getElementById('cancelDelBtn').addEventListener('click', function(){
    /*点击取消删除按钮*/
    BaseUtils.hideModal('cfmDelPopup');
});

document.getElementById('confirmDelBtn').addEventListener('click', function(){
    /*点击确认删除音乐*/
    if (nowControlId == null){
        return;
    }
    let delBmUrl = nowMusicRoute+"/"+nowControlId;
    BaseUtils.fetchWithConfig(delBmUrl, {
        method: "DELETE"
    })
    .then(data=>{
        if(data.status == 'Fail'){
            BaseUtils.displayMessage(data.message);  //显示错误信息弹窗
        }else{
            BaseUtils.displayMessage(data.message, 1000, 'green');  //显示新增成功信息弹窗
            BaseUtils.hideModal('cfmDelPopup');
            updateMscList();  //更新当前书签列表
        }
    });
});

document.getElementById('editMscBtn').addEventListener('click', function(){
    /*点击编辑音乐*/
    BaseUtils.hideModal('mscControlPopup');
    if(nowControlId == null){
        return
    }
    let detailUrl = nowMusicRoute + '/' + nowControlId;
    BaseUtils.fetchData(detailUrl).then(data=>{
        if(data.status != undefined){
            BaseUtils.displayMessage(data.message);
        }else{
            document.getElementById('editMscName').value=data.name;  //书签名称
            document.getElementById('editMscArtist').value=data.artist;  //所指链接
            document.getElementById('editMscAlbum').value=data.album;
            BaseUtils.displayModal('editMscPopup');  //显示编辑弹窗
        }
    });
});

document.getElementById('editMscCclBtn').addEventListener('click', function(){
    /*点击取消编辑*/
    BaseUtils.hideModal('editMscPopup');
});

document.getElementById('editMscCfmBtn').addEventListener('click', function(){
    /*确认编辑*/
    let editUrl = nowMusicRoute + '/' + nowControlId;
    let mscName = document.getElementById('editMscName');
    let mscArtist = document.getElementById('editMscArtist');
    let mscAlbum = document.getElementById('editMscAlbum');

    BaseUtils.fetchWithConfig(editUrl, {
        method: "PUT",
        "headers":{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: mscName.value,
            artist: mscArtist.value,
            album: mscAlbum.value
        })
    })
    .then(data=>{
        if (data.status == "Fail"){
            BaseUtils.displayMessage(data.message);  //显示错误信息弹窗
        }
        else{
            BaseUtils.displayMessage(data.message, 1000, 'green');  //显示新增成功信息弹窗
            updateMscList();  //更新当前书签列表
            BaseUtils.hideModal('editMscPopup');
        }
    });
});

document.getElementById('repeatModeBtn').addEventListener('click', function(){
    /*切换当前播放模式*/
    if (nowPlayMode == playMode.ORDER){
        nowPlayMode = playMode.RANDOM;
        this.src = "static/images/icons/shuffle.png"
    }
    else if (nowPlayMode == playMode.RANDOM){
        nowPlayMode = playMode.ORDER;
        this.src = "static/images/icons/repeat.png"
    }
});

document.getElementById('skipForwardBtn').addEventListener('click', function(){
    /*下一首*/
    if(nowMusicList == null || nowMusicList.length < 1){
        BaseUtils.displayMessage("当前合集没有歌曲可播放");
        return;
    }
    let nowIndex = findNowIndex();
    if(nowPlayMode == playMode.ORDER){
        if (nowIndex != -1){
            nowMusicId = nowMusicList[(nowIndex+1)%nowMusicList.length].id;
        }else{
            nowMusicId = nowMusicList[0].id;
        }
    }
    else{
        let randIndex = -1;
        if (nowIndex != -1){
            for(var i = 0; i< nowRandList.length; i++){
                if (nowRandList[i] == nowIndex){
                    randIndex = i;
                    break;
                }
            }
        }
        if (randIndex != -1){
            nowMusicId = nowMusicList[nowRandList[(randIndex+1)%nowRandList.length]].id;
        }else{
            nowMusicId = nowMusicList[nowRandList[0]].id;
        }
    }
    loadPlayMusic();
});

document.getElementById('downloadMscBtn').addEventListener('click', function(){
    /*点击下载*/
    if (nowControlId == null){
        return;
    }
    let musicUrl = nowMusicRoute+"/"+nowControlId+'/file';
    if (BaseUtils.fetchFile(musicUrl)){
        BaseUtils.displayMessage('正在下载', 1000, 'green');
        BaseUtils.hideModal('mscControlPopup');
    }
    else{
        BaseUtils.displayMessage('下载失败');
    }
});

document.getElementById('skipBackBtn').addEventListener('click', function(){
    /*下一首*/
    if(nowMusicList == null || nowMusicList.length < 1){
        BaseUtils.displayMessage("当前合集没有歌曲可播放");
        return;
    }
    let nowIndex = findNowIndex();
    if(nowPlayMode == playMode.ORDER){
        if (nowIndex != -1){
            nowMusicId = nowMusicList[(nowIndex+nowMusicList.length-1)%nowMusicList.length].id;
        }else{
            nowMusicId = nowMusicList[0].id;
        }
    }
    else{
        let randIndex = -1;
        if (nowIndex != -1){
            for(var i = 0; i< nowRandList.length; i++){
                if (nowRandList[i] == nowIndex){
                    randIndex = i;
                    break;
                }
            }
        }
        if (randIndex != -1){
            nowMusicId = nowMusicList[nowRandList[(randIndex+nowRandList.length-1)%nowRandList.length]].id;
        }else{
            nowMusicId = nowMusicList[nowRandList[0]].id;
        }
    }
    loadPlayMusic();
});

document.addEventListener('click', function(event){
    /*监听文档点击事件，检查点击是否在弹窗外部*/
    BaseUtils.checkClickModalPopup(event, 'mscCollectPopup', 'mscCollectContent');
});

document.getElementById('playCollectBtn').addEventListener('click', function(event){
    /*点击音乐合集按钮*/
    let collectListUrl = nowMusicRoute+"/collect";
    BaseUtils.fetchData(collectListUrl).then(data=>{
    });

    let element = document.getElementById('mscCollectContent');
    element.style.left = event.clientX + 'px';
    element.style.top = event.clientY + 'px';
    BaseUtils.displayModal('mscCollectPopup');
});

document.getElementById('searchMscButton').addEventListener('click', function(){
    /*点击搜索音乐*/
    let inputText = document.getElementById('searchMscInput').value;
    console.log(inputText);
    if (inputText == null || inputText == ''){
        updateMscList();
    }else{
        BaseUtils.clearElementByStart('mpList', 2);
        let parentElement = document.getElementById('mpList');
        let searchUrl = nowMusicRoute+"?search="+inputText
        BaseUtils.fetchData(searchUrl).then(data=>{
            nowMusicList = data;
            nowRandList = BaseUtils.genUniqueRandList(nowMusicList.length);
            data.forEach(element=>{
                addMscListItem(element, parentElement);
            });
        });
    }
});

document.getElementById('searchMscInput').addEventListener('keydown', function(){
    /*搜索栏按回车*/
    if (event.keyCode == 13 || event.key == 'Enter'){
        document.getElementById('searchMscButton').click();
    }
});

window.onload = function(){
    BaseUtils.resizeFullScreen('bodyContainer');
};

window.addEventListener('resize', BaseUtils.throttle(function(){
    BaseUtils.resizeFullScreen('bodyContainer');
}), 200);