import { Action, Client, Config, Message, State } from "./Client"
import GameState from "./GameState"

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
            this.cardEvalList.children[i].on('click', () => { Client.SendMessage("user.evaluate.card", i + 1) });
        }
        for (let i = 0; i < this.gameEvalList.children.length; i++) {
            this.gameEvalList.children[i].on('click', () => { Client.SendMessage("user.evaluate.game", i + 1) });
        }
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
        this.operateNode.active = state.PlayingIndex == 0 && !this.cardEvalNode.active;
        if (state.PlayersResult.length == 0 && state.PlayingIndex > 0) {
            let next = ()=>{
                if (this.cardEvalNode.active) {
                    setTimeout(next, 100);
                } else {
                    Client.SendMessage("game.next", "");
                }
            }
            setTimeout(next, 100);
        }
    }

    NewGame() {
        this.Config.GameType = Math.floor(Math.random() * 5);
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