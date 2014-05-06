# ChatRoom

### About

This is the code for an online chatroom (can be found
[here](http://chatroom.rickym.me/)). Although the project description asked for a
RESTful implementation of a chatroom with a database layer, I made the client a
Socket.IO app that uses AngularJS on the front-end. Nevertheless, I made it such that
all new messages go into a database which can then be accessed RESTful-ly in order
for users to build their ownapps that use my chatroom service's data. That said, the
API does not support POSTs, so it can only be used for inspecting data and, in
theory, doing some data analysis on the text of specific rooms.

My reason for using Socket.IO was primarily that a chatroom SHOULD be a real-time
app. Polling a RESTful service for updated messages periodically would be sluggish
and not very interesting to code up. Seeing as how this project is pretty much a
text-book Socket.IO task, I took the opportunity to get better with that technology.

Given the real-time nature of this task, AngularJS made the most sense. The way it
handles data is sort of unique: istead of considering the model layer to be divorced
from the DOM layer, it uses declarative HTML to bind the data both-ways. That is,
with AngularJS, updating views is not something the programmer has to worry
aboout--once the models are updated, the views follow. For this project in
particular, this afforded me several advantages. Things like making sure the URL
reflects the room number (and that the header on the top of the page says the same
thing) are a breeze. Less trivial things like form validation are also done
client-side in real time. It also provides an easy to use API for the browser's
history. Even though the page appears to be going to multipl urls, it's really just a
one page app where the browser's history is manipulated.

The real advantage of using these technoligies together is speed. As soon as a user
enters a room, everyone knows. As soon as user changes their nickname, everyone else
is notified and the user's DOM reflects his new name. Their messages, too, go out
instantly to everyone.

I also used a few other things like RequireJS for some organizational things and
Grunt for automating tasks (like restarting the server when files change or
triggering a refresh in the browser when HTML, CSS, or JS fiels change). Also, I used
the CSS framework Foundation and Sass/Compass to compile style sheets.

### Features

There are a few cool features to note. The least important is that the pages are
responsive. There are a lot of somewhat trivial, DOM-specific features that I don't
really care to get into (as they're likely the upshot of a line or two of AngularJS
or came with the CSS framework I used).

The most important features center around treating the data as a living entity
instead of one stuck in a database somewhere. The home page, for example, features
the room numbers and the number of people in the rooms. The number of people in the
rooms are updated in real-time. When someone connects or disconnects, an event is
triggered on the back-end that updates all the clients facing that page. The contents
of the search box above the join button in the home page are also bound to the
models: as you write, the rooms that don't match your search query are hidden from
view. Once you do enter a room, the other participants are notified your
arrival. They are notified again when you input a nickname. Nicknames can be any
valid JS string up to 20 characters in length. Switching the focus from the text
input box for your nickname triggers a submit event for that entity which then lets
the server (and the other users) know your new nickname. Messages can be submitted by
hitting the enter key. If you have not set your nickname, however, you will not be
allowed to submit. The list of users in the room is also updated in real-time. When
users' names change or they enter/leave a room, the DOM is immediately updated. When
a room is visited on small sceens, that line changes to only reflect the number of
peole in the room.

Another feature is that when a user eneters a room, all the previous messages get
sent to them (including when people changed their nicknames).

### Code

The code is heavily commented.

This is an overview of the files that run this application:

- `./package.json` - lists dependancies
- `./server.js` - handles the server and communication between the server and the
  clients (by using Socket.IO) as well as calling the apporpriate methods with that
  data to populate the database
- `./schema.sql` - database schema for messages
- `./lib/` - all my own code--just additional Node.js stuff
  - `database.js` - small library for connecting to db that then only exposes a few,
    very specific functions for `../server.js` to use
  - `genID.js` - short little function for generating a unique room ID
  - `initDB.js` - gets run when my package is installed--initialized the database
    with `../schema.sql`
- `./views` - html files
  - `index.html` - main html file that loads in all dependancies and bootstraps
    RequireJS and AngularJS
  - `include/` - contains the files that AngularJS loads
    - `room.html` - html for the room with declarative JS for angular to do its magic
    - `index.html` - the home page
- `./public`
  - `components/` - where Bower installs all dependencies
  - `css/` - where compiled css goes
  - `js/` - where the JS that I wrote goes
    - `app.js` - bootstraps RequireJS and AngularJS
    - `app` - where AngularJS fles live
      - `app.js` - module instantiation and routing
      - `services.js` - code for getting data from RESTful HTTP endpoints on server
      - `controllers.js` - does most of the work. Handles socket connections
      - `directives.js` - basic DOM manippulation AngularJS style
  - `scss/` - all styles were done with Sass--they compile to css

### TODO:

These are a few things I would have liked to get done:

[ ] a lil refactoring of html

[ ] check name against other people in the room

[ ] show when someone is typing

[ ] make user object with random color for name

[ ] show validation problems

[X] make messages for every time someone enters the room

[X] make home page look nicer

[X] make list of active users

[X] have home page numbers of users

[X] jump focus from nickname to message on submit

[X] scroll chat to bottom when div is filled
