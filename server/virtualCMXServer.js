/*
virtualCMXServer - implement virtual CMX server for use when CMX is down
We assume the existence of a testData directory with two files
  allClients.json - contains an array of all clients by MAC address
  history.json - contains an array of a single client's history

Author: David Tootill 2015.05.22
Copyright (C) Cisco, Inc.  All rights reserved.
*/

var allClients = null
var history = null
var fs = require("fs")


// implement() - set up server virtualization
function implement() {
  console.log("Server virtualization active - CMX server will not be accessed")
  allClients = require("./testData/allClients.json")
  history = require("./testData/history.json")
}

// respond() - respond to a REST API call
function respond(req, res) {
  var matches
  if (null != req.path.match(/location\/v1\/clients\/count$/)) {
    res.json({count: allClients.length})

  } else if (null != req.path.match(/location\/v1\/clients$/)) {
    res.send(allClients)

  } else if (null != (matches = req.path.match(/location\/v1\/history\/clients\/([0-9a-f:]+)/))) {
    if (history[0].apMacAddress == matches[1]) {
      res.send(history)
    } else {
      res.status(404).send({error: "Client " + matches[1] + " history not available; history is available only for " + history[0].apMacAddress})
    }

  } else if (null != (matches = req.path.match(/location\/v1\/clients\/([0-9a-f:]+)/))) {
    for (var i = 0; i < allClients.length; i++) {
      var client = allClients[i]
      if (client.apMacAddress == matches[1]) {
        res.send(client)
        return
      }
    }
    res.status(404).send({error: "Client " + matches[1] + " not found"})

    fs.readFile("./testData/"+matches[1]+matches[2], function(err, img) {
      if (err) {
        res.status(404).send({error: "Image " + matches[1]+matches[2] + " not available from virtualized server"})
      } else {
        res.writeHead(200,{"Content-Type":"image/"+matches[2]})
        res.end(img, "binary")
      }
    })
  } else {
      res.status(500).send({error: "Method " + req.path + " has not been virtualized"})
  }
}

exports.implement = implement
exports.respond = respond
