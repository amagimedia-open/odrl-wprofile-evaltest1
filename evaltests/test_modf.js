"use strict"

let fs = require("fs")
let jsonfile = require('jsonfile')
let jsonld = require('jsonld')
let N3 = require("n3")
let odrlCoreVocab = require("../model/odrlCoreVocabulary")
let configs = require("../services/configs");
let testlogger = require("../services/testlogger")
let utils = require("../services/utils")
let evaluator = require("../evaluator/evaluator")


/**
 * Sets the context of a test case and runs the evaluator against it
 * @param caseName - string, as used in the testconfig.yml file
 */
function doTheTest(caseName){

    if (!caseName){
        console.log("No case name - TEST ENDED")
        return
    }

    configs.loadTestconfig()

    let logLine = ""

    if (!configs.testconfig[caseName]){
        console.log("case name <" + caseName + "> is unknown or not properly defined - TEST ENDED")
        return
    }
    let evalContext = configs.testconfig[caseName]
    let testFn = evalContext.filename

    let tlog = new testlogger.Testlogger()

    tlog.addLine("START with test case: " + caseName + "  -- on/at " + utils.getDateTimeNowISO())
    console.log("START with test case: " + caseName + "  -- on/at " + utils.getDateTimeNowISO())

    if (evalContext.description) {
        tlog.addLine("DESCRIPTION: " + evalContext.description)
        console.log("DESCRIPTION: " + evalContext.description)
    }

    // ingest the JSON-LD test file
    let jsonldFp = "testdata/" + testFn + ".json"
    console.log("MSG: jsonldFp " + jsonldFp)
    let policyJsonldRaw = jsonfile.readFileSync(jsonldFp)
    let jsonldExpFp = "testdataout/" + testFn + "=exp.json"

    /*
    jsonld.expand(policyJsonldRaw, function (err, policyJsonldExp) {
    */

    let p0 = jsonld.expand(policyJsonldRaw)
    let f0 = function (err, policyJsonldExp) {
        console.log(">>>" + typeof policyJsonldExp)
        console.log("MSG: jsonld.expand")
        if (err) {
            console.log("ERR: " + err)
            throw(err)
            return
        }
        jsonfile.writeFileSync(jsonldExpFp, policyJsonldExp, {spaces: 2})
    }

    // transform the JSON-LD to RDF triples/nquads
    let nquadsFp = "testdataout/" + testFn + "=nquads.txt"
    console.log("MSG: nquadsFp " + nquadsFp)

    /*
    jsonld.toRDF(policyJsonldRaw, {format: 'application/nquads'}, function(err, policyNquads) {
    */

    let p1 = jsonld.toRDF(policyJsonldRaw, {format: 'application/nquads'})
    let f1 = function(err, policyNquads) {
        console.log("MSG: jsonld.toRDF ")
        if (err) {
            console.log("ERR: " + err)
            throw(err)
            return
        }
        // policyNquads is a string of nquads
        fs.writeFileSync(nquadsFp, policyNquads)

        let policyN3store = N3.Store()
        let n3parser = N3.Parser()
        let policyN3triples = n3parser.parse(policyNquads)
        policyN3store.addTriples(policyN3triples)
        tlog.addLine("MSG: JSON-LD read, parsed, transformed to RDF, files written ")
        console.log("MSG: JSON-LD read, parsed, transformed to RDF, files written ")

        let permissionQuads = policyN3store.getTriplesByIRI(null, odrlCoreVocab.permission, null, null)
        let prohibitionQuads = policyN3store.getTriplesByIRI(null, odrlCoreVocab.prohibition, null, null)
        let obligationQuads = policyN3store.getTriplesByIRI(null, odrlCoreVocab.obligation, null, null)


        // START evaluating a specific Rule
        let evalRuleid = ""
        let evalRuleFound = false
        let evalRulePropertyname = ""
        if (evalContext.evalRuleid){
            evalRuleid = evalContext.evalRuleid
            evalRuleFound = true
        }
        else {
            if (evalContext.evalRuleproperty){
                let evalRuleproperty = evalContext.evalRuleproperty
                let strArr = evalRuleproperty.split(".")
                let evalRulepropertyname = strArr[0]
                let evalRulepropertyindexnr = parseInt(strArr[1], 10)
                switch (evalRulepropertyname){
                    case "permission":
                        if (permissionQuads.length > 0){
                            if (permissionQuads.length <= evalRulepropertyindexnr){
                                evalRuleid = permissionQuads[evalRulepropertyindexnr - 1].object
                                evalRulePropertyname = permissionQuads[evalRulepropertyindexnr - 1].predicate
                                evalRuleFound = true
                            }
                        }
                        break;
                    case "prohibition":
                        if (prohibitionQuads.length > 0){
                            if (prohibitionQuads.length <= evalRulepropertyindexnr){
                                evalRuleid = prohibitionQuads[evalRulepropertyindexnr - 1].object
                                evalRulePropertyname = prohibitionQuads[evalRulepropertyindexnr - 1].predicate
                                evalRuleFound = true
                            }
                        }
                        break;
                    case "obligation":
                        if (obligationQuads.length > 0){
                            if (obligationQuads.length <= evalRulepropertyindexnr){
                                evalRuleid = obligationQuads[evalRulepropertyindexnr - 1].object
                                evalRulePropertyname = obligationQuads[evalRulepropertyindexnr - 1].predicate
                                evalRuleFound = true
                            }
                        }
                        break
                }
            }
        }

        if (!evalRuleFound){
            logLine = "ERROR: no id of the Rule which should be evaluated defined - TEST terminated"
            tlog.addLine(logLine)
            tlog.writeLog("CASE_" + caseName + "_log.txt")
            console.log(logLine)
            return
        }
        // at this point the id of the rule which should be evaluated is set
        tlog.addLine("NEXT STEP: Start evaluation of Rule with id '" + evalRuleid + "'")


        if (evalRulePropertyname === "") {
            // get the subclass of the Rule
            let ruleQuads = policyN3store.getTriplesByIRI(null, null, evalRuleid, null)
            if (ruleQuads) {
                evalRulePropertyname = ruleQuads[0].predicate
            }
            tlog.addLine("TESTRESULT: property referencing the to-be-tested Rule = " + evalRulePropertyname)
        }
        switch (evalRulePropertyname) {
            case odrlCoreVocab.permission:
                evaluator.evaluatePermission(policyN3store, evalRuleid, tlog, evalContext)
                break
            case odrlCoreVocab.prohibition:
                evaluator.evaluateProhibition(policyN3store, evalRuleid, tlog, evalContext)
                break;
            case odrlCoreVocab.obligation:
                let obligationEvalRound = evalContext.obligationEvalRound
                switch (obligationEvalRound){
                    case "1":
                        evaluator.evaluateObligationRound1(policyN3store, evalRuleid, tlog, evalContext)
                        break
                    case "2":
                        evaluator.evaluateObligationRound2(policyN3store, evalRuleid, tlog, evalContext)
                        break
                }
                break;
        }

        // finally: write test log
        tlog.addLine("CLOSING test case: " + caseName + "  -- on/at " + utils.getDateTimeNowISO())
        tlog.writeLog("CASE_" + caseName + "_log.txt")
        console.log("CLOSING test case: " + caseName + "  -- on/at " + utils.getDateTimeNowISO())
    }

    // see https://www.javascripttutorial.net/es-next/javascript-promise-allsettled/
    // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled

    Promise.allSettled([p0, p1]).then((result) => {

        // result[0].status, result[0].value, result[0].reason 

        f0(result[0].reason, result[0].value)
        f1(result[1].reason, result[1].value)
    });

    console.log("MSG: doTheTest() completed")
}
exports.doTheTest = doTheTest

