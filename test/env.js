"use strict";

/* eslint-disable no-undef */
require("mocha");

// Set up chai extensions
const chai = require("chai");
chai.config.includeStack = true;

chai.use(require("chai-as-promised"));
chai.use(require("deep-equal-in-any-order"));
chai.use(require("chai-truthy"));
chai.use(require("sinon-chai"));
/* eslint-enable no-undef */
