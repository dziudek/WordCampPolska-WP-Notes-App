# WordCamp Polska 2017 - WP-Notes - Aplikacja

Przygotowanie:

0) Należy przygotować WordPressa z włączonym REST API poprzez zainstalowanie wtyczki do JSON Web Tokens i wtyczki z repozytorium https://github.com/dziudek/WordCampPolska-WP-Notes-Plugin

1) Skopiować plik **app/config.example.js** jako plik **app/config.js** i ustawić w nim adres naszego WordPressa (bez slasha na końcu)

2) Należy zainstalować electrona globalnie oraz zależności aplikacji

```
npm install electron -g
npm install
cd app
npm install
cd ..
npm run start
```
