window.onload = async () => {
    let figure = new Figure();
    let leftArray = [2, 4, 6];
    let rightArray = [1, 3, 5];

    figure.add(NodesContainer.create(figure, leftArray, 50, 50));
    figure.add(NodesContainer.create(figure, rightArray, 1000, 50));
    
    figure.show(100);
}