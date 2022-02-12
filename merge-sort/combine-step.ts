let draw;

const NODE_SIZE = 45;
const BETWEEN_NODE_MARGIN_SIZE = 20;

window.onload = async () => {
    // initialize SVG.js
    draw = SVG().addTo("body");

    let figure = new Figure();
    let leftArray = [2, 4, 6];
    let rightArray = [1, 3, 5];

    figure.add(createTreeLevel(leftArray, 50, 50));

    figure.add(createTreeLevel(rightArray, 1000, 50));
    
    figure.show(100);
}

function createTreeLevel(values, x, y) {
    let treeLevel = new TreeLevel();
    for (let i=0; i<values.length; i++) {
        treeLevel.addNode(values[i], x, y);
        x += NODE_SIZE + BETWEEN_NODE_MARGIN_SIZE;
    }
    return treeLevel;
}