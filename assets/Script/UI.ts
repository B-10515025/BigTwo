import { Client, Message, State, TestConfig } from "./Client"
import GameState from "./GameState"
import Menu from "./Menu"
import TestResult from "./TestResult";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UI extends cc.Component {

    @property(cc.Button)
    newGameButton: cc.Button;
    
    @property(cc.Button)
    playButton: cc.Button;

    @property(cc.Button)
    autoButton: cc.Button;

    @property(cc.Button)
    testButton: cc.Button;

    @property(cc.EditBox)
    countEditBox: cc.EditBox;

    @property(cc.Button)
    botButton: cc.Button;

    @property(cc.Button)
    configButton: cc.Button;

    @property(GameState)
    game: GameState;

    @property(Menu)
    menu: Menu;

    @property(TestResult)
    testResult: TestResult;

    onLoad () {
        this.newGameButton.node.on('click', () => { this.newGame() });
        this.playButton.node.on('click', () => { this.playCard() });
        this.autoButton.node.on('click', () => { this.autoNext() });
        this.testButton.node.on('click', () => { this.TestBot() });
        this.botButton.node.on('click', () => { this.menu.OpenBotMenu(); });
        this.configButton.node.on('click', () => { this.menu.OpenConfigMenu(); });
        // 設定Client Callback
        Client.SetCallback("test.result", (message: Message) => {
            let state: State = JSON.parse(message.Data);
            this.testResult.TestUpdate(state);
        });
        Client.SetCallback("test.error", (message: Message) => {
            this.testResult.TestError();
        });
        Client.SetCallback("test.end", (message: Message) => {
            this.testResult.TestEnd();
        });
    }

    newGame() {
        Client.SendMessage("game.new", this.menu.Config);
    }

    playCard() {
        Client.SendMessage("game.play", this.game.GetAction());
    }

    autoNext() {
        Client.SendMessage("game.next", "");
    }

    TestBot() {
        let testConfig: TestConfig = {
            Config: this.menu.Config,
            Count: Number(this.countEditBox.string),
        }
        this.testResult.TestBegin(this.menu.Config.PlayerCount, testConfig);
        Client.SendMessage("test.test", testConfig);
    }

}
