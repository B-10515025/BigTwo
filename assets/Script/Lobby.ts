import Client from "./Client"
import Room from "./Room"

const {ccclass, property} = cc._decorator;

@ccclass
export default class Lobby extends cc.Component {

    @property(cc.Label)
    serverUri: cc.Label;

    @property(cc.EditBox)
    RoomName: cc.EditBox;

    @property(cc.Node)
    RoomList: cc.Node;

    @property(cc.Node)
    Scroller: cc.Node;

    @property(cc.Prefab)
    RoomPrefab: cc.Node;

    moving: boolean = false;

    onLoad () {
        this.Scroller.on(cc.Node.EventType.MOUSE_DOWN, (event)=>{
            if (event.getButton() === cc.Event.EventMouse.BUTTON_LEFT) {
                this.moving = true;
            }
        });
        this.Scroller.on(cc.Node.EventType.MOUSE_MOVE, (event)=>{
            if (this.moving) {
                this.RoomList.x += event.getDelta().x;
                const Width = 330;
                let min = (Math.floor((this.RoomList.children.length + 1) / 2) - 3) * -Width;
                if (this.RoomList.x < min) {
                    this.RoomList.x = min;
                }
                if (this.RoomList.x > 0) {
                    this.RoomList.x = 0;
                }
            }
        });
        this.Scroller.on(cc.Node.EventType.MOUSE_LEAVE, (event)=>{
            this.moving = false;
        });
        this.Scroller.on(cc.Node.EventType.MOUSE_UP, (event)=>{
            if (event.getButton() === cc.Event.EventMouse.BUTTON_LEFT) {
                this.moving = false;
            }
        });
        Client.SetCallback("LobbyMsg", (data) => {
            this.setRoomList(data);
        });
        this.serverUri.string = "伺服器位址 " + Client.uri.split("//")[1];
    }

    setRoomList(data) {
        this.RoomList.destroyAllChildren();
        this.RoomList.removeAllChildren();
        const startX = -330, startY = 0, Width = 330, Height = 230;
        for (let i = 0; i < data.Rooms.length; i++) {
            var room = cc.instantiate(this.RoomPrefab);
            room.parent = this.RoomList;
            room.setPosition(startX + Math.floor(i / 2) * Width, startY - (i % 2) * Height);
            room.getComponent(Room).setRoom(data.Rooms[i]);
        }
    }

    EnterRoom() {
        Client.JoinRoom(this.RoomName.string);
    }

    backLogin() {
        Client.Logout();
    }

}
