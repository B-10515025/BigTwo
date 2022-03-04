import CardSet from "./CardSet"
import { Client, Config, Message, NameLists } from "./Client"
import DropDown from "./DropDown"
import TestResult from "./TestResult";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Menu extends cc.Component {

    // Bot
    @property(cc.Node)
    botNode: cc.Node;

    @property(cc.Button)
    closeBotButton: cc.Button;

    @property([DropDown])
    botSelectors: DropDown[] = [];

    @property([cc.Label])
    botStyleLabel: cc.Label[] = [];

    @property(DropDown)
    dealerSelectors: DropDown;

    @property(DropDown)
    styleSelectors: DropDown;

    @property([cc.Slider])
    styleSlider: cc.Slider[] = [];
    
    @property(cc.Button)
    confirmBotButton: cc.Button;

    // Config
    @property(cc.Node)
    configNode: cc.Node;

    @property(cc.Button)
    closeConfigButton: cc.Button;
    
    @property(cc.Button)
    defaultIGSButton: cc.Button;

    @property(cc.Button)
    defaultHHFButton: cc.Button;

    @property(cc.Button)
    confirmConfigButton: cc.Button;

    @property(cc.ToggleContainer)
    playerToggleContainer: cc.ToggleContainer;

    @property([cc.Toggle])
    ruleToggleList: cc.Toggle[] = [];

    @property(DropDown)
    doubleRate: DropDown;

    // Replay
    @property(TestResult)
    gameResult: TestResult;

    // Debug
    @property(cc.Button)
    editButton: cc.Button;

    @property(cc.Node)
    editNode: cc.Node;

    @property(DropDown)
    cardSelectors: DropDown;

    @property(cc.Button)
    pushButton: cc.Button;
    
    @property(cc.Button)
    popButton: cc.Button;

    @property(cc.Button)
    flushButton: cc.Button;

    @property(cc.Button)
    clearButton: cc.Button;

    @property(CardSet)
    deckCard: CardSet;

    @property([CardSet])
    playersCard: CardSet[] = [];

    @property(cc.Button)
    closeEditButton: cc.Button;

    Config: Config = {
        PlayerCount: 0,
        DoubleRate: 1,
        Rule: 0,
        BotName: [],
        BotStyle: [[0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]],
        Dealer: "",
        Debug: [0, 0, 0, 0],
    };

    playerIndex: number = 0;

    onLoad () {
        this.botNode.active = false;
        this.configNode.active = true;
        this.setSelect();
        this.default_IGS();
        this.setConfig();
        this.closeBotButton.node.on('click', () => { this.botNode.active = false; });
        this.confirmBotButton.node.on('click', () => { this.setSelect(); });
        const name: string[] = ["Player1", "Player2", "Player3", "Player4"];
        this.styleSelectors.SetNames(name);
        this.styleSelectors.OnChange = () => {
            for (let i = 0; i < this.styleSlider.length; i++) {
                this.Config.BotStyle[name.indexOf(this.styleSelectors.GetCurrent())][i] = this.styleSlider[i].progress;
            }
            this.updateStyle();
        }
        for (let i = 0; i < this.styleSlider.length; i++) {
            this.styleSlider[i].node.on("slide", (target: cc.Slider) => {
                this.Config.BotStyle[name.indexOf(this.styleSelectors.GetCurrent())][i] = target.progress;
                this.updateStyle();
            })
        }
        this.closeConfigButton.node.on('click', () => { this.configNode.active = false; });
        this.defaultIGSButton.node.on('click', () => { this.default_IGS(); });
        this.defaultHHFButton.node.on('click', () => { this.default_HHF(); });
        this.confirmConfigButton.node.on('click', () => { this.setConfig(); });
        this.doubleRate.SetNames(["0", "1", "2", "3", "4", "5"]);
        this.doubleRate.SetCurrent("1");
        this.doubleRate.OnChange = () => {
            this.Config.DoubleRate = Number(this.doubleRate.GetCurrent());
        }
        Client.SetCallback("test.name", (message: Message) => { this.updateSelector(JSON.parse(message.Data)) });
        // Clear Game Replay
        this.gameResult.OpenResult(this.Config.PlayerCount, this.Config);
        this.gameResult.node.active = false;
        // Debug CardSet
        this.editButton.node.on('click', () => { this.editNode.active = true; });
        this.pushButton.node.on('click', () => {
            let index = name.indexOf(this.cardSelectors.GetCurrent());
            let card = this.deckCard.Choose;
            this.deckCard.SetCard(this.deckCard.Code - card, true, false);
            this.playersCard[index].SetCard(this.playersCard[index].Code + card, true, false);
        });
        this.popButton.node.on('click', () => {
            let index = name.indexOf(this.cardSelectors.GetCurrent());
            let card = this.playersCard[index].Choose;
            this.deckCard.SetCard(this.deckCard.Code + card, true, false);
            this.playersCard[index].SetCard(this.playersCard[index].Code - card, true, false);
        });
        this.flushButton.node.on('click', () => {
            let index = name.indexOf(this.cardSelectors.GetCurrent());
            let card = this.deckCard.Code;
            this.deckCard.SetCard(this.deckCard.Code - card, true, false);
            this.playersCard[index].SetCard(this.playersCard[index].Code + card, true, false);
        });
        this.clearButton.node.on('click', () => {
            let index = name.indexOf(this.cardSelectors.GetCurrent());
            let card = this.playersCard[index].Code;
            this.deckCard.SetCard(this.deckCard.Code + card, true, false);
            this.playersCard[index].SetCard(this.playersCard[index].Code - card, true, false);
        });
        this.closeEditButton.node.on('click', () => {
            for (let i = 0; i < this.playersCard.length; i++) {
                this.Config.Debug[i] = this.playersCard[i].Code;
            }
            this.editNode.active = false; 
        });
        this.cardSelectors.SetNames(name);
        this.deckCard.SetCard(Math.pow(2, 52) - 1, true, false);
        for (let i = 0; i < this.playersCard.length; i++) {
            this.playersCard[i].SetCard(0, true, false);
        }
    }

    updateSelector(nameLists: NameLists) {
        for (let i = 0; i < this.botSelectors.length; i++) {
            this.botSelectors[i].SetNames(nameLists.BotNameList);
        }
        this.dealerSelectors.SetNames(nameLists.DealerNameList);
        this.botNode.active = true;
    }

    updateStyle() {
        const name: string[] = ["控制加成: ", "保守加成: ", "組牌加成: ", "實力補正: "];
        for (let i = 0; i < this.botStyleLabel.length; i++) {
            this.botStyleLabel[i].string = "";
            for (let j = 0; j < this.Config.BotStyle[i].length; j++) {
                this.botStyleLabel[i].string += name[j] + this.Config.BotStyle[i][j].toFixed(3) + "\n";
            }
        }
    }

    OpenBotMenu() {
        this.updateStyle();
        Client.SendMessage("test.name", "");
    }

    setSelect() {
        this.Config.BotName = [];
        for (let i = 0; i < this.botSelectors.length; i++) {
            this.Config.BotName.push(this.botSelectors[i].GetCurrent());
        }
        this.Config.Dealer = this.dealerSelectors.GetCurrent();
        this.botNode.active = false;
    }

    OpenConfigMenu() {
        this.configNode.active = true;
    }

    default_IGS() {
        const using = [ true, false, true, true, false, true, true, true,
                        true, false, false, false, false, false, false,
                        false, true, false, false, false, false, false, true, true, true, true, false ];
        this.playerToggleContainer.toggleItems[2].isChecked = true;
        for (let i = 0; i < this.ruleToggleList.length; i++) {
            this.ruleToggleList[i].isChecked = using[i];
        }
    }

    default_HHF() {
        const using = [ true, false, false, true, false, true, true, true,
                        true, false, true, true, false, true, false,
                        true, true, true, true, true, true, true, false, false, true, false, true ];
        this.playerToggleContainer.toggleItems[1].isChecked = true;
        for (let i = 0; i < this.ruleToggleList.length; i++) {
            this.ruleToggleList[i].isChecked = using[i];
        }
    }

    setConfig() {
        for (let i = 0; i < this.playerToggleContainer.toggleItems.length; i++) {
            if (this.playerToggleContainer.toggleItems[i].isChecked) {
                this.Config.PlayerCount = i + 2;
                break;
            }
        }
        this.Config.Rule = 0;
        for (let i = 0; i < this.ruleToggleList.length; i++) {
            if (this.ruleToggleList[i].isChecked) {
                this.Config.Rule += rule(i);
            }
        }
        this.configNode.active = false;
    }

}

function rule(index: number) {
    const pow = [   0, 1, 2, 3, 4, 5, 6, 7,
                    8, 9, 10, 11, 12, 13, 14,
                    15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 28, 29, 
                    30];
    return (1 << pow[index + 1]) - (1 << pow[index]);
}
