window.onload = async () => {
    let svg = new Svg();
    svg.prepareGifGeneration(1450, 500);
    svg.setRectCreator(d => new ColorAnimatedRectangleComponent(new RectangleComponent(d)));
    let values = [5, 2, 4, 7, 9, 6, 3, 1];
    let tree = generateTree(values);
    let treeFigure = new TreeFigure(svg);
    traverseTree(tree, treeFigure);
    await treeFigure.toFigure().show(100);
}