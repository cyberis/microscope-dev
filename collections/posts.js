Posts = new Meteor.Collection('posts');

Posts.allow({
  update: ownsDocument,
  remove: ownsDocument
});
Posts.deny({
  update: function(userId, post, fieldNames) {
    // may only edit the following two fields in the post;
    return (_.without(fieldNames, 'url', 'title').length > 0);
  }
});

Meteor.methods({
  post: function(postAttributes) {
    var user = Meteor.user(),
        postWithSameLink = Posts.findOne({url: postAttributes.url});
    
    // ensure user is logged in
    if (! user) {
      throw new Meteor.Error(401, 'You need to login to post new stories');
    }
    
    // ensure the post has a title
    if (!postAttributes.title) {
      throw new Meteor.Error(422, 'Please fill in a headline');
    }
    
    // check that there are no previous posts with the same link
    if (postAttributes.url && postWithSameLink) {
      throw new Meteor.Error(302, 'This link has already been posted', postWithSameLink._id);
    }
    
    // hydrate the post with server side informaiton
    var post = _.extend(_.pick(postAttributes, 'url', 'title', 'message'), {
      userId: user._id,
      author: user.username,
      submitted: new Date().getTime()
    });
    
    // create the new post
    var postId = Posts.insert(post);
    
    // return the new post id
    return postId;
  }
});
