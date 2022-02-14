window.onload = async () => {
    let svg = new Svg();
    svg.prepareGifGeneration(740, 250);
    let figure = new Figure(svg);

    let leftArray = [2, 4, 6];
    let rightArray = [1, 3, 5];

    let rectanglesContainer = new RectanglesContainer(svg);
    rectanglesContainer.addAll(leftArray, 50, 50);
    rectanglesContainer.addAll(rightArray, 500, 50);
    figure.add(rectanglesContainer);

    let timedAnimation = new CombineStepTimedAnimationBuilder(leftArray, rightArray, rectanglesContainer).build();
    figure.setTimedAnimation(timedAnimation);

    await figure.show(100);
    await timedAnimation.show(500);
}