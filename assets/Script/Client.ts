interface CallbackFunc {
    name: string;
    callback(data: object): Promise<void>;
}

async function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

export default class Client {

    static ws: WebSocket;
    static uri: string = "ws://";
    static IsOpen: boolean = false;
    static OnConnect(): void{};
    static OnDisconnect(): void{};
    static callbackList: CallbackFunc[] = [];
    static msgList: any[] = [];
    static complete: boolean = true;

    static firstLoad: boolean = true;
    static nickname: string = "";

    public static AddCallback(name: string, callback: any) {
        Client.callbackList.push({name, callback});
    }

    public static SetCallback(name: string, callback: any) {
        for (let i = 0; i < Client.callbackList.length; i++) {
            if (Client.callbackList[i].name == name) {
                Client.callbackList[i].callback = callback;
                return
            }
        }
        Client.callbackList.push({name, callback});
    }

    public static connect(uri: string) {
        Client.uri = "ws://" + uri;
        Client.ws = new WebSocket(Client.uri);

        Client.ws.onopen = async function() {
            Client.IsOpen = true;
            Client.msgList = [];
            Client.OnConnect();
            console.log("connected to " + Client.uri);
            while (Client.IsOpen) {
                if (Client.msgList.length > 0) {
                    let data = Client.msgList[0];
                    Client.msgList.shift();
                    for (let i = 0; i < Client.callbackList.length; i++) {
                        if (Client.callbackList[i].name == data.Type) {
                            await Client.callbackList[i].callback(data);
                        }
                    }
                } else {
                    await sleep(10);
                }
            }
        }

        Client.ws.onclose = function(event) {
            Client.IsOpen = false;
            Client.msgList = [];
            Client.OnDisconnect();
            console.log("connection closed (" + event.code + ")");
        }

        Client.ws.onmessage = async function(event) {
            let data = JSON.parse(event.data);
            Client.msgList.push(data);
        }
    }

    public static close() {
        Client.ws.close();
    }

    public static Login(name: string) {
        Client.nickname = name;
        Client.ws.send(JSON.stringify({ Type: "enter.lobby", Name: name }));
    }

    public static Logout() {
        Client.ws.send(JSON.stringify({ Type: "exit.lobby" }));
    }

    public static JoinRoom(name: string) {
        Client.ws.send(JSON.stringify({ Type: "enter.room", Name: name }));
    }

    public static ExitRoom() {
        Client.ws.send(JSON.stringify({ Type: "exit.room" }));
    }

    public static Ready(opt: number) {
        Client.ws.send(JSON.stringify({ Type: "game.set", Name: "Ready", Operate: opt }));
    }

    public static Auto(opt: number) {
        Client.ws.send(JSON.stringify({ Type: "game.set", Name: "Auto", Operate: opt }));
    }

    public static Play(point: number) {
        Client.ws.send(JSON.stringify({ Type: "game.play", Name: "DROP_CARD", Operate: point }));
    }

    public static Delay(time: number) {
        Client.ws.send(JSON.stringify({ Type: "game.play", Name: "ADD_TIME", Operate: time }));
    }
}
