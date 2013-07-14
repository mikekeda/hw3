#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var rest = require('restler');
var http = require('http');

var assertFileExists = function(infile) {
	var instr = infile.toString();
	if(!fs.existsSync(instr)) {
		console.log("%s does not exist. Exiting.", instr);
		process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
	}
	return instr;
};

/* var assertUrlExists = function(url) {
	var urlstr = url.toString();
	rest.head(urlstr).on('complete', function(result) {
		if (result instanceof Error) {
			console.log("%s does not exist. Exiting.", urlstr);
			process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
		}
	});
	return urlstr;
} */

var cheerioHtmlFile = function(htmlfile) {
	return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
	return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtml = function(htmlfile, checksfile, is_file) {
	if (is_file) {
		$ = cheerioHtmlFile(htmlfile);	
	} else {
		$ = cheerio.load(htmlfile);
	};
	var checks = loadChecks(checksfile).sort();
	var out = {};
	for(var ii in checks) {
		var present = $(checks[ii]).length > 0;
		out[checks[ii]] = present;
	} 
	return out;
};

var clone = function(fn) {
	return fn.bind({});
};

if(require.main == module) {
	program
		.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
		.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
		.option('-u, --url <url_file>', 'Link to index.html')
		.parse(process.argv);

	if(!program.url) {
		var checkJson = checkHtml(program.file, program.checks, true);
		var outJson = JSON.stringify(checkJson, null, 4); 
		console.log(outJson);
	}

	else {
		rest.get(program.url).on('complete', function(result) {
			if (result instanceof Error) {
				console.log("%s does not exist. Exiting.", program.url);
				process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
			}

			var checkJson = checkHtml(result, program.checks, false);
			var outJson = JSON.stringify(checkJson, null, 4); 
			console.log(outJson);
		});
	}

} else {
	exports.checkHtmlFile = checkHtmlFile;
}