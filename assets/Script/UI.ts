import { Action, Client } from "./Client"
import GameState from "./GameState"
import Menu from "./Menu"
import Record from "./Record"
import TestResult from "./TestResult";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UI extends cc.Component {

    @property(cc.Button)
    modeButton: cc.Button;

    @property(cc.Label)
    modeLabel: cc.Label;

    @property(cc.Node)
    testNode: cc.Node;

    @property(cc.Button)
    newGameButton: cc.Button;
    
    @property(cc.Button)
    playButton: cc.Button;

    @property(cc.Button)
    passButton: cc.Button;

    @property(cc.Button)
    replayButton: cc.Button;
    
    @property(cc.Button)
    undoButton: cc.Button;

    @property(cc.Button)
    autoButton: cc.Button;

    @property(cc.Button)
    recordButton: cc.Button;

    @property(cc.Button)
    testButton: cc.Button;

    @property(cc.Button)
    botButton: cc.Button;

    @property(cc.Button)
    configButton: cc.Button;

    @property(GameState)
    game: GameState;

    @property(cc.Node)
    gameResult: cc.Node;

    @property(Record)
    record: Record;

    @property(TestResult)
    testResult: TestResult;

    @property(Menu)
    menu: Menu;

    onLoad () {
        this.modeButton.node.on('click', () => { this.switchMode() });
        this.newGameButton.node.on('click', () => { this.newGame() });
        this.playButton.node.on('click', () => { this.playCard() });
        this.passButton.node.on('click', () => { this.pass() });
        this.replayButton.node.on('click', () => { this.replayGame() });
        this.undoButton.node.on('click', () => { this.undo() });
        this.autoButton.node.on('click', () => { this.autoNext() });
        this.recordButton.node.on('click', () => { this.record.OpenRecord() });
        this.testButton.node.on('click', () => { this.testBot() });
        this.botButton.node.on('click', () => { this.menu.OpenBotMenu(); });
        this.configButton.node.on('click', () => { this.menu.OpenConfigMenu(); });
    }

    switchMode() {
        if (this.modeLabel.string == "遊玩模式") {
            this.modeLabel.string = "測試模式";
            this.testNode.active = true;
            this.game.Playing = false;
            this.game.Refresh();
        } else {
            this.modeLabel.string = "遊玩模式";
            this.testNode.active = false;
            this.game.Playing = true;
            this.game.Refresh();
        }
    }

    newGame() {
        Client.SendMessage("game.new", this.menu.Config);
    }

    playCard() {
        let action: Action = this.game.GetAction();
        if (!action) {
            return;
        }
        if (!this.game.Playing || action.Index == 0) {
            if (action.Card > 0) {
                Client.SendMessage("game.play", action);
            }
        }
    }

    pass() {
        let action: Action = this.game.GetAction();
        if (!action) {
            return;
        }
        if (!this.game.Playing || action.Index == 0) {
            action.Card = 0;
            Client.SendMessage("game.play", action);
        }
    }


    undo() {
        Client.SendMessage("game.undo", "");
    }

    autoNext() {
        Client.SendMessage("game.next", "");
    }

    replayGame() {
        this.gameResult.active = true;
    }

    testBot() {
        this.testResult.OpenResult(this.menu.Config.PlayerCount, this.menu.Config);
    }
}
