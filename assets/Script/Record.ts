import { Client, Message, RecordData } from "./Client"
import DropDown from "./DropDown"

const {ccclass, property} = cc._decorator;

@ccclass
export default class Record extends cc.Component {

    @property(cc.Node)
    boxNode: cc.Node;

    @property(cc.Button)
    closeConfigButton: cc.Button;

    @property(cc.Button)
    saveButton: cc.Button;

    @property(cc.Button)
    loadButton: cc.Button;

    @property(DropDown)
    stateList: DropDown;

    @property(cc.EditBox)
    commentEditBox: cc.EditBox;

    recordList: RecordData[];

    onLoad(): void {
        this.closeConfigButton.node.on('click', () => { this.boxNode.active = false; });
        this.saveButton.node.on('click', () => { this.saveRecord(); });
        this.loadButton.node.on('click', () => { this.loadRecord(); });
        this.stateList.OnChange = () => {
            for (let i = 0; i < this.recordList.length; i++) {
                if (this.recordList[i].Key == Number(this.stateList.GetCurrent())) {
                    this.commentEditBox.string = this.recordList[i].Comment;
                }
            }
        }
        Client.SetCallback("game.record", (message: Message) => {
            this.recordList = JSON.parse(message.Data);
            let keys = [];
            for (let i = 0; i < this.recordList.length; i++) {
                keys.push(this.recordList[i].Key);
            }
            this.stateList.SetNames(keys);
            this.boxNode.active = true;
        });
        Client.SetCallback("game.save", (message: Message) => { alert("record saved"); });
        Client.SetCallback("game.load", (message: Message) => { alert("record loaded"); });
    }

    OpenRecord() {
        Client.SendMessage("game.record", "");
    }

    saveRecord() {
        Client.SendMessage("game.save", this.commentEditBox.string);
    }

    loadRecord() {
        Client.SendMessage("game.load", Number(this.stateList.GetCurrent()));
    }

}
