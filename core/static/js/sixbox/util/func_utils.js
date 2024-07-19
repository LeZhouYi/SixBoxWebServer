export function throttle(func, limit){
    /*节流*/
    let inThrottle = false;  //标志位
    return function() {
        const context = this;
        const args = arguments;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => {inThrottle = false}, limit);
        }
    };
}