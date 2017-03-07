# Graffinity

Graffinity is a prototype implementation of two visualization techniques for visualizing connectivity realtionships in large graphs. These techniques are the connectivity matrix and intermediate node table. Graffinity also includes a query interface and supplemental views in the form of path lists and node-link diagrams. 

This project contains the client application written in HTML and JavaScript, using various open-source web frameworks. In order to use all the features of Graffinity, you must also have a running version of the [Graffinity Server](http://github.com/visdesignlab/graffinity_server).

# Setup 

These are directions for running Graffinity on your local machine using npm and gulp. Graffinity comes with one example query result that is displayed by default. If you want to run queries, then you must also setup the server (see link above). 

1. Install prerequisites - npm and bower
1. Clone this repository
1. Cd into the project folder
1. Run `npm install`
1. Run `bower install`
1. Run `gulp serve` to start the application
