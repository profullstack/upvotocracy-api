import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    admin: Boolean,
    karma: { type: Number, default: 0, index: true },
    inbox: {
      type: [
        {
          comment: Schema.Types.ObjectId,
          read: Boolean,
        },
      ],
      select: false,
    },
    bitcoinAddress: { type: String },
    nimiqAddress: { type: String },
    links: [
      {
        name: String,
        url: String,
      },
    ],
    created: { type: Date },
    ip: { type: String },
    subscriptions: [
      {
        type: Schema.Types.ObjectId,
        default: [],
      },
    ],
    apiKeys: [
      {
        _id: false,
        keyName: String,
        key: String,
      },
    ],
  },
  { collation: { locale: 'en', strength: 1 } },
);

userSchema.set('toJSON', { getters: true });
userSchema.options.toJSON.transform = (doc, ret) => {
  const obj = { ...ret };
  delete obj._id;
  delete obj.__v;
  delete obj.password;
  delete obj.ip;

  return obj;
};

userSchema.pre('save', async function (next) {
  this.password = await bcrypt.hash(this.password, 10);
  if (!this.created) {
    this.created = Date.now();
  }
  next();
});

userSchema.methods.isValidPassword = async function (password) {
  const match = await bcrypt.compare(password, this.password);
  return match;
};

userSchema.methods.canEditCategory = function (category) {
  const id = JSON.stringify(this._id);
  const owner = JSON.stringify(category.owner);
  return this.admin ? true : id === owner;
};

userSchema.methods.canDeletePost = function (post) {
  const id = JSON.stringify(this._id);
  const author = JSON.stringify(post.author.id);
  console.log(id, author);
  return this.admin ? true : id === author;
};

const User = mongoose.model('User', userSchema);

export default User;
