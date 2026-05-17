To build and deploy to the public Docker repository

````
docker build --no-cache -t memorias:current .

docker tag memorias:current cientopolis/memorias:latest

docker tag memorias:current cientopolis/memorias:[commit-hash]

docker push cientopolis/memorias:latest

docker push cientopolis/memorias:[commit-hash]
````

To deploy / run

````
sudo docker pull cientopolis/memorias:latest

sudo docker compose down

sudo docker compose up -d
````

