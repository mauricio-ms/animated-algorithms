window.onload = async () => {
    let svg = new Svg();
    // svg.prepareGifGeneration(1450, 500);
    svg.setRectCreator(d => new ColorAnimatedRectangleComponent(new RectangleComponent(d)));
    let figure = new Figure(svg);
    let timedAnimation = new TimedAnimation();
    figure.setTimedAnimation(timedAnimation);
    
    let values = [5, 2, 4, 5, 1, 3, 2, 6];
    let tree = generateTree(values);
    traverseTree(tree, figure);
    await figure.show(1);

    traverseTree2(tree);
}

function traverseTree2(node) {
    if (!node) {
        return;
    }

    // let nodesContainer = RectanglesContainer.create(figure.svg, node.value.values, node.value.x, node.value.y);
    if (node.left) {
        // console.log(node);
    }
    traverseTree2(node.left);
    if (node.right) {
        // figure.add(new Edge(figure.svg, node, node.right));
    }
    traverseTree2(node.right);

    if (node.left?.visited && node.right?.visited) {
        console.log(node.value);
        console.log("left=" + node.left.value.values)
        console.log("right=" + node.right.value.values)
    }

    if (!node.left && !node.right) {
        node.visited = true;
    }
}