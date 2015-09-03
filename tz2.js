Timezones = new Mongo.Collection("timezones");

AppUsers = new Mongo.Collection("appusers");

if(Meteor.isServer) {
  AppUsers.allow({
    insert: function(userId, doc){
      return true;
    },
    update: function(userId, doc, fields, modifier){
      return true;
    },
    remove: function (userId, docs){ //only the admin can delete users
      console.log("Yo! " + Meteor.user().username )
      if(Meteor.user().username == "admin"){
        console.log("Current user is admin!")
        return true;
      }
      return false;
    }
  });
};


if (Meteor.isClient) {
  AppUsers.allow({
    insert: function(userId, doc){
      return true;
    },
    update: function(userId, doc, fields, modifier){
      return true;
    },
    remove: function (userId, docs){ //only the admin can delete users
      console.log("Yo " + Meteor.user().username )
      if(!Meteor.user().username == "admin"){
        return true;
      }
      return false;
    }
  });

  // This code only runs on the client
  Template.body.helpers({
    timezones: function () {
      console.log("returning time zones from body helper");
      return Timezones.find({});
    },
    appusers: function() {
      console.log("returning users");
      return AppUsers.find({});
    },
    getnextcolor: function() {
      console.log("getting next colors for circles")
      var uc = UserColors.findOne({});
      return uc;
    },
    setnextcolor: function() {
      console.log("getting next colors for circles")
      var uc = UserColors.findOne({});
      var nextfill;
      var nextletter;
      if(uc.fill == "#77DD77"){
        nextfill = "#f5a623";
        nextletter = "#AC7418";
        //green, go to orangered
      }else if(uc.fill == "#f5a623"){
        //then blue
        nextfill = "#4a90e2";
        nextletter = "#2C5688";
      }else { //back to green
        nextfill = "#77DD77";
        nextletter = "#427C42";
      }
    }
});

  Handlebars.registerHelper('isUsersInTimezone', function(id){
    //console.log("Are there users in time zone id " + String(id));
    var res = AppUsers.find({timezone: String(id)}).count();
    //console.log(res + " users found in timezone" + String(id));
    return res > 0;
  });


Handlebars.registerHelper('drawSomething', function() {
  console.log("drawing");
  var canvas = document.getElementById('canvas'); //finds Original Canvas
//img = document.createElement('img');
//img.src = 'images/a.jpg'; //stores image src

var canv = document.createElement('canvas'); // creates new canvas element
canv.id = 'canvasdummy'; // gives canvas id
canv.height = 60; //get original canvas height
canv.width = 60; // get original canvas width
document.body.appendChild(canv); // adds the canvas to the body element

var canvas1 = document.getElementById('canvasdummy'); //find new canvas we created
var context = canvas1.getContext('2d');

context.arc(30, 30, 30, 0, 2 * Math.PI, false);
//context.drawImage(canvas, 0, 0); //draws original canvas on top of background
//cscreen = canvas1.toDataURL(); //generates PNG of newly created canvas
document.body.removeChild(canv); // removes new canvas

});

  Handlebars.registerHelper('isAdmin', function(id){
    //console.log("Are there users in time zone id " + String(id));
    console.log("Verifying if admin: " + id);
    return id == "admin";
  });

    Template.activeUserCircle.rendered = function(id){
        id = Session.get('circleUID');
        console.log("Using id " + id + " for circle");
        if(id == null) { //if it's null we;re using the logged in user's id
          id = Meteor.user().username;
        }
        var u = AppUsers.findOne({_id: id});
        console.log(u);
        var first_initial, last_initial;

        try{
          first_initial=u.firstName.charAt(0);
        }catch(err) {
          first_initial = "A";
        }

        try{
          last_initial=u.lastName.charAt(0);
        }catch(err){
          last_initial="Z";
        }

        var initials = String(first_initial) + String(last_initial);
        var nextfill;
        var nextletter;

        //just pick colors based ont he first letter of the username
        var crit = u._id.charCodeAt(0) % 3;
        switch(crit) {
        case(0):
          nextfill = "#f5a623";
          nextletter = "#AC7418";
          break;
        case(1):
          nextfill = "#4a90e2";
          nextletter = "#2C5688";
          break;
        case(2):
          nextfill = "#77DD77";
          nextletter = "#427C42";
          break;
        }
        var canvas = $("#activeUserCanvas");
        var centerX = canvas[0].width / 2;
        var centerY = canvas[0].height / 2;
        var context = canvas[0].getContext('2d');
        var ctx = canvas[0].getContext('2d');
        canvas.css('width', canvas[0].width);
        canvas.css('height',canvas[0].height);
        //console.log("circly " + canvas.width + " " + canvas.height);
        var radius = centerX-2;
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        context.fillStyle = nextfill;
        context.fill();
        context.lineWidth = 0;
        context.strokeStyle = nextfill;
        ctx.font = "bold 26px Helvetica";
        ctx.fillStyle=nextletter;
        ctx.textAlign="center";
        ctx.fillText(initials ,centerX, centerY+7);
        context.stroke();
        // draw the canvas
        console.log(context.fillSyle + " fill");
        console.log(context.circleColor + " ccuuu");
    }


  //find users in this timezone
  Handlebars.registerHelper('usersInTimezone', function(id) {
    console.log("Matching users to timezone " + id);
    return AppUsers.find({timezone: String(id)});
  });

  //find users in this timezone
  Handlebars.registerHelper('isUserNew', function() {
    console.log("Seeing if user " + Meteor.user().username +
    " is in database yet");
    return AppUsers.find({"_id":Meteor.user().username},
      {limit: 1}).count() < 1;
  });

  //find users in this timezone
  Handlebars.registerHelper('setCircleUID', function(id) {
    console.log("Setting session variable for uid for circle to " + id);
    Session.set('circleUID', id);
  });

  Template.timezone.helpers({
    localTime: function() {
      var d = new Date();
      var out = "";
      //let java fix the date for us if we go above 23 hrs or below 0
      d.setHours(d.getUTCHours() + parseFloat(this.utcOffset));
      //for time zones with 30 minute offsets
      d.setMinutes(d.getUTCMinutes() +
          (60 * (parseFloat(this.utcOffset) % 1.0)));
      switch(d.getDay()) {
        case 0:
          out += "Sun,";
          break;
        case 1:
          out += "Mon,";
          break;
        case 2:
          out += "Tues,";
          break;
        case 3:
          out += "Wed,";
          break;
        case 4:
          out += "Thur,";
          break;
        case 5:
          out += "Fri,";
          break;
        case 6:
          out += "Sat,";
          break;
        default:
          break;
      }
      console.log("time adjustment done");
     return out += " " + (d.getUTCHours() % 12) + ":" + (d.getUTCMinutes()) + "" +
     	(d.getUTCHours() > 11 ? "pm" : "am");
    }
  });


Template.timezoneselector.rendered = function() {
  console.log("I don't think I'm using this fucking thing");
  $('.timezoneselect').timezoneselect();
}

Template.body.events({
  'click #timezoneselect': function (event, template) {
      var category = $(event.currentTarget).val();
      console.log("Selected time zone from list : " + category);
      console.log("Current user in timezoneselect: " + Meteor.user().username);

      AppUsers.update({
        "_id" : Meteor.user().username
      }, {
        $set: {'timezone': String(category)}
      });
          console.log("Succesfully updated user");
        },"click .delete": function () {
          console.log("Trying to delete " + this._id);
           Meteor.call("deleteAppUser", this._id);

        }
});

Template.newuserform.events({
  'submit .newuserinputform' : function(evt, template) {
    event.preventDefault();
    console.log(event.target.q_username.value + " " +
                event.target.q_first_name.value + " " +
                event.target.q_last_name.value + " " +
                event.target.q_job_title.value + " " +
                event.target.q_current_location.value);


    AppUsers.insert({
       _id: Meteor.user().username,
       username: Meteor.user().username,
      firstName: event.target.q_first_name.value.trim(),
      lastName: event.target.q_last_name.value.trim(),
      displayName: event.target.q_first_name.value.trim() + " "
        + event.target.q_last_name.value.trim(),
      jobTitle:    event.target.q_job_title.value.trim(),
      location: event.target.q_current_location.value.trim(),
      timezone: null,
      createdAt: new Date()
    });
  }
});

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

}

Meteor.methods({
  deleteAppUser: function (id) {
    if(Meteor.user().username == "admin"){
      AppUsers.remove(id);
    }else{
      console.log("User " + Meteor.user().username +
        " does not have delete privileges.")
      }
    }
});
