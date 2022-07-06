import { Client, FeatureInfo, Message, ReplayData, State } from "./Client"
import DropDown from "./DropDown"
import GameState from "./GameState"

const {ccclass, property} = cc._decorator;

@ccclass
export default class Replay extends cc.Component {

    // 輸入UI
    @property(DropDown)
    pageDropDown: DropDown;

    @property(cc.Button)
    prevPageButton: cc.Button;

    @property(cc.Button)
    nextPageButton: cc.Button;

    // Filter
    @property(cc.Node)
    logList: cc.Node;

    @property(cc.Prefab)
    logrPrefeb: cc.Node;

    // Player
    @property(cc.Node)
    playerNode: cc.Node;

    @property(DropDown)
    typeDropDown: DropDown;

    @property(cc.Label)
    valueLabel: cc.Label;

    @property(DropDown)
    turnDropDown: DropDown;

    @property(cc.Button)
    prevTurnButton: cc.Button;

    @property(cc.Button)
    nextTurnButton: cc.Button;

    @property(GameState)
    gameState: GameState;

    featureList: FeatureInfo[];
    
    logIndex: number;
    currentLog: State[];

    onLoad () {
        //設定UI
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
            if ((page) * 10 < this.featureList.length && page < 300) {
                this.pageDropDown.SetCurrent((page + 1).toString());
                this.applyFilter();
            }
        });
        this.typeDropDown.SetNames(["遊戲發牌類型", "手牌調整評分", "遊戲體驗評分", "KPI-勝負", "KPI-最大名次變動", "KPI-平均手牌數量", "KPI-手牌減少率", "KPI-優勢變化率"]);
        this.typeDropDown.OnChange = () => { this.setValue() };
        this.valueLabel.string = "";
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
        Client.SetCallback("user.replay", (message: Message) => {
            let data: ReplayData = JSON.parse(message.Data);
            this.openLog(data);
        });
        this.featureList = [];
        this.logIndex = -1;
        this.currentLog = [];
        this.node.active = false;
    }

    Open(featureList: FeatureInfo[]) {
        this.featureList = featureList;
        this.featureList.sort((a: FeatureInfo, b: FeatureInfo): number => {
            return b.Time - a.Time;
        });
        let pages: string[] = [];
        for (let i = 0; i * 10 < this.featureList.length && i < 300; i++) {
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

    applyFilter() {
        this.logList.destroyAllChildren();
        this.logList.removeAllChildren();
        if (this.featureList.length > 0) {
            const Height = 50;
            let offset = (Number(this.pageDropDown.GetCurrent()) - 1) * 10;
            for (let i = 0; i < 10 && offset + i < this.featureList.length; i++) {
                var log = cc.instantiate(this.logrPrefeb);
                log.setPosition(0, -Height * i);
                log.children[0].children[0].getComponent(cc.Label).string = this.featureList[offset + i].NickName + " " + new Date(this.featureList[offset + i].Time / 1000000).toLocaleString() + "\n" + toCardString(this.featureList[offset + i].Card);
                log.on('click', () => {
                    Client.SendMessage("user.replay", this.featureList[offset + i].Index);
                    this.logIndex = i;
                });
                log.parent = this.logList;
            }
        }
    }

    openLog(data: ReplayData) {
        this.setValue();
        let turns: string[] = [];
        for (let i = 0; i < data.History.length; i++) {
            turns.push((i).toString());
        }
        this.turnDropDown.SetNames(turns);
        if (turns.length > 0) {
            this.turnDropDown.SetCurrent(turns[0]);
        }
        this.currentLog = [];
        let state: State = {
            Config: data.Config,
            PlayersCard: data.Config.Debug,
            PlayingIndex: -1,
            LastIndex: -1,
            PlayHints: [],
            PerviousCard: data.Config.Debug,
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
        for (let i = 0; i < data.History.length; i++) {
            state.PlayersCard = data.History[i].PlayersCard;
            if (i < data.History.length - 1) {
                state.PlayingIndex = data.History[i + 1].Index;
            } else {
                state.PlayingIndex = -1;
                state.PlayersResult = data.PlayersResult;
            }
            if (data.History[i].Index >= 0) {
                state.PerviousCard[data.History[i].Index] = data.History[i].ActionCard.Code;
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

    setValue() {
        if (this.logIndex < 0) {
            return;
        }
        const KEY = ["GameType", "CardEvaluate", "GameEvaluate", "Win", "TurnMaxOrderDiff", "TurnAvgCardRate", "TurnMaxRateDiff", "ReverseRate"];
        const NAME = [
            ["正常發牌", "勝率加倍", "勝率減半"],
            ["感覺正常", "感覺偏好", "感覺偏差"],
            ["體驗極差", "體驗略差", "體驗略好", "體驗極好"],
            ["遊戲失敗", "遊戲獲勝"],
            ["豪無變動", "只差1位", "變動2位", "多達3位"],
            ["遠小於平均", "略低於平均", "約為平均值", "略高於平均", "遠大於平均"],
            ["毫無減少機會", "減少比例微弱", "出牌機會普通", "有機會取得優勢", "單輪大量領先"],
            ["後期反超", "後期較優", "前後期平均", "前期較優", "前期領先"],
        ];
        let type = this.typeDropDown.GetIndex();
        let index = 0;
        if (type < 5) {
            index = this.featureList[this.logIndex][KEY[type]];
        } else {
            let arr = [];
            for (let i = 0; i < this.featureList.length; i++) {
                arr.push(this.featureList[i][KEY[type]]);
            }
            arr.sort((a: number, b: number): number => {
                return a - b;
            });
            for (let i = 0; i < arr.length; i++) {
                if (arr[i] == this.featureList[this.logIndex][KEY[type]]) {
                    index = Math.floor(i / this.featureList.length * NAME[type].length);
                    break;
                }
            }
        }
        this.valueLabel.string = NAME[type][index];
    }

    playLog() {
        let turn = Number(this.turnDropDown.GetCurrent());
        if (turn < this.currentLog.length) {
            this.gameState.SetGameState(this.currentLog[turn]);
        }
    }

}

function toCardString(code: number): string {
    let str = "";
    const SUIT = ["♣", "♦", "♥", "♠"];
    const NAME = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    const RANK = [11, 12, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let card = []
    for (let i = 0; i < 52 && code > 0; i++) {
        if (code % 2) {
            card.push(i);
        }
        code = Math.floor(code / 2);
    }
    card.sort((a: number, b: number) => {
        let left = RANK[a % 13] * 4 + Math.floor(a / 13);
        let right = RANK[b % 13] * 4 + Math.floor(b / 13);
        return left - right;
    });
    for (let i = 0; i < card.length; i++) {
        str += SUIT[Math.floor(card[i] / 13)] + NAME[card[i] % 13];
    }
    return str;
}
