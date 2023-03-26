function setup() {
    createCanvas(400, 400);
    colNums = 10;
    rowNums = 10;
    size = min(width, height);
    colSize = size / colNums;
    rowSize = size / rowNums;
}

function draw() {
    background(220);
    for (let col = 0; col < size; col += colSize)
        for (let row = 0; row < size; row += rowSize)
            rect(col, row, colSize, rowSize)

}