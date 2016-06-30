//var path = require('path');
//var yaml = require('js-yaml');
//var fs = require('fs');

process.env.SOURCE_DIR=__dirname;
//process.env.CONFIG_FILE= path.join(__dirname, 'blueprints.yaml');
//process.env.DIST_DIR = path.join(__dirname, 'dist','blueprints.py');
//process.env.TEMPLATE_FILE = path.join(__dirname,'Blueprints.py.hbs');
//
//var templateFile = process.env.TEMPLATE_FILE;
//var distFilename = templateFile.substring(templateFile.lastIndexOf('.'));
//process.env.DIST_FILE = path.join( process.env.DIST_DIR, distFilename );
//
//try {
//    var doc = yaml.safeLoad(fs.readFileSync(process.env.CONFIG_FILE, 'utf8'));
//    console.log( ' this is doc ', doc );
//
//}catch(e){
//    console.log(e);
//}

require('../metalsmith');

