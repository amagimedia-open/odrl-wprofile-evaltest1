# Notes

# Installation

```
$ ./install_node.sh
$ ./install_packages.sh
```

- We use `20.10.0` due to the message `punycode is deprecated in npm`
- See <https://stackoverflow.com/a/77737680/1029379>

# Run unit tests

```
$ node main.js
```

# Code modification

The file `evaltests/test.js.modf` is a modified version of 
`evaltests/test.js` where Promise.allSettled is used. This 
was done to run the code in the office laptop. Need to 
check the node version there.

