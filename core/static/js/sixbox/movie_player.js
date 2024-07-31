import * as PageUtils from './util/page_utils.js';
import * as FetchUtils from './util/fetch_utils.js';
import * as ModalUtils from './util/modal_utils.js';
import * as FuncUtils from './util/func_utils.js';

const nowRoute = '/movie';
var moviePlayer = null;
var nowMovieBlob = null;
var nowPlayId = null;
var nowControlId = null;

function playMovie(){
    if(!nowPlayId){
        ModalUtils.displayFailMessage('未有选择视频');
        return;
    }
    ModalUtils.displayModal('videoContainer');
    moviePlayer = videojs('#videoContent');
    var source = document.createElement('source');

    let videoUrl = nowRoute + '/file/' + nowPlayId;
    FetchUtils.fetchBlob(videoUrl).then(blob=>{
        if (!blob){
            ModalUtils.displayFailMessage('网络问题，加载视频失败');
            return;
        }
        if (nowMovieBlob){
            URL.revokeObjectURL(nowMovieBlob);
            nowMovieBlob = null;
        }
        nowMovieBlob = URL.createObjectURL(blob);
        moviePlayer.src({
            type: 'video/mp4',
            src: nowMovieBlob
        })
        moviePlayer.load();
        moviePlayer.play();
        moviePlayer.on('dispose', function(){
            if (nowMovieBlob){
                URL.revokeObjectURL(nowMovieBlob);
                nowMovieBlob = null;
            }
        });
    })
}

function addMvListItem(data, parent){
    /*根据data添加一行*/
    let nameSpan = document.createElement('a');
    nameSpan.textContent = data.name;  // 书签名称
    nameSpan.addEventListener('click', function(){
        nowPlayId = data.id;
        playMovie();
    });

    let preIcon = document.createElement('img');  //前置图标
    preIcon.classList.add('bmIcon');
    preIcon.src = 'static/images/icons/tv.png';  //设置来源
    preIcon.alt = '视频';

    let controlIcon = document.createElement('img');  // 操作图标
    controlIcon.src = 'static/images/icons/more_vertical.png';
    controlIcon.alt = '操作';
    controlIcon.classList.add('bmIcon', 'clickable');
    controlIcon.addEventListener('click', function(event){
        nowControlId = data.id;
        ModalUtils.displayModal('mvControlPopup');
        ModalUtils.adjustPopup('mvControlContent', event.target.getBoundingClientRect());
    });

    let lineItem = document.createElement('dd');
    lineItem.classList.add('bmItem', 'clickable');
    lineItem.appendChild(preIcon);
    lineItem.appendChild(nameSpan);
    lineItem.appendChild(controlIcon);

    parent.appendChild(lineItem);
}

function updateMvList(){
    /*更新视频列表*/
    PageUtils.clearElementByStart('mvList', 1);
    let parentElement = document.getElementById('mvList');

    let searchUrl = nowRoute;
    let searchInput = document.getElementById('searchMvInput');
    if (searchInput.value!==''){
        searchUrl += '?search='+searchInput.value;
    }
    FetchUtils.fetchData(searchUrl).then(data=>{
        data.forEach(element=>{
            addMvListItem(element, parentElement);
        });
    });
}

document.getElementById('downloadMvBtn').addEventListener('click', function(){
    if(!nowControlId){
        ModalUtils.displayFailMessage('未有选择视频');
        ModalUtils.hideModal('mvControlPopup');
        return;
    }
    let videoUrl = nowRoute + '/file/' + nowControlId;
    const a = document.createElement('a');
    a.href = videoUrl;
    document.body.appendChild(a);
    a.click();
    ModalUtils.hideModal('mvControlPopup');
});

document.getElementById('uploadMvButton').addEventListener('click', function(){
    ModalUtils.displayModal('addMvPopup');
});

document.getElementById('addMvCclBtn').addEventListener('click', function(){
    ModalUtils.hideModal('addMvPopup');
    document.getElementById('addMvName').value = '';
    document.getElementById('addMvFileText').value = '';
});

document.getElementById('addMvFile').addEventListener('change', function(event){
    var file = event.target.files[0];
    if (file){
        var fileExtension = file.name.split('.').pop().toLowerCase();
        if (fileExtension !== 'mp4'){
            ModalUtils.displayFailMessage('格式错误，请选择MP4文件');
            e.target.value= '';
        }else{
            document.getElementById('addMvFileText').value = file.name;
        }
    }else{
        document.getElementById('addMvFileText').value = '';
    }
});

document.getElementById('addMvCfmBtn').addEventListener('click', function(){
    let mvFileName = document.getElementById('addMvFileText');
    if (mvFileName.value === ''){
        ModalUtils.displayFailMessage('请选择视频文件');
        return;
    }
    let mvFilePath = document.getElementById('addMvFile');
    let mvName = document.getElementById('addMvName');
    let formData = new FormData();
    formData.append('file', mvFilePath.files[0]);
    formData.append('name', mvName.value);

    let cfmBtnText = this.children[0];
    cfmBtnText.text = "上传中";

    FetchUtils.fetchWithConfig(nowRoute, {
        method: 'POST',
        body: formData
    })
    .then(data=>{
        if (data.status == 'Fail'){
            ModalUtils.displayFailMessage(data.message);  //显示错误信息弹窗
            cfmBtnText.text = "确认";
        }
        else{
            cfmBtnText.text = "确认";
            ModalUtils.displaySuccessMessage(data.message);  //显示新增成功信息弹窗
            ModalUtils.hideModal('addMvPopup');
            document.getElementById('addMvName').value = '';
            document.getElementById('addMvFileText').value = '';
            updateMvList();
        }
    });
});

document.getElementById('editMvBtn').addEventListener('click', function(){
    ModalUtils.hideModal('mvControlPopup');
    if(!nowControlId){
        ModalUtils.displayFailMessage('未有选择视频');
        return;
    }
    let detailUrl = nowRoute + '/' + nowControlId;
    FetchUtils.fetchData(detailUrl).then(data=>{
        if(data.status && data.status == 'Fail'){
            ModalUtils.displayFailMessage(data.message);
            return;
        }
        ModalUtils.displayModal('editMvPopup');
        document.getElementById('editMvName').value = data.name;
    });
});

document.getElementById('editMvCclBtn').addEventListener('click', function(){
    ModalUtils.hideModal('editMvPopup');
});

document.getElementById('editMvCfmBtn').addEventListener('click', function(){
    let editUrl = nowRoute + '/' + nowControlId;
    let mvName = document.getElementById('editMvName');
    FetchUtils.fetchWithConfig(editUrl, {
        method: 'PUT',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: mvName.value
        })
    })
    .then(data=>{
        if (data.status == 'Fail'){
            ModalUtils.displayFailMessage(data.message);  //显示错误信息弹窗
        }
        else{
            ModalUtils.displaySuccessMessage(data.message);  //显示新增成功信息弹窗
            updateMvList();  //更新当前书签列表
            ModalUtils.hideModal('editMvPopup');
        }
    });
});

document.getElementById('delMvBtn').addEventListener('click', function(){
    ModalUtils.displayModal('cfmDelPopup');
    ModalUtils.hideModal('mvControlPopup');
});

document.getElementById('cancelDelBtn').addEventListener('click', function(){
    ModalUtils.hideModal('cfmDelPopup');
});

document.getElementById('confirmDelBtn').addEventListener('click', function(){
    ModalUtils.hideModal('cfmDelPopup');
    let delUrl = nowRoute + '/' + nowControlId;
    FetchUtils.fetchWithConfig(delUrl, {
        method: 'DELETE'
    })
    .then(data=>{
        if (data.status == 'Fail'){
            ModalUtils.displayFailMessage(data.message);  //显示错误信息弹窗
        }
        else{
            ModalUtils.displaySuccessMessage(data.message);  //显示新增成功信息弹窗
            updateMvList();  //更新当前书签列表
            if (nowControlId == nowPlayId && moviePlayer){
                moviePlayer.pause();
                ModalUtils.hideElement('videoContainer');
            }
        }
    });
});

document.getElementById('searchMvButton').addEventListener('click', function(){
    updateMvList();
});

window.onload = function(){
    updateMvList();
    PageUtils.resizeFullScreen('bodyContainer');
};

document.addEventListener('click', function(event){
    /*监听文档点击事件，检查点击是否在弹窗外部*/
    ModalUtils.checkClickModalPopup(event, 'addMvPopup', 'addMvContent');
    ModalUtils.checkClickModalPopup(event, 'mvControlPopup', 'mvControlContent');
    ModalUtils.checkClickModalPopup(event, 'editMvPopup', 'editMvContent');
    ModalUtils.checkClickModalPopup(event, 'cfmDelPopup', 'cfmDelContent');
});

window.addEventListener('resize', FuncUtils.throttle(function(){
    PageUtils.resizeFullScreen('bodyContainer');
}), 200);