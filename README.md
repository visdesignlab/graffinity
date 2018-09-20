[![DOI](https://zenodo.org/badge/55440347.svg)](https://zenodo.org/badge/latestdoi/55440347)

# Graffinity

Graffinity is a prototype implementation of two techniques for visualizing connectivity in large graphs: the connectivity matrix and the intermediate node table. We created these techniques to summarize many short paths that connect nodes. Please see our [EuroVis paper](http://vdl.sci.utah.edu/publications/2017_eurovis_graffinity) for details. 

I recently updated Graffinity to run entirely in a web browser. It is available [here](http://vdl.sci.utah.edu/graffinity). Beware: this version only works with [neuroscience data](http://connectomes.utah.edu/export/files.html#neuron-connectivity-network).

Previously, Graffinity could be used with a flight dataset as well. However, it required a [server](https://github.com/visdesignlab/graffinity_server) running a graph database. The flight dataset can still be accessed by using the [release of Graffinity](https://github.com/visdesignlab/graffinity/releases/v0) that is described in our EuroVis paper.

# Development

These are directions for running Graffinity on your local machine using npm and gulp.

1. Install prerequisites - npm and bower
1. Clone this repository
1. Cd into the project folder
1. Run `npm install`
1. Run `bower install`
1. Run `gulp serve` to start the application
