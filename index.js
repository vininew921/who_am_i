require('dotenv').config();
require;
const Discord = require('discord.js');
const bot = new Discord.Client();
var auth = require('./auth.json');
const TOKEN = auth.token;

bot.login(TOKEN);

class Player {
  constructor(u, i) {
    this.id = i;
    this.username = u;
    this.guessName = 'Not defined';
    this.suggestions = [];
    this.ready = false;
  }
}

var players = [];
var playerDetails = [];
var canJoin = true;

bot.on('ready', () => {
  console.info('Connected successfully');
});

bot.on('message', (msg) => {
  if (msg.author.username != bot.user.username && msg.content.startsWith('!')) {
    switch (msg.content.split(' ')[0].trim()) {
      case '!entrar':
        if (canJoin) {
          const p = new Player(msg.author.username, msg.author.id);
          if (!players.includes(p.username)) {
            players.push(p.username);
            playerDetails.push(p);
            msg.reply(`entrou com sucesso.`);
            playerDetails.forEach((p) => {
              var user = bot.users.cache.get(p.id);
              user.send(printPlayers());
            });
          } else {
            msg.reply(`${msg.author.username} você já está jogando!`);
          }
        } else {
          msg.reply(`${msg.author.username} já existe um jogo em progresso.`);
        }
        break;

      case '!ready':
        ready(msg);
        break;

      case '!start':
        start(msg);
        break;

      case '!end':
        canJoin = true;
        playerDetails.forEach((p) => {
          var user = bot.users.cache.get(p.id);
          user.send('O jogo acabou. Top.');
        });
        players = [];
        playerDetails = [];
        break;

      case '!sugerir':
        suggest(msg);
        break;

      default:
        break;
    }
  }
});

function printPlayers() {
  var message = 'Players: ';
  players.forEach((p) => {
    message += p + ' | ';
  });
  return message;
}

function printPlayersWithDetails(to) {
  var message = 'Players: ';
  playerDetails.forEach((p) => {
    if (p.username != to) {
      message += `${p.username} -> ${p.guessName} | `;
    }
  });
  return message;
}

function start() {
  playerDetails.forEach((p) => {
    var r = Math.floor(Math.random() * p.suggestions.length);
    p.guessName = p.suggestions[r];
    console.log(r);
  });
  playerDetails.forEach((p) => {
    var user = bot.users.cache.get(p.id);
    user.send('O jogo começou! Cada player recebeu o nome das pessoas participantes (menos o próprio, obviamente)');
    user.send(printPlayersWithDetails(p.username));
  });
  canJoin = false;
}

function ready(msg) {
  var readyPlayer = playerDetails.find((obj) => {
    return obj.username == msg.author.username;
  });
  readyPlayer.ready = true;
  var everyoneReady = true;
  playerDetails.forEach((p) => {
    if (!p.ready) {
      everyoneReady = false;
    }
  });

  if (everyoneReady && playerDetails.length > 1) {
    start();
  }
}

function suggest(msg) {
  try {
    var p = msg.content.split('-')[1].trim();
    var suggestion = msg.content.split('-')[2].trim();

    var suggestedPlayer = playerDetails.find((obj) => {
      return obj.username == p;
    });

    suggestedPlayer.suggestions.push(suggestion);
    msg.reply('Sugestão adicionada com sucesso.');
  } catch (error) {
    msg.reply(`Error, favor reportar ao vinicius: ${error}`);
  }
}
