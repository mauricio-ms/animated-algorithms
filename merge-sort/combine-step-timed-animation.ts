class CombineStepTimedAnimationBuilder {
    leftArray;
    rightArray;
    rectanglesContainer;

    constructor(leftArray, rightArray, rectanglesContainer) {
        this.leftArray = leftArray;
        this.rightArray = rightArray;
        this.rectanglesContainer = rectanglesContainer;
    }

    build() {
        let timedAnimation = new TimedAnimation();

        let x = 170;
        const y = 150;
        let leftIndex = 0;
        let rightIndex = 0;
        while (leftIndex < this.leftArray.length || rightIndex < this.rightArray.length) {
            if (leftIndex === this.leftArray.length) {
                timedAnimation.addStep((index => () => this.rectanglesContainer.get(index).colorRectangle(GREEN))(rightIndex));
                timedAnimation.addStep(((index, x) => () => {
                    this.rectanglesContainer.get(index).colorRectangle(GRAY);
                    this.rectanglesContainer.get(index).move(x, y);
                })(rightIndex + this.leftArray.length, x));
                
                rightIndex++;
            } else if (rightIndex === this.rightArray.length) {
                timedAnimation.addStep((index => () => this.rectanglesContainer.get(index).colorRectangle(GREEN))(leftIndex));
                timedAnimation.addStep(((index, x) => () => {
                    this.rectanglesContainer.get(index).colorRectangle(GRAY);
                    this.rectanglesContainer.get(index).move(x, y);
                })(leftIndex, x));
                
                leftIndex++;
            } else if (this.leftArray[leftIndex] <= this.rightArray[rightIndex]) {
                timedAnimation.addStep(((leftIndex, rightIndex) => () => {
                    this.rectanglesContainer.get(leftIndex).colorRectangle(GREEN);
                    this.rectanglesContainer.get(rightIndex).colorRectangle(RED);
                })(leftIndex, rightIndex + this.leftArray.length));
                
                timedAnimation.addStep(((leftIndex, rightIndex, x) => () => {
                    this.rectanglesContainer.get(leftIndex).colorRectangle(GRAY);
                    this.rectanglesContainer.get(rightIndex).colorRectangle(GRAY);
                    this.rectanglesContainer.get(leftIndex).move(x, y);
                })(leftIndex, rightIndex + this.leftArray.length, x));

                leftIndex++;
            } else {
                timedAnimation.addStep(((leftIndex, rightIndex) => () => {
                    this.rectanglesContainer.get(leftIndex).colorRectangle(RED);
                    this.rectanglesContainer.get(rightIndex).colorRectangle(GREEN);
                })(leftIndex, rightIndex + this.leftArray.length));

                timedAnimation.addStep(((leftIndex, rightIndex, x) => () => {
                    this.rectanglesContainer.get(leftIndex).colorRectangle(GRAY);
                    this.rectanglesContainer.get(rightIndex).colorRectangle(GRAY);
                    this.rectanglesContainer.get(rightIndex).move(x, y);
                })(leftIndex, rightIndex + this.leftArray.length, x));

                rightIndex++;
            }
            x += NODE_SIZE + BETWEEN_NODE_MARGIN_SIZE;
        }

        return timedAnimation;
    }
}