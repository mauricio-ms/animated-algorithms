let draw;

const WINDOW_MARGIN_SIZE = 60;
const NODE_SIZE = 45;
const BETWEEN_NODE_MARGIN_SIZE = 20;

window.onload = async () => {
    // var gif = new GIF({
    //     workers: 2,
    //     quality: 10
    // });
      
    // // add an image element
    // gif.addFrame(imageElement);
    
    // // or a canvas element
    // gif.addFrame(canvasElement, {delay: 200});
    
    // // or copy the pixels from a canvas context
    // gif.addFrame(ctx, {copy: true});
    
    // gif.on('finished', function(blob) {
    //     window.open(URL.createObjectURL(blob));
    // });
    
    // gif.render();
    
    // initialize SVG.js
    draw = SVG().addTo("body");

    let figure = new Figure();
    let values = [5, 2, 4, 5, 1, 3, 2, 6];
    let tree = generateTree(values);
    traverseTree(tree, figure);
    figure.show(500);
}

function traverseTree(node, figure) {
    if (!node) {
        return;
    }

    figure.add(createTreeLevel(node.value.values, node.value.x, node.value.y));
    if (node.left) {
        figure.add(new Edge(node, node.left));
    }
    traverseTree(node.left, figure);
    if (node.right) {
        figure.add(new Edge(node, node.right));
    }
    traverseTree(node.right, figure);
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

function traverseByLevel(tree, fn) {
    let height = heightTree(tree);
    for (let i = 0; i < height; i++) {
        currentLevel(tree, i, fn(height-i));
    }
}

function heightTree(currentNode) {
    if (!currentNode) {
        return 0;
    }

    let leftHeight = heightTree(currentNode.left);
    let rightHeight = heightTree(currentNode.right);

    if (leftHeight > rightHeight) {
        return leftHeight + 1;
    }
    return rightHeight + 1;
}

function currentLevel(currentNode, level, fn) {
    if (!currentNode) {
        return;
    }

    if (level === 0) {
        fn(currentNode);
    } else {
        currentLevel(currentNode.left, level-1, fn);
        currentLevel(currentNode.right, level-1, fn);
    }
}

function createTreeLevel(values, x, y) {
    let treeLevel = new TreeLevel();
    for (let i=0; i<values.length; i++) {
        treeLevel.addNode(values[i], x, y);
        x += NODE_SIZE + BETWEEN_NODE_MARGIN_SIZE;
    }
    return treeLevel;
}

class Figure {
    components = [];    

    add(component) {
        this.components = this.components.concat(component);
    }

    async show(timeout=1000) {
        for (let component of this.components) {
            await component.show(timeout);
        }
    }
}

class TreeLevel {
    parent = draw.group();
    creators = [];

    addNode(v, x, y) {
        this.creators = this.creators.concat(this._nodeCreator(v, x, y));
    }

    _nodeCreator(v, x, y) {
        return () => {
            let nodeGroup = draw.group();
            let rect = draw.rect(NODE_SIZE, NODE_SIZE)
                .attr({x, y})
                .fill("#ffffff");
            rect.animate({
                duration: 500,
                when: "now",
                swing: true
              }).fill("#000000");
            nodeGroup.add(rect);
            let fontSize = 14;
            nodeGroup.add(draw.text(v + "")
                .font({size: fontSize, family: "monospace"})
                .attr({x: x + NODE_SIZE/2, y: y + NODE_SIZE/2 - fontSize/2}))
                .fill("#ffffff");

            this.parent.add(nodeGroup);

            return nodeGroup;
        }
    }

    show(timeout) {
        const self = this;
        let nodeIdx = 0;
        return new Promise(resolve => {
            let component = self.creators[nodeIdx];
            component();
            nodeIdx++;
            if (nodeIdx < self.creators.length) {
                setTimeout(function run() {
                    let component = self.creators[nodeIdx];
                    component();
                    nodeIdx++;
                    if (nodeIdx < self.creators.length) {
                        setTimeout(run, timeout);
                    } else {
                        setTimeout(() => resolve("Ok"), timeout);
                    }
                }, timeout);
            } else {
                setTimeout(() => resolve("Ok"), timeout);
            }
        });
    }
}

class Edge {
    sourceNode;
    targetNode;

    constructor(sourceNode, targetNode) {
        this.sourceNode = sourceNode;
        this.targetNode = targetNode;
    }

    show(timeout) {
        const lineConfig = {color: "#000000", width: 5, linecap: "round"};
        const self = this;
        return new Promise(resolve => {
            let middleSourceNode = self.sourceNode.middle() - (BETWEEN_NODE_MARGIN_SIZE/2);
            let x = self.sourceNode.value.x + middleSourceNode;
            let y = self.sourceNode.value.y + NODE_SIZE + 10;

            let middleTargetNode = self.targetNode.middle() - (BETWEEN_NODE_MARGIN_SIZE/2);

            draw.line(x, y, x, y)
                .stroke(lineConfig)
                .animate(500)
                .plot([[x, y], [self.targetNode.value.x + middleTargetNode, y + WINDOW_MARGIN_SIZE - 20]]);
                
            setTimeout(() => resolve("Ok"), timeout);
        });
    }
}