import { State } from "./Client"
import DropDown from "./DropDown"
import { BarChartData, LineChartData, Visualizer } from "./Visualizer"

const {ccclass, property} = cc._decorator;

@ccclass
export default class Chart extends cc.Component {

    // 輸入UI
    @property(DropDown)
    typeDropDown: DropDown;

    @property(cc.Button)
    closeButton: cc.Button;

    // 輸出UI
    @property(cc.Label)
    nameLabel: cc.Label;

    @property(Visualizer)
    visualizer: Visualizer;

    updatePerRender: number;
    updateCount: number;

    updated: boolean;

    cardHistory: number[][][];
    playCount: number[];
    playTypeCount: number[][];
    startTypeCount: number[][];
    styleHistory: number[][][];
    styleTypeCount: number[][];
    rankCount: number[][];
    rankScore: number[][];

    playerIndex: number;

    onLoad () {
        this.updatePerRender = 10;
        this.updateCount = 0;
        //設定UI
        this.closeButton.node.on('click', () => { this.node.active = false; });
        this.typeDropDown.SetNames(["手牌張數", "打出張數", "打出牌型", "起始牌型", "策略分佈", "策略比例", "階級平均分數"]);
        this.typeDropDown.OnChange = () => { this.updated = false; }
    }

    Reset (PlayerCount: number) {
        this.cardHistory = [];
        this.playCount = [];
        this.playTypeCount = [];
        this.startTypeCount = [];
        this.styleHistory = [];
        this.styleTypeCount = [];
        this.rankCount = [];
        this.rankScore = [];
        for (let i = 0; i < PlayerCount; i++) {
            this.cardHistory.push([]);
            this.playCount.push(0);
            this.playTypeCount.push([]);
            this.startTypeCount.push([]);
            this.styleHistory.push([]);
            this.styleTypeCount.push([]);
            this.rankCount.push([]);
            this.rankScore.push([]);
            for (let j = 0; j < 10; j++) {
                this.playTypeCount[i].push(0);
                this.startTypeCount[i].push(0);
                this.rankCount[i].push(0);
                this.rankScore[i].push(0);
            }
            for (let j = 0; j <= 100; j++) {
                this.styleHistory[i].push([0, 0, 0, 0]);
            }
            for (let j = 0; j < 4; j++) {
                this.styleTypeCount[i].push(0);
            }
        }
        this.updated = true;
    }

    TestUpdate(state: State) {
        this.updated = false;
        // update visualization data
        if (state.History && state.History.length > 0) {
            for (let i = 0; i < state.Config.PlayerCount; i++) {
                let cardCounts: number[] = [];
                let styleCounts: number[][] = [];
                for (let j = 0; j < state.History.length; j++) {
                    cardCounts.push(countCard(state.History[j].PlayersCard[i]));
                    if (state.History[j].Index == i && state.History[j].ActionCard.Code > 0) {
                        this.playTypeCount[i][state.History[j].ActionCard.Type]++;
                    }
                    if (state.History[j].Index == i) {
                        this.playCount[i]++;
                        let find = false;
                        for (let k = 0; k < state.History[j].Refer.Style.length; k++) {
                            if (state.History[j].Refer.Style[k] > 0) {
                                this.styleTypeCount[i][k]++;
                                find = true;
                            }
                        }
                        if (find) {
                            styleCounts.push(state.History[j].Refer.Style);
                        }
                    }
                }
                let data: number[] = [];
                for (let j = 0; j <= 100; j++) {
                    let X = j / 100 * (state.History.length - 1);
                    let prevY = cardCounts[Math.floor(X)];
                    let nextY = cardCounts[Math.ceil(X)];
                    let Y = prevY + (X - Math.floor(X)) * (nextY - prevY);
                    data.push(Y);
                    if (styleCounts.length > 0) {
                        for (let k = 0; k < 4; k++) {
                            let X = j / 100 * (styleCounts.length - 1);
                            let stylePrevY = styleCounts[Math.floor(X)][k];
                            let stylenextY = styleCounts[Math.ceil(X)][k];
                            let styleY = stylePrevY + (X - Math.floor(X)) * (stylenextY - stylePrevY);
                            this.styleHistory[i][j][k] += styleY;
                        }
                    }
                }
                this.cardHistory[i].push(data);
                let lv = state.Threshold.length;
                for (let j = 0; j < state.Threshold.length; j++) {
                    if (state.CardScore[i] < state.Threshold[j]) {
                        lv = j;
                        break;
                    } 
                }
                this.rankCount[i][lv]++;
                this.rankScore[i][lv] += state.PlayersResult[i].WinScores;
            }
        }
        for (let i = 0; i < state.StartType.length; i++) {
            for (let j = 0; j < state.StartType[i].length; j++) {
                this.startTypeCount[i][j] += state.StartType[i][j];
            }
        }
    }

    OpenChart(index: number) {
        this.playerIndex = index;
        this.nameLabel.string = "Player " + (index + 1);
        this.node.active = true;
        this.updated = false;
        this.updateCount = this.updatePerRender;
    }

    update (dt) {
        if (this.updateCount < this.updatePerRender) {
            this.updateCount++;
            return;
        }
        if (this.updated) {
            return;
        }
        if (this.playerIndex < 0 || this.playerIndex >= this.cardHistory.length || this.playerIndex >= this.playTypeCount.length) {
            return;
        }
        switch (this.typeDropDown.GetCurrent()) {
            case "手牌張數":
                this.showCardCount();
                break;
            case "打出張數":
                this.showPlayCount();
                break;
            case "打出牌型":
                this.showPlayType();
                break;
            case "起始牌型":
                this.showStartType();
                break;
            case "策略分佈":
                this.showStyle();
                break;
            case "策略比例":
                this.showStyleRate();
                break;
            case "階級平均分數":
                this.showRankScore();
                break
        }
        this.updated = true;
        this.updateCount = 0;
    }

    showCardCount() {
        this.visualizer.Clear();
        let average: LineChartData = {
            Color: cc.Color.GREEN,
            Name: "Average",
            Value: [],
        };
        let lowerAverage: LineChartData = {
            Color: cc.Color.BLUE,
            Name: "Lower Average",
            Value: [],
        };
        let upperAverage: LineChartData = {
            Color: cc.Color.RED,
            Name: "Upper Average",
            Value: [],
        };
        for (let i = 0; i <= 100; i++) {
            let arr: number[] = [];
            for (let j = 0; j < this.cardHistory[this.playerIndex].length; j++) {
                arr.push(this.cardHistory[this.playerIndex][j][i]);
            }
            arr.sort((a: number, b: number): number => {
                return a - b;
            });
            let lower = 0, lowerCount = 0, avg = 0, upper = 0, upperCount = 0;
            for (let j = 0; j < arr.length; j++) {
                if (j < Math.floor(arr.length / 4)) {
                    lower += arr[j];
                    lowerCount++;
                }
                avg += arr[j];
                if (j >= Math.floor(arr.length / 4 * 3)) {
                    upper += arr[j];
                    upperCount++;
                }
            }
            average.Value.push(new cc.Vec2(i, avg / arr.length));
            lowerAverage.Value.push(new cc.Vec2(i, lower / lowerCount));
            upperAverage.Value.push(new cc.Vec2(i, upper / upperCount));
        }
        this.visualizer.DrawLineChart("時間(%)", "手牌(張)", 100, Math.ceil(52 / this.cardHistory.length), [average, lowerAverage, upperAverage]);
    }

    showPlayCount() {
        this.visualizer.Clear();
        let average: LineChartData = {
            Color: cc.Color.GREEN,
            Name: "Average",
            Value: [],
        };
        let lowerAverage: LineChartData = {
            Color: cc.Color.BLUE,
            Name: "Lower Average",
            Value: [],
        };
        let upperAverage: LineChartData = {
            Color: cc.Color.RED,
            Name: "Upper Average",
            Value: [],
        };
        for (let i = 0; i < 100; i++) {
            let arr: number[] = [];
            for (let j = 0; j < this.cardHistory[this.playerIndex].length; j++) {
                arr.push(this.cardHistory[this.playerIndex][j][i] - this.cardHistory[this.playerIndex][j][i + 1]);
            }
            arr.sort((a: number, b: number): number => {
                return a - b;
            });
            let lower = 0, lowerCount = 0, avg = 0, upper = 0, upperCount = 0;
            for (let j = 0; j < arr.length; j++) {
                if (j < Math.floor(arr.length / 4)) {
                    lower += arr[j];
                    lowerCount++;
                }
                avg += arr[j];
                if (j >= Math.floor(arr.length / 4 * 3)) {
                    upper += arr[j];
                    upperCount++;
                }
            }
            average.Value.push(new cc.Vec2(i, avg / arr.length));
            lowerAverage.Value.push(new cc.Vec2(i, lower / lowerCount));
            upperAverage.Value.push(new cc.Vec2(i, upper / upperCount));
        }
        this.visualizer.DrawLineChart("時間(%)", "打出(張)", 100, 1, [average, lowerAverage, upperAverage]);
    }

    showPlayType() {
        this.visualizer.Clear();
        const name: string[] = ["單張", "一對", "兩對", "三條", "順子", "同花", "葫蘆", "鐵支", "同花順", "五張"];
        let data: BarChartData[] = [];
        for (let i = 0; i < name.length; i++) {
            let cardType: BarChartData = {
                Name: name[i],
                Value: this.playTypeCount[this.playerIndex][i] / this.cardHistory[this.playerIndex].length,
            };
            if (cardType.Value > 0) {
                data.push(cardType);
            }
        }
        this.visualizer.DrawBarChart("平均次數", 5, data, true);
    }

    showStartType() {
        this.visualizer.Clear();
        const name: string[] = ["單張", "一對", "兩對", "三條", "順子", "同花", "葫蘆", "鐵支", "同花順", "五張"];
        let data: BarChartData[] = [];
        for (let i = 0; i < name.length; i++) {
            let cardType: BarChartData = {
                Name: name[i],
                Value: this.startTypeCount[this.playerIndex][i] / this.cardHistory[this.playerIndex].length,
            };
            if (cardType.Value > 0) {
                data.push(cardType);
            }
        }
        this.visualizer.DrawBarChart("平均次數", 5, data, true);
    }

    showStyle() {
        this.visualizer.Clear();
        let control: LineChartData = {
            Color: cc.Color.RED,
            Name: "控制",
            Value: [],
        };
        let secondary: LineChartData = {
            Color: cc.Color.BLUE,
            Name: "保守",
            Value: [],
        };
        let fast: LineChartData = {
            Color: cc.Color.GREEN,
            Name: "組牌",
            Value: [],
        };
        let other: LineChartData = {
            Color: cc.Color.BLACK,
            Name: "其他",
            Value: [],
        };
        for (let i = 0; i < 100; i++) {
            control.Value.push(new cc.Vec2(i, this.styleHistory[this.playerIndex][i][0] / this.cardHistory[this.playerIndex].length));
            secondary.Value.push(new cc.Vec2(i, this.styleHistory[this.playerIndex][i][1] / this.cardHistory[this.playerIndex].length));
            fast.Value.push(new cc.Vec2(i, this.styleHistory[this.playerIndex][i][2] / this.cardHistory[this.playerIndex].length));
            other.Value.push(new cc.Vec2(i, this.styleHistory[this.playerIndex][i][3] / this.cardHistory[this.playerIndex].length));
        }
        this.visualizer.DrawLineChart("時間(%)", "策略(比例)", 100, 1, [control, secondary, fast, other]);
    }

    showStyleRate() {
        this.visualizer.Clear();
        const name: string[] = ["控制", "保守", "組牌", "其他"];
        let data: BarChartData[] = [];
        for (let i = 0; i < name.length; i++) {
            let styleType: BarChartData = {
                Name: name[i],
                Value: this.styleTypeCount[this.playerIndex][i] / this.playCount[this.playerIndex],
            };
            if (styleType.Value > 0) {
                data.push(styleType);
            }
        }
        this.visualizer.DrawBarChart("平均比例", 1, data, true);
    }

    showRankScore() {
        this.visualizer.Clear();
        let data: BarChartData[] = [];
        for (let i = 0; i < 10; i++) {
            let rankType: BarChartData = {
                Name: "LV." + (i + 1),
                Value: this.rankScore[this.playerIndex][i] / this.rankCount[this.playerIndex][i],
            };
            data.push(rankType);
        }
        this.visualizer.DrawBarChart("平均分數", 20, data, false);
    }
}

function countCard(card: number): number {
    let count = 0;
    while (card > 0) {
        count += card % 2;
        card = Math.floor(card / 2);
    }
    return count;
}