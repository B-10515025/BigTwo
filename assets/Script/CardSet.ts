const {ccclass, property} = cc._decorator;

@ccclass
export default class CardSet extends cc.Component {

    @property(cc.SpriteAtlas)
    cardAtlas: cc.SpriteAtlas;

    Code: number;
    Choose: number;

    SetCard(code: number, click: boolean, hidden: boolean) {
        this.Code = code;
        this.Choose = 0;
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
                if (hidden) {
                    sprite.spriteFrame = this.cardAtlas.getSpriteFrame("cardback");
                }
                card.parent = this.node;
                card.setPosition(0, 0);
                startX -= Width;
                if (click && !hidden) {
                    card.addComponent(cc.Button);
                    card.on('click', (button) => {
                        button.node.setPosition(button.node.x, (button.node.y + Height) % (Height * 2));
                        let code = Math.pow(2, Number(button.node.getComponent(cc.Sprite).spriteFrame.name));
                        if (button.node.y == 0) {
                            this.Choose -= code;
                        } else {
                            this.Choose += code;
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
    
}
