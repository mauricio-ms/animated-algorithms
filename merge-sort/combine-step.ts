window.onload = async () => {
    let svg = new Svg();
    svg.prepareGifGeneration(740, 250);
    let figure = new Figure(svg);
    let timedAnimation = new TimedAnimation();
    figure.setTimedAnimation(timedAnimation);

    let leftArray = [2, 4, 6];
    let rightArray = [1, 3, 5];

    let leftRectanglesContainer = RectanglesContainer.create(figure.svg, leftArray, 50, 50);
    figure.add(leftRectanglesContainer);
    let rightRectanglesContainer = RectanglesContainer.create(figure.svg, rightArray, 500, 50)
    figure.add(rightRectanglesContainer);

    await figure.show(100);

    let x = 170;
    const y = 150;
    let leftIndex = 0;
    let rightIndex = 0;
    while (leftIndex < leftArray.length || rightIndex < rightArray.length) {
        if (leftIndex === leftArray.length) {
            timedAnimation.addStep((index => () => rightRectanglesContainer.get(index).colorRectangle(GREEN))(rightIndex));
            timedAnimation.addStep(((index, x) => () => {
                rightRectanglesContainer.get(index).colorRectangle(GRAY);
                rightRectanglesContainer.get(index).move(x, y);
            })(rightIndex, x));
            
            rightIndex++;
        } else if (rightIndex === rightArray.length) {
            timedAnimation.addStep((index => () => leftRectanglesContainer.get(index).colorRectangle(GREEN))(leftIndex));
            timedAnimation.addStep(((index, x) => () => {
                leftRectanglesContainer.get(index).colorRectangle(GRAY);
                leftRectanglesContainer.get(index).move(x, y);
            })(leftIndex, x));
            
            leftIndex++;
        } else if (leftArray[leftIndex] <= rightArray[rightIndex]) {
            timedAnimation.addStep(((leftIndex, rightIndex) => () => {
                leftRectanglesContainer.get(leftIndex).colorRectangle(GREEN);
                rightRectanglesContainer.get(rightIndex).colorRectangle(RED);
            })(leftIndex, rightIndex));
            
            timedAnimation.addStep(((leftIndex, rightIndex, x) => () => {
                leftRectanglesContainer.get(leftIndex).colorRectangle(GRAY);
                rightRectanglesContainer.get(rightIndex).colorRectangle(GRAY);
                leftRectanglesContainer.get(leftIndex).move(x, y);
            })(leftIndex, rightIndex, x));

            leftIndex++;
        } else {
            timedAnimation.addStep(((leftIndex, rightIndex) => () => {
                leftRectanglesContainer.get(leftIndex).colorRectangle(RED);
                rightRectanglesContainer.get(rightIndex).colorRectangle(GREEN);
            })(leftIndex, rightIndex));

            timedAnimation.addStep(((leftIndex, rightIndex, x) => () => {
                leftRectanglesContainer.get(leftIndex).colorRectangle(GRAY);
                rightRectanglesContainer.get(rightIndex).colorRectangle(GRAY);
                rightRectanglesContainer.get(rightIndex).move(x, y);
            })(leftIndex, rightIndex, x));

            rightIndex++;
        }
        x += NODE_SIZE + BETWEEN_NODE_MARGIN_SIZE;
    }

    timedAnimation.show(500);
}