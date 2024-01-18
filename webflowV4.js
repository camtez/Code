
    var Webflow = Webflow || [];
    
    Webflow.push(function () {
      // DOMready has fired
      // May now use jQuery and Webflow API

      var pageTitle = document.title;
      mixpanel.track("PV: " + pageTitle);
      
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
      let companyType = "";
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

      function smoothScrollBy(distance, duration) {
        $('html, body').animate({
          scrollTop: $(window).scrollTop() + distance
        }, duration);
      }

    
      // STEP 1: Entering domain -> questionMore

      function enterDomain() {

        fbq('trackCustom', 'EnterDomain');
        i = 0;
        x = DOMPurify.sanitize($("#domain").val().trim());
        x = x.replace(/\s/g, ""); // remove spaces

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
        $("#divAnimate").css("max-height", "5000px");
        $("#divAnimate").css("opacity", 1);
        $("#spacer300").show(); // moves the footer down
        $("#subtitle2").hide(); // hides error message
        smoothScrollBy(100, 1000);

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

        webhook = 'https://eon50fnxq1hplnj.m.pipedream.net/?x=' + encodeURIComponent(x) + '&i=no' + '&e=' + encodeURIComponent(exampleId);
        fetch(webhook);
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
        mixpanel.track('Enter Click');
      });

      // Run on enter keyboard
      $('#domain').keydown(function(event) {
        if (event.key === 'Enter' || event.keyCode === 13) {
          enterDomain();
          mixpanel.track('Enter Keyboard');
        }
      });


      // STEP 2: priority question -> first recommendation

      var selected;
      var success = -1;
      function getFirstIdea(selectedID, array) {

        mixpanel.track('Click '+ selectedID);
        fbq('trackCustom', 'GoalSelected');
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
        smoothScrollBy(40, 1000);

        // Loading animation
        $("#output0").css('color', 'black');
        startLoadingBar('#progressBar0','#filler0'); // loading bar
        loadingInterval = startLoadingAnimation("output0",loadingTexts0); // loading text

        // Pipedream First Idea
        webhook = 'https://eockgzovo96ozny.m.pipedream.net/?x=' + encodeURIComponent(x) + '&i=' + encodeURIComponent(i) + '&e=' + encodeURIComponent(exampleId) + '&topic=' + encodeURIComponent(selected[0]) + '&goal=' + encodeURIComponent(selected[1]);
        fetch(webhook)
            .then(response => response.json())
            .then(data => {
              console.log(data);
              clearInterval(loadingInterval); // Stop loading message
              companyName = data.productName;
              companyType = data.productType;
              let lowercaseChallenge = data.specificChallenge.charAt(0).toLowerCase() + data.specificChallenge.slice(1);
              lowercaseChallenge = lowercaseChallenge.substring(0, lowercaseChallenge.length - 1) + '?';
              let titleText = companyName + ". Looks like a cool " + companyType + ".";
              let introText = "But what's your game plan for " + lowercaseChallenge + "\n\n";
              introText = introText.replace(/\n/g, '<br>');
              let firstText = "I've got an idea.\n\n" + data.keyInsight;
              firstText = firstText.replace(/\n/g, '<br>');
              let secondText = data.howToUse;
              $("#output0How").html(secondText);
              $("#copyNpaste").html(data.copyNpaste.replace(/\n/g, '<br>'));
              $("#output0title").html(titleText);
              $("#output0intro").html(introText);
              $("#output0").html(firstText);
              $("#output0inspired").html(data.inspiredBy);
              let scratchedText = "We just scratched the surface of " + selected[1] + ".\n\nReady for 3 even greater strategies to help really master it?";
              scratchedText = scratchedText.replace(/\n/g, '<br>');
              $("#questionWhichText").html(scratchedText);
              $("#progressBar0").hide();
              $("#output0intro").show();
              $("#output0title").show();
              $("#output0inspiredDiv").show();
              $("#question1").css("display", "flex");
              $("#enter").css("opacity", 0);
              smoothScrollBy(100, 1000);
              $("#message0").css("margin-top", "40px");
              success = 1;
              setTimeout(() => {
                $("#enter").hide();
              }, 500);  // 500ms delay
              setTimeout(() => { // Show typing
                $("#message0-5").css("display", "flex");
                setTimeout(() => { // Show how it works
                  $("#typingAnimation").hide();
                  $("#messageDiv0-5").show();
                  $("#continueReading2").show();
                  smoothScrollBy(60, 1000);
                  $("#message0-5").css("margin-top", "40px");
                  setTimeout(() => { // Show typing
                    $("#questionWhich").css("display", "flex");
                    smoothScrollBy(30, 1000);
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
      $('#lowPMF').click(function() {
        getFirstIdea('#lowPMF', ['lowPMF', 'getting more users / customers', 'get more users / customers', 'more users / customers']);
      });
      $('#prePMF').click(function() {
        getFirstIdea('#prePMF', ['prePMF', 'getting as many signups as possible', 'get as many signups as possible', 'exponential signups']);
      });
      $('#postPMF').click(function() {
        getFirstIdea('#postPMF', ['postPMF', 'optimising onboarding + retention', 'optimise onboarding + retention', 'optimised onboarding + retention']);
      });
      $('#scaleUP').click(function() {
        getFirstIdea('#scaleUP', ['scaleUP', 'growing recurring revenue', 'grow recurring revenue', 'more recurring revenue']);
      });


      // Continue reading first message
      $('#continueReading').click(function() {
        $('#continueReading').hide();
        $("#output0").css("max-height", "none");
        mixpanel.track('Continue Reading 1 Click');
      });

      // Continue reading second message
      $('#continueReading2').click(function() {
        $('#continueReading2').hide();
        $("#copyDiv").css("display", "flex");
        $("#output0How").show();
        mixpanel.track('Continue Reading 2 Click');
        fbq('trackCustom', 'ContinueReading');
        setTimeout(() => { // Show question which
          smoothScrollBy(30, 1000);
          $("#typingAnimation2").hide();
          $("#whichDiv").css("display", "flex");
          $("#questionWhich").css("margin-top", "40px");
        }, 3500);
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

        webhook = 'https://eorwuqt7mxl6p1p.m.pipedream.net/?x=' + encodeURIComponent(x) + '&topic=' + encodeURIComponent(selected[0]) + '&i=1';
        fetch(webhook)
        .then(response => response.json())
        .then(data => {
          clearInterval(loadingInterval);
          $('#loadingMoreDiv').hide();
          $("#3IdeasDiv").css("margin-top", "40px");
          $('#30ideaTitle').text('The 3 highest impact strategies for ' + companyName);
          $('#30ideaIntro').html('Out of our arsenal of 279 product strategies, these are the most relevant for ' + companyName + ' to ' + selected[2] + '.');
          $("#idea1name").text(data[0].specificName);
          $("#idea1summary").text(data[0].specificChallenge);
          $("#idea1inspired").text(data[0].inspiredBy);
          $("#idea2name").text(data[1].specificName);
          $("#idea2summary").text(data[1].specificChallenge);
          $("#idea2inspired").text(data[1].inspiredBy);
          $("#idea3name").text(data[2].specificName);
          $("#idea3summary").text(data[2].specificChallenge);
          $("#idea3inspired").text(data[2].inspiredBy);
          //$("#idea3summary").text(data[2].specificName + ". " + data[2].specificChallenge);

          $("#blueprintsTitle").text("Here's the plan for " + companyName + ".");
          $("#blueprintsIntro").text("I know you don't have time to read through all the generic strategies for " + selected[1] + ".");
          $("#blueprintsText").text("So I've crafted these 3 top priority insights into actionable Conversion Blueprints™ just for you" + companyName + ".");
          $("#blueprintsBenefit1").text("Built on top of our proprietary research into how " + data[0].productName + ", " + data[1].productName + " and " + data[2].productName + " did it");
          $("#blueprintsBenefit2").text("The most important insights you need to be thinking about for " + companyName);
          $("#dontMiss").text("Don't miss your actionable guide to " + selected[2] + " just like " + data[0].productName + ", " + data[1].productName + " and " + data[2].productName);
          $("#finalIdeasDiv").css("display", "flex");
          $("#finalIdeasDiv2").css("display", "flex");
          smoothScrollBy(100, 1000);
        })
        .catch(error => {
          clearInterval(loadingInterval);
          $("#output1").html(errorMessage);
          isFunctionRunning = false;
        });

        // Prep share link
        const referId = contactId.split(/rec/)[1];
        const referLink = 'conversionexamples.com/ai?r='+referId;
        const randomShareText = referralTexts[Math.floor(Math.random() * referralTexts.length)].replace(/\[URL\]/g, referLink)
        $('#referMsg').val(randomShareText);

        // Prep Stripe link
        var webhook = 'https://eolmnwc1sqa2h6o.m.pipedream.net/?url=' + encodeURIComponent(x) + '&priority=' + encodeURIComponent(selected[0]);
        fetch(webhook)
          .then(response => response.json())
          .then(data => {
          let url = data.result;
          $("#getPaid").attr("href", url); // set #getPaid link to returned value
          mixpanel.track_links('#getPaid', 'Clicked Buy Conversion Blueprints');
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
        $("#signupIntro").text('Keep making ' + companyName + ' greater by copying what works');
        $("#signupDescription").text('Get a free product insight in your email every week, personalised just for ' + companyName);
        $('#subscribe').text("Try it");
        $("#questionWhich").css("opacity", 0.75);
        $('#getLater').css('border-color', '#E9F0EC');
        $('#signupDiv').css("display", "flex");
        mixpanel.track('Sign Up Interest 1 Click');
        fbq('trackCustom', 'EmailIntent');
        smoothScrollBy(100, 1000);
      });

      // Click get later after 3 previews

      $('#getFree').click(function() {
        $("#signupIntro").text('Keep making ' + companyName + ' greater by copying what works');
        $("#signupDescription").text('Get a free product insight in your email every week, personalised just for ' + companyName);
        $('#subscribe').text("Try it");
        $("#questionWhich").css("opacity", 0.75);
        $('#getLater').css('border-color', '#E9F0EC');
        $('#signupDiv').css("display", "flex");
        mixpanel.track('Sign Up Interest 2 Click');
        fbq('trackCustom', 'EmailIntent');
        smoothScrollBy(100, 1000);
      });


      // Click get now
      $('#getNow').click(function() {
        $("#questionWhich").css("opacity", 0.75);
        $('#getLater').css('border-color', '#E9F0EC');
        $("#3ideasDiv").css("display", "flex");
        mixpanel.track('3 More Click');
        fbq('trackCustom', 'MoreIdeas');
        get3Ideas();
      });


      // STEP 4: Subscribe

      function subscribeToNewsletter() {
        i = 1;
        var email = DOMPurify.sanitize($("#email").val().trim());

        fbq('trackCustom', 'EmailSubscribe');
        
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
        mixpanel.track('Subscribe Click');
        subscribeToNewsletter();
      });

      // Enter keyboard subscribe
      $('#email').keydown(function(event) {
        if (event.key === 'Enter' || event.keyCode === 13) {
          mixpanel.track('Subscribe Keyboard');
          subscribeToNewsletter();
        }
      });

      // Sharing -> Message2
      function commonShare() {
        copyToClipboard($('#referMsg').val()); // Save to clipboard
        $('#share1').css('background-color', '#F2ECD2');
        $('#share1').text('Copied!');
      }

      $('#share1').click(commonShare); // Copy to clipboard
      $('#share2').click(function() { // Linkedin
        commonShare();
        const linkedinURL = 'https://www.linkedin.com/feed/?shareActive&mini=true&text=' + encodeURIComponent($('#referMsg').val());
        window.open(linkedinURL, '_blank');
      });
      $('#share3').click(function() { // Twitter
        commonShare();
        const twitterURL = 'http://twitter.com/share?url=' + encodeURIComponent($('#referMsg').val());
        window.open(twitterURL, '_blank');
      });
      $('#share4').click(commonShare);

      

    });
    
