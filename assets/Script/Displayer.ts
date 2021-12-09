import { Client, Message, State } from "./Client"
import GameState from "./GameState"

const {ccclass, property} = cc._decorator;

@ccclass
export default class Displayer extends cc.Component {

    // 遊戲狀態
    @property(GameState)
    gameState: GameState;

    // 遊戲結算
    //@property(Result)
    //result: Result;

    onLoad () {
        // 重設畫面
        this.gameState.Reset();
        // 設定Client Callback
        Client.OnConnect = () => {
            this.inConnect(true);
        };
        Client.OnDisconnect = () => {
            this.inConnect(false);
        };
        Client.SetCallback("game.state", (message: Message) => {
            this.updateState(message);
        });
        Client.SetCallback("error", (message: Message) => {
            this.errorMsg(message);
        });
        // 連線
        let uri = new URL(window.location.href).searchParams.get("uri");
        if (uri) {
            if (uri == "NTUST") {
                Client.Connect("140.118.157.18:22222");
            } else {
                Client.Connect(uri);
            }
        } else {
            Client.Connect("localhost:22222");
        }
    }

    inConnect(connect: boolean) {
        this.gameState.node.active = connect;
        //this.result.node.active = connect;
        if (!connect) {
            this.gameState.Reset();
            alert("無法連上伺服器");
        }
    }

    updateState(message: Message) {
        let state: State = JSON.parse(message.Data);
        this.gameState.SetGameState(state);
    }

    errorMsg(message: Message) {
        alert(message.Data);
    }
}
