var canvas=$("canvas");
var ctx=canvas[0].getContext("2d");
var radio=$("mode");

var points=[];
var lines=[];

var selected;

var pselect=-1;
var ps1=undefined;
var ps2=undefined;
var mousex=0;
var mousey=0;

var vBox=document.getElementById("voltage");
console.log(vBox);
canvas.width=window.innerWidth;
canvas.height=window.innerHeight-200;
vBox.style.visibility="hidden";

var gnd=0;
var vcc=1;

var button_gnd=document.getElementById("gnd");
var button_vcc=document.getElementById("vcc");
var button_delete=document.getElementById("delete");
var img_gnd=document.createElement("img");
var img_vcc=document.createElement("img");
img_gnd.src="gnd.png";
img_vcc.src="vcc.png";
processUI(false);
function solve(){
    selected=undefined;
    processUI(false);
    GSolver.solve(lines,points,vcc,gnd);
    //KVL.analyze(lines,points);
}
//$('input[name=mode]:checked').change(onradio);
canvas.click(function(e){
    var rx=e.pageX-canvas.offset().left;
    var ry=e.pageY-canvas.offset().top;
    console.log(rx+","+ry);
    var mode=$('input[name=mode]:checked').val();
    console.log(mode);
    switch(mode){
        case "point":
            pselect=-1;
            addPoint(rx,ry);
            processUI(false);
            break;
        case "select":
            pselect=-1;
            select(rx,ry);
            processUI(true);
            break;
        case "line":
            addLine(rx,ry);
            processUI(false);
            break;
    }
});
function processUI(isSelect){

    if(!isSelect){
        selected=undefined;
        vBox.style.visibility="hidden";
        button_gnd.style.visibility="hidden";
        button_vcc.style.visibility="hidden";
        return;
    }
    if(selected){
        if(selected.type=="line"){
            vBox.style.visibility="visible";
            button_gnd.style.visibility="hidden";
            button_vcc.style.visibility="hidden";    
            console.log("aaa");
            vBox.value=selected.voltage;
        }else{
            vBox.style.visibility="hidden";
            button_gnd.style.visibility="visible";
            button_vcc.style.visibility="visible";
        }
    }else{
        vBox.style.visibility="hidden";
        button_gnd.style.visibility="hidden";
        button_vcc.style.visibility="hidden";
    }
}
function processUI2(isSelect){

    if(!isSelect){
        selected=undefined;
        vBox.style.visibility="hidden";
        button_gnd.style.visibility="hidden";
        button_vcc.style.visibility="hidden";
        button_delete.style.visibility="hidden";
        return;
    }
    if(selected){
        button_delete.style.visibility="visible";
        if(selected.type=="line"){
            vBox.style.visibility="visible";
            button_gnd.style.visibility="hidden";
            button_vcc.style.visibility="hidden";    
            console.log("aaa");
        }else{
            vBox.style.visibility="hidden";
            button_gnd.style.visibility="visible";
            button_vcc.style.visibility="visible";
        }
    }else{
        button_delete.style.visibility="hidden";
        vBox.style.visibility="hidden";
        button_gnd.style.visibility="hidden";
        button_vcc.style.visibility="hidden";
    }
}
canvas.mousemove(function(e){
    var rx=e.pageX-canvas.offset().left;
    var ry=e.pageY-canvas.offset().top;
    mousex=rx;
    mousey=ry;
});
var mode=$('input[name=mode]:checked').val();
setInterval(function(){
    mode=$('input[name=mode]:checked').val();
    updateradio();
    if(mode!="line")pselect=-1; 
    Render();
},30);

function deleteitem(){
    if(true||confirm("Are you sure you want to delete selected item?")){
        if(selected!=undefined){
            if(selected.type=="line"){
                var i=searchline(selected);
                lines.splice(i,1);
            }
            if(selected.type=="point"){
                var idx=searchPoint(selected.uuid);
                var ls=[];
                for(var i=0;i<lines.length;i++){
                    if(lines[i].from!=selected&&lines[i].to!=selected)ls.push(lines[i]);
                }
                lines=ls;
                if(idx>=0)
                    points.splice(idx,1);
            }
        }
    }else{

    }
}

function select(x,y){
    var md=Infinity;
    selected=undefined;
    for(var i=0;i<points.length;i++){
        var d=GetDistance(points[i].x,points[i].y,x,y);
        if(md>d-10&&d<50){
            md=d;
            selected=points[i];
        }
        //console.log(d);
    }
    for(var i=0;i<lines.length;i++){
        var ll=lines[i];
        var p=ll.from;
        var q=ll.to;
        var d=GetDistanceLine(x,y,p.x,p.y,q.x,q.y);
        if(md>d&&d<50){
            md=d;
            selected=ll;
        }
        console.log(d);
    }
    if(selected!=undefined
       &&selected.type=="line"){

    }
}
function updateradio(){
    //console.log("sa");
    if(mode=="select"){
        processUI2(true);
    }else{
        processUI2(false);
    }
    switch(mode){
        case "point":
            pselect=-1;
            break;
        case "select":
            pselect=-1;
            break;
        case "line":
            break;
    }
}

vBox.addEventListener("change",function(e){
    if(vBox.value==""||vBox.value==null){
        selected.voltage=undefined;
    }else{
        selected.voltage=Number(vBox.value);
    }
    console.log("aaa");
});

function GetDistanceLine(x,y,x1, y1, x2, y2){
    var dot1=(x-x1)*(x2-x1)+(y-y1)*(y2-y1);//(x-x1,y-y1)*(x2-x1,y2-y1)
    if(dot1<0){
        return Infinity;
    }

    var dot2=(x-x2)*(x1-x2)+(y-y2)*(y1-y2);
    if(dot2<0){
        return Infinity;
    }
    var dx=x2-x1;
    var dy=y2-y1;
    var s=dy*x-dx*y+x2*y1-y2*x1;
    s=Math.abs(s);
    var t=Math.sqrt(dx*dx+dy*dy);
    return s/t;
}
function GetDistance(x1, y1, x2, y2){
    var dx=x1-x2;
    var dy=y1-y2;
    return Math.sqrt(dx*dx+dy*dy);
}
function addPoint(x,y){
    var p=new KVL.Point();
    p.x=x;
    p.y=y;
    points.push(p);
    //console.log(p);
}


function addLine(x,y){
    var md=Infinity;
    var ss=undefined;
    for(var i=0;i<points.length;i++){
        var d=GetDistance(points[i].x,points[i].y,x,y);
        if(md>d&&d<50){
            md=d;
            ss=points[i];
        }
        console.log(d);
    }
    console.log(pselect);
    if(pselect<0)pselect=0;
    if(ss==undefined)return;
    if(pselect==0){
        ps1=ss;
        pselect++;
        return;
    }
    if(pselect==1){
        ps2=ss;
        var ll=new KVL.Line(ps1,ps2,1);
        //var ll=new KVL.Line(ps1,ps2,1);
        lines.push(ll);
        pselect=-1;
    }
}

function Render(){
    ctx.fillStyle="white";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    for(var i=0;i<points.length;i++){
        var p=points[i];
        if(i==vcc){
            ctx.drawImage(img_vcc,p.x-16,p.y-32,32,32);
        }
        if(i==gnd){
            ctx.drawImage(img_gnd,p.x-16,p.y,32,32);
        }
    }
    for(var i=0;i<points.length;i++){
        var p=points[i];
        ctx.fillStyle="rgb(0,0,0)";
        if(selected==p){
            ctx.fillStyle="rgb(255,0,0)";
        }
        ctx.beginPath();
        ctx.arc(p.x,p.y,5, 0, 2 * Math.PI);
        ctx.fill();
    }
    ctx.strokeWidth=4;
    for(var i=0;i<lines.length;i++){
        ctx.strokeStyle="rgb(100,100,100)";
        ctx.fillStyle="rgb(150,150,150)";
        if(selected==lines[i]){
            ctx.strokeStyle="rgb(255,0,0)";
            ctx.fillStyle="rgb(255,0,0)";
        }
        ctx.beginPath();
        var p1=lines[i].from;
        var p2=lines[i].to;
        ctx.moveTo(p1.x,p1.y);
        ctx.lineTo(p2.x,p2.y);
        var ax=p1.x+p2.x;
        ax*=0.5;
        var ay=p1.y+p2.y;
        ay*=0.5;
        ctx.textAlign="left";
        var voltage=lines[i].voltage;
        var nv=normalized(getVector(p2.x,p2.y,p1.x,p1.y));
        var normal=getrotatedVector(nv,Math.PI/2);
        var normal1=getrotatedVector(nv,-Math.PI/2);

        var arrow=getrotatedVector(nv,-0.3);
        var arrow1=getrotatedVector(nv,0.3);

        ctx.stroke();
        /*
        ctx.beginPath();

        ctx.moveTo(ax,ay);
        ctx.lineTo(ax+arrow.x*30,ay+arrow.y*30);
        ctx.lineTo(ax+arrow1.x*30,ay+arrow1.y*30);
        ctx.lineTo(ax,ay);
        ctx.fill();*/
        ctx.font = "32px Georgia";
        ctx.fillStyle="rgb(255,255,255)";
        if(voltage!=undefined){
            ctx.fillText(voltage+"Ω",ax+1,ay-1);
            ctx.fillText(voltage+"Ω",ax+1,ay+1);
            ctx.fillText(voltage+"Ω",ax-1,ay-1);
            ctx.fillText(voltage+"Ω",ax-1,ay+1);
        }else{
            ctx.fillText("undefined",ax+1,ay-1);
            ctx.fillText("undefined",ax+1,ay+1);
            ctx.fillText("undefined",ax-1,ay-1);
            ctx.fillText("undefined",ax-1,ay+1);
        }

        ctx.font = "30px Georgia";
        ctx.fillStyle="rgb(0,0,0)";
        if(voltage!=undefined){
            ctx.fillText(voltage+"Ω",ax,ay);
        }else{
            ctx.fillText("undefined",ax,ay);
        }

    }

    ctx.beginPath();
    if(pselect==1){
        ctx.moveTo(ps1.x,ps1.y);
        ctx.lineTo(mousex,mousey);
    }
    ctx.stroke();
}

function setvcc(){
    vcc=searchPoint(selected.uuid);
}
function setgnd(){
    gnd=searchPoint(selected.uuid);
}
function getrotatedVector(obj,angle){
    var x=obj.x;
    var y=obj.y;
    var c=Math.cos(angle);
    var s=Math.sin(angle);

    return {x:c*x-s*y,y:c*y+s*x};
}

function getVector(x1,y1,x2,y2){
    return {x:x2-x1,y:y2-y1};
}
function normalized(v){
    var l=Math.sqrt(v.x*v.x+v.y*v.y);
    return {x:v.x/l,y:v.y/l};
}


function searchline( l){
    for(var i=0;i<lines.length;i++){
        if(l==lines[i])return i;
    }
    return -1;
}

function searchPoint( uuid){
    for(var i=0;i<points.length;i++){
        if(points[i].uuid==uuid)return i;
    }
    return -1;
}