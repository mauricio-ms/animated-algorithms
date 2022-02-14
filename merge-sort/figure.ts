const WINDOW_MARGIN_SIZE = 60;
const NODE_SIZE = 45;
const BETWEEN_NODE_MARGIN_SIZE = 20;

const WHITE = "#FFFFFF";
const BLACK = "#000000";

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

    prepareGifGeneration() {
        this.gif = new GIF({
            workers: 8,
            quality: 10,
            width: 1300,
            height: 500,
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

class RectangleComponent {
    draw;

    constructor(draw) {
        this.draw = draw;
    }
    
    build(x, y) {
        return this.draw.rect(NODE_SIZE, NODE_SIZE)
            .attr({x, y})
            .fill(BLACK);
    }
}

class AnimatedRectangleComponent {
    rectangleComponent;

    constructor(rectangleComponent) {
        this.rectangleComponent = rectangleComponent;
    }
    
    build(x, y) {
        let rectangle = this.rectangleComponent.build(x, y);
        rectangle.animate({
            duration: 500,
            when: "now",
            swing: true
        }).fill(WHITE);
        return rectangle;
    }
}

class TextComponent {
    draw;

    constructor(draw) {
        this.draw = draw;
    }

    build(v, x, y) {
        let fontSize = 14;
        return this.draw.text(v + "")
            .font({size: fontSize, family: "monospace"})
            .attr({x: x + NODE_SIZE/2, y: y + NODE_SIZE/2 - fontSize/2});
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

class Figure {
    svg;
    components;

    constructor(svg) {
        this.svg = svg;
        this.components = [];
    }

    add(component) {
        this.components = this.components.concat(component);
    }

    async show(timeout=1000) {
        this.svg.startGifGeneration();
        
        for (let component of this.components) {
            await component.show(timeout);
        }

        setTimeout(() => {
            console.log("generating gif")
            this.svg.stopGifGeneration();
        }, 1000);
    }
}

class NodesContainer {
    svg;
    parent;
    creators;

    constructor(svg) {
        this.svg = svg;
        this.parent = svg.draw.group();
        this.creators = [];
    }

    static create(svg, values, x, y) {
        let nodesContainer = new NodesContainer(svg);
        for (let i=0; i<values.length; i++) {
            nodesContainer.addNode(values[i], x, y);
            x += NODE_SIZE + BETWEEN_NODE_MARGIN_SIZE;
        }
        return nodesContainer;
    }

    addNode(v, x, y) {
        this.creators = this.creators.concat(this._nodeCreator(v, x, y));
    }

    _nodeCreator(v, x, y) {
        return () => {
            let group = this.svg.draw.group();
            group.add(this.svg.rect(x, y));
            group.add(this.svg.text(v, x, y));

            this.parent.add(group);

            return group;
        }
    }

    show(timeout) {
        const self = this;
        let nodeIdx = 0;
        return new Promise(resolve => {
            let component = self.creators[nodeIdx];
            component();
            nodeIdx++;
            if (nodeIdx < self.creators.length) {
                setTimeout(function run() {
                    let component = self.creators[nodeIdx];
                    component();
                    nodeIdx++;
                    if (nodeIdx < self.creators.length) {
                        setTimeout(run, timeout);
                    } else {
                        setTimeout(() => resolve("Ok"), timeout);
                    }
                }, timeout);
            } else {
                setTimeout(() => resolve("Ok"), timeout);
            }
        });
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
        const lineConfig = {color: WHITE, width: 5, linecap: "round"};
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