const {ccclass, property} = cc._decorator;

@ccclass
export default class Effect extends cc.Component {

    @property(cc.Node)
    Pass: cc.Node;

    @property(cc.Node)
    Type: cc.Node;

    @property(cc.Node)
    Delay: cc.Node;

    showEffect(name: string, pos: cc.Vec2) {
        this.node.setPosition(pos);
        if (name == "PASS") {
            this.Pass.active = true;
            this.Type.active = false;
            this.Delay.active = false;
            this.Pass.getComponent(cc.Animation).play("Pass");
        } else if (name == "DELAY") {
            this.Pass.active = false;
            this.Type.active = false;
            this.Delay.active = true;
            this.Delay.getComponent(cc.Animation).play("Message");
        } else {
            this.Pass.active = false;
            this.Type.active = true;
            this.Delay.active = false;
            this.Type.getComponent(cc.Label).string = name;
            this.Type.getComponent(cc.Animation).play("TypeEffect");
        }
    }
}
