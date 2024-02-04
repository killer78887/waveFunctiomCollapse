const checkBox = document.getElementById("checkbox");
const totalTileType = tiles.length;

let checkBoxBool = checkBox.checked;
let wave = Array.from({ length: totalTiles }, () => Array(totalTileType).fill(true));
let clpWave = new Array(totalTiles).fill(undefined);
let gridState = new Array(totalTiles).fill(false); //if a grid is drawn on canvas

let resets = 0;

checkBox.addEventListener("change",function(){checkBoxBool=checkBox.checked;render();});
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
function tileReset(tileId){ //reset specific tiles
    if(tileId>=totalTiles || tileId<0){
      return 0;
    }
    wave[tileId] = Array(totalTileType).fill(true,0,totalTileType);
    clpWave[tileId] = undefined;
    gridState[tileId] = false;
}
function collapse(){
    let entropy = totalTileType;
    let temp;
    let collapsed = false;
    let MinEntropy = { ent : totalTileType, tileNum : undefined };
    let valid = [];
    //part witch updates clpWave
    for (var i = 0; i < totalTiles; i++) {
        if(clpWave[i]===undefined){
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
                collapsed = true;
                clpWave[i] = temp;
            }
            else if(entropy===0){
                if(resets<10000){
                    const centerY = Math.floor(i/grid.x);
                    const centerX = i%grid.y;
                    const radius = (resets%5)+1;
                    for (let y = Math.max(0, centerY - radius); y <= Math.min(grid.y - 1, centerY + radius); y++) {
                        for (let x = Math.max(0, centerX - radius); x <= Math.min(grid.x - 1, centerX + radius); x++) {
                            const index = Math.floor(y) * grid.x + Math.floor(x);
                            tileReset(index);
                            //console.log(`Pixel at (${x}, ${y}): ${index}`);
                        }
                    }
                }
                else{
                    resets = 0;
                    reset(0);
                }
                resets+=1;
            }
            if(entropy<MinEntropy.ent){
                MinEntropy.ent = entropy;
                MinEntropy.tileNum = i;
            }
        }
    }
    //random picking one with min entropy
    if(collapsed===false){
        //console.log(MinEntropy);
        if(MinEntropy.tileNum===undefined){ //to prevent error when all collapsed or none are
            return 0;
        }
        //random pick
        for (var n = 0; n < totalTileType; n++) {
            if(wave[MinEntropy.tileNum][n]===true){
                valid.push(n);
            }
        }
        if(valid.length<totalTileType && valid.length>1){
            let pick = valid[Math.floor(Math.random() * valid.length)];                
            wave[MinEntropy.tileNum] = Array(totalTileType).fill(false,0,totalTileType);
            wave[MinEntropy.tileNum][pick] = true;
        }
    }
    //updates wave based on neighbour
    for (let i = 0; i < totalTiles; i++) {
        eliminate(i);
    }
}
function eliminate(i){
    if(clpWave[i]===undefined){
            for (var j = 0; j < totalTileType; j++) {
                //look up
                if(clpWave[i-grid.x]!==undefined && i>=grid.x &&rules[j][0]!==((rules[clpWave[i-grid.x]][2]).split('').reverse().join(''))){
                    wave[i][j] = false;
                }
                //look right
                if(clpWave[i+1]!==undefined && (i+1)%grid.x>0 && rules[j][1]!==((rules[clpWave[i+1]][3]).split('').reverse().join(''))){
                    wave[i][j] = false;
                }
                //look down
                if(clpWave[i+grid.x]!==undefined && i<totalTiles-grid.x && rules[j][2]!==((rules[clpWave[i+grid.x]][0]).split('').reverse().join(''))){
                    wave[i][j] = false;
                }
                //look left
                if(clpWave[i-1]!==undefined && i%grid.x>0 && rules[j][3]!==((rules[clpWave[i-1]][1]).split('').reverse().join(''))){
                    wave[i][j] = false;
                }
            }
        }
}
ctx.imageSmoothingEnabled = false;

function render(){
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
    if(checkBoxBool===true){
        requestAnimationFrame(render);
    }
}
render();