<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Development

1. Clone repo
2. Exec

```
yarn install
```

3. Install Nest CLI

```
npm i -g @nestjs/cli
```

4.  Run DB

```
docker-compose up -d
```

5. Clone file **.env-template** and rename to **.env**

6. Fill env variables in **.env**

7. Exec app in dev:

```
yarn start:dev
```

8. Load test DB

```
localhost:PORT/api/v2/seed/
```

## Stack

*MongoDB
*Nest

## NOTES

Server uses `pm2` to run
