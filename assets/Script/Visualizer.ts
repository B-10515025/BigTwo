const {ccclass, property} = cc._decorator;

@ccclass
export default class Visualizer extends cc.Mask {

    @property(cc.Graphics)
    graphics: cc.Graphics;

    @property(cc.Button)
    drawButton: cc.Button;

    @property(cc.Button)
    clearButton: cc.Button;

    onLoad() {
        this.drawButton.node.on('click', () => { this.draw() });
        this.clearButton.node.on('click', () => { this.clear() });
        this.clear();
    }

    clear () {
        this.graphics.clear();
        this.graphics.rect(0, 0, this.node.width, this.node.height);
        this.graphics.stroke();
    }

    draw () {
        let data: cc.Vec2[] = [];
        for (let i = 0; i < 100; i++) {
            let x = Math.random() * 5;
            let y = 1.2 + Math.sin(x)
            console.log(x, y);
            data.push(new cc.Vec2(x, y));
        }
        this.drawLineChart(4, 3, data);
    }

    drawLineChart(rangeX: number, rangeY: number, data: cc.Vec2[]) {
        if (data.length <= 0) {
            return;
        }
        data.sort((a: cc.Vec2, b:cc.Vec2): number => {
            return a.x - b.x;
        });
        this.graphics.moveTo(data[0].x / rangeX * this.node.width, data[0].y / rangeY * this.node.height);
        for (let i = 1; i < data.length; i++) {
            this.graphics.lineTo(data[i].x / rangeX * this.node.width, data[i].y / rangeY * this.node.height);
        }
        this.graphics.stroke();
    }

}

