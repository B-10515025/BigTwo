import CardSet from "./CardSet"
import { State, Action } from "./Client"
import GameResult from "./GameResult"

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameState extends cc.Component {

    @property(cc.Label)
    cardScoreLabel: cc.Label;

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
        const threshold = -0.56;
        this.cardScoreLabel.string = "";
        for (let i = 0; i < state.CardScore.length; i++) {
            this.cardScoreLabel.string += "Player" + (i + 1) + ": ";
            if (state.CardScore[i] < threshold) {
                this.cardScoreLabel.string += "弱";
            } else {
                this.cardScoreLabel.string += "強";
            }
            this.cardScoreLabel.string += "(" + state.CardScore[i].toFixed(3) + ")\n";
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
