const {ccclass, property} = cc._decorator;

@ccclass
export default class CardSet extends cc.Component {

    @property(cc.SpriteAtlas)
    cardAtlas: cc.SpriteAtlas;

    code: number;
    choose: number;

    setCard(code: number, click: boolean) {
        this.code = code;
        this.choose = 0;
        this.node.destroyAllChildren();
        this.node.removeAllChildren();
        const Width = 30, Height = 20;
        let startX = 0;
        for (let i = 0; i < 52 && code > 0; i++) {
            let name = i.toString();
            if (code % 2) {
                let card = new cc.Node(name);
                let sprite = card.addComponent(cc.Sprite);
                sprite.spriteFrame = this.cardAtlas.getSpriteFrame(name);
                card.parent = this.node;
                card.setPosition(0, 0);
                startX -= Width;
                if (click) {
                    card.addComponent(cc.Button);
                    card.on('click', (button) => {
                        button.node.setPosition(button.node.x, (button.node.y + Height) % (Height * 2));
                        let code = Math.pow(2, Number(button.node.getComponent(cc.Sprite).spriteFrame.name));
                        if (button.node.y == 0) {
                            this.choose -= code;
                        } else {
                            this.choose += code;
                        }
                    });
                }
            }
            code = Math.floor(code / 2);
        }
        const RANK = [11, 12, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        this.node.children.sort((a: cc.Node, b: cc.Node) => {
            let left = Number(a.getComponent(cc.Sprite).spriteFrame.name);
            let right = Number(b.getComponent(cc.Sprite).spriteFrame.name);
            left = RANK[left % 13] * 4 + Math.floor(left / 13);
            right = RANK[right % 13] * 4 + Math.floor(right / 13);
            return left - right;
        });
        startX = (startX + Width) / 2;
        for (let i = 0; i < this.node.children.length; i++) {
            this.node.children[i].setPosition(startX + i * Width, 0);
        }
    }

    chooseCard(code: number) {
        let arr = [];
        for (let i = 0; i < 52 && code > 0; i++) {
            if (code % 2) {
                arr.push(i);
            }
            code = Math.floor(code / 2);
        }
        this.choose = 0;
        const Height = 20;
        for (let i = 0; i < this.node.children.length; i++) {
            let index = Number(this.node.children[i].getComponent(cc.Sprite).spriteFrame.name);
            if (arr.indexOf(index) < 0) {
                this.node.children[i].setPosition(this.node.children[i].x, 0);
            } else {
                this.node.children[i].setPosition(this.node.children[i].x, Height);
                this.choose += Math.pow(2, index);
            }
        }
    }
}
