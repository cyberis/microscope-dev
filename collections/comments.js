Comments = new Meteor.Collection('comments');
Meteor.methods({
  comment: function(commentAttributes) {
    var user = Meteor.user();
    var post = Posts.findOne(commentAttributes.postId);
    // ensure the user is logged in
    if (!user) {
      throw new Meteor.Error(401, 'You need to login to make comments');
    }
    if (!commentAttributes.body) {
      throw new Meteor.Error(422, 'Please write some content');
    }
    if (!post) {
      throw new Meteor.Error(422, 'You must comment on a post');
    }
    
    // if we got this far then we have what we need to insert the item in the collection
    // Extract and hydrate the comment with server side data
    comment = _.extend(_.pick(commentAttributes, 'postId', 'body'), {
      userId: user._id,
      author: user.username,
      submitted: new Date().getTime()
    });
    
    // update posts with the number of coments
    Posts.update(comment.postId, {$inc: {commentsCount: 1}});
    
    // insert the comment and save the id for additional purposes
    comment._id = Comments.insert(comment);
    
    // create a notification for the comment
    createCommentNotification(comment);
    
    // return the id of the newly created comment
    return comment._id;
  }
});