import { Action, Client, Config, Message, RankInfo, FeatureInfo, State } from "./Client"
import DropDown from "./DropDown"
import GameState from "./GameState"
import Analysis from "./Analysis"

const {ccclass, property} = cc._decorator;

@ccclass
export default class UI extends cc.Component {

    @property(cc.Label)
    playerInfoLabel: cc.Label;

    @property(cc.Node)
    loginNode: cc.Node;

    @property(cc.EditBox)
    nicknameBox: cc.EditBox;

    @property(cc.Button)
    enterButton: cc.Button;

    @property(cc.Node)
    operateNode: cc.Node;

    @property(cc.Button)
    passButton: cc.Button;

    @property(cc.Button)
    hintButton: cc.Button;

    @property(cc.Button)
    dealButton: cc.Button;

    @property(cc.Node)
    cardEvalNode: cc.Node;

    @property(cc.Node)
    cardEvalList: cc.Node;

    @property(cc.Node)
    gameEvalNode: cc.Node;

    @property(cc.Node)
    gameEvalList: cc.Node;

    @property(GameState)
    game: GameState;

    @property(cc.Button)
    infoButton: cc.Button;

    @property(cc.Node)
    infoNode: cc.Node;

    @property(cc.Button)
    infoCloseButton: cc.Button;

    @property(cc.Button)
    settingButton: cc.Button;

    @property(cc.Node)
    settingNode: cc.Node;

    @property(DropDown)
    speedDropdown: DropDown;

    @property(cc.Button)
    settingCloseButton: cc.Button;

    @property(cc.Button)
    rankButton: cc.Button;

    @property(cc.Node)
    rankNode: cc.Node;

    @property(cc.Label)
    rankNumberLabel: cc.Label;

    @property(cc.Label)
    rankNameLabel: cc.Label;

    @property(cc.Label)
    rankScoreLabel: cc.Label;

    @property(cc.Label)
    rankWinRateLabel: cc.Label;

    @property(cc.Button)
    rankCloseButton: cc.Button;

    @property(cc.Button)
    featureButton: cc.Button;

    @property(Analysis)
    analysisBoard: Analysis;

    Config: Config = {
        PlayerCount: 4,
        DoubleRate: 1,
        Rule: 0,
        BotName: ["Rule-BasedAIV2", "Rule-BasedAIV2", "Rule-BasedAIV2", "Rule-BasedAIV2"],
        BotStyle: [[0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]],
        Dealer: "Random",
        Debug: [0, 0, 0, 0],

        GameType: 0,
    };

    state: State;

    onLoad () {
        const using = [ true, false, true, true, false, true, true, true,
            true, false, false, false, false, false, false,
            false, true, false, false, false, false, false, true, true, true, true, false ];
        for (let i = 0; i < using.length; i++) {
            if (using[i]) {
                this.Config.Rule += rule(i);
            }
        }
        this.enterButton.node.on('click', () => { this.login() });
        this.passButton.node.on('click', () => { this.pass() });
        this.hintButton.node.on('click', () => { this.hint() });
        this.dealButton.node.on('click', () => { this.deal() });
        for (let i = 0; i < this.cardEvalList.children.length; i++) {
            this.cardEvalList.children[i].on('click', () => { Client.SendMessage("user.evaluate.card", i) });
        }
        for (let i = 0; i < this.gameEvalList.children.length; i++) {
            this.gameEvalList.children[i].on('click', () => { Client.SendMessage("user.evaluate.game", i) });
        }
        this.infoButton.node.on('click', () => { this.infoNode.active = true });
        this.infoCloseButton.node.on('click', () => { this.infoNode.active = false });
        this.settingButton.node.on('click', () => { this.settingNode.active = true });
        this.speedDropdown.SetNames(["慢", "普通", "快", "無延遲"]);
        this.speedDropdown.SetCurrent("快");
        this.settingCloseButton.node.on('click', () => { this.settingNode.active = false });
        this.rankButton.node.on('click', () => { Client.SendMessage("user.rank", "") });
        this.rankCloseButton.node.on('click', () => { this.rankNode.active = false });
        this.featureButton.node.on('click', () => { this.analysisBoard.Open() });
        Client.SetCallback("user.login", () => {
            this.playerInfoLabel.node.active = true;
            this.NewGame();
        });
        Client.SetCallback("user.info", (message: Message) => {
            let scoreList = JSON.parse(message.Data);
            let total = 0;
            let win = 0;
            for (let i = 0; i < scoreList.length; i++) {
                total += scoreList[i];
                if (scoreList[i] > 0) {
                    win += 1;
                }
            }
            this.playerInfoLabel.string = "玩家名稱: " + this.nicknameBox.string + "\n";
            this.playerInfoLabel.string += "總場數: " + scoreList.length + "\n";
            this.playerInfoLabel.string += "總分數: " + total + "\n";
            if (scoreList.length > 0) {
                this.playerInfoLabel.string += "勝率: " + (win / scoreList.length * 100).toFixed(2) + "%\n";
            } else {
                this.playerInfoLabel.string += "勝率: 0.00%\n";
            }
        });
        Client.SetCallback("user.evaluate.card", () => {
            this.cardEvalNode.active = false;
            this.operateNode.active = this.state.PlayingIndex === 0;
        });
        Client.SetCallback("user.evaluate.game", () => {
            this.gameEvalNode.active = false;
            this.NewGame();
        });
        Client.SetCallback("user.rank", (message: Message) => {
            this.rankNode.active = true;
            let rankList: RankInfo[] = JSON.parse(message.Data);
            for (let i = 0; i < rankList.length; i++) {
                rankList[i].total = 0;
                rankList[i].win = 0;
                for (let j = 0; j < rankList[i].ScoreList.length; j++) {
                    rankList[i].total += rankList[i].ScoreList[j];
                    if (rankList[i].ScoreList[j] > 0) {
                        rankList[i].win += 1;
                    }
                }
            }
            rankList.sort((a, b)=>{
                return b.total - a.total;
            })
            this.rankNumberLabel.string = "排名\n";
            this.rankNameLabel.string = "玩家名稱\n";
            this.rankScoreLabel.string = "總分\n";
            this.rankWinRateLabel.string = "勝率 (勝場/敗場)\n";
            for (let i = 0; i < rankList.length; i++) {
                this.rankNumberLabel.string += "#" + (i + 1) + "\n";
                this.rankNameLabel.string += rankList[i].Name + "\n";
                this.rankScoreLabel.string += rankList[i].total + "\n";
                this.rankWinRateLabel.string += (rankList[i].win / rankList[i].ScoreList.length * 100).toFixed(2) + "% (" + rankList[i].win + "/" + (rankList[i].ScoreList.length - rankList[i].win) + ")\n";
            }
        });
    }

    SetNickName() {
        this.loginNode.active = true;
    }

    login() {
        Client.SendMessage("user.login", this.nicknameBox.string);
    }

    SetState (state: State) {
        this.state = state;
        this.loginNode.active = false;
        this.operateNode.active = state.PlayingIndex == 0 && !this.cardEvalNode.active && state.PlayersResult.length == 0;
        if (state.PlayersResult.length == 0 && state.PlayingIndex > 0) {
            let time = 0;
            let name = this.speedDropdown.GetCurrent();
            if (name == "慢") {
                time = Math.random() * 3000 + 4000;
            } else if (name == "普通") {
                time = Math.random() * 2000 + 1500;
            } else if (name == "快") {
                time = Math.random() * 500 + 500;
            }
            let next = ()=>{
                if (this.cardEvalNode.active) {
                    setTimeout(next, time);
                } else {
                    Client.SendMessage("game.next", "");
                }
            }
            setTimeout(next, time);
        }
    }

    NewGame() {
        this.Config.GameType = Math.floor(Math.random() * 4) % 3;
        let mode = Number(new URL(window.location.href).searchParams.get("mode"));
        if (mode > 0 && mode < 3) {
            this.Config.GameType = mode;
        }
        Client.SendMessage("game.new", this.Config);
        this.cardEvalNode.active = true;
    }

    pass() {
        let action: Action = this.game.GetAction();
        if (!action) {
            return;
        }
        if (action.Index == 0) {
            action.Card = 0;
            Client.SendMessage("game.play", action);
        }
    }

    hint() {
        this.game.GetHint();
    }

    deal() {
        let action: Action = this.game.GetAction();
        if (!action) {
            return;
        }
        if (action.Index == 0) {
            if (action.Card > 0) {
                Client.SendMessage("game.play", action);
            }
        }
    }

    OpenGameEval() {
        this.gameEvalNode.active = true;
    }

}

function rule(index: number) {
    const pow = [   0, 1, 2, 3, 4, 5, 6, 7,
                    8, 9, 10, 11, 12, 13, 14,
                    15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 28, 29, 
                    30];
    return (1 << pow[index + 1]) - (1 << pow[index]);
}