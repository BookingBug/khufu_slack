let https = require('https');
let bearer = 'xoxb-3106890589-466095212690-NVV67bsnBTFgMOYXrlZI3xlu';


function slack_command(event, callback) => {

    const body = parseBody(event.body);
  
    console.log(body)
    
    if (body.command) {
      // it's a command - lets just say we're logged out for now
      not_logged_in(body, callback);
    }
    
    if (body.payload) {
      const payload = JSON.parse(body.payload);
      console.log(payload);
      if (payload.type == "interactive_message") {
        if (payload.actions[0] && payload.actions[0].name == "confirm") {
          callback_when_done(payload, {id: 1234, status: "booked", is_cancelled: false, client_name: "Bob", date_time: "5th July at 10am"}, (res) => {
            
          });
          callback(null, {});
        }
        if (payload.actions[0] && payload.actions[0].name == "cancel") {
          callback_when_done(payload, {id: 1234, status: "booked", is_cancelled: true, client_name: "Bob", date_time: "5th July at 10am"}, (res) => {
            
          });
          callback(null, {});
        }
      }
    }
};

function parseBody(body) {
  var result = {};
  body.split("&").forEach(function(part) {
    var item = part.split("=");
    result[item[0]] = decodeURIComponent(item[1]);
  });
  return result;
}

function not_logged_in(body, callback) {
    let result = JSON.stringify({user_id: body.user_id, user_name: body.user_name, team_id: body.team_id, team_domain: body.team_domain});
    
    let code = Buffer.from(result).toString('base64');
        
    let resp = {
      "text": "I don't know you - connect your BookingBug Account",
      "attachments": [
        {
          "fallback": "Sorry, I couldn't connect your account at this time",
          "actions": [
            {
              "type": "button",
              "text": "Connect BookingBug Account",
              "url": "http://localhost:8000/index.html#/slack/page/slack?token=" + code
            }
          ]
        }
      ]
    }
  const response = {
      statusCode: 200,
      body: JSON.stringify(resp)
  };
  callback(null, response);    
}
function callback_when_done(payload, booking, func){
    let status = "";
    if (!booking.is_cancelled && booking.status == "Booked")
     status = "Booking Confirmed :heavy_check_mark:" ;
    else if (booking.is_cancelled)
      status = "Booking Cancelled :heavy_multiplication_x:";
      
    let resp= {
      ts: payload.message_ts,
      channel: payload.channel.id,
      replace_original: true,
      text: "" + booking.client_name + " has made a booking with you at " + booking.date_time + ": " + status,
      attachments: [
        {
          color: "#3AA3E3",
          callback_id: "booking",
          fallback: "Manage your booking at http://127.0.0.1:8000/#/bookings/edit/" + booking.id + "/booking/info",
          actions: [
            {
                "type": "button",
                "name": "view",
                "text": "View Booking :spiral_calendar_pad:",
                "url": "http://127.0.0.1:8000/#/bookings/edit/16513/booking/info",
                "style": "primary",
            }
          ]
        }
      ]
    }
    
    if (!booking.is_cancelled) {
      resp.attachments[0].actions.push({
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
            );
    }
    
    console.log("*****sending back action")
    console.log(resp)
    
    const options = {host: 'slack.com', port: 443, path: "/api/chat.update", headers: {'Authorization': 'Bearer ' + bearer, 'Content-Type': 'application/json'}, method: 'POST'};
    const req = https.request(options, (result) => {
        var dataQueue = "";    
        result.on("data", function (dataBuffer) {
            dataQueue += dataBuffer;
        });
        result.on("end", function () {
            let body = JSON.parse(dataQueue);
            
            console.log("done post back", dataQueue)
            func(dataQueue);

        });        
    });
    req.write(JSON.stringify(resp));
    req.end();
}

module.exports = slack_command;

