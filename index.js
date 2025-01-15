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

        const newsImgPath = $(news).find('.img-fluid').attr("src")
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
                if(text.children && text.children.length){
                    for (const element of text.children) {
                        if(element.type === 'text') {
                            fullText += `${element.data} `
                        } else if(element.name === 'a'){
                            fullText += `${element.children[0].data} `
                        }
                    }
                }
                fullText += "\n\n"
            }
            postInfo.push(fullText)
            postInfo.push(newsImgPath)
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

    const titleRequests = news.map((item) => {
        return generateRequestTextForTitle(item[0])
    })

    const requests = news.map((item) => {
        return generateRequestText(item[0], item[1])
    })

    const postsTitleResponses = []
    const postsBodyResponses = [] 


    for(let i = 0; i < requests.length; i++){
        const titleResponse = await makeRequest(titleRequests[i], "gpt-4-turbo", 300)
        postsTitleResponses.push(titleResponse)
        const bodyResponse = await makeRequest(requests[i], "gpt-3.5-turbo", 1000)
        postsBodyResponses.push(bodyResponse)
    }
    news.forEach((item, index) => {
        item[0] = postsTitleResponses[index]
        item[1] = postsBodyResponses[index]
    })
    return news
}

async function main(){
    const data = fs.readFileSync(FILE_PATH, 'utf-8');
    const news = await getSummaryFromGPT(data);
    if(!news){
        console.log("Новых новостей пока нет!");
        return
    }
    // console.log(news);
    news.forEach(item => {
        postMessage([item[0], item[1], item[2]].join('\n\n'))
    })

}

main();
// performScraping(URL, '«Гистадрут» угрожает трудовым конфликтом в автобусной компании «Дан»')
