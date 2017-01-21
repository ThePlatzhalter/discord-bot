const Discord = require('discord.io')
const devRant = require('devrant')
const co      = require('co')
const config  = require('./opts')
let bot       = new Discord.Client({
	token: config.token,
	autorun: true
})

let helpMsg = `devRantDiscord made by szymex73
\`\`\`List of commands:
 - help » displays this message
 - post (id) » fetches rant and displays it
 - profile (username) » fetches profile and displays basic info about the user
	
				 
Notice that API calls can take some time to finish
You can invite the bot using this link:
https://discordapp.com/oauth2/authorize?client_id=${bot.id}&scope=bot&permissions=0
Or test it on szymex73's server (invite code: FDBQKMY)
\`\`\``

function getProfile(username) {
  return co(function *fetchProfile() {    
    const profile = yield devRant.profile(username);
    return profile
  });
}

bot.on('ready', () => {
	console.log(bot.username, "- (", bot.id, ")")
})

bot.on('message', (user, userID, channelID, message, event) => {
	if(userID != bot.id) {
		if(message.startsWith("dR ")) {
			let msg = message.substring(3)


			if(msg.startsWith("help")) {
				bot.sendMessage({
					to: channelID,
					message: helpMsg
				}, (err, res) => {
					if (err) { console.error(err) }
				})
			} else if(msg.startsWith("post")) {
				let id     = msg.substring(5)
				let isID = /^[0-9]+$/.test(id)
				if(isID) {
					devRant
						.rant(parseInt(id))
						.then((rant) => {
							let res = rant
							if(res.success == true) {
								bot.sendMessage({
									to: channelID,
									message: `Here is content of rant no. \`${parseInt(id)}\`
									Author: \`${res.rant.user_username}\`
									\`\`\`${res.rant.text}\`\`\``
								}, (err, res) => {
									if (err) { console.error(err) }
								})
							}
						})
						.catch(function (err) {
     					console.log("Promise Rejected", err);
						});
				}
			} else if(msg.startsWith("profile")) {
				let username = msg.substring(8)
				let profile = {}
				getProfile(username)
					.then((res) => {
						profile = res
						bot.sendMessage({
							to: channelID,
							message: `User \`${profile.username}\`
							Score: \`${profile.score}\`
							About: \`${profile.about}\`
							Skills: \`${profile.skills}\`
							No. of rants: \`${profile.content.counts.rants}\``
						})
					})
					.catch(function (err) {
     				console.log("Promise Rejected", err);
					});
			}
		}
	}
})