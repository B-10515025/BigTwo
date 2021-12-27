import { Client, Config, Message, NameLists } from "./Client"
import DropDown from "./DropDown"

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

    @property(DropDown)
    dealerSelectors: DropDown;
    
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

    Config: Config = {
        PlayerCount: 0,
        DoubleRate: 1,
        Rule: 0,
        BotName: [],
        Dealer: "",
        Debug: [],
    };

    onLoad () {
        this.botNode.active = false;
        this.configNode.active = true;
        this.setSelect();
        this.default_IGS();
        this.setConfig();
        this.closeBotButton.node.on('click', () => { this.botNode.active = false; });
        this.confirmBotButton.node.on('click', () => { this.setSelect(); });
        this.closeConfigButton.node.on('click', () => { this.configNode.active = false; });
        this.defaultIGSButton.node.on('click', () => { this.default_IGS() });
        this.defaultHHFButton.node.on('click', () => { this.default_HHF() });
        this.confirmConfigButton.node.on('click', () => { this.setConfig(); });
        this.doubleRate.SetNames(["0", "1", "2", "3", "4", "5"]);
        this.doubleRate.SetCurrent("1");
        this.doubleRate.OnChange = () => {
            this.Config.DoubleRate = Number(this.doubleRate.GetCurrent());
        }
        Client.SetCallback("test.name", (message: Message) => { this.updateSelector(JSON.parse(message.Data)) });
    }

    updateSelector(nameLists: NameLists) {
        for (let i = 0; i < this.botSelectors.length; i++) {
            this.botSelectors[i].SetNames(nameLists.BotNameList);
        }
        this.dealerSelectors.SetNames(nameLists.DealerNameList);
        this.botNode.active = true;
    }

    OpenBotMenu() {
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
