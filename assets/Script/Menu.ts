import { Config } from "./Client"

const {ccclass, property} = cc._decorator;

@ccclass
export default class Menu extends cc.Component {

    @property(cc.Button)
    closeButton: cc.Button;
    
    @property(cc.Button)
    defaultIGSButton: cc.Button;

    @property(cc.Button)
    defaultHHFButton: cc.Button;

    @property(cc.Button)
    confirmButton: cc.Button;

    @property(cc.ToggleContainer)
    playerToggleContainer: cc.ToggleContainer;

    @property([cc.Toggle])
    ruleToggleList: cc.Toggle[] = [];

    Config: Config = {
        PlayerCount: 0,
        Rule: 0,
        BotName: [],
    };

    onLoad () {
        this.default_IGS();
        this.setConfig();
        this.closeButton.node.on('click', () => { this.closeMenu() });
        this.defaultIGSButton.node.on('click', () => { this.default_IGS() });
        this.defaultHHFButton.node.on('click', () => { this.default_HHF() });
        this.confirmButton.node.on('click', () => { this.setConfig(); });
    }

    default_IGS() {
        const using = [ true, false, true, true, false, true, true, true,
                        true, false, false, false, false, false, false,
                        false, true, false, true, true, true, true, false ];
        this.playerToggleContainer.toggleItems[2].isChecked = true;
        for (let i = 0; i < this.ruleToggleList.length; i++) {
            this.ruleToggleList[i].isChecked = using[i];
        }
    }

    default_HHF() {
        const using = [ true, false, false, true, false, true, true, true,
                        true, false, true, true, false, true, false,
                        true, true, true, false, false, true, false, true ];
        this.playerToggleContainer.toggleItems[1].isChecked = true;
        for (let i = 0; i < this.ruleToggleList.length; i++) {
            this.ruleToggleList[i].isChecked = using[i];
        }
    }

    setConfig() {
        this.Config.BotName = [];
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
        this.closeMenu();
    }

    closeMenu() {
        this.node.active = false;
    }

}

function rule(index: number) {
    const pow = [   0, 1, 2, 3, 4, 5, 6, 7,
                    8, 9, 10, 11, 12, 13, 14,
                    15, 16, 18, 20, 21, 22, 26, 27, 
                    28];
    return (1 << pow[index + 1]) - (1 << pow[index]);
}
