let timedAnimations = [];

window.onload = async () => {
    let svg = new Svg();
    svg.prepareGifGeneration(1450, 500);
    svg.setRectCreator(d => new ColorAnimatedRectangleComponent(new RectangleComponent(d)));
    
    // Not work with duplicated values
    let values = [5, 2, 4, 7, 9, 6, 3, 1];
    let tree = generateTree(values);
    let treeFigure = new TreeFigure(svg);
    traverseTree(tree, treeFigure);

    let mergeSortTimedAnimation = getMergeSortTimedAnimation(tree, treeFigure)
    treeFigure.figure.setTimedAnimation(mergeSortTimedAnimation);
    
    await treeFigure.toFigure().show(100);

    await mergeSortTimedAnimation.show(400);
}

function getMergeSortTimedAnimation(tree, treeFigure) {
    let leafs = getLeafs(tree);
    let timedAnimation = new TimedAnimation();

    let traverse = function _traverse(node) {
        if (!node) {
            return;
        }
    
        _traverse(node.left);
        _traverse(node.right);
            
        if (node.left && node.right) {
            let nodeContainer = treeFigure.getNode(node.id);
            node.value.values.sort();
            for (let i=0; i<node.value.values.length; i++) {
                let value = node.value.values[i];
                let nodeId = leafs.find(leaf => value === leaf.value.values[0]).id;
                let nodeToMove = nodeContainer.get(i);
                timedAnimation.addStep((index => () => {
                    treeFigure.removeNode(node.id);
                    if (index === 0) {
                        treeFigure.removeEdge(node.left.id);
                        treeFigure.removeEdge(node.right.id);
                    }
                    treeFigure.moveNode(nodeId, value, nodeToMove.x, nodeToMove.y);
                })(i));
            }
        }
    }
    traverse(tree);
    return timedAnimation;
}

function getLeafs(root) {
    let leafs = [];
    let traverse = function _traverse(node) {
        if (!node) {
            return;
        }
    
        _traverse(node.left);
        _traverse(node.right);

        if (!node.left && !node.right) {
            leafs = leafs.concat(node);
        }
    }
    traverse(root);
    return leafs;
}