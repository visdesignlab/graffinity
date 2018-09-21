[![DOI](https://zenodo.org/badge/55440347.svg)](https://zenodo.org/badge/latestdoi/55440347)

# Graffinity

Graffinity is a prototype implementation of two techniques for visualizing connectivity in large graphs: the connectivity matrix and the intermediate node table. We created these techniques to summarize many short paths that connect nodes. Please see our [EuroVis paper](http://vdl.sci.utah.edu/publications/2017_eurovis_graffinity) for details. 

I recently updated Graffinity to run entirely in a web browser. It is available [here](http://vdl.sci.utah.edu/graffinity). Beware: this version only works with [neuroscience data](http://connectomes.utah.edu/export/files.html#neuron-connectivity-network).

Previously, Graffinity could be used with a flight dataset as well. However, it required a [server](https://github.com/visdesignlab/graffinity_server) running a graph database. The flight dataset can still be accessed by using the [release of Graffinity](https://github.com/visdesignlab/graffinity/releases/v0) that is described in our EuroVis paper.

# Development

I built Graffinity while I was also teaching myself web development. As a result, I made design decisions that hinder continued development. And, I built Graffinity to work with a few different datasets. However, I have since deprecated support for everything that is not neuroscience data. It's a mess. 

I strongly suggest that anyone who is interested in using the connectivity matrix or intermediate node table should read our EuroVis paper and implement these techniques themselves. Nevertheless, if you need to continue developing or supporting Graffinity, here are directions for building and deploying it.

## Build

These are directions for running Graffinity on your local machine using npm and gulp.

1. Install prerequisites - npm, bower, gulp
1. Clone this repository
1. Cd into the project folder
1. Run `npm install`
1. Run `bower install`
1. Run `gulp serve` to start the application

## Deploy

The client-only version of Graffinity is hosted on this repository's github page. It can be updated from your local machine with using the gulp deploy task: e.g., running `gulp build && gulp deploy` from the local directory.
