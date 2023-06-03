module.exports = {
  config: {
    name: "nicknamechange",
    aliases: ["botnick", "botname"],
    version: "1.0",
    author: "Your Name",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "Change nickname of the bot in all group chats"
    },
    longDescription: {
      en: "Change nickname of the bot in all group chats"
    },
    category: "owner",
    guide: {
      en: "{pn} <new nickname>"
    },
    envConfig: {
      delayPerGroup: 250
    }
  },

  langs: {
    en: {
      missingNickname: "Please enter the new nickname for the bot",
      changingNickname: "Start changing bot nickname to '%1' in %2 group chats",
      errorChangingNickname: "An error occurred while changing nickname in %1 groups:\n%2",
      successMessage: "✅ Successfully changed nickname in all group chats to '%1'"
    }
  },

  onStart: async function({ api, args, threadsData, message, getLang }) {
    const newNickname = args.join(" ");

    if (!newNickname) {
      return message.reply(getLang("invalidInput"));
    }

    const allGroupThreads = threadsData.getAll().filter(thread => thread.isGroup);
    const threadIds = allGroupThreads.map(thread => thread.threadID);

    const nicknameChangePromises = threadIds.map(async threadId => {
      try {
        await api.changeNickname(newNickname, threadId, api.getCurrentUserID());
        return threadId;
      } catch (error) {
        console.error(`Failed to change nickname for thread ${threadId}: ${error.message}`);
        return null;
      }
    });

    const failedThreads = (await Promise.allSettled(nicknameChangePromises))
      .filter(result => result.status === "rejected")
      .map(result => result.reason.message);

    if (failedThreads.length === 0) {
      message.reply(getLang("successMessage", newNickname));
    } else {
      message.reply(getLang("partialSuccessMessage", newNickname, failedThreads.join(", ")));
    }
  }
};