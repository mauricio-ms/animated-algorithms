class Figure {
    components = [];    

    add(component) {
        this.components = this.components.concat(component);
    }

    async show(timeout=1000) {
        for (let component of this.components) {
            await component.show(timeout);
        }

        setTimeout(() => {
            console.log("generating gif")
            end = true;
            gif.on('finished', function(blob) {
                console.log("finished")
                console.log(blob)
                window.open(URL.createObjectURL(blob));
            });
            gif.render();
        }, 1000);
    }
}

class TreeLevel {
    parent = draw.group();
    creators = [];

    addNode(v, x, y) {
        this.creators = this.creators.concat(this._nodeCreator(v, x, y));
    }

    _nodeCreator(v, x, y) {
        return () => {
            let nodeGroup = draw.group();
            let rect = draw.rect(NODE_SIZE, NODE_SIZE)
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
            nodeGroup.add(draw.text(v + "")
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