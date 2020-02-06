var grpc = require('grpc');
var _ = require('lodash');
var protoLoader = require('@grpc/proto-loader');

var packageDefinition = protoLoader.loadSync(
    __dirname + '/proto/voting.proto',
    {
			keepCase: true,
			longs: String,
			enums: String,
			defaults: true,
			oneofs: true
    });
var grpcPackage = grpc.loadPackageDefinition(packageDefinition).things;


var theThings = {};

function getThing(name) {
  return {
    thing: name,
    votes: theThings[name],
  };
}

function listThings(call, callback) {
  console.log('list', call.request, theThings);
  callback(null, {
    things: _.map(Object.keys(theThings), (t) => getThing(t)),
	});
}

function addThing(call, callback) {
  console.log('add', call.request);
	theThings[call.request.thing] = 1;
  callback(null, getThing(call.request.thing));
}

function upVoteThing(call, callback) {
	if (theThings[call.request.thing]) {
    console.log('up', call.request);
    theThings[call.request.thing]++;
    return callback(null, getThing(call.request.thing));
  }
  callback(null, {});
}

function downVoteThing(call, callback) {
	if (theThings[call.request.thing]) {
    console.log('down', call.request);
    theThings[call.request.thing]--;
    return callback(null, getThing(call.request.thing));
  }
  callback(null, null);
}


function main() {
  var server = new grpc.Server();
  server.addService(grpcPackage.Voting.service, {
		ListThings: listThings,
		AddThing: addThing,
		UpVoteThing: upVoteThing,
		DownVoteThing: downVoteThing
	});
  server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
  server.start();
}
main();
