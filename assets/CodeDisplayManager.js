function CodeDisplay(id, loop, initialize, deinitialize){
    this.element = document.getElementById(id);
    this.loop = loop;
    this.initialize = initialize;
    this.deinitialize = deinitialize;
    this.initialized = false;
}

var codeDisplays = [];

function checkVisible(elm) {
    var rect = elm.getBoundingClientRect();
    var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
    return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
}

window.onscroll = function() {
    for(var i = 0; i < codeDisplays.length; i++){
        var visible = checkVisible(codeDisplays[i].element);
        if( visible && !codeDisplays[i].initialized){
            codeDisplays[i].initialize();
            codeDisplays[i].initialized = true;
            console.log("initializing");
        }
        else if(!visible && codeDisplays[i].initialized){
            codeDisplays[i].deinitialize();
            codeDisplays[i].initialized = false;
        }
    }
};

var deltaTime;
var lastUpdate = Date.now();
function MainLoop(){
    deltaTime = Date.now() - lastUpdate;
    lastUpdate = Date.now();
    for(var i = 0; i < codeDisplays.length; i++){
        if(codeDisplays[i].initialized){
            codeDisplays[i].loop(deltaTime);
        }
    }
    requestAnimationFrame(MainLoop);
}

MainLoop();