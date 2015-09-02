Template.posts_list.helpers({
  postListTitle: function() {
    return Session.get("postListTitle");
  },
  enumerate: function(arr) {
    return _.map(arr, function(item, i) {
      return {i: i, item: item};
    });
  },
});
