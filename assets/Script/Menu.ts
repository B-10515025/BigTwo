import { Client, Config, Message } from "./Client"

const {ccclass, property} = cc._decorator;

@ccclass
export default class Menu extends cc.Component {

    // Bot
    @property(cc.Node)
    botNode: cc.Node;

    @property(cc.Button)
    closeBotButton: cc.Button;

    @property([cc.ToggleContainer])
    botToggleContainers: cc.ToggleContainer[] = [];

    @property(cc.Prefab)
    botPrefeb: cc.Node;

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

    Config: Config = {
        PlayerCount: 0,
        Rule: 0,
        BotName: [],
    };

    onLoad () {
        this.botNode.active = false;
        this.configNode.active = true;
        this.setBot();
        this.default_IGS();
        this.setConfig();
        this.closeBotButton.node.on('click', () => { this.botNode.active = false; });
        this.confirmBotButton.node.on('click', () => { this.setBot(); });
        this.closeConfigButton.node.on('click', () => { this.configNode.active = false; });
        this.defaultIGSButton.node.on('click', () => { this.default_IGS() });
        this.defaultHHFButton.node.on('click', () => { this.default_HHF() });
        this.confirmConfigButton.node.on('click', () => { this.setConfig(); });
        Client.SetCallback("test.name", (message: Message) => { this.updateBotNames(JSON.parse(message.Data)) });
    }

    updateBotNames(botNames: string[]) {
        const Height = 50;
        for (let i = 0; i < this.botToggleContainers.length; i++) {
            this.botToggleContainers[i].node.destroyAllChildren();
            this.botToggleContainers[i].node.removeAllChildren();
            for (let j = 0; j < botNames.length; j++) {
                var bot = cc.instantiate(this.botPrefeb);
                bot.getComponent(cc.Toggle).isChecked = this.Config.BotName[i] == botNames[j];
                bot.children[2].getComponent(cc.Label).string = botNames[j];
                bot.setPosition(0, -j * Height);
                bot.parent = this.botToggleContainers[i].node;
            }
        }
        this.botNode.active = true;
    }

    OpenBotMenu() {
        Client.SendMessage("test.name", "");
    }

    setBot() {
        this.Config.BotName = [];
        for (let i = 0; i < this.botToggleContainers.length; i++) {
            let name: string = "";
            for (let j = 0; j < this.botToggleContainers[i].node.children.length; j++) {
                if (this.botToggleContainers[i].node.children[j].getComponent(cc.Toggle).isChecked) {
                    name = this.botToggleContainers[i].node.children[j].children[2].getComponent(cc.Label).string;
                    break;
                }
            }
            this.Config.BotName.push(name);
        }
        this.botNode.active = false;
    }

    OpenConfigMenu() {
        this.configNode.active = true;
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
                    15, 16, 18, 20, 21, 22, 26, 27, 
                    28];
    return (1 << pow[index + 1]) - (1 << pow[index]);
}
