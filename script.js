const {promisify} = require("util");
let { exec , spawn} = require('child_process');
const axios = require("axios");

// exec = promisify(exec)

let npm = exec('npm run dev', {detached: true});

setTimeout(async () => {
    let fused = await axios.post("http://localhost:3000/api/update/fused")
    console.log("fused", fused.data)

    let traits = await axios.post("http://localhost:3000/api/update/traits")
    console.log("traits", traits.data)

    let token_rarity = await axios.post("http://localhost:3000/api/update/token-rarity")
    console.log("token_rarity", token_rarity.data)

    npm.kill();
}, 1000)

