import {
    withFbns
} from 'instagram_mqtt';
import {
    IgApiClient
} from 'instagram-private-api';
import chalk from 'chalk';
import moment from 'moment';
import fs from "fs"
import {
    match
} from 'assert';
import 'dotenv/config'

class InstagramAuto {
    async state(username) {
        const file = await fs.readFileSync("./data" + username + ".json", "utf-8")
        return file;
    }

    async sleep(waktu = parseInt(process.env.DELAY_LIMIT)) {
        return new Promise((resolve) => {
            setTimeout(resolve, waktu * 60000)
        })
    }

    async message() {
        const file = fs.readFileSync("message.txt", "utf-8")
        const final = file.toString().split("\n")
        const rand = final[Math.floor(Math.random() * final.length)]
        return rand
    }

    async already() {
        const file = fs.readFileSync("id_message.txt", "utf-8")
        const check = file.split("\n");
        const media = check.slice(-2);
        const mediaData = media[0];
        return mediaData
    }

    async login(username, password) {
        try {
            const ig = new IgApiClient()
            ig.state.generateDevice(username)
            const login = await ig.account.login(username, password)
            if (login.username == username) {
                console.log(chalk.green(`[ ${moment().format("HH:mm:ss")} ] Login successfully , saving state`));
                const state = await ig.state.serialize()
                delete state.constants
                const convert = JSON.stringify(state);

                //saving 
                fs.writeFileSync("./state/" + username + ".json", convert)
            } else {
                console.log(chalk.red(`[ ${moment().format("HH:mm:ss")} ] Login failed`, login));
                process.exit()
            }
        } catch (error) {
            console.log(error.message)
            process.exit()
        }


    }

    async runner() {
        const username = process.env.USERNAME_IG
        const password = process.env.PASSWORD_IG
        if (!fs.existsSync("./state/" + username + ".json")) {
            await this.login(username, password)
        }
        const cookie = fs.readFileSync("./state/" + username + ".json", "utf-8")
        const ig = withFbns(new IgApiClient())
        ig.state.deserialize(cookie)
        const checkUser = await ig.user.usernameinfo(username)
        console.log(chalk.blue(`[ ${moment().format("HH:mm:ss")} ] Login with ${checkUser.full_name}`));
        while (true) {
            const [thread] = await ig.feed.directInbox().records()
            const id = await this.already()

            if (thread.threadId == id) {
                console.log(chalk.red(`[ ${moment().format("HH:mm:ss")} ] Already send message to ${id}`));
                console.log(chalk.yellow(`[ ${moment().format("HH:mm:ss")} ] sleep for ${process.env.DELAY_LIMIT} minutes`));

                await this.sleep()
                continue;
            } else {
                fs.appendFileSync("id_message.txt", thread.threadId + "\n")
                const message = await this.message()
                console.log(chalk.blue(`[ ${moment().format("HH:mm:ss")} ] saving id : ${thread.threadId}`));
                console.log(chalk.green(`[ ${moment().format("HH:mm:ss")} ] try to message : ${message}`));
                const sendMessage = await thread.broadcastText(message)
                console.log(chalk.yellow(`[ ${moment().format("HH:mm:ss")} ] sleep for ${process.env.DELAY_LIMIT} minutes`));
                await this.sleep()

            }

        }





    }

}



export default InstagramAuto;