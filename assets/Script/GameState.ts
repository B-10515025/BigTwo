import CardSet from "./CardSet"
import { State, Action } from "./Client"
import GameResult from "./GameResult"

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameState extends cc.Component {

    @property(cc.Label)
    cardScoreLabel: cc.Label;

    @property(cc.Label)
    referDataLabel: cc.Label;

    @property(cc.Node)
    referPassNode: cc.Node;

    @property(CardSet)
    referCard: CardSet;

    @property([CardSet])
    playersCard: CardSet[] = [];

    @property([CardSet])
    perviousCard: CardSet[] = [];

    @property([cc.Node])
    passNode: cc.Node[] = [];

    @property([cc.Node])
    timerNode: cc.Node[] = [];

    @property(GameResult)
    result: GameResult;

    state: State;

    SetGameState (state: State) {
        this.state = state;
        this.cardScoreLabel.string = "";
        for (let i = 0; i < state.CardScore.length; i++) {
            this.cardScoreLabel.string += "Player" + (i + 1) + ": ";
            let lv = state.Threshold.length + 1;
            for (let j = 0; j < state.Threshold.length; j++) {
                if (state.CardScore[i] < state.Threshold[j]) {
                    lv = j + 1;
                    break;
                } 
            }
            this.cardScoreLabel.string += "LV." + lv;
            this.cardScoreLabel.string += " (" + state.CardScore[i].toFixed(3) + ")\n";
        }
        this.referDataLabel.string = "";
        this.referPassNode.active = false;
        this.referCard.SetCard(0, false);
        if (state.LastIndex >= 0) {
            let style: string;
            const name: string[] = ["控制", "保守", "組牌", "其他"];
            style = "無選擇";
            for (let i = 0; i < state.ReferCurrent.Style.length; i++) {
                if (state.ReferCurrent.Style[i] > 0) {
                    style = name[i];
                    break;
                }
            }
            this.referDataLabel.string += "目前策略: " + style + "\n";
            style = "無選擇";
            for (let i = 0; i < state.ReferCurrent.ReferStyle.length; i++) {
                if (state.ReferCurrent.ReferStyle[i] > 0) {
                    style = name[i];
                    break;
                }
            }
            this.referDataLabel.string += "推薦策略: " + style + "\n" + "推薦出牌:";
            if (state.ReferCurrent.Reference > 0) {
                this.referCard.SetCard(state.ReferCurrent.Reference, false);
            } else {
                this.referPassNode.active = true;
            }
        }
        this.Reset();
        for (let i = 0; i < state.PlayersCard.length; i++) {
            this.playersCard[seatIndex(i, state.PlayersCard.length)].SetCard(state.PlayersCard[i], i == state.PlayingIndex);
        }
        for (let i = 0; i < state.PerviousCard.length; i++) {
            if (i == state.PlayingIndex) {
                this.timerNode[seatIndex(i, state.PerviousCard.length)].active = true;
            } else if (state.PerviousCard[i] == 0) {
                this.passNode[seatIndex(i, state.PerviousCard.length)].active = true;
            } else if (state.PerviousCard[i] > 0) {
                this.perviousCard[seatIndex(i, state.PerviousCard.length)].SetCard(state.PerviousCard[i], false);
            }
        }
        const RuleDoubleMultiply = 1 << 28;
        if (state.PlayersResult.length > 0) {
            this.result.ShowResult(state.PlayersResult, (state.Config.Rule & RuleDoubleMultiply) == RuleDoubleMultiply, state.IsFirstResult);
        } else {
            this.result.node.active = false;
        }
    }

    Reset() {
        for (let i = 0;i < this.playersCard.length; i++) {
            this.playersCard[i].SetCard(0, false);
        }
        for (let i = 0;i < this.perviousCard.length; i++) {
            this.perviousCard[i].SetCard(0, false);
        }
        for (let i = 0;i < this.passNode.length; i++) {
            this.passNode[i].active = false;
        }
        for (let i = 0;i < this.timerNode.length; i++) {
            this.timerNode[i].active = false;
        }
    }

    GetAction(): Action {
        let action: Action;
        if (!this.state) {
            return action;
        }
        action = {
            Index: this.state.PlayingIndex,
            Card: this.playersCard[seatIndex(this.state.PlayingIndex, this.state.PerviousCard.length)].Choose,
        };
        return action;
    }

}

function seatIndex(index: number, total: number): number {
    const sortIndex = [
        [0, 2, 1, 3],
        [0, 1, 3, 2],
        [0, 1, 2, 3]
    ]
    return sortIndex[total - 2][index];
}
