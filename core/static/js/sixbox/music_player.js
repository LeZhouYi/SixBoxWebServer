import * as DataUtils from './util/data_utils.js';
import * as ModalUtils from './util/modal_utils.js';
import * as FetchUtils from './util/fetch_utils.js';
import * as PageUtils from './util/page_utils.js';
import * as FuncUtils from './util/func_utils.js';

const playMode = {
    'ORDER': 1,  // 顺序循环播放
    'RANDOM': 2  // 随机循环播放
}
const nowMusicRoute = '/music';  //音乐文件路由
var nowMusicBlob = null;
var nowHowler = null;  // howler实例
var nowMusicId = null;  // 现时播放的音乐ID
var nowPlayVolume = 0.5;  //音量
var nowMusicList = null;  // 现时播放的音乐列表
var nowRandList = null;  // 现时随机播放的音乐列表
var nowPlayMode = playMode.ORDER;  //播放模式

var nowControlId = null;  //当前操作的音乐文件ID
var nowCollectId = null;  //当前播放的音乐合集,null表示全部合集
var nowCtrlCollectId = null;  //当前编辑/删除的音乐合集

var isProgressFocus = false;  //表示当前用户是否在拖动进度条

function onPlayError(error){
    ModalUtils.displayFailMessage('播放错误');
}

function onLoadMusic(){
    /*音乐加载完成*/
    if (nowHowler !== null){
        let time = DataUtils.formatToMinuteTime(nowHowler.duration());
        document.getElementById('musicEndTime').text = time;
        document.getElementById('nowPlayTime').text = DataUtils.formatToMinuteTime(0);
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
        if (nowHowler !== null && nowHowler.playing() && !isProgressFocus){
            const width = (nowHowler.seek() / nowHowler.duration()) * 100;
            document.getElementById('musicProgress').value = width;

            let nowTime = DataUtils.formatToMinuteTime(nowHowler.seek());
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
    let time = DataUtils.formatToMinuteTime(nowHowler.duration());
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
    let musicUrl = nowMusicRoute+'/'+nowMusicId+'/file';
    if (nowHowler !== null){
        nowHowler.unload();
    }
    FetchUtils.fetchBlob(musicUrl).then(blob=>{
        if (!blob){
            ModalUtils.displayFailMessage('网络问题，加载音乐失败');
            return;
        }
        if (nowMusicBlob){
            URL.revokeObjectURL(nowMusicBlob);
            nowMusicBlob = null;
        }
        nowMusicBlob = URL.createObjectURL(blob);
        nowHowler = new Howl({
            src: [nowMusicBlob], // 使用 Blob URL 作为音频源
            format: ['mp3'], // 指定音频格式
            volume: nowPlayVolume,
            onplay: onPlayMusic,
            onload: onLoadMusic,
            onend: onEndMusic,
            onerror: onPlayError,
        });
        playMusic();
        let musicInfo = nowMusicList[findNowIndex()];
        document.getElementById('nowPlayMusicText').text = '> 正在播放: '+musicInfo.artist + '-' + musicInfo.name;
    })
}

function bindControlBtnClick(button, controlId){
    /*绑定点击操作按钮事件*/
    button.addEventListener('click', function(event){
        nowControlId = controlId;
        ModalUtils.displayModal('mscControlPopup');
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
            nowMusicId = data.id;
            loadPlayMusic();
    });

    let preIcon = document.createElement('img');  //前置图标
    preIcon.classList.add('bmIcon');
    preIcon.src = 'static/images/icons/music.png';  //设置来源
    preIcon.alt = '音乐';

    let controlIcon = document.createElement('img');  // 操作图标
    controlIcon.src = 'static/images/icons/more_vertical.png';
    controlIcon.alt = '操作';
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

function updateMscList(callback){
    /* 请求/bookmarks接口并刷新当前页面的书签列表内容 */
    PageUtils.clearElementByStart('mpList', 2);
    let parentElement = document.getElementById('mpList');

    let searchUrl = nowMusicRoute;
    if (nowCollectId !== null){
        searchUrl = nowMusicRoute+'?collect='+nowCollectId;
    }
    FetchUtils.fetchData(searchUrl).then(data=>{
        nowMusicList = data;
        nowRandList = DataUtils.genUniqueRandList(nowMusicList.length);
        data.forEach(element=>{
            addMscListItem(element, parentElement);
        });
        if (callback){
            callback();
        }
    });
}

function bindClickCollect(collectElement, collectId, collectName){
    /*绑定点击合集事件*/
    collectElement.addEventListener('click', function(){
        nowCollectId = collectId;
        nowMusicId = null;
        nowMusicList = [];
        updateMscList(function(){
            document.getElementById('nowPlayCollectText').text = collectName;
            document.getElementById('skipForwardBtn').click();
        });
        ModalUtils.hideModal('mscCollectPopup');
    })
}

function addDefaultCollect(parentElement){
    /*添加默认合集*/
    let itemTextSpan = document.createElement('a');
    itemTextSpan.text = '全部列表';
    itemTextSpan.classList.add('clickable');
    PageUtils.setElementFocusClick(itemTextSpan);

    let itemElement = document.createElement('dd');
    itemElement.classList.add('ctrlListItem');
    itemElement.appendChild(itemTextSpan);
    parentElement.appendChild(itemElement);
    return itemTextSpan;
}

function bindCollectDel(parentElement, collectId){
    parentElement.addEventListener('click', function(){
        nowCtrlCollectId = collectId;
        ModalUtils.hideModal('mscCollectPopup');
        ModalUtils.displayModal('cfmDelPcPopup');
    });
}

function bindCollectEdit(parentElement, collectId){
    parentElement.addEventListener('click', function(){
        nowCtrlCollectId = collectId;
        ModalUtils.hideModal('mscCollectPopup');
        let detailUrl = nowMusicRoute + '/collect/' + nowCtrlCollectId;
        FetchUtils.fetchWithConfig(detailUrl).then(data => {
            if (data.status != undefined) {
                ModalUtils.displayFailMessage(data.message);
            } else {
                document.getElementById('editCltName').value = data.name;  //笔记名称
                ModalUtils.displayModal('editCollectPopup');  //显示编辑弹窗
            }
        });
    });
}

function bindStarMusic(parentElement, collectId){
    parentElement.addEventListener('click', function(){
        let detailUrl = nowMusicRoute + '/' + nowControlId+ '/star';
        FetchUtils.fetchWithConfig(detailUrl,{
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                collectId: collectId
            })
        })
        .then(data => {
            if (data.status == 'Fail') {
                ModalUtils.displayFailMessage(data.message);
            } else {
                ModalUtils.displaySuccessMessage(data.message);
            }
            ModalUtils.hideModal('mscAddCltPopup');
        });
    });
}

document.getElementById('playPauseBtn').addEventListener('click', function(){
    /*点击播放音乐*/
    if (nowHowler == null){
        if (nowMusicList == null || nowMusicList.length < 1){
            ModalUtils.displayFailMessage('当前合集没有歌曲可播放');
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
            ModalUtils.displayFailMessage('格式错误，请选择MP3文件');
            e.target.value= '';
        }else{
            document.getElementById('addMscFileText').value = file.name;
        }
    }else{
        document.getElementById('addMscFileText').value = '';
    }
});

document.getElementById('uploadMscButton').addEventListener('click', function(){
    /*点击上传音乐按钮*/
    ModalUtils.displayModal('addMscPopup');
});

document.addEventListener('click', function(event){
    /*监听文档点击事件，检查点击是否在弹窗外部*/
    ModalUtils.checkClickModalPopup(event, 'addMscPopup', 'addMscContent');
});

document.getElementById('addMscCclBtn').addEventListener('click', function(){
    /*取消上传音乐*/
    ModalUtils.hideModal('addMscPopup');
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
        ModalUtils.displayFailMessage('请选择音频文件');
        return;
    }
    let formData = new FormData();
    formData.append('file', mscFilePath.files[0]);
    formData.append('name', mscName.value);
    formData.append('artist', mscArtist.value);
    formData.append('album', mscAlbum.value);

    FetchUtils.fetchWithConfig(nowMusicRoute, {
        method: 'POST',
        body: formData
    })
    .then(data=>{
        if (data.status == 'Fail'){
            ModalUtils.displayFailMessage(data.message);  //显示错误信息弹窗
        }
        else{
            ModalUtils.displaySuccessMessage(data.message);  //显示新增成功信息弹窗
            ModalUtils.hideModal('addMscPopup');
            clearMscAddPop();
            updateMscList();
        }
    });
});

document.getElementById('musicVolumeBtn').addEventListener('click', function(){
    /*点击调整音量弹窗*/
    ModalUtils.displayElement('mscVolumePopup');
    /*调整元素位置*/
    let element = document.getElementById('mscVolumeContent');
    element.style.left = event.clientX + 'px';
    element.style.top = event.clientY + 'px';
    let volumeElement = document.getElementById('volumeProgress');
    volumeElement.value = nowPlayVolume*100;
});

document.getElementById('volumeProgress').addEventListener('change', function(){
    /*调整音量*/
    let value = this.value;
    nowPlayVolume = value/100;
    let volumeElement = document.getElementById('musicVolumeBtn');
    if (nowPlayVolume> 0.66){
        volumeElement.src = 'static/images/icons/volume_2.png';
    }else if (nowPlayVolume > 0.33){
        volumeElement.src = 'static/images/icons/volume_1.png';
    }else if (nowPlayVolume > 0){
        volumeElement.src = 'static/images/icons/volume.png';
    }else {
        volumeElement.src = 'static/images/icons/volume_x.png';
    }
    if (nowHowler!==null){
        nowHowler.volume(nowPlayVolume);
    }
});

document.getElementById('deleteMscBtn').addEventListener('click', function(){
    /*点击删除音乐按钮*/
    ModalUtils.hideModal('mscControlPopup');
    ModalUtils.displayModal('cfmDelPopup');
});

document.getElementById('cancelDelBtn').addEventListener('click', function(){
    /*点击取消删除按钮*/
    ModalUtils.hideModal('cfmDelPopup');
});

document.getElementById('confirmDelBtn').addEventListener('click', function(){
    /*点击确认删除音乐*/
    if (nowControlId == null){
        return;
    }
    let delBmUrl = nowMusicRoute+'/'+nowControlId;
    FetchUtils.fetchWithConfig(delBmUrl, {
        method: 'DELETE'
    })
    .then(data=>{
        if(data.status == 'Fail'){
            ModalUtils.displayFailMessage(data.message);  //显示错误信息弹窗
        }else{
            ModalUtils.displaySuccessMessage(data.message);  //显示新增成功信息弹窗
            ModalUtils.hideModal('cfmDelPopup');
            updateMscList();  //更新当前书签列表
        }
    });
});

document.getElementById('editMscBtn').addEventListener('click', function(){
    /*点击编辑音乐*/
    ModalUtils.hideModal('mscControlPopup');
    if(nowControlId == null){
        return
    }
    let detailUrl = nowMusicRoute + '/' + nowControlId;
    FetchUtils.fetchData(detailUrl).then(data=>{
        if(data.status != undefined){
            ModalUtils.displayFailMessage(data.message);
        }else{
            document.getElementById('editMscName').value=data.name;  //书签名称
            document.getElementById('editMscArtist').value=data.artist;  //所指链接
            document.getElementById('editMscAlbum').value=data.album;
            ModalUtils.displayModal('editMscPopup');  //显示编辑弹窗
        }
    });
});

document.getElementById('editMscCclBtn').addEventListener('click', function(){
    /*点击取消编辑*/
    ModalUtils.hideModal('editMscPopup');
});

document.getElementById('editMscCfmBtn').addEventListener('click', function(){
    /*确认编辑*/
    let editUrl = nowMusicRoute + '/' + nowControlId;
    let mscName = document.getElementById('editMscName');
    let mscArtist = document.getElementById('editMscArtist');
    let mscAlbum = document.getElementById('editMscAlbum');

    FetchUtils.fetchWithConfig(editUrl, {
        method: 'PUT',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: mscName.value,
            artist: mscArtist.value,
            album: mscAlbum.value
        })
    })
    .then(data=>{
        if (data.status == 'Fail'){
            ModalUtils.displayFailMessage(data.message);  //显示错误信息弹窗
        }
        else{
            ModalUtils.displaySuccessMessage(data.message);  //显示新增成功信息弹窗
            updateMscList();  //更新当前书签列表
            ModalUtils.hideModal('editMscPopup');
        }
    });
});

document.getElementById('repeatModeBtn').addEventListener('click', function(){
    /*切换当前播放模式*/
    if (nowPlayMode == playMode.ORDER){
        nowPlayMode = playMode.RANDOM;
        this.src = 'static/images/icons/shuffle.png'
    }
    else if (nowPlayMode == playMode.RANDOM){
        nowPlayMode = playMode.ORDER;
        this.src = 'static/images/icons/repeat.png'
    }
});

document.getElementById('skipForwardBtn').addEventListener('click', function(){
    /*下一首*/
    if(nowMusicList == null || nowMusicList.length < 1){
        ModalUtils.displayFailMessage('当前合集没有歌曲可播放');
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
    let musicUrl = nowMusicRoute+'/'+nowControlId+'/file';
    const a = document.createElement('a');
    a.href = musicUrl;
    document.body.appendChild(a);
    a.click();
    ModalUtils.hideModal('mscControlPopup');
});

document.getElementById('skipBackBtn').addEventListener('click', function(){
    /*下一首*/
    if(nowMusicList == null || nowMusicList.length < 1){
        ModalUtils.displayFailMessage('当前合集没有歌曲可播放');
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
    ModalUtils.checkClickModalPopup(event, 'mscCollectPopup', 'mscCollectContent');
});

document.getElementById('playCollectBtn').addEventListener('click', function(event){
    /*点击音乐合集按钮*/
    let collectListUrl = nowMusicRoute+'/collect';
    FetchUtils.fetchData(collectListUrl).then(data=>{
        let parentElement = document.getElementById('mscCollectList');
        parentElement.innerHTML = '';
        let defaultElement = addDefaultCollect(parentElement);
        bindClickCollect(defaultElement, null, '全部列表')
        data.forEach(element=>{
           let itemDelImg = document.createElement('img');
           itemDelImg.src = '/static/images/icons/trash_2.png';
           itemDelImg.classList.add('bmIcon', 'clickable');
           bindCollectDel(itemDelImg, element.id);

           let itemEditImg = document.createElement('img');
           itemEditImg.src = '/static/images/icons/edit.png';
           itemEditImg.classList.add('bmIcon', 'clickable');
           bindCollectEdit(itemEditImg, element.id);

           let itemTextSpan = document.createElement('a');
           itemTextSpan.text = element.name;
           itemTextSpan.classList.add('clickable');
           PageUtils.setElementFocusClick(itemTextSpan);
           bindClickCollect(itemTextSpan, element.id, element.name);

           let itemElement = document.createElement('dd');
           itemElement.classList.add('ctrlListItem');
           itemElement.appendChild(itemTextSpan);
           itemElement.appendChild(itemEditImg);
           itemElement.appendChild(itemDelImg);
           parentElement.appendChild(itemElement);
        });
    });
    ModalUtils.displayModal('mscCollectPopup');
    ModalUtils.adjustPopup('mscCollectContent', event.target.getBoundingClientRect());
});

document.getElementById('searchMscButton').addEventListener('click', function(){
    /*点击搜索音乐*/
    let inputText = document.getElementById('searchMscInput').value;
    if (inputText == null || inputText == ''){
        updateMscList();
    }else{
        PageUtils.clearElementByStart('mpList', 2);
        let parentElement = document.getElementById('mpList');
        let searchUrl = nowMusicRoute+'?search='+inputText
        FetchUtils.fetchData(searchUrl).then(data=>{
            nowMusicList = data;
            nowRandList = DataUtils.genUniqueRandList(nowMusicList.length);
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

document.getElementById('musicMoreCtrlBtn').addEventListener('click', function(){
    /*点击更多操作按钮*/
    ModalUtils.displayModal('collectCtrlPopup');
    ModalUtils.adjustPopup('collectCtrlContent', event.target.getBoundingClientRect());
});

document.getElementById('addCollectBtn').addEventListener('click', function(){
    /*点击新增合集按钮*/
    ModalUtils.hideModal('collectCtrlPopup');
    ModalUtils.displayModal('addCollectPopup');
});

document.getElementById('addCtlCclBtn').addEventListener('click', function(){
    /*点击取消新增合集*/
    ModalUtils.hideModal('addCollectPopup');
    document.getElementById('addCltName').value = '';
});

document.getElementById('addCtlCfmBtn').addEventListener('click', function(){
    /*确认新增合集*/
    let addUrl = nowMusicRoute+'/collect';
    let cltName = document.getElementById('addCltName');
    FetchUtils.fetchWithConfig(addUrl, {
        method: 'POST',
        'headers':{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: cltName.value
        })
    })
    .then(data=>{
        if (data.status == 'Fail'){
            ModalUtils.displayFailMessage(data.message);  //显示错误信息弹窗
        }
        else{
            ModalUtils.displaySuccessMessage(data.message);  //显示新增成功信息弹窗
            ModalUtils.hideModal('addCollectPopup');
        }
    });
})

document.getElementById('cclDelPcBtn').addEventListener('click', function(){
    /*取消删除合集*/
    ModalUtils.hideModal('cfmDelPcPopup');
});

document.getElementById('cfmDelPcBtn').addEventListener('click', function(){
    /*确认删除*/
    let delUrl = nowMusicRoute+'/collect/'+nowCtrlCollectId;
    FetchUtils.fetchWithConfig(delUrl, {
        method: 'DELETE'
    })
    .then(data=>{
        if(data.status == 'Fail'){
            ModalUtils.displayFailMessage(data.message);  //显示错误信息弹窗
        }else{
            ModalUtils.displaySuccessMessage(data.message);  //显示新增成功信息弹窗
            ModalUtils.hideModal('cfmDelPcPopup');
            if(nowCtrlCollectId == nowCollectId){
                nowCollectId = null;
                document.getElementById('nowPlayCollectText').text = '全部合集';
                updateMscList(function(){
                    document.getElementById('skipForwardBtn').click();
                });
            }
        }
    });
});

document.getElementById('nowPlayCollectText').addEventListener('click', function(){
    document.getElementById('playCollectBtn').click();
});

document.getElementById('editCtlCclBtn').addEventListener('click', function(){
    ModalUtils.hideModal('editCollectPopup');
});

document.getElementById('editCtlCfmBtn').addEventListener('click', function(){
    let editUrl = nowMusicRoute+'/collect/'+nowCtrlCollectId;
    let pcName = document.getElementById('editCltName');
    FetchUtils.fetchWithConfig(editUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: pcName.value
        })
    })
    .then(data=>{
        if (data.status == 'Fail'){
            ModalUtils.displayFailMessage(data.message);  //显示错误信息弹窗
        }
        else{
            ModalUtils.displaySuccessMessage(data.message);  //显示新增成功信息弹窗
            ModalUtils.hideModal('editCollectPopup');
            if(nowCtrlCollectId == nowCollectId){
                document.getElementById('nowPlayCollectText').text = pcName.value;
            }
        }
    });
});

document.getElementById('collectMusicBtn').addEventListener('click', function(){
    event.stopPropagation();
    let collectListUrl = nowMusicRoute+'/collect';
    FetchUtils.fetchData(collectListUrl).then(data=>{
        let parentElement = document.getElementById('mscAddCltList');
        parentElement.innerHTML = '';
        data.forEach(element=>{
            let itemTextSpan = document.createElement('a');
            itemTextSpan.text = element.name;
            itemTextSpan.classList.add('clickable');
            PageUtils.setElementFocusClick(itemTextSpan);
            bindStarMusic(itemTextSpan, element.id);

            let itemElement = document.createElement('dd');
            itemElement.classList.add('ctrlListItem');
            itemElement.appendChild(itemTextSpan);
            parentElement.appendChild(itemElement);
        });
        if (data.length > 0){
            ModalUtils.displayModal('mscAddCltPopup');
            let rect = document.getElementById('collectMusicBtn').getBoundingClientRect();
            ModalUtils.adjustPopup('mscAddCltContent', this.getBoundingClientRect());
            ModalUtils.hideModal('mscControlPopup');
        }else{
            ModalUtils.displayFailMessage('无合集，请先创建合集');  //显示错误信息弹窗
            ModalUtils.hideModal('mscControlPopup');
        }
    });
});

document.getElementById('rmCollectMusicBtn').addEventListener('click', function(){
    if(nowCollectId == null){
        ModalUtils.displayFailMessage('默认合集无法移出');
        ModalUtils.hideModal('mscControlPopup');
        return;
    }
    let removeUrl = nowMusicRoute+'/'+nowControlId+'/remove_star';
    FetchUtils.fetchWithConfig(removeUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            collectId: nowCollectId
        })
    })
    .then(data=>{
        if (data.status == 'Fail'){
            ModalUtils.displayFailMessage(data.message);  //显示错误信息弹窗
        }
        else{
            ModalUtils.displaySuccessMessage(data.message);  //显示新增成功信息弹窗
            updateMscList(function(){
                if (nowControlId == nowMusicId){
                    document.getElementById('skipForwardBtn').click();
                }
            });
        }
    });
    ModalUtils.hideModal('mscControlPopup');
});

document.getElementById('musicProgress').addEventListener('mousedown', function(){
    isProgressFocus = true;
});

document.getElementById('musicProgress').addEventListener('mouseup', function(){
    if (nowMusicId !== null && nowHowler){
        let fullTime = nowHowler.duration();
        let willSetTime = Math.ceil(fullTime*this.value/100);
        nowHowler.seek(willSetTime);
        document.getElementById('nowPlayTime').text = DataUtils.formatToMinuteTime(willSetTime);
    }else{
        this.value = 0;
    }
    isProgressFocus = false;
    onPlayMusic();
});

window.onload = function(){
    updateMscList();
    PageUtils.resizeFullScreen('bodyContainer');
};

window.addEventListener('resize', FuncUtils.throttle(function(){
    PageUtils.resizeFullScreen('bodyContainer');
}), 200);

document.addEventListener('click', function(event){
    /*监听文档点击事件，检查点击是否在弹窗外部*/
    ModalUtils.checkClickModalPopup(event, 'mscVolumePopup', 'mscVolumeContent');
    ModalUtils.checkClickModalPopup(event, 'mscControlPopup', 'mscControlContent');
    ModalUtils.checkClickModalPopup(event, 'cfmDelPopup', 'cfmDelContent');
    ModalUtils.checkClickModalPopup(event, 'editMscPopup', 'editMscContent');
    ModalUtils.checkClickModalPopup(event, 'collectCtrlPopup', 'collectCtrlContent');
    ModalUtils.checkClickModalPopup(event, 'addCollectPopup', 'addCollectContent');
    ModalUtils.checkClickModalPopup(event, 'cfmDelPcPopup', 'cfmDelPcContent');
    ModalUtils.checkClickModalPopup(event, 'editCollectPopup', 'editCollectContent');
    ModalUtils.checkClickModalPopup(event, 'mscAddCltPopup', 'mscAddCltContent');
});
