// https://discordapp.com/oauth2/authorize?client_id=272131727697117204&scope=bot&permissions=0

const Discord = require('discord.io')
const devRant = require('devrant')
const co      = require('co')
let bot       = new Discord.Client({
//	token: "MjA0MjgwNTU4MDE5MjgwODk2.Cm1KmA.ex1NrNT7AOQZtWaxUouO5Zj4xQU",
	token: "MjcyMTMxNzI3Njk3MTE3MjA0.C2Qh8g.x8j1akbIncikfZKwG45chti47rs",
	autorun: true
})

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
	console.log(userID)
	if(userID != "272114975504465920") {
		if(message.startsWith("dR ")) {
			console.log("catched msg")
			let msg = message.substring(3)


			if(msg.startsWith("help")) {
				bot.sendMessage({
					to: channelID,
					message: `${bot.username} made by szymex73\n` + "```List of commands:\n - help » displays this message\n - post (id) » fetches rant and displays it\n - profile (username) » fetches profile and displays basic info about the user\n\n\nNotice that API calls can take some time to finish\nYou can invite the bot using this link:\nhttps://discordapp.com/oauth2/authorize?client_id=272131727697117204&scope=bot&permissions=0\nOr test it on szymex73's server (invite code: FDBQKMY)```"
				}, (err, res) => {
					if (err) { console.error(err) }
				})
			} else if(msg.startsWith("post")) {
				let id     = msg.substring(5)
				console.log(id)
				let isID = /^[0-9]+$/.test(id)
				console.log(isID)
				if(isID) {
					devRant
						.rant(parseInt(id))
						.then((rant) => {
							let res = rant
							if(res.success == true) {
								console.log(res)
								bot.sendMessage({
									to: channelID,
									message: `Here is content of rant no. \`${parseInt(id)}\`\nAuthor: \`${res.rant.user_username}\`\n\`\`\`${res.rant.text}\`\`\``
								}, (err, res) => {
									if (err) { console.error(err) }
								})
								console.log("sent rant")
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
							message: `User \`${profile.username}\`\nScore: \`${profile.score}\`\nAbout: \`${profile.about}\`\nSkills: \`${profile.skills}\`\nNo. of rants: \`${profile.content.counts.rants}\``
						})
					})
					.catch(function (err) {
     				console.log("Promise Rejected", err);
					});
			}
		}
	}
})