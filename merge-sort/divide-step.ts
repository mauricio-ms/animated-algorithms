const WINDOW_MARGIN_SIZE = 60;
const NODE_SIZE = 45;
const BETWEEN_NODE_MARGIN_SIZE = 20;

window.onload = async () => {    
    let figure = new Figure();
    figure.prepareGifGeneration();
    let values = [5, 2, 4, 5, 1, 3, 2, 6];
    let tree = generateTree(values);
    traverseTree(tree, figure);
    figure.show(100);
}

function generateTree(arr) {
    let createNode = (values, x, y) => {
        return new TreeNode({values, x, y});
    };
    let root = createNode(arr, WINDOW_MARGIN_SIZE + NODE_SIZE * arr.length, WINDOW_MARGIN_SIZE);
    let inner = function(start_idx, end_idx, currentNode) {
        if (start_idx >= end_idx) {
            return;
        }
        let middle_idx = Math.floor((start_idx + end_idx)/2);

        let middleCurrentNode = currentNode.middle();
        let xCenter = currentNode.value.x + middleCurrentNode;
        let xMargin = currentNode.value.values.length/2 * NODE_SIZE;
        currentNode.left = createNode(arr.slice(start_idx, middle_idx+1), currentNode.value.x - xMargin, currentNode.value.y + NODE_SIZE + WINDOW_MARGIN_SIZE);
        currentNode.right = createNode(arr.slice(middle_idx+1, end_idx+1), xCenter + xMargin, currentNode.value.y + NODE_SIZE + WINDOW_MARGIN_SIZE);

        inner(start_idx, middle_idx, currentNode.left);
        inner(middle_idx+1, end_idx, currentNode.right);
    };
    inner(0, arr.length - 1, root);
    return root;
}

function traverseTree(node, figure) {
    if (!node) {
        return;
    }

    figure.add(createTreeLevel(figure, node.value.values, node.value.x, node.value.y));
    if (node.left) {
        figure.add(new Edge(figure, node, node.left));
    }
    traverseTree(node.left, figure);
    if (node.right) {
        figure.add(new Edge(figure, node, node.right));
    }
    traverseTree(node.right, figure);
}

function createTreeLevel(figure, values, x, y) {
    let treeLevel = new TreeLevel(figure);
    for (let i=0; i<values.length; i++) {
        treeLevel.addNode(values[i], x, y);
        x += NODE_SIZE + BETWEEN_NODE_MARGIN_SIZE;
    }
    return treeLevel;
}

class TreeNode {
    value;
    left;
    right;

    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
    }

    middle() {
        return this.value.values.length/2 * (NODE_SIZE+BETWEEN_NODE_MARGIN_SIZE);
    }
}