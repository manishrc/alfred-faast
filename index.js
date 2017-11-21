const request = require('request-promise').defaults({jar: true})
const alfy = require('alfy');
const speedTest = require('speedtest-net');

const DASHBOARD_URL = "http://rm.faast.in/ucp/index.php/dashboard";
const LOGIN_URL = "http://rm.faast.in/ucp/index.php/login/validation";
const USERNAME = process.env.username;
const PASSWORD = process.env.password;
const REGEX_REMAINING = /"Remaining \(GB\)", value: "(\d*\.?\d*)"/
const REGEX_CONSUMED = /"Consumed \(GB\)", value: "(\d*\.?\d*)"/

function bandwidth(){
  return request({
    method: 'POST',
    uri: LOGIN_URL,
    form: {
      username: USERNAME,
      password: PASSWORD
    }
  }).then(body => {
    return request(DASHBOARD_URL)
  }).then(body => {
    result = {
      remaining: Number.parseFloat(body.match(REGEX_REMAINING)[1]),
      consumed: Number.parseFloat(body.match(REGEX_CONSUMED)[1])
    }
    return result;
  })
}

function speed(){
  return new Promise(function(resolve, reject) {
  speedTest({
    maxTime: 1000,
    serverId: '3914'
  })
  .on('data', data => resolve({
    download: data.speeds.download,
    upload: data.speeds.upload
  }));
  })
}
async function output(){
  let bw = await bandwidth()
  let sp = await speed()
  alfy.output([
    { title:'Bandwidth Remaining: '+bw.remaining+' GB' },
    { title:'Bandwidth Consumed: '+bw.consumed+' GB' },
    { title:'Download Speed: '+sp.download+' Mbps' },
    { title:'Upload Speed: '+sp.upload+' Mbps' },
  ])
}
output();

