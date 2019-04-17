all: build rundoc

build-all:
	cd receive && go build
	cd .. && go build

run-all:
	cd receive && go build
	cd .. && go build
	cd receive && ./receive -d=true
	cd .. && ./OutboundCommunication -d=true


	
