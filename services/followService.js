const Follow = require("../models/follow");
const User = require("../models/user");

const followUsersIds = async (identityUserId) => {
  try {
    let following = await Follow.find({ user: identityUserId }).select({
      _id: 0,
      __v: 0,
      user: 0,
      created_at: 0,
    });
    let followers = await Follow.find({ followed: identityUserId }).select({
      _id: 0,
      user: 1,
    });

    const following_clean = [];
    following.forEach((follow) => {
      following_clean.push(follow.followed);
    });
    const followers_clean = [];
    followers.forEach((follow) => {
      followers_clean.push(follow.user);
    });
    return {
      following: following_clean,
      followers: followers_clean,
    };
  } catch (error) {
    return false;
  }
};
const followThisUser = async (identityUserId, profileUserId) => {
  try {
    let following = await Follow.findOne({
      user: identityUserId,
      followed: profileUserId,
    }).select({
      _id: 0,
      __v: 0,
      user: 0,
      created_at: 0,
    });
    let follower = await Follow.findOne({
      user: profileUserId,
      followed: identityUserId,
    });
    return {
      following,
      follower,
    };
  } catch (error) {
    return false;
  }
};

module.exports = {
  followUsersIds,
  followThisUser,
};
