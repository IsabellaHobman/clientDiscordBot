const Discord = require("Discord.js");
const config = require('./config.json');
const client = new Discord.Client;
const fetch = require('node-fetch');
const locked = false;
const mongo = require('mongodb');
const burnerWallet = "0x0000000000000000000000000000000000000000"
const firstPath = "https://api.etherscan.io/api?module=account&action=txlist&address="
const secondPath = "&startblock=0&endblock=99999999&sort=desc&apikey=YourApiKeyToken"
const MongoClient = require('mongodb').MongoClient;
const url = "path to mongoDB";
const firstTokenPath = "https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=0x2c50ba1ed5e4574c1b613b044bd1876f0b0b87a9&address="
const secondTokenPath = "&tag=latest&apikey=YourApiKeyToken"
const uri = "mongodb+srv://Sam:placeholder@collection.something.mongodb.net/Clients?retryWrites=true&w=majority"; // this obviously isn't the actual login.
const mongoClient = new MongoClient(uri, { useNewUrlParser: true });
const prefix = config.prefix;
const objectID = require('mongodb').ObjectID;

client.once('ready', () => {
  console.log("Logged on");
});

client.on('message', async message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return
  const args = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();
  switch(command){
  case "authorise":  // Don't want them trying to add wallets to the database when it's in use.
  const walletString = message.content.split(' ');
  const wallet = walletString[1].toString();
  if (wallet.length == 42) {
    let verifyPath = firstPath.concat(wallet);
    verifyPath = verifyPath.concat(secondPath);
  //  const verified = await fetch(verifyPath).then(resp => resp.json()).then(res => verify(res));
  //  if (verified) {
      let query = {userid: message.author.id};
      let preJson = {_id: null, userid: message.author.id, wallet : wallet};
      const exists = await findUser(preJson);
            if (exists) {
              message.channel.send("You're already registered!");
            }
            else {
              message.channel.send("All good to go!");
            }
}
  //  else {
  //    message.channel.send("I'm sorry, I can't find authorise that wallet. Please try again, and please send 1 KAASH to the burner wallet.")
  //  }

  else {
    message.channel.send("That wallet doesn't appear to be the right length. Please try again.")
  }
  break;
case "debugauthorise":
  message.channel.send("Okay, let's try.");
  const testWalletString = message.content.split(' ');
  const testWallet = testWalletString[1];
  const testObjectID = new objectID();
  const testPreJson = { _id: testObjectID, userid: message.author.id, wallet : testWallet};
  insertUser(testPreJson);
  break;
case "debugfind":
 findUser();
 break;
}
});
function timer(){
var currentTime = new Date();
if (currentTime.getMinutes() == 30 || currentTime.getMinutes() == 00 ) {
  gateKeep();
}
}
async function gateKeep(){
  locked= true;
  try {
  const thisSession = await mongoClient.connect();
  const database = thisSession.db("Clients");
  const collection = database.collection("users");
  const response = collection.find({}).toArray();
      locked = false;
      const userArray = await response.forEach(checkBalance);
    }
    finally {
      await thisSession.close();
    }
}
async function checkBalance(user, index){

  const account = firstTokenPath.concat(user.wallet)
  account = account.concat(secondTokenPath);
  const data = await fetch(account).then(resp => resp.json());
  return amount = [user.userid, parseFloat(data.result)];
}
function sortUsers(users){
  const sortedArray = users.sort((a, b) => b.result - a.result  )
  console.log(sortedArray);
  //for ( i = 0; i < 20 || i > sorted.array.length(); i++) {
    // give first discord tier
  //}
//for ( i = 20; i < 50 || i > sorted.array.length(); i++) {
    // give second tier
//  }
//   for ( i = 50; i < 100 || i > sorted.array.length(); i++){
    // give third
//  }
}
async function insertUser(user) {
  try {
    let objID = new objectID();
    user._id = objID;
    const thisSession = await mongoClient.connect();
    const database = thisSession.db("Clients");
    const collection = database.collection("users");
    const result = await collection.insertOne(user);
    console.log("Client inserted successfully.");
  }
  finally {
    await mongoClient.close();
  }
}
async function findUser(user) {
  try {
    const thisSession = await mongoClient.connect();
    const database = thisSession.db("Clients");
    const collection = database.collection("users");
    if (user != null ) {
      let query = user.userid;
      const tryFind = collection.findOne(query);
      if (tryFind == null){
        insertUser(user);
      }
      else {
        return false;
      }
    }
    const result = await collection.find({}).toArray();
  }
  finally {
    await mongoClient.close();
  }
}
async function verify(response) {
  if (response.status != 0 && response.result[0].to === "0x0000000000000000000000000000000000000000" || response.result[1].to === "0x0000000000000000000000000000000000000000") {
    return true;
  }
  else {
    return false;
  }
}
client.login(config.token);
