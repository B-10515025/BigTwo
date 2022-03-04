import { State } from "./Client"
import DropDown from "./DropDown"
import GameState from "./GameState"

const {ccclass, property} = cc._decorator;

@ccclass
export default class Replay extends cc.Component {

    // 輸入UI
    @property(DropDown)
    typeDropDown: DropDown;

    @property(DropDown)
    objectDropDown: DropDown;

    @property(DropDown)
    orderDropDown: DropDown;

    @property(DropDown)
    pageDropDown: DropDown;

    @property(cc.Button)
    prevPageButton: cc.Button;

    @property(cc.Button)
    nextPageButton: cc.Button;

    @property(cc.Button)
    closeButton: cc.Button;

    // Filter
    @property(cc.Label)
    countLabel: cc.Label;

    @property(cc.Node)
    logList: cc.Node;

    @property(cc.Prefab)
    logrPrefeb: cc.Node;

    // Player
    @property(cc.Node)
    playerNode: cc.Node;

    @property(cc.Label)
    indexLabel: cc.Label;

    @property(DropDown)
    turnDropDown: DropDown;

    @property(cc.Button)
    prevTurnButton: cc.Button;

    @property(cc.Button)
    nextTurnButton: cc.Button;

    @property(GameState)
    gameState: GameState;

    replayState: State[];
    replayRows: number[][];

    currentLog: State[];

    onLoad () {
        //設定UI
        this.typeDropDown.SetNames(["局號", "分數", "張數", "三脫手"]);
        this.typeDropDown.OnChange = () => { this.applyFilter() };
        this.objectDropDown.OnChange = () => { this.applyFilter() };
        this.orderDropDown.SetNames(["小到大", "大到小"]);
        this.orderDropDown.OnChange = () => { this.applyFilter() };
        this.pageDropDown.OnChange = () => { this.applyFilter() };
        this.prevPageButton.node.on('click', () => { 
            let page = Number(this.pageDropDown.GetCurrent());
            if (page > 1) {
                this.pageDropDown.SetCurrent((page - 1).toString());
                this.applyFilter();
            }
        });
        this.nextPageButton.node.on('click', () => { 
            let page = Number(this.pageDropDown.GetCurrent());
            if ((page) * 10 < this.replayRows.length && page < 100) {
                this.pageDropDown.SetCurrent((page + 1).toString());
                this.applyFilter();
            }
        });
        this.turnDropDown.OnChange = () => { this.playLog() };
        this.prevTurnButton.node.on('click', () => { 
            let turn = Number(this.turnDropDown.GetCurrent());
            if (turn > 0) {
                this.turnDropDown.SetCurrent((turn - 1).toString());
                this.playLog();
            }
        });
        this.nextTurnButton.node.on('click', () => { 
            let turn = Number(this.turnDropDown.GetCurrent());
            if (turn + 1 < this.currentLog.length) {
                this.turnDropDown.SetCurrent((turn + 1).toString());
                this.playLog();
            }
        });
        this.closeButton.node.on('click', () => { this.node.active = false; });
    }

    Reset() {
        this.replayState = [];
        this.replayRows = [];
        this.currentLog = [];
    }

    Open() {
        this.countLabel.string = "共" + this.replayState.length + "場";
        let names: string[] = ["ALL"];
        if (this.replayState.length > 0) {
            for (let i = 0; i < this.replayState[0].Config.PlayerCount; i++) {
                names.push("P" + (i + 1));
            }
        }
        this.objectDropDown.SetNames(names);
        let pages: string[] = [];
        for (let i = 0; i * 10 < this.replayRows.length && i < 100; i++) {
            pages.push((i + 1).toString());
        }
        this.pageDropDown.SetNames(pages);
        if (pages.length > 0) {
            this.pageDropDown.SetCurrent(pages[0]);
        }
        this.applyFilter();
        this.playerNode.active = false;
        this.node.active = true;
    }

    AddState(state: State) {
        let lastCard = 0;
        let row: number[] = [this.replayState.length];
        for (let i = 0; i < state.PlayersResult.length; i++) {
            row.push(state.PlayersResult[i].WinScores);
            if (state.PlayersResult[i].WinScores > 0) {
                lastCard = state.PlayersResult[i].Cards;
            } 
        }
        for (let i = 0; i < state.PlayersResult.length; i++) {
            let card = state.PlayersCard[i];
            let count = 0;
            while (card > 0) {
                count += card % 2;
                card = Math.floor(card / 2);
            }
            row.push(count);
        }
        row.push((lastCard / 4) % 2);
        row.push(0);
        this.replayRows.push(row);
        this.replayState.push(state);
    }

    applyFilter() {
        this.logList.destroyAllChildren();
        this.logList.removeAllChildren();
        if (this.replayRows.length > 0) {
            let key = this.replayRows[0].length - 1;
            let type = this.typeDropDown.GetCurrent();
            let obj = this.objectDropDown.GetCurrent();
            let playerCount = (this.replayRows[0].length - 3) / 2;
            let index = -1;
            for (let i = 0; i < playerCount; i++) {
                if (obj == "P" + (i + 1)) {
                    index = i;
                }
            }
            if (type == "局號") {
                for (let i = 0; i < this.replayRows.length; i++) {
                    this.replayRows[i][key] = this.replayRows[i][0];
                }
            } else if (type == "分數") {
                if (index < 0) {
                    for (let i = 0; i < this.replayRows.length; i++) {
                        let max = 0;
                        for (let j = 0; j < playerCount; j++) {
                            if (this.replayRows[i][1 + j] > max) {
                                max = this.replayRows[i][1 + j];
                            }
                        }
                        this.replayRows[i][key] = max;
                    }
                } else {
                    for (let i = 0; i < this.replayRows.length; i++) {
                        this.replayRows[i][key] = this.replayRows[i][1 + index];
                    }
                }
            } else if (type == "張數") {
                if (index < 0) {
                    for (let i = 0; i < this.replayRows.length; i++) {
                        let total = 0;
                        for (let j = 0; j < playerCount; j++) {
                            total += this.replayRows[i][1 + playerCount + j];
                        }
                        this.replayRows[i][key] = total;
                    }
                } else {
                    for (let i = 0; i < this.replayRows.length; i++) {
                        this.replayRows[i][key] = this.replayRows[i][1 + playerCount + index];
                    }
                }
            } else if (type == "三脫手") {
                for (let i = 0; i < this.replayRows.length; i++) {
                    this.replayRows[i][key] = this.replayRows[i][key - 1];
                    if (index > 0 && this.replayRows[i][1 + index] > 0) {
                        this.replayRows[i][key] += 1;
                    }
                }
            }
            if (this.orderDropDown.GetCurrent() == "大到小") {
                this.replayRows.sort((a: number[], b: number[]): number => {
                    return b[key] - a[key];
                });
            } else {
                this.replayRows.sort((a: number[], b: number[]): number => {
                    return a[key] - b[key];
                });
            }
            const Height = 80;
            let offset = (Number(this.pageDropDown.GetCurrent()) - 1) * 10;
            for (let i = 0; i < 10 && offset + i < this.replayRows.length; i++) {
                var log = cc.instantiate(this.logrPrefeb);
                log.setPosition(0, -Height * i);
                log.children[0].children[0].getComponent(cc.Label).string = "#" + (this.replayRows[offset + i][0] + 1);
                if (type == "分數") {
                    log.children[0].children[0].getComponent(cc.Label).string += ": " + this.replayRows[offset + i][1];
                    for (let j = 0; j < playerCount - 1; j++) {
                        log.children[0].children[0].getComponent(cc.Label).string += ", " + this.replayRows[offset + i][2 + j];
                    }
                } else if (type == "張數") {
                    log.children[0].children[0].getComponent(cc.Label).string += ": " + this.replayRows[offset + i][1 + playerCount];
                    for (let j = 0; j < playerCount - 1; j++) {
                        log.children[0].children[0].getComponent(cc.Label).string += ", " + this.replayRows[offset + i][2 + playerCount + j];
                    }
                } else if (type == "三脫手") {
                    if (this.replayRows[offset + i][key - 1] > 0) {
                        for (let j = 0; j < playerCount; j++) {
                            if (this.replayRows[offset + i][1 + j] > 0) {
                                log.children[0].children[0].getComponent(cc.Label).string += ": Player" + (j + 1);
                                break;
                            }
                        }
                    } else {
                        log.children[0].children[0].getComponent(cc.Label).string += ": Null";
                    }
                }
                log.on('click', () => { 
                    this.openLog(this.replayRows[offset + i][0]);
                });
                log.parent = this.logList;
            }
        }
    }

    openLog(index: number) {
        this.indexLabel.string = "第" + (index + 1) + "場";
        let turns: string[] = [];
        for (let i = 0; i < this.replayState[index].History.length; i++) {
            turns.push((i).toString());
        }
        this.turnDropDown.SetNames(turns);
        if (turns.length > 0) {
            this.turnDropDown.SetCurrent(turns[0]);
        }
        this.currentLog = [];
        let state: State = {
            Config: this.replayState[index].Config,
            PlayersCard: this.replayState[index].PlayersCard,
            PlayingIndex: -1,
            LastIndex: -1,
            PerviousCard: this.replayState[index].PerviousCard,
            IsFirstResult: false,
            PlayersResult: [],
            History: [],
            StartType: [],
            CardScore: [],
            Threshold: [],
            ReferCurrent: undefined,
        }
        for (let i = 0; i < state.PerviousCard.length; i++) {
            state.PerviousCard[i] = -1;
        }
        for (let i = 0; i < this.replayState[index].History.length; i++) {
            state.PlayersCard = this.replayState[index].History[i].PlayersCard;
            if (i < this.replayState[index].History.length - 1) {
                state.PlayingIndex = this.replayState[index].History[i + 1].Index;
            } else {
                state.PlayingIndex = -1;
                state.PlayersResult = this.replayState[index].PlayersResult;
            }
            if (this.replayState[index].History[i].Index >= 0) {
                state.PerviousCard[this.replayState[index].History[i].Index] = this.replayState[index].History[i].ActionCard.Code;
            }
            let pass = 0;
            for (let j = 0; j < state.PerviousCard.length; j++) {
                if (j == state.PlayingIndex) {
                    continue;
                }
                if (state.PerviousCard[j] == 0) {
                    pass++;
                }
            }
            if (pass >= state.PerviousCard.length - 1) {
                for (let j = 0; j < state.PerviousCard.length; j++) {
                    if (state.PerviousCard[j] == 0) {
                        state.PerviousCard[j] = -1;
                    }
                }
            }
            this.currentLog.push(JSON.parse(JSON.stringify(state)));
        }
        this.playerNode.active = true;
        this.playLog();
    }

    playLog() {
        let turn = Number(this.turnDropDown.GetCurrent());
        if (turn < this.currentLog.length) {
            this.gameState.SetGameState(this.currentLog[turn]);
        }
    }

}
