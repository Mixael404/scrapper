/*
Рабочие ресурсы
https://www.jpost.com/israel-news
https://news.israelinfo.co.il/

?? 
https://www.haaretz.com/israel-news
https://mignews.com/news/israel/?page=1
*/

import * as cheerio from 'cheerio';
import { getPageContent } from "./app/scrap.js";
import { postMessage } from './app/telegram.js';
import { generateRequestText, generateRequestTextForTitle, makeRequest } from './app/gpt.js';
import fs from "fs";

const URL = "https://news.israelinfo.co.il/"
const FILE_PATH = "last-message.txt";

async function performScraping(url, lastMsg) {
    const content = await getPageContent(url)
    const $ = cheerio.load(content)
    const newsBlock = $('.news-announce.row')
    const newsArr = []

    let firstPostsTitles = ''
    for(let i = 0; i < 3; i++){
        firstPostsTitles += $(newsBlock[i]).find('a.parent').text()
    }

    let i = 0

    for (const news of newsBlock) {

        if(i > 4){
            break
        }

        const newsTitle = $(news).find('a.parent').text()
        const newsHref = $(news).find('a.parent').attr("href")
        const postInfo = []
        postInfo.push(newsTitle)
        if(lastMsg.includes(newsTitle)){
            break
        }
        if(newsHref){
            const postUrl = url + newsHref.slice(1)
            const content = await getPageContent(postUrl)
            const $ = cheerio.load(content)
            const texts = $('[itemprop="articleBody"]').find('p')
            let fullText = ''
            for (const text of texts) {
                if(text.name === 'div'){
                    continue
                }
                if(text.children[0]?.data){
                    fullText += `${text.children[0]?.data}\n\n`
                }
            }
            postInfo.push(fullText)
            newsArr.push(postInfo)
        }

        i++
    }
    fs.writeFileSync(FILE_PATH, firstPostsTitles)
    if(newsArr.length > 4){
        return false
    }
    return newsArr
}



async function getSummaryFromGPT(lastMsg){
    const news = await performScraping(URL, lastMsg)

    if(!news || news.length === 0){
        return false
    }

    // TODO: Перефразировать заголовок
    const titleRequests = news.map((item) => {
        return generateRequestTextForTitle(item[0])
    })

    const requests = news.map((item) => {
        return generateRequestText(item[0], item[1])
    })

    const postsTitleResponses = []
    const postsBodyResponses = [] 


    for(let i = 0; i < requests.length; i++){
        const titleResponse = await makeRequest(titleRequests[i])
        postsTitleResponses.push(titleResponse)
        const bodyResponse = await makeRequest(requests[i])
        postsBodyResponses.push(bodyResponse)
    }

    // TODO: Переписать на обычный for, брать один индекс из двух массивов - делать запрос на title
    // for (const item of requests) {
    //     const response = await makeRequest(item)
    //     postsBodyResponses.push(response)
    // }

    news.forEach((item, index) => {
        item[0] = postsTitleResponses[index]
        item[1] = postsBodyResponses[index]
    })
    return news
}

async function main(){
    const data = fs.readFileSync(FILE_PATH, 'utf-8');
    const news = await getSummaryFromGPT(data)
    if(!news){
        console.log("Новых новостей пока нет!");
        return
    }
    news.forEach(item => {
        postMessage([item[0], item[1]].join('\n\n'))
    })

}

main()
