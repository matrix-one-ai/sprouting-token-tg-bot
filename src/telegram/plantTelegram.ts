import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import dotenv from "dotenv";

export interface TokenInsight {
  creationTime: string;
  slot: number;
  signature: string;
  blockTime: number;
  sourceExchange: string;
  ammAccount: string;
  baseTokenAccount: string;
  baseTokenDecimals: number;
  baseTokenSupply: string;
  baseTokenName: string;
  baseTokenSymbol: string;
  baseTokenLogo: string;
  baseTokenLiquidityAdded: string;
  quoteTokenAccount: string;
  quoteTokenLiquidityAdded: string;
  lastPoolUpdate: string;
  priceRefreshEnabled: boolean;
  priceRefreshIntervalSeconds: number;
  priceRefreshLastUpdateTime: string | null;
  priceRefreshNextUpdateTime: string;
  tweetSent: boolean;
  tweetText: string;
  tweetSentAt: string;
  twitterCAQueryCount: number;
  tweetsCATweetCount: number;
  twitterCAFound: boolean;
  twitterCAFoundAtTime: string | null;
  twitterCAFirstMentionTime: string | null;
  twitterCAFirstMentionTweetId: string | null;
  twitterCAFirstMentionText: string | null;
  twitterCAFirstMentionHandle: string | null;
  tweetsCAEngagementTweetsImported: number;
  tweetsCAEngagementTotalLikes: number;
  tweetsCAEngagementTotalReplies: number;
  tweetsCAEngagementTotalRetweets: number;
  tweetsCAEngagementTotalViews: number;
  tweetsCAEngagementTotalQuotes: number;
  twitterRefreshEnabled: boolean;
  twitterRefreshLastUpdateTime: string | null;
  twitterRefreshNextUpdateTime: string | null;
  twitterRefreshEnabledUntilTime: string | null;
  twitterRefreshIntervalSeconds: number;
  tokenPriceChange24NormScore: number;
  tokenLiquidityNormScore: number;
  tokenTweetCountNormScore: number;
  tokenLikeNormScore: number;
  tokenRetweetNormScore: number;
  tokenCombinedScore: number;
  id: string;
}

dotenv.config();

const token = process.env.PLANT_TELEGRAM_TOKEN;

if (!token) {
  throw new Error("PLANT_TELEGRAM_TOKEN is not set in environment variables.");
}

// const azureLogin = async () => {
//   const authResp = await fetch(
//     "https://sami-one-portal-be.azurewebsites.net/api/TokenAuth/Authenticate",
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Abp.TenantId": "2",
//         cache: "no-cache",
//       },
//       body: JSON.stringify({
//         userNameOrEmailAddress: "external-api",
//         password: "egq3yxq!QEX!myq2cyb",
//       }),
//     }
//   );

//   const authData = await authResp.json();

//   if (authData.error || !authData?.result?.accessToken) {
//     console.log(authData.error);
//     return;
//   }

//   return authData.result.accessToken;
// };

const bot = new Telegraf(token);
let chatId: number | null = Number(process.env.SPROUT_TOKEN_CHAT_ID);
let threadId: number | null = Number(process.env.SPROUT_TOKEN_THREAD_ID);
// let authAccessToken: string;
const usedTokenInsightIds: string[] = [];

export const plantTelegramAgentInit = async () => {
  bot.launch();

  // authAccessToken = await azureLogin();

  const postTokenInsights = async () => {
    if (chatId === null || threadId === null) {
      return;
    }

    const tokenInsightsResp = await fetch(
      "https://sami-one-portal-be.azurewebsites.net/api/services/app/DataManagement/GetLatestRaydiumTweets",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${authAccessToken}`,
          "X-Api-Key": "matrix-5dd9ae979c7d440e9e5602b25e08f65d",
          cache: "no-cache",
        },
      },
    );
    const tokenInsights = await tokenInsightsResp.json();

    const newInsight = (tokenInsights?.result as TokenInsight[])?.[0];

    if (!newInsight || usedTokenInsightIds.includes(newInsight.id)) {
      console.log("No new token insights");
      return;
    }

    usedTokenInsightIds.push(newInsight.id);

    console.log(newInsight);

    bot.telegram.sendMessage(chatId, newInsight.tweetText, {
      message_thread_id: threadId,
    });
  };

  // Send a message every hour
  setInterval(async () => {
    await postTokenInsights();
  }, 1000 * 60); // every minute

  // TODO: Need below code to get chat id and thread id
  // bot.on(message("text"), async (ctx) => {
  //   try {
  //     const newChatId = ctx.chat.id;
  //     const newThreadId = ctx.message?.message_thread_id as number;

  //     if (!chatId && !threadId && newThreadId && newChatId) {
  //       console.log(`Chat ID: ${chatId}`);
  //       console.log(`Thread ID: ${threadId}`);

  //       chatId = newChatId;
  //       threadId = newThreadId;

  //       await postTokenInsights();
  //     }
  //   } catch (e) {
  //     console.log(e);
  //   }
  // });
};
