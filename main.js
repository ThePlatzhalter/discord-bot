const Discord = require('discord.io')
const devRant = require('devrant')
const co      = require('co')
const config  = require('./opts')
let bot       = new Discord.Client({
	token: config.token,
	autorun: true
})

function getProfile(username) {
	return co(function *fetchProfile() {    
		const profile = yield devRant.profile(username);
		return profile
	});
}

bot.on('ready', () => {
	console.log(`devRantBot Initialized!`)
})

bot.on('message', (user, userID, channelID, message, event) => {

	if(userID != bot.id) {

		if(message.startsWith("dR ")) {

			let msg = message.substring(3)

			if(msg.startsWith("help")) {

				bot.sendMessage({
					to: channelID,
					message: `devRantDiscord made by szymex73
					\`\`\`List of commands:
					 - help » displays this message
					 - post (id) » fetches rant and displays it
					 - profile (username) » fetches profile and displays basic info about the user


					Notice that API calls can take some time to finish
					You can invite the bot using this link:
					https://discordapp.com/oauth2/authorize?client_id=${bot.id}&scope=bot&permissions=0
					Or test it on szymex73's server (invite code: FDBQKMY)
					\`\`\``
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

			} else if(msg.startsWith("recent")) {
				let rantArray = []

				devRant
					.rants({
						sort: 'recent',
						limit: 5
					})
					.then((rants) => {
						rantArray = rants

						bot.sendMessage({
							to: channelID,
							message: `5 recent rants from devRant:
							**1.** Id: \`${rantArray[0].id}\`
							Author: \`${rantArray[0].user_username}\`
							Score: \`${rantArray[0].score}\`
							Text: \`${rantArray[0].text}\`
							**2.** Id: \`${rantArray[1].id}\`
							Author: \`${rantArray[1].user_username}\`
							Score: \`${rantArray[1].score}\`
							Text: \`${rantArray[1].text}\`
							**3.** Id: \`${rantArray[2].id}\`
							Author: \`${rantArray[2].user_username}\`
							Score: \`${rantArray[2].score}\`
							Text: \`${rantArray[2].text}\`
							**4.** Id: \`${rantArray[3].id}\`
							Author: \`${rantArray[3].user_username}\`
							Score: \`${rantArray[3].score}\`
							Text: \`${rantArray[3].text}\`
							**5.** Id: \`${rantArray[4].id}\`
							Author: \`${rantArray[4].user_username}\`
							Score: \`${rantArray[4].score}\`
							Text: \`${rantArray[4].text}\`
							`
						})
					})
					.catch((err) => {
						console.log('err: ', err.message);
					});
			}
		}

	}

})