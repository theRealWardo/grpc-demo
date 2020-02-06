var grpc = require('grpc');
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


function main() {
  var client = new grpcPackage.Voting('localhost:50051', grpc.credentials.createInsecure());
  var thing;
	var vote;
  if (process.argv.length >= 3) {
    thing = process.argv[2];
		if (process.argv.length >= 4) {
			vote = process.argv[3];
		}
  } else {
		return client.ListThings({}, function(err, response) {
			console.log(response);
		});
  }

	if (vote == 'up') {
		client.UpVoteThing({thing: thing}, function(err, response) {
			console.log('Up voted thing:', response);
		});
	} else if (vote == 'down') {
		client.DownVoteThing({thing: thing}, function(err, response) {
			console.log('Down voted thing:', response);
		});
	} else {
		client.AddThing({thing: thing}, function(err, response) {
			console.log('Added thing:', response);
		});
	}
}


main();
