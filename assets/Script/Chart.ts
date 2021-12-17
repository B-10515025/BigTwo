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
    typeCount: number[][];

    playerIndex: number;
    chartType: string;

    onLoad () {
        this.updatePerRender = 60;
        this.updateCount = 0;
        //設定UI
        this.closeButton.node.on('click', () => { this.node.active = false; });
        this.typeDropDown.SetNames(["Card Count", "Play Type"]);
        this.typeDropDown.OnChange = () => {
            this.chartType = this.typeDropDown.GetCurrent();
            this.updated = false;
        }
    }

    Reset (PlayerCount: number) {
        this.cardHistory = [];
        this.typeCount = [];
        for (let i = 0; i < PlayerCount; i++) {
            this.cardHistory.push([]);
            let arr: number[] = [];
            for (let j = 0; j < 10; j++) {
                arr.push(0);
            }
            this.typeCount.push(arr);
        }
        this.updated = true;
    }

    TestUpdate(state: State) {
        this.updated = false;
        // update visualization data
        if (state.History && state.History.length > 0) {
            for (let i = 0; i < state.Config.PlayerCount; i++) {
                let cardCounts: number[] = [];
                for (let j = 0; j < state.History.length; j++) {
                    cardCounts.push(countCard(state.History[j].PlayersCard[i]));
                    if (state.History[j].Index == i && state.History[j].ActionCard.Code > 0) {
                        this.typeCount[i][state.History[j].ActionCard.Type]++;
                    }
                }
                let data: number[] = [];
                for (let j = 0; j <= 100; j++) {
                    let X = j / 100 * (state.History.length - 1);
                    let prevY = cardCounts[Math.floor(X)];
                    let nextY = cardCounts[Math.ceil(X)];
                    let Y = prevY + (X - Math.floor(X)) * (nextY - prevY);
                    data.push(Y);
                }
                this.cardHistory[i].push(data);
            }
        }
    }

    OpenChart(index: number) {
        this.playerIndex = index;
        this.nameLabel.string = "Player " + (index + 1);
        this.node.active = true;
        this.updated = false;
    }

    update (dt) {
        if (this.updateCount < this.updatePerRender) {
            this.updateCount++;
            return;
        }
        if (this.updated) {
            return;
        }
        if (this.playerIndex < 0 || this.playerIndex >= this.cardHistory.length || this.playerIndex >= this.typeCount.length) {
            return;
        }
        switch (this.chartType) {
            case "Card Count":
                this.showCardCount();
                break;
            case "Play Type":
                this.showPlayType();
                break;
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
            let lower = 0;
            for (let j = 0; j < Math.floor(arr.length / 2); j++) {
                lower += arr[j];
            }
            let upper = 0;
            for (let j = Math.floor(arr.length / 2); j < arr.length; j++) {
                upper += arr[j];
            }
            average.Value.push(new cc.Vec2(i, (lower + upper) / arr.length));
            lowerAverage.Value.push(new cc.Vec2(i, lower * 2 / arr.length));
            upperAverage.Value.push(new cc.Vec2(i, upper * 2 / arr.length));
        }
        this.visualizer.DrawLineChart("時間(%)", "手牌(張)", 100, Math.ceil(52 / this.cardHistory.length), [average, lowerAverage, upperAverage]);
    }

    showPlayType() {
        this.visualizer.Clear();
        const name: string[] = ["單張", "一對", "兩對", "三條", "順子", "同花", "葫蘆", "鐵支", "同花順", "五張"];
        let data: BarChartData[] = [];
        for (let i = 0; i < name.length; i++) {
            let cardType: BarChartData = {
                Name: name[i],
                Value: this.typeCount[this.playerIndex][i] / this.cardHistory[this.playerIndex].length,
            };
            if (cardType.Value > 0) {
                data.push(cardType);
            }
        }
        this.visualizer.DrawBarChart("平均次數", 7, data);
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