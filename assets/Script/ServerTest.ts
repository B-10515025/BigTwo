import { Client, Config } from "./Client"

const {ccclass, property} = cc._decorator;

@ccclass
export default class ServerTest extends cc.Component {

    public static Test(players: number, games: number) {
        let Config: Config = {
            PlayerCount: 4,
            DoubleRate: 1,
            Rule: 0,
            BotName: ["Rule-BasedAIV2", "Rule-BasedAIV2", "Rule-BasedAIV2", "Rule-BasedAIV2"],
            BotStyle: [[0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0]],
            Dealer: "Random",
            Debug: [0, 0, 0, 0],
    
            GameType: 0,
        };
        for (let i = 0; i < players; i++) {
            Client.SendMessage("user.login", "player" + i);
            for (let j = 0; j < games; j++) {
                Config.GameType = Math.floor(Math.random() * 4) % 3;
                Client.SendMessage("game.new", Config);
                Client.SendMessage("user.evaluate.card", 0);
                for (let k = 0; k < 128; k++) {
                    Client.SendMessage("game.next", "");
                }
                Client.SendMessage("user.evaluate.game", 0)
            }
        }
    }

}
