export function formatToMinuteTime(seconds){
    /*秒数转成xx:xx形式的时间*/
    seconds = Math.floor(seconds);
    let minutes = Math.floor(seconds/60);
    let remainingSeconds = seconds % 60;
    let formattedMinutes = minutes.toString().padStart(2, '0');
    let formattedSeconds = remainingSeconds.toString().padStart(2, '0');
    return formattedMinutes + ":" + formattedSeconds;
}

export function genUniqueRandList(length){
    /*生成基于该长度的，随机不重复的数列*/
    if (length<1){
        return []
    }
    let array = Array.from({length}, (_, index)=>index);
    for (var i = 0; i<length;i++){
        let randIndex = Math.floor(Math.random() * length);
        let tempValue = array[i];
        array[i] = array[randIndex];
        array[randIndex] = tempValue;
    }
    return array;
}