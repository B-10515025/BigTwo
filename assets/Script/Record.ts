import CardSet from "./CardSet"
import Effect from "./Effect"

const {ccclass, property} = cc._decorator;

@ccclass
export default class Record extends cc.Component {

    @property(cc.Node)
    Timer: cc.Node;

    @property(cc.Node)
    Pass: cc.Node;

    @property(CardSet)
    Cards: CardSet;

    @property(Effect)
    Effector: Effect;

    TimeLeft: number;
    StartTime: number;

    setRecord(code: number, value: number) {
        let pos = this.node.convertToWorldSpaceAR(new cc.Vec2(0, 0)).sub(new cc.Vec2(540, 360));
        if (this.Timer.active) {
            if (code > 0 && value > 1) {
                const TYPE_NAME = ["單張", "一對", "順子", "葫蘆", "鐵支", "同花順"];
                this.Effector.showEffect(TYPE_NAME[value], pos);
            } else if (code == -1) {
                this.Effector.showEffect("DELAY", new cc.Vec2(0, 0));
            } else if (code < -1) {
                this.Effector.showEffect("PASS", pos);
            } 
        }
        this.Timer.active = code == -1;
        this.Pass.active = code == 0;
        this.Cards.node.active = code > 0;
        this.TimeLeft = value;
        this.StartTime = new Date().getTime();
        if (code > 0) {
            this.Cards.setCard(code, false);
        }
    }

    update(dt) {
        let time = this.TimeLeft + (this.StartTime - new Date().getTime()) / 1000;
        if (time < 0) {
            time = 0;
        }
        this.Timer.children[0].getComponent(cc.Label).string = (Math.floor(time) + 1).toString();
    }
}
