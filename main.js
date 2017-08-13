const Discord = require('discord.io')
const devRant = require('devrant')
const co      = require('co')
const config  = require('./opts')
const bot     = new Discord.Client({
	token: config.token,
	autorun: true
})

function getProfile(user) {
	return co(function *fetchProfile() {    
		const profile = yield devRant.profile(user)
		return profile
	})
}

bot.on('ready', () => {
	console.log(`devRantBot Initialized!`)
	setGame('Type dR help')
	console.log(bot.inviteURL)
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

				let helpMsg = `devRantDiscord made by szymex73\n`
				helpMsg += `\`\`\`List of commands:\n`
				helpMsg += ` - help » displays this message\n`
				helpMsg += ` - rant <id> » fetches rant by id and displays it\n`
				helpMsg += ` - profile/user <username> » fetches profile and displays basic info about the user\n`
				helpMsg += ` - recent » fetches the most recent rant and displays it\n`
				helpMsg += `\n\n\n`
				helpMsg += `Notice that API calls can take some time to finish\n`
				helpMsg += `You can invite the bot using this link:\n`
				helpMsg += `https://discordapp.com/oauth2/authorize?client_id=${bot.id}&scope=bot&permissions=0\n`
				helpMsg += `Thanks for using devRantDiscord! :)\`\`\``
				helpMsg += '\n\n\n'
				helpMsg += '(devRantDiscord is FOSS! Contribute here: https://github.com/szymex73/discord-bot)'

				bot.sendMessage({
					to: userID,
					message: helpMsg
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
								if(res.rant.attached_image.url) {
									let embed = {
										description: res.rant.text,
										url: 'https://www.devrant.io/rants/' + parseInt(id),
										footer: {
											text: 'devRantDiscord'
										},
										image: {
											url: res.rant.attached_image.url
										},
										author: {
											name: res.rant.user_username,
											url: 'https://www.devrant.io/users/' + res.rant.user_username
										}
									}
									bot.sendMessage({
										to: channelID,
										embed: embed
									}, (err, res) => {
										if (err) { console.error(err) }
									})
								} else {
									let embed = {
										description: res.rant.text,
										url: 'https://www.devrant.io/rants/' + parseInt(id),
										footer: {
											text: 'devRantDiscord'
										},
										author: {
											name: res.rant.user_username,
											url: 'https://www.devrant.io/users/' + res.rant.user_username
										}
									}
									bot.sendMessage({
										to: channelID,
										embed: embed
									}, (err, res) => {
										if (err) { console.error(err) }
									})
								}
							}
						})
						.catch(function (err) {
							console.log("Promise Rejected", err)
							bot.sendMessage({
								to: channelID,
								message: "Error: Rant not found. Check command if there are typos. Contact with szymex73 if the error persists."
							})
						})
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
				let skills = ''
				let avatar = ''
				getProfile(username)
					.then((res) => {
						profile = res
						if(profile.about == '') {
							about = 'No info specified'
						} else {
							about = profile.about
						}
						if(profile.skills == '') {
							skills = 'No skills specified'
						} else {
							skills = profile.skills
						}
						if(typeof profile.avatar.i == 'undefined'){
							avatar = ''
						} else {
							avatar = `https://avatars.devrant.io/${profile.avatar.i}`
						}

						let embed = {
							description: about,
							footer: {
								text: 'devRantDiscord'
							},
							image: {
								url: avatar
							},
							author: {
								name: username,
								url: 'https://www.devrant.io/users/' + profile.username
							},
							fields: [
								{
									name: 'Skills',
									value: skills,
									inline: true
								},
								{
									name: 'Points',
									value: profile.score,
									inline: true
								},
								{
									name: 'No. of rants',
									value: profile.content.counts.rants,
									inline: true
								}
							]
						}

						bot.sendMessage({
							to: channelID,
							embed: embed
						})

					})
					.catch(function (err) {
						console.log("Promise Rejected", err)
						bot.sendMessage({
							to: channelID,
							message: "Error: User not found. Check command if there are typos. Contact with szymex73 if the error persists."
						})
					})
			} else if(msg.startsWith("recent")) {
				let rantArray = []
				devRant
					.rants({
						sort: 'recent',
						limit: 1
					})
					.then((rants) => {
						rantArray = rants
						if(rantArray[0].attached_image.url) {
							let message = `Most recent rant from devRant:\n`
							message += `Rant id: \`${rantArray[0].id}\`\n`
							message += `Author: \`${rantArray[0].user_username}\`\n`
							message += `Score: \`${rantArray[0].score}\`\n`
							message += `Text: \`\`\`${rantArray[0].text}\`\`\`\n`
							message += `${rantArray[0].attached_image.url}`

							let embed = {
								description: rantArray[0].text,
								url: 'https://www.devrant.io/rants/' + rantArray[0].id,
								footer: {
									text: 'devRantDiscord'
								},
								image: {
									url: rantArray[0].attached_image.url
								},
								author: {
									name: rantArray[0].user_username,
									url: 'https://www.devrant.io/users/' + rantArray[0].user_username
								}
							}

							bot.sendMessage({
								to: channelID,
								embed: embed
							})
						} else {
							let embed = {
								description: rantArray[0].text,
								url: 'https://www.devrant.io/rants/' + rantArray[0].id,
								footer: {
									text: 'devRantDiscord'
								},
								author: {
									name: rantArray[0].user_username,
									url: 'https://www.devrant.io/users/' + rantArray[0].user_username
								}
							}

							bot.sendMessage({
								to: channelID,
								embed: embed
							})
						}
					})
					.catch((err) => {
						console.log('err: ', err.message)
						bot.sendMessage({
							to: channelID,
							message: "Error: Could not fetch recent rant. Contact with szymex73 for help"
						})
					})
			}
		}
	}
})

function setGame(game) {
    bot.setPresence({game: { name: game } })
}
