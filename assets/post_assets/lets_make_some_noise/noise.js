var canvas;
var context;
var imageData;
var data;
var timeSinceUpdate = 0;
function Canvas(id){
    this.canvas = document.getElementById(id);
    this.context = this.canvas.getContext('2d');
    this.imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    this.data = this.imageData.data;
    this.height = this.canvas.height;
    this.width = this.canvas.width;
    this.update = function(pixels){
        if(this.canvas.width != this.width){
            console.log("regetting image data");
            this.imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
            this.data = this.imageData.data;
            this.height = this.canvas.height;
            this.width = this.canvas.width;
        }
        for (var y = 0; y < this.canvas.height; y++) {
            for (var x = 0; x < this.canvas.width; x++) {
                var index = (y * this.canvas.width + x) * 4;
                for(var channel = 0; channel < 4; channel++){
                    this.data[index + channel]  = pixels[index/4][channel];
                }
            }
        }
        this.context.putImageData(this.imageData, 0, 0);
    }
}
var canvasUtils = {
    valueToPixel: function(value){
        // red, green, blue, alpha
        return [value*255, value*255, value*255, 255];
    }
}
var noiseFunctions = {
    seed: 0,
    randomFromCoords: function(x, y){
        var h = this.seed + x*374761393 + y*668265263; // all constants are prime
        h = (h^(h >> 13))*1274126177;
        return (h^(h >> 16)) / 2147483647.0;
    },
    perlin: {
        vectors: [{x:1,y:0},{x:1,y:-1},{x:0,y:-1},{x:-1,y:-1},{x:-1,y:0},{x:-1,y:1},{x:0,y:1},{x:1,y:1}],
        pointToCell: function(x, y){
            cellX = Math.floor(x);
            cellY = Math.floor(y);
            return {x:cellX, y:cellY};
        },
        cellToVectors: function(cellX, cellY){
            halfCell = .5;
            // I use the four intercardinal directions to label the vectors.
            // The random values are multiplied by 8 to map them to the 8 entries of the vectors array.
            NEvector = this.vectors[Math.floor(noiseFunctions.randomFromCoords(cellX + halfCell, cellY + halfCell)*8)];
            SEvector = this.vectors[Math.floor(noiseFunctions.randomFromCoords(cellX + halfCell, cellY - halfCell)*8)];
            SWvector = this.vectors[Math.floor(noiseFunctions.randomFromCoords(cellX - halfCell, cellY - halfCell)*8)];
            NWvector = this.vectors[Math.floor(noiseFunctions.randomFromCoords(cellX - halfCell, cellY + halfCell)*8)];
            return {NE: NEvector, SE: SEvector, SW: SWvector, NW: NWvector};
        },
        dotProduct: function(vector1, vector2){
        // Another way to calculate the dot product. This is more performance friendly than cosine calculations.
        return vector1.x * vector2.x + vector1.y * vector2.y;
        },
        lerp: function(value1, value2, t){
            return (1 - t) * value1 + t * value2;
        },
        perlinNoise: function(x,y, fadeFunction){
            var cellCoord = noiseFunctions.perlin.pointToCell(x, y);

            // Get the positions of the x and y coordinants relative to the cell
            var Xoffset = x - cellCoord.x;
            var Yoffset = y - cellCoord.y;

            var vectors = noiseFunctions.perlin.cellToVectors(cellCoord.x, cellCoord.y);

            // The offset from each corner is calculated.
            // Then the dotproduct between the offset vector and the random vector is calculated.
            var NEoffset = {x: Xoffset - 1, y: Yoffset - 1};
            var NEdotProduct = this.dotProduct(NEoffset, vectors.NE);

            var SEoffset = {x: Xoffset - 1, y: Yoffset};
            var SEdotProduct = this.dotProduct(SEoffset, vectors.SE);
            
            var SWoffset = {x: Xoffset, y: Yoffset};
            var SWdotProduct = this.dotProduct(SWoffset, vectors.SW);

            var NWoffset = {x: Xoffset, y: Yoffset - 1};
            var NWdotProduct = this.dotProduct(NWoffset, vectors.NW);

            var Nlerp = this.lerp(NWdotProduct, NEdotProduct, fadeFunction(Xoffset));

            var Slerp = this.lerp(SWdotProduct, SEdotProduct, fadeFunction(Xoffset));

            var finalValue = this.lerp(Slerp, Nlerp, fadeFunction(Yoffset));

            return finalValue;
        }
    }
}


var constantValueDisplay = {
    valueSlider : document.getElementById('ConstantValueFillValue'),
    element : document.getElementById("ConstantValueFillDisplay"),
    canvas : new Canvas("ConstantValueFillDisplayCanvas"),
    loop : function(deltaTime){
        // An array of values between 0 and 1
        var values = []
        for (var y = 0; y < this.canvas.canvas.height; ++y) {
            for (var x = 0; x < this.canvas.canvas.width; ++x) {
                // valueSlider will give a value between 0 and 100
                values[x + y *this.canvas.canvas.width] = this.valueSlider.value / 100.0;
            }
        }

        // Converts the array to pixel values with red, green, blue, and alpha channels
        var valuesAsPixels = values.map(x => canvasUtils.valueToPixel(x));

        this.canvas.update(valuesAsPixels);
    },
    initialize : function(){},
    deinitialize : function(){}
}

var nonDeterministicWhiteNoise = {
    frequencySlider: document.getElementById('DynamicStaticUpdateFrequency'),
    canvas: new Canvas("WhiteNoiseLoopDisplayCanvas"),
    noise: function(width, height){
        var values = [];

        for (var y = 0; y < height; ++y) {
            for (var x = 0; x < width; ++x) {
                    values[x + y * width] = Math.random();
            }
        }
        return values;
    },
    element: document.getElementById("WhiteNoiseLoopDisplay"),
    loop: function(deltaTime){
        if(timeSinceUpdate > (1000 - this.frequencySlider.value)){
            whiteNoiseValues = this.noise(this.canvas.canvas.width, this.canvas.canvas.height);
            // Converts the array to pixel values with red, green, blue, and alpha channels
            var valuesAsPixels = whiteNoiseValues.map(x => canvasUtils.valueToPixel(x));
            this.canvas.update(valuesAsPixels);
            timeSinceUpdate = 0;
        }
        timeSinceUpdate = timeSinceUpdate + deltaTime;
    },
    initialize: function(){},
    deinitialize: function(){}
}

var deterministicWhiteNoise = {
    frequencySlider: document.getElementById('StaticStaticUpdateFrequency'),
    canvas: new Canvas("StaticWhiteNoiseLoopDisplayCanvas"),
    noise: function(width, height){
        var values = [];
        for (var y = 0; y < height; ++y) {
            for (var x = 0; x < width; ++x) {
                    values[x + y * width] = noiseFunctions.randomFromCoords(x,y);
            }
        }
        return values;
    },
    element: document.getElementById("StaticWhiteNoiseLoopDisplay"),
    loop: function (deltaTime){
        if(timeSinceUpdate > (1000 - this.frequencySlider.value)){
            whiteNoiseValues = this.noise(this.canvas.canvas.width, this.canvas.canvas.height);
            // Converts the array to pixel values with red, green, blue, and alpha channels
            var valuesAsPixels = whiteNoiseValues.map(x => canvasUtils.valueToPixel(x));
            this.canvas.update(valuesAsPixels);
            timeSinceUpdate = 0;
        }

        timeSinceUpdate = timeSinceUpdate + deltaTime;
    },
    initialize: function(){},
    deinitialize: function(){}
}

var deterministicWhiteNoiseWithScale = {
    scaleSlider: document.getElementById('StaticWhiteNoiseScale'),
    canvas: new Canvas("StaticWhiteNoiseScaleDisplayCanvas"),
    noise: function(width, height,scale){
        var values = [];
        for (var y = 0; y < height; ++y) {
            for (var x = 0; x < width; ++x) {
                    values[x + y * width] = noiseFunctions.randomFromCoords(Math.floor(x/scale),Math.floor(y/scale));
            }
        }
        return values;
    },
    element: document.getElementById("StaticWhiteNoiseScaleDisplay"),
    loop: function (deltaTime){
        whiteNoiseValues = this.noise(this.canvas.canvas.width, this.canvas.canvas.height, this.scaleSlider.value/50);
        // Converts the array to pixel values with red, green, blue, and alpha channels
        var valuesAsPixels = whiteNoiseValues.map(x => canvasUtils.valueToPixel(x));
        this.canvas.update(valuesAsPixels);
        timeSinceUpdate = 0;
    },
    initialize: function(){},
    deinitialize: function(){}
}

var lerpPerlinNoise = {
    canvas: new Canvas("PerlinDisplay1Canvas"),
    fade: function(t){
        return t;
    },
    noise: function(width, height){
        var values = [];
        for (var y = 0; y < height; ++y) {
            for (var x = 0; x < width; ++x) {
                    values[x + y * width] = (noiseFunctions.perlin.perlinNoise(x/30,y/30,this.fade)+1)/2;
            }
        }
        return values;
    },
    element: document.getElementById("PerlinDisplay1"),
    loop: function (){},
    initialize: function(){
        var values = this.noise(this.canvas.canvas.width, this.canvas.canvas.height);
        var valuesAsPixels = values.map(x => canvasUtils.valueToPixel(x));
        this.canvas.update(valuesAsPixels);
    },
    deinitialize: function(){}
}

var truePerlinNoise = {
    canvas: new Canvas("PerlinDisplay2Canvas"),
    fade: function(t){
        // return t;
        return t * t * t * (t * (t * 6 - 15) + 10);
    },
    noise: function(width, height){
        var values = [];
        for (var y = 0; y < height; ++y) {
            for (var x = 0; x < width; ++x) {
                    values[x + y * width] = (noiseFunctions.perlin.perlinNoise(x/30,y/30,this.fade)+1)/2;
            }
        }
        return values;
    },
    element: document.getElementById("PerlinDisplay2"),
    loop: function (){},
    initialize: function(){
        var values = this.noise(this.canvas.canvas.width, this.canvas.canvas.height);
        var valuesAsPixels = values.map(x => canvasUtils.valueToPixel(x));
        this.canvas.update(valuesAsPixels);
    },
    deinitialize: function(){}
}

var scalePerlinNoise = {
    canvas: new Canvas("ScalePerlinNoiseDisplayCanvas"),
    scaleSlider: document.getElementById('ScalePerlinNoiseSlider'),
    fade: function(t){
        // return t;
        return t * t * t * (t * (t * 6 - 15) + 10);
    },
    noise: function(width, height){
        var values = [];
        for (var y = 0; y < height; ++y) {
            for (var x = 0; x < width; ++x) {
                    values[x + y * width] = (noiseFunctions.perlin.perlinNoise(x/this.scaleSlider.value,y/this.scaleSlider.value,this.fade)+1)/2;
            }
        }
        return values;
    },
    element: document.getElementById("ScalePerlinNoiseDisplay"),
    loop: function (){
        var values = this.noise(this.canvas.canvas.width, this.canvas.canvas.height);
        var valuesAsPixels = values.map(x => canvasUtils.valueToPixel(x));
        this.canvas.update(valuesAsPixels);
    },
    initialize: function(){},
    deinitialize: function(){}
}

var fractalPerlinNoise = {
    canvas: new Canvas("FractalPerlinNoiseDisplayCanvas"),
    scaleSlider: document.getElementById('FractalPerlinNoiseScaleSlider'),
    lastScaleSliderValue: -1,
    octaveSlider: document.getElementById('FractalPerlinNoiseOctaveSlider'),
    lastOctaveSliderValue: -1,
    persistenceSlider: document.getElementById('FractalPerlinNoisePersistenceSlider'),
    lastPersistenceSliderValue: -1,
    fade: function(t){
        // return t;
        return t * t * t * (t * (t * 6 - 15) + 10);
    },
    noise: function(width, height, scale, octaves, persistence){
        var values = [];
        seed = 20;
        var maxValue = 0;
        for (var y = 0; y < height; ++y) {
            for (var x = 0; x < width; ++x) {
                var value = 0;
                // For each octave... 
                for(var n = 0; n < octaves; n++){
                    // A = p^n
                    var amplitude = Math.pow(persistence, n);
                    
                    // F = 2^n
                    var frequency = Math.pow(2, n);

                    // Add each noise value to the total value of that pixel
                    value += (noiseFunctions.perlin.perlinNoise((x/scale) * frequency, (y/scale) * frequency, this.fade) * amplitude + 1) / 2;
                    
                }
                maxValue = value > maxValue ? value : maxValue;
                values[x + y * width] = value;
            }
        }
        console.log(maxValue);
        var otherValues = values.map(x => x/maxValue);
        return otherValues;
    },
    element: document.getElementById("FractalPerlinNoiseDisplay"),
    loop: function (){
        if(this.scaleSlider.value != this.lastScaleSliderValue || 
           this.octaveSlider.value != this.lastOctaveSliderValue || 
           this.persistenceSlider.value != this.lastPersistenceSliderValue ){
            var values = this.noise(this.canvas.canvas.width, this.canvas.canvas.height, this.scaleSlider.value, this.octaveSlider.value, this.persistenceSlider.value/100);
            var valuesAsPixels = values.map(x => canvasUtils.valueToPixel(x));
            this.canvas.update(valuesAsPixels);
            this.lastScaleSliderValue = this.scaleSlider.value;
            this.lastOctaveSliderValue = this.octaveSlider.value;
            this.lastPersistenceSliderValue = this.persistenceSlider.value;
        }
    },
    initialize: function(){},
    deinitialize: function(){}
}

codeDisplays.push(constantValueDisplay);
codeDisplays.push(nonDeterministicWhiteNoise);
codeDisplays.push(deterministicWhiteNoise);
codeDisplays.push(deterministicWhiteNoiseWithScale);
codeDisplays.push(lerpPerlinNoise);
codeDisplays.push(truePerlinNoise);
codeDisplays.push(scalePerlinNoise);
codeDisplays.push(fractalPerlinNoise);