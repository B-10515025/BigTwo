import { Client, Message, State } from "./Client"
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
        this.testResult.OpenResult(this.menu.Config.PlayerCount, this.menu.Config);
    }

}
