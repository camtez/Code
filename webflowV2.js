
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
    
      // STEP 1: Entering domain -> message0
      $('#enter').click(function() {
        console.log('clicked');
        i = 0;
        x = $("#domain").val().trim();
        console.log(x);
        $("#message0").css("display", "flex");
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
        var loadingInterval = startLoadingAnimation("output0",loadingTexts0);
    
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
              $("#output0").html(formattedText);
              $("#progressBar0").hide();
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
                    $("#output0-5").html(formattedText);
                    $("#message0-5").css("display", "flex");
                    $("typingDiv").css("width", "100%");
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
              $("#output0").text(errorMessage);
              $("#output0").css('color', '#DE3021');
              $("#enter").text("Try Again");
            });

          });


      // STEP 2: Subscribing

      // Showing subscribe box
      $('#continueReading2').click(function() {
        $("#continueReading2").hide();
        $("#output0-5").hide();
        $("#divSubscribe").show();

      });

        
      // Subscribing to newsletter -> message1
      $('#subscribe').click(function() {
        i = 1;
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
            var loadingInterval = startLoadingAnimation("output0-5", loadingTexts1); // Loading text starts after 1.5 seconds
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
              console.log()
            .then(data => {
              clearInterval(loadingInterval);
              let formattedText = data.result;
              $("#output0-5").html(formattedText);
              $('#progressBar0-5').hide();
            })
            .catch(error => {
              clearInterval(loadingInterval);
              $("#output0-5").html(errorMessage);
            });

        // Load more tips div
        setTimeout(() => {
            $("#helpMessageMore").text('Select your #1 priority for '+ companyName +':');
            $("#messageMore").css("display", "flex");
        }, 3000); 

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
            var loadingInterval = startLoadingAnimation("output1", loadingTexts2);
            
            // Pipedream Chosen Previews
            webhook = 'https://eo9ypifoenuozi1.m.pipedream.net/?x=' + encodeURIComponent(x) + '&topic=' + encodeURIComponent(selected[2]) + '&contact=' + encodeURIComponent(contactId);
            fetch(webhook)
            .then(response => response.json())
            .then(data => {
              clearInterval(loadingInterval);
              let formattedText = data.result;
              $("#output0-5").html(formattedText);
              $("#continueReading2").show();
              $("#message0-5").css("display", "flex");
            })
            .catch(error => {
              clearInterval(loadingInterval);
              $("#output0-5").hide();
              $("#continueReading2").text("Click here to get another tip");
              $("#message0-5").css("display", "flex");
            });

            // Prep share link - remove 'rec from rId'
            // ******

            $('#getmore').text('Get 30 ' + selected[0] + ' Ideas for $99');

            // Prep Stripe link
            var webhook = 'https://eolmnwc1sqa2h6o.m.pipedream.net/?url=' + encodeURIComponent(x);
            fetch(webhook)
                .then(response => response.json())
                .then(data => {
                console.log(data.result);
                let url = data.result;
                $("#getmore").attr("href", url); // set #getmore link to returned value
                })
                .catch(error => {
                // On error, stop the loading texts and show an error message
                clearInterval(loadingInterval);
                $(outputElement).text('Error: ' + error.toString());
                $(outputElement).css('color', '#DE3021');
                console.log('error');
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
    