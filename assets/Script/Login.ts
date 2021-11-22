import Client from "./Client"

const {ccclass, property} = cc._decorator;

@ccclass
export default class Login extends cc.Component {

    @property(cc.Node)
    serverList: cc.Node;

    @property(cc.EditBox)
    serverUri: cc.EditBox;

    @property(cc.Node)
    connecting: cc.Node;

    @property(cc.Node)
    enterLobby: cc.Node;

    @property(cc.EditBox)
    nickname: cc.EditBox;

    onLoad () {
        Client.OnConnect = () => {
            this.IsConnect(true);
        };
        Client.OnDisconnect = () => {
            cc.director.loadScene("Login");
        };
        Client.SetCallback("LocationMsg", (data) => {
            let SceneName: string;
            if (data.Location == 0) {
                SceneName = "Login";
            } else if (data.Location == 1) {
                SceneName = "Lobby";
            } else if (data.Location == 2) {
                SceneName = "Game";
            }
            return new Promise(r => 
                cc.director.loadScene(SceneName, function () {
                    if (SceneName == "Game") {
                        let label = cc.find("Canvas/Game/Name").getComponent(cc.Label);
                        label.string = "房名: " + data.Name;
                    }
                    r(0);
                })
            );
        });
        Client.SetCallback("ErrorMsg", this.ErrorMsg);
        this.IsConnect(Client.IsOpen);
        Client.firstLoad = false;
    }

    IsConnect(connect: boolean) {
        this.connecting.active = false;
        this.serverList.active = !connect;
        this.enterLobby.active = connect;
        if (!connect && !Client.firstLoad) {
            alert("無法連上伺服器");
        }
    }

    ConnenctNTUST() {
        this.connecting.active = true;
        Client.connect("140.118.157.18:2222");
    }

    ConnenctLocalhost() {
        this.connecting.active = true;
        Client.connect("localhost:2222");
    }

    ConnenctCostom() {
        if (this.serverUri.string === "") {
            alert("請輸入伺服器位址")
        } else {
            this.connecting.active = true;
            Client.connect(this.serverUri.string);
        }
    }

    EnterLobby() {
        Client.Login(this.nickname.string);
    }

    ExitServer() {
        Client.close();
    }

    ErrorMsg(data: any) {
        alert(data.Message);
    }
}
