var GSolver={solve:function(lines,points,vccidx,gndidx){//graph sover
    var lines1=[].concat(lines);
    var currentSource=new KVL.Line(points[gndidx],points[vccidx],Infinity);
    currentSource.current=1;//1A
    lines1.push(currentSource);
    
    var A_Arr=[];
    var Y_Arr=[];
    var J_Arr=[];
    var idxArr=[];
    var tmpindex=0;
    //lines1[0].current=1;
    for(var i=0;i<points.length;i++){
        var arr=[];
        idxArr.push(tmpindex);
        if(i==gndidx)continue;
        tmpindex++;
        for(var j=0;j<lines1.length;j++){
            if(lines1[j].from== points[i]){
                arr.push(-1);
            }else if(lines1[j].to== points[i]){
                arr.push(1);
            }else{
                arr.push(0);
            }
        }
        A_Arr.push(arr);
    }
    for(var i=0;i<lines1.length;i++){
        var arr=[];
        for(var j=0;j<lines1.length;j++){
            if(i!=j){
                arr.push(0);
            }else{
                if(lines1[i].voltage==0){
                    alert("only non-zero resistance is allowed!");
                    return;
                }
                arr.push(1/lines1[i].voltage);//is actually 1/R
            }
        }
        Y_Arr.push(arr);
        J_Arr.push([lines1[i].current]);
    }
    
    console.log(A_Arr);
    console.log(Y_Arr);
    console.log(J_Arr);
    
    var mat_A=math.matrix(A_Arr);
    var mat_At=math.transpose(mat_A);
    var mat_J=math.matrix(J_Arr);
    var mat_Y=math.matrix(Y_Arr);
    //A*Y*At*Vn=-A*J  ayat=A*Y*At
    //Vn=ayat-1*-A*J
    /*
    console.log(math.det(mat_A));
    console.log(math.det(mat_At));
    console.log(math.det(mat_Y));*/
    var mat_AYAt=math.multiply(mat_A,mat_Y);
    mat_AYAt=math.multiply(mat_AYAt,mat_At);
    console.log(mat_AYAt);
    console.log(math.det(mat_AYAt));
    var mat_inv=math.inv(mat_AYAt);
    var mat_aj=math.multiply(mat_A,mat_J);
    var res=math.multiply(mat_inv,mat_aj);
    console.log(res);
    console.log("voltage:"+res._data[idxArr[vccidx]]);
    console.log("resisitance:"+(res._data[idxArr[vccidx]]));
    alert("Resistance:"+res._data[idxArr[vccidx]]+"Ω");
    //var CMat=math.zeros(lines.length,points.length);
}};