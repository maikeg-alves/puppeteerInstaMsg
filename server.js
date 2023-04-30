const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {

    const browser = await puppeteer.launch({
        headless: false,
    });

    const page = await browser.newPage();

    await page.setViewport({ width: 1080, height: 500 });
    //ogin instagram 

    const cookiesJson = fs.readFileSync("./cookies.json");
    const cookies = JSON.parse(cookiesJson);

    await Promise.all(cookies.map(cookie => {
        return page.setCookie(cookie);
    }))


    await page.goto("https://www.instagram.com")


    // remove o popup 
    await page.waitForSelector('div._a9-z')
    await page.click('div._a9-z > button._a9--._a9_1')


    const members = fs.readFileSync("./membros/membros.txt", 'utf-8').split("\n")

    const salutation = () => {
        const data = new Date().getHours()
        if (data >= 1 && data <= 11) {
            return 'Bom dia '
        } else if (data >= 12 && data <= 17) {
            return "Boa tarde"
        } else {
            return "Boa noite"
        }
    }
    
    
    const mensagem = (name) => {
        return `Olá ${name}, ${salutation()}
        Por favor, nos envie o vídeo da conferência de quinta feira. 
        Prazo até amanhã.`
    }

    const membersnotFound = []

    for (let member of members) {
        try {
            await page.goto(`https://www.instagram.com/${member}/`)

            // clica no button de enviar mensagem 
            await page.waitForSelector('div.xeuugli')
            await page.click('div.xeuugli[role=button]')

            const member_name = await page.$eval("div._aa_c > div > span", el => el.textContent)

            //escreve a mensagem
            await page.waitForSelector('textarea[placeholder="Mensagem..."]')
            await page.type('textarea[placeholder="Mensagem..."]', `${mensagem(member_name)}`, { delay: 50 }) // tem um delay de 50 milesendos 

            // clica em enviar mensagem 
            await page.waitForSelector("div.xjbqb8w.x78zum5.x1plvlek.x2lah0s.xdt5ytf.xqjyukv")
            await page.waitForTimeout(2000); // delay de 2000 sg para o evitar ban 
            await page.click("div.xjbqb8w.x78zum5.x1plvlek.x2lah0s.xdt5ytf.xqjyukv [role='button']")  // clica no button para enviar

        } catch {
            membersnotFound.push(member)
        }

        // agurda 2000 ms para seguir para o proximo menbro 
        await page.waitForTimeout(2000)

    }

    if (membersnotFound.length > 0) {
        console.log("❌🦖 Membros Não Encontrados 🦖❌")
        for (let member of membersnotFound) {
            console.log(member)
        }
    } else {
        console.log("Todos os membros foram encontrados ✅🚀")
    }


    await browser.close();

})();