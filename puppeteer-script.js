import { launch } from 'puppeteer';

const leagues = [
    {
        name: 'Premier League',
        linkUrl: "https://www.premierbet.co.ao/sport/football/competition/1008226?sportRef=1&competitionId=1008226&name=Premier%20League&isGroup=false"
    },
    {
        name: "Primera División",
        linkUrl: "https://www.premierbet.co.ao/sport/football/competition/1008427?sportRef=1&competitionId=1008427&name=La%20Liga&isGroup=false"
    },
    {
        name: "Serie A",
        linkUrl: "https://www.premierbet.co.ao/sport/football/competition/1007684?sportRef=1&competitionId=1007684&name=S%C3%A9rie%20A&isGroup=false"
    },
    {
        name: "Bundesliga",
        linkUrl: "https://www.premierbet.co.ao/sport/football/competition/1008240?sportRef=1&competitionId=1008240&name=Bundesliga&isGroup=false"
    },
    {
        name: "Ligue 1",
        linkUrl: "https://www.premierbet.co.ao/sport/football/competition/1007843?sportRef=1&competitionId=1007843&name=Ligue%201&isGroup=false"
    },
    {
        name: "Eredivisie",
        linkUrl: "https://www.premierbet.co.ao/sport/football/competition/1007846?sportRef=1&competitionId=1007846&name=Eredivisie&isGroup=false"
    },
    {
        name: "Primeira Liga",
        linkUrl: "https://www.premierbet.co.ao/sport/football/competition/1008425?sportRef=1&competitionId=1008425&name=Liga%20Portugal&isGroup=false"
    },
    {
        name: "Scottish Premiership",
        linkUrl: "https://www.premierbet.co.ao/sport/football/competition/1007845?sportRef=1&competitionId=1007845&name=Primeira%20Liga&isGroup=false"
    },
    {
        name: "Liga Angola Girabola",
        linkUrl: "https://www.premierbet.co.ao/sport/football/competition/1008426?sportRef=1&competitionId=1008426&name=Girabola&isGroup=false"
    }
];

async function fetchOdds(competitionId) {
    let browser;
    try {
        browser = await launch({
            headless: true,
            args: ['--disable-http2'],
        });
        const page = await browser.newPage();
        const league = leagues.find((item) => item.name === competitionId);
        console.log(league)
        if (!league) {
            throw new Error(`Competição não encontrada: ${competitionId}`);
        }

        const url = league.linkUrl.toString();
        console.log(`Acessando URL: ${url}`);
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('.odds-button__price', { timeout: 10000 });
        await page.waitForSelector('.event-card__team-name', { timeout: 10000 });
        const jogos = await page.evaluate(() => {
            const odds = Array.from(document.querySelectorAll('.odds-button__price'));
            const teams = Array.from(document.querySelectorAll('.event-card__team-name'));

            return teams.reduce((resultados, _, index, array) => {
                if (index % 2 === 0 && index + 1 < array.length) {
                    const timeCasa = array[index]?.innerText.trim();
                    const timeVisitante = array[index + 1]?.innerText.trim();

                    if (timeCasa && timeVisitante) {
                        const oddsIndex = (index / 2) * 3;
                        const casa = odds[oddsIndex]?.innerText.trim() || '-';
                        const empate = odds[oddsIndex + 1]?.innerText.trim() || '-';
                        const visitante = odds[oddsIndex + 2]?.innerText.trim() || '-';

                        resultados.push({
                            timeCasa,
                            timeVisitante,
                            odds: { casa, empate, visitante }
                        });
                    }
                }
                return resultados;
            }, []);
        });
        return { games: jogos };
    } catch (error) {
        console.error('Erro ao buscar odds:', error.message);
        return { games: [] };
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

export { fetchOdds };
