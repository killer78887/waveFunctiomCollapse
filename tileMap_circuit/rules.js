const canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
const offscreenCanvas = new OffscreenCanvas(1,1);
const offscreenContext = offscreenCanvas.getContext("2d");

offscreenContext.imageSmoothingEnabled = false;
const grid = { x: 40,y: 40};
const totalUniqueTiles = 14;
const totalTiles = grid.x*grid.y;
const tileSize = Math.sqrt(canvas.height*canvas.width/totalTiles);

const imgSrc = Array.from({ length: totalUniqueTiles }, () => ({ img: new Image(), side: new Array(totalUniqueTiles) }));
let tiles = [];
let rules = [];

imgSrc[0].img.src = "/tileMap_circuit/socket/bridge.png";
imgSrc[1].img.src = "/tileMap_circuit/socket/component.png";
imgSrc[2].img.src = "/tileMap_circuit/socket/connection.png";
imgSrc[3].img.src = "/tileMap_circuit/socket/corner.png";
imgSrc[4].img.src = "/tileMap_circuit/socket/dskew.png";
imgSrc[5].img.src = "/tileMap_circuit/socket/skew.png";
imgSrc[6].img.src = "/tileMap_circuit/socket/substrate.png";
imgSrc[7].img.src = "/tileMap_circuit/socket/t.png";
imgSrc[8].img.src = "/tileMap_circuit/socket/track.png";
imgSrc[9].img.src = "/tileMap_circuit/socket/transition.png";
imgSrc[10].img.src = "/tileMap_circuit/socket/turn.png";
imgSrc[11].img.src = "/tileMap_circuit/socket/viad.png";
imgSrc[12].img.src = "/tileMap_circuit/socket/vias.png";
imgSrc[13].img.src = "/tileMap_circuit/socket/wire.png";
imgSrc[0].side = ['dld', 'dgd', 'dld', 'dgd'];
imgSrc[1].side = ['bbb', 'bbb', 'bbb', 'bbb'];
imgSrc[2].side = ['dld', 'ddb', 'bbb', 'bdd'];
imgSrc[3].side = ['ddd', 'ddd', 'ddb', 'bdd']; 
imgSrc[4].side = ['dld', 'dld', 'dld', 'dld'];//doubt
imgSrc[5].side = ['dld', 'dld', 'ddd', 'ddd'];
imgSrc[6].side = ['ddd', 'ddd', 'ddd', 'ddd'];
imgSrc[7].side = ['ddd', 'dld', 'dld', 'dld'];
imgSrc[8].side = ['dld', 'ddd', 'dld', 'ddd'];
imgSrc[9].side = ['dgd', 'ddd', 'dld', 'ddd'];
imgSrc[10].side = ['dld', 'dld', 'ddd', 'ddd'];
imgSrc[11].side = ['ddd', 'dld', 'ddd', 'dld'];
imgSrc[12].side = ['dld', 'ddd', 'ddd', 'ddd'];
imgSrc[13].side = ['ddd', 'dgd', 'ddd', 'dgd'];
// Promisify the canvImg function
function canvImg(file, toRotate, angle) {
    return new Promise(resolve => {
        createImageBitmap(file).then(imageBitmap => {
            const scale = tileSize/imageBitmap.width;
            offscreenCanvas.width = imageBitmap.width*scale;
            offscreenCanvas.height = imageBitmap.height*scale;

            // Rotate the image
            offscreenContext.translate(imageBitmap.width*scale / 2, imageBitmap.height*scale / 2);
            offscreenContext.rotate(angle * (Math.PI / 180));
            offscreenContext.scale(scale,scale)
            offscreenContext.drawImage(imageBitmap, -imageBitmap.width / 2, -imageBitmap.height / 2);

            // Extract pixel data
            const imageData = offscreenContext.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);

            resolve(imageData);
        });
    });
}

// Check if rotable
async function initializeTiles() {
    for (var i = 0; i < totalUniqueTiles; i++) {
        const imageData = await canvImg(imgSrc[i].img, true, 0);
        tiles.push(imageData);
        rules.push(imgSrc[i].side.slice(0));

        let uniqueRot = 0;
        let original = imgSrc[i].side;
        let temp = original.slice(0);

        for (var j = 0; j < 4; j++) {
            // Moving element 1 forward (basically rotating)
            [temp[0], temp[1], temp[2], temp[3]] = [temp[3], temp[0], temp[1], temp[2]];

            if (temp.every((element, index) => element === original[index])) {
                break;
            } else {
                const rotatedImageData = await canvImg(imgSrc[i].img, true, 90 * (j + 1));
                tiles.push(rotatedImageData);
                rules.push(temp.slice(0));
                uniqueRot++;
            }
        }
    }
    const rotatedImageData = await canvImg(imgSrc[4].img, true, 90);
    tiles.push(rotatedImageData);
    rules.push(imgSrc[4].side.slice(0))
}

function draw() {
    for (var i = 0; i < tiles.length; i++) {
        let toDraw = tiles[i];
        ctx.putImageData(toDraw, i *10, 30);
        console.log("drawing");
    }
}
initializeTiles()


function downloadCanvasAsImage(fileName) {
    console.log("downloading");
    const dataUrl = canvas.toDataURL('image/png');
  
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = fileName;
  
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

