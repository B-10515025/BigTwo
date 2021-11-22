import CardSet from "./CardSet"
import Client from "./Client"
import Record from "./Record"
import Result from "./Result"

const {ccclass, property} = cc._decorator;

@ccclass
export default class Game extends cc.Component {

    @property(cc.Label)
    GameCount: cc.Label;

    @property(cc.Label)
    Ready: cc.Label;

    @property(cc.Label)
    Auto: cc.Label;

    @property(cc.Node)
    SetReady: cc.Node;

    @property(cc.Node)
    Players: cc.Node;

    @property(cc.Node)
    Cards: cc.Node;

    @property(CardSet)
    Hand: CardSet;

    @property(CardSet)
    Keep: CardSet;

    @property(cc.Node)
    Types: cc.Node;

    @property(cc.Label)
    KeepLabel: cc.Label;

    @property(cc.Node)
    Operate: cc.Node;

    @property(cc.Label)
    Message: cc.Label;

    @property(Result)
    Result: Result;

    SubSet: any[] = [];
    Select: number = 0;
    LastCard: any;

    onLoad () {
        Client.SetCallback("RoomMsg", (data) => {
            this.setRoomState(data);
        });
        Client.SetCallback("GameMsg", (data) => {
            this.setGameState(data);
        });
    }

    setRoomState(data) {
        this.GameCount.string = "局數: " + (data.GameCount + 1) + "/" + data.TotalGame;
        this.SetReady.active = !data.Playing;
        let index = 0;
        for (let i = 0; i < data.Players.length; i++) {
            if (data.Players[i].Name == Client.nickname) {
                index = i;
                break;
            }
        }
        if (data.Players[index].Ready) {
            this.Ready.string = "取消";
        } else {
            this.Ready.string = "準備";
        }
        if (data.Players[index].Auto) {
            this.Auto.string = "取消託管";
        } else {
            this.Auto.string = "託管";
        }
        for (let i = 0; i < this.Players.children.length; i++) {
            this.Players.children[i].active = false;
        }
        for (let i = 0; i < data.Players.length; i++) {
            let pos = (data.MaxPlayers + i - index) % data.MaxPlayers;
            if (data.MaxPlayers < this.Players.children.length && pos == 2) {
                pos = 3;
            }
            this.Players.children[pos].active = true;
            this.Players.children[pos].children[0].getComponent(cc.Label).string = data.Players[i].Name;
            this.Players.children[pos].children[1].children[0].getComponent(cc.Label).string = data.Players[i].Balance;
            this.Players.children[pos].children[2].active = data.Players[i].Ready && !data.Playing;
            this.Players.children[pos].children[3].active = data.Players[i].Auto;
            this.Players.children[pos].children[4].active = data.Playing;
            if (!data.Playing) {
                this.Players.children[pos].children[5].active = false;
            }
            this.Players.children[pos].children[6].active = data.Playing;
        }
        this.Cards.active = data.Playing;
        if (!data.Playing) {
            this.SubSet = [];
            this.Select = 0;
        }
    }

    setGameState(data) {
        if (data.State == 0) {
            let state = JSON.parse(data.JsonString);
            if (this.Hand.code + this.Keep.code != state.Card) {
                this.Hand.setCard(state.Card, true);
                this.Keep.setCard(0, true);
                this.KeepLabel.string = "保留手牌";
                this.SubSet = state.SubSet;
                this.Select = 0;
                let arr = [];
                for (let i = 0; i < this.SubSet.length; i++) {
                    arr.push(this.SubSet[i].Type);
                }
                for (let i = 0; i < 4; i++) {
                    this.Types.children[i].getComponent(cc.Button).interactable = arr.indexOf(i + 2) >= 0;
                }
            }
            this.LastCard = state.LastCard;
            let index = state.SeatIndex;
            for (let i = 0; i < state.CardCount.length; i++) {
                let pos = (state.CardCount.length + i - index) % state.CardCount.length;
                if (state.CardCount.length < this.Players.children.length && pos == 2) {
                    pos = 3;
                }
                this.Players.children[pos].children[4].children[0].getComponent(cc.Label).string = state.CardCount[i];
                this.Players.children[pos].children[5].active = state.CardCount[i] < 3;
                if (i == state.Turn) {
                    this.Players.children[pos].children[6].getComponent(Record).setRecord(-1, state.TimeLeft);
                } else if (i == state.LastPlayer) {
                    this.Players.children[pos].children[6].getComponent(Record).setRecord(state.LastCard.Code, state.LastCard.Type);
                } else if (state.Pass[i]) {
                    this.Players.children[pos].children[6].getComponent(Record).setRecord(0, 0);
                } else {
                    this.Players.children[pos].children[6].getComponent(Record).setRecord(-2, 0);
                }
            }
            this.Operate.active = index == state.Turn;
            this.Message.string = "";
            if (this.Players.children[1].children[4].children[0].getComponent(cc.Label).string == "1") {
                this.Message.string = "下家報單，需出最大牌";
            }
            let bigger = false;
            for (let i = 0; i < this.SubSet.length; i++) {
                if (this.SubSet[i].Level > this.LastCard.Level || (this.SubSet[i].Type == this.LastCard.Type && this.SubSet[i].Value >= this.LastCard.Value)) {
                    bigger = true;
                    break
                }
            }
            if (!bigger) {
                this.Message.string = "沒有牌大過上家";
            }
            for (let i = 0; i < this.Hand.node.children.length; i++) {
                if (this.Hand.node.children[i].getComponent(cc.Sprite).spriteFrame.name == "2") {
                    this.Message.string = "首出先帶梅花3";
                    break;
                }
            }
        } else {
            let result = JSON.parse(data.JsonString);
            this.Result.setGameResult(result);
        }
        
    }

    setReady() {
        if (this.Ready.string == "準備") {
            Client.Ready(1);
        } else {
            Client.Ready(0);
        }
    }

    setAuto() {
        if (this.Auto.string == "託管") {
            Client.Auto(1);
        } else {
            Client.Auto(0);
        }
    }

    setType(e, data) {
        let type = Number(data);
        if (type < 2) {
            for (let i = this.Select; i < this.SubSet.length; i++) {
                if (this.SubSet[i].Level > this.LastCard.Level || (this.SubSet[i].Type == this.LastCard.Type && this.SubSet[i].Value >= this.LastCard.Value)) {
                    this.Hand.chooseCard(this.SubSet[i].Code);
                    this.Keep.chooseCard(this.SubSet[i].Code);
                    this.Select = i + 1;
                    return
                }
            }
            this.Hand.chooseCard(0);
            this.Keep.chooseCard(0);
            this.Select = 0;
        } else {
            for (let i = this.Select; i != this.SubSet.length; i = (i + 1) % this.SubSet.length) {
                if (this.SubSet[i].Type == type) {
                    this.Hand.chooseCard(this.SubSet[i].Code);
                    this.Keep.chooseCard(this.SubSet[i].Code);
                    this.Select = (i + 1) % this.SubSet.length;
                    return
                }
            }
        }
    }

    keepCard() {
        if (this.KeepLabel.string == "保留手牌" && this.Hand.choose > 0) {
            this.Keep.setCard(this.Hand.choose, true);
            this.Hand.setCard(this.Hand.code - this.Hand.choose, true);
            this.KeepLabel.string = "重選保留";
        } else {
            this.Hand.setCard(this.Hand.code + this.Keep.code, true);
            this.Keep.setCard(0, true);
            this.KeepLabel.string = "保留手牌";
        }
    }

    playCard(e, data) {
        if (data == "PASS") {
            Client.Play(0);
        } else if (this.Hand.choose + this.Keep.choose > 0) {
            Client.Play(this.Hand.choose + this.Keep.choose);
        }
    }

    addTime() {
        Client.Delay(10000);
    }

    backLobby() {
        Client.ExitRoom();
    }

}
