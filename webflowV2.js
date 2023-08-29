
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
      var referrer = params.get('r'); // "value2"
      if (referrer) {
        referrer = 'rec' + referrer;
      }
      var webhook;
      console.log(domain);
      console.log(referrer);
      
      // API calls
      
      let i = 0;
      var loadingIndex = 0;
      var x = "";
      const errorMessage = "Something went wrong, and we\'re on it. Try again and let\'s keep moving.";
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
        console.log(randomExpression);
        return randomExpression;
      }

      function getRandomExampleText() {
        var randomExpression = exampleTexts[Math.floor(Math.random() * exampleTexts.length)];
        while (randomExpression === lastExampleText) {
            randomExpression = exampleTexts[Math.floor(Math.random() * exampleTexts.length)];
        }
        lastExampleText = randomExpression;
        console.log(randomExpression);
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
      $('#enter').click(function() {
        console.log('clicked');
        i = 0;
        //x = DOMPurify.sanitize($("#domain").val().trim());
        x = $("#domain").val().trim();
        
        console.log(x);
        $("#message0").css("display", "flex");
        $("#divAnimate").css("max-height", "3000px");
        $("#divAnimate").css("opacity", 1);
        startLoadingBar('#progressBar0','#filler0');

        // Style input bar
        $("#enter").text("Loading...");
        $("#enter").css("background-color", "#E9F0EC");
        $("#domain").css("border-color", "#E9F0EC");

        // Check if x is not empty
        if (x === '') {
            $("#output0").text('Please enter a domain');
            $("#output0").css('color', '#DE3021');
            console.log('x is empty')
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
        webhook = 'https://eouv4h921hkuwbt.m.pipedream.net/?x=' + encodeURIComponent(x) + '&i=' + encodeURIComponent(i);
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
              $("#enter").hide();
              
              // Show preview message
              setTimeout(() => {
                $("#message0-5").css("display", "flex");
            
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
                    $("#continueReading2").show();
                    })
                    .catch(error => {
                    $("#typingAnimation").hide();
                    $("#output0-5").html("There's another idea where that came from.");
                    $("#continueReading2").text("...click here to get another idea");
                    $("#message0-5").css("display", "flex");
                    $("#output0-5").show();
                    $("#continueReading2").show();
                    });
              }, 6000);  // 6 second delay
            })

            .catch(error => {
              clearInterval(loadingInterval); // Stop loading message
              console.log(error);
              $("#output0").text(errorMessage);
              $("#output0").css('color', '#DE3021');
              $("#enter").text("Try Again");
            });

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

      // Subscribing to newsletter -> message1
      $('#subscribe').click(function() {
        i = 1;
        //var email = DOMPurify.sanitize($("#email").val().trim());
        var email = $("#email").val().trim();
        
        // Check if email is ok
        if (email === '' || !email.includes('@') || !email.includes('.')) {
            $("#newsletterText").text('Please enter a valid email address to unlock your idea.');
            $("#newsletterText").css('color', '#DE3021');
            return;
        }

        // If successful
        $('#divSubscribe').hide();
        $("#newsletterText").css('color', 'black');
        $("#output0-5").text('Successfully signed up to the newsletter!');
        $("#output0-5").show();

        startLoadingBar('#progressBar0-5','#filler0-5');

        setTimeout(() => {
            loadingInterval = startLoadingAnimation("output0-5", loadingTexts1); // Loading text starts after 1.5 seconds
        }, 1500);

        // Make automation to signup email
        var makehook = 'https://hook.us1.make.com/pl17c96gsqf34sgimjjj1e7w6vqpmjnl/?email=' + encodeURIComponent(email) + '&x=' + encodeURIComponent(x) + '&other=' + encodeURIComponent('AI');
        console.log(makehook);  
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
              console.log(formattedText);
              const steveText = replaceText(formattedText);
              console.log(steveText);
              $("#output0-5").html(formattedText);
              $('#progressBar0-5').hide();
              // Load more tips div
              setTimeout(() => {
                $("#helpMessageMore").text('Select your #1 priority for '+ companyName +':');
                $("#messageMore").css("display", "flex");
              }, 5000); 
            })
            .catch(error => {
              clearInterval(loadingInterval);
              $("#output0-5").html(errorMessage);
            });

      });

      // Checkbox buttons
      var selected;
      function handlePriorityClick(selectedID, array) {
        if (!selected) {
            selected = array;
            $("#message1").css("display", "flex");
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
              console.log('more ideas response received')
              $('#loadingMoreDiv').hide();
              $('#30ideaIntro').text('I\'ve got 30 ideas to get ' + companyName + ' ' + selected[1] + ':');
              $('#getMoreDescription').text('Get 30 ' + selected[0] + ' Ideas (including these 3) right now for $99.');
              $('#getmore').text('Get 30 ' + selected[0] + ' Ideas for $99.');
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
            const randomShareText = referralTexts[Math.floor(Math.random() * referralTexts.length)].replace(/[URL]/g, referLink)
            $('#referMsg').val(randomShareText);

            $('#getmore').text('Get 30 ' + selected[0] + ' Ideas for $99');

            console.log('share setup complete');

            // Prep Stripe link
            var webhook = 'https://eolmnwc1sqa2h6o.m.pipedream.net/?url=' + encodeURIComponent(x);
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
                console.log('error');
                });

            console.log('stripe link received');

        }
      }
      $('#growth').click(function() {
        handlePriorityClick('#growth', ['Growth', 'more users', 'Growth']);
      });
      $('#monetisation').click(function() {
        handlePriorityClick('#monetisation', ['Monetisation', 'more money', 'Purchasing']);
      });
      $('#habits').click(function() {
        handlePriorityClick('#habits', ['Habit', 'more user engagement', 'Habits']);
      });


      // SHARING

      function copyToClipboard(text) {
        var sampleTextarea = document.createElement("textarea");
        document.body.appendChild(sampleTextarea);
        sampleTextarea.value = text; //save main text in it
        sampleTextarea.select(); //select textarea contenrs
        document.execCommand("copy");
        document.body.removeChild(sampleTextarea);
      }
      
      // Sharing -> Message2
      function commonShare() {
        copyToClipboard("Check this out: conversionexamples.com/ai") // Save to clipboard
      }

      $('#share1').click(commonShare())
      $('#share2').click(function() { // Linkedin
        commonShare();
        const linkedinURL = 'https://www.linkedin.com/feed/?shareActive&mini=true&text=' + encodeURIComponent('Insanely great, as Steve would say. Check this out if you make products: conversionexamples.com/ai');
        window.open(linkedinURL, '_blank');
      });
      $('#share3').click(function() { // Twitter
        commonShare();
        const twitterURL = 'http://twitter.com/share?url=' + encodeURIComponent('Can AI think different? Try for yourself: conversionexamples.com/ai');
        window.open(twitterURL, '_blank');
      });
      $('#share4').click(commonShare()) // Copy to clipboard

    });
    