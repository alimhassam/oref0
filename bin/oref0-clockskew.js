#!/usr/bin/env node

var fs = require('fs');
var pumphistory = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));

var preferences = require('preferences.json');
Date.prototype.toIsoString = function() {
    var tzo = -this.getTimezoneOffset(),
        dif = tzo >= 0 ? '+' : '-',
        pad = function(num) {
            var norm = Math.floor(Math.abs(num));
            return (norm < 10 ? '0' : '') + norm;
        };
    return this.getFullYear() +
        '-' + pad(this.getMonth() + 1) +
        '-' + pad(this.getDate()) +
        'T' + pad(this.getHours()) +
        ':' + pad(this.getMinutes()) +
        ':' + pad(this.getSeconds()) +
        dif + pad(tzo / 60) +
        ':' + pad(tzo % 60);
}


var clockSkew = 0;
var newTimeTime = 0
var result = [];
var applyClockSkew = preferences.applyClockSkew;

for(var i = 0; i < pumphistory.length; ++i)
{
  var item = pumphistory[i];
  var timestampDate = new Date(item.timestamp);
  if (item._type === "NewTime")
  {
    newTimeTime = timestampDate.getTime();
  }
  else if (item._type === "ChangeTime")
  {
    clockSkew += newTimeTime - timestampDate.getTime();
    item["clockSkew"] = clockSkew;
    if (applyClockSkew)
    {
      item["timestamp"] = new Date(timestampDate.getTime() + clockSkew ).toIsoString();
    }
  }
  else
  {
    item["clockSkew"] = clockSkew;
    if (applyClockSkew)
    {
      item["timestamp"] = new Date(timestampDate.getTime() + clockSkew ).toIsoString();
    }
  }
  result.push(item);
}
console.log(JSON.stringify(result, null, 2));
