Animated Parakee
===================



# How to use 


## Write a configuration file

The configuration file can contain whatever data you want it to be as long as it's a valid yaml/json file     
For example, the json wire protocol has the following configuration file named `json-wire.yaml` 

```yaml
api:
 spec: https://github.com/SeleniumHQ/selenium/wiki/JsonWireProtocol#status
 requests: 
  - method: GET
    key: getStatus
    uri: /status
    response: 
     - name: build
       type: object
       fields: 
        - name: version
          type: string
        - name: revision
          type: string
        - name: time
          type: string
     - name: os
       type: object
       fields: 
       - name: arch
         type: string
       - name: name
         type: string
       - name: revision
         type: string
  - method: POST
    uri: /session
    key: postSession
    params: 
    - name: desiredCapabilities
      type: dict
    - name: requiredCapabilities
      type: dict
    response: 
     - name: capabilities
       type: dict
```

## Write a handlebars templates for the language you want based on the configuration file
 
- file name is not restricted 
- file extension but end with `.hbs`. for example: javascript will be `myfile.js.hbs`
- file must have frontmatter specifying configuration file

Here is json-wire-protocol javascript template: 

```hbs
---
configuration: json-wire.yaml 
---

var request = require('request');
{{#each api.requests}}
  
exports.{{this.key}} = function(baseUrl, {{#each this.params}}{{this.name}},{{/each}}callback){
  request({
    method: '{{this.method}}', 
    uri : baseUrl + '{{this.uri}}'{{#if this.params}},{{/if}}
    {{#if this.params}}
    body: JSON.stringify({
       {{#each this.params}}
         {{this.name}}:{{this.name}}{{#unless @last}}, {{/unless}}
       {{/each}}
    })  
    {{/if}}
  }, callback)
};
{{/each}}
```

This is the python template

```hbs
---
configuration: json-wire.yaml
---

import urllib
import urllib2

class JsonWireClient: 
    
  def __init__(self, baseUrl):
     self.baseUrl = baseUrl

{{#each api.requests}}
  
  def {{this.key}}(self{{#if this.params}},{{/if}}{{#each this.params}}{{this.name}}{{#unless @last}},{{/unless}}{{/each}}):
    {{#if this.params}}
    data=dict({{#each this.params}}{{this.name}}={{this.name}}{{#unless @last}},{{/unless}}{{/each}})
    {{/if}}
    return urllib2.urlopen(url='{{this.uri}}'{{#if this.params}},data=data{{/if}}).read()
  
{{/each}}
```

## Generate the sources

```
node metalsmith --sourceDir path/to/source/dir
```

# How to run the example

 - execute `npm run example` to build the example
 - run the chrome driver under `node_modules/webdriver-manager/selenium`
 - modify the files under `run_example` to specify the correct base url. 
 - to run the javascript example execute `node run_example/run_client.js`
 - to run the python example execute `python -m run_example.run_client`

# Roadmap

This project aims to make `source generation` easy and configurable using metalsmith

Tasks

 - Make example work
 - add tests
 - add linter
 - add swagger example with node+java+python examples
 
