import { Client, FeatureInfo, Message } from "./Client"
import DropDown from "./DropDown"
import Replay from "./Replay"
import { BarChartColumn, BarChartData, Visualizer } from "./Visualizer"

const {ccclass, property} = cc._decorator;

@ccclass
export default class Analysis extends cc.Component {

    @property(DropDown)
    typeDropdown: DropDown;

    @property(DropDown)
    targetDropdown: DropDown;

    @property(cc.Label)
    countLabel: cc.Label;
    
    @property(cc.Button)
    filterButton: cc.Button;

    @property(cc.Button)
    refreshButton: cc.Button;

    @property(cc.Button)
    closeButton: cc.Button;

    @property(Visualizer)
    visualizer: Visualizer;

    @property(Replay)
    replay: Replay;

    @property(cc.Node)
    filterNode: cc.Node;

    @property(cc.Button)
    filterCloseButton: cc.Button;

    @property(cc.EditBox)
    searchNameBox: cc.EditBox;

    @property(DropDown)
    searchTypeDropdown: DropDown;

    @property(DropDown)
    searchResultDropdown: DropDown;

    @property(DropDown)
    startYearDropdown: DropDown;
    
    @property(DropDown)
    startMonthDropdown: DropDown;

    @property(DropDown)
    startDayDropdown: DropDown;

    @property(DropDown)
    startHourDropdown: DropDown;

    @property(DropDown)
    startMinuteDropdown: DropDown;

    @property(DropDown)
    endYearDropdown: DropDown;

    @property(DropDown)
    endMonthDropdown: DropDown;

    @property(DropDown)
    endDayDropdown: DropDown;

    @property(DropDown)
    endHourDropdown: DropDown;

    @property(DropDown)
    endMinuteDropdown: DropDown;

    featureList: FeatureInfo[];
    
    onLoad () {
        this.typeDropdown.SetNames(["手牌調整評價", "KPI-勝負", "KPI-最大名次變動", "KPI-平均手牌數量", "KPI-手牌減少率", "KPI-優勢變化率", "遊戲紀錄回放"]);
        this.typeDropdown.OnChange = () => {
            if (this.typeDropdown.GetCurrent() == "遊戲紀錄回放") {
                this.targetDropdown.SetNames(["-"]);
                this.targetDropdown.SetCurrent("-");
            } else {
                this.targetDropdown.SetNames(["詳細", "精簡"]);
                if (this.targetDropdown.GetIndex() < 0) {
                    this.targetDropdown.SetCurrent("精簡");
                }
            } 
            this.Draw();
        }
        this.targetDropdown.SetNames(["詳細", "精簡"]);
        this.targetDropdown.SetCurrent("精簡");
        this.targetDropdown.OnChange = () => {
            this.Draw();
        }
        this.filterButton.node.on('click', () => { this.filterNode.active = true });
        this.refreshButton.node.on('click', () => { Client.SendMessage("user.feature", "") });
        this.closeButton.node.on('click', () => { this.node.active = false });
        this.filterCloseButton.node.on('click', () => { 
            this.filterNode.active = false;
            this.Draw();
        });
        this.searchNameBox.string = "";
        this.searchTypeDropdown.SetNames(["正常發牌", "勝率加倍", "勝率減半", "有調整(好+差)", "全部"]);
        this.searchTypeDropdown.SetCurrent("全部");
        this.searchResultDropdown.SetNames(["遊戲失敗", "遊戲獲勝", "全部"]);
        this.searchResultDropdown.SetCurrent("全部");
        let nowYear = new Date().getFullYear();
        let years = [];
        for (let i = 2022; i <= nowYear; i++) {
            years.push(i + "年");
        }
        this.startYearDropdown.SetNames(years);
        this.endYearDropdown.SetNames(years);
        this.endYearDropdown.SetCurrent(nowYear + "年");
        let months = [];
        for (let i = 1; i <= 12; i++) {
            months.push(i + "月");
        }
        let SIZE = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        this.startMonthDropdown.SetNames(months);
        this.startMonthDropdown.OnChange = () => {
            let days = [];
            for (let i = 1; i <= SIZE[this.startMonthDropdown.GetIndex()]; i++) {
                days.push(i + "日");
            }
            this.startDayDropdown.SetNames(days);
            if (this.startDayDropdown.GetIndex() < 0) {
                this.startDayDropdown.SetCurrent("1日");
            }
        }
        this.endMonthDropdown.SetNames(months);
        this.endMonthDropdown.SetCurrent("12月");
        this.endMonthDropdown.OnChange = () => {
            let days = [];
            for (let i = 1; i <= SIZE[this.endMonthDropdown.GetIndex()]; i++) {
                days.push(i + "日");
            }
            this.endDayDropdown.SetNames(days);
            if (this.endDayDropdown.GetIndex() < 0) {
                this.endDayDropdown.SetCurrent("1日");
            }
        }
        let days = [];
        for (let i = 1; i <= 31; i++) {
            days.push(i + "日");
        }
        this.startDayDropdown.SetNames(days);
        this.endDayDropdown.SetNames(days);
        this.endDayDropdown.SetCurrent("31日");
        let hours = [];
        for (let i = 0; i < 24; i++) {
            hours.push(i + "時");
        }
        this.startHourDropdown.SetNames(hours);
        this.endHourDropdown.SetNames(hours);
        this.endHourDropdown.SetCurrent("23時");
        let minutes = [];
        for (let i = 0; i < 60; i++) {
            minutes.push(i + "分");
        }
        this.startMinuteDropdown.SetNames(minutes);
        this.endMinuteDropdown.SetNames(minutes);
        this.endMinuteDropdown.SetCurrent("59分");
        Client.SetCallback("user.feature", (message: Message) => {
            this.featureList = JSON.parse(message.Data);
            this.node.active = true;
            this.Draw();
        });
        this.node.active = false;
    }

    Open() {
        Client.SendMessage("user.feature", "");
        this.visualizer.Clear();
    }

    Draw() {
        let featureList: FeatureInfo[] = [];
        let type = this.searchTypeDropdown.GetIndex();
        let result = this.searchResultDropdown.GetIndex();
        let startTime = new Date(Number(this.startYearDropdown.GetCurrent().slice(0,4)), this.startMonthDropdown.GetIndex(), this.startDayDropdown.GetIndex(), this.startHourDropdown.GetIndex(), this.startMinuteDropdown.GetIndex(), 0).getTime() * 1000000;
        let endTime = new Date(Number(this.endYearDropdown.GetCurrent().slice(0,4)), this.endMonthDropdown.GetIndex(), this.endDayDropdown.GetIndex(), this.endHourDropdown.GetIndex(), this.endMinuteDropdown.GetIndex(), 0).getTime() * 1000000;
        if (endTime < startTime) {
            let temp = startTime;
            startTime = endTime;
            endTime = temp;
        }
        for (let i = 0; i < this.featureList.length; i++) {
            if (this.searchNameBox.string != "" && this.featureList[i].NickName.indexOf(this.searchNameBox.string) < 0) {
                continue;
            }
            if ((type < 3 && type != this.featureList[i].GameType) || (type == 3 && this.featureList[i].GameType == 0)) {
                continue;
            }
            if (result < 2 && result != this.featureList[i].Win) {
                continue;
            }
            if (this.featureList[i].Time < startTime || this.featureList[i].Time > endTime) {
                continue;
            }
            let feature: FeatureInfo = this.featureList[i];
            feature.Index = i;
            featureList.push(feature);
        }
        this.countLabel.string = "資料場數:" + featureList.length;
        if (this.typeDropdown.GetCurrent() == "遊戲紀錄回放") {
            this.visualizer.node.active = false;
            this.replay.Open(featureList, this.featureList);
        } else {
            this.replay.node.active = false;
            this.visualizer.node.active = true;
            this.visualizer.Clear();
            const KEY = ["GameType", "Win", "TurnMaxOrderDiff", "TurnAvgCardRate", "TurnMaxRateDiff", "ReverseRate"];
            const NAME = [
                ["正常發牌", "勝率加倍", "勝率減半"],
                ["遊戲失敗", "遊戲獲勝"],
                ["豪無變動", "只差1位", "變動2位", "多達3位"],
                ["遠小於平均", "略低於平均", "約為平均值", "略高於平均", "遠大於平均"],
                ["毫無減少機會", "減少比例微弱", "出牌機會普通", "有機會取得優勢", "單輪大量領先"],
                ["後期反超", "後期較優", "前後期平均", "前期較優", "前期領先"],
            ];
            const CLASS = [
                ["正常", "高勝率", "低勝率"],
                ["正常", "有調整"],
                ["極差", "略差", "略好", "極好"],
                ["偏差", "偏好"],
            ];
            let typeIndex = this.typeDropdown.GetIndex();
            let targetIndex = this.targetDropdown.GetIndex();
            let classIndex = typeIndex;
            if (classIndex > 1) {
                classIndex = 1;
            }
            classIndex = classIndex * 2 + targetIndex;
            let total = [];
            for (let i = 0; i < NAME[typeIndex].length; i++) {
                total.push(0);
            }
            let count = [];
            for (let i = 0; i < CLASS[classIndex].length; i++) {
                let temp = [];
                for (let j = 0; j < NAME[typeIndex].length; j++) {
                    temp.push(0);
                }
                count.push(temp);
            }
            let arr = [];
            if (typeIndex > 2) {
                for (let i = 0; i < this.featureList.length; i++) {
                    arr.push(this.featureList[i][KEY[typeIndex]]);
                }
                arr.sort((a: number, b: number): number => {
                    return a - b;
                });
            }
            for (let i = 0; i < featureList.length; i++) {
                let index = featureList[i][KEY[typeIndex]];
                if (typeIndex > 2) {
                    index = Math.floor(arr.indexOf(featureList[i][KEY[typeIndex]]) / arr.length * total.length);
                }
                total[index]++;
                let target = 0;
                if (classIndex == 0) {
                    target = featureList[i].CardEvaluate;
                } else if (classIndex == 2) {
                    target = featureList[i].GameEvaluate;
                } else if (classIndex == 1) {
                    if (featureList[i].CardEvaluate > 0) {
                        target = 1;
                    } 
                } else {
                    if (featureList[i].GameEvaluate > 1) {
                        target = 1;
                    } 
                }
                count[target][index]++;
            }
            const COLOR: cc.Color[] = [new cc.Color(57, 111, 201), new cc.Color(247, 120, 39), new cc.Color(181, 230, 29), new cc.Color(254, 198, 13)];
            let data: BarChartData[] = [];
            let column: BarChartColumn[] = [];
            for (let i = 0; i < count.length; i++) {
                let bar: BarChartData = {
                    Name: CLASS[classIndex][i],
                    Color: COLOR[i % COLOR.length],
                    Value: [],
                }
                for (let j = 0; j < total.length; j++) {
                    let value = 0;
                    if (total[j] > 0) {
                        value = count[i][j] / total[j] * 100;
                    }
                    bar.Value.push(value);
                }
                data.push(bar);
            }
            for (let i = 0; i < total.length; i++) {
                let col: BarChartColumn = {
                    Name: NAME[typeIndex][i],
                    Value: total[i],
                }
                column.push(col)
            }
            this.visualizer.DrawBarChart("場數比例(%)", 100, data, column);
        }
    }

}
