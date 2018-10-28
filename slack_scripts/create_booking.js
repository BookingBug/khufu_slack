let https = require('https');

let token = 'x9zShfgXUgInN81ARp7wyHDw';
let user = 'U0334S6HF';
let bearer = 'xoxb-3106890589-466095212690-NVV67bsnBTFgMOYXrlZI3xlu';

function get_im_channel(func) {
    const options = {host: 'slack.com', port: 443, path: "/api/im.open", headers: {'Authorization': 'Bearer ' + bearer, 'Content-Type': 'application/json'}, method: 'POST'};
    const req = https.request(options, (result) => {
        var dataQueue = "";    
        result.on("data", function (dataBuffer) {
            dataQueue += dataBuffer;
        });
        result.on("end", function () {
            let body = JSON.parse(dataQueue);
            func(body.channel.id);

        });        
    });
    req.write(JSON.stringify({"user": user}));
    req.end();    
}




function create_booking(booking, callback) => {
    
    get_im_channel((channel) => {
    
        const options = {host: 'slack.com', port: 443, path: "/api/chat.postMessage", headers: {'Authorization': 'Bearer ' + bearer, 'Content-Type': 'application/json'}, method: 'POST'};
        const req = https.request(options, (result) => {
            var dataQueue = "";    
            result.on("data", function (dataBuffer) {
                dataQueue += dataBuffer;
            });
            result.on("end", function () {
                console.log("done", dataQueue);
                
                let body = JSON.parse(dataQueue);
        
                const response = {
                    statusCode: 200,
                    body: dataQueue
                };
                callback(null, response);
    
            });        
        });
        
        let command = {
            "text": "John has made a booking with you at 5:50 on July 10th, do you with to view, confirm, or cancel ?",
            "channel": channel,
            "attachments": [
                {
                    "color": "#3AA3E3",
                    "callback_id": "booking",
                    "fallback": "Manage your booking at http://127.0.0.1:8000/#/bookings/edit/16513/booking/info",
                    "actions": [
                        {
                            "type": "button",
                            "name": "travel_request_123456",
                            "text": "View Booking :spiral_calendar_pad:",
                            "url": "http://127.0.0.1:8000/#/bookings/edit/16513/booking/info",
                            "style": "primary",
                        },
                        {
                            "type": "button",
                            "name": "confirm",
                            "text": "Confirm appointment"
                        },
                        {
                            "type": "button",
                            "name": "cancel",
                            "text": "Cancel appointment",
                            "style": "danger",
                            "confirm": {
                                "title": "Are you sure?",
                                "text": "Did you mean to cancel this appointment",
                                "ok_text": "Yes",
                                "dismiss_text": "No"
                            }
                        }
                    ]
                }
            ]
        }        
        req.write(JSON.stringify(command));
        req.end();
    }) ;
    
};

module.exports = create_booking;
