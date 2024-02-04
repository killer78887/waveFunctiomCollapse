const totalTileType = tiles.length;

let wave = Array.from({ length: totalTiles }, () => Array(totalTileType).fill(true));
let clpWave = new Array(totalTiles).fill(undefined);
let gridState = new Array(totalTiles).fill(false); //if a grid is drawn on canvas

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
    ctx.clearRect(0,0,canvas.width,canvas.height);
    wave = Array.from({ length: totalTiles }, () => Array(totalTileType).fill(true));
    clpWave = new Array(totalTiles).fill(undefined);
    gridState = new Array(totalTiles).fill(false);
    wave[startOn] = Array(totalTileType).fill(false,0,totalTileType);
    wave[startOn][Math.floor(Math.random()*totalTileType)] = true;
}
function generate(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    wave = Array.from({ length: totalTiles }, () => Array(totalTileType).fill(true));
    clpWave = new Array(totalTiles).fill(undefined);
    gridState = new Array(totalTiles).fill(false);
    wave[0] = Array(totalTileType).fill(false,0,totalTileType);
    wave[0][0] = true;
    wave[totalTiles-1] = Array(totalTileType).fill(false,0,totalTileType);
    wave[totalTiles-1][2] = true;
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

ctx.imageSmoothingEnabled = false;

function render(){
    //console.table(wave);
    collapse();
    for (var y = 0; y < grid.y; y++) {
        for (var x = 0; x < grid.x; x++) {
            let onTile = y*grid.x+x;
            if (clpWave[onTile]!==undefined & gridState[onTile]===false) {
                ctx.putImageData(tiles[clpWave[onTile]],x*tileSize,y*tileSize);
                gridState[onTile] = true;
            }
        }
    }
    requestAnimationFrame(render);
}
render();