const WINDOW_MARGIN_SIZE = 60;
const NODE_SIZE = 45;
const BETWEEN_NODE_MARGIN_SIZE = 20;

class Figure {
    draw;
    components = [];
    animating = false;
    gif = undefined;

    constructor() {
        // initialize SVG.js
        this.draw = SVG().addTo("body");
    }

    add(component) {
        this.components = this.components.concat(component);
    }

    prepareGifGeneration() {
        this.gif = new GIF({
            workers: 8,
            quality: 10,
            width: 1300,
            height: 500,
            background: "#FFFFFF",
            transparent: null
        });
    }

    async show(timeout=1000) {
        this.animating = true;
        if (this.gif) {
            this._startGifGeneration();
        }
        
        for (let component of this.components) {
            await component.show(timeout);
        }

        setTimeout(() => {
            console.log("generating gif")
            this.animating = false;
            
        }, 1000);
    }

    _startGifGeneration() {
        const self = this;
        setTimeout(function run() {
            if (!self.animating) {
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

    _renderGif() {
        this.gif.on("finished", blob => {
            console.log("finished")
            console.log(blob)
            window.open(URL.createObjectURL(blob));
        });
        this.gif.render();
    }
}

class NodesContainer {
    figure;
    parent;
    creators;

    constructor(figure) {
        this.figure = figure;
        this.parent = figure.draw.group();
        this.creators = [];
    }

    static create(figure, values, x, y) {
        let nodesContainer = new NodesContainer(figure);
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
            let nodeGroup = this.figure.draw.group();
            let rect = this.figure.draw.rect(NODE_SIZE, NODE_SIZE)
                .attr({x, y})
                .fill("#000000");
            rect.animate({
                duration: 500,
                when: "now",
                swing: true
              }).fill("#ffffff");
            // rect.fill("#000000"); // TODO 
            nodeGroup.add(rect);
            let fontSize = 14;
            nodeGroup.add(this.figure.draw.text(v + "")
                .font({size: fontSize, family: "monospace"})
                .attr({x: x + NODE_SIZE/2, y: y + NODE_SIZE/2 - fontSize/2}))
                .fill("#000000");

            this.parent.add(nodeGroup);

            return nodeGroup;
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
    figure;
    sourceNode;
    targetNode;

    constructor(figure, sourceNode, targetNode) {
        this.figure = figure;
        this.sourceNode = sourceNode;
        this.targetNode = targetNode;
    }

    show(timeout) {
        const lineConfig = {color: "#ffffff", width: 5, linecap: "round"};
        const self = this;
        return new Promise(resolve => {
            let middleSourceNode = self.sourceNode.middle() - (BETWEEN_NODE_MARGIN_SIZE/2);
            let x = self.sourceNode.value.x + middleSourceNode;
            let y = self.sourceNode.value.y + NODE_SIZE + 10;

            let middleTargetNode = self.targetNode.middle() - (BETWEEN_NODE_MARGIN_SIZE/2);

            this.figure.draw.line(x, y, x, y)
                .stroke(lineConfig)
                .animate(500)
                .plot([[x, y], [self.targetNode.value.x + middleTargetNode, y + WINDOW_MARGIN_SIZE - 20]]);
                
            setTimeout(() => resolve("Ok"), timeout);
        });
    }
}