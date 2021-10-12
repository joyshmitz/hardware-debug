const express = require('express')
const app = express()
const port = process.env.HARDWARE_DEBUG_PORT || 3000
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const options = {
    customCss: '.swagger-ui .topbar { display: none }'
};


app.use(express.json())
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));

app.get('/', (req, res) => {
    // #swagger.description = 'Documentation for your endpoint.'
    /* #swagger.responses[200] = {
        description: 'Successful request',
        schema: {
            "properties": {
                "list": {
                
                    "type": "array",
                    "description": "List of items",
                },
            },
        }
    } */

    res.send('This is a hardware-debug-block balenaBlock!')
})

app.get('/i2c/buses', async(req, res) => {
    try{
        let i2cDetect = await exec(`i2cdetect -l`)
        // what if there's none?
        let buses = i2cDetect.stdout.split(/\r?\n/);
        let result = {buses:[]}
        buses.forEach(bus => {
            let busSplit = bus.split(`\t`); 
            result.buses.push({
                id: busSplit[0].split('-')[1],
                adapter: busSplit[2]
            })
        });
        res.send(result)
    }catch(e){
        res.status(400).send(`Got error: ${e.message}`)
    }
})

app.post('/i2c/detect', async(req, res) => {
    const pattern = /\s\d{2}\s/g
    try{
        let bus = req.body.bus
        let i2cDetect = await exec(`i2cdetect -y ${bus}`);
        console.log(i2cDetect.stdout)
        // what if there's none?
        let match =  i2cDetect.stdout.match(pattern)
        let result = {devices: []}
        if (match !== null){
            match.forEach(device => {
                result.devices.push(device)
            });
        }
        res.send(result)
    }catch(e){
        res.status(400).send(`Got error: ${e.message}`)
    }
})

app.listen(port, () => {
    console.log(`Example balenaBlock listening at http://localhost:${port}`)
})
