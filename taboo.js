// INFO 343 A & B
// Javascript
var alchemyURL = "http://access.alchemyapi.com/calls/url/URLGetRankedKeywords";
var alchemyTEXT = "http://access.alchemyapi.com/calls/text/TextGetRankedKeywords";
var annAPI = "http://cdn.animenewsnetwork.com/encyclopedia/api.xml"; //requires proxy
//var wikipedAPI = "http://en.wikipedia.org/w/api.php"
var wiki = "http://en.wikipedia.org/wiki/Special:Random";
//fan Wikias API
var starpedia = "http://starwars.wikia.com/wiki/Special:Random";
var futura = "http://futurama.wikia.com/wiki/Special:Random";
var community = "community-sitcom.wikia.com/wiki/Special:Random";
var pokemon = "pokemon.wikia.com/wiki/Special:Random";
var xfiles = "x-files.wikia.com/wiki/Special:Random";

var c;
var counter = 0;
teamA = 0;
teamB = 0;
var stopwatch;
// API_KEY = dd47f94d6385f1061198d60d8501394e2a8dd253
//backup key = 462d111fa667b6a6a749792f6932217d329530ef
$(document).ready(function () {
    resetNow();
    $.ajaxSetup({
        error: ajaxError
    });
    //watches topic selection and stores chosen option
    $('select').change(function () {
        c = $('select').val();
    });
    c = $('select').val();

    $(".tally").click(tally);

    $('#startBut').click(function () {
        flipHourglass();
        fetchCard();
    });
    $('#reset').click(function () {
        resetNow();
    });

    $('#buttons button').attr('disabled', 'disabled');

    //gives control to buttons
    //	$('#buttons' button).click();


    // Pop Up Animation 
    $(function () {
        var height = $(document).height();
        var width = $(document).width();
        var spanHeight = $('.popup').height();
        var spanWidth = 500;
        $('.pop-up-link').click(function () {
            $(this).next().css({
                "top": height / 2 - spanHeight / 2
            }).css({
                "left": width / 2 - spanWidth / 2
            }).fadeIn(500);
        });
        $(".close").click(function () {
            $('.pop-up-link').next().fadeOut(500);
        });
    });

});

//resets score and buttons (in case of bugs)
function resetNow() {
    teamA = 0;
    teamB = 0;
    $(".currentT").text("A")
    $("#b").text(teamA);
    $("#a").text(teamA);
    $('#startBut').removeAttr('disabled');
    $('#buttons button').attr('disabled', 'disabled');
    newCard();
    clearInterval(stopwatch);
}

//Controls increments and decrements of points for the current team
function tally() {
    var current = $(this).text();
	//outputs current team depending on counter being even or odd
    if (isEven()) {
        $(".currentT").text("B")
    } else {
        $(".currentT").text("A")
    }
    if (current == "Correct") {
        fetchCard();
        if (isEven()) {
            teamA++;
            $("#b").text(teamA);
        } else {
            teamB++;
            $("#a").text(teamB);
        }
    } else if (current == "Taboo") {
        fetchCard();
        if (isEven()) {
            teamA--;
            $("#b").text(teamA);

        } else {
            teamB--;
            $("#a").text(teamB);

        }
    } else if (current == "Skip") {
        fetchCard();
    }
}

function isEven() {
    if ((counter - 1) % 2 == 0) return true;
    else return false;
}
//makes an api call dependent on what the user has selected
function fetchCard() {
    $('#buttons button').removeAttr('disabled');
    $('#startBut').attr('disabled', 'disabled');
    //returns random wikipedia page
    if (c == "wiki") {
        parseSpRandom(wiki);
    }
    //make a random number and store it
    if (c == "ani") {
        var ran = Math.floor(Math.random() * 14958) + 1; //14959 max
        $.ajax('https://info343.ischool.uw.edu/proxy.php' /*+ '?_service_=' + annAPI + '?title=' + ran*/ , {
            data: {
                _service_: annAPI,
                title: ran
            },
            success: parseAnime
            //error: ajaxError
        });
        //append text from annAPI and pass to alchemyText
    }
    if (c == "sw") {
        //pass starPedia to alchemyURL
        parseSpRandom(starpedia);
    }
    if (c == "futura") {
        //pass futura to alchemyURL
        parseSpRandom(futura);
    }
    if (c == "pokemon") {
        //pass pokemon to alchemyURL
        parseSpRandom(pokemon);
    }

    if (c == "commun") {
        //pass community to alchemyURL
        parseSpRandom(community);
    }

    if (c == "xfiles") {
        //pass xfiles to alchemyURL
        parseSpRandom(xfiles);
    }
}

// Can parse any wikimedia/wikia site that has the Special:Randon
// URL call property
function parseSpRandom(URL) {
    //alert(URL);
    $.ajax(alchemyURL, {
        data: {
            apikey: "dd47f94d6385f1061198d60d8501394e2a8dd253",
            url: URL,
            maxRetrieve: 21,
            outputMode: 'json',
            sourceText: 'cleaned',
            keywordExtractMode: 'strict',
        },
        jsonp: 'jsonp',
        dataType: 'jsonp',
        success: injectCard
        //error: ajaxError
    });
}

//We select what parts of the text we want to send to AlchemyAPI
//for anime | data is XML
function parseAnime(xmldoc) {
    newCard();
    var Text;
    var anime = xmldoc.getElementsByTagName("ann")[0].firstChild;
    var title = anime.getAttribute("name");
    //write to header
    $('#cardHead h2').text(title);
    var $wordList = $('#cardBody ul');
    var length = anime.getElementsByTagName("info").length;
    for (var i = 0; i < length; i++) {
        var info = anime.getElementsByTagName("info")[i];
        var type = info.getAttribute("type");
        if (type == "Objectionable content" && info.firstChild.nodeValue == "AO") {
            fetchCard();
        }
        if (type == "Plot Summary") {
            if (Text == null) {
                Text = info.firstChild.nodeValue + " ";
            } else {
                Text.concat(info.firstChild.nodeValue + " ");
            }
        }
    }
    if (Text == null || Text.length == 0) {
        fetchCard();
    } else {
        $.ajax(alchemyTEXT, {
            data: {
                apikey: 'dd47f94d6385f1061198d60d8501394e2a8dd253',
                text: Text,
                maxRetrieve: 21,
                outputMode: 'json',
                sourceText: 'cleaned',
                keywordExtractMode: 'strict'
            },
            jsonp: 'jsonp',
            dataType: 'jsonp',
            success: injectAnime
            //error: ajaxError
        });
    }
    //call alchemy API with ajax, run inject Taboo on success

}

//game timer, starts the round
function flipHourglass() {
    //120
    var count = 120;
    $buttons = $('#buttons');
    $buttons.removeAttr('disabled');
    stopwatch = setInterval(function () {
        if (count > 0) {
            count--;
            //inject count
            $('#mainCard p span').text(Math.floor(count / 60) + ':' + count % 60);
        } else {
            //clear countdown stop watch
            clearInterval(stopwatch);
            count = null;
            clearInterval();
            $('#mainCard p span').text(0);
            // hide buttons
            $buttons.attr('disabled', 'disabled');
            //reenable start button
            $('#startBut').removeAttr('disabled');
            // clear card
            newCard();
            $('#buttons button').attr('disabled', 'disabled');
            counter++;
        }
    }, 1000);
}

// captures passed data from alchemyText
// and Anime news network api
// injects content into the gamecard
function injectAnime(data) {
    var title = $('#cardHead h2').text();
    var $wordList = $('#cardBody ul');
    var acceptableTerms = new Array();
    $.each(data.keywords, function (key, value) {
        var acceptable = true;
        //only basic filtering (for redundancy is applied, no unwanted terms list)
        if (value.text.toLowerCase().indexOf(title.toLowerCase()) == -1 && title.toLowerCase().indexOf(value.text.toLowerCase()) == -1) {
            //inject
            var split = value.text.split(" ");
            for (var i = 0; i < split.length; i++) {
                if (title.toLowerCase().indexOf(split[i].toLowerCase()) != -1) {
                    acceptable = false;
                }
            }
            if (acceptable) {
                acceptableTerms.push(value.text);
            }
        }
    });
    if (acceptableTerms.length < 7) {
        fetchCard();
    } else {
        for (var i = 0; i < 7; i++) {
            var taboo = acceptableTerms.shift();
            var $taboo = $('<li>').text(taboo);
            $wordList.append($taboo);
        }
    }
}

// captures passed data from alchemyAPI
// injects content into the gamecard
function injectCard(data) {
    newCard();
    var title = decodeURIComponent(data.url.split("/").pop().replace(/_/g, " "));
    $('#cardHead h2').text(title);
    var $wordList = $('#cardBody ul');
    var acceptableTerms = new Array();
    var unacceptableTerms = new Array("edit", "stub", "http://", "wikipedia", "article", "bender", "fry", "leela",
        "amy", "abed", "pierce", "troy", "shirley", "britta", "jeff", "annie", "mulder", "scully");
    //heavy term filtering
    $.each(data.keywords, function (key, value) {
        var acceptable = true;
        if (value.text.toLowerCase().indexOf(title.toLowerCase()) == -1 && title.toLowerCase().indexOf(value.text.toLowerCase()) == -1) {
            //check for parts of the word itself
            var split = value.text.split(" ");
            for (var i = 0; i < split.length; i++) {
                if (title.toLowerCase().indexOf(split[i].toLowerCase()) != -1) {
                    acceptable = false;
                }
            }
            //check for unwanted terms
            for (var i = 0; i < unacceptableTerms.length; i++) {
                if (value.text.toLowerCase().indexOf(unacceptableTerms[i]) != -1) {
                    acceptable = false;
                }
            }
            //current taboo word passes test
            if (acceptable) {
                acceptableTerms.push(value.text);
            }
        }
    });
    if (acceptableTerms.length < 7 || title.toLowerCase().indexOf("reference") != -1) {
        fetchCard();
    } else { // enough usable taboo words, content can be injected
        for (var i = 0; i < 7; i++) {
            var taboo = acceptableTerms.shift();
            var $taboo = $('<li>').text(taboo);
            $wordList.append($taboo);
        }
    }

}

//clears the current card
function newCard() {
    $('#cardHead h2').text('');
    $('#cardBody ul').html('');
}

function ajaxError(jqxhr, type, error) {
    var msg = "An Ajax error occurred!\n\n";
    if (type == 'error') {
        if (jqxhr.readyState == 0) {
            // Request was never made - security block?
            msg += "Looks like the browser security-blocked the request.";
        } else {
            // Probably an HTTP error.
            msg += 'Error code: ' + jqxhr.status + "\n" +
                'Error text: ' + error + "\n" +
                'Full content of response: \n\n' + jqxhr.responseText;
        }
    } else {
        msg += 'Error type: ' + type;
        if (error != "") {
            msg += "\nError text: " + error;
        }
    }
    alert(msg);
}