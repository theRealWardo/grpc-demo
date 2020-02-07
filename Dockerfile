FROM golang:1.13 AS gateway

RUN apt-get update && apt-get install -y unzip

# http://google.github.io/proto-lens/installing-protoc.html
RUN PROTOC_ZIP=protoc-3.7.1-linux-x86_64.zip && \
  curl -OL https://github.com/protocolbuffers/protobuf/releases/download/v3.7.1/$PROTOC_ZIP && \
  unzip -o $PROTOC_ZIP -d /usr/local bin/protoc && \
  unzip -o $PROTOC_ZIP -d /usr/local 'include/*' && \
  rm -f $PROTOC_ZIP

RUN go get -u github.com/grpc-ecosystem/grpc-gateway/protoc-gen-grpc-gateway && \
  go get -u github.com/grpc-ecosystem/grpc-gateway/protoc-gen-swagger && \
  go get -u github.com/golang/protobuf/protoc-gen-go

# Copy in sources
COPY gateway /go/src/github.com/therealwardo/grpc-api/gateway
COPY proto /go/src/github.com/therealwardo/grpc-api/proto

WORKDIR /go/src

# Generate Go proto bindings.
RUN protoc -I/usr/local/include -I. \
  -I$GOPATH/src \
  -I$GOPATH/src/github.com/grpc-ecosystem/grpc-gateway/third_party/googleapis \
  -I$GOPATH/src/github.com/grpc-ecosystem/grpc-gateway \
  --go_out=plugins=grpc:. \
  github.com/therealwardo/grpc-api/proto/voting.proto

# Generate the gateway.
# This one cares more about the work dir...
RUN protoc -I/usr/local/include -I. \
  -I$GOPATH/src \
  -I$GOPATH/src/github.com/grpc-ecosystem/grpc-gateway/third_party/googleapis \
  -I$GOPATH/src/github.com/grpc-ecosystem/grpc-gateway \
  --grpc-gateway_out=logtostderr=true:. \
  github.com/therealwardo/grpc-api/proto/voting.proto

# Generate the Swagger.
RUN protoc -I/usr/local/include -I. \
  -I$GOPATH/src \
  -I$GOPATH/src/github.com/grpc-ecosystem/grpc-gateway/third_party/googleapis \
  -I$GOPATH/src/github.com/grpc-ecosystem/grpc-gateway \
  --swagger_out=logtostderr=true:. \
  github.com/therealwardo/grpc-api/proto/voting_swag.proto

# Compile + Run
WORKDIR /go/src/github.com/therealwardo/grpc-api/gateway
RUN go mod init && \
  go mod tidy && \
  go build


# Make a simple serving image.
FROM nginx:stable AS static
COPY --from=gateway /go/src/github.com/therealwardo/grpc-api/proto/voting_swag.swagger.json /usr/share/nginx/html/voting.swagger.json
COPY nginx.conf /etc/nginx/conf.d/default.conf
