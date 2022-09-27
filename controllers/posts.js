const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");
const Comment = require('../models/Comment')

module.exports = {
  getProfile: async (req, res) => {
    try {
      const posts = await Post.find({ user: req.user.id });
      res.render("profile.ejs", { posts: posts, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getFeed: async (req, res) => {
    try {
      const posts = await Post.find().sort({ createdAt: "desc" }).lean();
      res.render("feed.ejs", { posts: posts, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getPost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      const comments = await Comment.find({post: req.params.id}).sort({ createdAt: 'desc' }).lean()
      res.render("post.ejs", { post: post, user: req.user, comments: comments });
    } catch (err) {
      console.log(err);
    }
  },
  createPost: async (req, res) => {
    try {
      // Upload image to cloudinary
      let image
            if (req.file) image = await cloudinary.uploader.upload(req.file.path);
      // const result = await cloudinary.uploader.upload(req.file.path);
      
      await Post.create({
        title: req.body.title,
        image: image ? image.secure_url: null,
        cloudinaryId: image ? image.public_id : null,
        // image: result.secure_url,
        // cloudinaryId: result.public_id,
        // caption: req.body.caption,
        workout: req.body.workout,
        diet: req.body.diet,
        likes: 0,
        user: req.user.id,
      });
      console.log("Post has been added!");
      res.redirect(`/profile/${req.user.userName}`);
    } catch (err) {
      console.log(err);
    }
  },
  likePost: async (req, res) => {
    try {
      const result = await Post.find({ _id: req.params.id, likedBy: req.user.userName })
      if(result.length !== 0){
        await Post.findOneAndUpdate(
          { _id: req.params.id },
          {
            $inc: { likes: -1 },
            $pull: { likedBy: req.user.userName }
          },
        );
      } else {
        await Post.findOneAndUpdate(
          { _id: req.params.id },
          {
            $inc: { likes: 1 },
            $push: { likedBy: req.user.userName }
          },
        );
      }
      
      console.log("Likes +1");
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
  deletePost: async (req, res) => {
    try {
      // Find post by id
      let post = await Post.findById({ _id: req.params.id });
      if(post.image)
        // Delete image from cloudinary
        await cloudinary.uploader.destroy(post.cloudinaryId);
      // Delete post from db
      await Post.remove({ _id: req.params.id });
      console.log("Deleted Post");
      res.redirect(`/profile/${req.user.userName}`);
    } catch (err) {
      res.redirect(`/profile/${req.user.userName}`);
    }
  },
};
