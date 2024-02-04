ctx.imageSmoothingEnabled = false;

const totalTileType = tiles.length;
const grid = { x:10,y:10};
const totalTiles = grid.x*grid.y;
const tileSize = Math.sqrt(canvas.height*canvas.width/totalTiles);

let wave = Array.from({ length: totalTiles }, () => Array(totalTileType).fill(true));
let clpWave = new Array(totalTiles).fill(undefined);

canvas.addEventListener("touchstart", handleTouchStart, false);

function handleTouchStart(event) {
    event.preventDefault();

    const touch = event.touches[0];
    const x = touch.clientX - canvas.getBoundingClientRect().left;
    const y = touch.clientY - canvas.getBoundingClientRect().top;
    const onTile = Math.floor(x/tileSize)+(grid.x*Math.floor(y/tileSize));
    console.log(onTile);
    reset(onTile);
}
function reset(startOn){
    wave = Array.from({ length: totalTiles }, () => Array(totalTileType).fill(true));
    clpWave = new Array(totalTiles).fill(undefined);
    wave[startOn] = Array(6).fill(false,0,6);
    wave[startOn][Math.floor(Math.random()*totalTileType)] = true;
}
function collapse(){
    let entropy = totalTileType;
    let temp;
    //part witch updates clpWave
    for (var i = 0; i < totalTiles; i++) {
        entropy = totalTileType;
        for (var j = 0; j < totalTileType; j++) {
            if(wave[i][j]===false){
                entropy--;
            }
            else{
                temp = j;
            }
        }
        if(entropy===1){
            clpWave[i] = temp;
        }
    }
    //updates clp based on neighbour
    for (var i = 0; i < totalTiles; i++) {
        if(clpWave[i]===undefined){
            let valid = [];    //********
            for (var j = 0; j < totalTileType; j++) {
                //look up
                if(clpWave[i-grid.x]!==undefined && i>=grid.x &&rules[j][0]!==rules[clpWave[i-grid.x]][2]){
                    wave[i][j] = false;
                }
                //look right
                if(clpWave[i+1]!==undefined && (i+1)%grid.x>0 && rules[j][1]!==rules[clpWave[i+1]][3]){
                    wave[i][j] = false;
                }
                //look down
                if(clpWave[i+grid.x]!==undefined && i<totalTiles-grid.x && rules[j][2]!==rules[clpWave[i+grid.x]][0]){
                    wave[i][j] = false;
                }
                //look left
                if(clpWave[i-1]!==undefined && i%grid.x>0 &&rules[j][3]!==rules[clpWave[i-1]][1]){
                    wave[i][j] = false;
                }
            }
            
            for (var n = 0; n < totalTileType; n++) {
                if(wave[i][n]===true){
                    valid.push(n);
                }
            }
            //picking random
            if(valid.length<totalTileType && valid.length>1){
                let pick = valid[Math.floor(Math.random() * valid.length)];
                wave[i] = Array(totalTileType).fill(false,0,totalTileType);
                wave[i][pick] = true;
            }
        }
    }
}
wave[15] = Array(6).fill(false,0,6);
wave[15][3] = true;

function render(){
    //console.table(wave);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    collapse();
    for (var y = 0; y < grid.y; y++) {
        for (var x = 0; x < grid.x; x++) {
            let onTile = y*grid.x+x;
            if (clpWave[onTile]===undefined) {
                ctx.globalAlpha = 1/(totalTileType);
                for (var a = 0; a < totalTileType; a++) {
                    if(wave[onTile][a]===true){
                        ctx.putImageData(tiles[a],x*tileSize,y*tileSize);
                    }
                }
            }
            else{
                ctx.globalAlpha = 1;
                ctx.putImageData(tiles[clpWave[onTile]],x*tileSize,y*tileSize);
            }
        }
    }
    //requestAnimationFrame(render);
}
render();