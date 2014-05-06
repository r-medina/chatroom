'use strict';

var genNum = function() {
  // not always 6 digits, but it doesn't really matter
  return Math.round(Math.random()*1000000).toString();
};


var genID = function(existingNums) {
  var id = genNum();
  
  // while num is already a room id
  while (existingNums.indexOf(id) != -1) {
    id = genNum();
  }

  return id;
};


module.exports = genID;
