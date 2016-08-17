


//var handlebars = require('handlebars');
var Metalsmith = require('metalsmith');
var collections = require('metalsmith-collections');
var yaml = require('js-yaml');
var handlebars = require('handlebars');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var argv = require('minimist')(process.argv.slice(2));
var sourceDir = argv.sourceDir || process.env.SOURCE_DIR 
var paths = require('metalsmith-paths');

// adds support for template object with fallback to base
function getBase( base ) {
    if ( typeof(base) === 'string'){
        return base;
    }
    if (base.hasOwnProperty('path') && base.path.hasOwnProperty('base')) { // support template object (template.path.base);
        return base.path.base;
    }
    return undefined;

}

function isTemplate(base){
    base = getBase(base);
    return base.split('.').length > 2 && base.endsWith('.hbs');
}

function isPartial(base){
    base = getBase(base);
    return base.split('.').length === 2 && base.endsWith('.hbs');
}

// register partials from SOURCE_DIR
var files = fs.readdirSync(sourceDir);
_.each( _.filter(files, isPartial), (f)=>{
     handlebars.registerPartial(f.split('.')[0], fs.readFileSync(path.join(sourceDir, f)).toString() )
});


handlebars.registerHelper('formatargs', (args) => {
    var result = [];
    for (var i = 0; i < args.length; i++ ){
        var arg = args[i];
        if ( arg.name === '**kwargs' ){
            result.push( 'params=kwargs');
        }else{
            result.push( arg.name + '=' + arg.name );
        }

    }
    return result.join(',');
});

handlebars.registerHelper('func', function(funcNames, currentFuncName, ctx, options ) {
    try{
        funcNames = JSON.parse(funcNames);
    }catch(e){}

    if ( funcNames.indexOf(currentFuncName) >= 0 ){
        return options.fn(this);
    }else{
        return options.inverse(this);
    }
});

handlebars.registerHelper('keepindentation', function(options) {
    //console.log('keepindendation',options.blockParams[0][0]);
    var lines = options.fn(this).split('\n');
    if ( lines.length === 0){
        lines.push('');
    }
    var firstLine = lines[0];
    //console.log('first line is [', firstLine,']');
    var result = '';
    while ( result.length < firstLine.length && firstLine[result.length] === ' '){
        result = result + ' ';
    }

    for ( var i = 1; i < lines.length -1; i++ ){
        lines[i] = result + lines[i];
    }

    return lines.join('\n').trim().length === 0 ? '' :  lines.join('\n');
});

new Metalsmith('.')
    .source(sourceDir)
    .use(collections({
        'configurations' : '*.yaml',
        'templates' : '*.hbs'
    }))
    .use(paths())
    .use((ps, metalsmith)=>{
        _.each(ps, (p, k)=>{
            //console.log('path should exist',p);
        });
        metalsmith.configurations = {};
    })
    .use( ( pages, metalsmith ) => { // read all configurations and put on page
        _.each(metalsmith._metadata.collections.configurations, ( p ) => {
            var pagePath = path.join(metalsmith._source,p.path.base);
            p.object = yaml.safeLoad(fs.readFileSync( pagePath ) );
            metalsmith.configurations[p.path.base] = p;
        })
    })
    .use( (pages, metalsmith) =>{ // remove none templates from templates collection
        metalsmith._metadata.templates = _.filter(metalsmith._metadata.templates, isTemplate); // will leave the 'collection' on each invalid item.. i am fine with that..
    })
    .use( ( pages, metalsmith )=>{
        _.each(metalsmith._metadata.templates, ( template )=>{ // put configuration on template
            var configuration = template.configuration;
            if (  !metalsmith.configurations.hasOwnProperty(configuration) ){
                console.log('CONFIGURATION ' + configuration + ' IS MISSING BUT REQUIRED BY TEMPLATE ' + template.path.base );
            }
            template.configuration = metalsmith.configurations[configuration];
            // _.each(template.configuration.object.client.functions, function(f){
                //if ( f.name === 'publish_archive'){
                    //console.log(f.doc.comment);
                //}
            // })
        });
    })
    .use( (pages, metalsmith )=>{ // apply configuration on each template
        _.each( metalsmith._metadata.templates, ( template ) => {
            //console.log('this is template', template);
            template.contents  = handlebars.compile(template.contents.toString())(_.merge({},{ _ : _ },template.configuration.object));
            template.contents = _.tail(template.contents.split('\n')).join('\n');
        });
    })
    .use( (pages, metalsmith) =>{
        _.each(pages, (page, pagepath) =>{
            if ( isTemplate(page)  ){
                delete pages[pagepath];
                var newpath = pagepath.replace('.hbs','');
                pages[newpath] = page;
            }
        })
    })
    .build( function(e){ if ( e ) { console.log(e); }  } );

console.log('building : ' + sourceDir);

