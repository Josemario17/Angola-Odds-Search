import express from 'express';
import cors from 'cors';
import { fetchOdds } from './puppeteer-script.js';


const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); 

app.get('/ods-api/fetch-odds/:competitionId', async (req, res) => {
  const { competitionId } = req.params;

  if (!competitionId) {
    return res.status(400).json({ error: 'Competition ID é obrigatório' });
  }

  try {
    const odds = await fetchOdds(competitionId); 
    console.log('Odds fetched:', odds); 
    res.json(odds);
  } catch (error) {
    console.error('Erro ao buscar as odds:', error); 
    res.status(500).json({ error: 'Erro ao buscar as odds', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Servidor backend rodando em http://localhost:${port}`);
});
