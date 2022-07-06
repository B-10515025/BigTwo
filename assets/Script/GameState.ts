import CardSet from "./CardSet"
import { Action, State } from "./Client"
import GameResult from "./GameResult"

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameState extends cc.Component {

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

    @property(Boolean)
    replay: boolean = false;

    state: State;
    hintIndex: number = 0;

    SetGameState(state: State) {
        this.state = state;
        this.hintIndex = 0;
        this.Reset();
        for (let i = 0; i < state.PlayersCard.length; i++) {
            this.playersCard[seatIndex(i, state.PlayersCard.length)].SetCard(state.PlayersCard[i], i == state.PlayingIndex, i > 0 && !this.replay);
        }
        for (let i = 0; i < state.PerviousCard.length; i++) {
            if (i == state.PlayingIndex) {
                this.timerNode[seatIndex(i, state.PerviousCard.length)].active = true;
            } else if (state.PerviousCard[i] == 0) {
                this.passNode[seatIndex(i, state.PerviousCard.length)].active = true;
            } else if (state.PerviousCard[i] > 0) {
                this.perviousCard[seatIndex(i, state.PerviousCard.length)].SetCard(state.PerviousCard[i], false, false);
            }
        }
        const RuleDoubleMultiply = 1 << 28;
        if (state.PlayersResult.length > 0) {
            this.result.ShowResult(state.PlayersResult, (state.Config.Rule & RuleDoubleMultiply) == RuleDoubleMultiply);
        } else {
            this.result.node.active = false;
        }
    }

    Reset() {
        for (let i = 0;i < this.playersCard.length; i++) {
            this.playersCard[i].SetCard(0, false, false);
        }
        for (let i = 0;i < this.perviousCard.length; i++) {
            this.perviousCard[i].SetCard(0, false, false);
        }
        for (let i = 0;i < this.passNode.length; i++) {
            this.passNode[i].active = false;
        }
        for (let i = 0;i < this.timerNode.length; i++) {
            this.timerNode[i].active = false;
        }
    }

    Refresh() {
        if (this.state) {
            this.state.IsFirstResult = false;
            this.SetGameState(this.state);
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

    GetHint() {
        if (this.state.PlayHints[this.state.PlayingIndex].length > 0) {
            this.playersCard[seatIndex(this.state.PlayingIndex, this.state.PerviousCard.length)].ChooseCard(this.state.PlayHints[this.state.PlayingIndex][this.hintIndex].Code);
            this.hintIndex = (this.hintIndex + 1) % this.state.PlayHints[this.state.PlayingIndex].length;
        }
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
