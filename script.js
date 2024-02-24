const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');

const image1 = new Image();

const inputSlider = document.getElementById('resolution');
const inputLabel = document.getElementById('resolutionLabel');
inputSlider.addEventListener('change', handleSlider);

const uploadInput = document.getElementById('uploadInput');
uploadInput.addEventListener('change', handleImageUpload);

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            image1.onload = function () {
                canvas.width = image1.width;
                canvas.height = image1.height;
                ctx.drawImage(image1, 0, 0);
                handleSlider();
            };
            image1.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

class Cell {
    constructor(x, y, symbol, color){
        this.x = x;
        this.y = y;
        this.symbol = symbol;
        this.color = color;
    }
    draw(ctx){
        ctx.fillStyle = 'white';
        ctx.fillText(this.symbol, this.x + 0.5, this.y + 0.5);
        ctx.fillStyle = this.color;
        ctx.fillText(this.symbol, this.x, this.y);
    }
}

class AsciiEffect {
    #imageCellArray = [];
    #pixels = [];
    #ctx;
    #width;
    #height;
    constructor(ctx, width, height) {
        this.#ctx = ctx;
        this.#width = width;
        this.#height = height;
        this.#ctx.drawImage(image1, 0, 0, this.#width, this.#height);
        this.#pixels = this.#ctx.getImageData(0, 0, this.#width, this.#height);
    }
    #convertToSymbol(g){
        if (g > 250) return '@';
        else if (g > 240) return '*';
        else if (g > 220) return '+';
        else if (g > 200) return '#';
        else if (g > 180) return '&';
        else if (g > 160) return '%';
        else if (g > 140) return '_';
        else if (g > 120) return ':';
        else if (g > 100) return '$';
        else if (g > 80) return '/';
        else if (g > 60) return '-';
        else if (g > 40) return 'X';
        else if (g > 20) return 'W';
        else return '';
    }
    #scanImage(cellSize){
        this.#imageCellArray = [];
        for (let y=0; y < this.#pixels.height; y += cellSize) {
            for ( let x=0; x < this.#pixels.width; x += cellSize) {
                const posX = x * 4;
                const posY = y * 4;
                const pos = (posY * this.#pixels.width) + posX;

                if (this.#pixels.data[pos + 3] > 128) {
                    const red = this.#pixels.data[pos];
                    const green = this.#pixels.data[pos + 1];
                    const blue = this.#pixels.data[pos + 2];
                    const total = red + green + blue;
                    const averageColorValue = total/3;
                    const color = "rgb(" + red + "," + green + "," + blue + ")";
                    const symbol = this.#convertToSymbol(averageColorValue);
                    if (total > 200) this.#imageCellArray.push(new Cell(x, y, symbol, color ));
                }
            }
        }
    }
    #drawAscii(){
        this.#ctx.clearRect(0, 0, this.#width, this.#height);
        for (let i = 0; i < this.#imageCellArray.length; i++) {
            this.#imageCellArray[i].draw(this.#ctx);
        }
    }
    draw(cellSize){
        this.#scanImage(cellSize);
        this.#drawAscii();
    }
}
let effect;

function handleSlider() {
    if (inputSlider.value == 1) {
        inputLabel.innerHTML = 'Original image';
        ctx.drawImage(image1, 0, 0, canvas.width, canvas.height);
    } else {
        inputLabel.innerHTML = 'Resolution: ' + inputSlider.value + ' px';
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        ctx.drawImage(image1, 0, 0, canvas.width, canvas.height); // Redraw the original image
        ctx.font = parseInt(inputSlider.value) * 1.2 + 'px Verdana';
        effect = new AsciiEffect(ctx, canvas.width, canvas.height); // Update AsciiEffect with new canvas dimensions
        effect.draw(parseInt(inputSlider.value)); // Redraw the ASCII art effect
    }
}

image1.onload = function initialize() {
    canvas.width = image1.width;
    canvas.height = image1.height;
    effect = new AsciiEffect(ctx, image1.width, image1.height);
    handleSlider();
}
