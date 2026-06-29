import { getPosts, getMyPosts, createPost, likePost } from "./posts";
import { createComment } from "./comments";
import { registerUser, loginUser } from "./auth";

export * from "./auth";
export * from "./posts";
export * from "./comments";

export default {
  getPosts,
  getMyPosts,
  createPost,
  likePost,
  createComment,
  registerUser,
  loginUser,
};
