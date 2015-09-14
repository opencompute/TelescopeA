Template.user_complete.helpers({
  requiredFieldsWithUserTags: function() {
    // return fields that are required by the schema but haven't been filled out yet
    var schema = Users.simpleSchema()._schema;
    var requiredFields = _.filter(_.keys(schema), function (fieldName) {
      var field = schema[fieldName];
      return !!field.required && !Telescope.getNestedProperty(Meteor.user(), fieldName);
    });
    return requiredFields;
  }
})
