This is a hacked together gRPC demo app that I used for a talk. The talk demo builds up 3 parts, split into 3 branches:

1. `master` includes a basic gRPC server.
2. The `with-gateway` branch ([view diff](https://github.com/theRealWardo/grpc-demo/compare/with-gateway)) adds a JSON API gateway to the gRPC server.
3. The `with-swagger` branch ([view diff](https://github.com/theRealWardo/grpc-demo/compare/with-gateway...with-swagger)) shows how to generate a Swagger (now OpenAPI) spec for the API.
