
function slack_command(event, callback) => {

    console.log(event)
    
    const body = parseBody(event.body);
    
    console.log(body)
    
    let result = JSON.stringify({user_id: body.user_id, user_name: body.user_name, team_id: body.team_id, team_domain: body.team_domain});
    
    let code = Buffer.from(result).toString('base64');
            
    const resp = {
      "text": "I don't know you - connect your BookingBug Account",
      "attachments": [
        {
          "fallback": "Book your flights at https://flights.example.com/book/r123456",
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
};

function parseBody(body) {
  var result = {};
  body.split("&").forEach(function(part) {
    var item = part.split("=");
    result[item[0]] = decodeURIComponent(item[1]);
  });
  return result;
}


module.exports = slack_command;

//  https://nize0wjfoc.execute-api.eu-west-1.amazonaws.com/prod/vidyo_lookup?booking=123&ref=12345&service=Business%20Banking&client=Glenn