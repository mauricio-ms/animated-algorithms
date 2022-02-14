window.onload = async () => {
    let svg = new Svg();
    let figure = new Figure(svg);
    let leftArray = [2, 4, 6];
    let rightArray = [1, 3, 5];

    let leftRectanglesContainer = RectanglesContainer.create(figure.svg, leftArray, 50, 50);
    figure.add(leftRectanglesContainer);
    let rightRectanglesContainer = RectanglesContainer.create(figure.svg, rightArray, 1000, 50)
    figure.add(rightRectanglesContainer);

    await figure.show(100);

    leftRectanglesContainer.update(0, rectangle => {
        rectangle.setRectCreator(d => new ColoredRectangleComponent(new RectangleComponent(d), "#ff0000"));
    });

    rightRectanglesContainer.update(0, rectangle => {
        rectangle.setRectCreator(d => new ColoredRectangleComponent(new RectangleComponent(d), "#00ff00"));
    });

    figure.show(100);
}