var vectorUtils = {
    distance: function(a, b){
        return Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y));
    },
    sqrDistance: function(a, b){
        return (b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y);
    }
}

var drawingUtils = {
    drawLine: function(ctx, from, to){
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
    },
    renderArmature: function(context, armature){
        this.drawLine(context, armature.root, armature.bones[0].endpoint);
        for(var i = 0; i < armature.bones.length - 1; i++){
            this.drawLine(context, armature.bones[i].endpoint, armature.bones[i + 1].endpoint)
        }
    }   
}

class Armature{
    constructor(bones, joints, root){
        this.bones = bones;
        this.joints = joints;
        this.root = root;
        this.recalculateEndpoints();
    }

    endPoint(){
        return this.bones[this.bones.length - 1].endpoint;
    }

    recalculateEndpoints(){
        var lastPosition = {x: this.root.x, y: this.root.y};
        var lastAngle = 0;
        for(var i = 0; i < this.bones.length; i++){
            this.bones[i].endpoint.x = lastPosition.x + 
                this.bones[i].length * Math.cos(lastAngle + this.joints[i].angle);

            this.bones[i].endpoint.y = lastPosition.y + 
                this.bones[i].length * Math.sin(lastAngle + this.joints[i].angle);

            lastAngle += this.joints[i].angle;
            lastPosition.x = this.bones[i].endpoint.x;
            lastPosition.y = this.bones[i].endpoint.y;
        }
    }

    applyInverseKinematics(targetPosition){
        var iterations = 0;
        while(vectorUtils.sqrDistance(this.bones[this.bones.length - 1].endpoint, targetPosition) > 0 && iterations < 10){
            this.approachTarget(targetPosition);
            iterations++;
        }
    }

    approachTarget(targetPosition){
        for(var i = this.joints.length - 1; i >= 0; i--){
            // j - e
            var jointToEndpoint = {x: 0, y: 0};
            if(i > 0){
                jointToEndpoint.x = this.bones[this.bones.length - 1].endpoint.x - this.bones[i - 1].endpoint.x;
                jointToEndpoint.y = this.bones[this.bones.length - 1].endpoint.y - this.bones[i - 1].endpoint.y;
            }
            else{
                jointToEndpoint.x = this.bones[this.bones.length - 1].endpoint.x - this.root.x;
                jointToEndpoint.y = this.bones[this.bones.length - 1].endpoint.y - this.root.y;
            }
            
            // j - t
            var jointToTarget = {x: 0, y: 0};
            if(i > 0){
                jointToTarget.x = targetPosition.x - this.bones[i - 1].endpoint.x;
                jointToTarget.y = targetPosition.y - this.bones[i - 1].endpoint.y;
            }
            else{
                jointToTarget.x = targetPosition.x - this.root.x;
                jointToTarget.y = targetPosition.y - this.root.y;
            }
            
            // (j - e) * (j - t)
            var dotProduct = jointToEndpoint.x * jointToTarget.x +
                jointToEndpoint.y * jointToTarget.y;
            
            // arccos((j - e) * (j - t))
            //this.joints[i + 1].angle = Math.acos(dotProduct);
            var angle1 = Math.atan2(jointToTarget.y, jointToTarget.x);
            var angle2 = Math.atan2(jointToEndpoint.y, jointToEndpoint.x);
            
            this.joints[i].angle += -angle2 + angle1;

            this.recalculateEndpoints();
        }
    }
}

class Bone{
    constructor(length){
        this.length = length;
        this.endpoint = {x: 0, y: 0}; 
    } 
}

class Joint{
    constructor(minAngle, maxAngle){
        this._angle = 0;
        this.minAngle = minAngle;
        this.maxAngle = maxAngle;
    }
    set angle(newAngle){
        while(newAngle > Math.PI){
            newAngle -= 2*Math.PI;
        }
        while(newAngle < -Math.PI){
             newAngle += 2*Math.PI;
        }
        if(newAngle > this.maxAngle){
            this._angle = this.maxAngle
        }
        else if(newAngle < this.minAngle){
            this._angle = this.minAngle;
        }
        else{
            this._angle = newAngle;
        }
    }

    get angle() {
        return this._angle;
    }
}

var drawingUtils = {
    drawLine: function(ctx, from, to){
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
    },
    renderArmature: function(context, armature){
        this.drawLine(context, armature.root, armature.bones[0].endpoint);
        for(var i = 0; i < armature.bones.length - 1; i++){
            this.drawLine(context, armature.bones[i].endpoint, armature.bones[i + 1].endpoint)
        }
    }

    
}

var forwardKinematicsDisplay = {
    canvas: document.getElementById("forward-kinematics-display-canvas"),
    context: document.getElementById("forward-kinematics-display-canvas").getContext('2d'),
    element: document.getElementById("forward-kinematics-display"),
    angleSliders: [
                    document.getElementById("forward-kinematics-display-joint-slider-1"),
                    document.getElementById("forward-kinematics-display-joint-slider-2"),
                    document.getElementById("forward-kinematics-display-joint-slider-3")
                ],
    armature: null,
    loop: function (){

        this.armature.joints[0].angle = (this.angleSliders[0].value / 100 * Math.PI / 2) + Math.PI *2;
        for(var i = 1; i < this.angleSliders.length; i++){
            this.armature.joints[i].angle = this.angleSliders[i].value / 100 * 2 * Math.PI;
        }

        this.context.save(); // save the default state
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.context.fillStyle = "#6bff6b";
        if(vectorUtils.distance({x:180, y:180}, this.armature.endPoint()) < 10){
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // draw the circle
        this.context.beginPath();
        this.context.arc(180, 180, 10, 0, 2 * Math.PI, false);
        this.context.fill();
        this.context.stroke();

        this.armature.recalculateEndpoints();
        drawingUtils.renderArmature(this.context, this.armature);
        this.context.restore();
    },
    initialize: function(){
        var bones = [new Bone(200), new Bone(100), new Bone(50)];
        var joints = [new Joint(-Math.PI, Math.PI), new Joint(-Math.PI, Math.PI), new Joint(-Math.PI, Math.PI)];
        var root = {x: 0, y: 0};
        this.armature = new Armature(bones, joints, root);
    },
    deinitialize: function(){}
}

var inverseKinematicsDisplay = {
    canvas: document.getElementById("inverse-kinematics-display-canvas"),
    context: document.getElementById("inverse-kinematics-display-canvas").getContext('2d'),
    element: document.getElementById("inverse-kinematics-display"),
    armature: null,
    boneSliders: [
                document.getElementById("inverse-kinematics-bone-length-slider-1"),
                document.getElementById("inverse-kinematics-bone-length-slider-2"),
                document.getElementById("inverse-kinematics-bone-length-slider-3"),
                document.getElementById("inverse-kinematics-bone-length-slider-4")
            ],
    mousePosition: {x: 100, y: 100},
    updateMousePosition: function(mouseEvent){
        var display = inverseKinematicsDisplay;

        var rect = display.canvas.getBoundingClientRect();
        

        display.mousePosition.x = mouseEvent.clientX - rect.left;
        display.mousePosition.y = mouseEvent.clientY - rect.top;
    },
    loop: function (){
        for(var i = 0; i < this.boneSliders.length; i++){
            this.armature.bones[i].length = this.boneSliders[i].value * 2;
        }

        this.armature.recalculateEndpoints();
        this.armature.applyInverseKinematics(this.mousePosition);

        this.context.save(); // save the default state
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        drawingUtils.renderArmature(this.context, this.armature);

        this.context.restore();
    },
    initialize: function(){
        var bones = [new Bone(200), new Bone(100), new Bone(50), new Bone(50)];
        var joints = [new Joint(-4*Math.PI, 4*Math.PI), new Joint(-4*Math.PI, 4*Math.PI), new Joint(-4*Math.PI, 4*Math.PI), new Joint(-4*Math.PI, 4*Math.PI)];
        var root = {x: 0, y: 0};
        this.armature = new Armature(bones, joints, root);
        this.canvas.addEventListener('mousemove', this.updateMousePosition);
    },
    deinitialize: function(){
        this.canvas.removeEventListener('mousemove', this.updateMousePosition);
    }
}
var inverseKinematicsAngleDisplay = {
    canvas: document.getElementById("inverse-kinematics-angle-display-canvas"),
    context: document.getElementById("inverse-kinematics-angle-display-canvas").getContext('2d'),
    element: document.getElementById("inverse-kinematics-angle-display"),
    armature: null,
    mousePosition: {x: 100, y: 100},
    updateMousePosition: function(mouseEvent){
        var display = inverseKinematicsAngleDisplay;

        var rect = display.canvas.getBoundingClientRect();
        

        display.mousePosition.x = mouseEvent.clientX - rect.left;
        display.mousePosition.y = mouseEvent.clientY - rect.top;
    },
    loop: function (){
        this.armature.applyInverseKinematics(this.mousePosition);

        this.context.save(); // save the default state
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        drawingUtils.renderArmature(this.context, this.armature);

        this.context.restore();
    },
    initialize: function(){
        var bones = [new Bone(50), new Bone(50), new Bone(50), new Bone(50), new Bone(50), new Bone(50), new Bone(50), new Bone(50), new Bone(50)];
        var joints = [new Joint(-Math.PI, Math.PI), new Joint(-Math.PI/4, Math.PI/4), new Joint(-Math.PI/4, Math.PI/4), new Joint(-Math.PI/4, Math.PI/4), new Joint(-Math.PI/4, Math.PI/4), new Joint(-Math.PI/4, Math.PI/4), new Joint(-Math.PI/4, Math.PI/4), new Joint(-Math.PI/4, Math.PI/4), new Joint(-Math.PI/4, Math.PI/4)];
        var root = {x: 0, y: 300};
        this.armature = new Armature(bones, joints, root);
        this.canvas.addEventListener('mousemove', this.updateMousePosition);
    },
    deinitialize: function(){
        this.canvas.removeEventListener('mousemove', this.updateMousePosition);
    }
}
codeDisplays.push(forwardKinematicsDisplay);
codeDisplays.push(inverseKinematicsDisplay);
codeDisplays.push(inverseKinematicsAngleDisplay);