function Canvas(id, normalWidth, normalHeight){
    this.element = document.getElementById(id);
    this.normalWidth = normalWidth;
    this.normalHeight = normalHeight;
    this.aspectRatio = normalWidth / normalHeight;
}

var padding = 200;
document.addEventListener("DOMContentLoaded", function(){
    var canvases = document.querySelectorAll('.canvas')
    console.log(canvases);
    for(var i = 0; i < canvases.length; i++){
        console.log(canvases[i].width);
        console.log(window.innerWidth - padding);
        if(canvases[i].width > window.innerWidth - padding){
            var aspectRatio = canvases[i].width / canvases[i].height;
            canvases[i].width = window.innerWidth - padding;
            canvases[i].height = canvases[i].width / aspectRatio;
        }
    }
});