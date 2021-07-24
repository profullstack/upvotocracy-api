import mongoose from 'mongoose';
import Item from '../models/post';

const log = require('debug');
const dotenv = require('dotenv');

dotenv.config();

const debug = log('express-starter:db');

console.log(process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI, {
  keepAlive: true,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
  reconnectTries: Number.MAX_VALUE,
  reconnectInterval: 500,
});
mongoose.connection.on('connected', () => debug('successfully connected to db'));
mongoose.connection.on('error', console.error);

function getRankedItems(callback) {
  Item.aggregate(
    [
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'a',
        },
      },
      {
        $unwind: '$a',
      },
      {
        $project: {
          _id: '$_id',
          title: '$title',
          url: '$url',
          thumb: '$thumb',
          author: '$author',
          category: '$category',
          score: '$score',
          votes: '$votes',
          comments: '$comments',
          created: '$created',
          views: '$views',
          type: '$type',
          text: '$text',
          sponsored: '$sponsored',
          hashtags: '$hashtags',
          ranking: {
            $divide: [
              {
                $add: [
                  '$score',
                  { $multiply: ['$comments'.length, 0.08] },
                  { $multiply: ['$views', 0.002] },
                  { $multiply: ['$a.karma', 0.0001] },
                  0.75,
                ],
              },
              {
                $add: [
                  1,
                  {
                    $multiply: [
                      { $divide: [{ $subtract: [new Date(), '$created'] }, 14400000] },
                      0.4,
                    ],
                  },
                ],
              },
            ],
          },
        },
      },
      { $sort: { ranking: -1 } },
      { $out: 'posts' },
    ],
    (err, results) => {
      if (err) {
        console.log(err);
        return callback(err);
      }
      console.log('ranked', results);
      process.exit(0);
    },
  ).allowDiskUse(true);
}
getRankedItems();
