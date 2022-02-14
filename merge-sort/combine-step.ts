window.onload = async () => {
    let svg = new Svg();
    let figure = new Figure(svg);
    let leftArray = [2, 4, 6];
    let rightArray = [1, 3, 5];

    figure.add(NodesContainer.create(figure.svg, leftArray, 50, 50));
    figure.add(NodesContainer.create(figure.svg, rightArray, 1000, 50));

    figure.show(100);
}