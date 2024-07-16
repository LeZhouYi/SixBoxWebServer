/*six box 基础Js文件示例*/

/*导入通用的方法*/
import * as BaseUtils from './base_utils.js';

window.onload = function(){
    /*初始加载要调整尺寸以适应APP*/
    BaseUtils.resizeFullScreen('elementId');  // default: bodyContainer
    /*初始设置可以获取聚焦的元素*/
    BaseUtils.setFocusClick('elementId');
};

document.addEventListener('keydown', function(event){
    /*监听Esc并退出弹窗*/
    BaseUtils.escCloseModal(event, 'elementPopId');
});

document.addEventListener('click', function(event){
    /*监听文档点击事件，检查点击是否在弹窗外部*/
    BaseUtils.checkClickModalPopup(event, 'elementPopId', 'elementPopContent');
});

window.addEventListener('resize', BaseUtils.throttle(function(){
    /*监听尺寸变化并调整尺寸，以适应移动端*/
    BaseUtils.resizeFullScreen('elementId');  // default: bodyContainer
}), 200);