const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp')

const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error:"));
db.once('open', () => {
    console.log('Database connected');
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 30) + 10;
        const camp = new Campground({
            author: '62c7b393d9f396fc7429839a',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)} `,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum minima labore nesciunt suscipit, distinctio vitae nobis! Autem magni rem ipsam placeat, expedita repudiandae consequatur quaerat laborum optio, dignissimos, et voluptate.',
            price,
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/davatxx2f/image/upload/v1657566472/YelpCamp/zyqmq6o64yzv2g4a4gkg.jpg',
                    filename: 'YelpCamp/zyqmq6o64yzv2g4a4gkg',
                },
                {
                    url: 'https://res.cloudinary.com/davatxx2f/image/upload/v1657566475/YelpCamp/js55vkjc9fkg6ejlxnze.jpg',
                    filename: 'YelpCamp/js55vkjc9fkg6ejlxnze',
                },
                {
                    url: 'https://res.cloudinary.com/davatxx2f/image/upload/v1657566476/YelpCamp/itdid0t8vgew9ux8jvxw.jpg',
                    filename: 'YelpCamp/itdid0t8vgew9ux8jvxw',
                }
            ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    console.log('Disconnected from Database')
    mongoose.connection.close();
});