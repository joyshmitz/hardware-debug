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
        let buses = i2cDetect.stdout.split(/\r?\n/).filter(item => item);
        let result = []
        buses.forEach(bus => {
            let busSplit = bus.split(`\t`); 
            result.push({
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
        let result = []
        if (match !== null){
            match.forEach(device => {
                result.push(device)
            });
        }
        res.send(result)
    }catch(e){
        res.status(400).send(`Got error: ${e.message}`)
    }
})


app.post('/i2c/read', async(req, res) => {
    // i2cget -y BUS <DEVICE ADDRESS> <ADDRESS> [MODE] (w, b)
    try{
        let read = await exec(`i2cget -y ${req.body.bus} ${req.body.device} ${req.body.register} ${req.body.mode}`);
        res.send(read.stdout)
    }catch(e){
        res.status(400).send(`Got error: ${e.message}`)
    }
})

app.post('/i2c/write', async(req, res) => {
    //I2cset -y 0 <DEVICE ADDRESS> <ADDRESS> <VALUE>
    try{
        let write = await exec(`i2cset -y ${req.body.bus} ${req.body.device} ${req.body.register} ${req.body.value}`);
        res.send('OK')
    }catch(e){
        res.status(400).send(`Got error: ${e.message}`)
    }
})

app.get('/hardware', async(req, res) => {
    try{
        let lshw = await exec(`lshw -json`);
        res.send(lshw.stdout);
    }catch(e){
        res.status(400).send(`Got error: ${e.message}`)
    }
})

// should parse this and return a json
function usbMatch(str, pattern){
    let match = str.match(pattern)
    if(match !== null){
        return match[1]
    } else{
        return null
    }
}
app.get('/usb', async(req, res) => {
    try{
        let usb = await exec(`usb-devices`);
        let result = []
        let devs = usb.stdout.split(/\n\s*\n/).filter(item => item)
        devs.forEach((dev) => {
            result.push({
                bus: usbMatch(dev, /Bus=(\S+)/),
                level: usbMatch(dev, /Lev=(\S+)/),
                port: usbMatch(dev, /Port=(\S+)/),
                deviceNum: usbMatch(dev, /Dev#=  (\S+)/),
                speed: usbMatch(dev, /Spd=(\S+)/),
                manufacturer: usbMatch(dev, /(?<=Manufacturer=)(.*)(?=[\n\r])/),
                product: usbMatch(dev, /(?<=Product=)(.*)(?=[\n\r])/),
                driver: usbMatch(dev, /Driver=(\S+)/),
            })
        })
        
        res.send(result);
    }catch(e){
        res.status(400).send(`Got error: ${e.message}`)
    }
})


// give the state of all exported pins
app.get('/gpio/status', async(req, res) => {
    try{
        let exported = await exec(`ls /sys/class/gpio | grep -v gpiochip | grep gpio`);
        let exportedPins = exported.stdout.split(/\r?\n/).filter(item => item)
        
        let result = [] 
       
        for(let i=0; i<exportedPins.length; i++){
            let value = await exec(`cat /sys/class/gpio/${exportedPins[i]}/value `);
            let direction = await exec(`cat /sys/class/gpio/${exportedPins[i]}/direction `);
            result.push({
                pin: exportedPins[i].replace(`gpio`, ``),
                value: value.stdout.replace(`\n`, ''),
                direction: direction.stdout.replace(`\n`, ''),
            })
        }
        res.send(result);
    }catch(e){
        res.status(400).send(`Got error: ${e.message}`)
    }
})

app.post('/gpio/export', async(req, res) => {
    try{
        await exec(`echo ${req.body.pin} >/sys/class/gpio/export`);
        await exec(`echo ${req.body.direction} >/sys/class/gpio/gpio${req.body.pin}/direction`);
       
        res.send('OK');
    }catch(e){
        res.status(400).send(`Got error: ${e.message}`)
    }
})

app.post('/gpio/write', async(req, res) => {
    try{
        await exec(`echo ${req.body.value} >/sys/class/gpio/gpio${req.body.pin}/value`);       
        res.send('OK');
    }catch(e){
        res.status(400).send(`Got error: ${e.message}`)
    }
})

app.listen(port, () => {
    console.log(`hardware-debug-block listening at http://localhost:${port}`)
})
