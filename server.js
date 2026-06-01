const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const materialPrices = {
    "K=K": 4.2,
    "K=A": 3.8,
    "A=A": 3.5,
    "A=B": 3.2,
    "B=B": 2.8,
    "B=C": 2.5,
    "C=C": 2.2
};

const printPrices = {
    "0": 0,
    "1": 0.15,
    "2": 0.25,
    "3": 0.35,
    "4": 0.45
};

const surfacePrices = {
    "none": 0,
    "film": 0.12,
    "uv": 0.08
};

const dieCutPrice = 0.08;
const samplePrice = 100;

app.post('/api/calculate', (req, res) => {
    try {
        const { length, width, height, material, quantity, printColor, surface, dieCut, sample } = req.body;
        
        if (!length || !width || !height || !material || !quantity) {
            return res.status(400).json({ error: '缺少必要参数' });
        }

        const area = (2 * (length * width + length * height + width * height)) / 1000000;
        const materialCost = area * materialPrices[material] * quantity;
        const printCost = printPrices[printColor] * quantity;
        const surfaceCost = surfacePrices[surface] * quantity;
        const dieCutCost = (dieCut === 'yes') ? dieCutPrice * quantity : 0;
        const sampleCost = (sample === 'yes') ? samplePrice : 0;
        const otherCost = Math.round(materialCost * 0.02);
        
        const totalCost = materialCost + printCost + surfaceCost + dieCutCost + sampleCost + otherCost;
        const unitPrice = totalCost / quantity;

        res.json({
            success: true,
            data: {
                area: (area * 1000).toFixed(2),
                materialCost: materialCost.toFixed(2),
                printCost: printCost.toFixed(2),
                surfaceCost: surfaceCost.toFixed(2),
                dieCutCost: dieCutCost.toFixed(2),
                sampleCost: sampleCost.toFixed(2),
                otherCost: otherCost.toFixed(2),
                totalCost: totalCost.toFixed(2),
                unitPrice: unitPrice.toFixed(4),
                materialPrice: materialPrices[material],
                printPrice: printPrices[printColor],
                surfacePrice: surfacePrices[surface],
                dieCutPrice: dieCutPrice,
                samplePrice: samplePrice
            }
        });
    } catch (error) {
        res.status(500).json({ error: '计算失败' });
    }
});

app.get('/api/materials', (req, res) => {
    const materials = Object.keys(materialPrices).map(key => ({
        value: key,
        label: key,
        price: materialPrices[key]
    }));
    res.json({ success: true, data: materials });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});