window.onload = async () => {
    let svg = new Svg();
    // svg.prepareGifGeneration(1450, 500);
    svg.setRectCreator(d => new ColorAnimatedRectangleComponent(new RectangleComponent(d)));
    let figure = new Figure(svg);
    let values = [5, 2, 4, 5, 1, 3, 2, 6];
    let tree = generateTree(values);
    traverseTree(tree, figure);
    figure.show(100);
}