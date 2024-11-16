FROM mongo

COPY ./init.consumer.json /init.consumer.json
COPY ./init.infrastructure.json /init.infrastructure.json
COPY ./init.user.consumer.json /init.user.consumer.json
COPY ./init.user.provider.json /init.user.provider.json
CMD mongoimport --host mongodb-sandbox --db consumer --collection infrastructureconfigurations --type json --file /init.consumer.json --jsonArray & mongoimport --host mongodb-sandbox --db infrastructure --collection infrastructureconfigurations --type json --file /init.infrastructure.json --jsonArray & mongoimport --host mongodb-sandbox --db provider --collection users --type json --file /init.user.provider.json --jsonArray & mongoimport --host mongodb-sandbox --db consumer --collection users --type json --file /init.user.consumer.json --jsonArray