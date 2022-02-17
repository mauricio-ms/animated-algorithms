function generateTree(arr) {
    let id = 0;
    let createNode = (values, x, y) => {
        return new TreeNode(id++, {
            values: values,
            x: x,
            y: y
        });
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

function traverseTree(node, treeFigure) {
    if (!node) {
        return;
    }

    treeFigure.addNode(node);
    if (node.left) {
        treeFigure.addEdgeForNode(node, node.left);
    }
    traverseTree(node.left, treeFigure);
    if (node.right) {
        treeFigure.addEdgeForNode(node, node.right);
    }
    traverseTree(node.right, treeFigure);
}

class TreeFigure {
    figure;
    nodes;
    nodeEdges;
    nodesComponents;
    edgesComponents;

    constructor(svg) {
        this.figure = new Figure(svg);
        this.nodes = [];
        this.nodeEdges = {};
        this.nodesComponents = {};
        this.edgesComponents = {};
    }

    addNode(node) {
        this.nodes = this.nodes.concat(node);
        let rectanglesContainer = RectanglesContainer.create(this.figure.svg, node.value.values, node.value.x, node.value.y);
        this.figure.add(rectanglesContainer);
        this.nodesComponents[node.id] = rectanglesContainer;
    }

    addEdgeForNode(source, target) {
        this._putElementByNodeId(target.id, source.id, this.nodeEdges);
        let edge = new Edge(this.figure.svg, source, target);
        this.figure.add(edge);
        this.edgesComponents[target.id] = edge;
    }

    _putElementByNodeId(element, nodeId, container) {
        let elements = container[nodeId] || [];
        elements = elements.concat(element);
        container[nodeId] = elements;
    }

    getNode(nodeId) {
        return this.nodesComponents[nodeId];
    }

    removeNode(nodeId) {
        this.nodesComponents[nodeId].remove();
    }

    removeEdge(nodeId) {
        this.edgesComponents[nodeId].remove();
    }

    moveNode(nodeId, value, x, y) {
        this.nodesComponents[nodeId].getByValue(value).move(x, y);
    }

    toFigure() {
        return this.figure;
    }
}

class TreeNode {
    id;
    value;
    left;
    right;

    constructor(id, value) {
        this.id = id;
        this.value = value;
        this.left = null;
        this.right = null;
    }

    middle() {
        return this.value.values.length/2 * (NODE_SIZE+BETWEEN_NODE_MARGIN_SIZE);
    }
}