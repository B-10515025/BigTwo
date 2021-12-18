import { Client, Config, Message, Result, State, TestConfig } from "./Client"
import Chart from "./Chart";
import Replay from "./Replay";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TestResult extends cc.Component {

    // 輸入UI
    @property(cc.EditBox)
    countEditBox: cc.EditBox;

    @property(cc.Button)
    againButton: cc.Button;

    @property(cc.Button)
    logButton: cc.Button;

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

    // 子模組
    @property(Chart)
    chart: Chart;

    @property(Replay)
    replay: Replay;

    config: Config;
 
    IsTesting: boolean;
    updated: boolean;

    roundCount: number;
    failCount: number;
    totalWin: number[];
    totalScore: number[];
 
    onLoad () {
        //設定UI
        this.againButton.node.on('click', () => { this.testBegin() });
        this.logButton.node.on('click', () => { this.replay.Open() });
        this.closeButton.node.on('click', () => { this.resultNode.active = false });
        // 設定Client Callback
        Client.SetCallback("test.result", (message: Message) => {
            let state: State = JSON.parse(message.Data);
            this.testUpdate(state);
        });
        Client.SetCallback("test.error", () => {
            this.testError();
        });
        Client.SetCallback("test.end", () => {
            this.testEnd();
        });
    }
    
    OpenResult(PlayerCount: number, config: Config) {
        this.config = config;
        this.IsTesting = false;
        this.roundCount = 0;
        this.failCount = 0;
        this.totalWin = [];
        this.totalScore = [];
        for (let i = 0; i < PlayerCount; i++) {
            this.totalWin.push(0);
            this.totalScore.push(0);
        }
        this.chart.Reset(PlayerCount);
        this.replay.Reset();
        this.resultNode.active = true;
        // 更新UI
        this.roundLabel.string = "總場數: " + this.roundCount;
        this.failLabel.string = "錯誤場數: " + this.failCount;
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
            player.children[2].on('click', () => {
               this.chart.OpenChart(i);
            });
            player.parent = this.resultNode.children[0];
            offsetX -= Width;
        }
        offsetX = (offsetX + Width) / 2;
        for (let i = 0; i < this.resultNode.children[0].children.length; i++) {
            this.resultNode.children[0].children[i].setPosition(offsetX + i * Width, 0);
        }
    }
 
    testBegin() {
        let testConfig: TestConfig = {
            Config: this.config,
            Count: Number(this.countEditBox.string),
        }
        Client.SendMessage("test.test", testConfig);
        this.IsTesting = true;
        this.updated = false;
    }
 
    testUpdate(state: State) {
        this.IsTesting = true;
        this.updated = false;
        this.roundCount++;
        // update general data
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
            return;
        }
        // update visualization data
        this.chart.TestUpdate(state);
        // update replay
        this.replay.AddState(state);
    }

    testError() {
        this.IsTesting = true;
        this.updated = false;
        this.roundCount++;
        this.failCount++;
    }

    testEnd() {
        this.IsTesting = false;
    }
 
    update (dt) {
        if (this.updated) {
            return;
        }
        this.againButton.node.active = !this.IsTesting;
        this.logButton.node.active = !this.IsTesting;
        this.closeButton.node.active = !this.IsTesting;
        // 更新UI
        this.roundLabel.string = "總場數: " + this.roundCount;
        this.failLabel.string = "總場數: " + this.failCount;
        for (let i = 0; i < this.totalWin.length; i++) {
            this.resultNode.children[0].children[i].children[1].getComponent(cc.Label).string = 
                "總勝場:" + this.totalWin[i] + "\n" + 
                "總分數:" + this.totalScore[i];
        }
        this.updated = true;
    }

}
