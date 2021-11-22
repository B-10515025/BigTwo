import Client from "./Client"

const {ccclass, property} = cc._decorator;

@ccclass
export default class Room extends cc.Component {

    @property(cc.Node)
    RoomRoot: cc.Node;

    Name: string;

    setRoom(data: any) {
        this.Name = data.Name;
        this.RoomRoot.children[0].getComponent(cc.Label).string = "房名: " + data.Name;
        this.RoomRoot.children[1].getComponent(cc.Label).string = data.MaxPlayers + "人/" + data.TotalGame + "局";
        this.RoomRoot.children[1].color = cc.Color.RED;
        this.RoomRoot.children[2].getComponent(cc.Label).string = (data.Odds * 2).toString() + "/" + data.Odds.toString();
        this.RoomRoot.children[2].color = cc.Color.RED;
        this.RoomRoot.children[3].getComponent(cc.Label).string = "";
        for (let i = 0; i < data.PlayerNames.length; i++) {
            this.RoomRoot.children[3].getComponent(cc.Label).string = this.RoomRoot.children[3].getComponent(cc.Label).string + data.PlayerNames[i] + "\n";
        }
        if (data.Playing) {
            this.RoomRoot.children[4].getComponent(cc.Label).string = "遊戲中...";
            this.RoomRoot.children[4].color = cc.Color.BLUE;
        } else {
            this.RoomRoot.children[4].getComponent(cc.Label).string = "準備中...";
            this.RoomRoot.children[4].color = cc.Color.YELLOW;
        }
    }

    EnterRoom() {
        Client.JoinRoom(this.Name);
    }
}
