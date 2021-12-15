const {ccclass, property} = cc._decorator;

@ccclass
export default class DropDown extends cc.Component {

    @property(cc.Button)
    selector: cc.Button;

    @property(cc.Node)
    select: cc.Node;

    @property(cc.Node)
    backGroundNode: cc.Node;

    @property(cc.Node)
    scrollNode: cc.Node;

    @property(cc.Node)
    viewNode: cc.Node;

    @property(cc.Node)
    contentNode: cc.Node;

    @property(cc.Node)
    barNode: cc.Node;

    onLoad () {
        this.selector.node.on('click', () => { this.onSelect(); });
    }

    onSelect () {
        this.scrollNode.active = this.backGroundNode.scaleY > 0;
        this.backGroundNode.scaleY *= -1;
    }

    SetNames (botList: string[]) {
        this.contentNode.destroyAllChildren();
        this.contentNode.removeAllChildren();
        const Height = 25;
        this.scrollNode.height = botList.length * Height;
        this.viewNode.height = botList.length * Height;
        this.contentNode.height = botList.length * Height;
        if (botList.length > 6) {
            this.scrollNode.height = 6 * Height;
            this.viewNode.height = 6 * Height;
        }
        if (botList.length <= 0) {
            this.barNode.height = 0;
            this.select.getComponent(cc.Label).string = "";
        } else {
            this.barNode.height = this.viewNode.height / this.contentNode.height * this.viewNode.height;
            if (this.select.getComponent(cc.Label).string == "") {
                this.select.getComponent(cc.Label).string = botList[0];
            }
        }
        for (let i = 0; i < botList.length; i++) {
            var bot = cc.instantiate(this.select);
            bot.setPosition(bot.x, i * -Height);
            bot.anchorY = 1;
            bot.getComponent(cc.Label).string = botList[i];
            bot.addComponent(cc.Button);
            bot.on('click', (target: cc.Node) => { 
                this.select.getComponent(cc.Label).string = target.getComponent(cc.Label).string;
                this.onSelect();
            });
            bot.parent = this.contentNode;
        }
    }

    GetCurrent(): string {
        return this.select.getComponent(cc.Label).string;
    }

}
