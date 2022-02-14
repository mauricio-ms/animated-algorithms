const WINDOW_MARGIN_SIZE = 60;
const NODE_SIZE = 50;
const BETWEEN_NODE_MARGIN_SIZE = 20;

const WHITE = "#FFFFFF";
const BLACK = "#000000";
const GRAY = "#808080";
const RED = "#ff0000";
const GREEN = "#33cc33";

class Svg {
    draw;
    gif;
    generatingGif;
    rectCreator;
    textCreator;
    
    constructor() {
        // initialize SVG.js
        this.draw = SVG().addTo("body");
        this.gif = undefined;
        this.generatingGif = false;
        this.rectCreator = d => new RectangleComponent(d);
        this.textCreator = d => new ColoredTextComponent(new TextComponent(d), WHITE);
    }

    prepareGifGeneration(width, height) {
        this.gif = new GIF({
            workers: 8,
            quality: 10,
            width: width,
            height: height,
            background: WHITE,
            transparent: null
        });
    }

    startGifGeneration() {
        if (!this.gif) {
            return;
        }

        this.generatingGif = true;
        const self = this;
        setTimeout(function run() {
            if (!self.generatingGif) {
                self._renderGif();
                return;
            }

            console.log("printing ...");
            let width = self.gif.options.width;
            let height = self.gif.options.height;
            let clonedSvgElement = self.draw.clone(true);
            let outerHTML = clonedSvgElement.node.outerHTML;
    
            let blob = new Blob([outerHTML],{type:'image/svg+xml;charset=utf-8'});
            let URL = window.URL || window.webkitURL || window;
            let blobURL = URL.createObjectURL(blob);
                
    
            let image = new Image();
            image.onload = () => {
            
                let canvas = document.createElement('canvas');
                
                canvas.width = width;
                
                canvas.height = height;
                let context = canvas.getContext('2d');
                context.fillStyle = "blue";
                // draw image in canvas starting left-0 , top - 0  
                context.drawImage(image, 0, 0, width, height );
                //  downloadImage(canvas); need to implement
    
                // let png = canvas.toDataURL(); // default png
                // console.log("png url: " + png)
    
                // gif.addFrame(image);

                // gif.addFrame(context, {copy: true});
    
                self.gif.addFrame(canvas);
    
                // download(png, "image.png");
    
            };
            image.src = blobURL;
        
            setTimeout(run, 100);
        }, 100);
    }

    stopGifGeneration() {
        this.generatingGif = false;
    }

    _renderGif() {
        this.gif.on("finished", blob => {
            console.log("finished")
            console.log(blob)
            window.open(URL.createObjectURL(blob));
        });
        this.gif.render();
    }

    setRectCreator(rectCreator) {
        this.rectCreator = rectCreator;
    }

    setTextCreator(textCreator) {
        this.textCreator = textCreator;
    }

    rect(x, y) {
        return this.rectCreator(this.draw).build(x, y);
    }

    text(v, x, y) {
        return this.textCreator(this.draw).build(v, x, y);
    }
}

class Figure {
    svg;
    components;
    timedAnimation;

    constructor(svg) {
        this.svg = svg;
        this.components = [];
        this.timedAnimation = null;
    }

    add(component) {
        this.components = this.components.concat(component);
    }

    async show(timeout=1000) {
        this.svg.startGifGeneration();
        
        for (let component of this.components) {
            await component.show(timeout);
        }

        if (!this.timedAnimation) {
            this._finalize();
        }
    }

    setTimedAnimation(timedAnimation) {
        timedAnimation.setOnEndListener(() => this._finalize());
        this.timedAnimation = timedAnimation;
    }

    _finalize() {
        setTimeout(() => {
            console.log("generating gif")
            this.svg.stopGifGeneration();
        }, 1000);
    }
}

class RectanglesContainer {
    svg;
    rectangles;

    constructor(svg) {
        this.svg = svg;
        this.rectangles = [];
    }

    static create(svg, values, x, y) {
        let rectanglesContainer = new RectanglesContainer(svg);
        for (let i=0; i<values.length; i++) {
            rectanglesContainer.add(new Rectangle(svg, values[i], x, y));
            x += NODE_SIZE + BETWEEN_NODE_MARGIN_SIZE;
        }
        return rectanglesContainer;
    }

    add(rectangle) {
        this.rectangles = this.rectangles.concat(rectangle);
    }

    get(index) {
        return this.rectangles[index];
    }

    async show(timeout) {
        for (let rectangle of this.rectangles) {
            await rectangle.show(timeout);
        }
    }
}

class Rectangle {
    svg;
    parent;
    rectCreator;
    textCreator;
    v;
    x;
    y;

    constructor(svg, v, x, y) {
        this.svg = svg;
        this.parent = svg.draw.group();
        this.rectCreator = svg.rectCreator;
        this.textCreator = svg.textCreator;
        this.v = v;
        this.x = x;
        this.y = y;
    }

    show(timeout) {
        const self = this;
        return new Promise(resolve => {
            let rectangle = self.svg.rect(self.x, self.y);
            self.parent.add(rectangle);
            self.parent.add(self.svg.text(self.v, self.x, self.y));

            setTimeout(() => resolve("Ok"), timeout);
        });
    }

    move(x, y) {
        console.log(this.parent);
        this.parent.animate({
            duration: 500,
            when: "now",
            swing: true
        }).move(x, y);
    }

    colorRectangle(color) {
        this.parent.children()[0].fill(color);
    }
}

class RectangleComponent {
    draw;

    constructor(draw) {
        this.draw = draw;
    }
    
    build(x, y) {
        return this.draw.rect(NODE_SIZE, NODE_SIZE)
            .attr({x, y})
            .fill(GRAY);
    }
}

class ColorAnimatedRectangleComponent {
    rectangleComponent;

    constructor(rectangleComponent) {
        this.rectangleComponent = rectangleComponent;
    }
    
    build(x, y) {
        let rectangle = this.rectangleComponent.build(x, y);
        rectangle.fill(BLACK);
        rectangle.animate({
            duration: 500,
            when: "now",
            swing: true
        }).fill(GRAY);
        return rectangle;
    }
}

class TextComponent {
    draw;

    constructor(draw) {
        this.draw = draw;
    }

    build(v, x, y) {
        let fontSize = 20;
        return this.draw.text(v + "")
            .font({size: fontSize, family: "monospace"})
            .attr({x: x + NODE_SIZE/2 - 5, y: y + NODE_SIZE/2 - 18});
    }
}

class ColoredTextComponent {
    textComponent;
    color;

    constructor(textComponent, color) {
        this.textComponent = textComponent;
        this.color = color;
    }

    build(v, x, y) {
        let text = this.textComponent.build(v, x, y);
        text.fill(this.color);
        return text;
    }
}

class Edge {
    svg;
    sourceNode;
    targetNode;

    constructor(svg, sourceNode, targetNode) {
        this.svg = svg;
        this.sourceNode = sourceNode;
        this.targetNode = targetNode;
    }

    show(timeout) {
        const lineConfig = {color: GRAY, width: 5, linecap: "round"};
        const self = this;
        return new Promise(resolve => {
            let middleSourceNode = self.sourceNode.middle() - (BETWEEN_NODE_MARGIN_SIZE/2);
            let x = self.sourceNode.value.x + middleSourceNode;
            let y = self.sourceNode.value.y + NODE_SIZE + 10;

            let middleTargetNode = self.targetNode.middle() - (BETWEEN_NODE_MARGIN_SIZE/2);

            self.svg.draw.line(x, y, x, y)
                .stroke(lineConfig)
                .animate(500)
                .plot([[x, y], [self.targetNode.value.x + middleTargetNode, y + WINDOW_MARGIN_SIZE - 20]]);
                
            setTimeout(() => resolve("Ok"), timeout);
        });
    }
}

class TimedAnimation {
    steps;
    onEndListener;

    constructor() {
        this.steps = [];
        this.onEndListener = undefined;
    }

    addStep(step) {
        this.steps = this.steps.concat(step);
    }

    async show(timeout=1000) {
        for (let step of this.steps) {
            await new Promise(resolve => {
                step();
                setTimeout(() => resolve("Ok"), timeout);
            });
        }

        if (this.onEndListener) {
            this.onEndListener();
        }
    }

    setOnEndListener(onEndListener) {
        this.onEndListener = onEndListener;
    }
}