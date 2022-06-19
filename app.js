import child from "child_process"
import
InstagramAuto
from "./task.js"

async function updater() {
    const up = child.spawnSync("git", ['pull'])
    console.log(up.stdout);
}

async function main() {
    await updater()
    const ig = new InstagramAuto()
    await ig.runner()


}

main().catch((err) => {
    console.log(err);
})