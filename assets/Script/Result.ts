import CardSet from "./CardSet"
import Client from "./Client"

const {ccclass, property} = cc._decorator;

@ccclass
export default class Result extends cc.Component {

    @property(cc.Node)
    GameResult: cc.Node;

    @property(cc.SpriteFrame)
    Count: cc.SpriteFrame;

    @property(cc.SpriteFrame)
    Last: cc.SpriteFrame;

    @property(cc.Node)
    TotalResult: cc.Node;

    @property(cc.SpriteFrame)
    WinBG: cc.SpriteFrame;

    @property(cc.SpriteFrame)
    LoseBG: cc.SpriteFrame;

    @property(cc.Prefab)
    Player: cc.Node;

    IsEnd: boolean = false;

    start () {
        this.GameResult.active = false;
        this.TotalResult.active = false;
    }

    setGameResult(data) {
        this.GameResult.active = true;
        for (let i = 0; i < this.GameResult.children[0].children.length; i++) {
            this.GameResult.children[0].children[i].active = false;
        }
        this.GameResult.children[1].getComponent(cc.Label).string = "";
        const startX = -640, startY = 280, Height = 135;
        this.GameResult.children[1].setPosition(startX, startY - Height * data.CurrentResult.length);
        this.GameResult.children[1].getComponent(cc.Label).string = "";
        this.TotalResult.children[0].destroyAllChildren();
        this.TotalResult.children[0].removeAllChildren();
        const Width = 365;
        let offsetX = 0;
        let maxPoint = 0;
        for (let i = 0; i < data.TotalPoint.length; i++) {
            if (data.TotalPoint[i] > maxPoint) {
                maxPoint = data.TotalPoint[i];
            }
        }
        for (let i = 0; i < data.CurrentResult.length && i < this.GameResult.children[0].children.length; i++) {
            this.GameResult.children[0].children[i].active = true;
            this.GameResult.children[0].children[i].children[0].active = data.CurrentResult[i].Name == Client.nickname;
            this.GameResult.children[0].children[i].children[1].getComponent(cc.Label).string = data.CurrentResult[i].Name;
            this.GameResult.children[0].children[i].children[2].getComponent(CardSet).setCard(data.CurrentResult[i].LeftCard, false);
            if (data.CurrentResult[i].WinPoint > 0) {
                this.GameResult.children[0].children[i].children[3].getComponent(cc.Sprite).spriteFrame = this.Last;
                this.GameResult.children[0].children[i].children[3].children[0].getComponent(cc.Label).string = "";
                this.GameResult.children[0].children[i].children[4].getComponent(cc.Label).string = "+" + data.CurrentResult[i].WinPoint;
                this.GameResult.children[0].children[i].children[4].color = cc.color(157, 23, 7);
            } else {
                this.GameResult.children[0].children[i].children[3].getComponent(cc.Sprite).spriteFrame = this.Count;
                let Card = data.CurrentResult[i].LeftCard;
                let count = 0;
                while (Card > 0) {
                    count += Card % 2;
                    Card = Math.floor(Card / 2);
                }
                this.GameResult.children[0].children[i].children[3].children[0].getComponent(cc.Label).string = count.toString();
                this.GameResult.children[0].children[i].children[4].getComponent(cc.Label).string = data.CurrentResult[i].WinPoint;
                this.GameResult.children[0].children[i].children[4].color = cc.color(22, 92, 161);
            }
            let base = "";
            if (data.CurrentResult[i].BigHead) {
                base = "大頭 " + (data.BasePoint * 2).toString() + " 分";
            } else {
                base = "小頭 " + data.BasePoint.toString() + " 分";
            }
            let cardCount = "";
            if (data.CurrentResult[i].CountRate == 0) {
                cardCount = ",張數<9不翻倍"
            } else if (data.CurrentResult[i].CountRate == 1) {
                cardCount = ",張數10~12 +1倍"
            } else if (data.CurrentResult[i].CountRate == 2) {
                cardCount = ",張數13~14 +2倍"
            } else if (data.CurrentResult[i].CountRate == 3) {
                cardCount = ",張數15~16 +3倍"
            } else if (data.CurrentResult[i].CountRate == 4) {
                cardCount = ",張數17 +4倍"
            }
            let endMonster = "";
            if (data.CurrentResult[i].EndMonsterRate > 0) {
                endMonster = ",怪物結尾+" + data.CurrentResult[i].EndMonsterRate + "倍";
            }
            let handMonster = "";
            if (data.CurrentResult[i].HandMonsterRate > 0) {
                handMonster = ",怪物未出+" + data.CurrentResult[i].HandMonsterRate + "倍";
            }
            let endTwo = "";
            if (data.CurrentResult[i].EndTwoRate > 0) {
                endTwo = ",贏家2結尾+" + data.CurrentResult[i].EndTwoRate + "倍";
            }
            let handTwo = "";
            if (data.CurrentResult[i].HandTwoRate > 0) {
                handTwo = ",2未出+" + data.CurrentResult[i].HandTwoRate + "倍";
            }
            let total = 1 + data.CurrentResult[i].CountRate + data.CurrentResult[i].EndMonsterRate + data.CurrentResult[i].HandMonsterRate + data.CurrentResult[i].EndTwoRate + data.CurrentResult[i].HandTwoRate;
            if (data.CurrentResult[i].WinPoint < 0) {
                this.GameResult.children[1].getComponent(cc.Label).string = this.GameResult.children[1].getComponent(cc.Label).string + 
                data.CurrentResult[i].Name + ": " + base + " 倍數:底分1倍" + cardCount + endMonster + handMonster + endTwo + handTwo + " 共" + total + "倍 " + data.CurrentResult[i].WinPoint + "分\n";
            }

            var player = cc.instantiate(this.Player);
            if (data.TotalPoint[i] == maxPoint) {
                player.getComponent(cc.Sprite).spriteFrame = this.WinBG;
            } else {
                player.getComponent(cc.Sprite).spriteFrame = this.LoseBG;
            }
            player.children[0].getComponent(cc.Label).string = data.CurrentResult[i].Name;
            player.children[1].getComponent(cc.Label).string = 
                "贏取次數:" + data.TotalWin[i] + "\n" + 
                "單局最高:" + data.MaxPoint[i] + "\n" + 
                "獲得積分:" + data.TotalPoint[i];
            player.children[2].getComponent(cc.Label).string = data.CurrentResult[i].Name;
            if (data.TotalPoint[i] > 0) {
                player.children[2].getComponent(cc.Label).string = "+" + data.TotalPoint[i];
                player.children[2].color = cc.color(157, 23, 7);
            } else {
                player.children[2].getComponent(cc.Label).string = data.TotalPoint[i];
                player.children[2].color = cc.color(22, 92, 161);
            }
            player.parent = this.TotalResult.children[0];
            offsetX -= Width;
            this.IsEnd = data.IsEnd;
        }
        offsetX = (offsetX + Width) / 2;
        for (let i = 0; i < this.TotalResult.children[0].children.length; i++) {
            this.TotalResult.children[0].children[i].setPosition(offsetX + i * Width, 0);
        }
    }

    closeGameResult() {
        this.GameResult.active = false;
        if (this.IsEnd) {
            this.TotalResult.active = true;
        }
    }

    closeTotalResult() {
        this.TotalResult.active = false;
    }
}
