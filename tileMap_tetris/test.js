const canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
const offscreenCanvas = new OffscreenCanvas(1,1);
const offscreenContext = offscreenCanvas.getContext("2d");

const totalUniqueTiles = 5;
const imgSrc = Array.from({ length: totalUniqueTiles }, () => ({ img: new Image(), side: new Array(totalUniqueTiles) }));
let tiles = [];
let rules = [];

imgSrc[0].img.src = "/tileMap_tetris/knots/corner.png";
imgSrc[1].img.src = "/tileMap_tetris/knots/cross.png";
imgSrc[2].img.src = "/tileMap_tetris/knots/empty.png";
imgSrc[3].img.src = "/tileMap_tetris/knots/line.png";
imgSrc[4].img.src = "/tileMap_tetris/knots/t.png";
imgSrc[0].side = ['aba', 'aba', 'aaa', 'aaa'];
imgSrc[1].side = ['aba', 'aba', 'aba', 'aba'];
imgSrc[2].side = ['aaa', 'aaa', 'aaa', 'aaa'];
imgSrc[3].side = ['aaa', 'aba', 'aaa', 'aba'];
imgSrc[4].side = ['aaa', 'aba', 'aba', 'aba'];

// Promisify the canvImg function
function canvImg(file, toRotate, angle) {
    return new Promise(resolve => {
        createImageBitmap(file).then(imageBitmap => {
            offscreenCanvas.width = imageBitmap.width;
            offscreenCanvas.height = imageBitmap.height;

            // Rotate the image
            offscreenContext.translate(imageBitmap.width / 2, imageBitmap.height / 2);
            offscreenContext.rotate(angle * (Math.PI / 180));
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
}

function draw() {
    for (var i = 0; i < tiles.length; i++) {
        let toDraw = tiles[i];
        ctx.putImageData(toDraw, i * 10, 0);
        console.log("drawing");
    }
}
initializeTiles()