import { Client, Result, State, TestConfig } from "./Client"

const {ccclass, property} = cc._decorator;

@ccclass
export default class TResult extends cc.Component {

    @property(cc.Button)
    againButton: cc.Button;

    @property(cc.Button)
    closeButton: cc.Button;

    // 輸出UI
    @property(cc.Node)
    resultNode: cc.Node;
 
    @property(cc.Prefab)
    playerPrefeb: cc.Node;

    @property(cc.Label)
    roundLabel: cc.Label;

    @property(cc.Label)
    failLabel: cc.Label;

    testConfig: TestConfig;
 
    IsTesting: boolean;
    roundCount: number;
    failCount: number;
    totalWin: number[];
    totalScore: number[];
 
    onLoad () {
        //設定UI
        this.againButton.node.on('click', () => { Client.SendMessage("test", this.testConfig); });
        this.closeButton.node.on('click', () => { this.closeResult() });
    }
 
    TestBegin(PlayerCount: number, config: TestConfig) {
        this.testConfig = config;
        this.IsTesting = true;
        this.roundCount = 0;
        this.failCount = 0;
        this.totalWin = [];
        this.totalScore = [];
        for (let i = 0; i < PlayerCount; i++) {
            this.totalWin.push(0);
            this.totalScore.push(0);
        }
        this.resultNode.active = true;
        // 更新UI
        this.roundLabel.string = "總場數: " + this.roundCount;
        this.failLabel.string = "總場數: " + this.failCount;
        this.resultNode.children[0].destroyAllChildren();
        this.resultNode.children[0].removeAllChildren();
        const Width = 365;
        let offsetX = 0;
        for (let i = 0; i < PlayerCount; i++) {
            var player = cc.instantiate(this.playerPrefeb);
            player.children[0].getComponent(cc.Label).string = "Player " + (i + 1);
            player.children[1].getComponent(cc.Label).string = 
                "總勝場:" + this.totalWin[i] + "\n" + 
                "總分數:" + this.totalScore[i];
            if (this.totalScore[i] > 0) {
                player.children[2].getComponent(cc.Label).string = "+" + this.totalScore[i];
                player.children[2].color = cc.color(157, 23, 7);
            } else {
                player.children[2].getComponent(cc.Label).string = this.totalScore[i].toString();
                player.children[2].color = cc.color(22, 92, 161);
            }
            player.parent = this.resultNode.children[0];
            offsetX -= Width;
        }
        offsetX = (offsetX + Width) / 2;
        for (let i = 0; i < this.resultNode.children[0].children.length; i++) {
            this.resultNode.children[0].children[i].setPosition(offsetX + i * Width, 0);
        }
    }
 
    TestUpdate(state: State) {
        this.IsTesting = true;
        this.roundCount++;
        if (state.PlayersResult && state.PlayersResult.length > 0) {
            for (let i = 0; i < state.PlayersResult.length; i++) {
                let result: Result = state.PlayersResult[i];
                if (result.WinScores > 0) {
                    this.totalWin[i] += 1
                }
                this.totalScore[i] += result.WinScores;
            }
        } else {
            this.failCount++;
        }
    }

    TestError() {
        this.IsTesting = true;
        this.roundCount++;
        this.failCount++;
    }

    TestEnd() {
        this.IsTesting = false;
    }
 
    update (dt) {
        this.againButton.node.active = !this.IsTesting;
        this.closeButton.node.active = !this.IsTesting;
        // 更新UI
        this.roundLabel.string = "總場數: " + this.roundCount;
        this.failLabel.string = "總場數: " + this.failCount;
        this.resultNode.children[0].destroyAllChildren();
        this.resultNode.children[0].removeAllChildren();
        const Width = 365;
        let offsetX = 0;
        for (let i = 0; i < this.totalWin.length; i++) {
            var player = cc.instantiate(this.playerPrefeb);
            player.children[0].getComponent(cc.Label).string = "Player " + (i + 1);
            player.children[1].getComponent(cc.Label).string = 
                "總勝場:" + this.totalWin[i] + "\n" + 
                "總分數:" + this.totalScore[i];
            if (this.totalScore[i] > 0) {
                player.children[2].getComponent(cc.Label).string = "+" + this.totalScore[i];
                player.children[2].color = cc.color(157, 23, 7);
            } else {
                player.children[2].getComponent(cc.Label).string = this.totalScore[i].toString();
                player.children[2].color = cc.color(22, 92, 161);
            }
            player.parent = this.resultNode.children[0];
            offsetX -= Width;
        }
        offsetX = (offsetX + Width) / 2;
        for (let i = 0; i < this.resultNode.children[0].children.length; i++) {
            this.resultNode.children[0].children[i].setPosition(offsetX + i * Width, 0);
        }
    }

    closeResult() {
        this.resultNode.active = false;
    }

}
