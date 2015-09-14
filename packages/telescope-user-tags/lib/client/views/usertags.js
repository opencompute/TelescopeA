var _getUserTags = function(user) {
  if (!(user && user.profile && user.profile.tags && user.profile.tags.length)) {
    return [];
  }
  return UserTags.find({_id: {$in: user.profile.tags || []}}).fetch();
}

Template.usertags_autoform.helpers({
  availableTags: function() {
    console.log(this);
    return _.map(UserTags.find({}).fetch(), function(tag) {
      var attrs = {
        name: this.name,
        "data-autoform-type": "usertags",
        value: tag._id
      };
      if (_.contains(this.value, tag._id)) {
        attrs.checked = "checked";
      }
      return {name: tag.name, attrs: attrs};
    }.bind(this));
  }
});
Template.usertags_autoform.events({
  'change [data-autoform-type=usertags]': function(event) {
    var name = event.target.name;
    var form = $(event.target).closest("form");
    form.find("[type=hidden][data-autoform-type='usertags'][name='" + name + "']").remove();

    var checked = form.find("[name='" + name + "']:checked");
    console.log(checked);
    checked.each(function(i, input) {
      form.append("<input type='hidden' data-autoform-type='usertags' name='" + name + "' data-schema-key='" + name + "." + i + "' value='" + input.value + "' />");
    });
  }
});


Template.usertags_for_post.helpers({
  userTags: function() {
    var post = this;
    var user = Meteor.users.findOne(post.userId);
    return _getUserTags(user);
  }
});

var _handleError = function(err) {
  console.log(err);
  Messages.flash(err.reason, "error");
  Messages.clearSeen();
}

Template.admin_usertags.events({
  'submit .js-add-user-tag': function(event) {
    event.preventDefault();
    var nameEl = $("[name=newtagname]");
    var name = nameEl.val();
    if (name) {
      Meteor.call("addUserTag", name, function(err) {
        if (err) {
          _handleError(err);
        } else {
          nameEl.val("");
        }
      })
    }
  }
});

Template.admin_usertags.helpers({
  usertags: function() {
    return UserTags.find({}).fetch();
  }
});

Template.list_usertags.helpers({
  mytags: function() {
    var user = this;
    return _getUserTags(user);
  }
})

Template.edit_usertags_profile.helpers({
  availableTags: function() {
    var user = this;
    user.profile = user.profile || {};
    var userTagIds = user.profile.tags || [];
    var allTags = UserTags.find({}).fetch();
    return _.map(allTags, function(tag) {
      var attrs = {
        name: "usertag",
        value: tag._id
      };
      if (_.contains(userTagIds, tag._id)) {
        attrs.checked = "checked";
      }
      return {name: tag.name, attrs: attrs};
    });
  }
});
Template.edit_usertags_profile.events({
  'change [name=usertag]': function(event) {
    var checked = $(event.target).closest("form").find("[name=usertag]:checked");
    var tagIds = _.map(checked, function(el) { return el.value; });
    Meteor.users.update(Meteor.userId(), {$set: {"profile.tags": tagIds}});
  }
});

Template.admin_usertag_item.events({
  'submit .js-edit-user-tag': function(event) {
    event.preventDefault();
    var scope = $(event.currentTarget);
    var newName = scope.find("[name=name]").val();
    var _id = scope.find("[name=name]").attr("data-tag-id");
    Meteor.call("updateUserTag", _id, newName, function(err) {
      if (err) {
        _handleError(err);
      } else {
        Messages.flash(i18n.t("Tag edited."), "success");
      }
    });
  },
  'click .delete': function(event) {
    event.preventDefault();
    var _id = $(event.currentTarget).attr("data-tag-id");
    var tag = UserTags.findOne(_id);
    if (tag && confirm(i18n.t("Are you sure you want to delete this tag?"))) {
      Meteor.call("deleteUserTag", _id, function(err) {
        if (err) {
          _handleError(err);
        } else {
          Messages.flash(i18n.t("Tag deleted."), "success");
        }
      });
    }
  }
});
