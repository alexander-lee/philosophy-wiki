var rp = require('request-promise');
var cheerio = require('cheerio');
var URL = require('url-parse');

var random = '/wiki/Special:Random';
var startURL = new URL('https://en.wikipedia.org' + random);

var calls = 0;

crawlWiki(startURL);

function crawlWiki(url){
  console.log(url.pathname);

  if(url.pathname === '/wiki/Philosophy'){
    console.log("Chain Length: " + calls);
    return;
  }

  calls++;

  rp({
    uri: url,
    transform: function(body) {
      return cheerio.load(body, {lowerCaseTags: true});
    }
  })
  .then(function($){
    var selector = '#mw-content-text > p';
    var paragraphs = $(selector);
    var pathname = '';

    // Limit Search to first 2 paragraphs
    for(var p = 0; p < 2; ++p) {
      var paragraph = $(paragraphs[p]).html();

      // Remove first substring inside ( )
      var anchorStart = paragraph.indexOf('<a href');
      var sliceStart = paragraph.indexOf('(');
      var sliceEnd = paragraph.indexOf(')')+1;

      if(sliceStart !== -1 && anchorStart > sliceStart){
        paragraph = paragraph.substring(0, sliceStart) + paragraph.substring(sliceEnd);
      }
      $ = cheerio.load(paragraph);

      console.log(paragraph + '\n');
      // Check all Anchors in Paragraph
      var anchors = $('a');
      for(var k = 0; k < anchors.length; ++k){
        pathname = $(anchors[k]).attr('href');
        if(pathname != undefined && pathname.indexOf('/wiki/') !== -1 && pathname !== url.pathname){
          break;
        }
      }

      if(pathname) break;
    }

    crawlWiki(new URL(url.origin + pathname));
  })
  .catch(function(err){
    console.log('Error:', err);
  });
}
