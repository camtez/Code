
    var Webflow = Webflow || [];
    
    Webflow.push(function () {
      // DOMready has fired
      // May now use jQuery and Webflow API
      
      // prefill forms other info
      $("#formOtherNav").val("SU");
      $("#formOtherFooter").val("SU");

      // Get URL parametres
      var params = new URLSearchParams(window.location.search);
      var domain = params.get('d'); // "value1"
      console.log(domain);
      var referrer = params.get('r'); // "value2"
      if (referrer) {
        referrer = 'rec' + referrer;
      }
      var custom = params.get('c');
      if (custom) {
        custom = 'rec' + custom;
      }
      var exampleId = params.get('e');
      if (exampleId) {
        exampleId = 'rec' + exampleId;
      }
      
      // API calls
      
      var webhook;
      let i = 0;
      var loadingIndex = 0;
      var x = "";
      const errorMessage = "There's been a hiccup. Let's make it work this time.";
      let id = "";
      let companyName = "";
      let contactId = "";
      let loadingInterval;
      let lastIdeaText = "";
      let lastExampleText = "";


      // Reusable functions

      function startLoadingAnimation(elementId, loadingTexts) {
        return setInterval(function() {
            loadingIndex = (loadingIndex + 1) % loadingTexts.length;
            $("#" + elementId).text(loadingTexts[loadingIndex]);
        }, 1000);
      }

      function startLoadingBar(progressBar,fillerBar){
        $(progressBar).show();
        setTimeout(() => {
            $(fillerBar).css("width", "100%");
        }, 50);  // 50ms delay
      }

      function getRandomIdeaText() {
        var randomExpression = ideaTexts[Math.floor(Math.random() * ideaTexts.length)];
        while (randomExpression === lastIdeaText) {
            randomExpression = ideaTexts[Math.floor(Math.random() * ideaTexts.length)];
        }
        lastIdeaText = randomExpression;
        return randomExpression;
      }

      function replaceText(apiMessage) {
        let tempMessage = apiMessage;
        
        tempMessage = tempMessage.split(/\n\n\n/).map(idea => idea.replace(/Feature idea:|Feature idea name:/g,getRandomIdeaText())).join('\n\n\n');
        tempMessage = tempMessage.replace(/\n/g, '<br>');
        return tempMessage;
      }

    
      // STEP 1: Entering domain -> questionMore

      function enterDomain() {

        i = 0;
        x = DOMPurify.sanitize($("#domain").val().trim());

        // Check if x is not empty
        if (x === '' || !x.includes('.')) {
            // *** change error message
            $("#subtitle2").text('Please enter a valid domain...');
            $("#subtitle2").css('color', '#DE3021');
            $("#subtitle2").show();
            console.log('URL is empty');
            $("#enter").show();
            return; // Exit the function early
        }

        // Display more box
        $("#questionMore").css("display", "flex");
        $("#divAnimate").css("max-height", "3000px");
        $("#divAnimate").css("opacity", 1);
        $("#spacer300").show(); // moves the footer down
        $("#subtitle2").hide(); // hides error message

        // Re-style input bar
        $("#enter").text("✅");
        $("#enter").css("background-color", "#E9F0EC");
        $("#domain").css("border-color", "#E9F0EC");

        // Cleaning input data
        if (!x.startsWith('http://') && !x.startsWith('https://')) { // If the input doesn't start with 'http://' or 'https://', add 'https://'
            x = 'https://' + x;
        }
        var matches = x.match(/https:\/\/[^/]+/); // Remove anything after '.com' or other domain extensions
        if (matches) {
            x = matches[0];
        }
      }
      
      // Run with domain url parameter
      if (domain) {
        x = domain;
        $("#domain").val(x);
        $("#enter").hide();
        console.log('triggered');
        enterDomain();
      }

      // Run on enter click
      $('#enter').click(function() {
        enterDomain();
      });

      // Run on enter keyboard
      $('#domain').keydown(function(event) {
        if (event.key === 'Enter' || event.keyCode === 13) {
          enterDomain();
        }
      });


      // STEP 2: priority question -> first recommendation

      var selected;
      var success = -1;
      function getFirstIdea(selectedID, array) {

        if (success != -1) {
          console.log("Function is already running.");
          return;
        }
        selected = array;
        success = 0;

        $("#message0").css("display", "flex");
        $("#questionMore").css("opacity", 0.75);
        $('.button.check').css('border-color', '#E9F0EC');
        $(selectedID).css('background-color', '#E9F0EC');

        // Loading animation
        $("#output0").css('color', 'black');
        startLoadingBar('#progressBar0','#filler0'); // loading bar
        loadingInterval = startLoadingAnimation("output0",loadingTexts0); // loading text

        // Pipedream First Idea
        webhook = 'https://eovso6ssrcqvqms.m.pipedream.net/?x=' + encodeURIComponent(x) + '&i=' + encodeURIComponent(i) + '&e=' + encodeURIComponent(exampleId) + '&topic=' + encodeURIComponent(selected[2]);
        fetch(webhook)
            .then(response => response.json())
            .then(data => {
              console.log(data);
              clearInterval(loadingInterval); // Stop loading message
              let firstText = data.partOne.replace(/\n/g, '<br>');
              let secondText = data.partTwo.replace(/\n/g, '<br>');
              companyName = data.company;
              formattedText = replaceText(firstText);
              $("#output0").html(formattedText);
              $("#progressBar0").hide();
              $("#continueReading").show();
              $("#question1").css("display", "flex");
              $("#enter").css("opacity", 0);
              success = 1;
              setTimeout(() => {
                $("#enter").hide();
              }, 500);  // 500ms delay
              setTimeout(() => { // Show typing
                $("#message0-5").css("display", "flex");
                setTimeout(() => { // Show how it works
                  $("#typingAnimation").hide();
                  $("#messageDiv0-5").show();
                  $("#output0How").html(secondText);
                  $("#continueReading2").show();
                  setTimeout(() => { // Show typing
                    $("#questionWhich").css("display", "flex");
                    setTimeout(() => { // Show question which
                      $("#typingAnimation2").hide();
                      $("#whichDiv").css("display", "flex");
                      $("#output0How").html(secondText);
                    }, 3500); 
                  }, 4000);
                }, 5000);
              }, 3000);
            })
            .catch(error => {
              clearInterval(loadingInterval); // Stop loading message
              console.log(error);
              $("#output0").text('I can\'t quite get your website to work right. Help me out here.');
              $("#progressBar0").hide();
              $("#output0").css('color', '#DE3021');
              $("#enter").text("Try Again");
              success = -1;
            });
      }
      
      // Priority buttons
      $('#growth').click(function() {
        getFirstIdea('#growth', ['Growth', 'more users', 'Growth', 'growth']);
      });
      $('#monetisation').click(function() {
        getFirstIdea('#monetisation', ['Monetisation', 'more money', 'Purchasing', 'monetisation']);
      });
      $('#habits').click(function() {
        getFirstIdea('#habits', ['Habit-Building', 'more user engagement', 'Habits', 'engagement']);
      });

      // Continue reading first message
      $('#continueReading').click(function() {
        $('#continueReading').hide();
        $("#output0").css("max-height", "none");
      });

      // Continue reading second message
      $('#continueReading2').click(function() {
        // *** Change the text
        $('#continueReading2').hide();
        $("#output0How").css("max-height", "none");
      });


      // STEP 3: More ideas or Email

      // More ideas
      let isFunctionRunning = false;

      function get3Ideas() {
        
        if (isFunctionRunning) {
          console.log("Function is already running.");
          return;
        }
        isFunctionRunning = true;

        // loading animation
        startLoadingBar('#progressBar1','#filler1');
        loadingInterval = startLoadingAnimation("output1", loadingTexts2);
            
        // Pipedream 3 Previews

        webhook = 'https://eo2vwqqmaeev0sz.m.pipedream.net/?x=' + encodeURIComponent(x) + '&topic=' + encodeURIComponent(selected[2]);
        fetch(webhook)
        .then(response => response.json())
        .then(data => {
          clearInterval(loadingInterval);
          $('#loadingMoreDiv').hide();
          $('#30ideaIntro').text('Ok, here are a few more ' + selected[3] + ' hacks you really should try:');
          $('#getMoreDescription').text('Get these 3 ' + selected[3] + ' recommendations for ' + companyName);
          let formattedText = data.result.replace(/\n/g, '<br>');
          $("#finalIdeas").html(formattedText);
          $("#finalIdeasDiv").css("display", "flex");
          $("#finalIdeasDiv2").css("display", "flex");
        })
        .catch(error => {
          clearInterval(loadingInterval);
          $("#output1").html(errorMessage);
          isFunctionRunning = false;
        });

        // Prep Stripe link
        var webhook = 'https://eolmnwc1sqa2h6o.m.pipedream.net/?url=' + encodeURIComponent(x) + '&priority=' + encodeURIComponent(selected[2]);
        fetch(webhook)
          .then(response => response.json())
          .then(data => {
          let url = data.result;
          $("#getPaid").attr("href", url); // set #getPaid link to returned value
          })
          .catch(error => {
          clearInterval(loadingInterval);
          $(outputElement).text('Error: ' + error.toString());
          $(outputElement).css('color', '#DE3021');
          console.log(error);
          });

      }

      // Click get later
      $('#getLater').click(function() {
        $("#signupIntro").text('Keep making ' + companyName + ' greater');
        $("#signupDescription").text('Get a reminder in your email + a couple little bonuses');
        $("#questionWhich").css("opacity", 0.75);
        $('#getLater').css('border-color', '#E9F0EC');
        $('#signupDiv').css("display", "flex");
      });

      // Click get later after 3 previews

      $('#getFree').click(function() {
        $("#signupIntro").text('Make ' + companyName + ' greater, with less guesswork');
        $("#signupDescription").text('Get a free weekly AI-personalised recommendation to make ' + companyName + ' easier to use, more shareable & stickier.');
        $("#questionWhich").css("opacity", 0.75);
        $('#getLater').css('border-color', '#E9F0EC');
        $('#signupDiv').css("display", "flex");
      });


      // Click get now
      $('#getNow').click(function() {
        $("#questionWhich").css("opacity", 0.75);
        $('#getLater').css('border-color', '#E9F0EC');
        $("#3ideasDiv").css("display", "flex");
        get3Ideas();
      });


      // STEP 4: Subscribe

      function subscribeToNewsletter() {
        i = 1;
        var email = DOMPurify.sanitize($("#email").val().trim());
        
        // Check if email is ok
        if (email === '' || !email.includes('@') || !email.includes('.')) {
            $("#newsletterText").text('Please enter a valid email address');
            $("#newsletterText").css('color', '#DE3021');
            return;
        }

        // If successful
        $('#subscribe').text("Loading...");

        // Make automation to signup email
        var makehook = 'https://hook.us1.make.com/pl17c96gsqf34sgimjjj1e7w6vqpmjnl/?email=' + encodeURIComponent(email) + '&x=' + encodeURIComponent(x) + '&other=' + encodeURIComponent('AI') + '&r=' + encodeURIComponent(referrer);
        fetch(makehook)
            .then(response => response.json())
            .then(data => {
              contactId = data.contactID;
              // Redirect to success page
              window.location.href = 'https://www.conversionexamples.com/one-more-thing';
            });     
      }

      // Click subscribe button
      $('#subscribe').click(function() {
        subscribeToNewsletter();
      });

      // Enter keyboard subscribe
      $('#email').keydown(function(event) {
        if (event.key === 'Enter' || event.keyCode === 13) {
          subscribeToNewsletter();
        }
      });
      

    });
    
