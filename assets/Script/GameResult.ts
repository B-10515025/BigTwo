import CardSet from "./CardSet"
import { Result } from "./Client"
import UI from "./UI";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameResult extends cc.Component {

    // 操作介面
    @property(UI)
    ui: UI;

    // 輸入UI
    @property(cc.Button)
    closeButton: cc.Button;

    // 輸出UI
    @property(cc.Node)
    resultNode: cc.Node;

    @property(cc.SpriteFrame)
    countSprite: cc.SpriteFrame;

    @property(cc.SpriteFrame)
    lastSprite: cc.SpriteFrame;

    onLoad () {
        // 設定UI
        this.closeButton.node.on('click', () => { this.closeResult() });
    }

    ShowResult(results: Result[], useMultiply: boolean) {
        // 更新UI
        this.resultNode.active = true;
        for (let i = 0; i < this.resultNode.children[0].children.length; i++) {
            this.resultNode.children[0].children[i].active = false;
        }
        this.resultNode.children[1].getComponent(cc.Label).string = "";
        const startX = -640, startY = 280, Height = 135;
        this.resultNode.children[1].setPosition(startX, startY - Height * results.length);
        this.resultNode.children[1].getComponent(cc.Label).string = "";
        for (let i = 0; i < results.length && i < this.resultNode.children[0].children.length; i++) {
            let result = results[i];
            let card = result.Cards;
            let count = 0;
            while (card > 0) {
                count += card % 2;
                card = Math.floor(card / 2);
            }
            this.resultNode.children[0].children[i].active = true;
            this.resultNode.children[0].children[i].children[0].active = false;
            this.resultNode.children[0].children[i].children[1].getComponent(cc.Label).string = "Player " + (i + 1);
            this.resultNode.children[0].children[i].children[2].getComponent(CardSet).SetCard(result.Cards, false, false);
            if (result.WinScores > 0) {
                this.resultNode.children[0].children[i].children[3].getComponent(cc.Sprite).spriteFrame = this.lastSprite;
                this.resultNode.children[0].children[i].children[3].children[0].getComponent(cc.Label).string = "";
                this.resultNode.children[0].children[i].children[4].getComponent(cc.Label).string = "+" + result.WinScores;
                this.resultNode.children[0].children[i].children[4].color = cc.color(157, 23, 7);
            } else {
                this.resultNode.children[0].children[i].children[3].getComponent(cc.Sprite).spriteFrame = this.countSprite;
                this.resultNode.children[0].children[i].children[3].children[0].getComponent(cc.Label).string = count.toString();
                this.resultNode.children[0].children[i].children[4].getComponent(cc.Label).string = result.WinScores.toString();
                this.resultNode.children[0].children[i].children[4].color = cc.color(22, 92, 161);
            }
            if (result.PointList.length > 0) {
                let describe = "Player " + (i + 1) + ": ";
                if (result.PointList[0].Describe == "HeadBase") {
                    if (result.PointList[0].Point > 1) {
                        describe += "大頭 ";
                    } else {
                        describe += "小頭 ";
                    }
                } else {
                    describe += "單張 ";
                }
                describe += (result.PointList[0].Point).toString() + " 分 倍數:底分1倍";
                if (result.PointList[1].Point == 0) {
                    describe += ",張數<9不翻倍"
                } else {
                    if (count < 13) {
                        describe += ",張數10~12 ";
                    } else if (count < 15) {
                        describe += ",張數13~14 ";
                    } else if (count < 17) {
                        describe += ",張數15~16 ";
                    } else {
                        describe += ",張數>16 ";
                    }
                    if (useMultiply) {
                        describe += "*" + (result.PointList[1].Point + 1) + "倍";
                    } else {
                        describe += "+" + (result.PointList[1].Point) + "倍";
                    }
                }
                for (let j = 2; j < result.PointList.length; j++) {
                    switch(result.PointList[j].Describe) {
                        case "TwoHand":
                            describe += ",2未出";
                            break
                        case "TwoEnd":
                            describe += ",贏家2結尾";
                            break
                        case "MonsterHand":
                            describe += ",怪物未出";
                            break
                        case "MonsterEnd":
                            describe += ",怪物結尾";
                            break
                        case "ClubThreeEnd":
                            describe += ",梅花3結尾";
                            break
                        case "HomeRun":
                            describe += ",滿貫全壘打";
                            break
                        default:
                            describe += ",unknown rule ";
                    }
                    if (useMultiply) {
                        describe += "*" + (result.PointList[j].Point + 1) + "倍";
                    } else {
                        describe += "+" + (result.PointList[j].Point) + "倍";
                    }
                }
                if (result.IsAllPay) {
                    describe += ",放走通賠";
                }
                describe += " 共" + Math.round(result.WinScores / (-result.PointList[0].Point)) + "倍 " + result.WinScores + "分\n";
                this.resultNode.children[1].getComponent(cc.Label).string += describe;
            }
        }
    }

    closeResult() {
        this.resultNode.active = false;
        this.ui.OpenGameEval();
    }

}
