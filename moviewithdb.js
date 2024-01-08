const request = require('request');

const TelegramBot = require('node-telegram-bot-api');

const token = '6092905421:AAGSqBuGqkZyyROxiMnbvENRxC6QgzSwu-Q';
const admin = require('firebase-admin');

const serviceAccount = require('./key.json');
const bot = new TelegramBot(token, { polling: true });

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://console.firebase.google.com/project/project-db-8de07/firestore/data/~2Fnamr~2FNteJkxEr14lz9co6c79d' // Replace with your database URL
});

const db = admin.firestore();

bot.on('message', function(mg){
request('http://www.omdbapi.com/?t='+mg.text+'&apikey=d0f40c4c', function (error, response, body) {
  if(JSON.parse(body).Response=="True"){
    bot.sendMessage(mg.chat.id, "Title "+JSON.parse(body).Title)
    bot.sendMessage(mg.chat.id, "Release Date "+JSON.parse(body).Released)
    bot.sendMessage(mg.chat.id, "Actors "+JSON.parse(body).Actors)
    bot.sendMessage(mg.chat.id, "Rating "+JSON.parse(body).Ratings[0].Value)

    saveMovieDataToFirestore(JSON.parse(body))
  }
  else{
      bot.sendMessage(mg.chat.id, "Movie not found")
  }
});
})

function saveMovieDataToFirestore(data) {
    // Replace 'movies' with the name of the Firestore collection you want to use
    const moviesCollection = db.collection('namr');
  
    // Create a new document with a random ID
    const Reference = moviesCollection.doc();
  
    // Set the movie data in the document
    Reference
      .set({
        title: data.Title,
        releaseDate: data.Released,
        actors: data.Actors,
        rating: data.Ratings[0].Value
      })
      .then(() => {
        console.log('Movie data saved to Firestore:', data.Title);
      })
      .catch((error) => {
        console.error('Error saving movie data:', error);
      });
  }