const Discord = require('discord.io')
const devRant = require('devrant')
const co      = require('co')
const config  = require('./opts')
let bot       = new Discord.Client({
	token: config.token,
	autorun: true
})

function getProfile(user) {
	return co(function *fetchProfile() {    
		const profile = yield devRant.profile(user);
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
					message: `<@${userID}> Check Your DM for commands`
				}, (err, res) => {

					if (err) { console.error(err) }

				})

				bot.sendMessage({
					to: userID,
					message: `devRantDiscord made by szymex73
					\`\`\`List of commands:
 - help » displays this message
 - rant (id) » fetches rant by id and displays it
 - profile/user (username) » fetches profile and displays basic info about the user
 - recent » fetches the most recent rant and displays it


Notice that API calls can take some time to finish
You can invite the bot using this link:
https://discordapp.com/oauth2/authorize?client_id=${bot.id}&scope=bot&permissions=0
Or test it on szymex73's server (invite code: FDBQKMY)
Thanks for using devRantDiscord! :)
\`\`\``
				}, (err, res) => {

					if (err) { console.error(err) }

				})

			} else if(msg.startsWith("rant")) {

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
							bot.sendMessage({
								to: channelID,
								message: "Error: Rant not found. Check command if there are typos. Contact with szymex73 if error repeats."
							})


						});

				}

			} else if(msg.startsWith("profile") || msg.startsWith("user")) {

				let substringNum

				if(msg.startsWith("profile")) {
					substringNum = 8
				} else if(msg.startsWith("user")) {
					substringNum = 5
				}

				let username = msg.substring(substringNum)
				let profile = {}
				let about = ''

				getProfile(username)
					.then((res) => {

						profile = res
						if(profile.about == '') {
							about = 'No info'
						} else {
							about = profile.about
						}

						bot.sendMessage({
							to: channelID,
							message: `User \`${profile.username}\`
Score: \`${profile.score}\`
About: \`${about}\`
Skills: \`${profile.skills}\`
No. of rants: \`${profile.content.counts.rants}\``
						})

					})
					.catch(function (err) {

						console.log("Promise Rejected", err);

						bot.sendMessage({
							to: channelID,
							message: "Error: User not found. Check command if there are typos. Contact with szymex73 if error repeats."
						})

					});

			} else if(msg.startsWith("recent")) {
				let rantArray = []

				devRant
					.rants({
						sort: 'recent',
						limit: 1
					})
					.then((rants) => {
						rantArray = rants

						bot.sendMessage({
							to: channelID,
							message: `Most recent rant from devRant:
Rant id: \`${rantArray[0].id}\`
Author: \`${rantArray[0].user_username}\`
Score: \`${rantArray[0].score}\`
Text: \`\`\`${rantArray[0].text}\`\`\``
						})
					})
					.catch((err) => {

						console.log('err: ', err.message);

						bot.sendMessage({
							to: channelID,
							message: "Error: Could not fetch recent rant. Contact with szymex73 for help"
						})

					});
			}
		}

	}

})