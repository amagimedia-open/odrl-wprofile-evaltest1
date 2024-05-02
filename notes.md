# Notes

## Installation

```
$ ./install_node.sh
$ ./install_packages.sh
```

- We use `20.10.0` due to the message `punycode is deprecated in npm`
- See <https://stackoverflow.com/a/77737680/1029379>

## Run unit tests

```
$ node main.js
```

If this does not work.  swap 
- let Test1 = require("./evaltests/test") and 
- //let Test1 = require("./evaltests/test_modf")

## Code modification

The file `evaltests/test_modf.js` is a modified version of 
`evaltests/test.js` where Promise.allSettled is used. This 
was done to run the code in the office laptop. Need to 
check the node version there.

## Using ctags

```
$ ./gen_tags.sh
```

- This should generate a `tags` file.
- In `vim` use this via `:set tags=tags`

## Resources

- <https://github.com/romainl/ctags-patterns-for-javascript>


