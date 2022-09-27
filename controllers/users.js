const User = require('../models/User');
const Post = require('../models/Post');

module.exports = {
    getUsers: async (req, res) => {
        try {
            const users = await User.find().lean();
            // const users = await User.find().sort({ createdAt: "desc" }).lean();
            res.render("users.ejs", { users: users, user: req.user });
        } catch (err) {
            console.log(err);
        }
    },
    getProfile: async (req, res) => {
        try {
            //   const posts = await Post.find({ user: req.params.userName });
            // this one worked below ---
            //   const users = await User.find({ userName: req.params.userName });
            //   console.log(req.params.userName)
            //   const posts = await Post.find({ posts: users.userName })
            const user = await User.find({ userName: req.params.userName }).lean()
            const posts = await Post.find({ user: user })

            res.render("profile.ejs", { posts: posts, user: req.user, userProfile: user[0] });
        } catch (err) {
            console.log(err);
        }
    },
}
