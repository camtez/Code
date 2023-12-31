
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

      function getRandomExampleText() {
        var randomExpression = exampleTexts[Math.floor(Math.random() * exampleTexts.length)];
        while (randomExpression === lastExampleText) {
            randomExpression = exampleTexts[Math.floor(Math.random() * exampleTexts.length)];
        }
        lastExampleText = randomExpression;
        return randomExpression;
      }

      function replaceText(apiMessage) {
        let tempMessage = apiMessage;
        
        tempMessage = tempMessage.split(/\n\n\n/).map(idea => idea.replace(/Feature idea:|Feature idea name:/g,getRandomIdeaText())).join('\n\n\n');
        tempMessage = tempMessage.split(/\n\n\n/).map(idea => idea.replace(/Example:|Example \(including how it works\):/gi,getRandomExampleText())).join('\n\n\n');
        tempMessage = tempMessage.replace(/\n/g, '<br>');
        return tempMessage;
      }

    
      // STEP 1: Entering domain -> message0

      let isFunctionRunning = false;

      function enterDomain() {

        console.log('clicked');
        if (isFunctionRunning) {
          console.log("Function is already running.");
          return;
        }
        isFunctionRunning = true;

        i = 0;
        x = DOMPurify.sanitize($("#domain").val().trim());
        
        console.log(x);
        $("#message0").css("display", "flex");
        $("#divAnimate").css("max-height", "3000px");
        $("#divAnimate").css("opacity", 1);
        $("#spacer300").show();
        startLoadingBar('#progressBar0','#filler0');

        // Style input bar
        $("#enter").text("Loading...");
        $("#enter").css("background-color", "#E9F0EC");
        $("#domain").css("border-color", "#E9F0EC");

        // Check if x is not empty
        if (x === '' || !x.includes('.')) {
            $("#output0").text('Please enter a valid domain');
            $("#output0").css('color', '#DE3021');
            console.log('URL is empty')
            return; // Exit the function early
        }
    
        // Show loading text
        $("#output0").css('color', 'black');
        $("#question1").hide();
        $("#question2").hide();
        $("#question3").hide();
        $("#message1").hide();
        $("#message2").hide();
        $("#message3").hide();
    
        // Start the interval to cycle through the loading texts
        loadingInterval = startLoadingAnimation("output0",loadingTexts0);
    
        // Preparing data
        if (!x.startsWith('http://') && !x.startsWith('https://')) { // If the input doesn't start with 'http://' or 'https://', add 'https://'
            x = 'https://' + x;
        }
        var matches = x.match(/https:\/\/[^/]+/); // Remove anything after '.com' or other domain extensions
        if (matches) {
            x = matches[0];
        }

        // Pipedream Domain Idea
        webhook = 'https://eouv4h921hkuwbt.m.pipedream.net/?x=' + encodeURIComponent(x) + '&i=' + encodeURIComponent(i) + '&e=' + encodeURIComponent(exampleId);
        fetch(webhook)
            .then(response => response.json())
            .then(data => {
              clearInterval(loadingInterval); // Stop loading message
              let formattedText = data.result.replace(/\n/g, '<br>');
              formattedText = replaceText(formattedText);
              $("#output0").html(formattedText);
              $("#progressBar0").hide();
              $("#continueReading").show();
              $("#question1").css("display", "flex");
              $("#enter").css("opacity", 0);
              setTimeout(() => {
                $("#enter").hide();
              }, 500);  // 50ms delay
              
              // Show preview message
              setTimeout(() => {
                $("#message0-5").css("display", "flex");
                $("#message0").css("opacity", 0.75);
            
                // Pipedream First Preview
                webhook = 'https://eo7vbf3v6550my9.m.pipedream.net/?x=' + encodeURIComponent(x);
                fetch(webhook)
                    .then(response => response.json())
                    .then(data => {
                    let formattedText = data.idea;
                    id = data.id;
                    companyName = data.name;
                    $("#typingAnimation").hide();
                    $("#output0-5").html('Here\'s another idea: '+ formattedText);
                    $("#message0-5").css("display", "flex");
                    $("#typingDiv").css("width", "100%");
                    $("#output0-5").show();
                    $("#newsletterTextDiv").show();
                    $("#continueReading2").show();
                    isFunctionRunning = false;
                    })
                    .catch(error => {
                    $("#typingAnimation").hide();
                    $("#output0-5").html("There's another idea where that came from.");
                    $("#continueReading2").text("...click here to get another idea");
                    $("#message0-5").css("display", "flex");
                    $("#output0-5").show();
                    $("#continueReading2").show();
                    isFunctionRunning = false;
                    });
              }, 4500);  // 4.5 second delay
            })

            .catch(error => {
              clearInterval(loadingInterval); // Stop loading message
              console.log(error);
              $("#output0").text('I can\'t quite get your website to work right. Help me out here.');
              $("#progressBar0").hide();
              $("#output0").css('color', '#DE3021');
              $("#enter").text("Try Again");
              isFunctionRunning = false;
            });


      }


      if (domain) { 
        x = domain;
        $("#domain").val(x);
        $("#enter").hide();
        console.log('triggered');
        enterDomain();
      }

      $('#enter').click(function() {
        enterDomain();
      });

      $('#domain').keydown(function(event) {
        if (event.key === 'Enter' || event.keyCode === 13) {
          enterDomain();
        }
      });


      // Continue reading first message
      $('#continueReading').click(function() {
        $('#continueReading').hide();
        $("#output0").css("max-height", "none");
      });

      // STEP 2: Subscribing

      // Showing subscribe box
      $('#continueReading2').click(function() {
        $("#continueReading2").hide();
        $("#divSubscribe").show();

      });

      function subscribeToNewsletter() {
        i = 1;
        var email = DOMPurify.sanitize($("#email").val().trim());
        
        // Check if email is ok
        if (email === '' || !email.includes('@') || !email.includes('.')) {
            $("#newsletterText").text('Please enter a valid email address to unlock your idea.');
            $("#newsletterText").css('color', '#DE3021');
            return;
        }

        // If successful
        $('#divSubscribe').hide();
        $("#newsletterTextDiv").hide();
        $("#newsletterText").css('color', 'black');
        $("#output0-5").text('Successfully signed up to the newsletter!');
        $("#output0-5").show();

        startLoadingBar('#progressBar0-5','#filler0-5');

        setTimeout(() => {
          $("#output0-5").text('Thinking different...');
          loadingInterval = startLoadingAnimation("output0-5", loadingTexts1); // Loading text starts after 1.5 seconds
        }, 1500);

        // Make automation to signup email
        var makehook = 'https://hook.us1.make.com/pl17c96gsqf34sgimjjj1e7w6vqpmjnl/?email=' + encodeURIComponent(email) + '&x=' + encodeURIComponent(x) + '&other=' + encodeURIComponent('AI') + '&r=' + encodeURIComponent(referrer);
        fetch(makehook)
            .then(response => response.json())
            .then(data => {
              contactId = data.contactID;
            });

        // Pipedream Signup Idea 
        webhook = 'https://eo600fsvd2gwh8n.m.pipedream.net/?x=' + encodeURIComponent(x) + '&r=' + encodeURIComponent(referrer);
        fetch(webhook)
            .then(response => response.json())
            .then(data => {
              clearInterval(loadingInterval);
              let formattedText = data.result.replace(/\n/g, '<br>');
              formattedText = replaceText(formattedText);
              $("#output0-5").html(formattedText);
              $('#progressBar0-5').hide();
              // Load more tips div
              setTimeout(() => {
                $("#messageMore").css("display", "flex");
                setTimeout(() => {
                  $("#helpMessageMore").text('Select your #1 priority for '+ companyName +':');
                  $("#optionsDiv").css("display", "flex");
                  $("#typingAnimation2").hide();
                  $("#typingDiv2").css("width", "100%");
                }, 2000); 
              }, 3000); 
            })
            .catch(error => {
              clearInterval(loadingInterval);
              $("#output0-5").html(errorMessage);
            });
      }

      // Subscribing to newsletter -> message1
      $('#subscribe').click(function() {
        subscribeToNewsletter();
      });
      $('#email').keydown(function(event) {
        if (event.key === 'Enter' || event.keyCode === 13) {
          subscribeToNewsletter();
        }
      });

      // Checkbox buttons
      var selected;
      function handlePriorityClick(selectedID, array) {
        if (!selected) {
            selected = array;
            $("#message1").css("display", "flex");
            $("#messageMore").css("opacity", 0.75);
            $("#message0-5").css("opacity", 0.75);
            $('.button.check').css('border-color', '#E9F0EC');
            $(selectedID).css('background-color', '#E9F0EC');

            startLoadingBar('#progressBar1','#filler1');
            loadingInterval = startLoadingAnimation("output1", loadingTexts2);
            
            // Pipedream Chosen Previews
            webhook = 'https://eo9ypifoenuozi1.m.pipedream.net/?x=' + encodeURIComponent(x) + '&topic=' + encodeURIComponent(selected[2]) + '&contact=' + encodeURIComponent(contactId);
            fetch(webhook)
            .then(response => response.json())
            .then(data => {
              clearInterval(loadingInterval);
              $('#loadingMoreDiv').hide();
              $('#30ideaIntro').text('I\'ve got 30 ideas that will get ' + companyName + ' ' + selected[1] + ':');
              $('#getMoreDescription').text('Get all 30 ideas (+ the steps to implement each idea). For just $99.');
              $('#getmore').text('Get your roadmap to ' + selected[1] + ' right now for $99');
              let formattedText = data.result.replace(/\n/g, '<br>');
              $("#finalIdeas").html(formattedText);
              $("#finalIdeasDiv").css("display", "flex");
            })
            .catch(error => {
              clearInterval(loadingInterval);
              $("#output1").html(errorMessage);
            });

            // Prep share link
            const referId = contactId.split(/rec/)[1];
            const referLink = 'conversionexamples.com/ai?r='+referId;
            const randomShareText = referralTexts[Math.floor(Math.random() * referralTexts.length)].replace(/\[URL\]/g, referLink)
            $('#referMsg').val(randomShareText);

            // Prep Stripe link
            var webhook = 'https://eolmnwc1sqa2h6o.m.pipedream.net/?url=' + encodeURIComponent(x) + '&priority=' + encodeURIComponent(selected[2]);
            fetch(webhook)
                .then(response => response.json())
                .then(data => {
                let url = data.result;
                $("#getmore").attr("href", url); // set #getmore link to returned value
                })
                .catch(error => {
                clearInterval(loadingInterval);
                $(outputElement).text('Error: ' + error.toString());
                $(outputElement).css('color', '#DE3021');
                console.log(error);
                });

        }
      }
      $('#growth').click(function() {
        handlePriorityClick('#growth', ['Growth', 'more users', 'Growth']);
      });
      $('#monetisation').click(function() {
        handlePriorityClick('#monetisation', ['Monetisation', 'more money', 'Purchasing']);
      });
      $('#habits').click(function() {
        handlePriorityClick('#habits', ['Habit-Building', 'more user engagement', 'Habits']);
      });

      $('#continueReading3').click(function() {
        $("#finalIdeasDiv2").css("display", "flex");
        $('#continueReading3').hide();
      });
      $('#continueReading4').click(function() {
        $("#finalIdeasDiv3").css("display", "flex");
        $('#continueReading4').hide();
      });


      

      // SHARING

      function copyToClipboard(text_to_copy) {
        if (!navigator.clipboard) {
            // fallback for older browsers
            const el = document.createElement('textarea');
            el.value = text_to_copy;
            document.body.appendChild(el);
            el.select();
            try {
                document.execCommand('copy');
                console.log('Copied successfully!');
            } catch (err) {
                alert('Hit a snag copying that text. You\'ll have to copy it manually.');
            }
            document.body.removeChild(el);
        } else {
            navigator.clipboard.writeText(text_to_copy).then(
                function() {
                    console.log("Copied successfully!"); // success 
                }
            ).catch(
                function(err) {
                    alert('Hit a snag copying that text. You\'ll have to copy it manually.'); // error
                }
            );
        }
    }
      
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
    
